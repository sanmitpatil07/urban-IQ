"""
Raster processing — LST conversion, NDVI/NDBI computation, cloud masking,
grid aggregation, and GeoJSON zone export.

Milestone 2 of the Urban Heat DSS pipeline.
"""

import json
from pathlib import Path

import geopandas as gpd
import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.warp import reproject, calculate_default_transform
from shapely.geometry import box

from urban_heat.config import CityConfig
from urban_heat.utils import log, processed_dir, city_data_dir


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Landsat Collection 2 Level 2 — Surface Temperature scaling
LST_SCALE = 0.00341802
LST_OFFSET = 149.0
KELVIN_TO_CELSIUS = 273.15

# Landsat QA_PIXEL bit flags (Collection 2)
# Bit 3: Cloud, Bit 4: Cloud Shadow, Bit 1: Dilated Cloud
QA_CLOUD_BITS = {
    "cloud": 3,
    "cloud_shadow": 4,
    "dilated_cloud": 1,
}

# Sentinel-2 SCL (Scene Classification Layer) values to mask
# 0=No Data, 1=Saturated, 2=Dark/Shadow, 3=Cloud Shadow,
# 8=Cloud Medium Prob, 9=Cloud High Prob, 10=Thin Cirrus
SCL_MASK_VALUES = {0, 1, 2, 3, 8, 9, 10}

# Valid SCL values for clear land pixels
# 4=Vegetation, 5=Bare Soil, 6=Water, 7=Cloud Low Prob, 11=Snow/Ice
SCL_VALID_VALUES = {4, 5, 6, 7, 11}


# ---------------------------------------------------------------------------
# Cloud masking
# ---------------------------------------------------------------------------

def create_landsat_cloud_mask(qa_pixel_path: Path) -> np.ndarray:
    """
    Create a boolean cloud mask from Landsat QA_PIXEL band.

    Returns
    -------
    np.ndarray
        Boolean mask where True = CLEAR pixel (usable), False = cloudy/shadow.
    """
    with rasterio.open(qa_pixel_path) as src:
        qa = src.read(1)

    # Check cloud-related bits
    cloud_mask = np.zeros(qa.shape, dtype=bool)
    for name, bit in QA_CLOUD_BITS.items():
        bit_mask = (qa >> bit) & 1
        cloud_mask |= bit_mask.astype(bool)

    clear_mask = ~cloud_mask & (qa > 0)  # Exclude nodata (0) as well
    clear_pct = np.sum(clear_mask) / np.sum(qa > 0) * 100 if np.sum(qa > 0) > 0 else 0
    log.info("Landsat cloud mask: %.1f%% clear pixels", clear_pct)
    return clear_mask


def create_sentinel2_cloud_mask(scl_path: Path) -> np.ndarray:
    """
    Create a boolean cloud mask from Sentinel-2 SCL band.

    Returns
    -------
    np.ndarray
        Boolean mask where True = CLEAR pixel, False = cloudy/shadow/nodata.
    """
    with rasterio.open(scl_path) as src:
        scl = src.read(1)
        scl_meta = {
            "transform": src.transform,
            "crs": src.crs,
            "shape": src.shape,
        }

    clear_mask = np.isin(scl, list(SCL_VALID_VALUES))
    total_valid = np.sum(scl > 0)
    clear_pct = np.sum(clear_mask) / total_valid * 100 if total_valid > 0 else 0
    log.info("Sentinel-2 cloud mask: %.1f%% clear pixels", clear_pct)
    return clear_mask, scl_meta


# ---------------------------------------------------------------------------
# LST processing
# ---------------------------------------------------------------------------

