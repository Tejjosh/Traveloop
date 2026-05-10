import random
from datetime import date, timedelta
from werkzeug.security import generate_password_hash
from app import create_app
from models import db, User, Trip, TripStop, Activity, Expense, PackingItem, TripNote

# --- DATA POOLS FOR RANDOM GENERATION ---
FIRST_NAMES = ["Alex", "Sarah", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Quinn"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
CITIES = ["New York", "London", "Sydney", "Berlin", "Toronto", "Mumbai", "Cape Town", "Tokyo"]
DESTINATIONS = [
    ("Tokyo", "Japan"), ("Kyoto", "Japan"), ("Paris", "France"), ("London", "UK"),
    ("Rome", "Italy"), ("New York", "USA"), ("Sydney", "Australia"), ("Bali", "Indonesia"),
    ("Cape Town", "South Africa"), ("Rio de Janeiro", "Brazil"), ("Berlin", "Germany"),
    ("Barcelona", "Spain"), ("Bangkok", "Thailand"), ("Dubai", "UAE"), ("Reykjavik", "Iceland"),
    ("Vadodara", "India"), ("Stockholm", "Sweden"), ("Perth", "Australia")
]
TRIP_TYPES = ['Adventure', 'Wellness', 'Cultural', 'Business', 'Romantic', 'Family']
CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR']
EXPENSE_CATEGORIES = ['transport', 'stay', 'food', 'activity']
TRANSIT_MODES = ['Flight', 'Train', 'Bus', 'Ferry', 'Car Rental']

def get_random_date(start_days_ago, end_days_ahead):
    today = date.today()
    start = today - timedelta(days=start_days_ago)
    end = today + timedelta(days=end_days_ahead)
    return start + timedelta(days=random.randint(0, (end - start).days))

app = create_app()

with app.app_context():
    print("🧹 Dropping all existing tables...")
    db.drop_all()
    
    print("🏗️ Recreating all tables...")
    db.create_all()

    # ==========================================
    # 1. SEED CORE USERS (Keep test accounts active)
    # ==========================================
    print("👤 Seeding Users (Generating 15 users)...")
    users = []
    
    # Static Test Accounts
    users.append(User(name="Alex Wanderlust", email="alex@traveloop.com", password_hash=generate_password_hash("password123"), bio="Always looking for the next mountain.", city="New York", loyalty_tier="premium"))
    users.append(User(name="Sarah Explorer", email="sarah@traveloop.com", password_hash=generate_password_hash("password123"), bio="Digital nomad traversing the globe.", city="London", loyalty_tier="free"))
    users.append(User(name="Admin", email="admin@traveloop.com", password_hash=generate_password_hash("admin123"), bio="Platform Administrator", city="San Francisco", loyalty_tier="vip"))

    # Random Users
    for i in range(12):
        u = User(
            name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            email=f"user{i}@traveloop.com",
            password_hash=generate_password_hash("password123"),
            city=random.choice(CITIES),
            loyalty_tier=random.choice(['free', 'free', 'premium', 'vip'])
        )
        users.append(u)

    db.session.add_all(users)
    db.session.commit()

    # ==========================================
    # 2. SEED TRIPS (5 Years of Data)
    # ==========================================
    print("✈️ Seeding Trips (Generating 5 years of travel history)...")
    trips = []
    
    for user in users:
        # Generate 5 to 15 trips per user over a 5-year span
        num_trips = random.randint(5, 15)
        for _ in range(num_trips):
            # 4 years in the past (-1460 days) to 1 year in the future (+365 days)
            start_date = get_random_date(1460, 365)
            duration = random.randint(3, 21)
            end_date = start_date + timedelta(days=duration)
            
            dest = random.choice(DESTINATIONS)
            t_type = random.choice(TRIP_TYPES)
            base_curr = random.choice(CURRENCIES)
            budget = random.randint(1000, 10000)

            trip = Trip(
                user_id=user.id,
                title=f"{t_type} in {dest[0]}",
                description=f"A wonderful {duration}-day {t_type.lower()} trip to {dest[1]}.",
                trip_type=t_type,
                start_date=start_date,
                end_date=end_date,
                base_currency=base_curr,
                total_budget=budget,
                is_public=random.choice([True, False]),
                is_group_trip=random.choice([True, False, False, False]) # 25% chance of group trip
            )
            trips.append(trip)
            
    db.session.add_all(trips)
    db.session.commit()

    # ==========================================
    # 3. SEED STOPS, ACTIVITIES, EXPENSES, & PACKING
    # ==========================================
    print("🌍 Populating Stops, Expenses, and Activities (This may take a few seconds)...")
    
    all_stops = []
    all_activities = []
    all_expenses = []
    all_packing = []
    all_notes = []

    for trip in trips:
        num_stops = random.randint(1, 4)
        current_date = trip.start_date
        days_per_stop = max(1, (trip.end_date - trip.start_date).days // num_stops)

        for order in range(num_stops):
            dest = random.choice(DESTINATIONS)
            stop_end = current_date + timedelta(days=days_per_stop)
            if order == num_stops - 1:
                stop_end = trip.end_date # Last stop ends on trip end date
            
            # STOPS
            stop = TripStop(
                trip_id=trip.id,
                city_name=dest[0],
                country=dest[1],
                arrival_date=current_date,
                departure_date=stop_end,
                transit_mode=random.choice(TRANSIT_MODES),
                transit_cost=random.randint(50, 500),
                order_index=order
            )
            db.session.add(stop)
            db.session.flush() # Flush to get stop.id for activities
            
            # ACTIVITIES (0 to 3 per stop)
            for _ in range(random.randint(0, 3)):
                act = Activity(
                    stop_id=stop.id,
                    title=f"Explore {dest[0]} Landmark",
                    type=random.choice(['Sightseeing', 'Food', 'Adventure']),
                    cost=random.randint(0, 150),
                    currency=trip.base_currency,
                    duration_minutes=random.randint(60, 240),
                    is_premium_cultural=random.choice([True, False])
                )
                all_activities.append(act)
                
            current_date = stop_end

        # EXPENSES (Spread randomly throughout the trip dates)
        num_expenses = random.randint(3, 10)
        for _ in range(num_expenses):
            exp_date = trip.start_date + timedelta(days=random.randint(0, max(1, (trip.end_date - trip.start_date).days)))
            exp = Expense(
                trip_id=trip.id,
                category=random.choice(EXPENSE_CATEGORIES),
                description=f"Standard {trip.trip_type} expense",
                amount=random.randint(15, 250),
                currency=trip.base_currency,
                date=exp_date
            )
            all_expenses.append(exp)

        # PACKING ITEMS
        items = ["Passport", "Phone Charger", "Camera", "Jacket", "Sunglasses", "Medication"]
        for item in items:
            pack = PackingItem(
                trip_id=trip.id, 
                name=item, 
                category=random.choice(["Documents", "Electronics", "Clothing"]),
                is_packed=random.choice([True, False])
            )
            all_packing.append(pack)
            
        # TRIP NOTES
        all_notes.append(TripNote(trip_id=trip.id, content=f"Remember to check exchange rates for {trip.base_currency} before arriving!"))

    # Bulk insert for performance
    db.session.add_all(all_activities)
    db.session.add_all(all_expenses)
    db.session.add_all(all_packing)
    db.session.add_all(all_notes)
    db.session.commit()

    print(f"✅ Data Generation Complete!")
    print(f"📊 Generated {len(users)} Users, {len(trips)} Trips, and thousands of data points!")