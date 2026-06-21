import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Download, Upload, Trash2, Sun, Moon, Monitor, Keyboard, Bell, Database } from 'lucide-react'
import { loadData, saveData, exportData, importData, clearNotifications, generateId } from '../data/store'
import { useTheme } from '../context/ThemeContext'
import Card from '../ui/Card'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [data, setData] = useState(null)
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)

  useEffect(() => { setData(loadData()) }, [])

  const handleExport = () => exportData()

  const handleImport = () => {
    if (importData(importText)) {
      setShowImport(false)
      setImportText('')
      setData(loadData())
      toast.success('Data imported successfully')
    } else {
      toast.error('Invalid data format')
    }
  }

  const handleClearAll = () => {
    if (confirm('This will delete ALL your data. Are you sure?') && confirm('Really? This cannot be undone!')) {
      saveData({ projects: [], logEntries: [], tags: [], milestones: [], timeEntries: [], comments: [], settings: {}, notifications: [] })
      setData(loadData())
      toast.success('All data cleared')
    }
  }

  const handleAddSampleData = () => {
    const sample = [
      {
        id: generateId(), name: 'Website Redesign', description: 'Complete overhaul of company website', status: 'active', priority: 'high', progress: 35, tags: [], createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: generateId(), name: 'Mobile App v2', description: 'Version 2 of the mobile application', status: 'active', priority: 'critical', progress: 60, tags: [], createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: generateId(), name: 'API Integration', description: 'Third-party API integration project', status: 'paused', priority: 'medium', progress: 20, tags: [], createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: generateId(), name: 'Legacy Migration', description: 'Migrate legacy system to new platform', status: 'completed', priority: 'high', progress: 100, tags: [], createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      },
    ]

    const today = new Date().toISOString().split('T')[0]
    const sampleEntries = [
      {
        id: generateId(), projectId: sample[0].id, title: 'Homepage wireframes', content: 'Completed initial wireframes for the new homepage. Client feedback was positive. Need to iterate on the hero section.', date: today, images: [], videos: [], mood: 'productive', createdAt: new Date().toISOString(),
      },
      {
        id: generateId(), projectId: sample[1].id, title: 'Push notifications setup', content: 'Configured push notification service. Working on deep linking for notification taps.', date: today, images: [], videos: [], mood: 'learning', createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]

    const d = loadData()
    d.projects = [...d.projects, ...sample]
    d.logEntries = [...d.logEntries, ...sampleEntries]
    saveData(d)
    setData(d)
    toast.success('Sample data added')
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  const shortcuts = [
    { keys: ['Ctrl', 'K'], label: 'Search' },
    { keys: ['Ctrl', 'N'], label: 'New project' },
    { keys: ['Ctrl', 'L'], label: 'New log entry' },
    { keys: ['Escape'], label: 'Close modal' },
    { keys: ['Ctrl', 'E'], label: 'Export data' },
    { keys: ['?'], label: 'Show shortcuts' },
  ]

  const stats = data ? [
    { label: 'Projects', value: data.projects?.length || 0 },
    { label: 'Log Entries', value: data.logEntries?.length || 0 },
    { label: 'Milestones', value: data.milestones?.length || 0 },
    { label: 'Time Entries', value: data.timeEntries?.length || 0 },
    { label: 'Comments', value: data.comments?.length || 0 },
    { label: 'Notifications', value: data.notifications?.length || 0 },
    { label: 'Tags', value: data.tags?.length || 0 },
  ] : []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <SettingsIcon size={24} className="text-indigo-400" /> Settings
        </h2>
        <p className="text-gray-400 mt-1">Configure your dashboard preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sun size={18} className="text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Appearance</h3>
          </div>
          <div className="flex gap-2">
            {themes.map(t => {
              const Icon = t.icon
              return (
                <button key={t.value} onClick={() => setTheme(t.value)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${theme === t.value ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'glass border-white/10 text-gray-400 hover:text-white'}`}>
                  <Icon size={24} />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Keyboard size={18} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
          </div>
          <div className="space-y-2">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{s.label}</span>
                <div className="flex gap-1">
                  {s.keys.map((k, j) => (
                    <kbd key={j} className="px-2 py-0.5 text-xs rounded bg-white/10 text-gray-300 font-mono border border-white/10">
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Database size={18} className="text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Data Management</h3>
          </div>
          <div className="space-y-3">
            <Button onClick={handleExport} icon={Download} variant="glass" className="w-full justify-start">Export Data (JSON)</Button>
            <Button onClick={() => setShowImport(!showImport)} icon={Upload} variant="glass" className="w-full justify-start">Import Data</Button>
            {showImport && (
              <div className="space-y-2">
                <textarea value={importText} onChange={e => setImportText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 h-24 resize-none text-xs font-mono" placeholder="Paste your JSON backup here..." />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleImport} className="flex-1">Import</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowImport(false)}>Cancel</Button>
                </div>
              </div>
            )}
            <hr className="border-white/5" />
            <Button onClick={handleAddSampleData} variant="secondary" className="w-full justify-start">Add Sample Data</Button>
            <Button onClick={handleClearAll} variant="danger" icon={Trash2} className="w-full justify-start">Clear All Data</Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-sky-400" />
            <h3 className="text-lg font-semibold text-white">Data Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => (
              <div key={s.label} className="glass rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4">All data is stored locally in your browser localStorage.</p>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Database size={18} className="text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">About ProjectHub</h3>
          </div>
          <div className="text-sm text-gray-400 space-y-2">
            <p><strong className="text-white">Version:</strong> 2.0.0 — Ultimate Edition</p>
            <p><strong className="text-white">Tech Stack:</strong> React 19 + Vite + Tailwind CSS + Framer Motion + Recharts</p>
            <p><strong className="text-white">Features:</strong> Project Management, Daily Logs, Kanban Board, Calendar View, Timeline, Analytics, Media Support (Photos/Videos via Cloudinary & YouTube), Time Tracking, Milestones, Comments, Global Search, Keyboard Shortcuts, Multi-theme, Data Export/Import</p>
            <p><strong className="text-white">Deployment:</strong> Automatically deployed to GitHub Pages on every push</p>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
