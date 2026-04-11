"""
SafeRoute - Travel Partner Models
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PartnerRouteCreate(BaseModel):
    route_name: str
    from_location: str
    to_location: str
    from_lat: Optional[float] = None
    from_lng: Optional[float] = None
    to_lat: Optional[float] = None
    to_lng: Optional[float] = None
    distance_km: Optional[float] = None
    base_fare: float = 10.0
    time_slabs: List[dict] = []  # [{"departure": "07:00", "label": "Morning"}, ...]
    vehicle_type: str = "bus"
    vehicle_number: Optional[str] = None
    capacity: int = 40
    is_active: bool = True


class PartnerRouteUpdate(BaseModel):
    route_name: Optional[str] = None
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    base_fare: Optional[float] = None
    time_slabs: Optional[List[dict]] = None
    vehicle_number: Optional[str] = None
    capacity: Optional[int] = None
    is_active: Optional[bool] = None


class PartnerProfile(BaseModel):
    company_name: str
    registration_number: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    vehicle_count: int = 0
