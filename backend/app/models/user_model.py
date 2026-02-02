from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class BloodGroup(str, Enum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"

class TrackingMethod(str, Enum):
    GPS = "gps"
    CELL_TOWER = "cell_tower"
    AUTO = "auto"

class UserRole(str, Enum):
    NORMAL_USER = "normal_user"
    GUARDIAN = "guardian"
    DRIVER = "driver"
    ADMIN = "admin"

class NotificationMethod(str, Enum):
    PUSH = "push"
    SMS = "sms"
    EMAIL = "email"

class RelationType(str, Enum):
    PARENT = "parent"
    CHILD = "child"
    SPOUSE = "spouse"
    SIBLING = "sibling"
    FRIEND = "friend"
    COLLEAGUE = "colleague"
    OTHER = "other"

class EmergencyContact(BaseModel):
    name: str
    phone: str
    relation: str
    is_primary: bool = False

class NotificationPreferences(BaseModel):
    master_enabled: bool = True
    travel_start: bool = True
    travel_end: bool = True
    route_change: bool = True
    delay_alert: bool = True
    sos_trigger: bool = True
    emergency_location: bool = True
    weather_alert: bool = True
    peak_hour_warning: bool = True
    linked_user_alerts: bool = True
    methods: List[NotificationMethod] = [NotificationMethod.PUSH]
    quiet_hours_start: Optional[str] = None  # HH:MM format
    quiet_hours_end: Optional[str] = None
    emergency_override: bool = True

class TrackingSettings(BaseModel):
    enabled: bool = True
    method: TrackingMethod = TrackingMethod.AUTO
    share_with_guardian: bool = True
    trip_only_sharing: bool = False
    sos_override: bool = True
    update_frequency: int = 10  # seconds

class SOSSettings(BaseModel):
    enabled: bool = True
    trigger_method: str = "button_press"
    auto_location_share: bool = True
    emergency_contact_notification: bool = True
    guardian_alert: bool = True

class UsageSummary(BaseModel):
    total_trips: int = 0
    total_distance_km: float = 0.0
    total_travel_time_minutes: int = 0
    total_active_days: int = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class LinkedUser(Document):
    user_id: str  # Guardian's user ID
    linked_user_name: str
    relation_type: RelationType
    age: Optional[int] = None
    date_of_birth: Optional[date] = None
    blood_group: Optional[BloodGroup] = None
    allergies: List[str] = []
    medical_conditions: List[str] = []
    special_assistance_notes: Optional[str] = None
    tracking_enabled: bool = True
    priority_level: int = 1  # 1=High, 2=Medium, 3=Low
    emergency_contacts: List[EmergencyContact] = []
    phone_number: Optional[str] = None
    device_id: Optional[str] = None  # For tracking device
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "linked_users"

class User(Document):
    # Basic Info
    email: EmailStr
    phone: str
    password_hash: str
    
    # Profile
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    city: Optional[str] = None
    blood_group: Optional[BloodGroup] = None
    special_notes: Optional[str] = None
    profile_photo_url: Optional[str] = None
    
    # Roles & Status
    roles: List[UserRole] = [UserRole.NORMAL_USER]
    is_active: bool = True
    is_verified: bool = False
    is_guardian: bool = False
    
    # Emergency Contacts
    emergency_contacts: List[EmergencyContact] = []
    
    # Linked Users (for guardians)
    linked_users: List[str] = []  # List of LinkedUser IDs
    
    # Settings
    notification_preferences: NotificationPreferences = Field(default_factory=NotificationPreferences)
    tracking_settings: TrackingSettings = Field(default_factory=TrackingSettings)
    sos_settings: SOSSettings = Field(default_factory=SOSSettings)
    
    # Usage Summary
    usage_summary: UsageSummary = Field(default_factory=UsageSummary)
    
    # Language & Preferences
    language: str = "en"
    text_size: str = "medium"  # small, medium, large
    
    # Security
    login_attempts: int = 0
    locked_until: Optional[datetime] = None
    last_login: Optional[datetime] = None
    password_changed_at: Optional[datetime] = None
    
    # FCM Token for push notifications
    fcm_token: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "phone",
        ]
    
    def calculate_age(self):
        """Calculate age from date of birth"""
        if self.date_of_birth:
            today = date.today()
            self.age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
    
    def is_guardian_user(self) -> bool:
        """Check if user has guardian role"""
        return UserRole.GUARDIAN in self.roles
    
    def is_driver_user(self) -> bool:
        """Check if user is a driver"""
        return UserRole.DRIVER in self.roles