"""
SafeRoute - User Models
Schemas for all user types: guardian, linked_user, travel_partner, admin
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class UserRole(str, Enum):
    GUARDIAN = "guardian"
    LINKED_USER = "linked_user"
    TRAVEL_PARTNER = "travel_partner"
    ADMIN = "admin"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10)
    role: UserRole = UserRole.GUARDIAN
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    special_notes: Optional[str] = None
    # Travel partner fields
    company_name: Optional[str] = None
    company_registration: Optional[str] = None


class LinkedUserCreate(BaseModel):
    """Guardian creates a linked user"""
    first_name: str
    last_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    relation: str = "Child"
    special_notes: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    special_notes: Optional[str] = None


class UserSettings(BaseModel):
    tracking_enabled: bool = True
    sos_enabled: bool = True
    notifications_enabled: bool = True
    quiet_hours_start: Optional[str] = "22:00"
    quiet_hours_end: Optional[str] = "07:00"
    language: str = "en"
    distance_alert_meters: int = 300


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str
    role: str
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    special_notes: Optional[str] = None
    profile_photo: Optional[str] = None
    is_active: bool = True
    guardian_id: Optional[str] = None
    relation: Optional[str] = None
    company_name: Optional[str] = None
    created_at: Optional[datetime] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
