const GIST_API = 'https://api.github.com/gists'

let _clerkUser = null

export function setClerkUser(user) {
  _clerkUser = user
}
export function getClerkUser() {
  return _clerkUser
}

function getCfg() {
  try {
    const raw = localStorage.getItem('project_hub_sync')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { token: '', gistId: '', rawUrl: '' }
}

function saveCfg(cfg) {
  localStorage.setItem('project_hub_sync', JSON.stringify(cfg))
}

export function getSyncConfig() {
  return getCfg()
}

/** Write sync config locally + to Clerk metadata (if user available). */
export function saveSyncConfig({ token, gistId, rawUrl, user }) {
  const cfg = { token, gistId }
  if (rawUrl) cfg.rawUrl = rawUrl
  saveCfg(cfg)
  const u = user || _clerkUser
  if (u && gistId) {
    const meta = { projectHubToken: token, projectHubGistId: gistId }
    if (rawUrl) meta.projectHubRawUrl = rawUrl
    u.update({ unsafeMetadata: { ...u.unsafeMetadata, ...meta } }).catch(() => {})
  }
}

/** Read sync config from Clerk metadata and save locally. */
export async function restoreGistIdFromClerk(user) {
  if (!user) return null
  try {
    await user.reload()
    const token = user.unsafeMetadata?.projectHubToken || ''
    const gistId = user.unsafeMetadata?.projectHubGistId || ''
    const rawUrl = user.unsafeMetadata?.projectHubRawUrl || ''
    if (gistId) {
      saveCfg({ token, gistId, rawUrl })
      return gistId
    }
  } catch {
    const token = user?.unsafeMetadata?.projectHubToken || ''
    const gistId = user?.unsafeMetadata?.projectHubGistId || ''
    const rawUrl = user?.unsafeMetadata?.projectHubRawUrl || ''
    if (gistId) { saveCfg({ token, gistId, rawUrl }); return gistId }
  }
  return null
}

/** Completely clear sync config — local + Clerk (stops all sync). */
export function clearSync(user) {
  localStorage.removeItem('project_hub_sync')
  const u = user || _clerkUser
  if (u) {
    u.update({ unsafeMetadata: { projectHubToken: '', projectHubGistId: '', projectHubRawUrl: '' } }).catch(() => {})
  }
}

export function isSyncConfigured() {
  return !!getCfg().gistId
}
export function isGistWriteable() {
  const c = getCfg()
  return !!(c.token && c.gistId)
}

/** Pull data from Gist — tries rawUrl first, then Gist API. Silent on network failures. */
export async function pullFromGist() {
  const { rawUrl, token, gistId } = getCfg()
  if (!gistId) throw new Error('No Gist ID configured')

  if (rawUrl) {
    try {
      const res = await fetch(`${rawUrl}?_=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) return await res.json()
    } catch {}
  }

  const opts = {}
  if (token) opts.headers = { Authorization: `Bearer ${token}` }

  const res = await fetch(`${GIST_API}/${gistId}?_=${Date.now()}`, opts)
  if (!res.ok) {
    if (res.status === 404) throw new Error('Gist not found')
    if (res.status === 403) throw new Error('GitHub rate limit or bad token')
    throw new Error(`GitHub error ${res.status}`)
  }

  const gist = await res.json()
  const file = gist.files?.['project-hub-data.json']
  if (!file) throw new Error('No project-hub-data.json in Gist')

  if (file.raw_url) saveCfg({ ...getCfg(), rawUrl: file.raw_url })

  if (file.content && !file.truncated) {
    try { return JSON.parse(file.content) } catch {}
  }

  const body = await fetch(file.raw_url)
  if (!body.ok) throw new Error(`Raw fetch error ${body.status}`)
  return await body.json()
}

/** Push data to Gist. On 409 → auto-clear sync. Returns { rawUrl }. */
export async function pushToGist(data) {
  const cfg = getCfg()
  const { token, gistId } = cfg
  if (!token || !gistId) throw new Error('Sync not configured')

  const res = await fetch(`${GIST_API}/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({ files: { 'project-hub-data.json': { content: JSON.stringify(data, null, 2) } } }),
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Gist not found')
    if (res.status === 403) throw new Error('GitHub rate limit or bad token')
    if (res.status === 409) {
      clearSync()
      throw new Error('Gist conflict — sync disabled')
    }
    throw new Error(`GitHub error ${res.status}`)
  }

  let rawUrl = ''
  try {
    const gist = await res.clone().json()
    rawUrl = gist.files?.['project-hub-data.json']?.raw_url || ''
    if (rawUrl) saveCfg({ ...cfg, rawUrl })
  } catch {}
  return { rawUrl }
}

/** Create a new public Gist. Returns { gistId, gistUrl, rawUrl }. */
export async function createGist(token, data) {
  const res = await fetch(GIST_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      description: 'ProjectHub sync data',
      public: true,
      files: { 'project-hub-data.json': { content: JSON.stringify(data, null, 2) } },
    }),
  })

  if (!res.ok) {
    if (res.status === 403) throw new Error('GitHub rate limit or bad token (needs gist scope)')
    throw new Error(`GitHub error ${res.status}`)
  }

  const gist = await res.json()
  return { gistId: gist.id, gistUrl: gist.html_url, rawUrl: gist.files?.['project-hub-data.json']?.raw_url || '' }
}

