import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function MagneticButton({ children, className = '', strength = 0.3, ...props }) {
  const ref = useRef(null)

  const handleMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    ref.current.style.transform = `translate(${x}px, ${y}px)`
  }, [strength])

  const handleLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0px, 0px)'
  }, [])

  return (
    <motion.div ref={ref} whileTap={{ scale: 0.95 }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      className={`inline-block transition-transform duration-200 ease-out ${className}`} {...props}>
      {children}
    </motion.div>
  )
}
