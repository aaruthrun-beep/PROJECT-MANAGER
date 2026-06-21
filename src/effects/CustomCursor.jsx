import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'
import { useMousePosition } from '../hooks/useMousePosition'

export default function CustomCursor() {
  const mouse = useMousePosition()
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  const springX = useSpring(0, { stiffness: 150, damping: 15 })
  const springY = useSpring(0, { stiffness: 150, damping: 15 })
  const dotX = useSpring(0, { stiffness: 500, damping: 30 })
  const dotY = useSpring(0, { stiffness: 500, damping: 30 })

  useEffect(() => {
    springX.set(mouse.x)
    springY.set(mouse.y)
    dotX.set(mouse.x)
    dotY.set(mouse.y)
  }, [mouse.x, mouse.y])

  useEffect(() => {
    const addHover = () => setHovered(true)
    const removeHover = () => setHovered(false)
    const addClick = () => { setClicked(true); setTimeout(() => setClicked(false), 150) }

    document.querySelectorAll('a, button, input, select, textarea, [role="button"], .card-clickable').forEach(el => {
      el.addEventListener('mouseenter', addHover)
      el.addEventListener('mouseleave', removeHover)
    })
    document.addEventListener('mousedown', addClick)
    document.addEventListener('mouseup', () => setClicked(false))

    return () => {
      document.querySelectorAll('a, button, input, select, textarea, [role="button"], .card-clickable').forEach(el => {
        el.removeEventListener('mouseenter', addHover)
        el.removeEventListener('mouseleave', removeHover)
      })
      document.removeEventListener('mousedown', addClick)
      document.removeEventListener('mouseup', () => setClicked(false))
    }
  }, [])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null

  return (
    <>
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}>
        <div className={`rounded-full border border-white transition-all duration-150 ${hovered ? 'w-12 h-12 opacity-60' : 'w-8 h-8 opacity-40'} ${clicked ? 'scale-75' : ''}`} />
      </motion.div>
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}>
        <div className={`w-1.5 h-1.5 bg-white rounded-full transition-all ${clicked ? 'scale-150' : ''}`} />
      </motion.div>
    </>
  )
}
