"""
SafeRoute - Peak Hour Models
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PeakHourData(BaseModel):
    hour: int
    traffic_score: float  # 0-100
    trip_count: int = 0
    risk_level: str = "safe"  # safe, moderate, high_risk


class PeakHourResponse(BaseModel):
    hourly_data: List[PeakHourData]
    current_hour: int
    current_risk: str
    recommendation: str
    news_headlines: List[dict] = []


class TrafficNews(BaseModel):
    title: str
    description: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None
    published_at: Optional[str] = None
