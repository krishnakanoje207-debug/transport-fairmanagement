"""
SafeRoute - Places Routes
Location autocomplete using free Nominatim (OpenStreetMap) API
"""
from fastapi import APIRouter
import httpx

router = APIRouter()

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "SafeRoute/2.0 (student-project)"}

# Popular locations in Gwalior for instant suggestions
DEFAULT_SUGGESTIONS = [
    {"name": "MITS-DU, Gwalior", "lat": 26.2183, "lng": 78.1828},
    {"name": "Gwalior Railway Station", "lat": 26.2124, "lng": 78.1772},
    {"name": "Gwalior Bus Stand", "lat": 26.2088, "lng": 78.1739},
    {"name": "Gwalior Fort", "lat": 26.2313, "lng": 78.1695},
    {"name": "Jayendraganj, Gwalior", "lat": 26.2150, "lng": 78.1800},
    {"name": "Phool Bagh, Gwalior", "lat": 26.2090, "lng": 78.1760},
    {"name": "Lashkar, Gwalior", "lat": 26.2080, "lng": 78.1780},
    {"name": "City Center Mall, Gwalior", "lat": 26.2200, "lng": 78.1900},
    {"name": "Maharani Laxmi Bai Station", "lat": 26.2125, "lng": 78.1770},
    {"name": "Tansen Nagar, Gwalior", "lat": 26.2250, "lng": 78.1850},
]


@router.get("/autocomplete")
async def autocomplete(q: str, limit: int = 8):
    """Location autocomplete - uses Nominatim (free) with local fallback"""
    if not q or len(q) < 2:
        return {"suggestions": DEFAULT_SUGGESTIONS[:5]}

    # First check local suggestions
    local = [s for s in DEFAULT_SUGGESTIONS if q.lower() in s["name"].lower()]

    # Then try Nominatim
    remote = []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                NOMINATIM_URL,
                params={
                    "q": f"{q}, Gwalior, India",
                    "format": "json",
                    "limit": limit,
                    "addressdetails": 1,
                },
                headers=HEADERS,
                timeout=5,
            )
            if resp.status_code == 200:
                for item in resp.json():
                    remote.append({
                        "name": item.get("display_name", "")[:80],
                        "lat": float(item["lat"]),
                        "lng": float(item["lon"]),
                    })
    except Exception:
        pass

    # Merge local first, then remote
    seen = set()
    results = []
    for s in local + remote:
        key = s["name"][:30].lower()
        if key not in seen:
            seen.add(key)
            results.append(s)
        if len(results) >= limit:
            break

    return {"suggestions": results or DEFAULT_SUGGESTIONS[:5]}


@router.get("/geocode")
async def geocode(address: str):
    """Geocode an address to lat/lng"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                NOMINATIM_URL,
                params={"q": address, "format": "json", "limit": 1},
                headers=HEADERS,
                timeout=5,
            )
            if resp.status_code == 200 and resp.json():
                item = resp.json()[0]
                return {
                    "address": item.get("display_name"),
                    "lat": float(item["lat"]),
                    "lng": float(item["lon"]),
                }
    except Exception:
        pass
    return {"address": address, "lat": 26.2183, "lng": 78.1828}


@router.get("/reverse")
async def reverse_geocode(lat: float, lng: float):
    """Reverse geocode lat/lng to address"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={"lat": lat, "lon": lng, "format": "json"},
                headers=HEADERS,
                timeout=5,
            )
            if resp.status_code == 200:
                data = resp.json()
                return {"address": data.get("display_name", "Unknown")}
    except Exception:
        pass
    return {"address": "Unknown location"}
