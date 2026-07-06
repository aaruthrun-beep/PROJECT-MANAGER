import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RippleEffect({ children, className = '', ...props }) {
  const [ripples, setRipples] = useState([])

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(prev => [...prev, { id, x, y, size: Math.max(rect.width, rect.height) }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800)
  }, [])

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={handleClick} {...props}>
      {children}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.span key={r.id}
            initial={{ width: 0, height: 0, opacity: 0.4, x: r.x, y: r.y }}
            animate={{ width: r.size * 2, height: r.size * 2, opacity: 0, x: r.x - r.size, y: r.y - r.size }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute rounded-full bg-white/20 pointer-events-none"
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
