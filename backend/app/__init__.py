from flask import Flask
from config import Config
from app.api.routes import api

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    app.register_blueprint(api)

    return app
