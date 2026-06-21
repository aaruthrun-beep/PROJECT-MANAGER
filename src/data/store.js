const STORAGE_KEY = 'project_dashboard_data'

const defaultData = {
  projects: [],
  logEntries: [],
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
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

export function getProject(id) {
  const data = loadData()
  return data.projects.find(p => p.id === id)
}

export function addProject(project) {
  const data = loadData()
  const newProject = { id: generateId(), createdAt: new Date().toISOString(), ...project }
  data.projects.push(newProject)
  saveData(data)
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
  data.projects = data.projects.filter(p => p.id !== id)
  data.logEntries = data.logEntries.filter(e => e.projectId !== id)
  saveData(data)
}

export function addLogEntry(entry) {
  const data = loadData()
  const newEntry = { id: generateId(), createdAt: new Date().toISOString(), ...entry }
  data.logEntries.push(newEntry)
  saveData(data)
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
}

export function getLogEntries(projectId) {
  const data = loadData()
  let entries = data.logEntries
  if (projectId) {
    entries = entries.filter(e => e.projectId === projectId)
  }
  return entries.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
}
