import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function MyTrips() {
  const [trips, setTrips] = useState([])

  const fetchTrips = () => api.get('/trips/').then(res => setTrips(res.data))
  useEffect(() => { fetchTrips() }, [])

  const deleteTrip = async (id) => {
    if (!confirm('Delete this trip?')) return
    await api.delete(`/trips/${id}`)
    fetchTrips()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">🧳 My Trips</h2>
        <Link to="/trips/new" className="bg-accent text-primary font-bold px-4 py-2 rounded-lg hover:opacity-90">
          + New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">✈️</p>
          <p className="text-lg">No trips yet!</p>
          <Link to="/trips/new" className="mt-4 inline-block text-accent font-semibold hover:underline">Plan your first trip</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-xl shadow p-5 border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-primary">{trip.title}</h3>
                <p className="text-sm text-gray-500">{trip.start_date} → {trip.end_date} · {trip.stop_count} stop(s)</p>
                {trip.description && <p className="text-sm text-gray-400 mt-1">{trip.description}</p>}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <Link to={`/trips/${trip.id}/itinerary`} className="text-xs bg-primary text-white px-3 py-1 rounded-lg hover:opacity-90">Itinerary</Link>
                <Link to={`/trips/${trip.id}/budget`} className="text-xs bg-accent text-primary px-3 py-1 rounded-lg font-semibold hover:opacity-90">Budget</Link>
                <Link to={`/trips/${trip.id}/packing`} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:opacity-90">Packing</Link>
                <Link to={`/trips/${trip.id}/notes`} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:opacity-90">Notes</Link>
                <button onClick={() => deleteTrip(trip.id)} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:opacity-90">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}