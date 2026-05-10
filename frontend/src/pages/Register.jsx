import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useGoogleLogin } from '@react-oauth/google'
import useAuthStore from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', formData)
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

const loginStore = useAuthStore(state => state.login)

const handleGoogleAuth = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      setLoading(true)
      // Send the Google access token to your Flask backend for verification
      const res = await api.post('/auth/google', { token: tokenResponse.access_token })
      loginStore(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError('Google Sign-In failed on our servers.')
    } finally {
      setLoading(false)
    }
  },
  onError: () => {
    setError('Google Sign-In was cancelled or failed.')
  }
})
  return (
    <div className="min-h-screen bg-mist flex">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link to="/" className="text-2xl font-bold tracking-tight text-pacific mb-8 inline-block">
            <span className="font-serif text-apricot text-3xl mr-1">⚲</span>Traveloop<span className="text-citrus">.</span>
          </Link>
          
          <h1 className="text-4xl font-serif font-bold text-pacific mb-2">Begin Your Journey</h1>
          <p className="text-pacific/60 font-medium mb-8">Join the community of experiential travelers.</p>

          {error && <div className="bg-terracotta/10 text-terracotta p-4 rounded-xl mb-6 font-bold text-sm border border-terracotta/20">{error}</div>}

          {/* Social Auth Button */}
          <button 
            onClick={handleGoogleAuth}
            className="w-full bg-white border border-coconut text-pacific font-bold py-3 rounded-xl hover:bg-mist transition-colors shadow-sm flex items-center justify-center mb-6"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-coconut"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-mist px-4 text-pacific/50 font-bold uppercase tracking-wider">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-pacific mb-2">Full Name</label>
              <input 
                type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:border-citrus text-pacific transition-colors"
                placeholder="Kenji Sato"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-pacific mb-2">Email Address</label>
              <input 
                type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:border-citrus text-pacific transition-colors"
                placeholder="kenji@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-pacific mb-2">Password</label>
              <input 
                type="password" required minLength="6" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:border-citrus text-pacific transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            <button disabled={loading} className="w-full bg-pacific text-mist font-bold py-3.5 rounded-xl hover:bg-pacific/90 transition-all hover:shadow-lg disabled:opacity-50 mt-4">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-pacific/60 text-sm mt-8 font-medium">
            Already a traveler? <Link to="/login" className="text-citrus font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>

      {/* Right Panel: Visual Hook */}
      <div className="hidden lg:flex lg:w-1/2 bg-pacific relative items-center justify-center overflow-hidden p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-pacific via-pacific/40 to-transparent"></div>
        
        <div className="relative z-10 bg-mist/10 backdrop-blur-md p-10 rounded-3xl border border-mist/20 max-w-lg text-mist">
          <div className="text-4xl mb-4">🌍</div>
          <h2 className="text-3xl font-bold mb-4 font-serif">More than just an itinerary.</h2>
          <ul className="space-y-4 font-medium text-mist/90">
            <li className="flex gap-3 items-center">
              <span className="bg-matcha p-1 rounded-full text-xs">✓</span> Smart route mapping
            </li>
            <li className="flex gap-3 items-center">
              <span className="bg-matcha p-1 rounded-full text-xs">✓</span> Dynamic budgeting
            </li>
            <li className="flex gap-3 items-center">
              <span className="bg-matcha p-1 rounded-full text-xs">✓</span> Connect with local guides & travelers
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}