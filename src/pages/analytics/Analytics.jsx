import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Calendar, Clock, Target, Activity, Zap } from 'lucide-react'
import { loadData, getStats } from '../../data/store'
import Card from '../../ui/Card'
import ActivityChart from '../../components/charts/ActivityChart'
import ProjectPieChart from '../../components/charts/ProjectPieChart'
import HeatmapChart from '../../components/charts/HeatmapChart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'

export default function Analytics() {
  const [data, setData] = useState({ projects: [], logEntries: [], timeEntries: [] })
  const [stats, setStats] = useState({})

  useEffect(() => {
    const d = loadData()
    setData(d)
    setStats(getStats())
  }, [])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const chartHeight = isMobile ? 150 : 200

  const totalLogs = data.logEntries.length
  const entriesWithMedia = data.logEntries.filter(e => (e.images?.length || 0) + (e.videos?.length || 0) > 0).length
  const entriesWithMood = data.logEntries.filter(e => e.mood).length

  const moodCounts = {}
  data.logEntries.forEach(e => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
  })
  const moodData = Object.entries(moodCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))

  const projectsByPriority = {}
  data.projects.forEach(p => {
    const pr = p.priority || 'medium'
    projectsByPriority[pr] = (projectsByPriority[pr] || 0) + 1
  })
  const priorityData = Object.entries(projectsByPriority).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))

  const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() })
  const lineData = days.map(d => {
    const key = format(d, 'yyyy-MM-dd')
    return { date: format(d, 'MMM d'), entries: stats.entriesByDay?.[key] || 0 }
  })

  const insights = []
  if (stats.activeProjects > 0) insights.push(`You have ${stats.activeProjects} active ${stats.activeProjects === 1 ? 'project' : 'projects'} in progress`)
  if (stats.entriesToday > 0) insights.push(`You logged ${stats.entriesToday} ${stats.entriesToday === 1 ? 'entry' : 'entries'} today! Great consistency`)
  if (stats.totalEntries > 0) insights.push(`A total of ${stats.totalEntries} log entries, ${entriesWithMedia} with media attachments`)
  if (data.projects.length > 0) {
    const completionRate = Math.round((data.projects.filter(p => p.status === 'completed').length / data.projects.length) * 100)
    insights.push(`Project completion rate: ${completionRate}%`)
  }
  if (stats.totalTime > 0) insights.push(`Total time tracked: ${Math.round(stats.totalTime / 60)} hours`)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 size={24} className="text-indigo-400" /> Analytics
        </h2>
        <p className="text-gray-400 mt-1">Insights and metrics for your productivity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Entries', value: stats.totalEntries || 0, icon: Calendar, color: 'text-indigo-400 bg-indigo-500/10' },
          { label: '7-Day Avg', value: Math.round((stats.entriesThisWeek || 0) / 7 * 10) / 10, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Streak (days)', value: calculateStreak(data.logEntries), icon: Zap, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Media Items', value: entriesWithMedia, icon: Activity, color: 'text-purple-400 bg-purple-500/10' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4 border border-white/10">
              <div className={`p-2 rounded-xl inline-flex mb-3 ${s.color}`}><Icon size={18} /></div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ActivityChart entriesByDay={stats.entriesByDay} />
        </div>
        <ProjectPieChart projects={data.projects} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Entry Trend (14 days)</h3>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f3f4f6' }} />
              <Line type="monotone" dataKey="entries" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Project Priorities</h3>
          {priorityData.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No projects yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} width={isMobile ? 60 : 80} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="mb-6">
        <HeatmapChart entriesByDay={stats.entriesByDay} />
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-3 border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
              <p className="text-sm text-gray-300">{insight}</p>
            </motion.div>
          ))}
          {insights.length === 0 && <p className="text-gray-500 text-sm col-span-2 py-4 text-center">Add some data to see insights</p>}
        </div>
      </Card>
    </motion.div>
  )
}

function calculateStreak(entries) {
  if (entries.length === 0) return 0
  const dates = [...new Set(entries.map(e => (e.date || e.createdAt).split('T')[0]))].sort()
  if (dates.length === 0) return 0
  let streak = 1
  const today = new Date().toISOString().split('T')[0]
  if (dates[dates.length - 1] !== today) return 0
  for (let i = dates.length - 1; i > 0; i--) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) streak++
    else break
  }
  return streak
}
