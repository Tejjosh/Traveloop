import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

export default function Community() {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  
  const [activeTab, setActiveTab] = useState('group') // 'group' | 'inspire' | 'guides'
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearch)

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const res = await api.get('/trips/public')
        setTrips(res.data)
      } catch (err) {
        console.error("Failed to fetch community trips", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCommunityData()
  }, [])

  const filteredTrips = trips.filter(trip => 
    trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.trip_type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupTrips = filteredTrips.filter(t => t.is_group_trip)
  const publicItineraries = filteredTrips.filter(t => !t.is_group_trip)

  const handleCloneItinerary = (tripId) => {
    // In production, this would call POST /api/trips/{id}/clone
    alert(`Itinerary #${tripId} cloned to your dashboard!`)
  }

  return (
    <div className="min-h-screen bg-mist pb-20">
      
      {/* Header section */}
      <div className="bg-pacific pt-16 pb-24 px-6 md:px-12 text-center rounded-b-[3rem] relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-mist mb-6 relative z-10">
          The Travel <span className="text-apricot italic">Marketplace</span>
        </h1>
        <div className="max-w-2xl mx-auto relative z-10 flex bg-white p-2 rounded-full shadow-lg items-center border border-coconut">
          <span className="text-xl px-4 text-pacific">🔍</span>
          <input 
            type="text" 
            placeholder="Search by city, vibe, or trip type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-pacific font-medium px-2"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-8 relative z-20">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-2 rounded-full shadow-md border border-coconut flex gap-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('group')}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'group' ? 'bg-citrus text-mist shadow-sm' : 'text-pacific hover:bg-coconut'}`}
            >
              👥 Travel With Strangers
            </button>
            <button 
              onClick={() => setActiveTab('inspire')}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'inspire' ? 'bg-pacific text-mist shadow-sm' : 'text-pacific hover:bg-coconut'}`}
            >
              🗺️ Public Itineraries
            </button>
            <button 
              onClick={() => setActiveTab('guides')}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'guides' ? 'bg-matcha text-mist shadow-sm' : 'text-pacific hover:bg-coconut'}`}
            >
              ⭐ Verified Guides
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-citrus"></div>
          </div>
        ) : (
          <>
            {/* TAB: Group Trips (Stranger Matchmaking) */}
            {activeTab === 'group' && (
              <div className="animate-fade-in-up">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-pacific">Upcoming Group Adventures</h2>
                  <p className="text-terracotta">Join vetted solo travelers on curated journeys.</p>
                </div>
                
                {groupTrips.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border border-coconut">
                    <p className="text-pacific/60 font-medium">No group trips match your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groupTrips.map(trip => (
                      <div key={trip.id} className="bg-white rounded-3xl p-6 border border-coconut shadow-sm hover:shadow-xl transition-shadow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="bg-apricot text-pacific text-xs font-bold px-3 py-1 rounded-full">{trip.trip_type || 'Adventure'}</span>
                            {trip.owner_loyalty === 'vip' && <span className="bg-pacific text-mist text-xs font-bold px-2 py-1 rounded-md">VIP Host</span>}
                          </div>
                          <h3 className="text-xl font-bold text-pacific mb-2">{trip.title}</h3>
                          <p className="text-sm text-pacific/70 mb-4">{trip.description || 'Join us for an unforgettable experience exploring the best local spots.'}</p>
                          
                          <div className="bg-coconut/50 p-3 rounded-xl mb-6">
                            <p className="text-xs text-pacific font-bold mb-1">Host</p>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-pacific text-mist flex items-center justify-center text-xs font-bold">
                                {trip.owner ? trip.owner.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <span className="text-sm font-medium text-pacific">{trip.owner || 'Anonymous'}</span>
                              <span className="text-matcha text-xs">✓ Verified</span>
                            </div>
                          </div>
                        </div>
                        <button className="w-full bg-citrus text-mist font-bold py-3 rounded-xl hover:bg-terracotta transition-colors">
                          Request to Join
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Public Itineraries */}
            {activeTab === 'inspire' && (
              <div className="animate-fade-in-up">
                 <div className="mb-8">
                  <h2 className="text-2xl font-bold text-pacific">Community Blueprints</h2>
                  <p className="text-terracotta">Clone and customize itineraries created by other travelers.</p>
                </div>
                
                {publicItineraries.length === 0 ? (
                   <div className="text-center py-12 bg-white rounded-3xl border border-coconut">
                     <p className="text-pacific/60 font-medium">No public itineraries match your search.</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {publicItineraries.map(trip => (
                      <div key={trip.id} className="bg-white rounded-3xl border border-coconut overflow-hidden flex flex-col sm:flex-row group hover:shadow-lg transition-all">
                        <div className="sm:w-1/3 bg-apricot relative min-h-[150px]">
                           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-30"></div>
                           <div className="absolute bottom-4 left-4 bg-mist/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-pacific">
                             {trip.stop_count} Stops
                           </div>
                        </div>
                        <div className="p-6 sm:w-2/3 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-pacific mb-1">{trip.title}</h3>
                            <p className="text-sm text-pacific/60 mb-4 line-clamp-2">{trip.description || 'A publicly shared journey.'}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-pacific/50">By {trip.owner || 'Traveler'}</span>
                            <button 
                              onClick={() => handleCloneItinerary(trip.id)}
                              className="text-citrus text-sm font-bold hover:text-terracotta flex items-center gap-1"
                            >
                              Clone Trip <span>📋</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Verified Guides */}
            {activeTab === 'guides' && (
              <div className="animate-fade-in-up">
                 <div className="mb-8">
                  <h2 className="text-2xl font-bold text-pacific">Local Experts & Guides</h2>
                  <p className="text-terracotta">Hire verified locals for premium cultural immersions.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-cols-4 gap-6">
                  {/* Hardcoded guides for structural demonstration */}
                  {[
                    { name: 'Kenji Sato', city: 'Kyoto, Japan', exp: 'Cultural Immersion', rating: 4.9 },
                    { name: 'Maria Silva', city: 'Lisbon, Portugal', exp: 'Food & Wine', rating: 5.0 },
                    { name: 'Arjun Desai', city: 'Jaipur, India', exp: 'Historical Tours', rating: 4.8 },
                    { name: 'Elena Rossi', city: 'Rome, Italy', exp: 'Art & Architecture', rating: 4.9 }
                  ].map((guide, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-coconut text-center hover:-translate-y-1 transition-transform">
                      <div className="w-20 h-20 mx-auto bg-apricot rounded-full mb-4 border-4 border-mist shadow-sm flex items-center justify-center text-2xl">
                        👤
                      </div>
                      <h3 className="text-lg font-bold text-pacific">{guide.name}</h3>
                      <p className="text-xs font-medium text-terracotta mb-2">{guide.city}</p>
                      <p className="text-sm text-pacific/70 mb-4">{guide.exp}</p>
                      <div className="flex justify-center items-center gap-1 mb-4">
                        <span className="text-citrus text-sm">★</span>
                        <span className="font-bold text-pacific text-sm">{guide.rating}</span>
                      </div>
                      <button className="w-full border border-pacific text-pacific font-bold py-2 rounded-xl hover:bg-pacific hover:text-mist transition-colors text-sm">
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}