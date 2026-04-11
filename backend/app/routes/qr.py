"""
SafeRoute - QR Code Routes
Payment QR, Linked User QR, Tracking QR, Trip Start QR
"""
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
import hashlib

from ..config.database import get_db
from ..config.security import create_qr_token, decode_token
from ..middleware.auth_middleware import get_current_user

router = APIRouter()


@router.post("/generate/payment")
async def generate_payment_qr(
    trip_id: str,
    amount: float,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Generate a payment QR code for a trip"""
    token = create_qr_token({
        "trip_id": trip_id,
        "qr_type": "payment",
        "amount": amount,
        "user_id": current_user["id"],
    }, expires_hours=12)

    code = hashlib.sha256(token.encode()).hexdigest()[:16]
    await db.qr_codes.update_one(
        {"trip_id": trip_id, "qr_type": "payment"},
        {"$set": {
            "code": code,
            "token": token,
            "amount": amount,
            "is_used": False,
            "created_at": datetime.utcnow(),
        }},
        upsert=True
    )

    return {
        "qr_token": token,
        "code": code,
        "amount": amount,
        "payment_methods": ["UPI", "Card", "Wallet", "Cash"],
    }


@router.post("/generate/linked-user")
async def generate_linked_user_qr(
    linked_user_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Guardian generates QR for linked user login"""
    if current_user.get("role") not in ["guardian", "admin"]:
        raise HTTPException(403, "Only guardians can generate linked user QR")

    token = create_qr_token({
        "sub": linked_user_id,
        "qr_type": "linked_login",
        "guardian_id": current_user["id"],
    }, expires_hours=72)

    return {"qr_token": token, "type": "linked_login"}


@router.post("/verify")
async def verify_qr(
    token: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Verify any QR code and return its data"""
    try:
        payload = decode_token(token)
        qr_type = payload.get("qr_type", "unknown")

        if qr_type == "payment":
            trip = await db.trips.find_one({"_id": ObjectId(payload["trip_id"])})
            return {
                "valid": True,
                "type": "payment",
                "amount": payload.get("amount"),
                "trip_status": trip["status"] if trip else "unknown",
            }
        elif qr_type == "tracking":
            trip = await db.trips.find_one({"_id": ObjectId(payload["trip_id"])})
            loc = await db.locations.find_one(
                {"trip_id": payload["trip_id"]}, sort=[("timestamp", -1)]
            )
            lat = loc["latitude"] if loc else 26.2183
            lng = loc["longitude"] if loc else 78.1828
            return {
                "valid": True,
                "type": "tracking",
                "trip_id": payload["trip_id"],
                "maps_url": f"https://www.google.com/maps?q={lat},{lng}",
                "lat": lat,
                "lng": lng,
            }
        elif qr_type == "trip_start":
            return {
                "valid": True,
                "type": "trip_start",
                "trip_id": payload["trip_id"],
            }
        elif qr_type == "linked_login":
            return {
                "valid": True,
                "type": "linked_login",
                "user_id": payload.get("sub"),
            }
        else:
            return {"valid": True, "type": qr_type, "data": payload}
    except Exception:
        return {"valid": False, "error": "Invalid or expired QR code"}


@router.post("/payment/process")
async def process_payment(
    trip_id: str,
    method: str = "upi",
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Simulate payment processing"""
    trip = await db.trips.find_one({"_id": ObjectId(trip_id)})
    if not trip:
        raise HTTPException(404, "Trip not found")

    amount = trip.get("estimated_fare", 0)

    # Simulate payment
    payment = {
        "trip_id": trip_id,
        "user_id": current_user["id"],
        "amount": amount,
        "method": method,
        "status": "completed",
        "transaction_id": f"SR{hashlib.md5(f'{trip_id}{datetime.utcnow()}'.encode()).hexdigest()[:12].upper()}",
        "created_at": datetime.utcnow(),
    }
    await db.payments.insert_one(payment)

    # Mark QR as used
    await db.qr_codes.update_one(
        {"trip_id": trip_id, "qr_type": "payment"},
        {"$set": {"is_used": True}}
    )

    return {
        "message": "Payment successful (demo)",
        "transaction_id": payment["transaction_id"],
        "amount": amount,
        "method": method,
    }
