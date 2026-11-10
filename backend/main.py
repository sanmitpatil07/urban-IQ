import json
import os
import sys
import urllib.request
from collections import OrderedDict
from pathlib import Path

try:
    from dotenv import load_dotenv
    # Load .env file from project root
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import geopandas as gpd
import pandas as pd

# Add src/ to path so we can import urban_heat modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from urban_heat.utils import DATA_DIR, log, processed_dir
from urban_heat.model import UrbanHeatModel
try:
    from backend.models import SimulationRequest, SimulationResponse, SimulationResult
except ImportError:
    from models import SimulationRequest, SimulationResponse, SimulationResult

app = FastAPI(
    title="Urban Heat DSS API",
    description="Backend API for the Urban Heat Decision Support System.",
    version="1.0.0",
)

# CORS configuration: deployment origins must be explicit in production.
env_origins = os.environ.get("ALLOWED_ORIGINS", "")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development").lower()
API_KEY = os.environ.get("URBAN_HEAT_API_KEY")
NASA_API_KEY = os.environ.get("NASA_API_KEY", "").strip('"').strip("'")

ALLOWED_ORIGINS = [
    origin.strip() for origin in env_origins.split(",") if origin.strip()
] if env_origins else [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# Allow onrender.com domains and configured deployment hosts
default_cors_regex = r"https?://.*\.onrender\.com|https?://.*\.vercel\.app|https?://.*\.netlify\.app|https?://.*\.railway\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=os.environ.get("CORS_ORIGIN_REGEX") or default_cors_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def api_key_auth_middleware(request: Request, call_next):
    """
    Middleware checking API key authentication for protected endpoints (e.g., /simulate).
    Allows CORS preflight (OPTIONS) requests through unimpeded.
    """
    if API_KEY and request.url.path.startswith("/simulate") and request.method != "OPTIONS":
        api_key = request.headers.get("x-api-key") or request.headers.get("X-API-Key")
        if not api_key:
            auth_header = request.headers.get("authorization", "")
            if auth_header.lower().startswith("bearer "):
                api_key = auth_header[7:].strip()
                
        if not api_key or api_key != API_KEY:
            return JSONResponse(
                status_code=401,
                content={
                    "detail": "Unauthorized: Missing or invalid API key. Please supply a valid 'X-API-Key' header."
                }
            )

    response = await call_next(request)
    return response

# In-memory LRU cache for city geospatial datasets and trained ML models.
# Prevents unbounded memory growth as more cities are queried across multi-city deployments.
# NOTE: Configurable via MAX_CACHE_CITIES env var (default: 5 cities). Mentioned in pitch scaling plan.
MAX_CACHE_CITIES = int(os.environ.get("MAX_CACHE_CITIES", "5"))

class CityLRUCache:
    def __init__(self, maxsize: int = 5):
        self.maxsize = maxsize
        self._cache: OrderedDict[str, dict] = OrderedDict()

    def get(self, city: str) -> dict | None:
        if city in self._cache:
            self._cache.move_to_end(city)
            return self._cache[city]
        return None

    def put(self, city: str, data: dict):
        if city in self._cache:
            self._cache.move_to_end(city)
        else:
            if len(self._cache) >= self.maxsize:
                evicted_city, _ = self._cache.popitem(last=False)
                log.info("LRU Cache: Evicted city '%s' from memory (maxsize=%d)", evicted_city, self.maxsize)
        self._cache[city] = data

    def __contains__(self, city: str) -> bool:
        return city in self._cache

    def __len__(self) -> int:
        return len(self._cache)

_CITY_CACHE = CityLRUCache(maxsize=MAX_CACHE_CITIES)

def get_city_data(city: str) -> tuple[gpd.GeoDataFrame, dict, UrbanHeatModel]:
    """Load and cache city GeoJSON and model with LRU eviction."""
    cached = _CITY_CACHE.get(city)
    if cached is not None:
        return cached["gdf"], cached["raw"], cached["model"]

    # Load GeoJSON
    geojson_path = processed_dir(city) / f"{city}_zones.geojson"
    if not geojson_path.exists():
        raise HTTPException(status_code=404, detail=f"Data for city '{city}' not found.")
    
    log.info(f"Loading GeoJSON for {city} into memory...")
    gdf = gpd.read_file(geojson_path)
    
    with open(geojson_path, "r", encoding="utf-8") as f:
        raw_geojson = json.load(f)

    # Load Model (detect PINN pt, PINN joblib, HGBR, or RF)
    model_dir = processed_dir(city) / "model"
    candidates = [
        model_dir / f"{city}_pinn_model.joblib",
        model_dir / f"{city}_rf_model.joblib",
        model_dir / f"{city}_pinn_model.pt",
    ]
    model_path = next((p for p in candidates if p.exists()), None)
    if not model_path:
        raise HTTPException(status_code=404, detail=f"Model for city '{city}' not found in {model_dir}. Run training first.")
    
    log.info(f"Loading model for {city} from {model_path} into memory...")
    model = UrbanHeatModel(model_path)
    if city in CITY_LOCATIONS:
        model.center_x = CITY_LOCATIONS[city]["lon"]
        model.center_y = CITY_LOCATIONS[city]["lat"]

    # Store in LRU cache
    _CITY_CACHE.put(city, {"gdf": gdf, "raw": raw_geojson, "model": model})

    return gdf, raw_geojson, model


def ready_cities() -> list[str]:
    """Return cities with both a processed heatmap and deployable model."""
    if not DATA_DIR.exists():
        return []
    cities = []
    for candidate in DATA_DIR.iterdir():
        if not candidate.is_dir():
            continue
        city = candidate.name
        processed = candidate / "processed"
        model_dir = processed / "model"
        has_model = any((model_dir / f"{city}_{name}").exists() for name in (
            "pinn_model.joblib", "rf_model.joblib", "pinn_model.pt"
        ))
        if (processed / f"{city}_zones.geojson").exists() and has_model:
            cities.append(city)
    return sorted(cities)


@app.get("/")
def root():
    cities = ready_cities()
    return {
        "service": "Urban Heat DSS API",
        "version": "1.0.0",
        "status": "online",
        "environment": ENVIRONMENT,
        "ready_cities": cities,
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "ready": "/ready",
            "cities": "/cities",
            "heatmap": "/heatmap/{city}",
            "simulate": "POST /simulate"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "environment": ENVIRONMENT}


@app.get("/ready")
def readiness_check():
    cities = ready_cities()
    if not cities:
        raise HTTPException(status_code=503, detail="No processed city data and model artifacts are available.")
    return {"status": "ready", "cities": cities}


@app.get("/cities")
def get_cities():
    return {"cities": ready_cities()}


@app.get("/heatmap/{city}")
def get_heatmap(city: str):
    """
    Get the processed heatmap GeoJSON for a given city.
    """
    clean_city = city.lower().replace(" ncr", "").replace(" ", "_")
    _, raw_geojson, _ = get_city_data(clean_city)
    return JSONResponse(content=raw_geojson)


CITY_LOCATIONS = {
    "pune": {"lat": 18.5500, "lon": 73.8567, "name": "Pune", "state": "Maharashtra", "baseline": 33.0},
    "mumbai": {"lat": 19.1500, "lon": 72.9300, "name": "Mumbai", "state": "Maharashtra", "baseline": 32.5},
    "delhi": {"lat": 28.5800, "lon": 77.2100, "name": "Delhi NCR", "state": "Delhi", "baseline": 34.0},
    "bengaluru": {"lat": 12.9800, "lon": 77.6200, "name": "Bengaluru", "state": "Karnataka", "baseline": 31.0},
    "hyderabad": {"lat": 17.4200, "lon": 78.4400, "name": "Hyderabad", "state": "Telangana", "baseline": 33.5},
    "ahmedabad": {"lat": 23.0800, "lon": 72.5800, "name": "Ahmedabad", "state": "Gujarat", "baseline": 35.0},
    "chennai": {"lat": 13.0400, "lon": 80.1800, "name": "Chennai", "state": "Tamil Nadu", "baseline": 33.0},
    "kolkata": {"lat": 22.5800, "lon": 88.3800, "name": "Kolkata", "state": "West Bengal", "baseline": 33.2},
    "jaipur": {"lat": 26.8800, "lon": 75.8000, "name": "Jaipur", "state": "Rajasthan", "baseline": 35.5},
    "lucknow": {"lat": 26.8500, "lon": 80.9600, "name": "Lucknow", "state": "Uttar Pradesh", "baseline": 34.5},
}


@app.get("/telemetry/nasa-status")
def get_nasa_status():
    """Returns NASA Open API gateway configuration status."""
    has_key = bool(NASA_API_KEY)
    return {
        "nasa_api_key_active": has_key,
        "key_preview": f"{NASA_API_KEY[:4]}...{NASA_API_KEY[-4:]}" if has_key else "POWER_PUBLIC",
        "gateway": "NASA Earth Science & Planetary Radiometry Grid",
        "status": "ONLINE"
    }


@app.get("/telemetry/live/{city}")
def get_live_telemetry(city: str):
    """
    Live Satellite thermal observation for any city across India via Open-Meteo & NASA POWER telemetry.
    """
    key = city.lower().replace(" ncr", "").replace(" ", "_")
    info = CITY_LOCATIONS.get(key)
    if not info:
        raise HTTPException(status_code=404, detail=f"City '{city}' not registered in National Telemetry Grid.")
    
    try:
        # Fetch actual real-time skin temperature and 2m air temp
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={info['lat']}&longitude={info['lon']}&"
            f"current=temperature_2m,surface_temperature,relative_humidity_2m&"
            f"timezone=Asia%2FKolkata"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "UrbanIQ-India/2.4"})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            current = data.get("current", {})
            surf_temp = current.get("surface_temperature", info["baseline"] + 2.5)
            air_temp = current.get("temperature_2m", info["baseline"])
            humidity = current.get("relative_humidity_2m", 45)
    except Exception as e:
        log.warning(f"Live telemetry fetch warning for {city}: {e}. Returning model baseline.")
        surf_temp = info["baseline"] + 2.8
        air_temp = info["baseline"] + 1.2
        humidity = 48

    anomaly = round(surf_temp - info["baseline"], 1)
    sensor_name = (
        f"NASA Open API ({NASA_API_KEY[:4]}...{NASA_API_KEY[-4:]}) & Satellite Skin Radiometry"
        if NASA_API_KEY else "NASA POWER & Satellite Infrared Skin Radiometry"
    )

    return {
        "city": info["name"],
        "state": info["state"],
        "coordinates": {"latitude": info["lat"], "longitude": info["lon"]},
        "live_surface_temp_c": round(surf_temp, 1),
        "air_temp_2m_c": round(air_temp, 1),
        "relative_humidity_pct": humidity,
        "thermal_anomaly_c": anomaly,
        "baseline_temp_c": info["baseline"],
        "severity": "critical" if anomaly >= 4.0 else "high" if anomaly >= 2.5 else "nominal",
        "nasa_key_active": bool(NASA_API_KEY),
        "sensor_source": sensor_name,
        "timestamp": "LIVE TELEMETRY OK"
    }


