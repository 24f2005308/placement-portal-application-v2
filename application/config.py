import os

class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True


class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///ppav2.sqlite3"
    DEBUG = True

    SECRET_KEY = "this-is-hmsv2-secret-key"
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = "this-is-a-password-salt"
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), '../static/resumes')
    CACHE_TYPE = 'RedisCache'
    CACHE_REDIS_HOST = 'localhost'
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 2
    CACHE_DEFAULT_TIMEOUT = 300