def compute_lst(
    lwir11_path: Path,
    qa_pixel_path: Path,
) -> tuple[np.ndarray, dict]:
    """
    Convert Landsat thermal band to Land Surface Temperature in Celsius.

    Parameters
    ----------
    lwir11_path : Path
        Path to the lwir11 (ST_B10) GeoTIFF.
    qa_pixel_path : Path
        Path to the QA_PIXEL GeoTIFF for cloud masking.

    Returns
    -------
    tuple[np.ndarray, dict]
        LST array in Celsius (masked with NaN for clouds/nodata) and raster metadata.
    """
    log.info("Computing LST from %s...", lwir11_path.name)

    # Read thermal band
    with rasterio.open(lwir11_path) as src:
        dn = src.read(1).astype(np.float32)
        meta = {
            "transform": src.transform,
            "crs": src.crs,
            "shape": src.shape,
            "width": src.width,
            "height": src.height,
        }

    # Create cloud mask
    clear_mask = create_landsat_cloud_mask(qa_pixel_path)

    # Convert DN to temperature
    # T(K) = DN * scale + offset
    lst_kelvin = dn * LST_SCALE + LST_OFFSET
    lst_celsius = lst_kelvin - KELVIN_TO_CELSIUS

    # Apply masks: nodata (DN=0) and clouds
    nodata_mask = dn == 0
    invalid_mask = nodata_mask | ~clear_mask
    lst_celsius[invalid_mask] = np.nan

    # Stats
    valid = lst_celsius[~np.isnan(lst_celsius)]
    if len(valid) > 0:
        log.info(
            "LST computed: min=%.1f°C, max=%.1f°C, mean=%.1f°C, valid_pixels=%d",
            np.nanmin(valid), np.nanmax(valid), np.nanmean(valid), len(valid),
        )
    else:
        log.warning("No valid LST pixels after masking!")

    return lst_celsius, meta


# ---------------------------------------------------------------------------
# NDVI / NDBI computation
# ---------------------------------------------------------------------------

def _resample_band_to_target(
    source_path: Path,
    target_shape: tuple[int, int],
    target_transform,
    target_crs,
) -> np.ndarray:
    """
    Resample a band (e.g. 20m B11) to match a target grid (e.g. 10m B08).

    Uses bilinear resampling for spectral bands.
    """
    with rasterio.open(source_path) as src:
        data = src.read(1)
        src_transform = src.transform
        src_crs = src.crs

    dst = np.zeros(target_shape, dtype=np.float32)
    reproject(
        source=data.astype(np.float32),
        destination=dst,
        src_transform=src_transform,
        src_crs=src_crs,
        dst_transform=target_transform,
        dst_crs=target_crs,
        resampling=Resampling.bilinear,
    )
    return dst


def compute_ndvi(
    b04_path: Path,
    b08_path: Path,
    scl_mask: np.ndarray | None = None,
    scl_meta: dict | None = None,
) -> tuple[np.ndarray, dict]:
    """
    Compute Normalized Difference Vegetation Index.

    NDVI = (NIR - Red) / (NIR + Red) = (B08 - B04) / (B08 + B04)

    Range: -1 to +1
      - Dense vegetation: 0.6 – 0.9
      - Sparse vegetation: 0.2 – 0.5
      - Bare soil/built-up: -0.1 – 0.2
      - Water: -0.3 – 0.0

    Parameters
    ----------
    b04_path : Path
        Red band (10m resolution).
    b08_path : Path
        NIR band (10m resolution).
    scl_mask : np.ndarray, optional
        Cloud mask from SCL (True = clear).
    scl_meta : dict, optional
        Metadata for resampling SCL mask if needed.

    Returns
    -------
    tuple[np.ndarray, dict]
        NDVI array and raster metadata.
    """
    log.info("Computing NDVI...")

    with rasterio.open(b04_path) as src:
        red = src.read(1).astype(np.float32)
        meta = {
            "transform": src.transform,
            "crs": src.crs,
            "shape": src.shape,
            "width": src.width,
            "height": src.height,
        }

    with rasterio.open(b08_path) as src:
        nir = src.read(1).astype(np.float32)

    # Compute NDVI with safe division
    denominator = nir + red
    ndvi = np.where(denominator > 0, (nir - red) / denominator, np.nan)

    # Apply nodata mask
    nodata_mask = (red == 0) & (nir == 0)
    ndvi[nodata_mask] = np.nan

    # Apply cloud mask if provided (resample SCL to 10m if needed)
    if scl_mask is not None:
        if scl_mask.shape != ndvi.shape:
            # SCL is 20m, NDVI is 10m — resample mask
            resampled_mask = np.zeros(ndvi.shape, dtype=np.float32)
            reproject(
                source=scl_mask.astype(np.float32),
                destination=resampled_mask,
                src_transform=scl_meta["transform"],
                src_crs=scl_meta["crs"],
                dst_transform=meta["transform"],
                dst_crs=meta["crs"],
                resampling=Resampling.nearest,
            )
            cloud_clear = resampled_mask > 0.5
        else:
            cloud_clear = scl_mask
        ndvi[~cloud_clear] = np.nan

    valid = ndvi[~np.isnan(ndvi)]
    if len(valid) > 0:
        log.info(
            "NDVI computed: min=%.3f, max=%.3f, mean=%.3f, valid_pixels=%d",
            np.nanmin(valid), np.nanmax(valid), np.nanmean(valid), len(valid),
        )

    return ndvi, meta


