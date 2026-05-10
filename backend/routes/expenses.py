from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trip, Expense
from datetime import datetime

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/<int:trip_id>/expenses', methods=['GET'])
@jwt_required()
def get_expenses(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404
    return jsonify([{
        'id': e.id, 'category': e.category, 'description': e.description,
        'amount': e.amount, 'currency': e.currency, 'date': str(e.date)
    } for e in trip.expenses])

@expenses_bp.route('/<int:trip_id>/expenses', methods=['POST'])
@jwt_required()
def add_expense(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    data = request.get_json()
    if not data.get('amount') or float(data['amount']) <= 0:
        return jsonify({'error': 'Valid amount is required'}), 400
    if not data.get('category'):
        return jsonify({'error': 'Category is required'}), 400

    expense = Expense(
        trip_id=trip_id,
        category=data['category'],
        description=data.get('description', ''),
        amount=float(data['amount']),
        currency=data.get('currency', 'USD'),
        date=datetime.strptime(data['date'], '%Y-%m-%d').date() if data.get('date') else datetime.utcnow().date()
    )
    db.session.add(expense)
    db.session.commit()
    return jsonify({'id': expense.id}), 201

@expenses_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)
    if not expense:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(expense)
    db.session.commit()
    return jsonify({'message': 'Deleted'})