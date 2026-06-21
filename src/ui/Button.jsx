import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import RippleEffect from '../effects/RippleEffect'

const variants = {
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10',
  ghost: 'hover:bg-white/10 text-gray-400 hover:text-white',
  danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white',
  success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white',
  glass: 'glass text-white hover:bg-white/[0.12]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
}

const Button = forwardRef(({ variant = 'primary', size = 'md', className = '', children, icon: Icon, magnetic = false, ...props }, ref) => {
  const Btn = (
    <motion.button ref={ref} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />}
      {children}
    </motion.button>
  )

  if (variant === 'primary' || variant === 'danger' || variant === 'success') {
    return <RippleEffect className="inline-block rounded-xl">{Btn}</RippleEffect>
  }
  return Btn
})
Button.displayName = 'Button'
export default Button
