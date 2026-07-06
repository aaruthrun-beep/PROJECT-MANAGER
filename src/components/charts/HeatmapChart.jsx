import { format, subDays, eachDayOfInterval, getDay } from 'date-fns'
import Tooltip from '../../ui/Tooltip'

export default function HeatmapChart({ entriesByDay = {} }) {
  const today = new Date()
  const startDate = subDays(today, 364)
  const days = eachDayOfInterval({ start: startDate, end: today })
  const weeks = []
  let currentWeek = []

  days.forEach((d, i) => {
    const dayOfWeek = getDay(d)
    if (i === 0) {
      for (let j = 0; j < dayOfWeek; j++) currentWeek.push(null)
    }
    const key = format(d, 'yyyy-MM-dd')
    currentWeek.push({ date: key, count: entriesByDay[key] || 0, day: format(d, 'MMM d, yyyy') })
    if (dayOfWeek === 6 || i === days.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  const maxCount = Math.max(...Object.values(entriesByDay), 1)
  const getColor = (count) => {
    if (count === 0) return 'bg-white/[0.03]'
    const intensity = Math.min(count / maxCount, 1)
    if (intensity < 0.25) return 'bg-amber-600/20'
    if (intensity < 0.5) return 'bg-amber-600/40'
    if (intensity < 0.75) return 'bg-amber-600/60'
    return 'bg-amber-600/80'
  }

  return (
    <div className="glass rounded-2xl p-6 border border-zinc-700/60">
      <h3 className="text-lg font-semibold text-white mb-4">Contribution Heatmap</h3>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-0.5" style={{ minWidth: weeks.length * 14 }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                day ? (
                  <Tooltip key={di} content={`${day.count} entries on ${day.day}`}>
                    <div className={`w-3 h-3 rounded-sm ${getColor(day.count)} hover:ring-1 hover:ring-amber-500 transition-all cursor-pointer`} />
                  </Tooltip>
                ) : (
                  <div key={di} className="w-3 h-3" />
                )
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[10px] text-zinc-600">Less</span>
        {[0, 0.2, 0.4, 0.6, 0.8].map((v, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${v === 0 ? 'bg-white/[0.03]' : `bg-amber-600/${Math.round(v * 100)}`}`} />
        ))}
        <span className="text-[10px] text-zinc-600">More</span>
      </div>
    </div>
  )
}