def compute_ndbi(
    b08_path: Path,
    b11_path: Path,
    scl_mask: np.ndarray | None = None,
    scl_meta: dict | None = None,
) -> tuple[np.ndarray, dict]:
    """
    Compute Normalized Difference Built-up Index.

    NDBI = (SWIR - NIR) / (SWIR + NIR) = (B11 - B08) / (B11 + B08)

    Range: -1 to +1
      - Built-up areas: 0.0 – 0.3
      - Vegetation: -0.5 – -0.1
      - Water: -0.5 – -0.2

    B11 is 20m and B08 is 10m, so B11 gets resampled to 10m.
    """
    log.info("Computing NDBI...")

    with rasterio.open(b08_path) as src:
        nir = src.read(1).astype(np.float32)
        meta = {
            "transform": src.transform,
            "crs": src.crs,
            "shape": src.shape,
            "width": src.width,
            "height": src.height,
        }

    # Resample B11 (20m) to match B08 (10m)
    swir = _resample_band_to_target(
        b11_path,
        target_shape=nir.shape,
        target_transform=meta["transform"],
        target_crs=meta["crs"],
    )
    log.info("  B11 resampled from 20m to 10m (shape: %s)", swir.shape)

    # Compute NDBI with safe division
    denominator = swir + nir
    ndbi = np.where(denominator > 0, (swir - nir) / denominator, np.nan)

    # Apply nodata mask
    nodata_mask = (nir == 0) & (swir == 0)
    ndbi[nodata_mask] = np.nan

    # Apply cloud mask if provided
    if scl_mask is not None:
        if scl_mask.shape != ndbi.shape:
            resampled_mask = np.zeros(ndbi.shape, dtype=np.float32)
            reproject(
                source=scl_mask.astype(np.float32),
                destination=resampled_mask,
                src_transform=scl_meta["transform"],
                src_crs=scl_meta["crs"],
                dst_transform=meta["transform"],
                dst_crs=meta["crs"],
                resampling=Resampling.nearest,
            )
            cloud_clear = resampled_mask > 0.5
        else:
            cloud_clear = scl_mask
        ndbi[~cloud_clear] = np.nan

    valid = ndbi[~np.isnan(ndbi)]
    if len(valid) > 0:
        log.info(
            "NDBI computed: min=%.3f, max=%.3f, mean=%.3f, valid_pixels=%d",
            np.nanmin(valid), np.nanmax(valid), np.nanmean(valid), len(valid),
        )

    return ndbi, meta


# ---------------------------------------------------------------------------
# Grid aggregation
# ---------------------------------------------------------------------------

