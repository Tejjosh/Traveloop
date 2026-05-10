import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Dashboard() {
  const [trips, setTrips] = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    api.get('/trips/').then(res => setTrips(res.data.slice(0, 3)))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-8 text-white mb-8">
        <h2 className="text-3xl font-bold mb-1">Welcome back, {user.name}! 🌍</h2>
        <p className="text-blue-200">Ready to plan your next adventure?</p>
        <Link to="/trips/new" className="mt-4 inline-block bg-accent text-primary font-bold px-6 py-2 rounded-lg hover:opacity-90 transition">
          + Plan a New Trip
        </Link>
      </div>

      <h3 className="text-xl font-bold text-primary mb-4">Recent Trips</h3>
      {trips.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🗺️</p>
          <p>No trips yet. Start planning your first adventure!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-xl shadow p-5 border border-gray-100 hover:shadow-md transition">
              <h4 className="font-bold text-primary text-lg">{trip.title}</h4>
              <p className="text-sm text-gray-500">{trip.start_date} → {trip.end_date}</p>
              <p className="text-sm text-gray-400 mt-1">{trip.stop_count} stop(s)</p>
              <Link to={`/trips/${trip.id}/itinerary`} className="mt-3 inline-block text-accent font-semibold text-sm hover:underline">
                View Itinerary →
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Trips', icon: '🧳', to: '/trips' },
          { label: 'Community', icon: '🌐', to: '/community' },
          { label: 'Plan New Trip', icon: '➕', to: '/trips/new' },
        ].map(item => (
          <Link key={item.label} to={item.to}
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md hover:border-accent transition">
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-sm font-semibold text-primary">{item.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
