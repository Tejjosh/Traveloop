import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function PackingList() {
  const { id } = useParams()
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [tripInfo, setTripInfo] = useState(null)

  useEffect(() => {
    // Simulated fetch for packing list and trip context
    api.get(`/trips/${id}`).then(res => {
      setTripInfo(res.data)
      // Simulate backend returning smart suggestions based on trip_type
      generateSmartSuggestions(res.data.trip_type)
    })
  }, [id])

  const generateSmartSuggestions = (type) => {
    const baseItems = [
      { id: 1, name: 'Passport & ID', is_packed: false, category: 'documents' },
      { id: 2, name: 'Phone Charger & Adapter', is_packed: false, category: 'electronics' }
    ]
    if (type === 'Adventure') baseItems.push({ id: 3, name: 'Hiking Boots', is_packed: false, category: 'clothing' })
    if (type === 'Cultural') baseItems.push({ id: 4, name: 'Modest Temple Clothing', is_packed: false, category: 'clothing' })
    setItems(baseItems)
  }

  const handleAddItem = (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setItems([...items, { id: Date.now(), name: newItem, is_packed: false, category: 'misc' }])
    setNewItem('')
  }

  const togglePacked = (itemId) => {
    setItems(items.map(i => i.id === itemId ? { ...i, is_packed: !i.is_packed } : i))
  }

  return (
    <div className="min-h-screen bg-mist py-10 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <Link to={`/trips/${id}/itinerary`} className="text-sm font-bold text-pacific/50 hover:text-citrus mb-6 inline-block">← Back to Itinerary</Link>
        
        <div className="bg-pacific text-mist rounded-3xl p-8 mb-8 relative overflow-hidden shadow-lg border border-pacific/80">
          <div className="absolute top-0 right-0 w-32 h-32 bg-citrus rounded-full blur-3xl opacity-20"></div>
          <h1 className="text-3xl font-bold mb-2">Smart Packing Algorithm</h1>
          <p className="text-apricot font-medium text-sm">Suggestions tailored for your {tripInfo?.trip_type} journey to {tripInfo?.stops?.[0]?.city_name || 'your destination'}.</p>
        </div>

        <form onSubmit={handleAddItem} className="flex gap-2 mb-8 bg-white p-2 rounded-2xl border border-coconut shadow-sm">
          <input 
            type="text" value={newItem} onChange={e => setNewItem(e.target.value)}
            placeholder="Add a specific item..." 
            className="flex-1 bg-transparent px-4 focus:outline-none text-pacific font-medium"
          />
          <button type="submit" className="bg-citrus text-mist font-bold px-6 py-3 rounded-xl hover:bg-terracotta transition-colors">Add</button>
        </form>

        <div className="bg-white rounded-3xl p-8 border border-coconut shadow-sm">
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-mist/50 rounded-xl transition-colors group">
                <input 
                  type="checkbox" checked={item.is_packed} onChange={() => togglePacked(item.id)}
                  className="w-5 h-5 accent-citrus cursor-pointer"
                />
                <span className={`font-medium flex-1 cursor-pointer ${item.is_packed ? 'text-pacific/30 line-through' : 'text-pacific'}`} onClick={() => togglePacked(item.id)}>
                  {item.name}
                </span>
                <span className="text-xs font-bold text-pacific/40 uppercase bg-coconut/50 px-2 py-1 rounded">{item.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}