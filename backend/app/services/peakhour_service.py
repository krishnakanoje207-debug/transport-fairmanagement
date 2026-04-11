"""SafeRoute - Peak Hour Service"""
from datetime import datetime


def get_time_slab(hour: int) -> str:
    if 7 <= hour < 10:
        return "morning_peak"
    elif 10 <= hour < 16:
        return "afternoon"
    elif 16 <= hour < 20:
        return "evening_peak"
    else:
        return "night"


def get_risk_level(hour: int) -> str:
    slab = get_time_slab(hour)
    if slab in ("morning_peak", "evening_peak"):
        return "high_risk"
    elif slab == "night":
        return "moderate"
    return "safe"
