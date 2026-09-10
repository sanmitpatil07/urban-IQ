import json
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import geopandas as gpd
import pandas as pd

# Add src/ to path so we can import urban_heat modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from urban_heat.utils import processed_dir, log
from urban_heat.model import UrbanHeatModel
from backend.models import SimulationRequest, SimulationResponse, SimulationResult

app = FastAPI(
    title="Urban Heat DSS API",
    description="Backend API for the Urban Heat Decision Support System.",
    version="1.0.0",
)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache for data and models
_CACHE = {
    "geojsons": {},
    "models": {}
}

def get_city_data(city: str) -> tuple[gpd.GeoDataFrame, dict, UrbanHeatModel]:
    """Load and cache city GeoJSON and model."""
    if city in _CACHE["geojsons"]:
        return _CACHE["geojsons"][city]["gdf"], _CACHE["geojsons"][city]["raw"], _CACHE["models"][city]

    # Load GeoJSON
    geojson_path = processed_dir(city) / f"{city}_zones.geojson"
    if not geojson_path.exists():
        raise HTTPException(status_code=404, detail=f"Data for city '{city}' not found.")
    
    log.info(f"Loading GeoJSON for {city} into memory...")
    gdf = gpd.read_file(geojson_path)
    
    with open(geojson_path, "r", encoding="utf-8") as f:
        raw_geojson = json.load(f)

    # Load Model
    model_path = processed_dir(city) / "model" / f"{city}_rf_model.joblib"
    if not model_path.exists():
        raise HTTPException(status_code=404, detail=f"Model for city '{city}' not found. Run training first.")
    
    log.info(f"Loading ML model for {city} into memory...")
    model = UrbanHeatModel(model_path)

    # Cache
    _CACHE["geojsons"][city] = {"gdf": gdf, "raw": raw_geojson}
    _CACHE["models"][city] = model

    return gdf, raw_geojson, model


@app.get("/health")
def health_check():
    return {"status": "ok"}


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
