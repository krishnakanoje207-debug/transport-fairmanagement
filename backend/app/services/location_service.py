"""SafeRoute - Location Service"""
from math import radians, cos, sin, asin, sqrt


def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in meters between two points"""
    R = 6371000
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    return R * 2 * asin(sqrt(a))


def is_within_safe_distance(lat1, lon1, lat2, lon2, limit_meters=300):
    return haversine(lat1, lon1, lat2, lon2) <= limit_meters


def get_google_maps_url(lat, lng):
    return f"https://www.google.com/maps?q={lat},{lng}"
