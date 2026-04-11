"""SafeRoute - Notification Service"""
from datetime import datetime


async def create_notification(db, user_id: str, msg_type: str, message: str, color: str = "#3a5fc8"):
    await db.notifications.insert_one({
        "user_id": user_id,
        "type": msg_type,
        "message": message,
        "color": color,
        "read": False,
        "created_at": datetime.utcnow(),
    })


NOTIFICATION_TEMPLATES = {
    "trip_created": {"en": "Trip to {dest} booked! Fare: ₹{fare}", "hi": "{dest} की यात्रा बुक! किराया: ₹{fare}"},
    "trip_started": {"en": "{name}'s trip has started!", "hi": "{name} की यात्रा शुरू हो गई!"},
    "sos": {"en": "🆘 SOS! {name} triggered emergency!", "hi": "🆘 SOS! {name} ने आपातकाल सक्रिय किया!"},
    "distance_alert": {"en": "⚠️ {name} is {distance}m from vehicle!", "hi": "⚠️ {name} वाहन से {distance}m दूर!"},
}


def get_notification_text(template_key: str, lang: str = "en", **kwargs) -> str:
    template = NOTIFICATION_TEMPLATES.get(template_key, {})
    text = template.get(lang, template.get("en", "Notification"))
    return text.format(**kwargs)
