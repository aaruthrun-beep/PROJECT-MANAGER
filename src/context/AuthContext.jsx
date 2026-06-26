import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loadData, saveData } from '../data/store'

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
    const data = loadData()
    const expected = data.settings?.passwordHash || btoa(DEFAULT_PASS)

    if (expected === btoa(password)) {
      const session = { username: 'owner', expires: Date.now() + 7 * 24 * 60 * 60 * 1000 }
      localStorage.setItem(AUTH_KEY, JSON.stringify(session))
      data.settings = data.settings || {}
      data.settings.passwordHash = expected
      saveData(data)
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
    const data = loadData()
    data.settings = data.settings || {}
    data.settings.passwordHash = btoa(password)
    saveData(data)
  }, [])

  const hasPassword = useCallback(() => {
    const data = loadData()
    return !!(data.settings?.passwordHash)
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
