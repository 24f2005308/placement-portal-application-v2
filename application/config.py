class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True


class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///ppav2.sqlite3"
    DEBUG = True

    # config for security
    SECRET_KEY = "ppav2-secret-key"
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = "this-is-a-password-salt"
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"