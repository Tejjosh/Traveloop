from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    # NEW: Community & Monetization Features
    bio = db.Column(db.Text)
    profile_image_url = db.Column(db.String(255))
    loyalty_tier = db.Column(db.String(50), default='free') # free, premium, vip
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    trips = db.relationship('Trip', backref='owner', lazy=True)

class Trip(db.Model):
    __tablename__ = 'trips'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    # NEW: Algorithmic & Community Features
    trip_type = db.Column(db.String(50), default='Cultural')
    cover_image_url = db.Column(db.String(255))
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    base_currency = db.Column(db.String(10), default='USD')
    total_budget = db.Column(db.Float, default=0)
    is_public = db.Column(db.Boolean, default=False)
    is_group_trip = db.Column(db.Boolean, default=False) # For stranger matchmaking
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    stops = db.relationship('TripStop', backref='trip', lazy=True, cascade='all, delete-orphan')
    expenses = db.relationship('Expense', backref='trip', lazy=True, cascade='all, delete-orphan')
    packing_items = db.relationship('PackingItem', backref='trip', lazy=True, cascade='all, delete-orphan')
    notes = db.relationship('TripNote', backref='trip', lazy=True, cascade='all, delete-orphan')

class TripStop(db.Model):
    __tablename__ = 'trip_stops'
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False)
    city_name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100))
    # UPGRADED: DateTime for granular scheduling
    arrival_date = db.Column(db.DateTime)
    departure_date = db.Column(db.DateTime)
    # NEW: Logistics tracking
    transit_mode = db.Column(db.String(50), default='Flight')
    transit_cost = db.Column(db.Float, default=0)
    order_index = db.Column(db.Integer, default=0)
    
    activities = db.relationship('Activity', backref='stop', lazy=True, cascade='all, delete-orphan')

class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    stop_id = db.Column(db.Integer, db.ForeignKey('trip_stops.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(50))  # food, adventure, sightseeing
    cost = db.Column(db.Float, default=0)
    currency = db.Column(db.String(10), default='USD')
    duration_minutes = db.Column(db.Integer)
    # NEW: Premium Cultural Immersion flag
    is_premium_cultural = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)

class Expense(db.Model):
    __tablename__ = 'expenses'
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False)
    category = db.Column(db.String(50))  # transport, stay, food, activity
    description = db.Column(db.String(200))
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='USD')
    date = db.Column(db.Date)

class PackingItem(db.Model):
    __tablename__ = 'packing_items'
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50))  # clothing, documents, electronics
    is_packed = db.Column(db.Boolean, default=False)

class TripNote(db.Model):
    __tablename__ = 'trip_notes'
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)