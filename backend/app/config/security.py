from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.config.settings import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Security:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: Dict) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> Dict:
        """Decode and verify JWT token"""
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            return payload
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """Validate password strength"""
        if len(password) < settings.PASSWORD_MIN_LENGTH:
            return False, f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long"
        
        if not any(char.isupper() for char in password):
            return False, "Password must contain at least one uppercase letter"
        
        if not any(char.islower() for char in password):
            return False, "Password must contain at least one lowercase letter"
        
        if not any(char.isdigit() for char in password):
            return False, "Password must contain at least one digit"
        
        if not any(char in "!@#$%^&*()_+-=[]{}|;:,.<>?" for char in password):
            return False, "Password must contain at least one special character"
        
        return True, "Password is strong"
    
    @staticmethod
    def get_password_strength_score(password: str) -> int:
        """Calculate password strength score (0-100)"""
        score = 0
        
        # Length score
        if len(password) >= 8:
            score += 20
        if len(password) >= 12:
            score += 10
        if len(password) >= 16:
            score += 10
        
        # Character type scores
        if any(char.isupper() for char in password):
            score += 15
        if any(char.islower() for char in password):
            score += 15
        if any(char.isdigit() for char in password):
            score += 15
        if any(char in "!@#$%^&*()_+-=[]{}|;:,.<>?" for char in password):
            score += 15
        
        return min(score, 100)