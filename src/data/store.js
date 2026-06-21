const STORAGE_KEY = 'project_hub_data'

const defaultData = {
  projects: [],
  logEntries: [],
  tags: [],
  milestones: [],
  timeEntries: [],
  comments: [],
  settings: {
    theme: 'system',
    notifications: true,
    weekStartsOn: 0,
    workingHours: { start: 9, end: 18 },
  },
  notifications: [],
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...structuredClone(defaultData), ...parsed }
    }
  } catch {}
  return structuredClone(defaultData)
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export function getToday() {
  return new Date().toISOString().split('T')[0]
}

// --- Projects ---
export function getProject(id) {
  const data = loadData()
  return data.projects.find(p => p.id === id)
}

export function addProject(project) {
  const data = loadData()
  const newProject = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    tags: [],
    priority: 'medium',
    progress: 0,
    ...project,
  }
  data.projects.push(newProject)
  saveData(data)
  addNotification(`Project "${newProject.name}" created`, 'success')
  return newProject
}

export function updateProject(id, updates) {
  const data = loadData()
  const idx = data.projects.findIndex(p => p.id === id)
  if (idx !== -1) {
    data.projects[idx] = { ...data.projects[idx], ...updates, updatedAt: new Date().toISOString() }
    saveData(data)
    return data.projects[idx]
  }
  return null
}

export function deleteProject(id) {
  const data = loadData()
  const project = data.projects.find(p => p.id === id)
  data.projects = data.projects.filter(p => p.id !== id)
  data.logEntries = data.logEntries.filter(e => e.projectId !== id)
  data.milestones = data.milestones.filter(m => m.projectId !== id)
  data.timeEntries = data.timeEntries.filter(t => t.projectId !== id)
  saveData(data)
  if (project) addNotification(`Project "${project.name}" deleted`, 'info')
}

// --- Log Entries ---
export function addLogEntry(entry) {
  const data = loadData()
  const newEntry = { id: generateId(), createdAt: new Date().toISOString(), tags: [], mood: null, ...entry }
  data.logEntries.push(newEntry)
  saveData(data)
  addNotification('Log entry saved', 'success')
  return newEntry
}

export function updateLogEntry(id, updates) {
  const data = loadData()
  const idx = data.logEntries.findIndex(e => e.id === id)
  if (idx !== -1) {
    data.logEntries[idx] = { ...data.logEntries[idx], ...updates }
    saveData(data)
    return data.logEntries[idx]
  }
  return null
}

export function deleteLogEntry(id) {
  const data = loadData()
  data.logEntries = data.logEntries.filter(e => e.id !== id)
  saveData(data)
  addNotification('Log entry deleted', 'info')
}

export function getLogEntries(projectId) {
  const data = loadData()
  let entries = data.logEntries
  if (projectId) entries = entries.filter(e => e.projectId === projectId)
  return entries.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
}

