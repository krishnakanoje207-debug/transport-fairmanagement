"""
SafeRoute - Location Models
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LocationUpdate(BaseModel):
    trip_id: str
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None
    source: str = "gps"  # gps or cell_tower


class LocationResponse(BaseModel):
    id: str
    trip_id: str
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    source: str
    timestamp: datetime
