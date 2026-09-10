#!/usr/bin/env python3
import sys
import os
from pathlib import Path
from fastapi.testclient import TestClient

# Force UTF-8 output on Windows
if sys.platform == "win32":
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure backend/ can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.main import app

def test_api():
    client = TestClient(app)

    print("Testing /health ...")
    resp = client.get("/health")
    print(resp.status_code, resp.json())
    assert resp.status_code == 200

    print("\nTesting /heatmap/pune ...")
    resp = client.get("/heatmap/pune")
    print("Status:", resp.status_code)
    assert resp.status_code == 200
    data = resp.json()
    print("Type:", data["type"])
    print("Number of features:", len(data["features"]))

    print("\nTesting /simulate for pune ...")
    # Grab the first 3 zone IDs from the heatmap response
    zone_ids = [feat["properties"]["zone_id"] for feat in data["features"][:3]]
    
    payload = {
        "city": "pune",
        "zone_ids": zone_ids,
        "delta_ndvi": 0.1,  # Add 10% vegetation
        "delta_ndbi": -0.1  # Reduce built-up by 10% (e.g., cool roofs)
    }

    resp = client.post("/simulate", json=payload)
    print("Status:", resp.status_code)
    assert resp.status_code == 200
    sim_data = resp.json()
    
    print(f"Simulated City: {sim_data['city']}")
    for res in sim_data["results"]:
        print(f"  Zone {res['zone_id']}:")
        print(f"    Original LST: {res['original_lst']:.2f}°C")
        print(f"    New LST:      {res['new_lst']:.2f}°C")
        print(f"    Change:       {res['lst_change']:+.2f}°C")

if __name__ == "__main__":
    test_api()
