import { useState, useEffect } from 'react'
import { loadData, addLogEntry, deleteLogEntry } from '../data/store'
import LogEntryCard from '../components/LogEntryCard'
import { Calendar, Plus, Search, X } from 'lucide-react'

export default function DailyLog() {
  const [data, setData] = useState({ projects: [], logEntries: [] })
  const [search, setSearch] = useState('')
  const [filterProject, setFilterProject] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [viewEntry, setViewEntry] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0], projectId: '' })
  const [mediaUrls, setMediaUrls] = useState({ images: '', videos: '' })

  const refresh = () => setData(loadData())
  useEffect(refresh, [])

  let filtered = data.logEntries
  if (filterProject !== 'all') {
    filtered = filtered.filter(e => e.projectId === filterProject)
  }
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q)
    )
  }
  filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const images = mediaUrls.images ? mediaUrls.images.split('\n').map(s => s.trim()).filter(Boolean) : []
    const videos = mediaUrls.videos ? mediaUrls.videos.split('\n').map(s => s.trim()).filter(Boolean) : []
    addLogEntry({ ...form, images, videos })
    setForm({ title: '', content: '', date: new Date().toISOString().split('T')[0], projectId: '' })
    setMediaUrls({ images: '', videos: '' })
    setShowModal(false)
    refresh()
  }

  const today = new Date().toDateString()
  const todayEntries = filtered.filter(e => new Date(e.date || e.createdAt).toDateString() === today)
  const earlierEntries = filtered.filter(e => new Date(e.date || e.createdAt).toDateString() !== today)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Daily Log</h2>
          <p className="text-gray-400 mt-1">Track your daily progress</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25">
          <Plus size={18} /> New Entry
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors" />
        </div>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50">
          <option value="all">All Projects</option>
          {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Today</h3>
        </div>
        <div className="flex flex-col gap-3">
          {todayEntries.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No entries for today. Record something!</p>
          ) : (
            todayEntries.map(e => <LogEntryCard key={e.id} entry={e} onDelete={(id) => { deleteLogEntry(id); refresh() }} onView={setViewEntry} />)
          )}
        </div>
      </div>

      {earlierEntries.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Earlier</h3>
          <div className="flex flex-col gap-3">
            {earlierEntries.map(e => <LogEntryCard key={e.id} entry={e} onDelete={(id) => { deleteLogEntry(id); refresh() }} onView={setViewEntry} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && todayEntries.length === 0 && (
        <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
          <Calendar size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg mb-2">No log entries found</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-400 hover:text-indigo-300">Create your first entry</button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-6">New Log Entry</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50" placeholder="What did you do?" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Project (optional)</label>
                <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500/50">
                  <option value="">No project</option>
                  {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Notes</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-32 resize-none" placeholder="Details about your progress, challenges, achievements..." />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Images (Cloudinary URLs, one per line)</label>
                <textarea value={mediaUrls.images} onChange={e => setMediaUrls({ ...mediaUrls, images: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-16 resize-none text-xs" placeholder="https://res.cloudinary.com/demo/image/upload/..." />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Videos (YouTube/Cloudinary URLs, one per line)</label>
                <textarea value={mediaUrls.videos} onChange={e => setMediaUrls({ ...mediaUrls, videos: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-16 resize-none text-xs" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)}
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
                {viewEntry.videos.map((url, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden border border-white/10 mb-3">
                    {url.includes('youtube') || url.includes('youtu.be') ? (
                      <iframe src={`https://www.youtube.com/embed/${extractYoutubeId(url)}`}
                        className="w-full h-full" allowFullScreen />
                    ) : (
                      <video src={url} controls className="w-full h-full" />
                    )}
                  </div>
                ))}
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
