"""
Satellite data acquisition via Microsoft Planetary Computer STAC API.

Searches for and downloads Landsat 8/9 (surface temperature) and Sentinel-2
(NDVI/NDBI bands) cloud-optimized GeoTIFFs, clipped to the city boundary.
"""

import json
from dataclasses import dataclass, field
from pathlib import Path

import geopandas as gpd
import numpy as np
import planetary_computer
import pystac_client
import rasterio
from rasterio.mask import mask as rasterio_mask
from rasterio.warp import calculate_default_transform, reproject, Resampling
from shapely.geometry import mapping

from urban_heat.config import CityConfig
from urban_heat.utils import log, raw_dir


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

STAC_API_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"

# Landsat Collection 2 Level 2 — includes pre-computed Surface Temperature
LANDSAT_COLLECTION = "landsat-c2-l2"
LANDSAT_ASSETS = {
    "lwir11": "surface_temperature",    # Pre-computed LST (Kelvin, scaled) — ST_B10
    "qa_pixel": "quality_assessment",   # Cloud / shadow mask
}

# Sentinel-2 Level 2A — surface reflectance
SENTINEL2_COLLECTION = "sentinel-2-l2a"
SENTINEL2_ASSETS = {
    "B04": "red_10m",       # Red (10m) — for NDVI
    "B08": "nir_10m",       # NIR (10m) — for NDVI
    "B11": "swir_20m",      # SWIR (20m) — for NDBI
    "SCL": "scene_class",   # Scene Classification Layer — cloud mask
}

# LST conversion: Temperature (K) = DN * scale + offset
LST_SCALE = 0.00341802
LST_OFFSET = 149.0


# ---------------------------------------------------------------------------
# Data classes for search results
# ---------------------------------------------------------------------------

@dataclass
class SceneResult:
    """Metadata for a selected satellite scene."""
    collection: str
    scene_id: str
    datetime: str
    cloud_cover: float
    platform: str
    asset_hrefs: dict[str, str] = field(default_factory=dict)

    def __repr__(self) -> str:
        return (
            f"SceneResult({self.collection}, {self.scene_id}, "
            f"date={self.datetime}, cloud={self.cloud_cover:.1f}%, "
            f"platform={self.platform})"
        )


# ---------------------------------------------------------------------------
# STAC search
# ---------------------------------------------------------------------------

def _get_stac_client() -> pystac_client.Client:
    """Open a signed STAC client for Microsoft Planetary Computer."""
    return pystac_client.Client.open(
        STAC_API_URL,
        modifier=planetary_computer.sign_inplace,
    )


def search_landsat(config: CityConfig, max_results: int = 10) -> list[SceneResult]:
    """
    Search for Landsat 8/9 scenes covering the city.

    Parameters
    ----------
    config : CityConfig
        City configuration with bbox, date range, cloud cover limits.
    max_results : int
        Maximum number of scenes to return, sorted by cloud cover ascending.

    Returns
    -------
    list[SceneResult]
        Matching scenes, best (lowest cloud) first.
    """
    log.info("Searching Landsat scenes for '%s'...", config.city_name)

    client = _get_stac_client()
    search = client.search(
        collections=[LANDSAT_COLLECTION],
        bbox=config.bbox,
        datetime=config.satellite.date_range,
        query={
            "eo:cloud_cover": {"lt": config.satellite.max_cloud_cover},
            "platform": {"in": config.satellite.landsat_platforms},
        },
        max_items=max_results * 3,  # Over-fetch then sort
    )

    items = search.item_collection()
    log.info("Found %d raw Landsat items", len(items))

    results = []
    for item in items:
        # Verify required assets exist
        if not all(asset in item.assets for asset in LANDSAT_ASSETS):
            continue

        cc = item.properties.get("eo:cloud_cover", 100)
        results.append(SceneResult(
            collection=LANDSAT_COLLECTION,
            scene_id=item.id,
            datetime=item.properties.get("datetime", "unknown"),
            cloud_cover=cc,
            platform=item.properties.get("platform", "unknown"),
            asset_hrefs={
                name: item.assets[name].href
                for name in LANDSAT_ASSETS
                if name in item.assets
            },
        ))

    # Sort by cloud cover (clearest first)
    results.sort(key=lambda r: r.cloud_cover)
    results = results[:max_results]

    if results:
        best = results[0]
        log.info(
            "Best Landsat scene: %s | %s | cloud=%.1f%% | %s",
            best.scene_id, best.datetime, best.cloud_cover, best.platform,
        )
    else:
        log.warning("No Landsat scenes found matching criteria!")

    return results


