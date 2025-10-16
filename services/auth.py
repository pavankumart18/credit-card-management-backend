import os
import jwt
import re
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User

def _get_secret() -> str:
    # Try to get from Flask app config first, then environment variables
    try:
        secret = current_app.config.get('JWT_SECRET_KEY') or current_app.config.get('SECRET_KEY')
        if secret:
            return secret
    except RuntimeError:
        # Outside of app context, fall back to environment variables
        pass
    
    secret = os.environ.get('JWT_SECRET_KEY') or os.environ.get('SECRET_KEY')
    if not secret:
        raise RuntimeError('JWT secret not configured')
    return secret

def generate_token(payload: dict, expires_in_minutes: int = 60) -> str:
    exp = datetime.now(tz=timezone.utc) + timedelta(minutes=expires_in_minutes)
    to_encode = {**payload, 'exp': exp}
    return jwt.encode(to_encode, _get_secret(), algorithm='HS256')

def decode_token(token: str) -> dict:
    return jwt.decode(token, _get_secret(), algorithms=['HS256'])

def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
        token = auth_header.split(' ', 1)[1]
        try:
            claims = decode_token(token)
            request.user_claims = claims
            return fn(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    return wrapper

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = getattr(request, 'user_claims', {})
        if not claims.get('is_admin', False):
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

def manager_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = getattr(request, 'user_claims', {})
        user_role = claims.get('role', 'user')
        if user_role not in ['admin', 'manager']:
            return jsonify({'error': 'Manager access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

def validate_password_strength(password: str) -> dict:
    """Validate password strength and return validation result"""
    errors = []
    suggestions = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if len(password) > 128:
        errors.append("Password must be less than 128 characters")
    
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
        suggestions.append("Add lowercase letters")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
        suggestions.append("Add uppercase letters")
    
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one digit")
        suggestions.append("Add numbers")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")
        suggestions.append("Add special characters like !@#$%^&*")
    
    # Check for common patterns
    common_patterns = [
        r'(.)\1{2,}',  # Repeated characters (3 or more in a row)
        r'(012|234|345|456|567|678|789|890)',  # Sequential numbers (excluding 123 as it's common in passwords)
        r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)',  # Sequential letters
    ]
    
    for pattern in common_patterns:
        if re.search(pattern, password.lower()):
            errors.append("Password contains common patterns")
            suggestions.append("Avoid sequential or repeated characters")
            break
    
    # Check for common passwords
    common_passwords = [
        'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
        'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
        'master', 'hello', 'freedom', 'whatever', 'qazwsx', 'trustno1'
    ]
    
    if password.lower() in common_passwords:
        errors.append("Password is too common")
        suggestions.append("Use a unique password")
    
    is_valid = len(errors) == 0
    strength_score = _calculate_password_strength(password)
    
    return {
        'is_valid': is_valid,
        'errors': errors,
        'suggestions': suggestions,
        'strength_score': strength_score,
        'strength_level': _get_strength_level(strength_score)
    }

def _calculate_password_strength(password: str) -> int:
    """Calculate password strength score (0-100)"""
    score = 0
    
    # Length score (0-25 points)
    if len(password) >= 8:
        score += 10
    if len(password) >= 12:
        score += 10
    if len(password) >= 16:
        score += 5
    
    # Character variety (0-40 points)
    if re.search(r'[a-z]', password):
        score += 8
    if re.search(r'[A-Z]', password):
        score += 8
    if re.search(r'\d', password):
        score += 8
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 8
    if re.search(r'[^a-zA-Z0-9!@#$%^&*(),.?":{}|<>]', password):
        score += 8
    
    # Complexity bonus (0-20 points)
    if len(set(password)) >= len(password) * 0.8:  # 80% unique characters
        score += 10
    if len(password) >= 12 and not re.search(r'(.)\1{2,}', password):
        score += 10
    
    # Uniqueness bonus (0-15 points)
    if not any(common in password.lower() for common in ['password', '123', 'qwerty', 'admin']):
        score += 15
    
    return min(score, 100)

def _get_strength_level(score: int) -> str:
    """Get password strength level based on score"""
    if score >= 80:
        return 'very_strong'
    elif score >= 60:
        return 'strong'
    elif score >= 40:
        return 'moderate'
    elif score >= 20:
        return 'weak'
    else:
        return 'very_weak'

def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)

def hash_sensitive_data(data: str) -> str:
    """Hash sensitive data using SHA-256"""
    return hashlib.sha256(data.encode()).hexdigest()

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone_number(phone: str) -> bool:
    """Validate phone number format"""
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    # Check if it's a valid length (7-15 digits)
    return 7 <= len(digits_only) <= 15

def create_user_session(user_id: str, role: str = 'user') -> dict:
    """Create a user session with role information"""
    return {
        'user_id': user_id,
        'role': role,
        'session_id': generate_secure_token(),
        'created_at': datetime.utcnow().isoformat()
    }

def check_permission(user_role: str, required_role: str) -> bool:
    """Check if user has required permission level"""
    role_hierarchy = {
        'user': 1,
        'manager': 2,
        'admin': 3
    }
    
    user_level = role_hierarchy.get(user_role, 0)
    required_level = role_hierarchy.get(required_role, 0)
    
    return user_level >= required_level

def get_user_permissions(user_role: str) -> list:
    """Get list of permissions for a user role"""
    permissions = {
        'user': [
            'view_own_cards', 'create_card', 'update_own_card', 'block_own_card',
            'view_own_transactions', 'create_transaction', 'refund_transaction',
            'view_own_bills', 'create_bill', 'pay_bill', 'update_own_bill',
            'view_own_emis', 'create_emi', 'pay_emi', 'update_own_emi',
            'view_own_cibil', 'create_cibil', 'update_own_cibil',
            'view_own_notifications', 'create_notification', 'update_own_notification'
        ],
        'manager': [
            'view_all_cards', 'update_any_card', 'block_any_card',
            'view_all_transactions', 'view_all_bills', 'view_all_emis',
            'view_all_cibil', 'view_all_notifications', 'manage_notifications'
        ],
        'admin': [
            'delete_any_card', 'delete_any_transaction', 'delete_any_bill',
            'delete_any_emi', 'delete_any_cibil', 'delete_any_notification',
            'manage_users', 'view_analytics', 'system_settings'
        ]
    }
    
    return permissions.get(user_role, [])

def require_permission(permission: str):
    """Decorator to require specific permission"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            claims = getattr(request, 'user_claims', {})
            user_role = claims.get('role', 'user')
            user_permissions = get_user_permissions(user_role)
            
            if permission not in user_permissions:
                return jsonify({'error': f'Permission {permission} required'}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def log_authentication_event(user_id: str, event_type: str, success: bool, details: dict = None):
    """Log authentication events for security monitoring"""
    # This would typically write to a security log
    event = {
        'user_id': user_id,
        'event_type': event_type,
        'success': success,
        'timestamp': datetime.utcnow().isoformat(),
        'ip_address': request.remote_addr if request else None,
        'user_agent': request.headers.get('User-Agent') if request else None,
        'details': details or {}
    }
    
    # In production, this would be logged to a secure logging system
    print(f"SECURITY_EVENT: {event}")

def validate_session_timeout(user_id: str, last_activity: datetime) -> bool:
    """Validate if user session has timed out"""
    timeout_minutes = int(os.environ.get('SESSION_TIMEOUT_MINUTES', '30'))
    timeout_delta = timedelta(minutes=timeout_minutes)
    
    return datetime.utcnow() - last_activity < timeout_delta

def create_password_reset_token(user_id: str) -> str:
    """Create a secure password reset token"""
    payload = {
        'user_id': user_id,
        'purpose': 'password_reset',
        'exp': datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
    }
    return jwt.encode(payload, _get_secret(), algorithm='HS256')

def verify_password_reset_token(token: str) -> dict:
    """Verify password reset token"""
    try:
        payload = jwt.decode(token, _get_secret(), algorithms=['HS256'])
        if payload.get('purpose') != 'password_reset':
            return {'valid': False, 'error': 'Invalid token purpose'}
        return {'valid': True, 'user_id': payload.get('user_id')}
    except jwt.ExpiredSignatureError:
        return {'valid': False, 'error': 'Token expired'}
    except jwt.InvalidTokenError:
        return {'valid': False, 'error': 'Invalid token'}