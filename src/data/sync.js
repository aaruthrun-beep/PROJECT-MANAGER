const GIST_API = 'https://api.github.com/gists'

let _clerkUser = null

export function setClerkUser(user) {
  _clerkUser = user
}

export function getClerkUser() {
  return _clerkUser
}

function getGistConfig() {
  try {
    const raw = localStorage.getItem('project_hub_sync')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { token: '', gistId: '', rawUrl: '' }
}

function saveGistConfig(config) {
  localStorage.setItem('project_hub_sync', JSON.stringify(config))
}

export function getSyncConfig() {
  return getGistConfig()
}

export function saveSyncConfig({ token, gistId, rawUrl, user }) {
  const cfg = { token, gistId }
  if (rawUrl) cfg.rawUrl = rawUrl
  saveGistConfig(cfg)
  if (user && gistId) {
    const meta = { projectHubToken: token, projectHubGistId: gistId }
    if (rawUrl) meta.projectHubRawUrl = rawUrl
    user.update({ unsafeMetadata: { ...user.unsafeMetadata, ...meta } }).then(() => {
      console.log('Sync config saved to Clerk profile')
    }).catch(e => {
      console.warn('Failed to save sync config to Clerk:', e)
    })
  }
}

export async function restoreGistIdFromClerk(user) {
  if (!user) return null
  try {
    await user.reload()
    const token = user.unsafeMetadata?.projectHubToken || user.publicMetadata?.projectHubToken || ''
    const gistId = user.unsafeMetadata?.projectHubGistId || user.publicMetadata?.gistId || ''
    const rawUrl = user.unsafeMetadata?.projectHubRawUrl || ''
    if (gistId) {
      saveGistConfig({ token, gistId, rawUrl })
      return gistId
    }
  } catch (e) {
    console.warn('Failed to reload user metadata:', e)
    const token = user?.unsafeMetadata?.projectHubToken || user?.publicMetadata?.projectHubToken || ''
    const gistId = user?.unsafeMetadata?.projectHubGistId || user?.publicMetadata?.gistId || ''
    const rawUrl = user?.unsafeMetadata?.projectHubRawUrl || ''
    if (gistId) {
      saveGistConfig({ token, gistId, rawUrl })
      return gistId
    }
  }
  return null
}

export function isSyncConfigured() {
  const c = getGistConfig()
  return !!c.gistId
}

export function isGistWriteable() {
  const c = getGistConfig()
  return !!(c.token && c.gistId)
}

export async function pullFromGist() {
  const { rawUrl, token, gistId } = getGistConfig()
  if (!gistId) throw new Error('Sync not configured - no Gist ID')

  // Try the raw URL first (avoids api.github.com entirely which may be blocked)
  if (rawUrl) {
    try {
      const res = await fetch(`${rawUrl}?_=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) return await res.json()
    } catch {}
  }

  // Fallback: use the Gist API (no custom headers to avoid CORS preflight on mobile)
  const fetchOpts = {}
  if (token) fetchOpts.headers = { Authorization: `Bearer ${token}` }

  const res = await fetch(`${GIST_API}/${gistId}?_=${Date.now()}`, fetchOpts)

  if (!res.ok) {
    if (res.status === 404) throw new Error('Gist not found. Check the Gist ID.')
    if (res.status === 403) throw new Error('GitHub rate limit or bad token.')
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const gist = await res.json()
  const file = gist.files?.['project-hub-data.json']
  if (!file) throw new Error('Gist has no project-hub-data.json file.')

  // Save the raw URL for future direct fetches
  if (file.raw_url) {
    saveGistConfig({ ...getGistConfig(), rawUrl: file.raw_url })
  }

  if (file.content && !file.truncated) {
    try { return JSON.parse(file.content) } catch {}
  }

  const contentRes = await fetch(file.raw_url)
  if (!contentRes.ok) throw new Error(`Failed to fetch raw content: ${contentRes.status}`)
  return await contentRes.json()
}

export async function pushToGist(data) {
  const cfg = getGistConfig()
  const { token, gistId } = cfg
  if (!token || !gistId) throw new Error('Sync not configured')

  const body = {
    files: {
      'project-hub-data.json': { content: JSON.stringify(data, null, 2) },
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

  // Save the raw URL from the response for future direct reads
  let rawUrl = ''
  try {
    const gist = await res.clone().json()
    rawUrl = gist.files?.['project-hub-data.json']?.raw_url || ''
    if (rawUrl) saveGistConfig({ ...cfg, rawUrl })
  } catch {}
  return { rawUrl }
}

export async function createGist(token, data) {
  const body = {
    description: 'ProjectHub sync data',
    public: true,
    files: {
      'project-hub-data.json': { content: JSON.stringify(data, null, 2) },
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
  const rawUrl = gist.files?.['project-hub-data.json']?.raw_url || ''
  return { gistId: gist.id, gistUrl: gist.html_url, rawUrl }
}

export async function syncStatus() {
  const { token, gistId } = getGistConfig()
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

export async function uploadImageToCdn(file) {
  const apiKey = import.meta.env.PUBLIC_IMGBB_API_KEY
  if (!apiKey) throw new Error('No image upload configured. Set PUBLIC_IMGBB_API_KEY in .env')

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

  const formData = new FormData()
  formData.append('image', base64)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error?.message || `Upload failed: ${res.status}`)
  }

  const result = await res.json()
  const url = result.data.display_url || result.data.image?.url || result.data.url

  const tgToken = import.meta.env.PUBLIC_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.PUBLIC_TELEGRAM_CHANNEL_ID
  if (tgToken && chatId) {
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto?chat_id=${chatId}&photo=${encodeURIComponent(url)}`)
      if (!tgRes.ok) {
        const err = await tgRes.text().catch(() => '')
        console.warn('Telegram sendPhoto (url) failed:', tgRes.status, err)
      }
    } catch (e) {
      console.warn('Telegram sendPhoto (url) error:', e)
    }
  }

  return url
}
