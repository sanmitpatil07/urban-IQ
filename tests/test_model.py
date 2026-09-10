import numpy as np
import pytest
from sklearn.metrics import r2_score
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import tempfile
from pathlib import Path

from urban_heat.model import UrbanHeatModel


def test_monotonic_hgbr_physics_consistency():
    """Verify that HistGradientBoosting with monotonic constraints exhibits 0% monotonicity violations."""
    np.random.seed(42)
    n_samples = 200
    
    ndvi = np.random.uniform(-0.2, 0.8, n_samples)
    ndbi = np.random.uniform(-0.5, 0.5, n_samples)
    x = np.random.uniform(73.7, 74.0, n_samples)
    y = np.random.uniform(18.4, 18.7, n_samples)
    
    lst = 35.0 - 10.0 * ndvi + 8.0 * ndbi + np.random.normal(0, 0.5, n_samples)
    
    gdf = gpd.GeoDataFrame({
        "ndvi": ndvi,
        "ndbi": ndbi,
        "lst": lst,
        "geometry": [Point(xi, yi) for xi, yi in zip(x, y)]
    })
    
    with tempfile.TemporaryDirectory() as tmpdir:
        geojson_path = Path(tmpdir) / "test_zones.geojson"
        gdf.to_file(geojson_path, driver="GeoJSON")
        
        model = UrbanHeatModel(model_type="hgbr", physics_informed=True)
        metrics = model.train(geojson_path)
        
        assert metrics["ndvi_monotonicity_violation_pct"] == 0.0
        assert metrics["ndbi_monotonicity_violation_pct"] == 0.0
        assert metrics["physics_consistency_score_pct"] == 100.0


def test_simulation_physics_directionality():
    """Verify that increasing NDVI in simulation strictly produces non-positive temperature delta."""
    model = UrbanHeatModel(model_type="hgbr", physics_informed=True)
    
    X = np.array([
        [0.1, 0.2, 0.5],
        [0.5, -0.1, 1.2],
        [0.2, 0.4, 0.8],
        [0.7, -0.3, 2.1],
    ])
    y = np.array([36.0, 30.0, 38.0, 28.0])
    model.model.fit(X, y)
    
    res = model.simulate(
        current_ndvi=pd.Series([0.2, 0.3]),
        current_ndbi=pd.Series([0.1, 0.1]),
        dist_center_km=pd.Series([1.5, 2.0]),
        delta_ndvi=0.2,
        delta_ndbi=0.0
    )
    
    # Delta NDVI > 0 must lead to lst_change <= 0
    assert (res["lst_change"] <= 1e-5).all()


def test_simulate_clipping_to_valid_range():
    """Verify that UrbanHeatModel.simulate() strictly clips updated NDVI and NDBI within [-1.0, 1.0]."""
    model = UrbanHeatModel(model_type="hgbr", physics_informed=True)
    
    X = np.array([
        [0.1, 0.2, 0.5],
        [0.5, -0.1, 1.2],
        [0.2, 0.4, 0.8],
        [0.7, -0.3, 2.1],
    ])
    y = np.array([36.0, 30.0, 38.0, 28.0])
    model.model.fit(X, y)
    
    # Starting values with extreme delta perturbations
    current_ndvi = pd.Series([0.8, -0.7, 0.0])
    current_ndbi = pd.Series([0.6, -0.8, 0.1])
    dist_km = pd.Series([1.0, 2.0, 3.0])
    
    # Apply huge positive (+5.0) and negative (-5.0) deltas
    res_pos = model.simulate(
        current_ndvi=current_ndvi,
        current_ndbi=current_ndbi,
        dist_center_km=dist_km,
        delta_ndvi=5.0,
        delta_ndbi=5.0
    )
    
    assert (res_pos["new_ndvi"] <= 1.0).all()
    assert np.allclose(res_pos["new_ndvi"], 1.0)
    assert (res_pos["new_ndbi"] <= 1.0).all()
    assert np.allclose(res_pos["new_ndbi"], 1.0)
    
    res_neg = model.simulate(
        current_ndvi=current_ndvi,
        current_ndbi=current_ndbi,
        dist_center_km=dist_km,
        delta_ndvi=-5.0,
        delta_ndbi=-5.0
    )
    
    assert (res_neg["new_ndvi"] >= -1.0).all()
    assert np.allclose(res_neg["new_ndvi"], -1.0)
    assert (res_neg["new_ndbi"] >= -1.0).all()
    assert np.allclose(res_neg["new_ndbi"], -1.0)

