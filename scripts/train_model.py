#!/usr/bin/env python3
"""
CLI script to train the LST prediction model for a specific city.

Usage:
    python scripts/train_model.py --city pune
    python scripts/train_model.py --city pune --model-type pinn --lambda-phys 2.0 --epochs 300
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
@click.option(
    "--model-type",
    type=click.Choice(["hgbr", "rf", "pinn"]),
    default="hgbr",
    help="Model type: hgbr (HistGradientBoosting with monotonic constraints), rf (Random Forest), pinn (Physics-Informed Neural Network)",
)
@click.option(
    "--feature-mode",
    type=click.Choice(["relative_spatial", "pure_biophysical"]),
    default="relative_spatial",
    help="Feature engineering mode: relative_spatial (NDVI, NDBI, dist_center_km) or pure_biophysical (NDVI, NDBI)",
)
@click.option("--lambda-phys", type=float, default=1.0, help="Physics loss weight for PINN")
@click.option("--epochs", type=int, default=200, help="Max epochs for PINN training")
@click.option("--lr", type=float, default=1e-3, help="Learning rate for PINN")
@click.option("--batch-size", type=int, default=256, help="Batch size for PINN")
@click.option("--device", type=click.Choice(["cpu", "cuda"]), default="cpu", help="Device for PINN training")
def main(
    city: str,
    model_type: str,
    feature_mode: str,
    lambda_phys: float,
    epochs: int,
    lr: float,
    batch_size: int,
    device: str,
):
    """Train LST prediction model mapping NDVI+NDBI and relative spatial features to LST."""
    from rich.console import Console
    console = Console()

    console.rule(f"[bold blue]Model Training ({model_type.upper()} | {feature_mode.upper()}): {city.upper()}[/bold blue]")

    config = load_city_config(city)
    geojson_path = processed_dir(config.city_name) / f"{config.city_name}_zones.geojson"
    
    if not geojson_path.exists():
        log.error(f"Processed zones file not found: {geojson_path}. Run process pipeline first.")
        sys.exit(1)

    model_dir = processed_dir(config.city_name) / "model"
    model_dir.mkdir(exist_ok=True)
    
    if model_type == "pinn":
        model_path = model_dir / f"{config.city_name}_pinn_model"
    else:
        model_path = model_dir / f"{config.city_name}_rf_model.joblib"

    pinn_config = {}
    if model_type == "pinn":
        pinn_config = {
            "lambda_phys": lambda_phys,
            "epochs": epochs,
            "lr": lr,
            "batch_size": batch_size,
            "device": device,
            "hidden_dims": [64, 64, 32],
        }
        console.print(f"[bold cyan]Training PINN with physics loss (λ={lambda_phys})...[/bold cyan]")
    elif model_type == "hgbr":
        console.print(f"[bold cyan]Training HGBR with monotonic constraints ({feature_mode})...[/bold cyan]")
    else:
        console.print(f"[bold cyan]Training Random Forest ({feature_mode})...[/bold cyan]")

    model = UrbanHeatModel(model_type=model_type, feature_mode=feature_mode, pinn_config=pinn_config)
    metrics = model.train(geojson_path, output_path=model_path)

    console.print("\n[bold green]✓ Training Complete[/bold green]")
    console.print(f"  Architecture:         {metrics['model_type']}")
    console.print(f"  Feature Mode:         {metrics.get('feature_mode', feature_mode)}")
    console.print(f"  Features:             {', '.join(metrics.get('feature_names', []))}")
    console.print(f"  RMSE:                 {metrics['rmse']:.3f}°C")
    console.print(f"  R²:                   {metrics['r2']:.4f}")
    console.print(f"  Physics Consistency:  [bold green]{metrics['physics_consistency_score_pct']:.1f}%[/bold green]")
    console.print(f"  NDVI Violations:      {metrics['ndvi_monotonicity_violation_pct']:.2f}%")
    console.print(f"  NDBI Violations:      {metrics['ndbi_monotonicity_violation_pct']:.2f}%")
    console.print(f"  Feature Importances:")
    for feat_name, imp_val in metrics.get("feature_importances", {}).items():
        console.print(f"    - {feat_name}: {imp_val:.3f}")
    
    if model_type == "pinn" and "pinn_train_history" in metrics:
        hist = metrics["pinn_train_history"]
        console.print(f"  PINN History:")
        console.print(f"    - Final Train Loss: {hist['final_train_loss']:.4f}")
        console.print(f"    - Final Val Loss:   {hist['final_val_loss']:.4f}")
        console.print(f"    - Final Physics Loss: {hist['final_physics_loss']:.4f}")
        console.print(f"    - Epochs:           {hist['epochs_trained']}")

if __name__ == "__main__":
    main()
