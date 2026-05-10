import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'

export default function TripNotes() {
  const { id } = useParams()
  const [notes, setNotes] = useState([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const fetchNotes = () => api.get(`/trips/${id}/notes`).then(res => setNotes(res.data))
  useEffect(() => { fetchNotes() }, [id])

  const addNote = async (e) => {
    e.preventDefault()
    if (!content.trim()) return setError('Note cannot be empty')
    setError('')
    await api.post(`/trips/${id}/notes`, { content })
    setContent('')
    fetchNotes()
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-primary mb-6">📝 Trip Notes</h2>
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={addNote} className="space-y-3">
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="Write a note, reminder, or important detail..."
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" rows={4} />
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-900">
            Save Note
          </button>
        </form>
      </div>
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No notes yet. Add your first note above!</p>
        ) : notes.map(note => (
          <div key={note.id} className="bg-white rounded-xl shadow p-4 border-l-4 border-accent">
            <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
            <p className="text-xs text-gray-400 mt-2">{new Date(note.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}