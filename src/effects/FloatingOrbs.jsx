import { useMousePosition } from '../hooks/useMousePosition'

const orbs = [
  { size: 300, blur: 120, color: 'rgba(99, 102, 241, 0.08)', speedX: 0.003, speedY: 0.002, offsetX: 0.2, offsetY: 0.3 },
  { size: 200, blur: 100, color: 'rgba(168, 85, 247, 0.06)', speedX: -0.004, speedY: 0.003, offsetX: 0.8, offsetY: 0.6 },
  { size: 250, blur: 150, color: 'rgba(236, 72, 153, 0.05)', speedX: 0.002, speedY: -0.003, offsetX: 0.5, offsetY: 0.2 },
]

export default function FloatingOrbs() {
  const mouse = useMousePosition()

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {orbs.map((o, i) => {
        const x = mouse.x * o.speedX * 30 + window.innerWidth * o.offsetX
        const y = mouse.y * o.speedY * 30 + window.innerHeight * o.offsetY
        return (
          <div key={i}
            className="absolute rounded-full transition-all duration-700 ease-out"
            style={{
              width: o.size,
              height: o.size,
              background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
              filter: `blur(${o.blur}px)`,
              left: x - o.size / 2,
              top: y - o.size / 2,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </div>
  )
}
