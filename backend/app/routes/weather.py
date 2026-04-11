"""
SafeRoute - Weather Routes
Real OpenWeatherMap API (free tier) with demo fallback
"""
from fastapi import APIRouter, Depends
from ..config.settings import settings
import httpx
from datetime import datetime

router = APIRouter()

DEMO_WEATHER = {
    "temperature": 28,
    "feels_like": 31,
    "description": "Partly Cloudy",
    "icon": "02d",
    "humidity": 72,
    "wind_speed": 18,
    "wind_direction": "NW",
    "visibility": 8000,
    "pressure": 1012,
    "rain_probability": 15,
    "city": "Gwalior",
    "country": "IN",
    "sunrise": "06:05 AM",
    "sunset": "06:45 PM",
}

DEMO_FORECAST = [
    {"time": "Now", "temp": 28, "icon": "🌤", "desc": "Partly Cloudy"},
    {"time": "+3h", "temp": 30, "icon": "☀️", "desc": "Sunny"},
    {"time": "+6h", "temp": 32, "icon": "☀️", "desc": "Hot"},
    {"time": "+9h", "temp": 27, "icon": "🌦", "desc": "Light Rain"},
    {"time": "+12h", "temp": 24, "icon": "🌙", "desc": "Clear Night"},
]


@router.get("/current")
async def get_current_weather(city: str = "Gwalior", lat: float = None, lon: float = None):
    """Get current weather - uses real API if key available, demo otherwise"""
    if settings.WEATHER_API_KEY:
        try:
            async with httpx.AsyncClient() as client:
                if lat and lon:
                    url = f"{settings.WEATHER_API_URL}/weather?lat={lat}&lon={lon}&appid={settings.WEATHER_API_KEY}&units=metric"
                else:
                    url = f"{settings.WEATHER_API_URL}/weather?q={city},IN&appid={settings.WEATHER_API_KEY}&units=metric"
                resp = await client.get(url, timeout=10)
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "source": "live",
                        "temperature": round(data["main"]["temp"]),
                        "feels_like": round(data["main"]["feels_like"]),
                        "description": data["weather"][0]["description"].title(),
                        "icon": data["weather"][0]["icon"],
                        "humidity": data["main"]["humidity"],
                        "wind_speed": round(data["wind"]["speed"] * 3.6, 1),
                        "visibility": data.get("visibility", 10000),
                        "pressure": data["main"]["pressure"],
                        "city": data["name"],
                        "country": data["sys"]["country"],
                    }
        except Exception:
            pass

    return {"source": "demo", **DEMO_WEATHER}


@router.get("/forecast")
async def get_forecast(city: str = "Gwalior"):
    """Get weather forecast"""
    if settings.WEATHER_API_KEY:
        try:
            async with httpx.AsyncClient() as client:
                url = f"{settings.WEATHER_API_URL}/forecast?q={city},IN&appid={settings.WEATHER_API_KEY}&units=metric&cnt=5"
                resp = await client.get(url, timeout=10)
                if resp.status_code == 200:
                    data = resp.json()
                    hourly = []
                    for item in data.get("list", []):
                        hourly.append({
                            "time": item["dt_txt"],
                            "temp": round(item["main"]["temp"]),
                            "desc": item["weather"][0]["description"].title(),
                            "icon": item["weather"][0]["icon"],
                        })
                    return {"source": "live", "forecast": hourly}
        except Exception:
            pass

    return {"source": "demo", "forecast": DEMO_FORECAST}


@router.get("/risk")
async def get_weather_risk(city: str = "Gwalior"):
    """Assess weather risk for travel"""
    weather = await get_current_weather(city)
    risk = "safe"
    warnings = []

    temp = weather.get("temperature", 28)
    humidity = weather.get("humidity", 50)
    wind = weather.get("wind_speed", 0)
    rain = weather.get("rain_probability", 0)

    if temp > 40:
        risk = "high_risk"
        warnings.append("Extreme heat - stay hydrated")
    elif temp > 35:
        risk = "moderate"
        warnings.append("High temperature")

    if wind > 50:
        risk = "high_risk"
        warnings.append("Strong winds")
    elif wind > 30:
        risk = "moderate" if risk == "safe" else risk
        warnings.append("Gusty winds")

    if rain > 70:
        risk = "high_risk"
        warnings.append("Heavy rain expected")
    elif rain > 40:
        risk = "moderate" if risk == "safe" else risk
        warnings.append("Rain possible - carry umbrella")

    return {
        "risk_level": risk,
        "warnings": warnings,
        "weather": weather,
        "recommendation": "Safe to travel" if risk == "safe" else "Exercise caution while traveling",
    }