def create_grid(
    boundary_gdf: gpd.GeoDataFrame,
    resolution: int,
    target_crs: str,
) -> gpd.GeoDataFrame:
    """
    Create a regular grid of square cells covering the city boundary.

    Parameters
    ----------
    boundary_gdf : GeoDataFrame
        City boundary (can be in any CRS — will be reprojected).
    resolution : int
        Grid cell size in meters.
    target_crs : str
        CRS for the grid (should be a projected CRS like UTM).

    Returns
    -------
    GeoDataFrame
        Grid cells clipped to the city boundary, with zone IDs.
    """
    log.info("Creating %dm grid over city boundary...", resolution)

    # Reproject boundary to target CRS (projected, meters)
    boundary_proj = boundary_gdf.to_crs(target_crs)
    bounds = boundary_proj.total_bounds  # xmin, ymin, xmax, ymax
    xmin, ymin, xmax, ymax = bounds

    # Generate grid cells
    cols = np.arange(xmin, xmax, resolution)
    rows = np.arange(ymin, ymax, resolution)

    cells = []
    zone_ids = []
    idx = 0
    for x in cols:
        for y in rows:
            cell = box(x, y, x + resolution, y + resolution)
            cells.append(cell)
            zone_ids.append(f"Z{idx:04d}")
            idx += 1

    grid = gpd.GeoDataFrame(
        {"zone_id": zone_ids},
        geometry=cells,
        crs=target_crs,
    )

    # Clip grid to city boundary
    boundary_union = boundary_proj.geometry.union_all()
    grid = grid[grid.intersects(boundary_union)].copy()
    grid["geometry"] = grid.geometry.intersection(boundary_union)

    # Remove empty geometries
    grid = grid[~grid.is_empty].copy()
    grid = grid.reset_index(drop=True)

    # Compute cell area
    grid["area_m2"] = grid.geometry.area
    grid["area_km2"] = grid["area_m2"] / 1e6

    log.info("Grid created: %d zones (from %d total cells)", len(grid), idx)
    return grid


def aggregate_raster_to_zones(
    raster: np.ndarray,
    raster_meta: dict,
    grid: gpd.GeoDataFrame,
    stat: str = "mean",
) -> np.ndarray:
    """
    Aggregate raster values to grid zones using zonal statistics.

    Memory-efficient: processes one zone at a time instead of loading
    all zones into memory.

    Parameters
    ----------
    raster : np.ndarray
        2D raster array (NaN for nodata).
    raster_meta : dict
        Must contain 'transform' and 'crs'.
    grid : GeoDataFrame
        Grid zones in the same CRS as the raster.
    stat : str
        Aggregation function: 'mean', 'median', 'std', 'min', 'max'.

    Returns
    -------
    np.ndarray
        Array of aggregated values, one per zone. NaN for zones with no data.
    """
    from rasterio.features import geometry_mask

    transform = raster_meta["transform"]
    n_zones = len(grid)
    results = np.full(n_zones, np.nan)

    stat_func = {
        "mean": np.nanmean,
        "median": np.nanmedian,
        "std": np.nanstd,
        "min": np.nanmin,
        "max": np.nanmax,
    }[stat]

    # Ensure grid is in raster CRS
    grid_crs = grid.to_crs(raster_meta["crs"])

    for i, (_, row) in enumerate(grid_crs.iterrows()):
        geom = row.geometry
        if geom.is_empty:
            continue

        # Create a mask for this zone
        try:
            mask = geometry_mask(
                [geom],
                out_shape=raster.shape,
                transform=transform,
                invert=True,  # True = pixels INSIDE the geometry
            )
        except Exception:
            continue

        # Extract values within this zone
        zone_values = raster[mask]
        valid_values = zone_values[~np.isnan(zone_values)]

        if len(valid_values) > 0:
            results[i] = stat_func(valid_values)

    valid_count = np.sum(~np.isnan(results))
    log.info("Zonal aggregation (%s): %d/%d zones have valid data", stat, valid_count, n_zones)
    return results


