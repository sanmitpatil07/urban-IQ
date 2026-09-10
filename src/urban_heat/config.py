"""
Configuration loader — reads city YAML configs and validates with Pydantic.
"""

from pathlib import Path

import yaml
from pydantic import BaseModel, Field, field_validator

from urban_heat.utils import CONFIG_DIR, log


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class SatelliteConfig(BaseModel):
    """Satellite search parameters."""
    date_range: str = Field(
        ...,
        description="ISO date range 'YYYY-MM-DD/YYYY-MM-DD'",
        pattern=r"^\d{4}-\d{2}-\d{2}/\d{4}-\d{2}-\d{2}$",
    )
    max_cloud_cover: int = Field(default=15, ge=0, le=100)
    landsat_platforms: list[str] = Field(default=["landsat-8", "landsat-9"])
    sentinel2_processing_level: str = Field(default="L2A")


class CityConfig(BaseModel):
    """Full configuration for a city."""
    city_name: str
    state: str
    country: str
    bbox: list[float] = Field(..., min_length=4, max_length=4)
    osm_relation_id: int
    satellite: SatelliteConfig
    target_crs: str = Field(default="EPSG:4326")
    grid_resolution: int = Field(default=300, ge=50, le=2000)

    @field_validator("bbox")
    @classmethod
    def validate_bbox(cls, v: list[float]) -> list[float]:
        west, south, east, north = v
        if not (-180 <= west < east <= 180):
            raise ValueError(f"Invalid longitude range: west={west}, east={east}")
        if not (-90 <= south < north <= 90):
            raise ValueError(f"Invalid latitude range: south={south}, north={north}")
        return v


# ---------------------------------------------------------------------------
# Loader
# ---------------------------------------------------------------------------

def load_city_config(city_name: str, config_dir: Path | None = None) -> CityConfig:
    """
    Load and validate a city configuration from YAML.

    Parameters
    ----------
    city_name : str
        Name of the city (matches the YAML filename without extension).
    config_dir : Path, optional
        Override the default config directory.

    Returns
    -------
    CityConfig
        Validated configuration object.
    """
    directory = config_dir or CONFIG_DIR
    config_path = directory / f"{city_name}.yaml"

    if not config_path.exists():
        available = [f.stem for f in directory.glob("*.yaml")]
        raise FileNotFoundError(
            f"Config not found: {config_path}. Available cities: {available}"
        )

    with open(config_path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)

    config = CityConfig(**raw)
    log.info("Loaded config for '%s' (%s, %s)", config.city_name, config.state, config.country)
    log.info("  BBox: %s  |  CRS: %s  |  Grid: %dm", config.bbox, config.target_crs, config.grid_resolution)
    log.info("  Date range: %s  |  Max cloud: %d%%", config.satellite.date_range, config.satellite.max_cloud_cover)
    return config
