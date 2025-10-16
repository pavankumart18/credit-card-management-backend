import os
import json
import time
import logging
from datetime import datetime
from functools import wraps
from flask import request, g, current_app
# from models.user import User  # Removed to avoid circular import

class LoggingService:
    """Comprehensive logging and monitoring service"""
    
    def __init__(self):
        self.setup_logging()
    
    def setup_logging(self):
        """Setup logging configuration"""
        # Create logs directory if it doesn't exist
        os.makedirs('logs', exist_ok=True)
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('logs/application.log'),
                logging.StreamHandler()
            ]
        )
        
        # Create specific loggers
        self.app_logger = logging.getLogger('app')
        self.security_logger = logging.getLogger('security')
        self.performance_logger = logging.getLogger('performance')
        self.error_logger = logging.getLogger('error')
        self.audit_logger = logging.getLogger('audit')
        
        # Setup file handlers for different log types
        self._setup_file_handlers()
    
    def _setup_file_handlers(self):
        """Setup file handlers for different log types"""
        # Security log handler
        security_handler = logging.FileHandler('logs/security.log')
        security_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        ))
        self.security_logger.addHandler(security_handler)
        
        # Performance log handler
        performance_handler = logging.FileHandler('logs/performance.log')
        performance_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(message)s'
        ))
        self.performance_logger.addHandler(performance_handler)
        
        # Error log handler
        error_handler = logging.FileHandler('logs/error.log')
        error_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        ))
        self.error_logger.addHandler(error_handler)
        
        # Audit log handler
        audit_handler = logging.FileHandler('logs/audit.log')
        audit_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(message)s'
        ))
        self.audit_logger.addHandler(audit_handler)
    
    def log_request(self, endpoint, method, user_id=None, status_code=None, duration=None):
        """Log API request"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'endpoint': endpoint,
            'method': method,
            'user_id': user_id,
            'status_code': status_code,
            'duration_ms': duration,
            'ip_address': request.remote_addr if request else None,
            'user_agent': request.headers.get('User-Agent') if request else None
        }
        
        self.app_logger.info(f"API Request: {json.dumps(log_data)}")
    
    def log_security_event(self, event_type, user_id, success, details=None):
        """Log security events"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'success': success,
            'ip_address': request.remote_addr if request else None,
            'user_agent': request.headers.get('User-Agent') if request else None,
            'details': details or {}
        }
        
        level = logging.INFO if success else logging.WARNING
        self.security_logger.log(level, f"Security Event: {json.dumps(log_data)}")
    
    def log_performance(self, operation, duration, details=None):
        """Log performance metrics"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'operation': operation,
            'duration_ms': duration,
            'details': details or {}
        }
        
        self.performance_logger.info(f"Performance: {json.dumps(log_data)}")
    
    def log_error(self, error_type, error_message, user_id=None, details=None):
        """Log errors"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'error_type': error_type,
            'error_message': error_message,
            'user_id': user_id,
            'ip_address': request.remote_addr if request else None,
            'details': details or {}
        }
        
        self.error_logger.error(f"Error: {json.dumps(log_data)}")
    
    def log_audit(self, action, user_id, resource_type, resource_id, details=None):
        """Log audit trail"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'action': action,
            'user_id': user_id,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'ip_address': request.remote_addr if request else None,
            'details': details or {}
        }
        
        self.audit_logger.info(f"Audit: {json.dumps(log_data)}")
    
    def log_business_event(self, event_type, user_id, amount=None, details=None):
        """Log business events (transactions, payments, etc.)"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'amount': amount,
            'details': details or {}
        }
        
        self.app_logger.info(f"Business Event: {json.dumps(log_data)}")

# Global logging service instance
logging_service = LoggingService()

