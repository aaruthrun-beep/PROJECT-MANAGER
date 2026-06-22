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

const IMG_CONFIG_KEY = 'project_hub_img_host'

export function getImageConfig() {
  try {
    const raw = localStorage.getItem(IMG_CONFIG_KEY)
    if (raw) {
      const c = JSON.parse(raw)
      return {
        token: (c.token || '').trim(),
        owner: (c.owner || '').trim(),
        repo: (c.repo || '').trim(),
        path: (c.path || 'assets/images').replace(/^\/+|\/+$/g, '').trim(),
        branch: (c.branch || 'main').trim(),
      }
    }
  } catch {}
  return { token: '', owner: '', repo: '', path: 'assets/images', branch: 'main' }
}

export function saveImageConfig(config) {
  localStorage.setItem(IMG_CONFIG_KEY, JSON.stringify(config))
}

export async function uploadImageToRepo(file) {
  const imgConfig = getImageConfig()
  const fallbackToken = getConfig().token
  const token = (imgConfig.token || fallbackToken).trim()
  const owner = (imgConfig.owner || '').trim()
  const repo = (imgConfig.repo || '').trim()
  const branch = (imgConfig.branch || 'main').trim()
  const safePath = (imgConfig.path || 'assets/images').replace(/^\/+|\/+$/g, '').trim()
  if (!token || !owner || !repo) throw new Error('Configure image hosting in Settings first')

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
  const filepath = `${safePath}/${filename}`

  const reader = new FileReader()
  const content = await new Promise((resolve, reject) => {
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const body = {
    message: `Upload image ${filename}`,
    content,
    branch,
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filepath}`
  console.log('[ImageUpload] owner=%s repo=%s path=%s branch=%s token_prefix=%s',
    owner, repo, safePath, branch, token.slice(0, 6))

  let res
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    }
    res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) })
  } catch (err) {
    console.error('[ImageUpload] fetch threw — network/CORS error:', err)
    throw new Error(`Network error — check internet and console (F12)`)
  }

  if (!res.ok) {
    let errMsg
    try { const e = await res.json(); errMsg = e.message } catch {}
    console.error('[ImageUpload] GitHub API error:', res.status, errMsg)
    if (res.status === 403) throw new Error(`Token needs repo scope — check token permissions`)
    if (res.status === 404) throw new Error(`Repo/owner not found — check Settings`)
    if (res.status === 422) throw new Error(`Bad request — check branch and path`)
    throw new Error(errMsg || `GitHub API error: ${res.status}`)
  }

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`
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
