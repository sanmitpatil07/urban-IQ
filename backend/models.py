from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SimulationRequest(BaseModel):
    """Request schema for what-if simulation."""
    city: str = Field(..., description="City name (e.g., 'pune')")
    zone_ids: List[str] = Field(..., description="List of zone IDs to simulate changes on")
    delta_ndvi: float = Field(0.0, description="Change in NDVI (-1.0 to 1.0)")
    delta_ndbi: float = Field(0.0, description="Change in NDBI (-1.0 to 1.0)")
    zone_deltas: Optional[Dict[str, Dict[str, float]]] = Field(None, description="Specific overrides for individual zones")

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
