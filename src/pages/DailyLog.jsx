import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus, Search, Sparkles, TrendingUp, Zap } from 'lucide-react'
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

  const refresh = useCallback(() => setData(loadData()), [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#log-')) {
      const id = hash.replace('#log-', '')
      const data = loadData()
      const entry = data.logEntries.find(e => e.id === id)
      if (entry) setViewEntry(entry)
    }
  }, [])

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

  const streak = (() => {
    if (data.logEntries.length === 0) return 0
    const dates = [...new Set(data.logEntries.map(e => (e.date || e.createdAt).split('T')[0]))].sort()
    if (dates.length === 0) return 0
    let s = 1
    if (dates[dates.length - 1] !== today) return 0
    for (let i = dates.length - 1; i > 0; i--) {
      const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / (1000 * 60 * 60 * 24)
      if (diff === 1) s++
      else break
    }
    return s
  })()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <Calendar size={26} className="text-amber-400" /> Daily Log
          </h2>
          <p className="text-gray-400 text-sm mt-1">{data.logEntries.length} total entries</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={Plus} size="lg">New Entry</Button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
        {[
          { label: 'Today', value: todayEntries.length, icon: Calendar, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'This Week', value: data.logEntries.filter(e => {
            const d = new Date(e.date || e.createdAt)
            const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
            return d >= weekAgo
          }).length, icon: TrendingUp, color: 'text-indigo-400 bg-indigo-500/10' },
          { label: 'Streak', value: `${streak}d`, icon: Zap, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'With Media', value: data.logEntries.filter(e => (e.images?.length || 0) + (e.videos?.length || 0) > 0).length, icon: Sparkles, color: 'text-purple-400 bg-purple-500/10' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${s.color}`}><Icon size={16} /></div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{s.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all text-sm" />
        </div>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 w-full sm:w-auto">
          <option value="all">All Projects</option>
          {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterMood} onChange={e => setFilterMood(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 w-full sm:w-auto">
          <option value="all">All Moods</option>
          {moods.map(m => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
        </select>
      </div>

      {/* Today's Entries */}
      {todayEntries.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="font-semibold text-white text-base">Today</h3>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{todayEntries.length}</span>
          </div>
          <div className="space-y-3">
            {todayEntries.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <LogEntryCard entry={e} onDelete={(id) => { deleteLogEntry(id); refresh() }} onView={setViewEntry} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Earlier Entries */}
      {Object.entries(groupedByDate).map(([date, entries]) => (
        <div key={date} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-xs font-medium text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-white/5">
              {format(new Date(date), 'EEEE, MMM d')}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
          </div>
          <div className="space-y-3">
            {entries.map(e => <LogEntryCard key={e.id} entry={e} onDelete={(id) => { deleteLogEntry(id); refresh() }} onView={setViewEntry} />)}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-amber-400" />
          </div>
          <p className="text-gray-400 text-lg mb-1">No entries found</p>
          <p className="text-gray-600 text-sm mb-5">{search ? 'Try a different search term' : 'Start logging your daily work'}</p>
          <Button variant="secondary" onClick={() => setShowModal(true)} icon={Plus}>Create your first entry</Button>
        </motion.div>
      )}

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Log Entry" size="xl">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What did you work on?" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* View Modal */}
      {viewEntry && (
        <Modal open={!!viewEntry} onClose={() => setViewEntry(null)} title={viewEntry.title} size="xl">
          <p className="text-sm text-gray-400 mb-4">
            {format(new Date(viewEntry.date || viewEntry.createdAt), 'EEEE, MMMM d, yyyy')}
            {viewEntry.mood && <Badge color={moods.find(m => m.value === viewEntry.mood)?.color || 'gray'} className="ml-2">{moods.find(m => m.value === viewEntry.mood)?.emoji} {viewEntry.mood}</Badge>}
          </p>
          <div className="text-gray-300 whitespace-pre-wrap mb-6 text-sm leading-relaxed">{viewEntry.content}</div>
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
