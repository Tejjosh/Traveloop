from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trip, PackingItem, TripNote

packing_bp = Blueprint('packing', __name__)

@packing_bp.route('/<int:trip_id>/packing', methods=['GET'])
@jwt_required()
def get_packing(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Not found'}), 404
    return jsonify([{'id': i.id, 'name': i.name, 'category': i.category, 'is_packed': i.is_packed}
                    for i in trip.packing_items])

@packing_bp.route('/<int:trip_id>/packing', methods=['POST'])
@jwt_required()
def add_packing(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    if not data.get('name', '').strip():
        return jsonify({'error': 'Item name is required'}), 400
    item = PackingItem(trip_id=trip_id, name=data['name'].strip(),
                       category=data.get('category', 'general'))
    db.session.add(item)
    db.session.commit()
    return jsonify({'id': item.id, 'name': item.name}), 201

@packing_bp.route('/packing/<int:item_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_packing(item_id):
    item = PackingItem.query.get(item_id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    item.is_packed = not item.is_packed
    db.session.commit()
    return jsonify({'is_packed': item.is_packed})

@packing_bp.route('/<int:trip_id>/notes', methods=['GET'])
@jwt_required()
def get_notes(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Not found'}), 404
    return jsonify([{'id': n.id, 'content': n.content, 'created_at': str(n.created_at)}
                    for n in sorted(trip.notes, key=lambda x: x.created_at, reverse=True)])

@packing_bp.route('/<int:trip_id>/notes', methods=['POST'])
@jwt_required()
def add_note(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    if not data.get('content', '').strip():
        return jsonify({'error': 'Note content is required'}), 400
    note = TripNote(trip_id=trip_id, content=data['content'].strip())
    db.session.add(note)
    db.session.commit()
    return jsonify({'id': note.id}), 201