"""
SafeRoute - Peak Hour Routes
Traffic analysis with real NewsAPI integration
"""
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..config.database import get_db
from ..config.settings import settings
from ..middleware.auth_middleware import get_optional_user
import httpx
from datetime import datetime

router = APIRouter()

# Default peak hour pattern (Gwalior)
DEFAULT_HOURLY = [
    {"hour": h, "traffic_score": s, "risk_level": r}
    for h, s, r in [
        (0, 5, "safe"), (1, 3, "safe"), (2, 2, "safe"), (3, 2, "safe"),
        (4, 5, "safe"), (5, 15, "safe"), (6, 30, "safe"),
        (7, 65, "moderate"), (8, 85, "high_risk"), (9, 90, "high_risk"),
        (10, 60, "moderate"), (11, 45, "safe"), (12, 50, "moderate"),
        (13, 45, "safe"), (14, 40, "safe"), (15, 45, "safe"),
        (16, 60, "moderate"), (17, 80, "high_risk"), (18, 85, "high_risk"),
        (19, 70, "moderate"), (20, 50, "moderate"), (21, 35, "safe"),
        (22, 20, "safe"), (23, 10, "safe"),
    ]
]


async def fetch_news():
    """Fetch traffic/transport news from NewsAPI (free tier)"""
    if not settings.NEWS_API_KEY:
        return [
            {"title": "Gwalior traffic congestion reported on Highway 3", "source": "Local News", "url": "#"},
            {"title": "New bus route added: MITS to Railway Station", "source": "Transport Dept", "url": "#"},
            {"title": "Peak hour advisory: Avoid Jayendraganj area 5-7 PM", "source": "Traffic Police", "url": "#"},
        ]

    try:
        async with httpx.AsyncClient() as client:
            url = f"https://newsapi.org/v2/everything?q=india+traffic+transport&language=en&pageSize=5&apiKey={settings.NEWS_API_KEY}"
            resp = await client.get(url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                return [
                    {
                        "title": a["title"],
                        "description": a.get("description", ""),
                        "source": a["source"]["name"],
                        "url": a.get("url", "#"),
                        "published_at": a.get("publishedAt"),
                    }
                    for a in data.get("articles", [])[:5]
                ]
    except Exception:
        pass

    return [{"title": "No news available", "source": "System", "url": "#"}]


@router.get("/analysis")
async def get_peak_hour_analysis(
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get peak hour traffic analysis with news"""
    now = datetime.now()
    current_hour = now.hour

    # Try to build from real trip data
    hourly = list(DEFAULT_HOURLY)

    # Overlay with actual trip counts
    pipeline = [
        {"$match": {"status": {"$in": ["active", "completed"]}}},
        {"$group": {"_id": {"$hour": "$created_at"}, "count": {"$sum": 1}}},
    ]
    try:
        agg = await db.trips.aggregate(pipeline).to_list(24)
        trip_counts = {item["_id"]: item["count"] for item in agg}
        for h in hourly:
            if h["hour"] in trip_counts:
                h["trip_count"] = trip_counts[h["hour"]]
    except Exception:
        pass

    current = hourly[current_hour]
    risk = current["risk_level"]
    if risk == "high_risk":
        rec = "Heavy traffic expected. Consider delaying your trip by 30-60 minutes."
    elif risk == "moderate":
        rec = "Moderate traffic. Allow extra travel time."
    else:
        rec = "Traffic is light. Good time to travel!"

    news = await fetch_news()

    return {
        "hourly_data": hourly,
        "current_hour": current_hour,
        "current_risk": risk,
        "current_score": current["traffic_score"],
        "recommendation": rec,
        "news_headlines": news,
        "best_time": "10:00 AM - 3:00 PM",
    }


@router.get("/recommendation")
async def get_time_recommendation(
    from_location: str = "MITS",
    to_location: str = "Railway Station",
):
    """Get best time to travel recommendation"""
    now = datetime.now()
    hour = now.hour

    # Find next safe window
    safe_hours = [h for h in DEFAULT_HOURLY if h["risk_level"] == "safe" and h["hour"] >= hour]
    if not safe_hours:
        safe_hours = [h for h in DEFAULT_HOURLY if h["risk_level"] == "safe"]

    next_safe = safe_hours[0] if safe_hours else {"hour": 10}

    return {
        "from": from_location,
        "to": to_location,
        "current_risk": DEFAULT_HOURLY[hour]["risk_level"],
        "best_departure": f"{next_safe['hour']:02d}:00",
        "estimated_travel_time": "25 min" if DEFAULT_HOURLY[hour]["risk_level"] == "safe" else "40 min",
    }