# ---------------------------------------------------------------------------
# Resample LST to match Sentinel-2 grid
# ---------------------------------------------------------------------------

def resample_lst_to_sentinel_grid(
    lst: np.ndarray,
    lst_meta: dict,
    target_meta: dict,
) -> tuple[np.ndarray, dict]:
    """
    Resample LST (30m Landsat) to match the Sentinel-2 grid (10m).

    Uses bilinear interpolation to preserve smooth temperature gradients.
    """
    log.info("Resampling LST from 30m to Sentinel-2 grid...")

    dst = np.full(
        (target_meta["height"], target_meta["width"]),
        np.nan,
        dtype=np.float32,
    )

    # Replace NaN with a sentinel for reprojection, then restore
    lst_filled = np.where(np.isnan(lst), -9999.0, lst)

    reproject(
        source=lst_filled.astype(np.float32),
        destination=dst,
        src_transform=lst_meta["transform"],
        src_crs=lst_meta["crs"],
        dst_transform=target_meta["transform"],
        dst_crs=target_meta["crs"],
        resampling=Resampling.bilinear,
        src_nodata=-9999.0,
        dst_nodata=np.nan,
    )

    log.info("LST resampled: shape %s → %s", lst.shape, dst.shape)
    return dst, target_meta


# ---------------------------------------------------------------------------
# Main processing pipeline
# ---------------------------------------------------------------------------

