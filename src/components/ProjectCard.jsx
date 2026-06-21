import { Link } from 'react-router-dom'
import { ExternalLink, Calendar, Clock } from 'lucide-react'

export default function ProjectCard({ project }) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  return (
    <Link to={`/projects/${project.id}`}
      className="group block bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-white/[0.07] transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{project.description}</p>
        </div>
        <ExternalLink size={18} className="text-gray-600 group-hover:text-indigo-400 shrink-0 mt-1" />
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className={`px-2 py-1 rounded-lg border ${statusColors[project.status] || statusColors.active}`}>
          {project.status || 'active'}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  )
}
