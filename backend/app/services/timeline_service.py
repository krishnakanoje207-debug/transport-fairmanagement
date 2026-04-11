"""SafeRoute - Timeline Service"""

TIMELINE_EVENTS = {
    "trip_created": {"icon": "📋", "color": "#3a5fc8"},
    "trip_started": {"icon": "▶️", "color": "#3dc47e"},
    "qr_scanned": {"icon": "📲", "color": "#c8a94f"},
    "trip_completed": {"icon": "✅", "color": "#3dc47e"},
    "sos_triggered": {"icon": "🆘", "color": "#e05252"},
    "location_update": {"icon": "📍", "color": "#8da0c8"},
    "distance_alert": {"icon": "⚠️", "color": "#f0a63a"},
    "weather_alert": {"icon": "🌧", "color": "#f0a63a"},
}


def get_event_style(event_type: str):
    return TIMELINE_EVENTS.get(event_type, {"icon": "📌", "color": "#8da0c8"})
