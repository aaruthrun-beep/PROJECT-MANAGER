import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { loadData, getLogEntriesForDate } from '../../data/store'
import Card from '../../ui/Card'
import Badge from '../../ui/Badge'
import Modal from '../../ui/Modal'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'

export default function CalendarView() {
  const [data, setData] = useState({ projects: [], logEntries: [] })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayEntries, setDayEntries] = useState([])

  useEffect(() => { setData(loadData()) }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const entriesByDate = {}
  data.logEntries.forEach(e => {
    const d = (e.date || e.createdAt).split('T')[0]
    if (!entriesByDate[d]) entriesByDate[d] = []
    entriesByDate[d].push(e)
  })

  const handleDayClick = (day) => {
    const key = format(day, 'yyyy-MM-dd')
    setSelectedDate(day)
    setDayEntries(entriesByDate[key] || [])
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          Calendar
        </h2>
        <p className="text-zinc-400 mt-1">View your daily log entries by date</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card hover={false}>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-zinc-800/80 text-zinc-400 hover:text-white transition-all">
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-semibold text-white">{format(currentMonth, 'MMMM yyyy')}</h3>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-zinc-800/80 text-zinc-400 hover:text-white transition-all">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(d => (
                <div key={d} className="text-center text-xs text-zinc-500 font-medium py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const key = format(day, 'yyyy-MM-dd')
                const entryCount = entriesByDate[key]?.length || 0
                const isToday = isSameDay(day, new Date())
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isCurrentMonth = isSameMonth(day, currentMonth)

                return (
                  <button key={i} onClick={() => handleDayClick(day)}
                    className={`relative p-1 sm:p-2 rounded-xl text-xs sm:text-sm transition-all min-h-[40px] sm:min-h-[44px] ${!isCurrentMonth ? 'text-zinc-700' : isSelected ? 'bg-amber-600/30 text-white border border-amber-600/50' : isToday ? 'bg-amber-600/10 text-white border border-amber-600/20' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'}`}>
                    <span className={`${isToday ? 'font-bold' : ''}`}>{format(day, 'd')}</span>
                    {entryCount > 0 && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        <div>
          <Card hover={false}>
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>
            {dayEntries.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">No entries for this day</div>
            ) : (
              <div className="space-y-3">
                {dayEntries.map(e => {
                  const project = data.projects.find(p => p.id === e.projectId)
                  return (
                    <div key={e.id} className="glass rounded-xl p-3 border border-zinc-700/60">
                      <h4 className="text-white text-sm font-medium mb-1">{e.title}</h4>
                      <p className="text-zinc-400 text-xs line-clamp-2 mb-2">{e.content}</p>
                      {project && <Badge color="indigo" className="text-[10px]">{project.name}</Badge>}
                      {(e.images?.length > 0 || e.videos?.length > 0) && (
                        <p className="text-[10px] text-amber-500 mt-1">{e.images?.length || 0} photos, {e.videos?.length || 0} videos</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
