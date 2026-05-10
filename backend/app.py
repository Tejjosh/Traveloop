from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from models import db
# Ensure all blueprints are imported
from routes.auth import auth_bp
from routes.trips import trips_bp
from routes.stops import stops_bp
from routes.expenses import expenses_bp
from routes.packing import packing_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 1. Initialize DB and JWT
    db.init_app(app)
    JWTManager(app)

    # 2. Hardened CORS Configuration
    # This explicitly allows the Authorization header needed for your JWTs
    CORS(app, 
         resources={r"/api/*": {"origins": "http://localhost:5173"}}, 
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"])

    # 3. Corrected Blueprint Registration
    # Avoid overlapping prefixes if possible, or ensure routes inside are unique
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(trips_bp, url_prefix='/api/trips')
    
    # If these blueprints handle sub-resources, consider nesting or unique prefixes
    # to avoid the "HTTP status not OK" preflight errors caused by route collisions.
    app.register_blueprint(stops_bp, url_prefix='/api/stops') 
    app.register_blueprint(expenses_bp, url_prefix='/api/expenses')
    app.register_blueprint(packing_bp, url_prefix='/api/packing')

    with app.app_context():
        db.create_all()
        print("✅ Database tables created and verified in Vadodara")

    return app

if __name__ == '__main__':
    app = create_app()
    # Explicitly binding to 0.0.0.0 can sometimes help with network resolution
    app.run(debug=True, host='0.0.0.0', port=5000)