def search_sentinel2(
    config: CityConfig,
    target_date: str | None = None,
    max_results: int = 10,
) -> list[SceneResult]:
    """
    Search for Sentinel-2 L2A scenes covering the city.

    Parameters
    ----------
    config : CityConfig
        City configuration.
    target_date : str, optional
        If provided, sort results by proximity to this date (for temporal
        alignment with the selected Landsat scene).
    max_results : int
        Maximum results to return.

    Returns
    -------
    list[SceneResult]
        Matching scenes.
    """
    log.info("Searching Sentinel-2 scenes for '%s'...", config.city_name)

    client = _get_stac_client()
    search = client.search(
        collections=[SENTINEL2_COLLECTION],
        bbox=config.bbox,
        datetime=config.satellite.date_range,
        query={
            "eo:cloud_cover": {"lt": config.satellite.max_cloud_cover},
        },
        max_items=max_results * 5,
    )

    items = search.item_collection()
    log.info("Found %d raw Sentinel-2 items", len(items))

    results = []
    for item in items:
        if not all(asset in item.assets for asset in SENTINEL2_ASSETS):
            continue

        cc = item.properties.get("eo:cloud_cover", 100)
        results.append(SceneResult(
            collection=SENTINEL2_COLLECTION,
            scene_id=item.id,
            datetime=item.properties.get("datetime", "unknown"),
            cloud_cover=cc,
            platform=item.properties.get("platform", "unknown"),
            asset_hrefs={
                name: item.assets[name].href
                for name in SENTINEL2_ASSETS
                if name in item.assets
            },
        ))

    # Sort by cloud cover, or by date proximity if target_date given
    if target_date:
        from datetime import datetime as dt
        try:
            target = dt.fromisoformat(target_date.replace("Z", "+00:00"))
            results.sort(key=lambda r: abs(
                (dt.fromisoformat(r.datetime.replace("Z", "+00:00")) - target).total_seconds()
            ))
        except (ValueError, TypeError):
            results.sort(key=lambda r: r.cloud_cover)
    else:
        results.sort(key=lambda r: r.cloud_cover)

    results = results[:max_results]

    if results:
        best = results[0]
        log.info(
            "Best Sentinel-2 scene: %s | %s | cloud=%.1f%%",
            best.scene_id, best.datetime, best.cloud_cover,
        )
    else:
        log.warning("No Sentinel-2 scenes found matching criteria!")

    return results


# ---------------------------------------------------------------------------
# Download & clip
# ---------------------------------------------------------------------------

