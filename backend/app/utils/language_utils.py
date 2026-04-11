"""
Language Utilities
Multi-language support for English and Hindi
"""
from typing import Dict, Optional
from enum import Enum


class Language(str, Enum):
    """Supported languages"""
    ENGLISH = "en"
    HINDI = "hi"


class LanguageUtils:
    """Language translation and formatting utilities"""
    
    # Translation dictionary
    TRANSLATIONS = {
        # Common terms
        "welcome": {"en": "Welcome", "hi": "स्वागत है"},
        "dashboard": {"en": "Dashboard", "hi": "डैशबोर्ड"},
        "settings": {"en": "Settings", "hi": "सेटिंग्स"},
        "profile": {"en": "Profile", "hi": "प्रोफ़ाइल"},
        "logout": {"en": "Logout", "hi": "लॉग आउट"},
        
        # Trip related
        "trip": {"en": "Trip", "hi": "यात्रा"},
        "book_trip": {"en": "Book Trip", "hi": "यात्रा बुक करें"},
        "active_trip": {"en": "Active Trip", "hi": "सक्रिय यात्रा"},
        "trip_started": {"en": "Trip Started", "hi": "यात्रा शुरू"},
        "trip_ended": {"en": "Trip Ended", "hi": "यात्रा समाप्त"},
        
        # Transport
        "bus": {"en": "Bus", "hi": "बस"},
        "auto": {"en": "Auto", "hi": "ऑटो"},
        "cab": {"en": "Cab", "hi": "कैब"},
        
        # Locations
        "pickup_location": {"en": "Pickup Location", "hi": "पिकअप स्थान"},
        "drop_location": {"en": "Drop Location", "hi": "ड्रॉप स्थान"},
        
        # Time slabs
        "morning_peak": {"en": "Morning Peak", "hi": "सुबह पीक"},
        "afternoon": {"en": "Afternoon", "hi": "दोपहर"},
        "evening_peak": {"en": "Evening Peak", "hi": "शाम पीक"},
        "night": {"en": "Night", "hi": "रात"},
        
        # Risk levels
        "safe": {"en": "Safe", "hi": "सुरक्षित"},
        "moderate": {"en": "Moderate", "hi": "मध्यम"},
        "high_risk": {"en": "High Risk", "hi": "उच्च जोखिम"},
        
        # SOS and alerts
        "sos": {"en": "SOS", "hi": "SOS"},
        "sos_triggered": {"en": "SOS Triggered", "hi": "SOS सक्रिय"},
        "emergency": {"en": "Emergency", "hi": "आपातकाल"},
        "alert": {"en": "Alert", "hi": "अलर्ट"},
        
        # Weather
        "weather": {"en": "Weather", "hi": "मौसम"},
        "rain": {"en": "Rain", "hi": "बारिश"},
        "fog": {"en": "Fog", "hi": "कोहरा"},
        "clear": {"en": "Clear", "hi": "साफ"},
        
        # Notifications
        "notification": {"en": "Notification", "hi": "सूचना"},
        "qr_scanned": {"en": "QR Scanned", "hi": "QR स्कैन किया"},
        "payment_confirmed": {"en": "Payment Confirmed", "hi": "भुगतान की पुष्टि"},
        "distance_alert": {"en": "Distance Alert", "hi": "दूरी अलर्ट"},
        
        # Guardian mode
        "guardian_mode": {"en": "Guardian Mode", "hi": "अभिभावक मोड"},
        "normal_user": {"en": "Normal User", "hi": "सामान्य उपयोगकर्ता"},
        "linked_users": {"en": "Linked Users", "hi": "लिंक्ड उपयोगकर्ता"},
        
        # Status
        "pending": {"en": "Pending", "hi": "लंबित"},
        "active": {"en": "Active", "hi": "सक्रिय"},
        "completed": {"en": "Completed", "hi": "पूर्ण"},
        "cancelled": {"en": "Cancelled", "hi": "रद्द"},
        
        # Actions
        "save": {"en": "Save", "hi": "सहेजें"},
        "cancel": {"en": "Cancel", "hi": "रद्द करें"},
        "delete": {"en": "Delete", "hi": "हटाएं"},
        "edit": {"en": "Edit", "hi": "संपादित करें"},
        "confirm": {"en": "Confirm", "hi": "पुष्टि करें"},
    }
    
    @staticmethod
    def translate(key: str, language: str = "en") -> str:
        """
        Translate a key to specified language
        
        Args:
            key: Translation key
            language: Target language code ('en' or 'hi')
        
        Returns:
            Translated string (or key if not found)
        """
        translations = LanguageUtils.TRANSLATIONS.get(key, {})
        return translations.get(language, key)
    
    @staticmethod
    def get_language_name(code: str) -> str:
        """
        Get language name from code
        
        Args:
            code: Language code ('en' or 'hi')
        
        Returns:
            Language name
        """
        names = {
            "en": "English",
            "hi": "हिंदी"
        }
        return names.get(code, "Unknown")
    
    @staticmethod
    def format_notification_message(
        message_type: str,
        language: str = "en",
        **kwargs
    ) -> str:
        """
        Format notification message in specified language
        
        Args:
            message_type: Type of notification
            language: Target language
            **kwargs: Additional parameters for message formatting
        
        Returns:
            Formatted notification message
        """
        templates = {
            "trip_started": {
                "en": "Your trip has started. Safe travels!",
                "hi": "आपकी यात्रा शुरू हो गई है। सुरक्षित यात्रा!"
            },
            "trip_ended": {
                "en": "Your trip has ended. Thank you for using SafeRoute.",
                "hi": "आपकी यात्रा समाप्त हो गई है। SafeRoute का उपयोग करने के लिए धन्यवाद।"
            },
            "qr_scanned": {
                "en": "QR code verified. Trip tracking activated.",
                "hi": "QR कोड सत्यापित। यात्रा ट्रैकिंग सक्रिय।"
            },
            "sos_triggered": {
                "en": "⚠️ SOS ALERT! Emergency assistance requested.",
                "hi": "⚠️ SOS अलर्ट! आपातकालीन सहायता का अनुरोध किया गया।"
            },
            "distance_alert": {
                "en": "⚠️ Distance alert! User is {distance}m from vehicle (limit: {limit}m)",
                "hi": "⚠️ दूरी अलर्ट! उपयोगकर्ता वाहन से {distance}m दूर है (सीमा: {limit}m)"
            },
            "weather_alert": {
                "en": "🌧 Weather alert: {condition} expected on your route.",
                "hi": "🌧 मौसम अलर्ट: आपके रास्ते पर {condition} की उम्मीद है।"
            },
            "peak_hour_warning": {
                "en": "⚠️ Peak hour traffic expected. Consider alternative time.",
                "hi": "⚠️ पीक ऑवर ट्रैफिक की उम्मीद है। वैकल्पिक समय पर विचार करें।"
            }
        }
        
        template = templates.get(message_type, {}).get(language, message_type)
        
        try:
            return template.format(**kwargs)
        except KeyError:
            return template
    
    @staticmethod
    def get_supported_languages() -> list:
        """
        Get list of supported languages
        
        Returns:
            List of language dictionaries
        """
        return [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "hi", "name": "Hindi", "native_name": "हिंदी"}
        ]


# Convenience functions
def translate(key: str, language: str = "en") -> str:
    """Translate key to language"""
    return LanguageUtils.translate(key, language)


def format_notification(message_type: str, language: str = "en", **kwargs) -> str:
    """Format notification message"""
    return LanguageUtils.format_notification_message(message_type, language, **kwargs)
