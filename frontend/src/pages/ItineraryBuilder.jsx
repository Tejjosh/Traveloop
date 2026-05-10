import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function ItineraryBuilder() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [stopForm, setStopForm] = useState({ city_name: '', country: '', arrival_date: '', departure_date: '' })
  const [actForms, setActForms] = useState({})
  const [error, setError] = useState('')

  const fetchTrip = () => api.get(`/trips/${id}`).then(res => setTrip(res.data))
  useEffect(() => { fetchTrip() }, [id])

  const addStop = async (e) => {
    e.preventDefault()
    if (!stopForm.city_name.trim()) return setError('City name is required')
    setError('')
    await api.post(`/trips/${id}/stops`, { ...stopForm, order_index: trip.stops.length })
    setStopForm({ city_name: '', country: '', arrival_date: '', departure_date: '' })
    fetchTrip()
  }

  const addActivity = async (stopId) => {
    const form = actForms[stopId] || {}
    if (!form.title?.trim()) return
    await api.post(`/trips/stops/${stopId}/activities`, form)
    setActForms({ ...actForms, [stopId]: {} })
    fetchTrip()
  }

  if (!trip) return <div className="text-center py-16 text-gray-400">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">{trip.title}</h2>
          <p className="text-gray-500 text-sm">{trip.start_date} → {trip.end_date}</p>
        </div>
        <Link to={`/trips/${id}/budget`} className="bg-accent text-primary font-bold px-4 py-2 rounded-lg hover:opacity-90">
          💰 Budget Tracker
        </Link>
      </div>

      {/* Add Stop Form */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h3 className="font-bold text-primary mb-3">+ Add a Stop</h3>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={addStop} className="grid grid-cols-2 gap-3">
          <input value={stopForm.city_name} onChange={e => setStopForm({ ...stopForm, city_name: e.target.value })}
            placeholder="City Name *" className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          <input value={stopForm.country} onChange={e => setStopForm({ ...stopForm, country: e.target.value })}
            placeholder="Country" className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="date" value={stopForm.arrival_date} onChange={e => setStopForm({ ...stopForm, arrival_date: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="date" value={stopForm.departure_date} onChange={e => setStopForm({ ...stopForm, departure_date: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          <button type="submit" className="col-span-2 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-900 transition">
            Add Stop
          </button>
        </form>
      </div>

      {/* Stops List */}
      {trip.stops.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No stops yet. Add your first city above!</p>
      ) : (
        <div className="space-y-4">
          {trip.stops.map((stop, i) => (
            <div key={stop.id} className="bg-white rounded-xl shadow p-5 border-l-4 border-accent">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-primary">📍 {stop.city_name}{stop.country ? `, ${stop.country}` : ''}</h3>
                  <p className="text-sm text-gray-400">{stop.arrival_date} → {stop.departure_date}</p>
                </div>
                <span className="text-xs bg-primary text-white px-2 py-1 rounded">Stop {i + 1}</span>
              </div>

              {/* Activities */}
              <div className="space-y-2 mb-3">
                {stop.activities.map(act => (
                  <div key={act.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span>🎯 {act.title} <span className="text-gray-400">({act.type})</span></span>
                    <span className="text-green-600 font-semibold">{act.currency} {act.cost}</span>
                  </div>
                ))}
              </div>

              {/* Add Activity */}
              <div className="grid grid-cols-4 gap-2">
                <input value={actForms[stop.id]?.title || ''}
                  onChange={e => setActForms({ ...actForms, [stop.id]: { ...actForms[stop.id], title: e.target.value } })}
                  placeholder="Activity name" className="col-span-2 border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <select value={actForms[stop.id]?.type || 'sightseeing'}
                  onChange={e => setActForms({ ...actForms, [stop.id]: { ...actForms[stop.id], type: e.target.value } })}
                  className="border rounded-lg px-2 py-1 text-sm focus:outline-none">
                  <option value="sightseeing">Sightseeing</option>
                  <option value="food">Food</option>
                  <option value="adventure">Adventure</option>
                  <option value="transport">Transport</option>
                </select>
                <input type="number" value={actForms[stop.id]?.cost || ''}
                  onChange={e => setActForms({ ...actForms, [stop.id]: { ...actForms[stop.id], cost: e.target.value } })}
                  placeholder="Cost" className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <button onClick={() => addActivity(stop.id)}
                  className="col-span-4 bg-accent text-primary text-sm font-semibold py-1 rounded-lg hover:opacity-90">
                  + Add Activity
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}