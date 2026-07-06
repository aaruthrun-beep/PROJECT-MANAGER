const colors = {
  indigo: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  purple: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  sky: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  pink: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  gray: 'bg-gray-500/20 text-zinc-300 border-gray-500/30',
}

export default function Badge({ children, color = 'indigo', className = '', onClick, dot }) {
  return (
    <span onClick={onClick} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[color]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-${color}-400`} />}
      {children}
    </span>
  )
}
