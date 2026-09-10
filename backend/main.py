import json
import os
import sys
from collections import OrderedDict
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import geopandas as gpd
import pandas as pd

# Add src/ to path so we can import urban_heat modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from urban_heat.utils import DATA_DIR, log, processed_dir
from urban_heat.model import UrbanHeatModel
from backend.models import SimulationRequest, SimulationResponse, SimulationResult

app = FastAPI(
    title="Urban Heat DSS API",
    description="Backend API for the Urban Heat Decision Support System.",
    version="1.0.0",
)

# CORS configuration: deployment origins must be explicit in production.
env_origins = os.environ.get("ALLOWED_ORIGINS", "")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development").lower()
API_KEY = os.environ.get("URBAN_HEAT_API_KEY")
if ENVIRONMENT == "production" and not env_origins:
    raise RuntimeError("ALLOWED_ORIGINS must be set in production.")
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=os.environ.get("CORS_ORIGIN_REGEX") or (
        None if ENVIRONMENT == "production"
        else r"https?://.*\.vercel\.app|https?://.*\.netlify\.app|https?://.*\.onrender\.com|https?://.*\.railway\.app"
    ),
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
    _, raw_geojson, _ = get_city_data(city)
    return JSONResponse(content=raw_geojson)


@app.post("/simulate", response_model=SimulationResponse)
def simulate(request: SimulationRequest):
    """
    Run a what-if simulation for specific zones.
    """
    gdf, _, model = get_city_data(request.city)

    # Filter to requested zones
    mask = gdf["zone_id"].isin(request.zone_ids)
    target_zones = gdf[mask].copy()

    if target_zones.empty:
        raise HTTPException(status_code=404, detail="No matching zone IDs found.")

    # Calculate spatial features
    x_coords = target_zones.geometry.centroid.x
    y_coords = target_zones.geometry.centroid.y

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
    for (idx, row), (_, sim_row) in zip(target_zones.iterrows(), sim_results.iterrows()):
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
