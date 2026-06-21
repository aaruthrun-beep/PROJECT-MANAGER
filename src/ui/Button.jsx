import { forwardRef } from 'react'

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10',
  ghost: 'hover:bg-white/10 text-gray-400 hover:text-white',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  glass: 'glass text-white hover:bg-white/[0.12]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
}

const Button = forwardRef(({ variant = 'primary', size = 'md', className = '', children, icon: Icon, ...props }, ref) => {
  return (
    <button ref={ref} className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />}
      {children}
    </button>
  )
})
Button.displayName = 'Button'
export default Button
