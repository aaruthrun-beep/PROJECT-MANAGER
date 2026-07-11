import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, Search, Sparkles, TrendingUp, Zap, Pin, PenLine } from 'lucide-react'
import { loadData, addLogEntry, updateLogEntry, deleteLogEntry, getRemoteData } from '../data/store'
import { sendToTelegram } from '../data/sync'
import { useAuth } from '../context/AuthContext'
import { useDataVersion } from '../context/DataContext'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import ImageUpload from '../ui/ImageUpload'
import LogEntryCard from '../components/LogEntryCard'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const moods = [
  { value: 'productive', label: 'Productive', color: 'emerald', emoji: '\u{1F680}' },
  { value: 'struggling', label: 'Struggling', color: 'red', emoji: '\u{1F624}' },
  { value: 'neutral', label: 'Neutral', color: 'gray', emoji: '\u{1F610}' },
  { value: 'breakthrough', label: 'Breakthrough', color: 'purple', emoji: '\u{1F4A1}' },
  { value: 'learning', label: 'Learning', color: 'sky', emoji: '\u{1F4DA}' },
]

const emptyForm = { title: '', content: '', date: new Date().toISOString().split('T')[0], projectId: '', mood: null, tags: [], pinned: false, images: [], videos: [] }

export default function DailyLog() {
  const { isOwner } = useAuth()
  const { dataVersion } = useDataVersion()
  const isSharedView = !!getRemoteData()
  const [data, setData] = useState({ projects: [], logEntries: [] })
  const [search, setSearch] = useState('')
  const [filterProject, setFilterProject] = useState('all')
  const [filterMood, setFilterMood] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [viewEntry, setViewEntry] = useState(null)
  const [viewTab, setViewTab] = useState('content')
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [videosText, setVideosText] = useState('')

  const refresh = useCallback(() => setData(loadData()), [])

  useEffect(() => { refresh() }, [refresh, dataVersion])

  const [highlightId, setHighlightId] = useState(null)

  useEffect(() => {
    const storedId = sessionStorage.getItem('focus_entry')
    if (storedId) {
      sessionStorage.removeItem('focus_entry')
      const data = loadData()
      const entry = data.logEntries.find(e => e.id === storedId)
      if (entry) {
        setViewEntry(entry)
        setHighlightId(storedId)
        setTimeout(() => {
          const el = document.getElementById(`log-${storedId}`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
        setTimeout(() => setHighlightId(null), 3000)
      }
    }
  }, [])

  let filtered = data.logEntries
  if (filterProject !== 'all') filtered = filtered.filter(e => e.projectId === filterProject)
  if (filterMood !== 'all') filtered = filtered.filter(e => e.mood === filterMood)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q))
  }
  filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  })

  const openCreate = () => {
    setEditEntry(null)
    setForm({ ...emptyForm })
    setVideosText('')
    setShowModal(true)
  }

  const openEdit = (entry) => {
    setEditEntry(entry)
    setForm({
      title: entry.title || '',
      content: entry.content || '',
      date: (entry.date || entry.createdAt).split('T')[0],
      projectId: entry.projectId || '',
      mood: entry.mood || null,
      tags: entry.tags || [],
      pinned: entry.pinned || false,
      images: entry.images || [],
      videos: entry.videos || [],
    })
    setVideosText((entry.videos || []).join('\n'))
    setShowModal(true)
    setViewEntry(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const videos = videosText ? videosText.split('\n').map(s => s.trim()).filter(Boolean) : []
    if (editEntry) {
      updateLogEntry(editEntry.id, { ...form, images: form.images, videos })
      toast.success('Entry updated')
    } else {
      addLogEntry({ ...form, images: form.images, videos })
      toast.success('Entry created')
    }
    const projectName = data.projects?.find(p => p.id === form.projectId)?.name || ''
    form.images.forEach(url => sendToTelegram(url, { title: form.title, content: form.content, date: form.date, mood: form.mood, projectName }))
    setForm({ ...emptyForm })
    setVideosText('')
    setEditEntry(null)
    setShowModal(false)
    refresh()
  }

  const togglePin = (entry) => {
    updateLogEntry(entry.id, { pinned: !entry.pinned })
    toast.success(entry.pinned ? 'Unpinned' : 'Pinned to top')
    refresh()
  }

  const quickLog = (moodValue) => {
    const title = `${moods.find(m => m.value === moodValue)?.emoji} Quick note`
    addLogEntry({ title, content: '', date: new Date().toISOString().split('T')[0], mood: moodValue, projectId: '', tags: [], pinned: false })
    toast.success('Quick entry added')
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

  const renderContent = (text) => {
    if (!text) return null
    if (showMarkdown) {
      const html = text
        .replace(/### (.+)/g, '<h3 class="text-base font-semibold text-white mt-4 mb-2">$1</h3>')
        .replace(/## (.+)/g, '<h2 class="text-lg font-semibold text-white mt-5 mb-2">$1</h2>')
        .replace(/# (.+)/g, '<h1 class="text-xl font-bold text-white mt-6 mb-3">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-amber-300">$1</code>')
        .replace(/^- (.+)/gm, '<li class="ml-4 list-disc text-zinc-300">$1</li>')
        .replace(/\n/g, '<br/>')
      return <div className="text-zinc-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
    }
    return <pre className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{text}</pre>
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <Calendar size={26} className="text-amber-400" /> Daily Log
          </h2>
          <p className="text-zinc-400 text-sm mt-1">{data.logEntries.length} total entries</p>
        </div>
        {isOwner && !isSharedView && <Button onClick={openCreate} icon={Plus} size="lg">New Entry</Button>}
      </div>

      {isOwner && !isSharedView && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide -mx-2 sm:mx-0 px-2 sm:px-0">
          <span className="text-xs text-zinc-500 shrink-0 font-medium">Quick log:</span>
          {moods.map(m => (
            <button key={m.value} onClick={() => quickLog(m.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-800/80 border border-zinc-700/60 hover:bg-zinc-700/80 hover:border-white/20 transition-all shrink-0 text-zinc-300 active:scale-95">
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mini Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
        {[
          { label: 'Today', value: todayEntries.length, icon: Calendar, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'This Week', value: data.logEntries.filter(e => {
            const d = new Date(e.date || e.createdAt)
            const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
            return d >= weekAgo
          }).length, icon: TrendingUp, color: 'text-amber-500 bg-amber-600/10' },
          { label: 'Streak', value: `${streak}d`, icon: Zap, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'With Media', value: data.logEntries.filter(e => (e.images?.length || 0) + (e.videos?.length || 0) > 0).length, icon: Sparkles, color: 'text-amber-500 bg-amber-600/10' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-zinc-700/60 flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${s.color}`}><Icon size={16} /></div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500">{s.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-600/50 transition-all text-sm" />
        </div>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
          className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-amber-600/50 w-full sm:w-auto">
          <option value="all">All Projects</option>
          {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterMood} onChange={e => setFilterMood(e.target.value)}
          className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-amber-600/50 w-full sm:w-auto">
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
            <span className="text-xs text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded-full">{todayEntries.length}</span>
          </div>
          <div className="space-y-3">
            {todayEntries.map((e, i) => (
              <motion.div key={e.id} id={`log-${e.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={highlightId === e.id ? 'ring-2 ring-amber-500 rounded-xl transition-all duration-700' : ''}>
                <LogEntryCard entry={e} onDelete={isOwner && !isSharedView ? (id) => { deleteLogEntry(id); refresh() } : undefined} onView={setViewEntry} onEdit={isOwner && !isSharedView ? openEdit : undefined} onPin={isOwner && !isSharedView ? togglePin : undefined} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Earlier Entries Grouped by Date */}
      {Object.entries(groupedByDate).map(([date, entries]) => (
        <div key={date} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
              {format(new Date(date), 'EEEE, MMM d')}
              <span className="ml-1.5 text-zinc-600">({entries.length})</span>
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
          </div>
          <div className="space-y-3">
            {entries.map(e => (
              <div key={e.id} id={`log-${e.id}`}
                className={highlightId === e.id ? 'ring-2 ring-amber-500 rounded-xl transition-all duration-700' : ''}>
                <LogEntryCard entry={e} onDelete={isOwner && !isSharedView ? (id) => { deleteLogEntry(id); refresh() } : undefined} onView={setViewEntry} onEdit={isOwner && !isSharedView ? openEdit : undefined} onPin={isOwner && !isSharedView ? togglePin : undefined} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-amber-400" />
          </div>
          <p className="text-zinc-400 text-lg mb-1">No entries found</p>
          <p className="text-zinc-600 text-sm mb-5">{search ? 'Try a different search term' : 'Start logging your daily work'}</p>
          {isOwner && <Button variant="secondary" onClick={openCreate} icon={Plus}>Create your first entry</Button>}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editEntry ? 'Edit Entry' : 'New Log Entry'} size="xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What did you work on?" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 block">Mood</label>
              <div className="flex gap-1.5 flex-wrap">
                {moods.map(m => (
                  <button key={m.value} type="button" onClick={() => setForm({ ...form, mood: form.mood === m.value ? null : m.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.mood === m.value
                        ? 'bg-amber-600/20 border-amber-600/40 text-white'
                        : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:bg-zinc-700/80'
                    }`}>
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}
              className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-amber-600/50">
              <option value="">No project</option>
              {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer select-none">
              <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700/60 bg-zinc-800/80 accent-amber-600" />
              Pin to top
            </label>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 block">Notes (Markdown supported)</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-600/50 h-32 resize-none font-mono text-sm" placeholder="Write your notes..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 block">Tags (comma separated)</label>
            <input type="text" value={form.tags.join(', ')} onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-600/50 text-sm" placeholder="design, frontend, bugfix" />
          </div>
          <ImageUpload urls={form.images} onChange={(urls) => setForm({ ...form, images: urls })} />
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 block">Videos (YouTube URLs, one per line)</label>
            <textarea value={videosText} onChange={e => setVideosText(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-600/50 h-16 resize-none text-xs" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">{editEntry ? 'Update Entry' : 'Save Entry'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewEntry && (
        <Modal open={!!viewEntry} onClose={() => setViewEntry(null)} title={viewEntry.title} size="xl">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-zinc-400 flex-wrap">
              <Calendar size={14} />
              {format(new Date(viewEntry.date || viewEntry.createdAt), 'EEEE, MMMM d, yyyy')}
              {viewEntry.mood && (
                <Badge color={moods.find(m => m.value === viewEntry.mood)?.color || 'gray'}>
                  {moods.find(m => m.value === viewEntry.mood)?.emoji} {viewEntry.mood}
                </Badge>
              )}
            </div>
            {!isSharedView && (
              <div className="flex gap-1">
                <button onClick={() => togglePin(viewEntry)}
                  className={`text-xs px-2 py-1 rounded-lg transition-all ${viewEntry.pinned ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'}`}>
                  <Pin size={13} />
                </button>
                <button onClick={() => { const e = viewEntry; setViewEntry(null); openEdit(e) }}
                  className="text-xs text-amber-500 hover:text-amber-400 px-2 py-1 rounded-lg hover:bg-amber-600/10 transition-all">Edit</button>
              </div>
            )}
          </div>

          {/* View Tabs */}
          <div className="flex gap-1 mb-4 border-b border-white/5 pb-2">
            {['content', 'media'].map(tab => (
              <button key={tab} onClick={() => setViewTab(tab)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${
                  viewTab === tab ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'
                }`}>{tab}</button>
            ))}
            <button onClick={() => setShowMarkdown(!showMarkdown)}
              className={`text-xs px-3 py-1.5 rounded-lg ml-auto transition-all ${showMarkdown ? 'bg-amber-600/20 text-amber-400' : 'text-zinc-500 hover:text-white'}`}>
              {showMarkdown ? 'Render' : 'Markdown'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {viewTab === 'content' ? (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {viewEntry.content ? renderContent(viewEntry.content) : <p className="text-zinc-500 text-sm italic">No notes</p>}
                {viewEntry.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/5">
                    {viewEntry.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-white/5">{tag}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {viewEntry.images?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Photos ({viewEntry.images.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {viewEntry.images.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-full aspect-video object-cover rounded-xl border border-zinc-700/60" />
                      ))}
                    </div>
                  </div>
                )}
                {viewEntry.videos?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Videos ({viewEntry.videos.length})</h4>
                    {viewEntry.videos.map((url, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-zinc-700/60 mb-3">
                        {url.includes('youtube') || url.includes('youtu.be') ? (
                          <iframe src={`https://www.youtube.com/embed/${url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''}`}
                            className="w-full h-full" allowFullScreen />
                        ) : <video src={url} controls className="w-full h-full" />}
                      </div>
                    ))}
                  </div>
                )}
                {(!viewEntry.images?.length && !viewEntry.videos?.length) && (
                  <p className="text-zinc-500 text-sm italic">No media attached</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>
      )}
    </motion.div>
  )
}
