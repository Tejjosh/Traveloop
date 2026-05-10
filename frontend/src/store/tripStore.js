// src/store/tripStore.js
import { create } from 'zustand'

const useTripStore = create((set, get) => ({
  // --- STATE ---
  tripDetails: {
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    base_currency: 'USD',
    total_budget: '',
    is_public: false,
    trip_type: 'Cultural',
  },
  stops: [],
  activeStep: 0,

  // --- ACTIONS ---
  
  // Updates basic trip parameters
  updateTripDetail: (key, value) => set((state) => ({
    tripDetails: { ...state.tripDetails, [key]: value }
  })),

  // Navigation for the wizard
  nextStep: () => set((state) => ({ activeStep: state.activeStep + 1 })),
  prevStep: () => set((state) => ({ activeStep: Math.max(0, state.activeStep - 1) })),
  setStep: (stepNumber) => set({ activeStep: stepNumber }),

  // Stops management
  addStop: (stopData) => set((state) => {
    // Generate a temporary ID for UI rendering before saving to DB
    const newStop = { ...stopData, id: `temp_${Date.now()}` }
    return { stops: [...state.stops, newStop] }
  }),

  removeStop: (stopId) => set((state) => ({
    stops: state.stops.filter(s => s.id !== stopId)
  })),

  updateStop: (stopId, newValues) => set((state) => ({
    stops: state.stops.map(s => s.id === stopId ? { ...s, ...newValues } : s)
  })),

  // Reset the store after successful submission
  resetTrip: () => set({
    tripDetails: {
      title: '', description: '', start_date: '', end_date: '',
      base_currency: 'USD', total_budget: '', is_public: false, trip_type: 'Cultural'
    },
    stops: [],
    activeStep: 0
  })
}))

export default useTripStore
