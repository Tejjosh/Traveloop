import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import MyTrips from './pages/MyTrips'
import CreateTrip from './pages/CreateTrip'
import ItineraryBuilder from './pages/ItineraryBuilder'
import BudgetTracker from './pages/BudgetTracker'
import PackingList from './pages/PackingList'
import TripNotes from './pages/TripNotes'
import Community from './pages/Community'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'

// Secure Wrapper for Normal Users
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  
  // Secondary check to ensure we don't redirect mid-check
  if (isLoading) return null 
  return isAuthenticated ? children : <Navigate to="/login" />
}

// Secure Wrapper for Admins Only
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" />
  
  // Admin check based on your specific credentials
  const isAdmin = user?.email === 'admin@traveloop.com' || user?.is_admin === true
  
  return isAdmin ? children : <Navigate to="/dashboard" />
}

export default function App() {
  const { checkAuth, isLoading } = useAuthStore()

  // Validate token on initial app load
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  /**
   * CRITICAL: This global loading check prevents the "reset on refresh" bug.
   * It stops the Router from rendering until checkAuth() finishes its 
   * handshake with your Flask backend.
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-t-4 border-pacific border-r-transparent rounded-full"></div>
          <p className="text-pacific font-bold animate-pulse">Syncing your journey...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/trips" element={<PrivateRoute><MyTrips /></PrivateRoute>} />
        <Route path="/trips/new" element={<PrivateRoute><CreateTrip /></PrivateRoute>} />
        <Route path="/trips/:id/itinerary" element={<PrivateRoute><ItineraryBuilder /></PrivateRoute>} />
        <Route path="/trips/:id/budget" element={<PrivateRoute><BudgetTracker /></PrivateRoute>} />
        <Route path="/trips/:id/packing" element={<PrivateRoute><PackingList /></PrivateRoute>} />
        <Route path="/trips/:id/notes" element={<PrivateRoute><TripNotes /></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />

        {/* Admin Route */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  )
}