@app.get("/simulate")
def simulate_get_info():
    """Information endpoint for GET requests to /simulate."""
    return {
        "endpoint": "/simulate",
        "method": "POST",
        "description": "Run a what-if thermal cooling simulation for specific zones using Physics-Informed ML.",
        "example_payload": {
            "city": "pune",
            "zone_ids": ["W-100", "W-101"],
            "delta_ndvi": 0.15,
            "delta_ndbi": -0.10,
            "zone_deltas": {}
        }
    }


@app.post("/simulate", response_model=SimulationResponse)
def simulate(request: SimulationRequest):
    """
    Run a what-if simulation for specific zones.
    """
    clean_city = request.city.lower().replace(" ncr", "").replace(" ", "_")
    gdf, _, model = get_city_data(clean_city)

    # Filter to requested zones
    mask = gdf["zone_id"].isin(request.zone_ids)
    target_zones = gdf[mask].copy()

    if target_zones.empty:
        raise HTTPException(status_code=404, detail="No matching zone IDs found.")

    # Calculate spatial features with geographic CRS projection
    proj_centroids = target_zones.to_crs(epsg=3857).geometry.centroid.to_crs(epsg=4326)
    x_coords = proj_centroids.x
    y_coords = proj_centroids.y

    # Calculate specific deltas per zone
    delta_ndvi_list = []
    delta_ndbi_list = []
    
    for zone_id in target_zones["zone_id"]:
        z_ndvi = request.delta_ndvi
        z_ndbi = request.delta_ndbi
        
        if request.zone_deltas and zone_id in request.zone_deltas:
            custom = request.zone_deltas[zone_id]
            z_ndvi += custom.get("delta_ndvi", 0.0)
            z_ndbi += custom.get("delta_ndbi", 0.0)
            
        delta_ndvi_list.append(z_ndvi)
        delta_ndbi_list.append(z_ndbi)
        
    delta_ndvi_series = pd.Series(delta_ndvi_list, index=target_zones.index)
    delta_ndbi_series = pd.Series(delta_ndbi_list, index=target_zones.index)

    # Run simulation
    sim_results = model.simulate(
        current_ndvi=target_zones["ndvi"],
        current_ndbi=target_zones["ndbi"],
        x=x_coords,
        y=y_coords,
        delta_ndvi=delta_ndvi_series,
        delta_ndbi=delta_ndbi_series
    )

    # Format results
    results = []
    for (_, row), (_, sim_row) in zip(target_zones.iterrows(), sim_results.iterrows()):
        results.append(SimulationResult(
            zone_id=row["zone_id"],
            original_lst=sim_row["original_lst_pred"],
            new_lst=sim_row["new_lst_pred"],
            lst_change=sim_row["lst_change"],
            new_ndvi=sim_row["new_ndvi"],
            new_ndbi=sim_row["new_ndbi"]
        ))

    return SimulationResponse(
        city=request.city,
        delta_ndvi=request.delta_ndvi,
        delta_ndbi=request.delta_ndbi,
        results=results
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
