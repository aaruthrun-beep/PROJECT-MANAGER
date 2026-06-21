import { useAnimatedCounter } from '../hooks/useAnimatedCounter'

export default function AnimatedCounter({ target, duration, suffix = '', prefix = '', className = '' }) {
  const { count, ref } = useAnimatedCounter(target, duration)

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  )
}
