import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import GlobalSearch from './components/GlobalSearch'
import NotificationBell from './components/NotificationBell'
import ThemeToggle from './components/ThemeToggle'
import { ParticleBackground, FloatingOrbs, CustomCursor, FloatingActionButton } from './effects'
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
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex-1 p-4 lg:p-8 overflow-y-auto relative z-10">
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
      <div className="flex min-h-screen bg-gray-950 text-gray-100 dark relative">
        <ParticleBackground />
        <FloatingOrbs />
        <CustomCursor />
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-30 glass border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 backdrop-blur-xl">
            <GlobalSearch />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </motion.header>
          <AnimatedRoutes />
        </div>
        <FloatingActionButton />
      </div>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1f2937', color: '#f3f4f6',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#1f2937' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#1f2937' } },
      }} />
    </ThemeProvider>
  )
}
