"""
Utilities — logging, CRS helpers, path builders.
"""

import logging
import os
import sys
from pathlib import Path

from pyproj import CRS
from shapely.geometry import box, shape


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

def setup_logging(level: str = "INFO") -> logging.Logger:
    """Configure structured logging for the pipeline."""
    logger = logging.getLogger("urban_heat")
    if logger.handlers:
        return logger

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    return logger


log = setup_logging()


# ---------------------------------------------------------------------------
# Path helpers
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]  # urban-heat-dss/
# Production containers mount release artifacts at this location. Keeping the
# default preserves the existing local pipeline layout.
DATA_DIR = Path(os.environ.get("URBAN_HEAT_DATA_DIR", PROJECT_ROOT / "data"))
CONFIG_DIR = PROJECT_ROOT / "config" / "cities"


def city_data_dir(city_name: str) -> Path:
    """Return the data directory for a given city, creating it if needed."""
    d = DATA_DIR / city_name
    d.mkdir(parents=True, exist_ok=True)
    return d


def boundary_path(city_name: str) -> Path:
    """Path where the city boundary GeoJSON is stored."""
    d = city_data_dir(city_name) / "boundary"
    d.mkdir(parents=True, exist_ok=True)
    return d / f"{city_name}_boundary.geojson"


def raw_dir(city_name: str, source: str) -> Path:
    """Path for raw satellite data.  source = 'landsat' | 'sentinel2'."""
    d = city_data_dir(city_name) / "raw" / source
    d.mkdir(parents=True, exist_ok=True)
    return d


def processed_dir(city_name: str) -> Path:
    """Path for processed outputs (GeoJSON zones, model artifacts)."""
    d = city_data_dir(city_name) / "processed"
    d.mkdir(parents=True, exist_ok=True)
    return d


# ---------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------

def bbox_to_polygon(bbox: list[float]):
    """Convert [west, south, east, north] to a Shapely Polygon."""
    return box(*bbox)


def geometry_from_geojson(geojson_dict: dict):
    """Convert a GeoJSON geometry dict to a Shapely geometry."""
    return shape(geojson_dict)


# ---------------------------------------------------------------------------
# CRS helpers
# ---------------------------------------------------------------------------

def validate_crs(crs_string: str) -> CRS:
    """Parse and validate a CRS string, raising on failure."""
    try:
        return CRS.from_user_input(crs_string)
    except Exception as e:
        raise ValueError(f"Invalid CRS '{crs_string}': {e}") from e
