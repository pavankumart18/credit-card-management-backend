import os
from datetime import timedelta

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # MongoDB Configuration
    MONGODB_SETTINGS = {
        'host': os.environ.get('MONGODB_URI') or 'mongodb+srv://pavankumartm:starkismine@cluster0.ckdyrqx.mongodb.net/ccms_db',
        'db': 'ccms_db',
        'connect': False,
        'serverSelectionTimeoutMS': 5000,
        'connectTimeoutMS': 20000,
        'socketTimeoutMS': 20000,
        'retryWrites': True,
        'tls': True,
        'tlsAllowInvalidCertificates': False,
        'tlsAllowInvalidHostnames': False
    }

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    MONGODB_SETTINGS = {
        'host': os.environ.get('MONGODB_URI') or 'mongodb+srv://pavankumartm:starkismine@cluster0.ckdyrqx.mongodb.net/ccms_db',
        'db': 'ccms_db',
        'connect': False,
        'serverSelectionTimeoutMS': 5000,
        'connectTimeoutMS': 20000,
        'socketTimeoutMS': 20000,
        'retryWrites': True,
        'tls': True,
        'tlsAllowInvalidCertificates': False,
        'tlsAllowInvalidHostnames': False
    }

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    MONGODB_SETTINGS = {
        'host': os.environ.get('MONGODB_URI') or 'mongodb+srv://pavankumartm:starkismine@cluster0.ckdyrqx.mongodb.net/ccms_db',
        'db': 'ccms_db',
        'connect': False,
        'serverSelectionTimeoutMS': 5000,
        'connectTimeoutMS': 20000,
        'socketTimeoutMS': 20000,
        'retryWrites': True,
        'tls': True,
        'tlsAllowInvalidCertificates': False,
        'tlsAllowInvalidHostnames': False
    }

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    MONGODB_SETTINGS = {
        'host': os.environ.get('MONGODB_URI') or 'mongodb+srv://pavankumartm:starkismine@cluster0.ckdyrqx.mongodb.net/ccms_db',
        'db': 'ccms_db',
        'connect': False,
        'serverSelectionTimeoutMS': 5000,
        'connectTimeoutMS': 20000,
        'socketTimeoutMS': 20000,
        'maxPoolSize': 10,
        'retryWrites': True,
        'tls': True,
        'tlsAllowInvalidCertificates': False,
        'tlsAllowInvalidHostnames': False
    }

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
