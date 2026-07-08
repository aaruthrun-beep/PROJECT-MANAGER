const GIST_API = 'https://api.github.com/gists'

function getGistConfig() {
  try {
    const raw = localStorage.getItem('project_hub_sync')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { token: '', gistId: '' }
}

function saveGistConfig(config) {
  localStorage.setItem('project_hub_sync', JSON.stringify(config))
}

export function getSyncConfig() {
  return getGistConfig()
}

export function saveSyncConfig({ token, gistId, user }) {
  saveGistConfig({ token, gistId })
  if (user && gistId) {
    user.update({ unsafeMetadata: { ...user.unsafeMetadata, projectHubToken: token, projectHubGistId: gistId } }).then(() => {
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
    if (gistId) {
      saveGistConfig({ token, gistId })
      return gistId
    }
  } catch (e) {
    console.warn('Failed to reload user metadata:', e)
    const token = user?.unsafeMetadata?.projectHubToken || user?.publicMetadata?.projectHubToken || ''
    const gistId = user?.unsafeMetadata?.projectHubGistId || user?.publicMetadata?.gistId || ''
    if (gistId) {
      saveGistConfig({ token, gistId })
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
  const { gistId } = getGistConfig()
  if (!gistId) throw new Error('Sync not configured - no Gist ID')

  const res = await fetch(`${GIST_API}/${gistId}`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
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
  return await contentRes.json()
}

export async function pushToGist(data) {
  const { token, gistId } = getGistConfig()
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
  return { gistId: gist.id, gistUrl: gist.html_url }
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
  const tgToken = import.meta.env.PUBLIC_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.PUBLIC_TELEGRAM_CHANNEL_ID

  if (tgToken && chatId) {
    const formData = new FormData()
    formData.append('chat_id', chatId)
    formData.append('photo', file)

    const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      const result = await res.json()
      const fileId = result.result.photo.pop().file_id
      const fileRes = await fetch(`https://api.telegram.org/bot${tgToken}/getFile?file_id=${fileId}`)
      if (fileRes.ok) {
        const fileData = await fileRes.json()
        return `https://api.telegram.org/file/bot${tgToken}/${fileData.result.file_path}`
      }
    }
  }

  const apiKey = import.meta.env.PUBLIC_IMGBB_API_KEY
  if (!apiKey) throw new Error('No image upload configured. Set PUBLIC_TELEGRAM_BOT_TOKEN + PUBLIC_TELEGRAM_CHANNEL_ID or PUBLIC_IMGBB_API_KEY in .env')

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
  return result.data.url
}
