import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { Menu } from 'lucide-react'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import GlobalSearch from './components/GlobalSearch'
import NotificationBell from './components/NotificationBell'
import ThemeToggle from './components/ThemeToggle'
import { ParticleBackground, FloatingOrbs, FloatingActionButton } from './effects'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import DailyLog from './pages/DailyLog'
import KanbanBoard from './pages/kanban/KanbanBoard'
import CalendarView from './pages/calendar/CalendarView'
import TimelineView from './pages/timeline/TimelineView'
import Analytics from './pages/analytics/Analytics'
import Settings from './pages/Settings'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.main key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.15 }}
        className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto relative z-10">
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/daily-log" element={<DailyLog />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/timeline" element={<TimelineView />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-950 text-gray-100 dark relative">
        <ParticleBackground />
        <FloatingOrbs />
        <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-30 bg-black/30 border-b border-white/5 px-2 sm:px-3 lg:px-8 py-2.5 lg:py-3 flex items-center gap-2 backdrop-blur-xl">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
              <Menu size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </motion.header>
          <AnimatedRoutes />
        </div>
        <FloatingActionButton />
      </div>
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#000', color: '#f3f4f6',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px', fontSize: '14px',
          backdropFilter: 'blur(16px)',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#1f2937' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#1f2937' } },
      }} />
    </ThemeProvider>
  )
}
