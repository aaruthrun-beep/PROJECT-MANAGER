import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'lg', className = '' }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            ref={panelRef} onClick={e => e.stopPropagation()}
            className={`relative glass rounded-2xl shadow-2xl w-full max-h-[85vh] overflow-y-auto scrollbar-hide ${size === 'sm' ? 'max-w-md' : size === 'md' ? 'max-w-lg' : size === 'xl' ? 'max-w-3xl' : 'max-w-2xl'} ${className}`}>
            <div className="flex items-center justify-between p-6 border-b border-zinc-700/60">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-700/80">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
