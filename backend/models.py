from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

class SimulationRequest(BaseModel):
    """Request schema for what-if simulation."""
    city: str = Field(..., min_length=1, max_length=64, description="City name (e.g., 'pune')")
    zone_ids: List[str] = Field(..., min_length=1, max_length=500, description="List of zone IDs to simulate")
    delta_ndvi: float = Field(0.0, ge=-1.0, le=1.0, description="Change in NDVI")
    delta_ndbi: float = Field(0.0, ge=-1.0, le=1.0, description="Change in NDBI")
    zone_deltas: Optional[Dict[str, Dict[str, float]]] = Field(None, description="Per-zone overrides")

    @field_validator("city")
    @classmethod
    def normalize_city(cls, value: str) -> str:
        return value.strip().lower()

class SimulationResult(BaseModel):
    """Result for a single zone in the simulation."""
    zone_id: str
    original_lst: float
    new_lst: float
    lst_change: float
    new_ndvi: float
    new_ndbi: float

class SimulationResponse(BaseModel):
    """Full response for a simulation request."""
    city: str
    delta_ndvi: float
    delta_ndbi: float
    results: List[SimulationResult]
