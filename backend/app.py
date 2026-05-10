from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from models import db
from routes.auth import auth_bp
from routes.trips import trips_bp
from routes.stops import stops_bp
from routes.expenses import expenses_bp
from routes.packing import packing_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    JWTManager(app)
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(trips_bp, url_prefix='/api/trips')
    app.register_blueprint(stops_bp, url_prefix='/api/trips')
    app.register_blueprint(expenses_bp, url_prefix='/api/trips')
    app.register_blueprint(packing_bp, url_prefix='/api/trips')

    with app.app_context():
        db.create_all()
        print("✅ Database tables created")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)