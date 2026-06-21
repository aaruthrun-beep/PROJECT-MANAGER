import { motion } from 'framer-motion'
import { useTilt3D } from '../hooks/useTilt3D'

export default function Card({ children, className = '', hover = true, glow = false, tilt = false, onClick, ...props }) {
  const tiltHook = useTilt3D(8)

  return (
    <motion.div ref={tilt ? tiltHook.ref : undefined}
      onMouseMove={tilt ? tiltHook.handleMouseMove : undefined}
      onMouseLeave={tilt ? tiltHook.handleMouseLeave : undefined}
      whileHover={!tilt && hover ? { y: -2, scale: 1.005 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`glass rounded-2xl p-5 transition-all ${hover && !tilt ? 'hover:border-indigo-500/30' : ''} ${glow ? 'animate-pulse-glow' : ''} ${tilt ? 'cursor-default will-change-transform' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={tilt ? { transformStyle: 'preserve-3d' } : {}}
      {...props}>
      {children}
    </motion.div>
  )
}
