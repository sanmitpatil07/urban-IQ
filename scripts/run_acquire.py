#!/usr/bin/env python3
"""
CLI entry point for Milestone 1 — Data Acquisition.

Usage:
    python scripts/run_acquire.py --city pune
    python scripts/run_acquire.py --city pune --skip-download   # Search only, don't download
"""

import os
import sys
from pathlib import Path

# Force UTF-8 output on Windows to avoid charmap encoding errors
if sys.platform == "win32":
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure src/ is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

import click

from urban_heat.config import load_city_config
from urban_heat.boundary import get_or_fetch_boundary
from urban_heat.acquire import (
    search_landsat,
    search_sentinel2,
    download_landsat_scene,
    download_sentinel2_scene,
    print_acquisition_summary,
)
from urban_heat.utils import log


@click.command()
@click.option("--city", required=True, help="City name (must match a YAML config file)")
@click.option("--skip-download", is_flag=True, help="Only search for scenes, don't download")
@click.option("--landsat-index", default=0, help="Index of Landsat scene to use (0 = best)")
@click.option("--sentinel2-index", default=0, help="Index of Sentinel-2 scene to use (0 = best)")
def main(city: str, skip_download: bool, landsat_index: int, sentinel2_index: int):
    """
    Acquire satellite data for a city.

    Steps:
    1. Load city config
    2. Fetch/load city boundary from OpenStreetMap
    3. Search STAC API for best Landsat and Sentinel-2 scenes
    4. Download and clip bands to city boundary
    """
    from rich.console import Console
    console = Console()

    console.rule(f"[bold blue]Urban Heat DSS — Data Acquisition: {city.upper()}[/bold blue]")

    # 1. Load config
    try:
        config = load_city_config(city)
    except FileNotFoundError as e:
        log.error(str(e))
        sys.exit(1)

    # 2. Fetch/load boundary
    console.print("\n[bold]Step 1: City Boundary[/bold]")
    try:
        boundary_gdf = get_or_fetch_boundary(config)
        area = boundary_gdf["area_km2"].iloc[0]
        console.print(f"  ✓ Boundary loaded: [green]{area:.1f} km²[/green]")
    except Exception as e:
        log.error("Failed to get boundary: %s", e)
        sys.exit(1)

    # 3. Search for scenes
    console.print("\n[bold]Step 2: Scene Search[/bold]")

    landsat_results = search_landsat(config)
    if not landsat_results:
        log.error("No Landsat scenes found. Try widening the date range or cloud cover limit.")
        sys.exit(1)
    console.print(f"  ✓ Found [green]{len(landsat_results)}[/green] Landsat scenes")
    for i, scene in enumerate(landsat_results[:5]):
        marker = " ←" if i == landsat_index else ""
        console.print(f"    [{i}] {scene.datetime[:10]} | cloud={scene.cloud_cover:.1f}% | {scene.platform}{marker}")

    # Use selected Landsat date as target for Sentinel-2 temporal alignment
    selected_landsat = landsat_results[min(landsat_index, len(landsat_results) - 1)]
    target_date = selected_landsat.datetime

    sentinel2_results = search_sentinel2(config, target_date=target_date)
    if not sentinel2_results:
        log.error("No Sentinel-2 scenes found. Try widening the date range or cloud cover limit.")
        sys.exit(1)
    console.print(f"  ✓ Found [green]{len(sentinel2_results)}[/green] Sentinel-2 scenes")
    for i, scene in enumerate(sentinel2_results[:5]):
        marker = " ←" if i == sentinel2_index else ""
        console.print(f"    [{i}] {scene.datetime[:10]} | cloud={scene.cloud_cover:.1f}% | {scene.platform}{marker}")

    selected_sentinel2 = sentinel2_results[min(sentinel2_index, len(sentinel2_results) - 1)]

    if skip_download:
        console.print("\n[yellow]--skip-download: stopping before download.[/yellow]")
        return

    # 4. Download and clip
    console.print("\n[bold]Step 3: Download & Clip[/bold]")

    landsat_paths = download_landsat_scene(selected_landsat, boundary_gdf, config)
    sentinel2_paths = download_sentinel2_scene(selected_sentinel2, boundary_gdf, config)

    # 5. Summary
    print_acquisition_summary(
        selected_landsat, selected_sentinel2,
        landsat_paths, sentinel2_paths,
    )

    console.print("[bold green]✓ Data acquisition complete![/bold green]\n")


if __name__ == "__main__":
    main()
