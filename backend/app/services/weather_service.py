"""SafeRoute - Weather Service"""

WEATHER_ICONS = {
    "clear": "☀️", "clouds": "☁️", "rain": "🌧", "thunderstorm": "⛈",
    "snow": "❄️", "mist": "🌫", "haze": "🌫", "fog": "🌫",
    "partly": "🌤", "default": "🌡"
}


def get_weather_icon(description: str) -> str:
    desc = description.lower()
    for key, icon in WEATHER_ICONS.items():
        if key in desc:
            return icon
    return WEATHER_ICONS["default"]
