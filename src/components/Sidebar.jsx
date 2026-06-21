import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CalendarPlus, GitBranch } from 'lucide-react'

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <aside className="w-64 min-h-screen bg-gray-900/50 border-r border-white/10 p-6 flex flex-col">
      <div className="mb-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ProjectHub
        </h1>
        <p className="text-xs text-gray-500 mt-1">Project Management Dashboard</p>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/projects" className={linkClass}>
          <FolderKanban size={20} />
          Projects
        </NavLink>
        <NavLink to="/daily-log" className={linkClass}>
          <CalendarPlus size={20} />
          Daily Log
        </NavLink>
      </nav>

      <div className="pt-6 border-t border-white/10">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm">
          <GitBranch size={16} />
          Deployed on GitHub
        </a>
      </div>
    </aside>
  )
}
