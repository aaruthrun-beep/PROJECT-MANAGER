import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Square, RotateCcw, Clock } from 'lucide-react'
import Button from './Button'
import toast from 'react-hot-toast'

export default function Timer({ onLog }) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [description, setDescription] = useState('')
  const intervalRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const start = () => {
    startRef.current = Date.now() - elapsed
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current)
    }, 100)
  }

  const stop = useCallback(() => {
    if (!running) return
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (elapsed < 1000) {
      toast.error('Too short â€” less than 1 second')
      setElapsed(0)
      return
    }
    const duration = Math.round(elapsed / 60000)
    if (duration < 1) {
      toast.error('Minimum 1 minute to log')
      setElapsed(0)
      return
    }
    onLog({ duration, description: description || `Timer â€” ${formatTime(elapsed)}` })
    setElapsed(0)
    setDescription('')
    toast.success(`Logged ${duration} min`)
  }, [running, elapsed, description, onLog])

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setElapsed(0)
    setDescription('')
  }

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="glass rounded-xl p-4 border border-zinc-700/60 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Clock size={16} className="text-amber-500 shrink-0" />
        <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-wider">
          {formatTime(elapsed)}
        </span>
        <div className="flex gap-1.5 ml-auto shrink-0">
          {!running ? (
            <Button size="sm" onClick={start} icon={Play} variant="success">Start</Button>
          ) : (
            <Button size="sm" onClick={stop} icon={Square} variant="danger">Stop & Log</Button>
          )}
          <button onClick={reset} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/80 transition-all">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
      {running && (
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-lg py-1.5 px-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-600/50" />
      )}
    </div>
  )
}
