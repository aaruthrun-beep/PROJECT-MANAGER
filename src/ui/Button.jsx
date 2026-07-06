import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-sm',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700',
  ghost: 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200',
  danger: 'bg-red-600 hover:bg-red-500 text-white font-medium',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white font-medium',
  outline: 'border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-2.5 text-base rounded-lg',
  xl: 'px-8 py-3 text-lg rounded-xl',
}

const Button = forwardRef(({ variant = 'primary', size = 'md', className = '', children, icon: Icon, ...props }, ref) => {
  return (
    <motion.button ref={ref} whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />}
      {children}
    </motion.button>
  )
})
Button.displayName = 'Button'
export default Button
