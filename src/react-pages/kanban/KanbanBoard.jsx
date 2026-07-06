import { useState, useEffect, useRef } from 'react'
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
  const dragId = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { setData(loadData()) }, [])

  const getProjectsForColumn = (status) => data.projects.filter(p => (p.status || 'active') === status)

  const handleDragStart = (e, project) => {
    dragId.current = project.id
    setDragging(project.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', project.id)
  }

  const handleDragEnd = () => {
    dragId.current = null
    setDragging(null)
  }

  const handleDrop = (e, status) => {
    e.preventDefault()
    const id = dragId.current || e.dataTransfer.getData('text/plain')
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
        <p className="text-zinc-400 mt-1">Drag & drop projects between status columns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[60vh]">
        {columns.map(col => {
          const projects = getProjectsForColumn(col.id)
          return (
            <div key={col.id}
              onDragOver={isOwner ? e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' } : undefined}
              onDrop={isOwner ? e => handleDrop(e, col.id) : undefined}
              className={`glass rounded-2xl border border-zinc-700/60 border-t-2 ${col.color} p-4 transition-colors ${dragging ? 'border-amber-600/40' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">{col.title}</h3>
                <Badge color="gray">{projects.length}</Badge>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {projects.length === 0 && (
                  <div className="text-center py-8 text-zinc-600 text-sm border border-dashed border-white/5 rounded-xl">
                    Drop projects here
                  </div>
                )}
                {projects.map(p => (
                  <div key={p.id}
                    draggable={isOwner}
                    onDragStart={e => handleDragStart(e, p)}
                    onDragEnd={handleDragEnd}
                    onClick={() => { if (!dragId.current) navigate(`/projects/${p.id}`) }}
                    className={`glass rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-amber-600/30 transition-all select-none ${dragging === p.id ? 'opacity-50 scale-95 shadow-lg shadow-amber-600/10' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white text-sm font-medium">{p.name}</h4>
                      <MoreHorizontal size={14} className="text-zinc-500 shrink-0" />
                    </div>
                    {p.description && <p className="text-zinc-500 text-xs line-clamp-2 mb-2">{p.description}</p>}
                    <div className="flex items-center gap-2">
                      <Badge color={p.priority === 'high' || p.priority === 'critical' ? 'red' : p.priority === 'low' ? 'emerald' : 'amber'} className="text-[10px]">
                        {p.priority || 'medium'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
