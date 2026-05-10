import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Pull perfectly synced state from Zustand
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout() // Clears token and global state securely
    navigate('/')
  }

  // Hide Navbar completely on Login/Register screens
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null
  }

  const isAdmin = user?.email === 'admin@traveloop.com' || user?.is_admin === true

  return (
    <nav className="bg-pacific/95 text-mist py-4 px-6 md:px-12 sticky top-0 z-50 border-b border-white/10 backdrop-blur-lg shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <span className="text-3xl font-serif text-apricot group-hover:-rotate-12 transition-transform duration-300">⚲</span>
          <span className="text-2xl font-black tracking-tight text-white">Traveloop<span className="text-citrus">.</span></span>
        </Link>

        {/* Right Side Navigation */}
        <div className="flex items-center gap-4 md:gap-8 font-medium">
          {isAuthenticated ? (
            <>
              {/* Desktop Links */}
              <div className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-mist/80 hover:text-white transition-colors">Dashboard</Link>
                <Link to="/trips" className="text-mist/80 hover:text-white transition-colors">My Journeys</Link>
                <Link to="/community" className="text-mist/80 hover:text-white transition-colors">Marketplace</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-terracotta hover:text-citrus transition-colors text-sm uppercase tracking-wider font-bold">
                    Admin
                  </Link>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="h-8 w-px bg-white/20 hidden md:block"></div>
              
              {/* User Controls */}
              <div className="flex items-center gap-3 md:gap-4">
                <Link to="/profile" className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-citrus transition-all overflow-hidden flex items-center justify-center bg-apricot text-pacific font-bold shrink-0 shadow-md transform hover:scale-105" title="Profile Settings">
                  {user?.profile_image_url ? (
                    <img src={user?.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </Link>
                
                <button onClick={handleLogout} className="hidden sm:block bg-white/10 hover:bg-terracotta text-mist px-5 py-2 rounded-full transition-all text-sm font-bold shadow-sm hover:shadow-md">
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-mist/80 hover:text-white transition-colors font-semibold">Sign In</Link>
              <Link to="/register" className="bg-citrus text-mist px-6 py-2.5 rounded-full font-bold hover:bg-apricot hover:text-pacific hover:shadow-[0_4px_14px_rgba(255,140,66,0.4)] transition-all transform hover:-translate-y-0.5">
                Start Planning
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}