import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AUTH_KEY = 'project_hub_auth'
const DEFAULT_PASS = 'admin'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) {
      try {
        const session = JSON.parse(raw)
        if (session.expires > Date.now()) {
          setUser({ username: session.username })
        } else {
          localStorage.removeItem(AUTH_KEY)
        }
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((password) => {
    const entered = btoa(password)
    const stored = localStorage.getItem('project_hub_pass')
    let matched

    if (stored && stored === entered) {
      matched = stored
    } else {
      try {
        const raw = localStorage.getItem('project_hub_data')
        if (raw) {
          const data = JSON.parse(raw)
          if (data.settings?.passwordHash === entered) {
            matched = data.settings.passwordHash
            localStorage.setItem('project_hub_pass', matched)
          }
        }
      } catch {}
    }

    if (!matched && !stored && btoa(DEFAULT_PASS) === entered) {
      matched = entered
      localStorage.setItem('project_hub_pass', matched)
    }

    if (matched) {
      const session = { username: 'owner', expires: Date.now() + 7 * 24 * 60 * 60 * 1000 }
      localStorage.setItem(AUTH_KEY, JSON.stringify(session))
      setUser({ username: 'owner' })
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
  }, [])

  const setPassword = useCallback((password) => {
    localStorage.setItem('project_hub_pass', btoa(password))
  }, [])

  const hasPassword = useCallback(() => {
    return !!localStorage.getItem('project_hub_pass')
  }, [])

  const isOwner = !!user

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setPassword, hasPassword, isOwner }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
