from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
import os
import requests 

auth_bp = Blueprint('auth', __name__)

# ==========================================
# 1. Standard Email/Password Registration
# ==========================================
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 409

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': access_token,
        'user': {'id': user.id, 'name': user.name, 'email': user.email}
    }), 201

# ==========================================
# 2. Standard Email/Password Login
# ==========================================
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': access_token,
        'user': {'id': user.id, 'name': user.name, 'email': user.email}
    }), 200

# ==========================================
# 3. Google OAuth Login/Registration
# ==========================================
@auth_bp.route('/google', methods=['POST'])
def google_auth():
    # 1. Get the token from the request
    token = request.json.get('token')
    if not token:
        return jsonify({'error': 'No token provided'}), 400
    
    try:
        # 2. Verify Access Token by calling Google's UserInfo API
        response = requests.get(f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}")
        
        if response.status_code != 200:
            return jsonify({'error': 'Invalid Google token'}), 401
        
        user_info = response.json()
        email = user_info['email']
        name = user_info.get('name', 'Google Traveler')

        # 3. Check if user already exists
        user = User.query.filter_by(email=email).first()
        
        # 4. If they don't exist, auto-register them
        if not user:
            user = User(
                name=name, 
                email=email, 
                # Use a random string for the password hash
                password_hash=generate_password_hash(os.urandom(24).hex())
            )
            db.session.add(user)
            db.session.commit()

        # 5. Create your own JWT token to log them into Traveloop
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'token': access_token, 
            'user': {
                'id': user.id, 
                'name': user.name, 
                'email': user.email,
                'loyalty_tier': getattr(user, 'loyalty_tier', 'free')
            }
        }), 200

    except Exception as e:
        print(f"Auth Error: {e}")
        return jsonify({'error': 'Internal server error during Google authentication'}), 500

# ==========================================
# 4. Get & Update Current User Profile (Fixes CORS & Refresh)
# ==========================================
@auth_bp.route('/me', methods=['GET', 'PUT', 'OPTIONS'])
@jwt_required()
def manage_profile():
    # 1. Always allow CORS preflight requests to pass immediately
    if request.method == 'OPTIONS':
        return '', 200

    # 2. Get the currently logged-in user
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # 3. If it's a PUT request, update the user's bio (from Dashboard.jsx)
    if request.method == 'PUT':
        data = request.json
        if 'bio' in data:
            user.bio = data['bio']
        db.session.commit()

    # 4. Return the user data (Used by React to keep you logged in on refresh)
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'bio': getattr(user, 'bio', ''),
        'city': getattr(user, 'city', 'Global Traveler'),
        'loyalty_tier': getattr(user, 'loyalty_tier', 'free'),
        'profile_image_url': getattr(user, 'profile_image_url', None)
    }), 200