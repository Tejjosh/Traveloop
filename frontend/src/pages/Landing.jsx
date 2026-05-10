import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Landing() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingTrips, setTrendingTrips] = useState([])
  const [groupTrips, setGroupTrips] = useState([])

  useEffect(() => {
    // Fetch trending and community trips for the landing page
    api.get('/trips/public').then(res => {
      // In a real app, the backend would sort these by algorithmic relevance
      setTrendingTrips(res.data.slice(0, 3))
      setGroupTrips(res.data.filter(t => t.is_group_trip).slice(0, 3))
    }).catch(err => console.log('Wait for backend to spin up', err))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/community?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-mist">
      
      {/* 1. Dynamic Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Video Background Fallback (Using an image for now, replace with WebM video URL) */}
        <div className="absolute inset-0 bg-pacific">
          <img 
            src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pacific via-pacific/60 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-16 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-mist mb-6 leading-tight">
            Design Your Next <span className="text-apricot italic">Masterpiece</span>
          </h1>
          <p className="text-lg md:text-xl text-coconut mb-10 font-medium max-w-2xl mx-auto">
            Experience the world differently. Curate hyper-personalized itineraries, join verified group adventures, or unlock premium cultural immersions.
          </p>

          {/* Advanced Global Search */}
          <form onSubmit={handleSearch} className="flex bg-white p-2 rounded-full shadow-2xl max-w-2xl mx-auto items-center border-4 border-white/20 backdrop-blur-md">
            <span className="text-2xl px-4 text-pacific">🌍</span>
            <input 
              type="text" 
              placeholder="Where is your next adventure?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-pacific font-medium text-lg px-2"
            />
            <button type="submit" className="bg-citrus text-mist px-8 py-4 rounded-full font-bold hover:shadow-lg hover:bg-terracotta transition-colors">
              Explore
            </button>
          </form>
        </div>
      </section>

      {/* 2. Algorithmic Recommendations */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-pacific mb-2">Trending Journeys</h2>
            <p className="text-terracotta font-medium">Curated by our algorithm based on traveler engagement.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingTrips.map((trip, i) => (
            <div key={trip.id || i} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-coconut cursor-pointer hover:-translate-y-2">
              <div className="h-48 bg-apricot relative overflow-hidden">
                {/* Fallback pattern if no cover_image_url */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-30"></div>
                <div className="absolute top-4 right-4 bg-mist/90 text-pacific px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                  {trip.trip_type || 'Cultural'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-pacific mb-2 group-hover:text-citrus transition-colors">{trip.title}</h3>
                <p className="text-pacific/70 text-sm mb-4 line-clamp-2">{trip.description || 'A beautiful journey across multiple destinations.'}</p>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-matcha">{trip.stop_count} Stops</span>
                  <Link to={trip.id ? `/trips/${trip.id}/itinerary` : '/register'} className="text-citrus hover:text-terracotta">
                    View Itinerary →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Community Module Teaser */}
      <section className="py-24 px-6 bg-pacific text-mist relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-matcha rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-citrus rounded-full blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-apricot font-bold tracking-widest uppercase text-sm mb-2 block">The Marketplace</span>
            <h2 className="text-4xl font-serif font-bold mb-4">Travel With Strangers</h2>
            <p className="text-mist/80 text-lg">Join verified group trips curated by experienced travelers. Filter by budget, vibe, and duration to find your perfect squad.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hardcoded teaser cards to ensure UI displays perfectly even if backend is empty */}
            <div className="bg-mist/10 backdrop-blur-md rounded-3xl p-8 border border-mist/20 flex flex-col justify-between">
              <div>
                <span className="inline-block bg-citrus text-mist text-xs font-bold px-3 py-1 rounded-full mb-4">Wellness Retreat</span>
                <h3 className="text-2xl font-bold mb-2">Bali Spiritual Cleanse</h3>
                <p className="text-apricot mb-6">Hosted by <span className="text-white font-medium">Sarah Jenkins</span> (Verified Guide ✓)</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-mist/70 mb-1">Estimated Cost</p>
                  <p className="text-2xl font-bold text-matcha">$1,250</p>
                </div>
                <Link to="/register" className="bg-mist text-pacific font-bold px-6 py-2 rounded-xl hover:bg-apricot transition-colors">
                  Join Waitlist
                </Link>
              </div>
            </div>

            <div className="bg-mist/10 backdrop-blur-md rounded-3xl p-8 border border-mist/20 flex flex-col justify-between">
              <div>
                <span className="inline-block bg-terracotta text-mist text-xs font-bold px-3 py-1 rounded-full mb-4">Adventure</span>
                <h3 className="text-2xl font-bold mb-2">Patagonia Circuit Trek</h3>
                <p className="text-apricot mb-6">Hosted by <span className="text-white font-medium">Alex Rivera</span> (Verified Guide ✓)</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-mist/70 mb-1">Estimated Cost</p>
                  <p className="text-2xl font-bold text-matcha">$2,800</p>
                </div>
                <Link to="/register" className="bg-mist text-pacific font-bold px-6 py-2 rounded-xl hover:bg-apricot transition-colors">
                  Join Waitlist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}