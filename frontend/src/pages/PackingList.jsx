import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'

const CATEGORIES = ['clothing', 'documents', 'electronics', 'general']

export default function PackingList() {
  const { id } = useParams()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', category: 'general' })
  const [error, setError] = useState('')

  const fetchItems = () => api.get(`/trips/${id}/packing`).then(res => setItems(res.data))
  useEffect(() => { fetchItems() }, [id])

  const addItem = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Item name is required')
    setError('')
    await api.post(`/trips/${id}/packing`, form)
    setForm({ name: '', category: 'general' })
    fetchItems()
  }

  const toggleItem = async (itemId) => {
    await api.patch(`/trips/packing/${itemId}/toggle`)
    fetchItems()
  }

  const packed = items.filter(i => i.is_packed).length

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-primary mb-2">🎒 Packing Checklist</h2>
      <p className="text-gray-500 mb-6">{packed} of {items.length} items packed</p>

      <div className="bg-white rounded-xl shadow p-5 mb-6">
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={addItem} className="flex gap-2">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Add item..." className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-900">Add</button>
        </form>
      </div>

      {CATEGORIES.map(cat => {
        const catItems = items.filter(i => i.category === cat)
        if (catItems.length === 0) return null
        return (
          <div key={cat} className="bg-white rounded-xl shadow p-5 mb-4">
            <h3 className="font-bold text-primary capitalize mb-3">{cat}</h3>
            <div className="space-y-2">
              {catItems.map(item => (
                <div key={item.id} onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition ${item.is_packed ? 'opacity-60' : ''}`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.is_packed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {item.is_packed && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={item.is_packed ? 'line-through text-gray-400' : 'text-gray-700'}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}