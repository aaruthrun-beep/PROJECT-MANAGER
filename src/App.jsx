import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import GlobalSearch from './components/GlobalSearch'
import NotificationBell from './components/NotificationBell'
import ThemeToggle from './components/ThemeToggle'
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
      <motion.main key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
        className="flex-1 p-6 lg:p-8 overflow-y-auto">
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
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-950 text-gray-100 dark">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 glass border-b border-white/10 px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <GlobalSearch />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </header>
          <AnimatedRoutes />
        </div>
      </div>
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
        success: { iconTheme: { primary: '#10b981', secondary: '#1f2937' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#1f2937' } },
      }} />
    </ThemeProvider>
  )
}
