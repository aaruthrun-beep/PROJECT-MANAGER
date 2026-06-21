import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderKanban, CalendarPlus, X, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const actions = [
  { icon: FolderKanban, label: 'New Project', path: '/projects?new=true', color: 'bg-indigo-500' },
  { icon: CalendarPlus, label: 'New Log', path: '/daily-log?new=true', color: 'bg-emerald-500' },
]

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-6 right-6 z-40">
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
                className={`absolute bottom-0 right-0 flex items-center gap-2 ${action.color} text-white px-4 py-3 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap`}
                style={{ marginBottom: (i + 1) * 60 }}>
                <action.icon size={18} />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl shadow-indigo-500/40 flex items-center justify-center hover:shadow-2xl hover:shadow-indigo-500/50 transition-all">
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300 }}>
          {open ? <X size={24} /> : <Plus size={24} />}
        </motion.div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles size={10} className="text-amber-900" />
        </div>
      </motion.button>
    </div>
  )
}
