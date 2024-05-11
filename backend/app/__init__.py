from flask import Flask

def create_app(config_class='Config'):
    app = Flask(__name__)
    app.config.from_object(config_class)

    from app.chatbot.routes import chatbot
    from app.api.routes import api

    app.register_blueprint(chatbot)
    app.register_blueprint(api)

    return app