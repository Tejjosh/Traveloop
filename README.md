# 🌍 Traveloop

**Traveloop** is a full-stack, intelligent travel planning platform designed to transform how individuals and groups organize their adventures. From smart itinerary wizards and live budget tracking to community marketplaces and group travel matchmaking, Traveloop makes planning as exciting as the trip itself.

*Built for the Odoo Hackathon.*

---

## ✨ Key Features

- **Smart Trip Wizard:** A guided, step-by-step itinerary builder capturing origin, destinations, dates, and travel vibes (e.g., Cultural, Adventure, Wellness).
- **Visual Route Planner:** A dynamic visualizer that generates interactive, scenic representations of your journey using dynamic images.
- **Live Budget Tracker:** Real-time budget calculation with live currency exchange rates via the Open Exchange Rates API.
- **Community Marketplace:** Publish trips to the public, allowing other travelers to view, clone, and get inspired by your itineraries.
- **Group Adventures:** Solo travelers can find, view capacity, and request to join curated, vetted group trips.
- **Secure Authentication:** Standard Email/Password login combined with Google OAuth 2.0 integration via secure JWTs.
- **Loyalty Program:** "Traveloop Passport" tiers (Free, Premium, VIP) designed for monetization and power users.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (Glassmorphism UI, Custom Animations)
- **State Management:** Zustand
- **Routing:** React Router DOM
- **HTTP Client:** Axios

### Backend
- **Framework:** Python / Flask
- **Database Server:** XAMPP (MySQL / MariaDB)
- **ORM:** Flask-SQLAlchemy (with PyMySQL)
- **Authentication:** Flask-JWT-Extended, Werkzeug Security
- **Cross-Origin:** Flask-CORS

---

## 🚀 Getting Started (Local Development)

### Prerequisites
Make sure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://www.python.org/) (v3.8 or higher)
- [XAMPP](https://www.apachefriends.org/index.html) (For the MySQL Database)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/traveloop.git](https://github.com/YOUR_USERNAME/traveloop.git)
cd traveloop
2. Database Setup (XAMPP)
Before running the backend, you must initialize the database server.

Open the XAMPP Control Panel.

Start the Apache and MySQL modules.

Open your browser and go to http://localhost/phpmyadmin.

Click "New" and create a new, empty database named traveloop.

3. Backend Setup
Navigate to the backend folder, set up your virtual environment, and install the required dependencies.

Bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install required Python packages (including PyMySQL for XAMPP support)
pip install Flask Flask-CORS Flask-SQLAlchemy Flask-JWT-Extended requests werkzeug pymysql python-dotenv
Set up Backend Environment Variables:
Create a .env file in the backend folder to connect to your XAMPP server:

Code snippet
# Default XAMPP MySQL credentials (root user, empty password)
SQLALCHEMY_DATABASE_URI=mysql+pymysql://root:@localhost/traveloop
JWT_SECRET_KEY=super_secret_traveloop_key_that_is_long_enough_2026
Seed the Database:
Populate the database with 5 years of realistic travel history, mock users, activities, and expenses to immediately test the platform!

Bash
python seed.py
Run the Server:

Bash
python app.py
The backend will now be running on http://localhost:5000

4. Frontend Setup
Open a new terminal window/tab, ensure you are in the root folder containing your package.json, and install the Node modules.

Bash
# Install frontend dependencies
npm install

# Run the Vite development server
npm run dev
The React app will now be running on http://localhost:5173

🧪 Test Accounts
Since the database is pre-seeded with rich data, you can log in immediately with these accounts to explore the features:

1. Standard User (Pre-loaded with 5 years of trip history):

Email: alex@traveloop.com

Password: password123

2. Administrator (VIP Tier):

Email: admin@traveloop.com

Password: admin123

📂 Project Structure
Plaintext
traveloop/
├── backend/
│   ├── app.py              # Flask Application factory & Config
│   ├── models.py           # SQLAlchemy Database Models
│   ├── seed.py             # Algorithmic Database Seeder
│   └── routes/             # API Endpoints (auth, trips, stops, etc.)
├── src/                    # Frontend React Application
│   ├── api/                # Axios configuration & interceptors
│   ├── components/         # Reusable UI components (Navbar, etc.)
│   ├── pages/              # Main application views (Dashboard, CreateTrip)
│   └── store/              # Zustand global state (authStore, tripStore)
├── package.json            # Frontend dependencies
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # Project documentation
👨‍💻 Author
Developed by Tej Joshi for the Odoo Hackathon.

📜 License
This project was created for hackathon purposes. All rights reserved.
