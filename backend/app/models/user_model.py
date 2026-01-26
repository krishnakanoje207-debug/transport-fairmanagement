from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class userModel(BaseModel):
    frist_name: str
    last_name: str
    email: EmailStr
    phone: str
    date_of_birth: datetime
    gender: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None
    special_notes: Optional[str] = None
    profile_pic: Optional[str] = None


class Config:
    orm_mode= True