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
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  useEffect(() => {
    if (query.length > 0) setResults(searchAll(query))
    else setResults({ projects: [], entries: [], milestones: [], tags: [] })
  }, [query])

  const totalResults = results.projects.length + results.entries.length + results.milestones.length

  return (
    <>
      {/* Mobile: icon button */}
      <button onClick={() => setOpen(true)}
        className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 active:scale-95 transition-all">
        <Search size={18} />
      </button>

      {/* Desktop: search bar */}
      <button onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 glass rounded-xl px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all w-full max-w-md group">
        <Search size={15} className="shrink-0" />
        <span className="flex-1 text-left">Search projects, entries...</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-500 font-mono shrink-0">Ctrl+K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative glass rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-white/10">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search anything..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm sm:text-base" />
                {query && <button onClick={() => setQuery('')} className="text-gray-500 hover:text-white p-1"><X size={16} /></button>}
              </div>
              <div className="flex-1 overflow-y-auto p-2 sm:p-3">
                {query.length > 0 && totalResults === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    <Search size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No results for "{query}"</p>
                  </div>
                )}
                {results.projects.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-gray-500 px-3 py-1.5 font-medium uppercase tracking-wider">Projects</p>
                    {results.projects.map(p => (
                      <button key={p.id} onClick={() => { navigate(`/projects/${p.id}`); setOpen(false) }}
                        className="w-full flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-all active:scale-[0.98]">
                        <FolderKanban size={15} className="text-indigo-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{p.name}</p>
                          {p.description && <p className="text-gray-500 text-xs truncate">{p.description}</p>}
                        </div>
                        <ArrowRight size={14} className="text-gray-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
                {results.entries.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-gray-500 px-3 py-1.5 font-medium uppercase tracking-wider">Log Entries</p>
                    {results.entries.map(e => (
                      <button key={e.id} onClick={() => { navigate(`/daily-log#log-${e.id}`); setOpen(false) }}
                        className="w-full flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-all active:scale-[0.98]">
                        <CalendarPlus size={15} className="text-emerald-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{e.title}</p>
                          <p className="text-gray-500 text-xs truncate">{e.content}</p>
                        </div>
                        <ArrowRight size={14} className="text-gray-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
                {results.milestones.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-500 px-3 py-1.5 font-medium uppercase tracking-wider">Milestones</p>
                    {results.milestones.map(m => (
                      <div key={m.id} className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl">
                        <Flag size={15} className="text-amber-400 shrink-0" />
                        <p className="text-white text-sm truncate">{m.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2 sm:p-3 border-t border-white/5 text-center hidden sm:block">
                <p className="text-[10px] text-gray-600">
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
