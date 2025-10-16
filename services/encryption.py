import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import secrets

class EncryptionService:
    """Service for encrypting and decrypting sensitive data"""
    
    def __init__(self):
        self.master_key = os.environ.get('ENCRYPTION_MASTER_KEY')
        if not self.master_key:
            # Generate a new key if not provided (for development)
            self.master_key = Fernet.generate_key()
            print("WARNING: Using generated encryption key. Set ENCRYPTION_MASTER_KEY in production!")
        else:
            self.master_key = self.master_key.encode()
    
    def _get_fernet_key(self, salt: bytes = None) -> Fernet:
        """Get Fernet encryption key from master key"""
        if salt is None:
            salt = b'credit_card_salt'  # Use a fixed salt for consistency
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.master_key))
        return Fernet(key)
    
    def encrypt_card_number(self, card_number: str) -> str:
        """Encrypt credit card number"""
        try:
            # Remove any non-digit characters
            clean_number = ''.join(filter(str.isdigit, card_number))
            
            # Add padding to make it less obvious
            padded_number = clean_number.ljust(16, '0')
            
            fernet = self._get_fernet_key()
            encrypted = fernet.encrypt(padded_number.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            raise ValueError(f"Failed to encrypt card number: {str(e)}")
    
    def decrypt_card_number(self, encrypted_card: str) -> str:
        """Decrypt credit card number"""
        try:
            fernet = self._get_fernet_key()
            encrypted_data = base64.urlsafe_b64decode(encrypted_card.encode())
            decrypted = fernet.decrypt(encrypted_data).decode()
            
            # Remove padding
            return decrypted.rstrip('0')
        except Exception as e:
            raise ValueError(f"Failed to decrypt card number: {str(e)}")
    
    def encrypt_cvv(self, cvv: str) -> str:
        """Encrypt CVV"""
        try:
            fernet = self._get_fernet_key()
            encrypted = fernet.encrypt(cvv.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            raise ValueError(f"Failed to encrypt CVV: {str(e)}")
    
    def decrypt_cvv(self, encrypted_cvv: str) -> str:
        """Decrypt CVV"""
        try:
            fernet = self._get_fernet_key()
            encrypted_data = base64.urlsafe_b64decode(encrypted_cvv.encode())
            return fernet.decrypt(encrypted_data).decode()
        except Exception as e:
            raise ValueError(f"Failed to decrypt CVV: {str(e)}")
    
    def encrypt_pin(self, pin: str) -> str:
        """Encrypt PIN"""
        try:
            fernet = self._get_fernet_key()
            encrypted = fernet.encrypt(pin.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            raise ValueError(f"Failed to encrypt PIN: {str(e)}")
    
    def decrypt_pin(self, encrypted_pin: str) -> str:
        """Decrypt PIN"""
        try:
            fernet = self._get_fernet_key()
            encrypted_data = base64.urlsafe_b64decode(encrypted_pin.encode())
            return fernet.decrypt(encrypted_data).decode()
        except Exception as e:
            raise ValueError(f"Failed to decrypt PIN: {str(e)}")
    
    def encrypt_sensitive_field(self, data: str) -> str:
        """Encrypt any sensitive field"""
        try:
            fernet = self._get_fernet_key()
            encrypted = fernet.encrypt(data.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            raise ValueError(f"Failed to encrypt sensitive data: {str(e)}")
    
    def decrypt_sensitive_field(self, encrypted_data: str) -> str:
        """Decrypt any sensitive field"""
        try:
            fernet = self._get_fernet_key()
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
            return fernet.decrypt(encrypted_bytes).decode()
        except Exception as e:
            raise ValueError(f"Failed to decrypt sensitive data: {str(e)}")
    
    def mask_card_number(self, card_number: str) -> str:
        """Mask card number for display (e.g., 1234-****-****-5678)"""
        if len(card_number) < 4:
            return "****"
        
        # Remove any non-digit characters
        clean_number = ''.join(filter(str.isdigit, card_number))
        
        if len(clean_number) < 4:
            return "****"
        
        # Show first 4 and last 4 digits
        if len(clean_number) <= 8:
            return f"{clean_number[:2]}**{clean_number[-2:]}"
        else:
            return f"{clean_number[:4]}-****-****-{clean_number[-4:]}"
    
    def mask_cvv(self) -> str:
        """Return masked CVV"""
        return "***"
    
    def mask_pin(self) -> str:
        """Return masked PIN"""
        return "****"
    
    def generate_secure_token(self, length: int = 32) -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(length)
    
    def hash_password(self, password: str) -> str:
        """Hash password using PBKDF2"""
        salt = secrets.token_bytes(32)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return f"{base64.urlsafe_b64encode(salt).decode()}:{key.decode()}"
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        try:
            salt_b64, key_b64 = hashed_password.split(':')
            salt = base64.urlsafe_b64decode(salt_b64.encode())
            stored_key = key_b64.encode()
            
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
                backend=default_backend()
            )
            derived_key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
            return derived_key == stored_key
        except Exception:
            return False

# Global encryption service instance
encryption_service = EncryptionService()

def encrypt_card_number(card_number: str) -> str:
    """Encrypt credit card number"""
    return encryption_service.encrypt_card_number(card_number)

def decrypt_card_number(encrypted_card: str) -> str:
    """Decrypt credit card number"""
    return encryption_service.decrypt_card_number(encrypted_card)

def encrypt_cvv(cvv: str) -> str:
    """Encrypt CVV"""
    return encryption_service.encrypt_cvv(cvv)

def decrypt_cvv(encrypted_cvv: str) -> str:
    """Decrypt CVV"""
    return encryption_service.decrypt_cvv(encrypted_cvv)

def encrypt_pin(pin: str) -> str:
    """Encrypt PIN"""
    return encryption_service.encrypt_pin(pin)

def decrypt_pin(encrypted_pin: str) -> str:
    """Decrypt PIN"""
    return encryption_service.decrypt_pin(encrypted_pin)

def mask_card_number(card_number: str) -> str:
    """Mask card number for display"""
    return encryption_service.mask_card_number(card_number)

def mask_cvv() -> str:
    """Return masked CVV"""
    return encryption_service.mask_cvv()

def mask_pin() -> str:
    """Return masked PIN"""
    return encryption_service.mask_pin()
