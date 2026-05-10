import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function BudgetTracker() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expenseForm, setExpenseForm] = useState({ category: 'food', description: '', amount: '', currency: 'USD' })

  useEffect(() => {
    fetchTrip()
  }, [id])

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}`)
      setTrip(res.data)
      setExpenseForm(prev => ({ ...prev, currency: res.data.base_currency }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/trips/${id}/expenses`, { ...expenseForm, amount: parseFloat(expenseForm.amount) })
      setExpenseForm({ category: 'food', description: '', amount: '', currency: trip.base_currency })
      fetchTrip() // Refresh totals
    } catch (err) {
      alert("Failed to add expense")
    }
  }

  if (loading) return <div className="min-h-screen bg-mist flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pacific"></div></div>

  const summary = trip?.budget_summary
  const percentSpent = Math.min((summary?.total_spent / summary?.total_budget) * 100, 100) || 0

  return (
    <div className="min-h-screen bg-mist py-10 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <Link to={`/trips/${id}/itinerary`} className="text-sm font-bold text-pacific/50 hover:text-citrus mb-6 inline-block">← Back to Itinerary</Link>
        <h1 className="text-3xl font-bold text-pacific mb-8">Budget Dashboard</h1>

        {/* Top Analytics Card */}
        <div className="bg-white rounded-3xl p-8 border border-coconut shadow-sm mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-bold text-pacific/50 uppercase">Total Budget</p>
              <h2 className="text-3xl font-bold text-pacific">{trip?.base_currency} {summary?.total_budget.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-pacific/50 uppercase">Remaining</p>
              <h2 className={`text-3xl font-bold ${summary?.remaining < 0 ? 'text-terracotta' : 'text-matcha'}`}>
                {trip?.base_currency} {summary?.remaining.toLocaleString()}
              </h2>
            </div>
          </div>
          
          <div className="w-full bg-coconut rounded-full h-4 mb-2 overflow-hidden">
            <div 
              className={`h-4 rounded-full transition-all duration-1000 ${percentSpent > 90 ? 'bg-terracotta' : percentSpent > 70 ? 'bg-citrus' : 'bg-matcha'}`}
              style={{ width: `${percentSpent}%` }}
            ></div>
          </div>
          <p className="text-xs text-pacific/60 font-bold text-right">{percentSpent.toFixed(1)}% spent</p>
        </div>

        {/* Split Section: Form & Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl p-8 border border-coconut shadow-sm">
            <h3 className="text-xl font-bold text-pacific mb-4">Add Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-pacific/60 mb-1">Description</label>
                <input type="text" required value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="w-full bg-mist border border-coconut rounded-xl px-4 py-2 focus:outline-none focus:border-citrus text-pacific" placeholder="e.g. Sushi Dinner" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-pacific/60 mb-1">Amount</label>
                  <input type="number" required value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="w-full bg-mist border border-coconut rounded-xl px-4 py-2 focus:outline-none focus:border-citrus text-pacific" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-pacific/60 mb-1">Category</label>
                  <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="w-full bg-mist border border-coconut rounded-xl px-4 py-2 focus:outline-none focus:border-citrus text-pacific">
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="stay">Stay</option>
                    <option value="activity">Activity</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-pacific text-mist font-bold py-3 rounded-xl hover:bg-pacific/90 transition-colors">Log Expense</button>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-coconut shadow-sm">
            <h3 className="text-xl font-bold text-pacific mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {['stay', 'transport', 'food', 'activity'].map(cat => (
                <div key={cat} className="flex justify-between items-center border-b border-coconut pb-2">
                  <span className="capitalize font-bold text-pacific/80">{cat}</span>
                  <span className="font-bold text-pacific">{trip?.base_currency} {summary?.breakdown[cat]?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}