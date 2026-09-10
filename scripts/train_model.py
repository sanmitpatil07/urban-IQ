#!/usr/bin/env python3
"""
CLI script to train the LST prediction model for a specific city.

Usage:
    python scripts/train_model.py --city pune
"""

import sys
from pathlib import Path
import os
import click

# Force UTF-8 output on Windows
if sys.platform == "win32":
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from urban_heat.config import load_city_config
from urban_heat.model import UrbanHeatModel
from urban_heat.utils import log, processed_dir


@click.command()
@click.option("--city", required=True, help="City name to train model for")
def main(city: str):
    """Train Random Forest model mapping NDVI+NDBI to LST."""
    from rich.console import Console
    console = Console()

    console.rule(f"[bold blue]Model Training: {city.upper()}[/bold blue]")

    config = load_city_config(city)
    geojson_path = processed_dir(config.city_name) / f"{config.city_name}_zones.geojson"
    
    if not geojson_path.exists():
        log.error(f"Processed zones file not found: {geojson_path}. Run process pipeline first.")
        sys.exit(1)

    model_dir = processed_dir(config.city_name) / "model"
    model_dir.mkdir(exist_ok=True)
    model_path = model_dir / f"{config.city_name}_rf_model.joblib"

    console.print("[bold]Training Random Forest Regressor...[/bold]")
    model = UrbanHeatModel()
    metrics = model.train(geojson_path, output_path=model_path)

    console.print("\n[bold green]✓ Training Complete[/bold green]")
    console.print(f"  RMSE: {metrics['rmse']:.2f}°C")
    console.print(f"  R²:   {metrics['r2']:.3f}")
    console.print(f"  Feature Importances:")
    console.print(f"    - NDVI: {metrics['feature_importances']['ndvi']:.3f}")
    console.print(f"    - NDBI: {metrics['feature_importances']['ndbi']:.3f}")

if __name__ == "__main__":
    main()
