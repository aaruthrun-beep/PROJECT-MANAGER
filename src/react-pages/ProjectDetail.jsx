import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Flag, MessageSquare, BarChart3 } from 'lucide-react'
import { getProject, updateProject, deleteProject, getLogEntries, addLogEntry, deleteLogEntry, getMilestones, addMilestone, updateMilestone, deleteMilestone, addComment, getComments, deleteComment, addTimeEntry, getTimeEntries, getTotalTimeForProject, addTag } from '../data/store'
import { useAuth } from '../context/AuthContext'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import LogEntryCard from '../components/LogEntryCard'
import ImageUpload from '../ui/ImageUpload'
import Timer from '../ui/Timer'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const priorityColors = { low: 'emerald', medium: 'amber', high: 'red', critical: 'purple' }
const statusColors = { active: 'emerald', paused: 'amber', completed: 'blue' }

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isOwner } = useAuth()
  const [project, setProject] = useState(null)
  const [entries, setEntries] = useState([])
  const [milestones, setMilestones] = useState([])
  const [comments, setComments] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [totalTime, setTotalTime] = useState(0)
  const [activeTab, setActiveTab] = useState('logs')
  const [showLogModal, setShowLogModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showMediaViewer, setShowMediaViewer] = useState(null)
  const [viewEntry, setViewEntry] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [logForm, setLogForm] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0], images: [], videos: [], mood: null })
  const [videosText, setVideosText] = useState('')
  const [milestoneForm, setMilestoneForm] = useState({ name: '', dueDate: '' })
  const [timeForm, setTimeForm] = useState({ duration: 30, description: '', date: new Date().toISOString().split('T')[0] })
  const [commentForm, setCommentForm] = useState({ text: '' })

  const refresh = () => {
    const p = getProject(id)
    if (!p) { navigate('/projects'); return }
    setProject(p)
    setEntries(getLogEntries(id))
    setMilestones(getMilestones(id))
    setComments(getComments(id))
    setTimeEntries(getTimeEntries(id))
    setTotalTime(getTotalTimeForProject(id))
  }
  useEffect(refresh, [id])

  const handleUpdate = () => {
    if (!editForm.name?.trim()) return
    updateProject(id, { name: editForm.name.trim(), description: editForm.description.trim(), status: editForm.status, priority: editForm.priority })
    setEditing(false)
    refresh()
    toast.success('Project updated')
  }

  const handleDelete = () => {
    if (confirm('Delete this project permanently?')) {
      deleteProject(id)
      navigate('/projects')
    }
  }

  const handleAddLog = (e) => {
    e.preventDefault()
    if (!logForm.title.trim()) return
    const videos = videosText ? videosText.split('\n').map(s => s.trim()).filter(Boolean) : []
    addLogEntry({ ...logForm, projectId: id, images: logForm.images, videos })
    setLogForm({ title: '', content: '', date: new Date().toISOString().split('T')[0], images: [], videos: [], mood: null })
    setVideosText('')
    setShowLogModal(false)
    refresh()
  }

  const handleAddMilestone = (e) => {
    e.preventDefault()
    if (!milestoneForm.name.trim()) return
    addMilestone({ ...milestoneForm, projectId: id })
    setMilestoneForm({ name: '', dueDate: '' })
    setShowMilestoneModal(false)
    refresh()
  }

  const handleAddTime = (e) => {
    e.preventDefault()
    addTimeEntry({ ...timeForm, projectId: id })
    setTimeForm({ duration: 30, description: '', date: new Date().toISOString().split('T')[0] })
    setShowTimeModal(false)
    refresh()
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!commentForm.text.trim()) return
    addComment({ ...commentForm, targetId: id, targetType: 'project' })
    setCommentForm({ text: '' })
    setShowCommentModal(false)
    refresh()
  }

  if (!project) return null

  const tabs = [
    { id: 'logs', label: 'Logs', count: entries.length },
    { id: 'milestones', label: 'Milestones', count: milestones.length },
    { id: 'time', label: 'Time', count: timeEntries.length },
    { id: 'comments', label: 'Comments', count: comments.length },
    { id: 'media', label: 'Media', count: [...new Set([...(entries.flatMap(e => e.images || [])), ...(entries.flatMap(e => e.videos || []))])].length },
  ]

  const allImages = entries.flatMap(e => (e.images || []).map(url => ({ url, title: e.title })))
  const allVideos = entries.flatMap(e => (e.videos || []).map(url => ({ url, title: e.title })))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/projects" className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800/80">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-3">
              <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-zinc-800/80 border border-zinc-700/60 rounded-lg py-1.5 px-3 text-white text-lg font-bold focus:outline-none focus:border-amber-600/50" />
              <Button size="sm" variant="success" onClick={handleUpdate}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-3xl font-bold text-white">{project.name}</h2>
              <Badge color={statusColors[project.status] || 'gray'}>{project.status || 'active'}</Badge>
              <Badge color={priorityColors[project.priority] || 'gray'}>{project.priority || 'medium'}</Badge>
              {isOwner && <Button size="sm" variant="ghost" onClick={() => { setEditForm({ name: project.name, description: project.description || '', status: project.status || 'active', priority: project.priority || 'medium' }); setEditing(true) }}>Edit</Button>}
              {isOwner && <Button size="sm" variant="ghost" onClick={handleDelete} className="text-red-400">Delete</Button>}
            </div>
          )}
        </div>
        {isOwner && <Button onClick={() => setShowLogModal(true)} icon={Calendar}>Add Log</Button>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Description</p>
              {editing ? (
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-lg py-1.5 px-3 text-white text-sm focus:outline-none focus:border-amber-600/50 h-24 resize-none" />
              ) : (
                <p className="text-sm text-zinc-300">{project.description || 'No description'}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Progress</p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-600 to-amber-600 h-2 rounded-full transition-all" style={{ width: `${Math.min(project.progress || 0, 100)}%` }} />
              </div>
              <p className="text-xs text-zinc-400 mt-1">{project.progress || 0}% complete</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Created</p>
                <p className="text-sm text-white">{format(new Date(project.createdAt), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Time</p>
                <p className="text-sm text-white">{Math.round(totalTime / 60)}h {totalTime % 60}m</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3">
          <div className="flex gap-0.5 glass rounded-xl p-1 border border-zinc-700/60 mb-4 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-amber-600/20 text-amber-400' : 'text-zinc-400 hover:text-white'}`}>
                {tab.label}
                <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {activeTab === 'logs' && (
              <>
                {entries.length === 0 ? (
                  <Card className="text-center py-10">
                      <p className="text-zinc-500 mb-2">No log entries</p>
                      {isOwner && <Button variant="secondary" size="sm" onClick={() => setShowLogModal(true)}>Add first entry</Button>}
                    </Card>
                ) : (
                  entries.map(e => <LogEntryCard key={e.id} entry={e} onView={setViewEntry} onDelete={isOwner ? () => { deleteLogEntry(e.id); refresh() } : undefined} />)
                )}
              </>
            )}

            {activeTab === 'milestones' && (
              <>
                <div className="flex justify-end mb-2">
                  {isOwner && <Button size="sm" variant="secondary" onClick={() => setShowMilestoneModal(true)} icon={Flag}>Add Milestone</Button>}
                </div>
                {milestones.length === 0 ? (
                  <Card className="text-center py-10">
                    <Flag size={32} className="mx-auto mb-2 text-zinc-500/50" />
                    <p className="text-zinc-500">No milestones</p>
                  </Card>
                ) : (
                  milestones.map(m => (
                    <Card key={m.id} className="flex items-center gap-4">
                      <input type="checkbox" checked={m.completed} onChange={() => { updateMilestone(m.id, { completed: !m.completed }); refresh() }}
                        className="w-5 h-5 rounded-full border-white/20 bg-zinc-800/80 accent-amber-600" />
                      <div className="flex-1">
                        <p className={`text-white text-sm font-medium ${m.completed ? 'line-through text-zinc-500' : ''}`}>{m.name}</p>
                        {m.dueDate && <p className="text-xs text-zinc-500">Due: {format(new Date(m.dueDate), 'MMM d, yyyy')}</p>}
                      </div>
                      {isOwner && <button onClick={() => { deleteMilestone(m.id); refresh() }} className="text-xs text-red-400 hover:text-red-300">Delete</button>}
                    </Card>
                  ))
                )}
              </>
            )}

            {activeTab === 'time' && (
              <>
                {isOwner && <Timer onLog={(t) => { addTimeEntry({ ...t, projectId: id, date: new Date().toISOString().split('T')[0] }); refresh() }} />}
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-zinc-400">Total: <span className="text-white font-medium">{Math.round(totalTime / 60)}h {totalTime % 60}m</span></p>
                  {isOwner && <Button size="sm" variant="secondary" onClick={() => setShowTimeModal(true)} icon={Clock}>Log Time</Button>}
                </div>
                {timeEntries.length === 0 ? (
                  <Card className="text-center py-10">
                    <Clock size={32} className="mx-auto mb-2 text-zinc-500/50" />
                    <p className="text-zinc-500">No time logged</p>
                  </Card>
                ) : (
                  timeEntries.map(t => (
                    <Card key={t.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{t.description || 'Time entry'}</p>
                        <p className="text-xs text-zinc-500">{format(new Date(t.date || t.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                      <Badge color="sky">{t.duration}m</Badge>
                    </Card>
                  ))
                )}
              </>
            )}

            {activeTab === 'comments' && (
              <>
                <div className="flex justify-end mb-2">
                  {isOwner && <Button size="sm" variant="secondary" onClick={() => setShowCommentModal(true)} icon={MessageSquare}>Add Comment</Button>}
                </div>
                {comments.length === 0 ? (
                  <Card className="text-center py-10"><p className="text-zinc-500">No comments</p></Card>
                ) : (
                  comments.map(c => (
                    <Card key={c.id}>
                      <p className="text-white text-sm">{c.text}</p>
                      <p className="text-xs text-zinc-500 mt-1">{format(new Date(c.createdAt), 'MMM d, yyyy HH:mm')}</p>
                    </Card>
                  ))
                )}
              </>
            )}

            {activeTab === 'media' && (
              <>
                {(allImages.length === 0 && allVideos.length === 0) ? (
                  <Card className="text-center py-10"><p className="text-zinc-500">No media attached</p></Card>
                ) : (
                  <>
                    {allImages.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm text-zinc-400 mb-2">Images ({allImages.length})</h4>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {allImages.map((img, i) => (
                            <button key={i} onClick={() => setShowMediaViewer(img.url)}
                              className="aspect-video rounded-xl overflow-hidden border border-zinc-700/60 hover:border-amber-500/50 transition-all">
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {allVideos.length > 0 && (
                      <div>
                        <h4 className="text-sm text-zinc-400 mb-2">Videos ({allVideos.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {allVideos.map((vid, i) => (
                            <div key={i} className="aspect-video rounded-xl overflow-hidden border border-zinc-700/60">
                              {vid.url.includes('youtube') || vid.url.includes('youtu.be') ? (
                                <iframe src={`https://www.youtube.com/embed/${vid.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''}`}
                                  className="w-full h-full" allowFullScreen />
                              ) : (
                                <video src={vid.url} controls className="w-full h-full" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showMediaViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setShowMediaViewer(null)}>
          <img src={showMediaViewer} className="max-w-full max-h-full object-contain rounded-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {viewEntry && (
        <Modal open={!!viewEntry} onClose={() => setViewEntry(null)} title={viewEntry.title} size="xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
            <Calendar size={14} />
            {format(new Date(viewEntry.date || viewEntry.createdAt), 'MMM d, yyyy')}
            {viewEntry.mood && (
              <Badge color={
                { productive: 'emerald', struggling: 'red', neutral: 'gray', breakthrough: 'purple', learning: 'sky' }[viewEntry.mood]
              }>{viewEntry.mood}</Badge>
            )}
          </div>
          {viewEntry.content ? (
            <p className="text-zinc-300 text-sm whitespace-pre-wrap mb-4">{viewEntry.content}</p>
          ) : (
            <p className="text-zinc-500 text-sm italic mb-4">No notes</p>
          )}
          {viewEntry.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4 pt-4 border-t border-white/5">
              {viewEntry.tags.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-white/5">{tag}</span>
              ))}
            </div>
          )}
          {viewEntry.images?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Photos ({viewEntry.images.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {viewEntry.images.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full aspect-video object-cover rounded-xl border border-zinc-700/60 cursor-pointer" onClick={() => setShowMediaViewer(url)} />
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
                    <iframe src={`https://www.youtube.com/embed/${(url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1] || ''}`}
                      className="w-full h-full" allowFullScreen />
                  ) : <video src={url} controls className="w-full h-full" />}
                </div>
              ))}
            </div>
          )}
          {(!viewEntry.content && !viewEntry.images?.length && !viewEntry.videos?.length) && (
            <p className="text-zinc-500 text-sm italic">Empty entry</p>
          )}
        </Modal>
      )}

      <Modal open={showLogModal} onClose={() => setShowLogModal(false)} title="New Log Entry" size="xl">
        <form onSubmit={handleAddLog} className="flex flex-col gap-4">
          <Input label="Title *" value={logForm.title} onChange={e => setLogForm({ ...logForm, title: e.target.value })} placeholder="What did you work on?" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date" type="date" value={logForm.date} onChange={e => setLogForm({ ...logForm, date: e.target.value })} />
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 block">Mood</label>
              <select value={logForm.mood || ''} onChange={e => setLogForm({ ...logForm, mood: e.target.value || null })}
                className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-amber-600/50">
                <option value="">No mood</option>
                <option value="productive">Productive</option>
                <option value="struggling">Struggling</option>
                <option value="neutral">Neutral</option>
                <option value="breakthrough">Breakthrough</option>
                <option value="learning">Learning</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 block">Notes (Markdown supported)</label>
            <textarea value={logForm.content} onChange={e => setLogForm({ ...logForm, content: e.target.value })}
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-600/50 h-32 resize-none font-mono text-sm" placeholder="Write your notes... Markdown is supported" />
          </div>
          <ImageUpload urls={logForm.images} onChange={(urls) => setLogForm({ ...logForm, images: urls })} />
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 block">Videos (YouTube URLs, one per line)</label>
            <textarea value={videosText} onChange={e => setVideosText(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-600/50 h-16 resize-none text-xs" placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowLogModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Save Entry</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Milestone">
        <form onSubmit={handleAddMilestone} className="flex flex-col gap-4">
          <Input label="Milestone Name *" value={milestoneForm.name} onChange={e => setMilestoneForm({ ...milestoneForm, name: e.target.value })} placeholder="e.g., MVP Launch" required />
          <Input label="Due Date" type="date" value={milestoneForm.dueDate} onChange={e => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })} />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowMilestoneModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Add Milestone</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showTimeModal} onClose={() => setShowTimeModal(false)} title="Log Time">
        <form onSubmit={handleAddTime} className="flex flex-col gap-4">
          <Input label="Duration (minutes) *" type="number" min={1} value={timeForm.duration} onChange={e => setTimeForm({ ...timeForm, duration: parseInt(e.target.value) || 0 })} />
          <Input label="Description" value={timeForm.description} onChange={e => setTimeForm({ ...timeForm, description: e.target.value })} placeholder="What did you do?" />
          <Input label="Date" type="date" value={timeForm.date} onChange={e => setTimeForm({ ...timeForm, date: e.target.value })} />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowTimeModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Log Time</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showCommentModal} onClose={() => setShowCommentModal(false)} title="Add Comment">
        <form onSubmit={handleAddComment} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 block">Comment</label>
            <textarea value={commentForm.text} onChange={e => setCommentForm({ ...commentForm, text: e.target.value })}
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-600/50 h-24 resize-none" placeholder="Write your comment..." required />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCommentModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Add Comment</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
