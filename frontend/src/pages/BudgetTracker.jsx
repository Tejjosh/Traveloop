import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../api/axios'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD']
const COLORS = { transport: '#3B82F6', stay: '#10B981', food: '#F59E0B', activity: '#8B5CF6' }
const CATEGORIES = ['transport', 'stay', 'food', 'activity']

export default function BudgetTracker() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ category: 'food', description: '', amount: '', currency: 'USD', date: '' })
  const [error, setError] = useState('')

  const fetchData = async () => {
    const [tripRes, expRes] = await Promise.all([api.get(`/trips/${id}`), api.get(`/trips/${id}/expenses`)])
    setTrip(tripRes.data)
    setExpenses(expRes.data)
  }
  useEffect(() => { fetchData() }, [id])

  const addExpense = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Enter a valid amount')
    if (!form.date) return setError('Date is required')
    setError('')
    await api.post(`/trips/${id}/expenses`, form)
    setForm({ category: 'food', description: '', amount: '', currency: 'USD', date: '' })
    fetchData()
  }

  const deleteExpense = async (expId) => {
    await api.delete(`/trips/expenses/${expId}`)
    fetchData()
  }

  if (!trip) return <div className="text-center py-16 text-gray-400">Loading...</div>

  const { budget_summary: bs } = trip
  const pieData = Object.entries(bs.breakdown)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v }))
  const overBudget = bs.remaining < 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-primary mb-2">💰 Budget Tracker</h2>
      <p className="text-gray-500 mb-6">{trip.title} · Base currency: <strong>{trip.base_currency}</strong></p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-2xl font-bold text-primary">{trip.base_currency} {bs.total_budget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-orange-500">{trip.base_currency} {bs.total_spent.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl shadow p-4 text-center ${overBudget ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className="text-sm text-gray-500">Remaining</p>
          <p className={`text-2xl font-bold ${overBudget ? 'text-red-600' : 'text-green-600'}`}>
            {trip.base_currency} {Math.abs(bs.remaining).toLocaleString()} {overBudget ? '⚠️ Over!' : '✅'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-primary mb-3">Spending Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${trip.base_currency} ${v.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Add Expense Form */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-primary mb-3">+ Add Expense</h3>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <form onSubmit={addExpense} className="space-y-3">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="Amount *"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            <button type="submit" className="w-full bg-accent text-primary font-bold py-2 rounded-lg hover:opacity-90">
              Add Expense (auto-converts to {trip.base_currency})
            </button>
          </form>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-bold text-primary mb-3">All Expenses</h3>
        {expenses.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No expenses logged yet.</p>
        ) : (
          <div className="space-y-2">
            {expenses.map(e => (
              <div key={e.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2">
                <div>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full mr-2 font-semibold"
                    style={{ background: COLORS[e.category] + '22', color: COLORS[e.category] }}>
                    {e.category}
                  </span>
                  <span className="text-sm text-gray-700">{e.description || '—'}</span>
                  <span className="text-xs text-gray-400 ml-2">{e.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">{e.currency} {e.amount}</span>
                  <button onClick={() => deleteExpense(e.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}