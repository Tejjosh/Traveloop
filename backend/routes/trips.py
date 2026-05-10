from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trip, TripStop, Activity, Expense
from datetime import datetime
import requests

trips_bp = Blueprint('trips', __name__)

EXCHANGE_API = "https://open.er-api.com/v6/latest"  # free, no key needed

def get_exchange_rate(from_currency, to_currency):
    try:
        r = requests.get(f"{EXCHANGE_API}/{from_currency}", timeout=5)
        data = r.json()
        return data['rates'].get(to_currency, 1)
    except:
        return 1  # fallback

@trips_bp.route('/', methods=['GET'])
@jwt_required()
def get_trips():
    user_id = get_jwt_identity()
    trips = Trip.query.filter_by(user_id=user_id).order_by(Trip.created_at.desc()).all()
    return jsonify([{
        'id': t.id, 'title': t.title, 'description': t.description,
        'start_date': str(t.start_date), 'end_date': str(t.end_date),
        'base_currency': t.base_currency, 'total_budget': t.total_budget,
        'is_public': t.is_public, 'stop_count': len(t.stops)
    } for t in trips])

@trips_bp.route('/', methods=['POST'])
@jwt_required()
def create_trip():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('title', '').strip():
        return jsonify({'error': 'Trip title is required'}), 400
    if not data.get('start_date') or not data.get('end_date'):
        return jsonify({'error': 'Start and end dates are required'}), 400

    try:
        start = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        if end < start:
            return jsonify({'error': 'End date must be after start date'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    trip = Trip(
        user_id=user_id,
        title=data['title'].strip(),
        description=data.get('description', ''),
        start_date=start,
        end_date=end,
        base_currency=data.get('base_currency', 'USD'),
        total_budget=data.get('total_budget', 0),
        is_public=data.get('is_public', False)
    )
    db.session.add(trip)
    db.session.commit()
    return jsonify({'id': trip.id, 'title': trip.title}), 201

@trips_bp.route('/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_trip(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    stops = []
    for s in sorted(trip.stops, key=lambda x: x.order_index):
        stops.append({
            'id': s.id, 'city_name': s.city_name, 'country': s.country,
            'arrival_date': str(s.arrival_date), 'departure_date': str(s.departure_date),
            'activities': [{'id': a.id, 'title': a.title, 'type': a.type,
                            'cost': a.cost, 'currency': a.currency,
                            'duration_minutes': a.duration_minutes, 'notes': a.notes}
                           for a in s.activities]
        })

    # Budget calculation with live currency
    base = trip.base_currency
    total_spent = 0
    breakdown = {'transport': 0, 'stay': 0, 'food': 0, 'activity': 0}
    for e in trip.expenses:
        rate = get_exchange_rate(e.currency, base) if e.currency != base else 1
        converted = e.amount * rate
        total_spent += converted
        if e.category in breakdown:
            breakdown[e.category] += converted

    return jsonify({
        'id': trip.id, 'title': trip.title, 'description': trip.description,
        'start_date': str(trip.start_date), 'end_date': str(trip.end_date),
        'base_currency': base, 'total_budget': trip.total_budget,
        'is_public': trip.is_public, 'stops': stops,
        'budget_summary': {
            'total_budget': trip.total_budget,
            'total_spent': round(total_spent, 2),
            'remaining': round(trip.total_budget - total_spent, 2),
            'breakdown': {k: round(v, 2) for k, v in breakdown.items()}
        }
    })

@trips_bp.route('/<int:trip_id>', methods=['DELETE'])
@jwt_required()
def delete_trip(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404
    db.session.delete(trip)
    db.session.commit()
    return jsonify({'message': 'Trip deleted'})

@trips_bp.route('/public', methods=['GET'])
def public_trips():
    trips = Trip.query.filter_by(is_public=True).order_by(Trip.created_at.desc()).limit(20).all()
    return jsonify([{
        'id': t.id, 'title': t.title, 'description': t.description,
        'start_date': str(t.start_date), 'end_date': str(t.end_date),
        'stop_count': len(t.stops), 'owner': t.owner.name
    } for t in trips])