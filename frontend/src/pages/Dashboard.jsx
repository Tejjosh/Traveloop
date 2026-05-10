import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

// --- MOCK DATA: Curated Group Adventures ---
const MOCK_GROUP_ADVENTURES = [
  {
    id: 'g1',
    title: 'Outback Exploration & Networking',
    location: 'Perth, Australia',
    duration: '10 Days',
    price: '$1,850',
    spots: { filled: 6, total: 10 },
    tags: ['FIFO Industry', 'Networking', 'Adventure'],
    image: 'https://picsum.photos/seed/outback/400/300'
  },
  {
    id: 'g2',
    title: 'Green Catalyst Innovation Retreat',
    location: 'Stockholm, Sweden',
    duration: '7 Days',
    price: '$1,200',
    spots: { filled: 12, total: 15 },
    tags: ['Sustainability', 'Tech', 'Vegetarian Friendly'],
    image: 'https://picsum.photos/seed/stockholm/400/300'
  },
  {
    id: 'g3',
    title: 'European Stadium Tour',
    location: 'London & Madrid',
    duration: '8 Days',
    price: '$2,100',
    spots: { filled: 8, total: 8 },
    tags: ['Football', 'City Break', 'Waitlist'],
    image: 'https://picsum.photos/seed/stadium/400/300'
  }
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioInput, setBioInput] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, tripsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/trips/')
        ])
        setUser(userRes.data)
        setBioInput(userRes.data.bio || '')
        setTrips(tripsRes.data)
      } catch (err) {
        console.error("Failed to load dashboard", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleUpdateBio = async () => {
    try {
      await api.put('/auth/me', { ...user, bio: bioInput })
      setUser({ ...user, bio: bioInput })
      setIsEditingBio(false)
    } catch (err) {
      alert("Failed to update profile.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pacific"></div>
      </div>
    )
  }

  const upcomingTrips = trips.filter(t => new Date(t.start_date) >= new Date())
  const pastTrips = trips.filter(t => new Date(t.start_date) < new Date())

  return (
    <div className="min-h-screen bg-mist py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile & Monetization */}
        <div className="space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-8 border border-coconut shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-pacific"></div>
            <div className="relative z-10 text-center mt-6">
              <div className="w-24 h-24 mx-auto bg-apricot rounded-full border-4 border-white shadow-md flex items-center justify-center text-4xl mb-4">
                {user?.profile_image_url ? (
                  <img src={user.profile_image_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-pacific">{user?.name}</h2>
              <p className="text-sm text-pacific/60 mb-4">{user?.city || 'Global Traveler'}</p>
              
              {/* Bio Section */}
              <div className="bg-coconut/30 rounded-xl p-4 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-terracotta uppercase tracking-wider">Traveler Bio</span>
                  <button onClick={() => setIsEditingBio(!isEditingBio)} className="text-xs text-citrus font-bold hover:underline">
                    {isEditingBio ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                {isEditingBio ? (
                  <div className="flex flex-col gap-2">
                    <textarea 
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      className="w-full text-sm p-2 rounded border border-coconut focus:outline-none focus:border-citrus text-pacific"
                      rows="3"
                      placeholder="Share your travel style for the community..."
                    />
                    <button onClick={handleUpdateBio} className="bg-pacific text-mist text-xs py-2 rounded font-bold hover:bg-pacific/90">
                      Save Bio
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-pacific/80 italic">
                    {user?.bio ? `"${user.bio}"` : "No bio added. Add one to stand out in the Community Marketplace!"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Monetization / Loyalty Tier Upsell */}
          <div className="bg-pacific text-mist rounded-3xl p-8 border border-pacific/80 shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-citrus rounded-full blur-3xl opacity-20"></div>
            <h3 className="text-lg font-serif font-bold text-apricot mb-2">Traveloop Passport</h3>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold uppercase">{user?.loyalty_tier || 'Free'}</span>
              <span className="bg-matcha text-mist text-xs font-bold px-2 py-1 rounded">Active</span>
            </div>
            
            {user?.loyalty_tier === 'free' ? (
              <>
                <p className="text-sm text-mist/80 mb-6">Upgrade to Premium to unlock AI-driven packing lists, VIP support, and exclusive cultural immersion tickets.</p>
                <button className="w-full bg-citrus text-mist font-bold py-3 rounded-xl hover:bg-terracotta transition-colors shadow-md">
                  Upgrade to Premium
                </button>
              </>
            ) : (
              <p className="text-sm text-apricot mb-6">Thank you for being a Premium member! Enjoy your exclusive perks.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Trip Management */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 border border-coconut shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-pacific">Ready for your next adventure?</h2>
              <p className="text-sm text-pacific/60">Launch the smart wizard to start mapping.</p>
            </div>
            <Link to="/trips/new" className="bg-citrus text-mist font-bold py-3 px-8 rounded-xl hover:-translate-y-1 hover:shadow-lg transition-all whitespace-nowrap">
              + Plan New Trip
            </Link>
          </div>

          {/* Upcoming Trips */}
          <div>
            <h3 className="text-lg font-bold text-pacific mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-matcha rounded-full animate-pulse"></span>
              Upcoming & Drafted Journeys
            </h3>
            {upcomingTrips.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-coconut rounded-3xl p-8 text-center">
                <p className="text-pacific/60">No upcoming trips. It's time to start planning!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingTrips.map(trip => (
                  <Link key={trip.id} to={`/trips/${trip.id}/itinerary`} className="group bg-white rounded-2xl p-5 border border-coconut shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40 relative overflow-hidden">
                     {trip.is_group_trip && <div className="absolute top-0 right-0 bg-citrus text-mist text-[10px] font-bold px-2 py-1 rounded-bl-lg">Group Trip</div>}
                     <div>
                       <h4 className="font-bold text-pacific text-lg group-hover:text-citrus transition-colors">{trip.title}</h4>
                       <p className="text-xs text-pacific/50 mb-2">{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
                     </div>
                     <div className="flex justify-between items-end">
                       <span className="text-sm font-medium text-matcha">{trip.stop_count} Stops</span>
                       <span className="text-citrus text-sm font-bold group-hover:translate-x-1 transition-transform">→</span>
                     </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* NEW FEATURE: Upcoming Group Adventures */}
          <div className="pt-4">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold text-pacific">Upcoming Group Adventures</h3>
                <p className="text-sm text-pacific/60">Join vetted solo travelers on curated journeys.</p>
              </div>
              <Link to="/community" className="text-citrus text-sm font-bold hover:underline hidden sm:block">
                View All Groups →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_GROUP_ADVENTURES.map(group => {
                const isFull = group.spots.filled >= group.spots.total
                const fillPercentage = (group.spots.filled / group.spots.total) * 100

                return (
                  <div key={group.id} className="bg-white rounded-3xl border border-coconut shadow-sm overflow-hidden group hover:shadow-lg transition-all flex flex-col">
                    {/* Image Header */}
                    <div className="h-40 w-full relative overflow-hidden">
                      <img src={group.image} alt={group.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-pacific/90 text-mist text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                          {group.duration}
                        </span>
                        {isFull && <span className="bg-terracotta/90 text-mist text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">Waitlist Only</span>}
                      </div>
                    </div>
                    
                    {/* Content Body */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-pacific text-lg mb-1">{group.title}</h4>
                        <p className="text-xs text-pacific/60 flex items-center gap-1 mb-3">
                          <span className="text-citrus">📍</span> {group.location}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {group.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-coconut text-pacific font-bold px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Capacity & Pricing */}
                      <div className="border-t border-coconut pt-4 mt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-pacific/60">
                            Spots: {group.spots.filled} / {group.spots.total}
                          </span>
                          <span className="font-black text-pacific">{group.price}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-mist rounded-full h-2 mb-4 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-terracotta' : 'bg-matcha'}`}
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>

                        <button className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                          isFull 
                            ? 'bg-coconut text-pacific/50 cursor-not-allowed' 
                            : 'bg-citrus text-mist hover:bg-terracotta'
                        }`}>
                          {isFull ? 'Join Waitlist' : 'Request to Join'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Past Trips */}
          <div>
            <h3 className="text-lg font-bold text-pacific/60 mb-4">Past Adventures</h3>
            {pastTrips.length === 0 ? (
              <p className="text-sm text-pacific/40">Your completed journeys will appear here.</p>
            ) : (
              <div className="space-y-3">
                {pastTrips.map(trip => (
                  <Link key={trip.id} to={`/trips/${trip.id}/itinerary`} className="bg-coconut/20 rounded-xl p-4 border border-coconut flex justify-between items-center hover:bg-coconut/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-pacific/80">{trip.title}</h4>
                      <p className="text-xs text-pacific/50">{new Date(trip.start_date).toLocaleDateString()}</p>
                    </div>
                    <span className="bg-pacific/10 text-pacific text-xs font-bold px-3 py-1 rounded-full">Completed</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}