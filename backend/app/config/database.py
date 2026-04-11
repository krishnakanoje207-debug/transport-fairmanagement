"""
SafeRoute - MongoDB Database Configuration
Handles connection, collections, indexes
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from .settings import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    @classmethod
    async def connect_db(cls):
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.DATABASE_NAME]
            await cls.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {settings.DATABASE_NAME}")
            await cls.create_indexes()
            await cls.seed_admin()
        except Exception as e:
            logger.error(f"MongoDB connection failed: {e}")
            raise

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")

    @classmethod
    async def create_indexes(cls):
        try:
            # Users
            await cls.db.users.create_index("email", unique=True)
            await cls.db.users.create_index("phone")
            await cls.db.users.create_index("role")
            await cls.db.users.create_index("guardian_id")
            # Trips
            await cls.db.trips.create_index("user_id")
            await cls.db.trips.create_index("partner_id")
            await cls.db.trips.create_index("status")
            await cls.db.trips.create_index("created_at")
            await cls.db.trips.create_index([("user_id", 1), ("status", 1)])
            # Locations
            await cls.db.locations.create_index("trip_id")
            await cls.db.locations.create_index("timestamp")
            await cls.db.locations.create_index([("trip_id", 1), ("timestamp", -1)])
            # QR codes
            await cls.db.qr_codes.create_index("code", unique=True)
            await cls.db.qr_codes.create_index("trip_id")
            await cls.db.qr_codes.create_index("qr_type")
            await cls.db.qr_codes.create_index("expires_at")
            # Notifications
            await cls.db.notifications.create_index("user_id")
            await cls.db.notifications.create_index([("user_id", 1), ("created_at", -1)])
            # Travel partners
            await cls.db.travel_partners.create_index("user_id", unique=True)
            await cls.db.travel_partners.create_index("company_name")
            # Partner routes
            await cls.db.partner_routes.create_index("partner_id")
            # Messages
            await cls.db.messages.create_index("recipient_id")
            await cls.db.messages.create_index("created_at")
            # Message templates
            await cls.db.message_templates.create_index("template_name", unique=True)

            logger.info("Database indexes created")
        except Exception as e:
            logger.warning(f"Index creation warning: {e}")

    @classmethod
    async def seed_admin(cls):
        """Seed default admin user if none exists"""
        from .security import hash_password
        admin = await cls.db.users.find_one({"role": "admin"})
        if not admin:
            from datetime import datetime
            await cls.db.users.insert_one({
                "email": settings.ADMIN_EMAIL,
                "first_name": "Admin",
                "last_name": "SafeRoute",
                "phone": "+910000000000",
                "hashed_password": hash_password(settings.ADMIN_PASSWORD),
                "role": "admin",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            })
            logger.info(f"Admin user seeded: {settings.ADMIN_EMAIL}")

    @classmethod
    def get_database(cls) -> AsyncIOMotorDatabase:
        if cls.db is None:
            raise RuntimeError("Database not initialized. Call connect_db() first.")
        return cls.db


async def get_db() -> AsyncIOMotorDatabase:
    return Database.get_database()
