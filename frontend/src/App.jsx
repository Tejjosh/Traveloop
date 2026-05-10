import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MyTrips from './pages/MyTrips'
import CreateTrip from './pages/CreateTrip'
import ItineraryBuilder from './pages/ItineraryBuilder'
import BudgetTracker from './pages/BudgetTracker'
import PackingList from './pages/PackingList'
import TripNotes from './pages/TripNotes'
import Community from './pages/Community'
import Navbar from './components/Navbar'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Navbar /><Dashboard /></PrivateRoute>} />
        <Route path="/trips" element={<PrivateRoute><Navbar /><MyTrips /></PrivateRoute>} />
        <Route path="/trips/new" element={<PrivateRoute><Navbar /><CreateTrip /></PrivateRoute>} />
        <Route path="/trips/:id/itinerary" element={<PrivateRoute><Navbar /><ItineraryBuilder /></PrivateRoute>} />
        <Route path="/trips/:id/budget" element={<PrivateRoute><Navbar /><BudgetTracker /></PrivateRoute>} />
        <Route path="/trips/:id/packing" element={<PrivateRoute><Navbar /><PackingList /></PrivateRoute>} />
        <Route path="/trips/:id/notes" element={<PrivateRoute><Navbar /><TripNotes /></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><Navbar /><Community /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}