from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional
import logging
from app.config.settings import settings
from app.models.user_model import User, LinkedUser
from app.models.trip_model import Trip, TripLocation
from app.models.location_model import SavedLocation, VehicleLocation
from app.models.peakhour_model import PeakHourAnalysis, TrafficReport
from app.models.notification_model import Notification
from app.models.qr_model import QRCode
from app.models.sos_model import SOSAlert
from app.models.weather_model import WeatherData

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect_db(cls):
        """Initialize database connection and Beanie ODM"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            
            # Initialize Beanie with all document models
            await init_beanie(
                database=cls.client[settings.MONGODB_DB_NAME],
                document_models=[
                    User,
                    LinkedUser,
                    Trip,
                    TripLocation,
                    SavedLocation,
                    VehicleLocation,
                    PeakHourAnalysis,
                    TrafficReport,
                    Notification,
                    QRCode,
                    SOSAlert,
                    WeatherData
                ]
            )
            
            # Create unique indexes
            await cls.create_indexes()
            
            logger.info("Successfully connected to MongoDB and initialized Beanie")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    @classmethod
    async def create_indexes(cls):
        """Create unique indexes for collections"""
        try:
            # User unique indexes
            await User.get_motor_collection().create_index("email", unique=True)
            await User.get_motor_collection().create_index("phone", unique=True)
            
            # QRCode unique index
            await QRCode.get_motor_collection().create_index("qr_code", unique=True)
            
            # SOSAlert unique index
            await SOSAlert.get_motor_collection().create_index("alert_id", unique=True)
            
            logger.info("Unique indexes created successfully")
        except Exception as e:
            logger.warning(f"Index creation warning (may already exist): {e}")
    
    @classmethod
    async def close_db(cls):
        """Close database connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")
    
    @classmethod
    async def ping(cls):
        """Check database connection"""
        try:
            await cls.client.admin.command('ping')
            return True
        except Exception as e:
            logger.error(f"Database ping failed: {e}")
            return False