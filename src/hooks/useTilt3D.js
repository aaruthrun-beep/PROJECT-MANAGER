import { useRef, useCallback } from 'react'

export function useTilt3D(maxTilt = 12) {
  const ref = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const tiltX = ((y - centerY) / centerY) * maxTilt
    const tiltY = ((x - centerX) / centerX) * maxTilt
    ref.current.style.transform = `perspective(1000px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`
  }, [maxTilt])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }, [])

  return { ref, handleMouseMove, handleMouseLeave }
}
