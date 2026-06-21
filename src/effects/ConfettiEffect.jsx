import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444']

export default function ConfettiEffect({ trigger = false }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!trigger) return
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.5 + 0.5,
      shape: Math.random() > 0.5 ? 'square' : 'circle',
    }))
    setPieces(newPieces)
    setTimeout(() => setPieces([]), 3000)
  }, [trigger])

  return (
    <AnimatePresence>
      {pieces.map((p) => (
        <motion.div key={p.id}
          initial={{ y: -20, x: p.x, opacity: 1, rotate: 0 }}
          animate={{ y: window.innerHeight + 100, rotate: p.rotation, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 + Math.random() * 1.5, ease: 'easeIn' }}
          className="fixed top-0 pointer-events-none z-[9998]"
          style={{
            left: p.x,
            width: p.shape === 'square' ? 10 : 8,
            height: p.shape === 'square' ? 10 : 8,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            scale: p.scale,
          }}
        />
      ))}
    </AnimatePresence>
  )
}
