"""
SafeRoute - Authentication Routes
Registration (guardian, linked_user, travel_partner), Login, Token refresh
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
import secrets
import string

from ..config.database import get_db
from ..config.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, verify_token_type, create_qr_token
)
from ..models.user_model import UserCreate, LinkedUserCreate, PasswordChange
from ..middleware.auth_middleware import get_current_user

router = APIRouter()


def _generate_password(length=10):
    chars = string.ascii_letters + string.digits + "!@#$"
    return ''.join(secrets.choice(chars) for _ in range(length))


def _user_response(user):
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "phone": user.get("phone", ""),
        "role": user.get("role", "guardian"),
        "date_of_birth": user.get("date_of_birth"),
        "gender": user.get("gender"),
        "address": user.get("address"),
        "blood_group": user.get("blood_group"),
        "emergency_contact": user.get("emergency_contact"),
        "special_notes": user.get("special_notes"),
        "profile_photo": user.get("profile_photo"),
        "is_active": user.get("is_active", True),
        "guardian_id": user.get("guardian_id"),
        "relation": user.get("relation"),
        "company_name": user.get("company_name"),
        "created_at": user.get("created_at"),
    }


@router.post("/register", status_code=201)
async def register(user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Register a new guardian or travel partner"""
    try:
        existing = await db.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(400, "Email already registered")

        user_dict = user_data.dict(exclude={"password"})
        if user_dict.get("date_of_birth"):
            from datetime import time as t
            dob = user_dict["date_of_birth"]
            user_dict["date_of_birth"] = datetime.combine(dob, t.min) if hasattr(dob, 'year') else dob

        user_dict.update({
            "hashed_password": hash_password(user_data.password),
            "is_active": True,
            "profile_photo": None,
            "settings": {
                "tracking_enabled": True,
                "sos_enabled": True,
                "notifications_enabled": True,
                "language": "en",
                "distance_alert_meters": 300
            },
            "linked_user_ids": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login": None,
        })

        # If travel partner, store company info
        if user_data.role == "travel_partner":
            user_dict["company_name"] = user_data.company_name or ""
            user_dict["company_registration"] = user_data.company_registration or ""

        result = await db.users.insert_one(user_dict)

        # If travel partner, create partner profile
        if user_data.role == "travel_partner":
            await db.travel_partners.insert_one({
                "user_id": str(result.inserted_id),
                "company_name": user_data.company_name or "",
                "registration_number": user_data.company_registration or "",
                "routes": [],
                "vehicle_count": 0,
                "is_verified": False,
                "created_at": datetime.utcnow(),
            })

        return {
            "message": "Registration successful",
            "user_id": str(result.inserted_id),
            "email": user_data.email,
            "role": user_data.role,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Registration failed: {str(e)}")


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Login for any user role"""
    try:
        user = await db.users.find_one({"email": form_data.username})
        if not user:
            raise HTTPException(401, "Incorrect email or password")
        if not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(401, "Incorrect email or password")
        if not user.get("is_active", True):
            raise HTTPException(403, "Account is inactive")

        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        uid = str(user["_id"])
        role = user.get("role", "guardian")
        access_token = create_access_token({"sub": uid, "role": role})
        refresh_token = create_refresh_token({"sub": uid, "role": role})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": _user_response(user),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Login failed: {str(e)}")


@router.post("/linked-user/create")
async def create_linked_user(
    data: LinkedUserCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Guardian creates a linked user with auto-generated credentials"""
    if current_user.get("role") not in ["guardian", "admin"]:
        raise HTTPException(403, "Only guardians can create linked users")

    # Generate email and password for linked user
    guardian_email = current_user["email"]
    base = guardian_email.split("@")[0]
    linked_email = f"{base}.linked.{data.first_name.lower()}@saferoute.local"
    linked_password = _generate_password()

    # Check if already exists
    existing = await db.users.find_one({"email": linked_email})
    if existing:
        # Append random suffix
        linked_email = f"{base}.linked.{data.first_name.lower()}.{secrets.token_hex(3)}@saferoute.local"

    user_dict = {
        "email": linked_email,
        "first_name": data.first_name,
        "last_name": data.last_name,
        "phone": data.phone or current_user.get("phone", ""),
        "hashed_password": hash_password(linked_password),
        "role": "linked_user",
        "guardian_id": current_user["id"],
        "relation": data.relation,
        "date_of_birth": datetime.combine(data.date_of_birth, datetime.min.time()) if data.date_of_birth else None,
        "gender": data.gender,
        "blood_group": data.blood_group,
        "special_notes": data.special_notes,
        "is_active": True,
        "profile_photo": None,
        "settings": {"tracking_enabled": True, "sos_enabled": True, "language": "en"},
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.users.insert_one(user_dict)
    linked_id = str(result.inserted_id)

    # Add to guardian's linked_user_ids
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$addToSet": {"linked_user_ids": linked_id}}
    )

    # Generate QR token for linked user login
    qr_token = create_qr_token({"sub": linked_id, "type": "linked_login", "guardian": current_user["id"]})

    return {
        "message": "Linked user created",
        "linked_user": {
            "id": linked_id,
            "name": f"{data.first_name} {data.last_name}",
            "email": linked_email,
            "password": linked_password,  # Show once to guardian
            "relation": data.relation,
        },
        "qr_login_token": qr_token,
    }


@router.post("/linked-user/qr-login")
async def qr_login(token: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Linked user logs in by scanning QR code"""
    try:
        payload = decode_token(token)
        if payload.get("type") != "qr":
            raise HTTPException(400, "Invalid QR token")
        user_id = payload.get("sub")
        user = await db.users.find_one({"_id": ObjectId(user_id), "role": "linked_user"})
        if not user:
            raise HTTPException(404, "Linked user not found")

        uid = str(user["_id"])
        access_token = create_access_token({"sub": uid, "role": "linked_user"})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": _user_response(user),
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "Invalid or expired QR code")


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    current_user.pop("hashed_password", None)
    current_user.pop("_id", None)
    return current_user


@router.post("/refresh")
async def refresh(refresh_token: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        payload = decode_token(refresh_token)
        verify_token_type(payload, "refresh")
        uid = payload.get("sub")
        user = await db.users.find_one({"_id": ObjectId(uid)})
        if not user:
            raise HTTPException(401, "User not found")
        new_token = create_access_token({"sub": uid, "role": user.get("role", "guardian")})
        return {"access_token": new_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Invalid refresh token")


@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    if not verify_password(data.current_password, user["hashed_password"]):
        raise HTTPException(400, "Current password is incorrect")
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"hashed_password": hash_password(data.new_password), "updated_at": datetime.utcnow()}}
    )
    return {"message": "Password changed successfully"}
