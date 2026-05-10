import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function TripNotes() {
  const { id } = useParams()
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    // Simulated fetch
    setNotes([
      { id: 1, content: 'Flight confirmation code is X8Y9Z.', created_at: new Date().toISOString() },
      { id: 2, content: 'Remember to ask the guide about the hidden ramen shop.', created_at: new Date().toISOString() }
    ])
  }, [id])

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    setNotes([{ id: Date.now(), content: newNote, created_at: new Date().toISOString() }, ...notes])
    setNewNote('')
  }

  return (
    <div className="min-h-screen bg-mist py-10 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <Link to={`/trips/${id}/itinerary`} className="text-sm font-bold text-pacific/50 hover:text-citrus mb-6 inline-block">← Back to Itinerary</Link>
        <h1 className="text-3xl font-bold text-pacific mb-8">Travel Journal & Notes</h1>

        <form onSubmit={handleAddNote} className="mb-8">
          <textarea 
            value={newNote} onChange={e => setNewNote(e.target.value)} rows="4"
            placeholder="Jot down a quick thought, confirmation number, or reminder..."
            className="w-full bg-white border border-coconut rounded-2xl p-4 focus:outline-none focus:border-citrus text-pacific shadow-sm mb-2"
          />
          <div className="flex justify-end">
            <button type="submit" className="bg-pacific text-mist font-bold px-6 py-2 rounded-xl hover:bg-pacific/90 transition-colors shadow-sm">Save Note</button>
          </div>
        </form>

        <div className="space-y-4">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-2xl p-6 border border-coconut shadow-sm hover:shadow-md transition-shadow relative">
              <span className="absolute top-6 right-6 text-2xl text-coconut">”</span>
              <p className="text-pacific/80 whitespace-pre-wrap relative z-10 font-medium">{note.content}</p>
              <p className="text-xs text-pacific/40 font-bold mt-4 uppercase tracking-wider">{new Date(note.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {notes.length === 0 && <p className="text-center text-pacific/50 mt-10">Your journal is empty.</p>}
        </div>
      </div>
    </div>
  )
}