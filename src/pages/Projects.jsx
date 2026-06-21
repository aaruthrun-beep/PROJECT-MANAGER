import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { loadData, addProject, deleteProject } from '../data/store'
import ProjectCard from '../components/ProjectCard'

export default function Projects() {
  const [data, setData] = useState({ projects: [] })
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', status: 'active' })

  const refresh = () => setData(loadData())
  useEffect(refresh, [])

  const filtered = data.projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addProject({ name: form.name.trim(), description: form.description.trim(), status: form.status })
    setForm({ name: '', description: '', status: 'active' })
    setShowModal(false)
    refresh()
  }

  const handleDelete = (id) => {
    if (confirm('Delete this project and all its log entries?')) {
      deleteProject(id)
      refresh()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Projects</h2>
          <p className="text-gray-400 mt-1">Manage all your projects</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25">
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
          <p className="text-lg mb-2">{data.projects.length === 0 ? 'No projects yet' : 'No projects match your search'}</p>
          {data.projects.length === 0 && (
            <button onClick={() => setShowModal(true)} className="text-indigo-400 hover:text-indigo-300">Create your first project</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="relative group/card">
              <ProjectCard project={p} />
              <button onClick={() => handleDelete(p.id)}
                className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 text-red-400 hover:text-red-300 text-xs bg-gray-900/80 px-2 py-1 rounded-lg transition-all">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-6">Create New Project</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Project Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50" placeholder="My Awesome Project" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-24 resize-none" placeholder="What is this project about?" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500/50">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl transition-all">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl transition-all">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
