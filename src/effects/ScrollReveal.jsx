import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function ScrollReveal({ children, className = '', direction = 'up', delay = 0, duration = 0.4 }) {
  const { ref, visible } = useScrollReveal(0.05)

  const variants = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: -30 },
    right: { x: 30 },
    scale: { scale: 0.9 },
    fade: { opacity: 0 },
  }

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, ...variants[direction] }}
      animate={visible ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}>
      {children}
    </motion.div>
  )
}