def log_request_performance(f):
    """Decorator to log request performance"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        
        # Get user info if available
        user_id = None
        if hasattr(request, 'user_claims'):
            user_id = request.user_claims.get('user_id')
        
        try:
            result = f(*args, **kwargs)
            duration = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            # Log successful request
            logging_service.log_request(
                endpoint=request.endpoint,
                method=request.method,
                user_id=user_id,
                status_code=200,
                duration=duration
            )
            
            # Log performance
            logging_service.log_performance(
                operation=f"{request.method} {request.endpoint}",
                duration=duration
            )
            
            return result
            
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            
            # Log error
            logging_service.log_error(
                error_type=type(e).__name__,
                error_message=str(e),
                user_id=user_id,
                details={'endpoint': request.endpoint, 'method': request.method}
            )
            
            # Log failed request
            logging_service.log_request(
                endpoint=request.endpoint,
                method=request.method,
                user_id=user_id,
                status_code=500,
                duration=duration
            )
            
            raise
    
    return decorated_function

def log_security_event(event_type, user_id, success, details=None):
    """Log security events"""
    logging_service.log_security_event(event_type, user_id, success, details)

def log_audit_trail(action, user_id, resource_type, resource_id, details=None):
    """Log audit trail"""
    logging_service.log_audit(action, user_id, resource_type, resource_id, details)

def log_business_event(event_type, user_id, amount=None, details=None):
    """Log business events"""
    logging_service.log_business_event(event_type, user_id, amount, details)

def log_error(error_type, error_message, user_id=None, details=None):
    """Log errors"""
    logging_service.log_error(error_type, error_message, user_id, details)

def log_performance(operation, duration, details=None):
    """Log performance metrics"""
    logging_service.log_performance(operation, duration, details)

class PerformanceMonitor:
    """Performance monitoring utilities"""
    
    @staticmethod
    def measure_database_operation(operation_name):
        """Decorator to measure database operation performance"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    duration = (time.time() - start_time) * 1000
                    log_performance(f"DB_{operation_name}", duration)
                    return result
                except Exception as e:
                    duration = (time.time() - start_time) * 1000
                    log_error("DatabaseError", str(e), details={'operation': operation_name, 'duration': duration})
                    raise
            return wrapper
        return decorator
    
    @staticmethod
    def measure_api_call(api_name):
        """Decorator to measure API call performance"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    duration = (time.time() - start_time) * 1000
                    log_performance(f"API_{api_name}", duration)
                    return result
                except Exception as e:
                    duration = (time.time() - start_time) * 1000
                    log_error("APIError", str(e), details={'api': api_name, 'duration': duration})
                    raise
            return wrapper
        return decorator

class SecurityMonitor:
    """Security monitoring utilities"""
    
    @staticmethod
    def detect_suspicious_activity(user_id, activity_type, details):
        """Detect suspicious activity patterns"""
        # This is a simplified version - in production, you'd use ML models
        suspicious_patterns = {
            'multiple_failed_logins': {'threshold': 5, 'time_window': 300},  # 5 minutes
            'high_value_transactions': {'threshold': 10000, 'time_window': 3600},  # 1 hour
            'unusual_location': {'check': True},
            'rapid_transactions': {'threshold': 10, 'time_window': 600}  # 10 minutes
        }
        
        # Log security event
        log_security_event(
            f"suspicious_{activity_type}",
            user_id,
            False,
            details
        )
        
        return True
    
    @staticmethod
    def log_authentication_attempt(user_id, success, details=None):
        """Log authentication attempts"""
        log_security_event(
            "authentication_attempt",
            user_id,
            success,
            details
        )
    
    @staticmethod
    def log_authorization_check(user_id, resource, action, success):
        """Log authorization checks"""
        log_security_event(
            "authorization_check",
            user_id,
            success,
            {'resource': resource, 'action': action}
        )

class BusinessMetrics:
    """Business metrics collection"""
    
    @staticmethod
    def track_transaction(user_id, amount, merchant, success):
        """Track transaction metrics"""
        log_business_event(
            "transaction",
            user_id,
            amount,
            {'merchant': merchant, 'success': success}
        )
    
    @staticmethod
    def track_card_usage(user_id, card_id, usage_type):
        """Track card usage metrics"""
        log_business_event(
            "card_usage",
            user_id,
            None,
            {'card_id': card_id, 'usage_type': usage_type}
        )
    
    @staticmethod
    def track_payment(user_id, amount, payment_type, success):
        """Track payment metrics"""
        log_business_event(
            "payment",
            user_id,
            amount,
            {'payment_type': payment_type, 'success': success}
        )
