import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, glow = false, onClick, ...props }) {
  return (
    <motion.div whileHover={hover ? { y: -2, scale: 1.005 } : {}} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick} className={`glass rounded-2xl p-5 transition-all ${hover ? 'hover:border-indigo-500/30' : ''} ${glow ? 'animate-pulse-glow' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`} {...props}>
      {children}
    </motion.div>
  )
}
