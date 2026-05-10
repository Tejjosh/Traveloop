import { create } from 'zustand'
import api from '../api/axios'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Prevents screen flashing before we know who the user is

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token || token === 'undefined' || token === 'null') {
      set({ user: null, isAuthenticated: false, isLoading: false })
      return
    }
    
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data, isAuthenticated: true, isLoading: false })
    } catch (err) {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: (token, userData) => {
    localStorage.setItem('token', token)
    set({ user: userData, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false, isLoading: false })
  }
}))

export default useAuthStore
