import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Radio, Flag, Clock } from 'lucide-react'
import { loadData } from '../../data/store'
import { useDataVersion } from '../../context/DataContext'
import Card from '../../ui/Card'
import Badge from '../../ui/Badge'
import { format } from 'date-fns'

export default function TimelineView() {
  const [data, setData] = useState({ projects: [], logEntries: [], milestones: [], timeEntries: [] })
  const [filter, setFilter] = useState('all')
  const { dataVersion } = useDataVersion()

  useEffect(() => { setData(loadData()) }, [dataVersion])

  const events = []

  data.logEntries.forEach(e => {
    const project = data.projects.find(p => p.id === e.projectId)
    events.push({
      date: new Date(e.date || e.createdAt),
      type: 'entry',
      title: e.title,
      description: e.content,
      project: project?.name,
      hasMedia: (e.images?.length || 0) + (e.videos?.length || 0) > 0,
    })
  })

  data.milestones.forEach(m => {
    const project = data.projects.find(p => p.id === m.projectId)
    events.push({
      date: new Date(m.dueDate || m.createdAt),
      type: 'milestone',
      title: m.name,
      description: m.completed ? 'Completed' : 'Pending',
      project: project?.name,
      completed: m.completed,
    })
  })

  data.timeEntries.forEach(t => {
    const project = data.projects.find(p => p.id === t.projectId)
    events.push({
      date: new Date(t.date || t.createdAt),
      type: 'time',
      title: t.description || 'Time logged',
      description: `${t.duration} minutes`,
      project: project?.name,
    })
  })

  events.sort((a, b) => b.date - a.date)

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter)
  const grouped = {}
  filtered.forEach(e => {
    const key = format(e.date, 'yyyy-MM-dd')
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  })

  const typeConfig = {
    entry: { icon: Calendar, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    milestone: { icon: Flag, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    time: { icon: Clock, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Radio size={24} className="text-amber-500" /> Timeline
        </h2>
        <p className="text-zinc-400 mt-1">All your activity in chronological order</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'All' },
          { value: 'entry', label: 'Logs' },
          { value: 'milestone', label: 'Milestones' },
          { value: 'time', label: 'Time' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.value ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30' : 'glass text-zinc-400 hover:text-white border border-zinc-700/60'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-8 relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-zinc-800/80" />

        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4 sticky top-0 bg-zinc-950/80 backdrop-blur-sm z-10 py-2">
              <div className="w-10 h-10 rounded-full bg-amber-600/20 border border-amber-600/30 flex items-center justify-center">
                <Calendar size={16} className="text-amber-500" />
              </div>
              <h3 className="text-sm font-semibold text-white">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h3>
            </div>
            <div className="ml-16 space-y-3">
              {items.map((event, i) => {
                const config = typeConfig[event.type]
                const Icon = config.icon
                return (
                  <motion.div key={`${event.type}-${event.title}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`glass rounded-xl p-4 border-l-4 ${config.color.replace(/text-|bg-|border-/g, m => m === 'text-' ? 'border-' : m)} relative`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${config.color.split(' ')[1]} ${config.color.split(' ')[2]}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white text-sm font-medium">{event.title}</h4>
                          <Badge color={event.type === 'entry' ? 'emerald' : event.type === 'milestone' ? 'amber' : 'sky'} className="text-[10px]">{event.type}</Badge>
                        </div>
                        {event.description && <p className="text-zinc-400 text-xs line-clamp-2">{event.description}</p>}
                        {event.project && <p className="text-[10px] text-amber-500 mt-1">{event.project}</p>}
                      </div>
                      <span className="text-xs text-zinc-500 shrink-0">{format(event.date, 'HH:mm')}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <Card className="text-center py-12">
            <Radio size={32} className="mx-auto mb-2 text-zinc-500/50" />
            <p className="text-zinc-500">No activity to show</p>
          </Card>
        )}
      </div>
    </motion.div>
  )
}
