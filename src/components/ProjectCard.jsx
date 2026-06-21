import { Link } from 'react-router-dom'
import { ExternalLink, Calendar, Trash2 } from 'lucide-react'

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const priorityColors = {
  low: 'border-l-emerald-500/50',
  medium: 'border-l-amber-500/50',
  high: 'border-l-red-500/50',
  critical: 'border-l-purple-500/50',
}

export default function ProjectCard({ project, onDelete }) {
  return (
    <div className="group relative">
      <Link to={`/projects/${project.id}`}
        className={`block glass rounded-2xl p-5 border border-white/10 border-l-4 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all ${priorityColors[project.priority] || priorityColors.medium}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
              {project.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{project.description}</p>
          </div>
          <ExternalLink size={16} className="text-gray-600 group-hover:text-indigo-400 shrink-0 mt-0.5 ml-2" />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span className={`px-2 py-0.5 rounded-lg border ${statusColors[project.status] || statusColors.active}`}>
            {project.status || 'active'}
          </span>
          <span className={`px-2 py-0.5 rounded-lg border ${project.priority === 'high' || project.priority === 'critical' ? 'border-red-500/30 text-red-400' : project.priority === 'low' ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400'}`}>
            {project.priority || 'medium'}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Calendar size={10} />
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </Link>
      {onDelete && (
        <button onClick={(e) => { e.preventDefault(); onDelete(project.id) }}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
