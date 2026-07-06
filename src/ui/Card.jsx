import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, onClick, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -1 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className={`card-base p-5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}>
      {children}
    </motion.div>
  )
}
