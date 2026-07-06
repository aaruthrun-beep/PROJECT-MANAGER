import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderKanban, CalendarPlus, X, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const actions = [
  { icon: FolderKanban, label: 'New Project', path: '/projects?new=true', color: 'bg-amber-600' },
  { icon: CalendarPlus, label: 'New Log', path: '/daily-log?new=true', color: 'bg-emerald-500' },
]

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { isOwner } = useAuth()

  if (!isOwner) return null

  return (
    <div className="fixed bottom-5 right-5 z-40 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <>
            {actions.map((action, i) => (
              <motion.button key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                onClick={() => { navigate(action.path); setOpen(false) }}
                className={`absolute bottom-0 right-0 flex items-center gap-2 ${action.color} text-white px-4 py-3 rounded-2xl shadow-xl active:scale-95 transition-all whitespace-nowrap`}
                style={{ marginBottom: (i + 1) * 58 }}>
                <action.icon size={18} />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.9 }}
        className="relative w-13 h-13 md:w-14 md:h-14 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-2xl shadow-xl shadow-amber-600/40 flex items-center justify-center active:scale-90 transition-all">
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300 }}>
          {open ? <X size={22} /> : <Plus size={22} />}
        </motion.div>
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles size={8} className="text-amber-900" />
        </div>
      </motion.button>
    </div>
  )
}
