import { createContext, useContext } from 'react'
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { isSignedIn, user, isLoaded } = useUser()
  const { signOut } = useClerkAuth()
  const clerk = useClerk()

  const value = {
    user: isSignedIn ? user : null,
    loading: !isLoaded,
    login: () => clerk.openSignIn(),
    logout: () => signOut().then(() => window.location.reload()),
    isOwner: !!isSignedIn,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
