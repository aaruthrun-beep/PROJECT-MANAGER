import { UserButton, SignInButton } from '@clerk/clerk-react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function LockBadge() {
  const { isOwner, loading } = useAuth()

  if (loading) return <div className="w-8 h-8 rounded-xl bg-white/5 skeleton-pulse" />

  if (!isOwner) {
    return (
      <SignInButton mode="modal">
        <button className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.03] transition-all" title="Sign in">
          <motion.svg initial={{ scale: 0.9 }} animate={{ scale: 1 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </motion.svg>
        </button>
      </SignInButton>
    )
  }

  return (
    <UserButton
      appearance={{
        elements: {
          rootBox: 'scale-90',
          avatarBox: 'w-8 h-8 rounded-xl border-2 border-amber-600/30',
          userButtonTrigger: 'rounded-xl hover:opacity-80 transition-opacity',
          userButtonPopoverCard: 'bg-zinc-900 border border-zinc-800 shadow-2xl',
          userButtonPopoverActionButton: 'text-zinc-300 hover:bg-white/5',
          userButtonPopoverActionButtonText: 'text-sm',
        }
      }}
      afterSignOutUrl="/"
    />
  )
}
