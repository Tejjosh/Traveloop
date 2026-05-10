import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function ItineraryBuilder() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // State for adding a new activity
  const [activeStopId, setActiveStopId] = useState(null)
  const [activityForm, setActivityForm] = useState({
    title: '', type: 'sightseeing', cost: '', duration_minutes: 60, is_premium_cultural: false
  })

  useEffect(() => {
    fetchTripDetails()
  }, [id])

  const fetchTripDetails = async () => {
    try {
      const res = await api.get(`/trips/${id}`)
      setTrip(res.data)
    } catch (err) {
      console.error("Failed to load itinerary", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivity = async (e) => {
    e.preventDefault()
    if (!activityForm.title.trim()) return

    try {
      await api.post(`/stops/${activeStopId}/activities`, {
        ...activityForm,
        cost: parseFloat(activityForm.cost) || 0
      })
      
      // Reset form and refresh data
      setActivityForm({ title: '', type: 'sightseeing', cost: '', duration_minutes: 60, is_premium_cultural: false })
      setActiveStopId(null)
      fetchTripDetails()
    } catch (err) {
      alert("Failed to add activity")
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-mist flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pacific"></div>
    </div>
  )

  if (!trip) return <div className="text-center mt-20 text-pacific text-xl">Trip not found.</div>

  return (
    <div className="min-h-screen bg-mist flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT PANEL: Timeline & Activities */}
      <div className="w-full md:w-1/2 lg:w-5/12 p-6 md:p-10 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
        
        {/* Header Section */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-sm font-bold text-pacific/50 hover:text-citrus mb-4 inline-block">← Back to Dashboard</Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-pacific mb-2">{trip.title}</h1>
              <p className="text-terracotta font-medium text-sm">
                {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right bg-white p-3 rounded-2xl border border-coconut shadow-sm">
              <p className="text-xs text-pacific/60 font-bold uppercase tracking-wider mb-1">Budget</p>
              <p className="text-xl font-bold text-matcha">{trip.base_currency} {trip.budget_summary?.remaining.toLocaleString()}</p>
              <p className="text-xs text-pacific/50 font-medium">remaining</p>
            </div>
          </div>
        </div>

        {/* Timeline Stops */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-citrus before:to-pacific/20">
          
          {trip.stops?.map((stop, index) => (
            <div key={stop.id} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Timeline Node */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-mist bg-pacific text-mist font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                {index + 1}
              </div>

              {/* Stop Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-3xl border border-coconut shadow-sm hover:shadow-lg transition-all relative">
                
                <h3 className="text-xl font-bold text-pacific mb-1">{stop.city_name}</h3>
                
                {/* Activities List */}
                <div className="mt-4 space-y-3">
                  {stop.activities?.map(act => (
                    <div key={act.id} className={`p-3 rounded-xl border ${act.is_premium_cultural ? 'bg-apricot/20 border-apricot' : 'bg-coconut/30 border-coconut'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-pacific text-sm">{act.title}</span>
                        <span className="text-matcha text-xs font-bold">{trip.base_currency} {act.cost}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-pacific/50 tracking-wider">{act.type}</span>
                        <span className="text-[10px] text-pacific/50">• {act.duration_minutes} min</span>
                      </div>
                      {act.is_premium_cultural && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-gradient-to-r from-citrus to-terracotta text-mist px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm">
                          <span>✨</span> Authentic Cultural Immersion
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Activity Trigger/Form */}
                {activeStopId === stop.id ? (
                  <form onSubmit={handleAddActivity} className="mt-4 bg-mist p-4 rounded-xl border border-coconut animate-fade-in-up">
                    <input 
                      type="text" placeholder="Activity Title" required
                      value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})}
                      className="w-full text-sm bg-white border border-coconut rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-citrus text-pacific"
                    />
                    <div className="flex gap-2 mb-2">
                      <select 
                        value={activityForm.type} onChange={e => setActivityForm({...activityForm, type: e.target.value})}
                        className="flex-1 text-sm bg-white border border-coconut rounded-lg px-2 py-2 focus:outline-none text-pacific"
                      >
                        <option value="sightseeing">Sightseeing</option>
                        <option value="food">Food & Dining</option>
                        <option value="adventure">Adventure</option>
                      </select>
                      <input 
                        type="number" placeholder="Cost" required
                        value={activityForm.cost} onChange={e => setActivityForm({...activityForm, cost: e.target.value})}
                        className="w-24 text-sm bg-white border border-coconut rounded-lg px-2 py-2 focus:outline-none text-pacific"
                      />
                    </div>
                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={activityForm.is_premium_cultural} 
                        onChange={e => setActivityForm({...activityForm, is_premium_cultural: e.target.checked})}
                        className="accent-citrus w-4 h-4"
                      />
                      <span className="text-xs font-bold text-terracotta">Flag as Premium Cultural Event (e.g. Indian Wedding)</span>
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-pacific text-mist text-xs font-bold py-2 rounded-lg hover:bg-pacific/90">Save</button>
                      <button type="button" onClick={() => setActiveStopId(null)} className="flex-1 bg-white text-pacific border border-coconut text-xs font-bold py-2 rounded-lg">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setActiveStopId(stop.id)}
                    className="mt-4 w-full border-2 border-dashed border-coconut text-pacific/50 font-bold text-sm py-2 rounded-xl hover:border-citrus hover:text-citrus transition-colors"
                  >
                    + Add Experience
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Interactive Mapbox Environment */}
      <div className="hidden md:block md:w-1/2 lg:w-7/12 bg-pacific relative overflow-hidden h-[calc(100vh-80px)]">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        
        {/* Placeholder for Mapbox React GL */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-12">
           <div className="bg-mist/10 backdrop-blur-md p-6 rounded-3xl border border-mist/20 shadow-2xl flex flex-col items-center max-w-md text-center">
             <div className="w-20 h-20 bg-matcha rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(63,78,54,0.6)] animate-pulse">
               🌍
             </div>
             <h2 className="text-2xl font-bold text-mist mb-2">Live Routing Engine</h2>
             <p className="text-apricot font-medium text-sm mb-6">Connecting to Mapbox API to render geographical vectors for {trip.stops?.length} destinations.</p>
             
             {/* Dynamic Route Visualizer */}
             <div className="w-full flex items-center justify-between px-4">
                {trip.stops?.map((stop, i) => (
                  <div key={stop.id} className="flex flex-col items-center relative">
                    <div className="w-4 h-4 rounded-full bg-citrus border-2 border-mist z-10"></div>
                    <span className="text-[10px] text-mist mt-2 font-bold absolute -bottom-5 whitespace-nowrap">{stop.city_name}</span>
                    {i < trip.stops.length - 1 && (
                      <div className="absolute top-2 left-4 w-full h-[2px] bg-gradient-to-r from-citrus to-transparent"></div>
                    )}
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>

    </div>
  )
}