import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, SlidersHorizontal, LayoutGrid, List, FolderKanban as FolderKanbanIcon } from 'lucide-react'
import { loadData, addProject, deleteProject } from '../data/store'
import { useAuth } from '../context/AuthContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import ProjectCard from '../components/ProjectCard'

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export default function Projects() {
  const { isOwner } = useAuth()
  const [data, setData] = useState({ projects: [] })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', status: 'active', priority: 'medium', tags: [] })

  const refresh = () => setData(loadData())
  useEffect(refresh, [])

  let filtered = data.projects
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
  }
  if (statusFilter !== 'all') filtered = filtered.filter(p => (p.status || 'active') === statusFilter)
  if (priorityFilter !== 'all') filtered = filtered.filter(p => (p.priority || 'medium') === priorityFilter)

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addProject({ name: form.name.trim(), description: form.description.trim(), status: form.status, priority: form.priority })
    setForm({ name: '', description: '', status: 'active', priority: 'medium', tags: [] })
    setShowModal(false)
    refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Projects</h2>
          <p className="text-zinc-400 mt-1">{data.projects.length} total projects</p>
        </div>
        {isOwner && (
          <Button onClick={() => setShowModal(true)} icon={Plus} size="lg">
            New Project
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-600/50 transition-all text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-amber-600/50">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-amber-600/50">
          <option value="all">All Priority</option>
          {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <div className="flex glass rounded-xl p-0.5 border border-zinc-700/60">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-600/20 text-amber-400' : 'text-zinc-500 hover:text-white'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-600/20 text-amber-400' : 'text-zinc-500 hover:text-white'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 glass rounded-2xl border border-zinc-700/60">
          <FolderKanbanIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-1">{data.projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}</p>
          {data.projects.length === 0 && isOwner && (
            <Button onClick={() => setShowModal(true)} variant="secondary" className="mt-4">Create your first project</Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <ProjectCard project={p} onDelete={isOwner ? () => { deleteProject(p.id); refresh() } : undefined} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="glass rounded-2xl border border-zinc-700/60 overflow-hidden">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="group flex items-center gap-4 p-4 hover:bg-zinc-800/80 transition-all border-b border-white/5 last:border-0">
              <div className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-emerald-400' : p.status === 'paused' ? 'bg-amber-400' : p.status === 'completed' ? 'bg-blue-400' : 'bg-zinc-500'}`} />
              <div className="flex-1 min-w-0">
                <Link to={`/projects/${p.id}`} className="text-white font-medium hover:text-amber-500 transition-colors truncate block">{p.name}</Link>
                <p className="text-xs text-zinc-500 truncate">{p.description || 'No description'}</p>
              </div>
              <span className="text-xs text-zinc-500 capitalize">{p.priority || 'medium'}</span>
              <span className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleDateString()}</span>
              {isOwner && <button onClick={() => { deleteProject(p.id); refresh() }} className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all">Delete</button>}
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Project Name *" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="My Awesome Project" required />
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-600/50 h-24 resize-none" placeholder="What is this project about?" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Status" options={[{ value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'completed', label: 'Completed' }]}
              value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
            <Select label="Priority" options={priorities} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} />
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}


