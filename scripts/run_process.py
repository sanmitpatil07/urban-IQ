#!/usr/bin/env python3
"""
CLI entry point for Milestone 2 — Raster Processing.

Usage:
    python scripts/run_process.py --city pune
"""

import sys
from pathlib import Path
import os

# Force UTF-8 output on Windows to avoid charmap encoding errors
if sys.platform == "win32":
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure src/ is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

import click

from urban_heat.config import load_city_config
from urban_heat.process import process_city
from urban_heat.utils import log


@click.command()
@click.option("--city", required=True, help="City name (must match a YAML config file)")
def main(city: str):
    """
    Process raw satellite data into aggregated zones.

    Steps:
    1. Load city config and acquisition metadata
    2. Compute LST, NDVI, NDBI from raw bands
    3. Aggregate values into grid zones
    4. Export as GeoJSON
    """
    from rich.console import Console
    console = Console()

    try:
        config = load_city_config(city)
        out_path = process_city(config)
        console.print(f"\n[bold green]✓ Processing complete![/bold green] Output saved to {out_path}")
    except Exception as e:
        log.error("Processing failed: %s", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
