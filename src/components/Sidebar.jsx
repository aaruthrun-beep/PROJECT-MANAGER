import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CalendarPlus, Columns3, Calendar, Timeline, BarChart3, Settings, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/kanban', icon: Columns3, label: 'Kanban' },
  { to: '/daily-log', icon: CalendarPlus, label: 'Daily Log' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/timeline', icon: Timeline, label: 'Timeline' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function SidebarContent({ onLinkClick }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
    }`

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h1 className="text-xl font-bold">
            <span className="text-gradient">ProjectHub</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Ultimate PM Dashboard</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={linkClass} onClick={onLinkClick}>
            <Icon size={20} className="shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="pt-4 mt-4 border-t border-white/5 text-center">
        <p className="text-[10px] text-gray-600">v2.0 Ultimate</p>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 min-h-screen bg-black/40 border-r border-white/5 p-4 shrink-0 relative z-20">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={onMobileClose} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-60 bg-black border-r border-white/5 p-3 z-50 md:hidden">
              <div className="flex justify-end mb-2">
                <button onClick={onMobileClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent onLinkClick={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
