from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trip, TripStop, Activity, Expense
from datetime import datetime
import requests

trips_bp = Blueprint('trips', __name__)

EXCHANGE_API = "https://open.er-api.com/v6/latest"

def get_exchange_rate(from_currency, to_currency):
    try:
        r = requests.get(f"{EXCHANGE_API}/{from_currency}", timeout=5)
        data = r.json()
        return data['rates'].get(to_currency, 1)
    except:
        return 1

@trips_bp.route('/', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_trips():
    if request.method == 'OPTIONS':
        return '', 200

    user_id = get_jwt_identity()
    trips = Trip.query.filter_by(user_id=user_id).order_by(Trip.created_at.desc()).all()
    return jsonify([{
        'id': t.id, 'title': t.title, 'description': t.description,
        'trip_type': t.trip_type, 'cover_image_url': t.cover_image_url,
        'start_date': str(t.start_date), 'end_date': str(t.end_date),
        'base_currency': t.base_currency, 'total_budget': t.total_budget,
        'is_public': t.is_public, 'is_group_trip': t.is_group_trip, 
        'stop_count': len(t.stops)
    } for t in trips])

@trips_bp.route('/', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_trip():
    if request.method == 'OPTIONS':
        return '', 200

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
        trip_type=data.get('trip_type', 'Cultural'),
        cover_image_url=data.get('cover_image_url', ''),
        start_date=start,
        end_date=end,
        base_currency=data.get('base_currency', 'USD'),
        total_budget=data.get('total_budget', 0),
        is_public=data.get('is_public', False),
        is_group_trip=data.get('is_group_trip', False)
    )
    db.session.add(trip)
    db.session.commit()
    return jsonify({'id': trip.id, 'title': trip.title}), 201


# ==========================================
# NEW: ADD STOPS TO A TRIP (Fixes CORS Error)
# ==========================================
@trips_bp.route('/<int:trip_id>/stops', methods=['POST', 'OPTIONS'])
@jwt_required()
def add_trip_stop(trip_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.json
    
    try:
        new_stop = TripStop(
            trip_id=trip_id,
            city_name=data.get('city_name'),
            country=data.get('country', ''),
            order_index=data.get('order_index', 0)
        )
        db.session.add(new_stop)
        db.session.commit()
        
        return jsonify({'message': 'Stop added successfully', 'id': new_stop.id}), 201
    except Exception as e:
        print(f"Error adding stop: {e}")
        return jsonify({'error': 'Failed to add stop'}), 500


@trips_bp.route('/<int:trip_id>', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_trip(trip_id):
    if request.method == 'OPTIONS':
        return '', 200

    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    stops = []
    for s in sorted(trip.stops, key=lambda x: x.order_index):
        stops.append({
            'id': s.id, 'city_name': s.city_name, 'country': s.country,
            'arrival_date': s.arrival_date.isoformat() if s.arrival_date else None, 
            'departure_date': s.departure_date.isoformat() if s.departure_date else None,
            'transit_mode': s.transit_mode, 'transit_cost': s.transit_cost,
            'activities': [{'id': a.id, 'title': a.title, 'type': a.type,
                            'cost': a.cost, 'currency': a.currency,
                            'duration_minutes': a.duration_minutes, 
                            'is_premium_cultural': a.is_premium_cultural,
                            'notes': a.notes}
                           for a in s.activities]
        })

    # Budget calculation with live currency
    base = trip.base_currency
    total_spent = 0
    breakdown = {'transport': sum(s.transit_cost for s in trip.stops), 'stay': 0, 'food': 0, 'activity': 0}
    
    # Add transit costs to total spent
    total_spent += breakdown['transport']

    for e in trip.expenses:
        rate = get_exchange_rate(e.currency, base) if e.currency != base else 1
        converted = e.amount * rate
        total_spent += converted
        if e.category in breakdown:
            breakdown[e.category] += converted

    return jsonify({
        'id': trip.id, 'title': trip.title, 'description': trip.description,
        'trip_type': trip.trip_type, 'cover_image_url': trip.cover_image_url,
        'start_date': str(trip.start_date), 'end_date': str(trip.end_date),
        'base_currency': base, 'total_budget': trip.total_budget,
        'is_public': trip.is_public, 'is_group_trip': trip.is_group_trip, 
        'stops': stops,
        'budget_summary': {
            'total_budget': trip.total_budget,
            'total_spent': round(total_spent, 2),
            'remaining': round(trip.total_budget - total_spent, 2),
            'breakdown': {k: round(v, 2) for k, v in breakdown.items()}
        }
    })

@trips_bp.route('/<int:trip_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_trip(trip_id):
    if request.method == 'OPTIONS':
        return '', 200

    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404
    db.session.delete(trip)
    db.session.commit()
    return jsonify({'message': 'Trip deleted'})

@trips_bp.route('/public', methods=['GET', 'OPTIONS'])
def public_trips():
    if request.method == 'OPTIONS':
        return '', 200

    trips = Trip.query.filter_by(is_public=True).order_by(Trip.created_at.desc()).limit(20).all()
    return jsonify([{
        'id': t.id, 'title': t.title, 'description': t.description,
        'trip_type': t.trip_type, 'cover_image_url': t.cover_image_url,
        'start_date': str(t.start_date), 'end_date': str(t.end_date),
        'is_group_trip': t.is_group_trip,
        'stop_count': len(t.stops), 'owner': t.owner.name,
        'owner_loyalty': t.owner.loyalty_tier
    } for t in trips])