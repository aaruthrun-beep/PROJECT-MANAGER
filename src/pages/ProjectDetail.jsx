import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Edit3, Save, X } from 'lucide-react'
import { getProject, updateProject, deleteProject, getLogEntries, addLogEntry, deleteLogEntry } from '../data/store'
import LogEntryCard from '../components/LogEntryCard'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [entries, setEntries] = useState([])
  const [showLogModal, setShowLogModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [logForm, setLogForm] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0], images: [], videos: [] })
  const [mediaUrls, setMediaUrls] = useState({ images: '', videos: '' })
  const [viewEntry, setViewEntry] = useState(null)

  const refresh = () => {
    setProject(getProject(id))
    setEntries(getLogEntries(id))
  }

  useEffect(refresh, [id])

  const handleUpdate = () => {
    if (!editForm.name?.trim()) return
    updateProject(id, { name: editForm.name.trim(), description: editForm.description.trim(), status: editForm.status })
    setEditing(false)
    refresh()
  }

  const handleDeleteProject = () => {
    if (confirm('Delete this project permanently?')) {
      deleteProject(id)
      navigate('/projects')
    }
  }

  const handleAddLog = (e) => {
    e.preventDefault()
    if (!logForm.title.trim()) return
    const images = mediaUrls.images ? mediaUrls.images.split('\n').map(s => s.trim()).filter(Boolean) : []
    const videos = mediaUrls.videos ? mediaUrls.videos.split('\n').map(s => s.trim()).filter(Boolean) : []
    addLogEntry({ ...logForm, projectId: id, images, videos })
    setLogForm({ title: '', content: '', date: new Date().toISOString().split('T')[0], images: [], videos: [] })
    setMediaUrls({ images: '', videos: '' })
    setShowLogModal(false)
    refresh()
  }

  const handleDeleteEntry = (entryId) => {
    if (confirm('Delete this log entry?')) {
      deleteLogEntry(entryId)
      refresh()
    }
  }

  if (!project) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/projects" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-3">
              <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white text-lg font-bold focus:outline-none focus:border-indigo-500/50" />
              <button onClick={handleUpdate} className="text-green-400 hover:text-green-300"><Save size={18} /></button>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-white">{project.name}</h2>
              <button onClick={() => { setEditForm({ name: project.name, description: project.description, status: project.status }); setEditing(true) }}
                className="text-gray-400 hover:text-white transition-colors"><Edit3 size={16} /></button>
              <button onClick={handleDeleteProject} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>
            </div>
          )}
        </div>
        <button onClick={() => setShowLogModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all text-sm font-medium">
          + Add Log Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-4">Daily Logs</h3>
          <div className="flex flex-col gap-3">
            {entries.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                <p>No log entries yet. Start tracking your progress!</p>
              </div>
            ) : (
              entries.map(e => (
                <LogEntryCard key={e.id} entry={e} onDelete={handleDeleteEntry} onView={setViewEntry} />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">Project Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Status</span>
                <p className="text-white font-medium capitalize">{project.status || 'active'}</p>
              </div>
              <div>
                <span className="text-gray-500">Description</span>
                <p className="text-gray-300">{project.description || 'No description'}</p>
              </div>
              <div>
                <span className="text-gray-500">Created</span>
                <p className="text-gray-300">{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Entries</span>
                <p className="text-white font-medium">{entries.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowLogModal(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-6">New Log Entry</h3>
            <form onSubmit={handleAddLog} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Title *</label>
                <input type="text" value={logForm.title} onChange={e => setLogForm({ ...logForm, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50" placeholder="What did you work on?" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Date</label>
                <input type="date" value={logForm.date} onChange={e => setLogForm({ ...logForm, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Notes</label>
                <textarea value={logForm.content} onChange={e => setLogForm({ ...logForm, content: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-32 resize-none" placeholder="Describe your progress, challenges, thoughts..." />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Images (Cloudinary URLs, one per line)</label>
                <textarea value={mediaUrls.images} onChange={e => setMediaUrls({ ...mediaUrls, images: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-16 resize-none text-xs" placeholder="https://res.cloudinary.com/..." />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Videos (YouTube/Cloudinary URLs, one per line)</label>
                <textarea value={mediaUrls.videos} onChange={e => setMediaUrls({ ...mediaUrls, videos: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-16 resize-none text-xs" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowLogModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl transition-all">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl transition-all">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewEntry && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setViewEntry(null)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">{viewEntry.title}</h3>
              <button onClick={() => setViewEntry(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {new Date(viewEntry.date || viewEntry.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-gray-300 whitespace-pre-wrap mb-6">{viewEntry.content}</p>
            {viewEntry.images?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {viewEntry.images.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full aspect-video object-cover rounded-xl border border-white/10" />
                  ))}
                </div>
              </div>
            )}
            {viewEntry.videos?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Videos</h4>
                <div className="flex flex-col gap-3">
                  {viewEntry.videos.map((url, i) => (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden border border-white/10">
                      {url.includes('youtube') || url.includes('youtu.be') ? (
                        <iframe src={`https://www.youtube.com/embed/${extractYoutubeId(url)}`}
                          className="w-full h-full" allowFullScreen />
                      ) : (
                        <video src={url} controls className="w-full h-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : ''
}