def process_city(config: CityConfig) -> Path:
    """
    Run the full Milestone 2 processing pipeline for a city.

    1. Load acquisition metadata to find band files
    2. Apply cloud masks
    3. Compute LST, NDVI, NDBI
    4. Create grid and aggregate
    5. Export as GeoJSON

    Returns
    -------
    Path
        Path to the output GeoJSON file.
    """
    from rich.console import Console
    console = Console()
    console.rule(f"[bold blue]Processing: {config.city_name.upper()}[/bold blue]")

    # --- Load metadata ---
    meta_path = city_data_dir(config.city_name) / "acquisition_metadata.json"
    if not meta_path.exists():
        raise FileNotFoundError(
            f"Acquisition metadata not found: {meta_path}. Run data acquisition first."
        )

    with open(meta_path) as f:
        acq_meta = json.load(f)

    landsat_files = {k: Path(v) for k, v in acq_meta["landsat"]["files"].items()}
    sentinel2_files = {k: Path(v) for k, v in acq_meta["sentinel2"]["files"].items()}

    # Verify all files exist
    for name, path in {**landsat_files, **sentinel2_files}.items():
        if not path.exists():
            raise FileNotFoundError(f"Band file missing: {name} → {path}")

    console.print("[green]All band files verified.[/green]")

    # --- Step 1: LST ---
    console.print("\n[bold]Step 1: Land Surface Temperature[/bold]")
    lst, lst_meta = compute_lst(
        lwir11_path=landsat_files["lwir11"],
        qa_pixel_path=landsat_files["qa_pixel"],
    )

    # --- Step 2: Cloud mask for Sentinel-2 ---
    console.print("\n[bold]Step 2: Sentinel-2 Cloud Mask[/bold]")
    scl_mask, scl_meta = create_sentinel2_cloud_mask(sentinel2_files["SCL"])

    # --- Step 3: NDVI ---
    console.print("\n[bold]Step 3: NDVI[/bold]")
    ndvi, ndvi_meta = compute_ndvi(
        b04_path=sentinel2_files["B04"],
        b08_path=sentinel2_files["B08"],
        scl_mask=scl_mask,
        scl_meta=scl_meta,
    )

    # --- Step 4: NDBI ---
    console.print("\n[bold]Step 4: NDBI[/bold]")
    ndbi, ndbi_meta = compute_ndbi(
        b08_path=sentinel2_files["B08"],
        b11_path=sentinel2_files["B11"],
        scl_mask=scl_mask,
        scl_meta=scl_meta,
    )

    # --- Step 5: Create grid ---
    console.print("\n[bold]Step 5: Grid Creation[/bold]")
    from urban_heat.boundary import load_boundary
    boundary_gdf = load_boundary(config)

    grid = create_grid(
        boundary_gdf=boundary_gdf,
        resolution=config.grid_resolution,
        target_crs=config.target_crs,
    )

    # --- Step 6: Aggregate to zones ---
    console.print("\n[bold]Step 6: Zonal Aggregation[/bold]")

    # Aggregate NDVI and NDBI at their native 10m resolution
    console.print("  Aggregating NDVI...")
    grid["ndvi"] = aggregate_raster_to_zones(ndvi, ndvi_meta, grid, stat="mean")

    console.print("  Aggregating NDBI...")
    grid["ndbi"] = aggregate_raster_to_zones(ndbi, ndbi_meta, grid, stat="mean")

    # Aggregate LST at its native 30m resolution
    console.print("  Aggregating LST...")
    grid["lst"] = aggregate_raster_to_zones(lst, lst_meta, grid, stat="mean")

    # Also compute std for LST (useful for identifying heterogeneous zones)
    grid["lst_std"] = aggregate_raster_to_zones(lst, lst_meta, grid, stat="std")

    # --- Step 7: Derived metrics ---
    console.print("\n[bold]Step 7: Derived Metrics[/bold]")

    # UHI intensity: how much hotter is this zone compared to the coolest 10%
    valid_lst = grid["lst"].dropna()
    if len(valid_lst) > 0:
        baseline_temp = valid_lst.quantile(0.10)
        grid["uhi_intensity"] = grid["lst"] - baseline_temp
        log.info("UHI baseline (10th percentile): %.1f°C", baseline_temp)
    else:
        grid["uhi_intensity"] = np.nan

    # Heat risk score (simple composite: normalized LST + NDBI - NDVI)
    for col in ["lst", "ndvi", "ndbi"]:
        valid = grid[col].dropna()
        if len(valid) > 0:
            col_min, col_max = valid.min(), valid.max()
            col_range = col_max - col_min
            if col_range > 0:
                grid[f"{col}_norm"] = (grid[col] - col_min) / col_range
            else:
                grid[f"{col}_norm"] = 0.5
        else:
            grid[f"{col}_norm"] = np.nan

    grid["heat_risk_score"] = (
        0.5 * grid["lst_norm"]
        + 0.3 * grid["ndbi_norm"]
        - 0.2 * grid.get("ndvi_norm", 0)
    ).clip(0, 1)

    # Drop normalized columns (internal use only)
    grid = grid.drop(columns=["lst_norm", "ndvi_norm", "ndbi_norm"], errors="ignore")

    # --- Step 8: Export ---
    console.print("\n[bold]Step 8: Export[/bold]")

    # Round values for cleaner output
    for col in ["lst", "lst_std", "ndvi", "ndbi", "uhi_intensity", "heat_risk_score", "area_km2"]:
        if col in grid.columns:
            grid[col] = grid[col].round(4)

    # Convert to WGS84 for GeoJSON output (standard for web maps)
    grid_wgs84 = grid.to_crs("EPSG:4326")

    # Drop zones with no data at all
    has_data = grid_wgs84[["lst", "ndvi", "ndbi"]].notna().any(axis=1)
    grid_wgs84 = grid_wgs84[has_data].copy()
    grid_wgs84 = grid_wgs84.reset_index(drop=True)

    out_path = processed_dir(config.city_name) / f"{config.city_name}_zones.geojson"
    grid_wgs84.to_file(out_path, driver="GeoJSON")
    log.info("Exported %d zones to %s", len(grid_wgs84), out_path)

    # --- Summary ---
    _print_processing_summary(grid_wgs84, config, console)

    return out_path


