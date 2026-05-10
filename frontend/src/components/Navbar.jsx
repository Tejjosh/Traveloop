import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-primary text-white px-6 py-3 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold text-accent">✈️ Traveloop</Link>
      <div className="flex gap-6 text-sm items-center">
        <Link to="/" className="hover:text-accent transition">Home</Link>
        <Link to="/trips" className="hover:text-accent transition">My Trips</Link>
        <Link to="/community" className="hover:text-accent transition">Community</Link>
        <span className="text-accent font-semibold">{user.name}</span>
        <button onClick={logout} className="bg-accent text-primary px-3 py-1 rounded font-semibold hover:opacity-90">
          Logout
        </button>
      </div>
    </nav>
  )
}