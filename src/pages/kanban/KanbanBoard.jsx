import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, MoreHorizontal } from 'lucide-react'
import { loadData, updateProject } from '../../data/store'
import { useAuth } from '../../context/AuthContext'
import Card from '../../ui/Card'
import Badge from '../../ui/Badge'
import { useNavigate } from 'react-router-dom'

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'border-t-gray-500' },
  { id: 'active', title: 'Active', color: 'border-t-emerald-500' },
  { id: 'paused', title: 'Paused', color: 'border-t-amber-500' },
  { id: 'completed', title: 'Completed', color: 'border-t-blue-500' },
]

export default function KanbanBoard() {
  const { isOwner } = useAuth()
  const [data, setData] = useState({ projects: [] })
  const [dragging, setDragging] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { setData(loadData()) }, [])

  const getProjectsForColumn = (status) => data.projects.filter(p => (p.status || 'active') === status)

  const handleDragStart = (e, project) => {
    setDragging(project.id)
    e.dataTransfer.setData('text/plain', project.id)
  }

  const handleDrop = (e, status) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) {
      updateProject(id, { status })
      setData(loadData())
    }
    setDragging(null)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Kanban Board</h2>
        <p className="text-gray-400 mt-1">Drag & drop projects between status columns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[60vh]">
        {columns.map(col => {
          const projects = getProjectsForColumn(col.id)
          return (
            <div key={col.id}
              onDragOver={isOwner ? e => e.preventDefault() : undefined}
              onDrop={isOwner ? e => handleDrop(e, col.id) : undefined}
              className={`glass rounded-2xl border border-white/10 border-t-2 ${col.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">{col.title}</h3>
                <Badge color="gray">{projects.length}</Badge>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {projects.length === 0 && (
                  <div className="text-center py-8 text-gray-600 text-sm border border-dashed border-white/5 rounded-xl">
                    Drop projects here
                  </div>
                )}
                {projects.map((p, i) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    {...(isOwner ? { draggable: true, onDragStart: e => handleDragStart(e, p) } : {})}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className={`glass rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-indigo-500/30 transition-all ${dragging === p.id ? 'opacity-50 scale-95' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white text-sm font-medium">{p.name}</h4>
                      <MoreHorizontal size={14} className="text-gray-500" />
                    </div>
                    {p.description && <p className="text-gray-500 text-xs line-clamp-2 mb-2">{p.description}</p>}
                    <div className="flex items-center gap-2">
                      <Badge color={p.priority === 'high' || p.priority === 'critical' ? 'red' : p.priority === 'low' ? 'emerald' : 'amber'} className="text-[10px]">
                        {p.priority || 'medium'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