def _print_processing_summary(
    grid: gpd.GeoDataFrame,
    config: CityConfig,
    console,
) -> None:
    """Print a formatted summary of processing results."""
    from rich.table import Table

    console.print()
    console.rule("[bold green]Processing Summary[/bold green]")

    # Stats table
    stats_table = Table(title="Zone Statistics", show_header=True)
    stats_table.add_column("Metric", style="cyan")
    stats_table.add_column("Min", style="white", justify="right")
    stats_table.add_column("Mean", style="yellow", justify="right")
    stats_table.add_column("Max", style="white", justify="right")
    stats_table.add_column("Valid Zones", style="green", justify="right")

    for col, label in [
        ("lst", "LST (deg C)"),
        ("ndvi", "NDVI"),
        ("ndbi", "NDBI"),
        ("uhi_intensity", "UHI Intensity (deg C)"),
        ("heat_risk_score", "Heat Risk Score"),
    ]:
        if col in grid.columns:
            valid = grid[col].dropna()
            if len(valid) > 0:
                stats_table.add_row(
                    label,
                    f"{valid.min():.2f}",
                    f"{valid.mean():.2f}",
                    f"{valid.max():.2f}",
                    f"{len(valid)}/{len(grid)}",
                )

    console.print(stats_table)

    # Top 5 hottest zones
    hottest = grid.nlargest(5, "lst")[["zone_id", "lst", "ndvi", "ndbi", "heat_risk_score"]]
    if len(hottest) > 0:
        hot_table = Table(title="Top 5 Hottest Zones", show_header=True)
        hot_table.add_column("Zone", style="red")
        hot_table.add_column("LST (C)", style="yellow", justify="right")
        hot_table.add_column("NDVI", style="green", justify="right")
        hot_table.add_column("NDBI", style="cyan", justify="right")
        hot_table.add_column("Risk", style="magenta", justify="right")
        for _, row in hottest.iterrows():
            hot_table.add_row(
                str(row["zone_id"]),
                f"{row['lst']:.1f}",
                f"{row['ndvi']:.3f}" if not np.isnan(row['ndvi']) else "N/A",
                f"{row['ndbi']:.3f}" if not np.isnan(row['ndbi']) else "N/A",
                f"{row['heat_risk_score']:.3f}" if not np.isnan(row['heat_risk_score']) else "N/A",
            )
        console.print(hot_table)

    # Coolest 5 zones
    coolest = grid.nsmallest(5, "lst")[["zone_id", "lst", "ndvi", "ndbi", "heat_risk_score"]]
    if len(coolest) > 0:
        cool_table = Table(title="Top 5 Coolest Zones", show_header=True)
        cool_table.add_column("Zone", style="blue")
        cool_table.add_column("LST (C)", style="yellow", justify="right")
        cool_table.add_column("NDVI", style="green", justify="right")
        cool_table.add_column("NDBI", style="cyan", justify="right")
        cool_table.add_column("Risk", style="magenta", justify="right")
        for _, row in coolest.iterrows():
            cool_table.add_row(
                str(row["zone_id"]),
                f"{row['lst']:.1f}",
                f"{row['ndvi']:.3f}" if not np.isnan(row['ndvi']) else "N/A",
                f"{row['ndbi']:.3f}" if not np.isnan(row['ndbi']) else "N/A",
                f"{row['heat_risk_score']:.3f}" if not np.isnan(row['heat_risk_score']) else "N/A",
            )
        console.print(cool_table)

    console.print()
    console.print(f"[bold]Total zones:[/bold] {len(grid)}")
    console.print(f"[bold]Grid resolution:[/bold] {config.grid_resolution}m")
    console.print(f"[bold]Output:[/bold] {processed_dir(config.city_name) / f'{config.city_name}_zones.geojson'}")
    console.print()
