from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.config.security import Security
from app.models.user_model import User, UserRole
from datetime import datetime

security = HTTPBearer()

class AuthMiddleware:
    @staticmethod
    async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> User:
        """Get current authenticated user from JWT token"""
        token = credentials.credentials
        
        try:
            payload = Security.decode_token(token)
            user_id = payload.get("sub")
            
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials"
                )
            
            user = await User.get(user_id)
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is inactive"
                )
            
            # Check if account is locked
            if user.locked_until and user.locked_until > datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is temporarily locked due to too many failed login attempts"
                )
            
            return user
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    
    @staticmethod
    async def get_optional_user(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
    ) -> Optional[User]:
        """Get current user if token is provided, otherwise return None"""
        if not credentials:
            return None
        
        try:
            return await AuthMiddleware.get_current_user(credentials)
        except:
            return None
    
    @staticmethod
    def require_roles(required_roles: list[UserRole]):
        """Dependency to check if user has required roles"""
        async def role_checker(user: User = Depends(AuthMiddleware.get_current_user)) -> User:
            user_roles = set(user.roles)
            required_roles_set = set(required_roles)
            
            if not user_roles.intersection(required_roles_set):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"User does not have required role(s): {', '.join([r.value for r in required_roles])}"
                )
            
            return user
        
        return role_checker
    
    @staticmethod
    async def require_guardian(user: User = Depends(get_current_user)) -> User:
        """Dependency to ensure user is a guardian"""
        if UserRole.GUARDIAN not in user.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Guardian role required"
            )
        return user
    
    @staticmethod
    async def require_driver(user: User = Depends(get_current_user)) -> User:
        """Dependency to ensure user is a driver"""
        if UserRole.DRIVER not in user.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Driver role required"
            )
        return user

# Convenience function for getting current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    return await AuthMiddleware.get_current_user(credentials)