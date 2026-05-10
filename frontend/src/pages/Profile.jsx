import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Profile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general') // general, community, subscription
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    country: '',
    bio: '',
    profile_image_url: '',
    loyalty_tier: 'free'
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me')
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          city: res.data.city || '',
          country: res.data.country || '',
          bio: res.data.bio || '',
          profile_image_url: res.data.profile_image_url || '',
          loyalty_tier: res.data.loyalty_tier || 'free'
        })
      } catch (err) {
        setMessage({ text: 'Failed to load profile data.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      await api.put('/auth/me', {
        name: formData.name,
        city: formData.city,
        country: formData.country,
        bio: formData.bio,
        profile_image_url: formData.profile_image_url
      })
      setMessage({ text: 'Profile updated successfully!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to update profile.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    const confirm = window.confirm("Are you sure you want to delete your account? This action cannot be undone and will erase all your itineraries.")
    if (confirm) {
      // In production, wire this to DELETE /auth/me
      localStorage.removeItem('token')
      navigate('/')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-mist flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pacific"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-mist py-10 px-6 md:px-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Settings Sidebar Navigation */}
        <div className="w-full md:w-1/4">
          <h1 className="text-3xl font-bold text-pacific mb-6">Settings</h1>
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('general')}
              className={`text-left px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'general' ? 'bg-white text-citrus shadow-sm border border-coconut' : 'text-pacific/70 hover:bg-coconut/50'}`}
            >
              👤 General Details
            </button>
            <button 
              onClick={() => setActiveTab('community')}
              className={`text-left px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'community' ? 'bg-white text-citrus shadow-sm border border-coconut' : 'text-pacific/70 hover:bg-coconut/50'}`}
            >
              🌍 Community Profile
            </button>
            <button 
              onClick={() => setActiveTab('subscription')}
              className={`text-left px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'subscription' ? 'bg-white text-citrus shadow-sm border border-coconut' : 'text-pacific/70 hover:bg-coconut/50'}`}
            >
              💳 Traveloop Passport
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-3xl p-8 border border-coconut shadow-sm min-h-[500px]">
            
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-matcha/10 text-matcha border border-matcha/20' : 'bg-terracotta/10 text-terracotta border border-terracotta/20'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* TAB: General Details */}
              {activeTab === 'general' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-pacific mb-6">Personal Information</h2>
                  
                  <div className="flex items-center gap-6 mb-8 bg-coconut/20 p-6 rounded-2xl border border-coconut/50">
                    <div className="w-20 h-20 bg-apricot rounded-full border-4 border-white shadow-sm flex items-center justify-center text-3xl overflow-hidden shrink-0">
                      {formData.profile_image_url ? (
                        <img src={formData.profile_image_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{formData.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="w-full">
                      <label className="block text-xs font-bold text-pacific/50 uppercase tracking-wider mb-2">Avatar URL</label>
                      <input 
                        type="text" name="profile_image_url" value={formData.profile_image_url} onChange={handleChange}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full bg-white border border-coconut rounded-lg px-4 py-2 focus:outline-none focus:border-citrus text-sm text-pacific"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-pacific mb-2">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required
                        className="w-full bg-mist border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:border-citrus text-pacific" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-pacific mb-2">Email Address (Read Only)</label>
                      <input type="email" value={formData.email} disabled
                        className="w-full bg-mist/50 border border-coconut/50 rounded-xl px-4 py-3 text-pacific/50 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-pacific mb-2">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange}
                        className="w-full bg-mist border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:border-citrus text-pacific" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-pacific mb-2">Country</label>
                      <input type="text" name="country" value={formData.country} onChange={handleChange}
                        className="w-full bg-mist border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:border-citrus text-pacific" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Community Profile */}
              {activeTab === 'community' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-pacific mb-2">Community Profile</h2>
                  <p className="text-terracotta text-sm font-medium mb-6">This information is visible when you publish itineraries or join group trips.</p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-pacific mb-2">Traveler Bio</label>
                    <textarea 
                      name="bio" value={formData.bio} onChange={handleChange} rows="5"
                      placeholder="What kind of traveler are you? What are your favorite destinations?"
                      className="w-full bg-mist border border-coconut rounded-xl px-4 py-3 focus:outline-none focus:border-citrus text-pacific" 
                    />
                    <p className="text-xs text-pacific/50 mt-2 font-medium">Keep it brief and engaging. Max 500 characters.</p>
                  </div>
                  
                  <div className="bg-coconut/30 p-5 rounded-2xl border border-coconut flex items-start gap-4">
                    <div className="text-2xl">🔒</div>
                    <div>
                      <h4 className="font-bold text-pacific mb-1">Privacy Notice</h4>
                      <p className="text-xs text-pacific/70 leading-relaxed">Your email address and exact upcoming trip dates are never shared publicly unless you explicitly mark an itinerary as a "Group Trip" in the Community Marketplace.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Subscription / Passport */}
              {activeTab === 'subscription' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-pacific mb-6">Traveloop Passport</h2>
                  
                  <div className="bg-pacific text-mist p-8 rounded-3xl relative overflow-hidden mb-8 border border-pacific/80 shadow-lg">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-citrus rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
                     <p className="text-apricot font-bold tracking-widest uppercase text-xs mb-2 relative z-10">Current Plan</p>
                     <h3 className="text-4xl font-serif font-bold mb-4 relative z-10 capitalize">{formData.loyalty_tier} Tier</h3>
                     
                     {formData.loyalty_tier === 'free' && (
                       <ul className="text-sm space-y-2 mb-6 relative z-10 text-mist/80">
                         <li className="flex items-center gap-2"><span>✓</span> Standard Itinerary Builder</li>
                         <li className="flex items-center gap-2"><span>✓</span> Basic Community Access</li>
                         <li className="flex items-center gap-2 text-mist/40"><span>✕</span> Premium Cultural Immersion Booking</li>
                         <li className="flex items-center gap-2 text-mist/40"><span>✕</span> Verified Guide Matchmaking</li>
                       </ul>
                     )}
                     
                     {formData.loyalty_tier === 'free' && (
                       <button type="button" className="bg-citrus text-mist font-bold py-3 px-8 rounded-xl hover:bg-terracotta transition-colors shadow-md relative z-10">
                         Upgrade to Premium
                       </button>
                     )}
                  </div>
                  
                  <div className="border-t border-coconut pt-8 mt-8">
                    <h3 className="text-lg font-bold text-terracotta mb-2">Danger Zone</h3>
                    <p className="text-sm text-pacific/60 mb-4">Permanently delete your account and wipe all itinerary data from our servers.</p>
                    <button type="button" onClick={handleDeleteAccount} className="border-2 border-terracotta text-terracotta font-bold py-2 px-6 rounded-xl hover:bg-terracotta hover:text-mist transition-colors text-sm">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Action (Hidden on Subscription tab) */}
              {activeTab !== 'subscription' && (
                <div className="mt-8 pt-6 border-t border-coconut flex justify-end">
                  <button type="submit" disabled={saving} className="bg-pacific text-mist font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}