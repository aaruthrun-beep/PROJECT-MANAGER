import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Download, Upload, Trash2, Sun, Moon, Monitor, Keyboard, Bell, Database, GitFork, Lock, Unlock, Cloud, Image } from 'lucide-react'
import { loadData, saveData, exportData, importData, clearNotifications, generateId } from '../data/store'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { getSyncConfig, saveSyncConfig, isSyncConfigured, pushToGist, pullFromGist, createGist, syncStatus, getImageConfig, saveImageConfig } from '../data/sync'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import toast from 'react-hot-toast'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { setPassword, hasPassword, logout, isOwner } = useAuth()
  const [data, setData] = useState(null)
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [syncConfig, setSyncConfig] = useState({ token: '', gistId: '' })
  const [syncing, setSyncing] = useState(false)
  const [syncInfo, setSyncInfo] = useState(null)
  const [imgConfig, setImgConfig] = useState({ token: '', owner: '', repo: '', path: 'assets/images', branch: 'main' })

  useEffect(() => { setData(loadData()) }, [])

  useEffect(() => {
    const c = getSyncConfig()
    setSyncConfig(c)
    if (c.token && c.gistId) {
      syncStatus().then(setSyncInfo)
    }
    setImgConfig(getImageConfig())
  }, [])

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
      { id: generateId(), name: 'Website Redesign', description: 'Complete overhaul of company website', status: 'active', priority: 'high', progress: 35, tags: [], createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: generateId(), name: 'Mobile App v2', description: 'Version 2 of the mobile application', status: 'active', priority: 'critical', progress: 60, tags: [], createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
      { id: generateId(), name: 'API Integration', description: 'Third-party API integration project', status: 'paused', priority: 'medium', progress: 20, tags: [], createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
      { id: generateId(), name: 'Legacy Migration', description: 'Migrate legacy system to new platform', status: 'completed', priority: 'high', progress: 100, tags: [], createdAt: new Date(Date.now() - 60 * 86400000).toISOString() },
    ]
    const today = new Date().toISOString().split('T')[0]
    const sampleEntries = [
      { id: generateId(), projectId: sample[0].id, title: 'Homepage wireframes', content: 'Completed initial wireframes for the new homepage. Client feedback was positive.', date: today, images: [], videos: [], mood: 'productive', createdAt: new Date().toISOString() },
      { id: generateId(), projectId: sample[1].id, title: 'Push notifications setup', content: 'Configured push notification service.', date: today, images: [], videos: [], mood: 'learning', createdAt: new Date(Date.now() - 3600000).toISOString() },
    ]
    const d = loadData()
    d.projects = [...d.projects, ...sample]
    d.logEntries = [...d.logEntries, ...sampleEntries]
    saveData(d)
    setData(d)
    toast.success('Sample data added')
  }

  const handleSetPassword = (e) => {
    e.preventDefault()
    if (!passwordForm.new) { toast.error('Enter a password'); return }
    if (passwordForm.new !== passwordForm.confirm) { toast.error('Passwords do not match'); return }
    if (hasPassword()) {
      const stored = localStorage.getItem('project_hub_pass')
      if (stored !== btoa(passwordForm.current)) { toast.error('Current password is wrong'); return }
    }
    setPassword(passwordForm.new)
    setShowPasswordForm(false)
    setPasswordForm({ current: '', new: '', confirm: '' })
    toast.success('Password saved')
  }

  const handleSyncSave = () => {
    saveSyncConfig(syncConfig)
    if (syncConfig.token && syncConfig.gistId) {
      syncStatus().then(setSyncInfo)
    }
    toast.success('Sync config saved')
  }

  const handleImgSave = () => {
    saveImageConfig({ ...imgConfig, path: imgConfig.path.replace(/^\/+|\/+$/g, '') })
    toast.success('Image hosting config saved')
  }

  const handlePush = async () => {
    setSyncing(true)
    try {
      const data = loadData()
      await pushToGist(data)
      toast.success('Data pushed to GitHub Gist')
      syncStatus().then(setSyncInfo)
    } catch (e) {
      toast.error(e.message)
    }
    setSyncing(false)
  }

  const handlePull = async () => {
    setSyncing(true)
    try {
      const data = await pullFromGist()
      saveData(data)
      setData(data)
      toast.success('Data pulled from GitHub Gist')
      syncStatus().then(setSyncInfo)
    } catch (e) {
      toast.error(e.message)
    }
    setSyncing(false)
  }

  const handleCreateGist = async () => {
    if (!syncConfig.token) { toast.error('Enter your GitHub token first'); return }
    setSyncing(true)
    try {
      const data = loadData()
      const { gistId, gistUrl } = await createGist(syncConfig.token, data)
      setSyncConfig(prev => ({ ...prev, gistId }))
      saveSyncConfig({ token: syncConfig.token, gistId })
      toast.success(`Gist created! ID: ${gistId}`)
      syncStatus().then(setSyncInfo)
    } catch (e) {
      toast.error(e.message)
    }
    setSyncing(false)
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

  if (!isOwner && hasPassword()) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-amber-400" />
        </div>
        <p className="text-gray-400 text-lg mb-1">Settings locked</p>
        <p className="text-gray-600 text-sm mb-5"><Link to="/login" className="text-indigo-400 hover:text-indigo-300 underline">Login</Link> to configure settings</p>
      </motion.div>
    )
  }

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
                    <kbd key={j} className="px-2 py-0.5 text-xs rounded bg-white/10 text-gray-300 font-mono border border-white/10">{k}</kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Authentication */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Authentication</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <span className={`text-sm flex items-center gap-1.5 ${isOwner ? 'text-emerald-400' : 'text-gray-500'}`}>
                {isOwner ? <><Unlock size={13} /> Admin</> : <><Lock size={13} /> Viewer</>}
              </span>
            </div>
            {isOwner && (
              <Button onClick={logout} variant="glass" className="w-full justify-start text-red-400 hover:bg-red-500/10">
                <Lock size={14} /> Lock & Logout
              </Button>
            )}
            <hr className="border-white/5" />
            <Button onClick={() => setShowPasswordForm(!showPasswordForm)} variant="glass" className="w-full justify-start">
              {hasPassword() ? 'Change Password' : 'Set Password'}
            </Button>
            {showPasswordForm && (
              <form onSubmit={handleSetPassword} className="space-y-2 pl-2 border-l-2 border-indigo-500/30">
                {hasPassword() && (
                  <Input label="Current password" type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Current password" />
                )}
                <Input label="New password" type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} placeholder="New password" />
                <Input label="Confirm password" type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Confirm password" />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1">Save</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                </div>
              </form>
            )}
            <p className="text-xs text-gray-600">Set a password to lock editing. Without logging in, visitors can only view data.</p>
          </div>
        </Card>

        {/* GitHub Sync */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <GitFork size={18} className="text-white" />
            <h3 className="text-lg font-semibold text-white">GitHub Gist Sync</h3>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Sync your data to a public GitHub Gist so viewers can see your logs.</p>
            {syncInfo && (
              <div className={`text-xs px-3 py-2 rounded-lg ${syncInfo.connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {syncInfo.message}
              </div>
            )}
            <Input label="GitHub Personal Access Token" type="password" value={syncConfig.token}
              onChange={e => setSyncConfig({ ...syncConfig, token: e.target.value })}
              placeholder="ghp_..." />
            <div className="flex gap-2">
              <Input label="Gist ID" value={syncConfig.gistId}
                onChange={e => setSyncConfig({ ...syncConfig, gistId: e.target.value })}
                placeholder="abc123def456" className="flex-1" />
              <div className="pt-6">
                <Button size="sm" onClick={handleCreateGist} disabled={syncing} title="Create new gist">
                  <Cloud size={14} />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSyncSave} variant="glass" className="flex-1 justify-center">Save Config</Button>
              <Button size="sm" onClick={handlePush} disabled={syncing || !isSyncConfigured()} variant="glass" className="flex-1 justify-center">
                <Upload size={13} /> {syncing ? 'Pushing...' : 'Push'}
              </Button>
              <Button size="sm" onClick={handlePull} disabled={syncing || !isSyncConfigured()} variant="glass" className="flex-1 justify-center">
                <Download size={13} /> {syncing ? 'Pulling...' : 'Pull'}
              </Button>
            </div>
            <details className="text-xs text-gray-600">
              <summary className="cursor-pointer hover:text-gray-400">How to get a GitHub token</summary>
              <ol className="mt-2 space-y-1 list-decimal list-inside text-gray-500">
                <li>Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
                <li>Generate a new token with the <strong>gist</strong> scope</li>
                <li>Copy the token and paste it above</li>
                <li>Click the <strong>cloud icon</strong> to create a new gist, or enter an existing Gist ID</li>
              </ol>
            </details>
          </div>
        </Card>

        {/* Image Hosting */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Image size={18} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Image Hosting</h3>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Upload images to your GitHub repo via drag & drop. Token needs <strong>repo</strong> scope (or <strong>public_repo</strong> for public repos).</p>
            <Input label="GitHub Token (repo scope)" type="password" value={imgConfig.token}
              onChange={e => setImgConfig({ ...imgConfig, token: e.target.value })}
              placeholder="ghp_..." />
            <Input label="Repository owner" value={imgConfig.owner}
              onChange={e => setImgConfig({ ...imgConfig, owner: e.target.value })}
              placeholder="your-username" />
            <Input label="Repository name" value={imgConfig.repo}
              onChange={e => setImgConfig({ ...imgConfig, repo: e.target.value })}
              placeholder="your-repo" />
            <Input label="Folder path" value={imgConfig.path}
              onChange={e => setImgConfig({ ...imgConfig, path: e.target.value })}
              placeholder="assets/images" />
            <Input label="Branch" value={imgConfig.branch}
              onChange={e => setImgConfig({ ...imgConfig, branch: e.target.value })}
              placeholder="main" />
            <Button onClick={handleImgSave} size="sm" variant="glass" className="w-full justify-center">Save Image Config</Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Database size={18} className="text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Data Management</h3>
          </div>
          <div className="space-y-3">
            <Button onClick={handleExport} icon={Download} variant="glass" className="w-full justify-start">Export Data (JSON)</Button>
            {isOwner && <Button onClick={() => setShowImport(!showImport)} icon={Upload} variant="glass" className="w-full justify-start">Import Data</Button>}
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
            {isOwner && <Button onClick={handleAddSampleData} variant="secondary" className="w-full justify-start">Add Sample Data</Button>}
            {isOwner && <Button onClick={handleClearAll} variant="danger" icon={Trash2} className="w-full justify-start">Clear All Data</Button>}
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
          <p className="text-xs text-gray-600 mt-4">Data syncs to GitHub Gist when configured.</p>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Database size={18} className="text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">About ProjectHub</h3>
          </div>
          <div className="text-sm text-gray-400 space-y-2">
            <p><strong className="text-white">Version:</strong> 2.0.0 — Ultimate Edition</p>
            <p><strong className="text-white">Tech Stack:</strong> React 19 + Vite + Tailwind CSS + Framer Motion + Recharts</p>
            <p><strong className="text-white">Auth:</strong> Password-protected editing with public read-only viewer mode. Data synced via GitHub Gist.</p>
            <p><strong className="text-white">Deployment:</strong> Automatically deployed to GitHub Pages on every push</p>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
