import { useState, useRef, useEffect } from 'react'
import { Lock, Unlock, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function LockBadge() {
  const { isOwner, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className={`p-2 rounded-xl transition-all ${isOwner ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'}`}
        title={isOwner ? 'Admin mode' : 'Viewer mode'}>
        {isOwner ? <Unlock size={16} /> : <Lock size={16} />}
      </button>
      <AnimatePresence>
        {open && isOwner && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 bg-black/70 backdrop-blur-2xl rounded-xl shadow-2xl w-44 overflow-hidden border border-white/5">
            <div className="px-3 py-2 border-b border-white/5">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-sm text-white font-medium">Owner</p>
            </div>
            <button onClick={() => { logout(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={14} /> Lock & Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
