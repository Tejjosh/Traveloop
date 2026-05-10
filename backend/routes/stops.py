from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trip, TripStop, Activity
from datetime import datetime

stops_bp = Blueprint('stops', __name__)

def parse_datetime(dt_str):
    """Helper to parse frontend ISO strings to Python datetime objects."""
    if not dt_str:
        return None
    try:
        # Handles typical 'YYYY-MM-DDTHH:MM' from datetime-local inputs
        if 'T' in dt_str:
            dt_str = dt_str.replace('Z', '')
            if '.' in dt_str:
                dt_str = dt_str.split('.')[0]
            return datetime.fromisoformat(dt_str)
        else:
            return datetime.strptime(dt_str, '%Y-%m-%d')
    except ValueError:
        return None

@stops_bp.route('/<int:trip_id>/stops', methods=['POST'])
@jwt_required()
def add_stop(trip_id):
    user_id = get_jwt_identity()
    # Ensure the user owns this trip before modifying it
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Trip not found or unauthorized'}), 404

    data = request.get_json()
    if not data.get('city_name', '').strip():
        return jsonify({'error': 'City name is required'}), 400

    stop = TripStop(
        trip_id=trip_id,
        city_name=data['city_name'].strip(),
        country=data.get('country', ''),
        arrival_date=parse_datetime(data.get('arrival_date')),
        departure_date=parse_datetime(data.get('departure_date')),
        transit_mode=data.get('transit_mode', 'Flight'),
        transit_cost=float(data.get('transit_cost', 0)),
        order_index=data.get('order_index', 0)
    )
    db.session.add(stop)
    db.session.commit()
    
    return jsonify({
        'id': stop.id, 
        'city_name': stop.city_name,
        'transit_mode': stop.transit_mode
    }), 201

@stops_bp.route('/stops/<int:stop_id>/activities', methods=['POST'])
@jwt_required()
def add_activity(stop_id):
    # Note: In a production environment, we should verify the user owns the trip tied to this stop.
    data = request.get_json()
    if not data.get('title', '').strip():
        return jsonify({'error': 'Activity title is required'}), 400

    activity = Activity(
        stop_id=stop_id,
        title=data['title'].strip(),
        type=data.get('type', 'sightseeing'),
        cost=float(data.get('cost', 0)),
        currency=data.get('currency', 'USD'),
        duration_minutes=data.get('duration_minutes'),
        is_premium_cultural=data.get('is_premium_cultural', False),
        notes=data.get('notes', '')
    )
    db.session.add(activity)
    db.session.commit()
    
    return jsonify({
        'id': activity.id, 
        'title': activity.title,
        'is_premium_cultural': activity.is_premium_cultural
    }), 201