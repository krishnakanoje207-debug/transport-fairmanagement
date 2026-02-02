from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from app.models.user_model import User, UserRole, Gender, NotificationPreferences
from app.config.security import Security
from app.config.settings import settings
from app.middleware.auth_middleware import get_current_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Request/Response Models
class RegisterRequest(BaseModel):
    email: EmailStr
    phone: str
    password: str
    first_name: str
    last_name: str
    is_guardian: bool = False

class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """Register a new user"""
    
    # Check if email already exists
    existing_user = await User.find_one(User.email == request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if phone already exists
    existing_phone = await User.find_one(User.phone == request.phone)
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Validate password strength
    is_strong, message = Security.validate_password_strength(request.password)
    if not is_strong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Hash password
    password_hash = Security.hash_password(request.password)
    
    # Determine roles
    roles = [UserRole.NORMAL_USER]
    if request.is_guardian:
        roles.append(UserRole.GUARDIAN)
    
    # Create user
    user = User(
        email=request.email,
        phone=request.phone,
        password_hash=password_hash,
        first_name=request.first_name,
        last_name=request.last_name,
        roles=roles,
        is_guardian=request.is_guardian,
        is_active=True,
        notification_preferences=NotificationPreferences()
    )
    
    await user.insert()
    logger.info(f"New user registered: {user.email}")
    
    # Generate tokens
    access_token = Security.create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    refresh_token = Security.create_refresh_token(
        data={"sub": str(user.id)}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "roles": [role.value for role in user.roles],
            "is_guardian": user.is_guardian
        }
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login user"""
    
    # Find user by email or phone
    user = None
    if request.email:
        user = await User.find_one(User.email == request.email)
    elif request.phone:
        user = await User.find_one(User.phone == request.phone)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or phone number required"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if account is locked
    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account locked until {user.locked_until}. Too many failed login attempts."
        )
    
    # Verify password
    if not Security.verify_password(request.password, user.password_hash):
        # Increment login attempts
        user.login_attempts += 1
        
        if user.login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            user.locked_until = datetime.utcnow() + timedelta(minutes=settings.LOCKOUT_DURATION_MINUTES)
            await user.save()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Too many failed login attempts. Account locked temporarily."
            )
        
        await user.save()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Reset login attempts on successful login
    user.login_attempts = 0
    user.locked_until = None
    user.last_login = datetime.utcnow()
    await user.save()
    
    # Generate tokens
    access_token = Security.create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    refresh_token = Security.create_refresh_token(
        data={"sub": str(user.id)}
    )
    
    logger.info(f"User logged in: {user.email}")
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "roles": [role.value for role in user.roles],
            "is_guardian": user.is_guardian
        }
    )

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user)
):
    """Change user password"""
    
    # Verify current password
    if not Security.verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password strength
    is_strong, message = Security.validate_password_strength(request.new_password)
    if not is_strong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Update password
    current_user.password_hash = Security.hash_password(request.new_password)
    current_user.password_changed_at = datetime.utcnow()
    await current_user.save()
    
    logger.info(f"Password changed for user: {current_user.email}")
    
    return {"message": "Password changed successfully"}

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "phone": current_user.phone,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "roles": [role.value for role in current_user.roles],
        "is_guardian": current_user.is_guardian,
        "profile_photo_url": current_user.profile_photo_url
    }

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token"""
    try:
        payload = Security.decode_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        user = await User.get(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Generate new access token
        access_token = Security.create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token"
        )