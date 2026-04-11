"""
SafeRoute - Trip Models
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TransportType(str, Enum):
    BUS = "bus"
    AUTO = "auto"
    CAB = "cab"


class TripStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    SOS = "sos"


class TripCreate(BaseModel):
    transport_type: TransportType
    pickup_location: Optional[str] = None
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    drop_location: str
    drop_lat: Optional[float] = None
    drop_lng: Optional[float] = None
    start_time: str  # ISO format or HH:MM
    partner_id: Optional[str] = None  # For bus trips
    route_id: Optional[str] = None  # For bus trips
    linked_user_id: Optional[str] = None  # If booking for linked user


class TripUpdate(BaseModel):
    status: Optional[TripStatus] = None
    end_time: Optional[datetime] = None
    actual_fare: Optional[float] = None


class TripResponse(BaseModel):
    id: str
    user_id: str
    transport_type: str
    pickup_location: Optional[str] = None
    drop_location: str
    start_time: str
    status: str
    estimated_fare: Optional[float] = None
    actual_fare: Optional[float] = None
    partner_id: Optional[str] = None
    linked_user_id: Optional[str] = None
    tracking_qr: Optional[str] = None
    trip_start_qr: Optional[str] = None
    created_at: Optional[datetime] = None
