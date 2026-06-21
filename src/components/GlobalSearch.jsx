import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FolderKanban, CalendarPlus, Flag, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchAll } from '../data/store'

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ projects: [], entries: [], milestones: [], tags: [] })
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    if (query.length > 0) setResults(searchAll(query))
    else setResults({ projects: [], entries: [], milestones: [], tags: [] })
  }, [query])

  const totalResults = results.projects.length + results.entries.length + results.milestones.length

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 glass rounded-xl px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all w-full max-w-md group">
        <Search size={16} className="shrink-0" />
        <span className="flex-1 text-left">Search projects, entries...</span>
        <kbd className="hidden md:inline-flex text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-500 font-mono">Ctrl+K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative glass rounded-2xl shadow-2xl w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Search size={18} className="text-gray-400 shrink-0" />
                <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search projects, log entries, milestones..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base" />
                {query && <button onClick={() => setQuery('')} className="text-gray-500 hover:text-white"><X size={16} /></button>}
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {query.length > 0 && totalResults === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Search size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No results for "{query}"</p>
                  </div>
                )}
                {results.projects.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 px-3 py-2 font-medium uppercase tracking-wider">Projects</p>
                    {results.projects.map(p => (
                      <button key={p.id} onClick={() => { navigate(`/projects/${p.id}`); setOpen(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-all group">
                        <FolderKanban size={16} className="text-indigo-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{p.name}</p>
                          {p.description && <p className="text-gray-500 text-xs truncate">{p.description}</p>}
                        </div>
                        <ArrowRight size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
                {results.entries.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 px-3 py-2 font-medium uppercase tracking-wider">Log Entries</p>
                    {results.entries.map(e => (
                      <button key={e.id} onClick={() => { navigate(`/daily-log`); setOpen(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-all group">
                        <CalendarPlus size={16} className="text-emerald-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{e.title}</p>
                          <p className="text-gray-500 text-xs truncate">{e.content}</p>
                        </div>
                        <ArrowRight size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
                {results.milestones.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 px-3 py-2 font-medium uppercase tracking-wider">Milestones</p>
                    {results.milestones.map(m => (
                      <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                        <Flag size={16} className="text-amber-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{m.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-600">
                  <kbd className="px-1 py-0.5 rounded bg-white/10 text-gray-500 mx-0.5">↑↓</kbd> Navigate{' '}
                  <kbd className="px-1 py-0.5 rounded bg-white/10 text-gray-500 mx-0.5">Esc</kbd> Close
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
