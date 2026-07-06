import { forwardRef } from 'react'

const Select = forwardRef(({ label, options = [], className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm text-zinc-400 block">{label}</label>}
      <select ref={ref} {...props} className={`w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/20 transition-all ${className}`}>
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>
        ))}
      </select>
    </div>
  )
})
Select.displayName = 'Select'
export default Select
