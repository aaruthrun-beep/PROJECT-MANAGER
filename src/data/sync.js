import toast from 'react-hot-toast'

const GIST_API = 'https://api.github.com/gists'

function getConfig() {
  try {
    const raw = localStorage.getItem('project_hub_sync')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { token: '', gistId: '' }
}

function saveConfig(config) {
  localStorage.setItem('project_hub_sync', JSON.stringify(config))
}

export function getSyncConfig() {
  return getConfig()
}

export function saveSyncConfig({ token, gistId }) {
  saveConfig({ token, gistId })
}

export function isSyncConfigured() {
  const c = getConfig()
  return !!(c.token && c.gistId)
}

export async function pullFromGist() {
  const { token, gistId } = getConfig()
  if (!token || !gistId) throw new Error('Sync not configured')

  const res = await fetch(`${GIST_API}/${gistId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Gist not found. Check the Gist ID.')
    if (res.status === 403) throw new Error('GitHub rate limit or bad token.')
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const gist = await res.json()
  const file = gist.files?.['project-hub-data.json']
  if (!file) throw new Error('Gist has no project-hub-data.json file.')

  const contentRes = await fetch(file.raw_url)
  const data = await contentRes.json()
  return data
}

export async function pushToGist(data) {
  const { token, gistId } = getConfig()
  if (!token || !gistId) throw new Error('Sync not configured')

  const body = {
    files: {
      'project-hub-data.json': {
        content: JSON.stringify(data, null, 2),
      },
    },
  }

  const res = await fetch(`${GIST_API}/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Gist not found.')
    if (res.status === 403) throw new Error('GitHub rate limit or bad token (needs gist scope).')
    throw new Error(`GitHub API error: ${res.status}`)
  }

  return await res.json()
}

export async function createGist(token, data) {
  const body = {
    description: 'ProjectHub sync data',
    public: true,
    files: {
      'project-hub-data.json': {
        content: JSON.stringify(data, null, 2),
      },
    },
  }

  const res = await fetch(GIST_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    if (res.status === 403) throw new Error('GitHub rate limit or bad token (needs gist scope).')
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const gist = await res.json()
  return { gistId: gist.id, gistUrl: gist.html_url }
}

export async function syncStatus() {
  const { token, gistId } = getConfig()
  if (!token || !gistId) return { connected: false, message: 'Not configured' }

  try {
    const res = await fetch(`${GIST_API}/${gistId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    })
    if (res.ok) {
      const gist = await res.json()
      return { connected: true, message: `Connected — updated ${new Date(gist.updated_at).toLocaleDateString()}` }
    }
    return { connected: false, message: `Error ${res.status}` }
  } catch {
    return { connected: false, message: 'Connection failed' }
  }
}
