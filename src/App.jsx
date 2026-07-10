import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { Menu, Cloud, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider, useDataVersion } from './context/DataContext'
import { tryLoadFromGistParam, getRemoteData, saveData } from './data/store'
import { pullFromGist, restoreGistIdFromClerk, setClerkUser } from './data/sync'
import Sidebar from './components/Sidebar'
import GlobalSearch from './components/GlobalSearch'
import NotificationBell from './components/NotificationBell'
import ThemeToggle from './components/ThemeToggle'
import LockBadge from './components/LockBadge'
import { ParticleBackground, FloatingOrbs, FloatingActionButton } from './effects'
import Dashboard from './react-pages/Dashboard'
import Projects from './react-pages/Projects'
import ProjectDetail from './react-pages/ProjectDetail'
import DailyLog from './react-pages/DailyLog'
import KanbanBoard from './react-pages/kanban/KanbanBoard'
import CalendarView from './react-pages/calendar/CalendarView'
import TimelineView from './react-pages/timeline/TimelineView'
import Analytics from './react-pages/analytics/Analytics'
import Settings from './react-pages/Settings'
import Login from './react-pages/Login'

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loadingGist, setLoadingGist] = useState(false)
  const { dataVersion, bumpDataVersion } = useDataVersion()
  const location = useLocation()
  const navigate = useNavigate()
  const { isOwner, user } = useAuth()

  useEffect(() => {
    const savedPath = sessionStorage.getItem('spa_redirect')
    if (savedPath) {
      sessionStorage.removeItem('spa_redirect')
      if (window.location.pathname + window.location.search + window.location.hash !== savedPath) {
        navigate(savedPath, { replace: true })
      }
    }
  }, [navigate])

  useEffect(() => {
    const hash = window.location.hash
    const gistId = new URLSearchParams(window.location.search).get('gist')

    const handleHash = () => {
      if (hash.startsWith('#log-')) {
        sessionStorage.setItem('focus_entry', hash.replace('#log-', ''))
        navigate('/daily-log', { replace: true })
      }
    }

    if (gistId) {
      if (sessionStorage.getItem('_gist_loaded_' + gistId)) {
        window.history.replaceState(null, '', window.location.pathname + (hash || ''))
        handleHash()
      } else {
        setLoadingGist(true)
        tryLoadFromGistParam().then(data => {
          if (data) {
            saveData(data)
            sessionStorage.setItem('_gist_loaded_' + gistId, '1')
            window.history.replaceState(null, '', window.location.pathname + (hash || ''))
            bumpDataVersion()
            handleHash()
          } else {
            toast.error('Failed to load shared data. The Gist may be private or rate-limited.')
          }
        }).finally(() => setLoadingGist(false))
      }
    } else {
      handleHash()
    }
  }, [navigate])

  const autoSync = useCallback(async (quiet) => {
    if (!user) return
    const gistId = await restoreGistIdFromClerk(user)
    if (!gistId) return
    setLoadingGist(true)
    try {
      const gistData = await pullFromGist()
      saveData(gistData)
      bumpDataVersion()
      if (!quiet) toast.success('Data restored from cloud')
    } catch {
      if (!quiet) toast.error('Cloud sync unavailable')
    } finally {
      setLoadingGist(false)
    }
  }, [user])

  useEffect(() => { autoSync(true) }, [autoSync])

  useEffect(() => { setClerkUser(user) }, [user])

  useEffect(() => {
    const onFocus = () => { autoSync(true) }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [autoSync])

  const isRemote = !!getRemoteData()
  const isGistView = !!new URLSearchParams(window.location.search).get('gist')

  return (
    <div className="flex min-h-screen relative">
      <ParticleBackground />
      <FloatingOrbs />
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {loadingGist && (
          <div className="bg-amber-600/10 border-b border-amber-600/20 px-4 py-1.5 text-center text-xs text-amber-500">
            Loading shared data...
          </div>
        )}
        {isRemote && !loadingGist && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center text-xs text-amber-400 flex items-center justify-center gap-1.5">
            <Cloud size={12} />
            Viewing shared data via Gist
          </div>
        )}
        <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 bg-black/30 border-b border-white/5 px-2 sm:px-3 lg:px-8 py-2.5 lg:py-3 flex items-center gap-2 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.03]">
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <LockBadge />
            <button onClick={() => autoSync()} title="Refresh data from cloud"
              className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.03] transition-all">
              <RefreshCw size={16} className={loadingGist ? 'animate-spin' : ''} />
            </button>
            <ThemeToggle />
            <NotificationBell />
          </div>
        </motion.header>
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
      </div>
      <FloatingActionButton />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: '#111', color: '#f3f4f6',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#111' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#111' } },
        }} />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