/** Check Gist connection status. */
export async function syncStatus() {
  const { token, gistId } = getCfg()
  if (!token || !gistId) return { connected: false, message: 'Not configured' }
  try {
    const res = await fetch(`${GIST_API}/${gistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const gist = await res.json()
      return { connected: true, message: `Connected — ${new Date(gist.updated_at).toLocaleDateString()}` }
    }
    return { connected: false, message: `Error ${res.status}` }
  } catch {
    return { connected: false, message: 'Connection failed' }
  }
}

/** Upload image to both ImgBB (for web display) AND Telegram channel. */
export async function uploadImageToCdn(file) {
  const apiKey = import.meta.env.PUBLIC_IMGBB_API_KEY
  if (!apiKey) throw new Error('No image upload configured')

  // Step 1: Upload to ImgBB (for thumbnails in the app)
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

  const fd = new FormData()
  fd.append('image', base64)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: 'POST', body: fd })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error?.message || `ImgBB upload failed ${res.status}`)
  }

  const result = await res.json()
  const url = result.data.display_url || result.data.image?.url || result.data.url

  // Step 2: Non-blocking Telegram upload (fire-and-forget — no error toast)
  const tgToken = import.meta.env.PUBLIC_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.PUBLIC_TELEGRAM_CHANNEL_ID
  if (tgToken && chatId) {
    uploadToTelegram(file, url, tgToken, chatId).catch(() => {})
  }

  return url
}

async function sendPhotoBlob(blob, fileName, tgToken, chatId) {
  const fd = new FormData()
  fd.append('chat_id', chatId)
  fd.append('photo', blob, fileName)

  const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
    method: 'POST',
    body: fd,
  })

  const text = await res.text().catch(() => '')
  if (!res.ok) {
    throw new Error(`Telegram ${res.status}: ${text.slice(0, 200)}`)
  }
  console.log('Telegram: upload OK —', text.slice(0, 100))
}

async function uploadToTelegram(file, imgbbUrl, tgToken, chatId) {
  // Method 1: Fresh copy via arrayBuffer + new Blob (avoids FileReader stream issues)
  try {
    console.log('Telegram: trying arrayBuffer method...')
    const buffer = await file.arrayBuffer()
    const blob = new Blob([buffer], { type: file.type })
    console.log('Telegram: arrayBuffer blob size:', blob.size)
    await sendPhotoBlob(blob, file.name, tgToken, chatId)
    return
  } catch (e) {
    console.warn('Telegram: arrayBuffer method failed:', e)
  }

  // Method 2: Download from ImgBB CDN (has CORS headers) and re-upload
  try {
    console.log('Telegram: trying download-from-ImgBB method...')
    const r = await fetch(imgbbUrl)
    if (!r.ok) throw new Error(`ImgBB download failed: ${r.status}`)
    const blob = await r.blob()
    console.log('Telegram: ImgBB download blob size:', blob.size)
    await sendPhotoBlob(blob, file.name, tgToken, chatId)
  } catch (e) {
    console.error('Telegram: all upload methods failed:', e)
  }
}