def download_and_clip_band(
    href: str,
    boundary_gdf: gpd.GeoDataFrame,
    output_path: Path,
    target_crs: str | None = None,
) -> Path:
    """
    Download a single band from a COG URL and clip to the city boundary.

    Uses rasterio's windowed reading to only pull the pixels we need —
    memory-efficient even for full Landsat/Sentinel scenes.

    Parameters
    ----------
    href : str
        Signed URL to the Cloud-Optimized GeoTIFF.
    boundary_gdf : gpd.GeoDataFrame
        City boundary in EPSG:4326.
    output_path : Path
        Where to save the clipped raster.
    target_crs : str, optional
        If provided, reproject the output to this CRS.

    Returns
    -------
    Path
        Path to the saved clipped raster.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Get boundary geometry in the raster's native CRS
    with rasterio.open(href) as src:
        raster_crs = src.crs

        # Reproject boundary to match raster CRS
        boundary_native = boundary_gdf.to_crs(raster_crs)
        shapes = [mapping(geom) for geom in boundary_native.geometry]

        # Clip raster to boundary
        clipped, clipped_transform = rasterio_mask(
            src, shapes, crop=True, nodata=0, filled=True
        )

        # Output metadata
        out_meta = src.meta.copy()
        out_meta.update({
            "driver": "GTiff",
            "height": clipped.shape[1],
            "width": clipped.shape[2],
            "transform": clipped_transform,
            "compress": "lzw",  # Lossless compression for smaller files
        })

    # Optionally reproject
    if target_crs and str(raster_crs) != target_crs:
        from rasterio.crs import CRS as RioCRS

        dst_crs = RioCRS.from_user_input(target_crs)
        transform, width, height = calculate_default_transform(
            raster_crs, dst_crs,
            clipped.shape[2], clipped.shape[1],
            *rasterio.transform.array_bounds(clipped.shape[1], clipped.shape[2], clipped_transform),
        )

        reprojected = np.zeros((clipped.shape[0], height, width), dtype=clipped.dtype)
        reproject(
            source=clipped,
            destination=reprojected,
            src_transform=clipped_transform,
            src_crs=raster_crs,
            dst_transform=transform,
            dst_crs=dst_crs,
            resampling=Resampling.nearest,
        )

        out_meta.update({
            "crs": dst_crs,
            "transform": transform,
            "height": height,
            "width": width,
        })
        clipped = reprojected

    # Write to disk
    with rasterio.open(output_path, "w", **out_meta) as dst:
        dst.write(clipped)

    size_mb = output_path.stat().st_size / (1024 * 1024)
    log.info("Saved clipped band: %s (%.1f MB)", output_path.name, size_mb)
    return output_path


def download_landsat_scene(
    scene: SceneResult,
    boundary_gdf: gpd.GeoDataFrame,
    config: CityConfig,
) -> dict[str, Path]:
    """
    Download and clip all required Landsat bands for a scene.

    Returns
    -------
    dict[str, Path]
        Mapping of asset name → local file path.
    """
    log.info("Downloading Landsat scene: %s", scene.scene_id)
    out_dir = raw_dir(config.city_name, "landsat")
    paths = {}

    for asset_name, href in scene.asset_hrefs.items():
        filename = f"{scene.scene_id}_{asset_name}.tif"
        out_path = out_dir / filename

        if out_path.exists():
            log.info("  %s already exists — skipping", filename)
            paths[asset_name] = out_path
            continue

        log.info("  Downloading %s (%s)...", asset_name, LANDSAT_ASSETS.get(asset_name, ""))
        paths[asset_name] = download_and_clip_band(
            href=href,
            boundary_gdf=boundary_gdf,
            output_path=out_path,
            target_crs=config.target_crs,
        )

    return paths


def download_sentinel2_scene(
    scene: SceneResult,
    boundary_gdf: gpd.GeoDataFrame,
    config: CityConfig,
) -> dict[str, Path]:
    """
    Download and clip all required Sentinel-2 bands for a scene.

    Returns
    -------
    dict[str, Path]
        Mapping of asset name → local file path.
    """
    log.info("Downloading Sentinel-2 scene: %s", scene.scene_id)
    out_dir = raw_dir(config.city_name, "sentinel2")
    paths = {}

    for asset_name, href in scene.asset_hrefs.items():
        filename = f"{scene.scene_id}_{asset_name}.tif"
        out_path = out_dir / filename

        if out_path.exists():
            log.info("  %s already exists — skipping", filename)
            paths[asset_name] = out_path
            continue

        log.info("  Downloading %s (%s)...", asset_name, SENTINEL2_ASSETS.get(asset_name, ""))
        paths[asset_name] = download_and_clip_band(
            href=href,
            boundary_gdf=boundary_gdf,
            output_path=out_path,
            target_crs=config.target_crs,
        )

    return paths


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

def print_acquisition_summary(
    landsat_scene: SceneResult,
    sentinel2_scene: SceneResult,
    landsat_paths: dict[str, Path],
    sentinel2_paths: dict[str, Path],
) -> None:
    """Print a formatted summary of acquired data."""
    from rich.console import Console
    from rich.table import Table

    console = Console()
    console.print()
    console.rule("[bold green]Data Acquisition Summary[/bold green]")

    # Scene info table
    scene_table = Table(title="Selected Scenes", show_header=True)
    scene_table.add_column("Source", style="cyan")
    scene_table.add_column("Scene ID", style="white")
    scene_table.add_column("Date", style="yellow")
    scene_table.add_column("Cloud %", style="green")
    scene_table.add_column("Platform", style="magenta")

    scene_table.add_row(
        "Landsat", landsat_scene.scene_id,
        landsat_scene.datetime[:10], f"{landsat_scene.cloud_cover:.1f}%",
        landsat_scene.platform,
    )
    scene_table.add_row(
        "Sentinel-2", sentinel2_scene.scene_id,
        sentinel2_scene.datetime[:10], f"{sentinel2_scene.cloud_cover:.1f}%",
        sentinel2_scene.platform,
    )
    console.print(scene_table)

    # Files table
    file_table = Table(title="Downloaded Files", show_header=True)
    file_table.add_column("Source", style="cyan")
    file_table.add_column("Band", style="white")
    file_table.add_column("File", style="green")
    file_table.add_column("Size", style="yellow")

    for name, path in landsat_paths.items():
        size_mb = path.stat().st_size / (1024 * 1024)
        file_table.add_row("Landsat", name, path.name, f"{size_mb:.1f} MB")

    for name, path in sentinel2_paths.items():
        size_mb = path.stat().st_size / (1024 * 1024)
        file_table.add_row("Sentinel-2", name, path.name, f"{size_mb:.1f} MB")

    console.print(file_table)
    console.print()

    # Save metadata
    metadata = {
        "landsat": {
            "scene_id": landsat_scene.scene_id,
            "datetime": landsat_scene.datetime,
            "cloud_cover": landsat_scene.cloud_cover,
            "platform": landsat_scene.platform,
            "files": {k: str(v) for k, v in landsat_paths.items()},
        },
        "sentinel2": {
            "scene_id": sentinel2_scene.scene_id,
            "datetime": sentinel2_scene.datetime,
            "cloud_cover": sentinel2_scene.cloud_cover,
            "platform": sentinel2_scene.platform,
            "files": {k: str(v) for k, v in sentinel2_paths.items()},
        },
    }

    meta_path = landsat_paths.get("lwir11", list(landsat_paths.values())[0]).parent.parent.parent / "acquisition_metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    console.print(f"[dim]Metadata saved to {meta_path}[/dim]")
