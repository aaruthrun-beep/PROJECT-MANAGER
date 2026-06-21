import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm text-gray-400 block">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />}
        <input ref={ref} {...props} className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500/50' : ''} ${className}`} />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'
export default Input
