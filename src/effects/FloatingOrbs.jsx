const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const orbs = [
  { size: 300, blur: 120, color: 'rgba(245, 158, 11, 0.03)', offsetX: 0.2, offsetY: 0.3 },
  { size: 250, blur: 100, color: 'rgba(217, 119, 6, 0.02)', offsetX: 0.8, offsetY: 0.7 },
]

export default function FloatingOrbs() {
  if (isTouch) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {orbs.map((o, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: o.size, height: o.size,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter: `blur(${o.blur}px)`,
            left: `${o.offsetX * 100}%`, top: `${o.offsetY * 100}%`,
            transform: 'translate(-50%, -50%)',
          }} />
      ))}
    </div>
  )
}
