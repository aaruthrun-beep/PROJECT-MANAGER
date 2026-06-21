import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus, Search, Filter, Sparkles } from 'lucide-react'
import { loadData, addLogEntry, deleteLogEntry } from '../data/store'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import LogEntryCard from '../components/LogEntryCard'
import { format } from 'date-fns'

const moods = [
  { value: 'productive', label: 'Productive', color: 'emerald', emoji: '🚀' },
  { value: 'struggling', label: 'Struggling', color: 'red', emoji: '😤' },
  { value: 'neutral', label: 'Neutral', color: 'gray', emoji: '😐' },
  { value: 'breakthrough', label: 'Breakthrough', color: 'purple', emoji: '💡' },
  { value: 'learning', label: 'Learning', color: 'sky', emoji: '📚' },
]

export default function DailyLog() {
  const [data, setData] = useState({ projects: [], logEntries: [] })
  const [search, setSearch] = useState('')
  const [filterProject, setFilterProject] = useState('all')
  const [filterMood, setFilterMood] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [viewEntry, setViewEntry] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0], projectId: '', mood: null, tags: [] })
  const [mediaUrls, setMediaUrls] = useState({ images: '', videos: '' })

  const refresh = () => setData(loadData())
  useEffect(refresh, [])

  let filtered = data.logEntries
  if (filterProject !== 'all') filtered = filtered.filter(e => e.projectId === filterProject)
  if (filterMood !== 'all') filtered = filtered.filter(e => e.mood === filterMood)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q))
  }
  filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const images = mediaUrls.images ? mediaUrls.images.split('\n').map(s => s.trim()).filter(Boolean) : []
    const videos = mediaUrls.videos ? mediaUrls.videos.split('\n').map(s => s.trim()).filter(Boolean) : []
    addLogEntry({ ...form, images, videos })
    setForm({ title: '', content: '', date: new Date().toISOString().split('T')[0], projectId: '', mood: null, tags: [] })
    setMediaUrls({ images: '', videos: '' })
    setShowModal(false)
    refresh()
  }

  const today = new Date().toISOString().split('T')[0]
  const todayEntries = filtered.filter(e => (e.date || e.createdAt).split('T')[0] === today)
  const earlierEntries = filtered.filter(e => (e.date || e.createdAt).split('T')[0] !== today)

  const groupedByDate = {}
  earlierEntries.forEach(e => {
    const key = (e.date || e.createdAt).split('T')[0]
    if (!groupedByDate[key]) groupedByDate[key] = []
    groupedByDate[key].push(e)
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Calendar size={28} className="text-amber-400" /> Daily Log
          </h2>
          <p className="text-gray-400 mt-1">{data.logEntries.length} total entries</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={Plus} size="lg">New Entry</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all text-sm" />
        </div>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50">
          <option value="all">All Projects</option>
          {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterMood} onChange={e => setFilterMood(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50">
          <option value="all">All Moods</option>
          {moods.map(m => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
        </select>
      </div>

      {todayEntries.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-400" /> Today
          </h3>
          <div className="space-y-3">
            {todayEntries.map(e => <LogEntryCard key={e.id} entry={e} onDelete={(id) => { deleteLogEntry(id); refresh() }} onView={setViewEntry} />)}
          </div>
        </div>
      )}

      {Object.entries(groupedByDate).map(([date, entries]) => (
        <div key={date} className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h3>
          <div className="space-y-3">
            {entries.map(e => <LogEntryCard key={e.id} entry={e} onDelete={(id) => { deleteLogEntry(id); refresh() }} onView={setViewEntry} />)}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <Card className="text-center py-16">
          <Calendar size={48} className="mx-auto mb-3 text-gray-500/50" />
          <p className="text-gray-500 text-lg mb-1">No entries found</p>
          <Button variant="secondary" onClick={() => setShowModal(true)} className="mt-4">Create your first entry</Button>
        </Card>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Log Entry" size="xl">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What did you work on?" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400 block">Mood</label>
              <select value={form.mood || ''} onChange={e => setForm({ ...form, mood: e.target.value || null })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500/50">
                <option value="">No mood</option>
                {moods.map(m => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 block">Project (optional)</label>
            <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500/50">
              <option value="">No project</option>
              {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 block">Notes (Markdown supported)</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-32 resize-none font-mono text-sm" placeholder="Write your notes..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 block">Images (Cloudinary URLs, one per line)</label>
            <textarea value={mediaUrls.images} onChange={e => setMediaUrls({ ...mediaUrls, images: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-16 resize-none text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 block">Videos (YouTube URLs, one per line)</label>
            <textarea value={mediaUrls.videos} onChange={e => setMediaUrls({ ...mediaUrls, videos: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-16 resize-none text-xs" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Save Entry</Button>
          </div>
        </form>
      </Modal>

      {viewEntry && (
        <Modal open={!!viewEntry} onClose={() => setViewEntry(null)} title={viewEntry.title} size="xl">
          <p className="text-sm text-gray-400 mb-4">
            {format(new Date(viewEntry.date || viewEntry.createdAt), 'EEEE, MMMM d, yyyy')}
            {viewEntry.mood && <Badge color={moods.find(m => m.value === viewEntry.mood)?.color || 'gray'} className="ml-2">{moods.find(m => m.value === viewEntry.mood)?.emoji} {viewEntry.mood}</Badge>}
          </p>
          <div className="text-gray-300 whitespace-pre-wrap mb-6 text-sm">{viewEntry.content}</div>
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
                    <iframe src={`https://www.youtube.com/embed/${url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''}`}
                      className="w-full h-full" allowFullScreen />
                  ) : <video src={url} controls className="w-full h-full" />}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </motion.div>
  )
}
