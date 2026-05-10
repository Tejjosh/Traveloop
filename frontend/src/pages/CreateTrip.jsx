import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useTripStore from '../store/tripStore' 

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD']
const TRIP_TYPES = ['Adventure', 'Wellness', 'Cultural', 'Business', 'Romantic', 'Family']
const STEPS = ['Trip Basics', 'Destinations', 'Logistics & Budget']

export default function CreateTrip() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // NEW: State for Source/Origin City
  const [sourceCity, setSourceCity] = useState('')
  const [stopInput, setStopInput] = useState({ city_name: '', country: '', days: 1 })

  const { 
    tripDetails, updateTripDetail, 
    stops, addStop, removeStop, 
    activeStep, nextStep, prevStep, setStep,
    resetTrip
  } = useTripStore()

  // --- HELPER: Calculate Trip Duration ---
  const getTripDays = () => {
    if (!tripDetails.start_date || !tripDetails.end_date) return 0;
    const start = new Date(tripDetails.start_date);
    const end = new Date(tripDetails.end_date);
    if (start > end) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
  }

  const tripDays = getTripDays()

  const handleAddStop = () => {
    if (!stopInput.city_name.trim()) return
    addStop(stopInput)
    setStopInput({ city_name: '', country: '', days: 1 })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    // --- 1. THE "CORRECTNESS" ENGINE: VALIDATION ---
    if (!tripDetails.title?.trim()) {
        setError("Your journey needs a name before we can proceed.")
        setLoading(false)
        return
    }

    if (!tripDetails.start_date || !tripDetails.end_date) {
        setError("Please select both a Start Date and an End Date.")
        setLoading(false)
        return
    }

    const start = new Date(tripDetails.start_date)
    const end = new Date(tripDetails.end_date)
    if (start > end) {
      setError(`Wait a second! Your return date cannot be earlier than your start date.`)
      setLoading(false)
      return
    }

    if (!tripDetails.trip_type) {
        setError("Please select a Vibe & Style for your journey in Step 1.")
        setLoading(false)
        return
    }

    if (!sourceCity.trim()) {
        setError("Please enter your starting location (Origin) in Step 2.")
        setLoading(false)
        return
    }

    if (stops.length === 0) {
      setError("A journey of a thousand miles needs at least one stop. Please add a destination in Step 2.")
      setLoading(false)
      return
    }

    // --- 2. PERSISTENCE LAYER ---
    try {
      const res = await api.post('/trips/', {
        title: tripDetails.title,
        description: tripDetails.description,
        start_date: tripDetails.start_date,
        end_date: tripDetails.end_date,
        base_currency: tripDetails.base_currency,
        total_budget: parseFloat(tripDetails.total_budget) || 0,
        trip_type: tripDetails.trip_type,
        is_public: tripDetails.is_public,
      })
      
      const tripId = res.data.id

      // Combine Source City and Destinations for sequential saving
      const allStops = [
        { city_name: sourceCity, country: '', order_index: 0 },
        ...stops.map((s, idx) => ({ city_name: s.city_name, country: s.country, order_index: idx + 1 }))
      ]

      // Save all stops
      for (let i = 0; i < allStops.length; i++) {
        await api.post(`/trips/${tripId}/stops`, allStops[i])
      }
      
      resetTrip() 
      navigate(`/trips/${tripId}/itinerary`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize journey. Please check your network connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mist flex flex-col md:flex-row">
      
      {/* LEFT PANEL: Wizard Controls */}
      <div className="w-full md:w-1/2 lg:w-5/12 p-8 md:p-12 overflow-y-auto h-screen flex flex-col z-20 shadow-[10px_0_30px_rgba(0,0,0,0.05)] bg-mist">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pacific mb-2">Design Your Journey</h1>
          <p className="text-terracotta font-medium">Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-coconut rounded-full h-2 mb-8 relative overflow-hidden">
          <div 
            className="bg-citrus h-full rounded-full transition-all duration-500 ease-out absolute top-0 left-0" 
            style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {error && (
          <div className="bg-terracotta/10 border-l-4 border-terracotta text-pacific p-4 mb-6 rounded-r-md animate-shake">
            <p className="font-bold text-sm uppercase mb-1">Validation Error</p>
            {error}
          </div>
        )}

        <div className="flex-grow">
          {activeStep === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-pacific mb-2">Journey Title</label>
                <input 
                  value={tripDetails.title || ''} 
                  onChange={e => updateTripDetail('title', e.target.value)}
                  placeholder="e.g., The Kyoto Cultural Immersion"
                  className="w-full bg-white border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-citrus text-pacific" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-pacific mb-2">Start Date</label>
                  <input 
                    type="date" 
                    value={tripDetails.start_date || ''} 
                    onChange={e => {
                        updateTripDetail('start_date', e.target.value)
                        if (tripDetails.end_date && new Date(e.target.value) > new Date(tripDetails.end_date)) {
                            updateTripDetail('end_date', '')
                        }
                    }}
                    className="w-full bg-white border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-citrus" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-pacific mb-2">End Date</label>
                  <input 
                    type="date" 
                    value={tripDetails.end_date || ''} 
                    min={tripDetails.start_date || undefined}
                    onChange={e => updateTripDetail('end_date', e.target.value)}
                    disabled={!tripDetails.start_date}
                    className="w-full bg-white border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-citrus disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-pacific mb-2">Vibe & Style</label>
                <div className="flex flex-wrap gap-2">
                  {TRIP_TYPES.map(t => (
                    <button key={t} onClick={() => updateTripDetail('trip_type', t)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        tripDetails.trip_type === t ? 'bg-matcha text-mist shadow-md' : 'bg-white border border-coconut text-pacific hover:border-citrus'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* SOURCE SELECTION */}
              <div className="bg-white border border-coconut p-4 rounded-2xl shadow-sm">
                <label className="block text-sm font-bold text-pacific mb-2">Starting Location (Origin)</label>
                <input value={sourceCity} onChange={e => setSourceCity(e.target.value)}
                  placeholder="e.g. New York, London..." className="w-full rounded-xl px-4 py-3 focus:outline-none text-pacific bg-mist border border-transparent focus:border-citrus" />
              </div>

              {/* DESTINATION SELECTION */}
              <div className="bg-white border border-coconut p-4 rounded-2xl shadow-sm">
                <label className="block text-sm font-bold text-pacific mb-2">Where are you going?</label>
                <div className="flex gap-2">
                  <input value={stopInput.city_name} onChange={e => setStopInput(s => ({ ...s, city_name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStop()}
                    placeholder="e.g. Tokyo, Paris..." className="flex-1 rounded-xl px-4 py-3 focus:outline-none text-pacific bg-mist border border-transparent focus:border-citrus" />
                  <button onClick={handleAddStop} className="bg-citrus text-mist px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                    Add
                  </button>
                </div>
              </div>

              {stops.length > 0 && (
                <div className="space-y-3 mt-6">
                  {stops.map((stop, i) => (
                    <div key={stop.id || i} className="flex items-center justify-between bg-white p-4 rounded-xl border border-coconut shadow-sm group hover:border-citrus transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-pacific text-mist flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        <span className="font-bold text-pacific text-lg">{stop.city_name}</span>
                      </div>
                      <button onClick={() => removeStop(stop.id)} className="text-terracotta opacity-0 group-hover:opacity-100 hover:scale-110 font-bold px-2 transition-all">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-pacific mb-2">Total Budget Estimate</label>
                  <input type="number" value={tripDetails.total_budget || ''} onChange={e => updateTripDetail('total_budget', e.target.value)}
                    placeholder="e.g. 5000" className="w-full bg-white border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-citrus text-pacific" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-pacific mb-2">Currency</label>
                  <select value={tripDetails.base_currency || 'USD'} onChange={e => updateTripDetail('base_currency', e.target.value)}
                    className="w-full bg-white border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-citrus text-pacific">
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="bg-white border border-coconut p-5 rounded-2xl mt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={tripDetails.is_public || false} onChange={e => updateTripDetail('is_public', e.target.checked)}
                    className="w-5 h-5 accent-citrus mt-1 rounded" />
                  <span className="text-pacific font-medium text-sm">
                    <strong className="block text-base mb-1">Publish to Community Marketplace</strong>
                    Allow strangers to view, clone, and get inspired by this itinerary.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between mt-8 pt-6 border-t border-coconut">
          <button 
            onClick={prevStep}
            className={`font-bold py-3 px-6 rounded-xl transition-all ${activeStep === 0 ? 'opacity-0 pointer-events-none' : 'text-pacific bg-white border border-coconut hover:bg-mist'}`}
          >
            Back
          </button>
          
          {activeStep < STEPS.length - 1 ? (
            <button onClick={nextStep} className="bg-pacific text-mist font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="bg-citrus text-mist font-bold py-3 px-8 rounded-xl hover:shadow-[0_10px_20px_rgba(255,140,66,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {loading ? 'Initializing...' : 'Finalize Journey'}
            </button>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Dynamic Live Feedback */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 bg-pacific relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        
        {/* STEP 0: The Trip Dossier Preview */}
        {activeStep === 0 && (
            <div className="z-10 w-full max-w-md animate-fade-in-up">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-citrus rounded-bl-full opacity-20"></div>
                <div className="uppercase tracking-widest text-citrus text-xs font-bold mb-4">Trip Dossier</div>
                
                <h2 className="text-3xl font-bold text-pacific mb-8 leading-tight">
                  {tripDetails.title || "Your Epic Journey"}
                </h2>
                
                <div className="space-y-6">
                  <div className="flex justify-between border-b border-coconut pb-4">
                    <div>
                      <p className="text-xs text-pacific/50 uppercase font-bold mb-1">Departure</p>
                      <p className="text-pacific font-bold">{tripDetails.start_date || "Select Date"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-pacific/50 uppercase font-bold mb-1">Return</p>
                      <p className="text-pacific font-bold">{tripDetails.end_date || "Select Date"}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <p className="text-xs text-pacific/50 uppercase font-bold mb-1">Vibe</p>
                      <span className="bg-matcha/20 text-matcha px-3 py-1 rounded-full text-sm font-bold">
                        {tripDetails.trip_type || "Any"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-pacific/50 uppercase font-bold mb-1">Duration</p>
                      <p className="text-pacific font-black text-xl">{tripDays > 0 ? `${tripDays} Days` : "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
        
        {/* STEP 1: Visual Route Planner */}
        {activeStep === 1 && (
            <div className="z-10 w-full max-w-3xl animate-fade-in-up">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-mist text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="animate-pulse text-citrus">●</span> Visual Route Planner
                </h3>
                
                <div className="flex items-center gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  
                  {/* Origin Card (Text Only) */}
                  <div className="min-w-[150px] h-32 flex flex-col justify-center items-center bg-white/20 border-2 border-dashed border-white/50 rounded-2xl text-center p-4">
                    <span className="text-xs uppercase text-mist/70 font-bold mb-1">Origin</span>
                    <span className="text-lg font-bold text-mist">{sourceCity || 'Choose Start'}</span>
                  </div>

                  {stops.length > 0 && <span className="text-citrus text-2xl font-black">→</span>}

                  {/* Destination Cards (With Images) */}
                  {stops.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="min-w-[200px] h-32 relative rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 group flex-shrink-0">
                        {/* Dynamic Destination Image using Picsum seeded by City Name */}
                        <img 
                          src={`https://picsum.photos/seed/${s.city_name.replace(/\s+/g, '')}/400/300`} 
                          alt={s.city_name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-pacific/90 via-pacific/40 to-transparent"></div>
                        <div className="absolute bottom-3 left-4 right-4">
                          <span className="text-[10px] uppercase text-citrus font-bold bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">Stop {idx + 1}</span>
                          <p className="text-mist font-bold text-lg leading-tight mt-1 truncate">{s.city_name}</p>
                        </div>
                      </div>
                      {idx < stops.length - 1 && <span className="text-white/50 text-xl font-bold">→</span>}
                    </div>
                  ))}
                </div>
                
                {stops.length === 0 && (
                   <p className="text-mist/50 text-sm mt-4 italic">Add destinations to visualize your journey.</p>
                )}
              </div>
            </div>
        )}

        {/* STEP 2: Functional Budget Calculator */}
        {activeStep === 2 && (
            <div className="z-10 w-full max-w-md animate-fade-in-up">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-pacific">Budget Tracker</h3>
                  <span className="text-3xl">💰</span>
                </div>
                
                <div className="bg-mist p-6 rounded-2xl mb-6 border border-coconut text-center">
                  <p className="text-xs text-pacific/60 font-bold uppercase tracking-wider mb-2">Total Allocated</p>
                  <p className="text-4xl font-black text-citrus">
                    {tripDetails.total_budget ? `${tripDetails.total_budget}` : '0'} 
                    <span className="text-xl ml-1 text-pacific/50">{tripDetails.base_currency || 'USD'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-coconut p-4 rounded-2xl text-center shadow-sm">
                     <p className="text-xs text-pacific/60 font-bold uppercase tracking-wider mb-2">Trip Length</p>
                     <p className="text-xl font-bold text-pacific">{tripDays} Days</p>
                  </div>
                  <div className="bg-matcha/10 border border-matcha/20 p-4 rounded-2xl text-center shadow-sm">
                     <p className="text-xs text-matcha font-bold uppercase tracking-wider mb-2">Daily Budget</p>
                     <p className="text-xl font-bold text-matcha">
                        {tripDetails.total_budget && tripDays > 0 
                          ? `${(tripDetails.total_budget / tripDays).toFixed(2)}` 
                          : '0'}
                        <span className="text-sm ml-1">{tripDetails.base_currency || 'USD'}</span>
                     </p>
                  </div>
                </div>

                {(!tripDetails.total_budget || tripDetails.total_budget == 0) && (
                   <p className="text-center text-xs text-terracotta mt-6 font-medium bg-terracotta/10 py-2 rounded-lg">
                      Enter a budget on the left to calculate daily estimates.
                   </p>
                )}
              </div>
            </div>
        )}
      </div>

    </div>
  )
}