export function getLogEntriesForDate(date) {
  const data = loadData()
  return data.logEntries.filter(e => {
    const entryDate = new Date(e.date || e.createdAt).toISOString().split('T')[0]
    return entryDate === date
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// --- Tags ---
export function getTags() {
  const data = loadData()
  return data.tags
}

export function addTag(tag) {
  const data = loadData()
  const newTag = { id: generateId(), name: tag.name, color: tag.color || '#6366f1' }
  data.tags.push(newTag)
  saveData(data)
  return newTag
}

export function deleteTag(id) {
  const data = loadData()
  data.tags = data.tags.filter(t => t.id !== id)
  saveData(data)
}

// --- Milestones ---
export function addMilestone(milestone) {
  const data = loadData()
  const newMilestone = { id: generateId(), createdAt: new Date().toISOString(), completed: false, ...milestone }
  data.milestones.push(newMilestone)
  saveData(data)
  addNotification(`Milestone "${newMilestone.name}" added`, 'success')
  return newMilestone
}

export function updateMilestone(id, updates) {
  const data = loadData()
  const idx = data.milestones.findIndex(m => m.id === id)
  if (idx !== -1) {
    data.milestones[idx] = { ...data.milestones[idx], ...updates }
    saveData(data)
    return data.milestones[idx]
  }
  return null
}

export function deleteMilestone(id) {
  const data = loadData()
  data.milestones = data.milestones.filter(m => m.id !== id)
  saveData(data)
}

export function getMilestones(projectId) {
  const data = loadData()
  let milestones = data.milestones
  if (projectId) milestones = milestones.filter(m => m.projectId === projectId)
  return milestones.sort((a, b) => new Date(a.dueDate || a.createdAt) - new Date(b.dueDate || b.createdAt))
}

// --- Time Tracking ---
export function addTimeEntry(entry) {
  const data = loadData()
  const newEntry = { id: generateId(), createdAt: new Date().toISOString(), ...entry }
  data.timeEntries.push(newEntry)
  saveData(data)
  return newEntry
}

export function getTimeEntries(projectId) {
  const data = loadData()
  let entries = data.timeEntries
  if (projectId) entries = entries.filter(t => t.projectId === projectId)
  return entries.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
}

export function getTotalTimeForProject(projectId) {
  const entries = getTimeEntries(projectId)
  return entries.reduce((sum, e) => sum + (e.duration || 0), 0)
}

// --- Comments ---
export function addComment(comment) {
  const data = loadData()
  const newComment = { id: generateId(), createdAt: new Date().toISOString(), ...comment }
  data.comments.push(newComment)
  saveData(data)
  return newComment
}

export function getComments(targetId) {
  const data = loadData()
  return data.comments.filter(c => c.targetId === targetId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function deleteComment(id) {
  const data = loadData()
  data.comments = data.comments.filter(c => c.id !== id)
  saveData(data)
}

// --- Notifications ---
export function addNotification(message, type = 'info') {
  const data = loadData()
  const notif = { id: generateId(), message, type, read: false, createdAt: new Date().toISOString() }
  data.notifications.unshift(notif)
  if (data.notifications.length > 50) data.notifications = data.notifications.slice(0, 50)
  saveData(data)
  return notif
}

export function markNotificationRead(id) {
  const data = loadData()
  const notif = data.notifications.find(n => n.id === id)
  if (notif) { notif.read = true; saveData(data) }
}

export function markAllNotificationsRead() {
  const data = loadData()
  data.notifications.forEach(n => n.read = true)
  saveData(data)
}

export function clearNotifications() {
  const data = loadData()
  data.notifications = []
  saveData(data)
}

// --- Export/Import ---
export function exportData() {
  const data = loadData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `project-hub-backup-${getToday()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(jsonStr) {
  try {
    const data = JSON.parse(jsonStr)
    if (data.projects && data.logEntries) {
      saveData(data)
      addNotification('Data imported successfully', 'success')
      return true
    }
    throw new Error('Invalid data format')
  } catch {
    addNotification('Import failed: invalid format', 'error')
    return false
  }
}

// --- Search ---
export function searchAll(query) {
  const data = loadData()
  const q = query.toLowerCase()
  const results = { projects: [], entries: [], milestones: [], tags: [] }

  data.projects.forEach(p => {
    if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
      results.projects.push(p)
    }
  })

  data.logEntries.forEach(e => {
    if (e.title.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q)) {
      results.entries.push(e)
    }
  })

  data.milestones.forEach(m => {
    if (m.name.toLowerCase().includes(q)) results.milestones.push(m)
  })

  data.tags.forEach(t => {
    if (t.name.toLowerCase().includes(q)) results.tags.push(t)
  })

  return results
}

// --- Stats ---
export function getStats() {
  const data = loadData()
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const thisWeekStart = new Date(now)
  thisWeekStart.setDate(now.getDate() - now.getDay())
  const thisWeek = thisWeekStart.toISOString().split('T')[0]
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const entriesToday = data.logEntries.filter(e => (e.date || e.createdAt).startsWith(today)).length
  const entriesThisWeek = data.logEntries.filter(e => (e.date || e.createdAt) >= thisWeek).length
  const entriesThisMonth = data.logEntries.filter(e => (e.date || e.createdAt).startsWith(thisMonth)).length

  const totalTime = data.timeEntries.reduce((s, t) => s + (t.duration || 0), 0)
  const timeThisWeek = data.timeEntries.filter(t => (t.date || t.createdAt) >= thisWeek)
    .reduce((s, t) => s + (t.duration || 0), 0)

  const activeProjects = data.projects.filter(p => p.status === 'active').length
  const completedMilestones = data.milestones.filter(m => m.completed).length
  const totalMilestones = data.milestones.length

  const entriesByDay = {}
  data.logEntries.forEach(e => {
    const d = (e.date || e.createdAt).split('T')[0]
    entriesByDay[d] = (entriesByDay[d] || 0) + 1
  })

  return {
    totalProjects: data.projects.length,
    activeProjects,
    totalEntries: data.logEntries.length,
    entriesToday,
    entriesThisWeek,
    entriesThisMonth,
    totalTime,
    timeThisWeek,
    completedMilestones,
    totalMilestones,
    entriesByDay,
    totalNotifications: data.notifications.filter(n => !n.read).length,
  }
}

// --- Week data for heatmap ---
export function getYearHeatmap() {
  const data = loadData()
  const counts = {}
  data.logEntries.forEach(e => {
    const d = (e.date || e.createdAt).split('T')[0]
    counts[d] = (counts[d] || 0) + 1
  })
  return counts
}
