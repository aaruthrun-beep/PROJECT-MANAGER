const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const orbs = [
  { size: 200, blur: 100, color: 'rgba(99, 102, 241, 0.06)', offsetX: 0.3, offsetY: 0.2 },
  { size: 150, blur: 80, color: 'rgba(168, 85, 247, 0.04)', offsetX: 0.7, offsetY: 0.6 },
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
