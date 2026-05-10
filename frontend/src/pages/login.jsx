import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useGoogleLogin } from '@react-oauth/google'
import useAuthStore from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Use the central store for both login methods
  const loginStore = useAuthStore(state => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', formData)
      // Use the store instead of manual localStorage.setItem
      loginStore(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true)
        // This sends the ACCESS_TOKEN to your Flask server
        const res = await api.post('/auth/google', { token: tokenResponse.access_token })
        loginStore(res.data.token, res.data.user)
        navigate('/dashboard')
      } catch (err) {
        console.error("Google Server Error:", err.response?.data)
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
    <div className="min-h-screen bg-mist flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="text-4xl font-bold tracking-tight text-pacific mb-2 inline-block">
          <span className="font-serif text-apricot text-5xl mr-1">⚲</span>Traveloop<span className="text-citrus">.</span>
        </Link>
        <h2 className="mt-4 text-center text-3xl font-serif font-bold tracking-tight text-pacific">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-pacific/60 font-medium">
          Ready for your next adventure?
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-pacific/5 sm:rounded-3xl sm:px-10 border border-coconut">
          
          {error && <div className="bg-terracotta/10 text-terracotta p-4 rounded-xl mb-6 font-bold text-sm border border-terracotta/20 text-center">{error}</div>}

          <button 
            type="button"
            onClick={() => handleGoogleAuth()}
            className="w-full bg-white border border-coconut text-pacific font-bold py-3 rounded-xl hover:bg-mist transition-colors shadow-sm flex items-center justify-center mb-6"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-coconut"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-pacific/50 font-bold uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-pacific mb-2">Email Address</label>
              <input
                type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-mist border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:border-citrus text-pacific transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-pacific mb-2">Password</label>
              <input
                type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-mist border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:border-citrus text-pacific transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button disabled={loading} className="w-full bg-citrus text-mist font-bold py-3.5 rounded-xl hover:bg-terracotta transition-all hover:shadow-lg disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Sign In with Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}