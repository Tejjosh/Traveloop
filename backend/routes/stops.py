from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trip, TripStop, Activity
from datetime import datetime

stops_bp = Blueprint('stops', __name__)

@stops_bp.route('/<int:trip_id>/stops', methods=['POST'])
@jwt_required()
def add_stop(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    data = request.get_json()
    if not data.get('city_name', '').strip():
        return jsonify({'error': 'City name is required'}), 400

    stop = TripStop(
        trip_id=trip_id,
        city_name=data['city_name'].strip(),
        country=data.get('country', ''),
        arrival_date=datetime.strptime(data['arrival_date'], '%Y-%m-%d').date() if data.get('arrival_date') else None,
        departure_date=datetime.strptime(data['departure_date'], '%Y-%m-%d').date() if data.get('departure_date') else None,
        order_index=data.get('order_index', 0)
    )
    db.session.add(stop)
    db.session.commit()
    return jsonify({'id': stop.id, 'city_name': stop.city_name}), 201

@stops_bp.route('/stops/<int:stop_id>/activities', methods=['POST'])
@jwt_required()
def add_activity(stop_id):
    data = request.get_json()
    if not data.get('title', '').strip():
        return jsonify({'error': 'Activity title is required'}), 400

    activity = Activity(
        stop_id=stop_id,
        title=data['title'].strip(),
        type=data.get('type', 'sightseeing'),
        cost=data.get('cost', 0),
        currency=data.get('currency', 'USD'),
        duration_minutes=data.get('duration_minutes'),
        notes=data.get('notes', '')
    )
    db.session.add(activity)
    db.session.commit()
    return jsonify({'id': activity.id, 'title': activity.title}), 201