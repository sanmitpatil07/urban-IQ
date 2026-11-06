import json
import subprocess
from pathlib import Path
import geopandas as gpd
import numpy as np

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from urban_heat.model import UrbanHeatModel
from urban_heat.utils import processed_dir

def setup_sample_pune():
    project_root = Path(__file__).resolve().parent.parent
    data_dir = processed_dir("pune")
    data_dir.mkdir(parents=True, exist_ok=True)
    model_dir = data_dir / "model"
    model_dir.mkdir(parents=True, exist_ok=True)

    geojson_path = data_dir / "pune_zones.geojson"
    model_path = model_dir / "pune_rf_model.joblib"

    # Get GeoJSON from frontend mockApi.js using node
    cmd = ["node", "-e", "import('./frontend/src/services/mockApi.js').then(m => console.log(JSON.stringify(m.getMockPuneGeoJSON())))"]
    res = subprocess.run(cmd, cwd=str(project_root), capture_output=True, text=True, check=True)
    geojson_data = json.loads(res.stdout)

    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump(geojson_data, f, indent=2)
    print(f"✓ Saved GeoJSON to {geojson_path}")

    # Train HGBR model
    print("Training UrbanHeatModel (HGBR with monotonic constraints)...")
    model = UrbanHeatModel(model_type="hgbr", feature_mode="relative_spatial", physics_informed=True)
    metrics = model.train(geojson_path, output_path=model_path)
    print(f"✓ Trained model saved to {model_path}")
    print(f"  RMSE: {metrics['rmse']:.3f}°C, R²: {metrics['r2']:.4f}")

if __name__ == "__main__":
    setup_sample_pune()

