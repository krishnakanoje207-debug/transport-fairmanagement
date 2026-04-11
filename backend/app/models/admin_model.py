"""
SafeRoute - Admin Models
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageTemplate(BaseModel):
    template_name: str
    subject: str
    body_html: str
    body_text: str
    category: str = "general"  # general, sos, trip, welcome, alert


class MessageTemplateUpdate(BaseModel):
    subject: Optional[str] = None
    body_html: Optional[str] = None
    body_text: Optional[str] = None
    category: Optional[str] = None


class SendMessage(BaseModel):
    recipient_id: Optional[str] = None
    recipient_email: Optional[str] = None
    subject: str
    body: str
    template_id: Optional[str] = None


class AdminStats(BaseModel):
    total_users: int = 0
    total_guardians: int = 0
    total_linked_users: int = 0
    total_partners: int = 0
    total_trips: int = 0
    active_trips: int = 0
    total_sos: int = 0
    total_messages: int = 0
