import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CalendarPlus, Columns3, Calendar, Timeline, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { MagneticButton } from '../effects'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', shortcut: '⌘1' },
  { to: '/projects', icon: FolderKanban, label: 'Projects', shortcut: '⌘2' },
  { to: '/kanban', icon: Columns3, label: 'Kanban', shortcut: '⌘3' },
  { to: '/daily-log', icon: CalendarPlus, label: 'Daily Log', shortcut: '⌘4' },
  { to: '/calendar', icon: Calendar, label: 'Calendar', shortcut: '⌘5' },
  { to: '/timeline', icon: Timeline, label: 'Timeline', shortcut: '⌘6' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', shortcut: '⌘7' },
  { to: '/settings', icon: Settings, label: 'Settings', shortcut: '⌘8' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
      isActive
        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
    }`

  return (
    <motion.aside animate={{ width: collapsed ? 80 : 260 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="min-h-screen bg-gray-900/50 border-r border-white/10 p-4 flex flex-col shrink-0 overflow-hidden relative z-20">
      <div className="flex items-center justify-between mb-8 px-2">
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 className="text-xl font-bold">
              <span className="text-gradient">ProjectHub</span>
            </h1>
            <p className="text-[10px] text-gray-500 mt-0.5">Ultimate PM Dashboard</p>
          </motion.div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {links.map(({ to, icon: Icon, label, shortcut }) => (
          <MagneticButton key={to} strength={0.15}>
            <NavLink to={to} end={to === '/'} className={linkClass}>
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1">{label}</span>
                  <span className="text-[10px] text-gray-600 font-mono">{shortcut}</span>
                </>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-white/10">
                  {label}
                </div>
              )}
            </NavLink>
          </MagneticButton>
        ))}
      </nav>

      {!collapsed && (
        <div className="pt-4 mt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600">v2.0 Ultimate Edition</p>
        </div>
      )}
    </motion.aside>
  )
}
