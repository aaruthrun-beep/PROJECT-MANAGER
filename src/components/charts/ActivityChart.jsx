import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { eachDayOfInterval, format, subDays, parseISO } from 'date-fns'

export default function ActivityChart({ entriesByDay = {} }) {
  const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })
  const data = days.map(d => {
    const key = format(d, 'yyyy-MM-dd')
    return { date: format(d, 'MMM d'), entries: entriesByDay[key] || 0 }
  })

  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Activity (30 days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f3f4f6' }} />
          <Bar dataKey="entries" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
