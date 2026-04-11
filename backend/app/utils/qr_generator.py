"""
QR Code Generator Utility
Generates QR codes for payment and trip verification
"""
import qrcode
from qrcode.image.pil import PilImage
from io import BytesIO
import base64
from datetime import datetime, timedelta
from typing import Tuple, Optional
import secrets
import hashlib


class QRGenerator:
    """QR code generation and management"""
    
    @staticmethod
    def generate_unique_code(prefix: str = "") -> str:
        """
        Generate unique QR code string
        
        Args:
            prefix: Optional prefix for the code
        
        Returns:
            Unique code string
        """
        timestamp = datetime.utcnow().isoformat()
        random_part = secrets.token_urlsafe(16)
        
        # Create hash for uniqueness
        hash_input = f"{prefix}{timestamp}{random_part}".encode()
        code_hash = hashlib.sha256(hash_input).hexdigest()[:16]
        
        return f"{prefix}{code_hash}" if prefix else code_hash
    
    @staticmethod
    def create_qr_code(data: str, size: int = 10) -> str:
        """
        Generate QR code image and return as base64 string
        
        Args:
            data: Data to encode in QR code
            size: QR code size (1-40, default 10)
        
        Returns:
            Base64 encoded PNG image string
        """
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=size,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    @staticmethod
    def generate_payment_qr(trip_id: str, amount: float = 0.0) -> Tuple[str, str]:
        """
        Generate payment QR code
        
        Args:
            trip_id: Trip ID
            amount: Payment amount (optional)
        
        Returns:
            Tuple of (code_string, qr_image_base64)
        """
        code = QRGenerator.generate_unique_code("PAY_")
        
        # Create payment data (UPI format for Indian payments)
        # Format: saferoute://payment/{code}/{trip_id}
        data = f"saferoute://payment/{code}/{trip_id}"
        if amount > 0:
            data += f"?amount={amount:.2f}"
        
        qr_image = QRGenerator.create_qr_code(data)
        
        return code, qr_image
    
    @staticmethod
    def generate_verification_qr(trip_id: str, user_id: str) -> Tuple[str, str]:
        """
        Generate trip verification QR code
        
        Args:
            trip_id: Trip ID
            user_id: User ID
        
        Returns:
            Tuple of (code_string, qr_image_base64)
        """
        code = QRGenerator.generate_unique_code("VERIFY_")
        
        # Create verification data
        # Format: saferoute://verify/{code}/{trip_id}/{user_id}
        data = f"saferoute://verify/{code}/{trip_id}/{user_id}"
        
        qr_image = QRGenerator.create_qr_code(data)
        
        return code, qr_image
    
    @staticmethod
    def validate_qr_code(code: str, expected_prefix: str = "") -> bool:
        """
        Validate QR code format
        
        Args:
            code: QR code string to validate
            expected_prefix: Expected prefix (PAY_ or VERIFY_)
        
        Returns:
            True if valid, False otherwise
        """
        if expected_prefix and not code.startswith(expected_prefix):
            return False
        
        # Check length (minimum)
        if len(code) < 10:
            return False
        
        return True
    
    @staticmethod
    def parse_qr_data(qr_string: str) -> dict:
        """
        Parse QR code data
        
        Args:
            qr_string: QR code data string
        
        Returns:
            Parsed data as dictionary
        """
        try:
            # Handle saferoute:// URLs
            if qr_string.startswith("saferoute://"):
                parts = qr_string.replace("saferoute://", "").split("/")
                
                result = {
                    "type": parts[0] if len(parts) > 0 else None,
                    "code": parts[1] if len(parts) > 1 else None,
                    "trip_id": parts[2] if len(parts) > 2 else None,
                }
                
                # Add user_id for verification QR
                if len(parts) > 3:
                    result["user_id"] = parts[3]
                
                # Parse query params for amount
                if "?" in qr_string:
                    query = qr_string.split("?")[1]
                    params = dict(param.split("=") for param in query.split("&"))
                    result.update(params)
                
                return result
            
            return {"raw": qr_string}
        
        except Exception:
            return {"raw": qr_string}


# Convenience functions
def generate_payment_qr(trip_id: str, amount: float = 0.0) -> Tuple[str, str]:
    """Generate payment QR code"""
    return QRGenerator.generate_payment_qr(trip_id, amount)


def generate_verification_qr(trip_id: str, user_id: str) -> Tuple[str, str]:
    """Generate verification QR code"""
    return QRGenerator.generate_verification_qr(trip_id, user_id)


def validate_qr_code(code: str, prefix: str = "") -> bool:
    """Validate QR code"""
    return QRGenerator.validate_qr_code(code, prefix)


def parse_qr_data(qr_string: str) -> dict:
    """Parse QR data"""
    return QRGenerator.parse_qr_data(qr_string)
