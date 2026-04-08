from flask import Flask
from application.database import db
from application.models import *
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash
from datetime import date
from application.resources import api
from application.celery_init import celery_init_app
from application.cache import cache
def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    
    db.init_app(app)
    cache.init_app(app)
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    
    app.app_context().push()
    return app

app = create_app()
celery_app = celery_init_app(app)

with app.app_context():
    db.create_all()
    app.security.datastore.find_or_create_role(name="admin", description="Superuser of app")
    app.security.datastore.find_or_create_role(name="company", description="Companies")
    app.security.datastore.find_or_create_role(name="student", description="Students")
    
    db.session.commit()

    #Admin Creation
    if not app.security.datastore.find_user(email="admin@gmail.com"):
        app.security.datastore.create_user(
            email="admin@gmail.com",
            username="admin",
            password=generate_password_hash("1234"),
            roles=['admin'],
            active=True
        )     
    db.session.commit()

from application.routes import *
if __name__ == "__main__":
    app.run()