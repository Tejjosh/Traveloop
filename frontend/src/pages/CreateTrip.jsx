import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD']
const TRIP_TYPES = ['Adventure', 'Cultural', 'Beach', 'Business', 'Romantic', 'Family']
const PACE = ['Relaxed', 'Moderate', 'Fast']

const STEPS = ['Trip Basics', 'Destinations', 'Budget & Prefs', 'Review']

export default function CreateTrip() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', start_date: '', end_date: '',
    base_currency: 'INR', total_budget: '', is_public: false,
    trip_type: 'Cultural', pace: 'Moderate', stops: []
  })
  const [stopInput, setStopInput] = useState({ city_name: '', country: '' })

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const addStop = () => {
    if (!stopInput.city_name.trim()) return
    update('stops', [...form.stops, { ...stopInput, id: Date.now() }])
    setStopInput({ city_name: '', country: '' })
  }

  const removeStop = (id) => update('stops', form.stops.filter(s => s.id !== id))

  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim()) return 'Trip title is required'
      if (!form.start_date) return 'Start date is required'
      if (!form.end_date) return 'End date is required'
      if (form.end_date < form.start_date) return 'End date must be after start date'
    }
    if (step === 1) {
      if (form.stops.length === 0) return 'Add at least one destination'
    }
    if (step === 2) {
      if (!form.total_budget || parseFloat(form.total_budget) <= 0)
        return 'Enter a valid budget'
    }
    return null
  }

  const next = () => {
    const err = validateStep()
    if (err) return setError(err)
    setError('')
    setStep(s => s + 1)
  }

  const prev = () => { setError(''); setStep(s => s - 1) }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await api.post('/trips/', {
        title: form.title,
        description: form.description,
        start_date: form.start_date,
        end_date: form.end_date,
        base_currency: form.base_currency,
        total_budget: parseFloat(form.total_budget),
        is_public: form.is_public,
      })
      const tripId = res.data.id

      // Add stops
      for (let i = 0; i < form.stops.length; i++) {
        await api.post(`/trips/${tripId}/stops`, {
          city_name: form.stops[i].city_name,
          country: form.stops[i].country,
          order_index: i
        })
      }

      // Smart packing based on trip type
      const packingMap = {
        Adventure: ['Hiking Boots', 'First Aid Kit', 'Water Bottle', 'Sunscreen', 'Backpack'],
        Beach: ['Swimsuit', 'Sunscreen', 'Flip Flops', 'Beach Towel', 'Sunglasses'],
        Cultural: ['Comfortable Shoes', 'Camera', 'Travel Guide', 'Modest Clothing'],
        Business: ['Laptop', 'Business Cards', 'Formal Wear', 'Charger'],
        Romantic: ['Formal Outfit', 'Camera', 'Gift', 'Perfume'],
        Family: ['First Aid Kit', 'Snacks', 'Kids Entertainment', 'Sunscreen'],
      }
      const items = packingMap[form.trip_type] || []
      for (const item of items) {
        await api.post(`/trips/${tripId}/packing`, { name: item, category: 'general' })
      }

      navigate(`/trips/${tripId}/itinerary`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  const progressWidth = `${((step) / (STEPS.length - 1)) * 100}%`

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">🗺️ Plan a New Trip</h1>
          <p className="text-gray-500 mt-1">Let's build your perfect itinerary step by step</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className={`text-xs font-semibold ${i <= step ? 'text-primary' : 'text-gray-400'}`}>
                {s}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{ width: progressWidth }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {STEPS.map((_, i) => (
              <div key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                  i <= step ? 'bg-accent border-accent' : 'bg-white border-gray-300'
                }`} />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Step 0 — Trip Basics */}
          {step === 0 && (
            <div className="space-y-4 animate-fade">
              <h2 className="text-xl font-bold text-primary mb-4">✏️ Trip Basics</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Title *</label>
                <input value={form.title} onChange={e => update('title', e.target.value)}
                  placeholder="e.g. Europe Summer Adventure"
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  placeholder="What's this trip about?"
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input type="date" value={form.end_date} onChange={e => update('end_date', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
                <div className="flex flex-wrap gap-2">
                  {TRIP_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => update('trip_type', t)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                        form.trip_type === t
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Pace</label>
                <div className="flex gap-2">
                  {PACE.map(p => (
                    <button key={p} type="button" onClick={() => update('pace', p)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition ${
                        form.pace === p
                          ? 'bg-accent text-primary border-accent'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-accent'
                      }`}>
                      {p === 'Relaxed' ? '🐢 Relaxed' : p === 'Moderate' ? '🚶 Moderate' : '🏃 Fast'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Destinations */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary mb-4">📍 Add Destinations</h2>
              <div className="flex gap-2">
                <input value={stopInput.city_name}
                  onChange={e => setStopInput(s => ({ ...s, city_name: e.target.value }))}
                  placeholder="City name *"
                  onKeyDown={e => e.key === 'Enter' && addStop()}
                  className="flex-1 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                <input value={stopInput.country}
                  onChange={e => setStopInput(s => ({ ...s, country: e.target.value }))}
                  placeholder="Country"
                  className="w-32 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                <button type="button" onClick={addStop}
                  className="bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-blue-900 transition font-semibold">
                  Add
                </button>
              </div>

              {form.stops.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                  <p className="text-3xl mb-2">🌍</p>
                  <p>Add your first destination above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {form.stops.map((stop, i) => (
                    <div key={stop.id} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-primary">{stop.city_name}</span>
                          {stop.country && <span className="text-gray-400 text-sm ml-2">{stop.country}</span>}
                        </div>
                      </div>
                      <button onClick={() => removeStop(stop.id)} className="text-red-400 hover:text-red-600 text-lg">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Budget & Prefs */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary mb-4">💰 Budget & Preferences</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget *</label>
                  <input type="number" value={form.total_budget} onChange={e => update('total_budget', e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select value={form.base_currency} onChange={e => update('base_currency', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary">
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <input type="checkbox" id="public" checked={form.is_public}
                  onChange={e => update('is_public', e.target.checked)}
                  className="w-4 h-4 accent-primary" />
                <label htmlFor="public" className="text-sm text-gray-700">
                  <span className="font-semibold">Make this trip public</span>
                  <span className="text-gray-400 ml-1">— visible in Community tab for others to discover</span>
                </label>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                💡 <strong>Smart Packing:</strong> Based on your trip type (<strong>{form.trip_type}</strong>),
                we'll auto-add recommended packing items when you create the trip!
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary mb-4">✅ Review Your Trip</h2>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Title</span>
                  <span className="font-semibold text-primary">{form.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Dates</span>
                  <span className="font-semibold">{form.start_date} → {form.end_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Type & Pace</span>
                  <span className="font-semibold">{form.trip_type} · {form.pace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Budget</span>
                  <span className="font-semibold text-green-600">{form.base_currency} {parseFloat(form.total_budget).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Visibility</span>
                  <span className={`font-semibold ${form.is_public ? 'text-blue-600' : 'text-gray-500'}`}>
                    {form.is_public ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">📍 Destinations ({form.stops.length})</p>
                <div className="flex flex-wrap gap-2">
                  {form.stops.map((s, i) => (
                    <span key={s.id} className="bg-primary text-white text-xs px-3 py-1 rounded-full">
                      {i + 1}. {s.city_name}
                    </span>
                  ))}
                </div>
              </div>

              {form.trip_type && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                  🎒 Smart packing items will be auto-added for <strong>{form.trip_type}</strong> trip type
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={prev}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium">
                ← Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button onClick={next}
                className="px-8 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-blue-900 transition">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="px-8 py-2.5 bg-accent text-primary font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50">
                {loading ? '✈️ Creating...' : '🚀 Create Trip!'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}