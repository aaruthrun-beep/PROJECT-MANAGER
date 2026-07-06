import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm text-zinc-400 block">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />}
        <input ref={ref} {...props} className={`w-full bg-zinc-800/80 border border-zinc-700 rounded-lg py-2 px-3.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-600/60 focus:ring-1 focus:ring-amber-600/20 transition-all ${Icon ? 'pl-9' : ''} ${error ? 'border-red-500/60' : ''} ${className}`} />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'
export default Input
