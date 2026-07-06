import { SignIn } from '@clerk/clerk-react'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const { isOwner, loading } = useAuth()

  useEffect(() => {
    if (isOwner) navigate('/', { replace: true })
  }, [isOwner, navigate])

  if (loading) return null
  if (isOwner) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-600/20 flex items-center justify-center mx-auto mb-4">
            <img src="https://img.clerk.com/static/clerk-logo-symbol.svg" alt="" className="w-8 h-8 opacity-50" />
          </div>
          <h1 className="text-2xl font-bold text-white">ProjectHub</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in to manage your projects</p>
        </div>
        <div className="clerk-dark">
          <SignIn signUpUrl="/" />
        </div>
      </div>
    </div>
  )
}
