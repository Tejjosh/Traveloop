import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Community() {
  const [trips, setTrips] = useState([])
  const [cloning, setCloning] = useState(null)
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/trips/public').then(res => setTrips(res.data))
  }, [])

  const cloneTrip = async (trip) => {
    setCloning(trip.id)
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await api.post('/trips/', {
        title: `Copy of ${trip.title}`,
        description: trip.description,
        start_date: trip.start_date,
        end_date: trip.end_date,
        base_currency: 'USD',
        total_budget: 0,
        is_public: false,
      })
      setSuccess(`Trip cloned! Redirecting...`)
      setTimeout(() => navigate(`/trips/${res.data.id}/itinerary`), 1500)
    } catch {
      alert('Failed to clone trip')
    } finally {
      setCloning(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-primary mb-2">🌐 Community Trips</h2>
      <p className="text-gray-500 mb-6">Discover and clone trips shared by other travelers</p>

      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 rounded-xl p-3 mb-4 text-sm font-medium">
          ✅ {success}
        </div>
      )}

      {trips.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-5xl mb-4">🌍</p>
          <p className="text-gray-500">No public trips yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-primary">{trip.title}</h3>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{trip.stop_count} stops</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">by <span className="font-medium text-gray-600">{trip.owner}</span></p>
              <p className="text-sm text-gray-400 mb-3">{trip.start_date} → {trip.end_date}</p>
              {trip.description && <p className="text-sm text-gray-500 mb-4">{trip.description}</p>}
              <button onClick={() => cloneTrip(trip)} disabled={cloning === trip.id}
                className="w-full bg-accent text-primary font-bold py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50 text-sm">
                {cloning === trip.id ? 'Cloning...' : '📋 Clone This Itinerary'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}