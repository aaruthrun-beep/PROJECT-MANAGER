import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderKanban, CalendarPlus, TrendingUp, Activity, Clock, Target, Sparkles, Zap, RefreshCw } from 'lucide-react'
import { loadData, getStats } from '../data/store'
import Card from '../ui/Card'
import ProjectCard from '../components/ProjectCard'
import { ScrollReveal, AnimatedCounter, SkeletonPage, ConfettiEffect } from '../effects'
import ActivityChart from '../components/charts/ActivityChart'
import ProjectPieChart from '../components/charts/ProjectPieChart'
import HeatmapChart from '../components/charts/HeatmapChart'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [confetti, setConfetti] = useState(false)

  const refresh = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      setData(loadData())
      setStats(getStats())
      setLoading(false)
    }, 400)
  }, [])

  useEffect(refresh, [])

  if (loading || !data) return <div className="px-4"><SkeletonPage /></div>

  const today = new Date().toISOString().split('T')[0]
  const todayEntries = data.logEntries.filter(e =>
    (e.date || e.createdAt).split('T')[0] === today
  ).slice(0, 5)

  const recentProjects = [...data.projects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects || 0, icon: FolderKanban, color: 'from-amber-500/20 to-amber-700/20 border-amber-600/30', iconBg: 'bg-amber-600/20 text-amber-400', suffix: '' },
    { label: 'Active Projects', value: stats.activeProjects || 0, icon: Activity, color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30', iconBg: 'bg-emerald-500/20 text-emerald-300', suffix: '' },
    { label: 'Log Entries', value: stats.totalEntries || 0, icon: CalendarPlus, color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30', iconBg: 'bg-amber-500/20 text-amber-300', suffix: '' },
    { label: "Today's Logs", value: stats.entriesToday || 0, icon: TrendingUp, color: 'from-amber-500/20 to-amber-700/20 border-amber-600/30', iconBg: 'bg-amber-600/20 text-amber-400', suffix: '' },
    { label: 'Total Hours', value: Math.round((stats.totalTime || 0) / 60), icon: Clock, color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30', iconBg: 'bg-sky-500/20 text-sky-300', suffix: 'h' },
    { label: 'Milestones', value: `${stats.completedMilestones || 0}/${stats.totalMilestones || 0}`, icon: Target, color: 'from-amber-500/20 to-amber-700/20 border-amber-600/30', iconBg: 'bg-amber-600/20 text-amber-400', suffix: '' },
  ]

  return (
    <div>
      <ConfettiEffect trigger={confetti} />

      <ScrollReveal>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
              Dashboard
              <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Sparkles size={24} className="text-amber-400" />
              </motion.span>
            </h2>
            <p className="text-zinc-400 mt-1">Your command center for all projects and activity</p>
          </div>
          <button onClick={() => setConfetti(true)}
            className="hidden md:flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-white border border-zinc-700/60 hover:border-amber-600/30 transition-all">
            <Zap size={16} /> Celebrate
          </button>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <ScrollReveal key={stat.label} delay={0.03 * i} duration={0.3}>
              <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}
                className={`glass rounded-2xl p-4 border ${stat.color} group cursor-default`}>
                <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}
                  className={`p-2 rounded-xl inline-flex mb-3 ${stat.iconBg}`}>
                  <Icon size={18} />
                </motion.div>
                <p className="text-2xl font-bold text-white">
                  {typeof stat.value === 'number' ? (
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  ) : stat.value}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">{stat.label}</p>
              </motion.div>
            </ScrollReveal>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ScrollReveal className="lg:col-span-2" delay={0.2}>
          <motion.div whileHover={{ scale: 1.005 }}>
            <ActivityChart entriesByDay={stats.entriesByDay} />
          </motion.div>
        </ScrollReveal>
        <ScrollReveal delay={0.25}>
          <motion.div whileHover={{ scale: 1.005 }}>
            <ProjectPieChart projects={data.projects} />
          </motion.div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.3}>
        <motion.div whileHover={{ scale: 1.002 }} className="mb-8">
          <HeatmapChart entriesByDay={stats.entriesByDay} />
        </motion.div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ScrollReveal delay={0.35} direction="left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FolderKanban size={18} className="text-amber-500" /> Recent Projects
            </h3>
            <Link to="/projects" className="text-sm text-amber-500 hover:text-amber-400 transition-colors">View all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentProjects.length === 0 ? (
              <Card className="text-center py-10">
                <FolderKanban size={40} className="mx-auto mb-3 opacity-30 text-zinc-500" />
                <p className="text-zinc-500 mb-2">No projects yet</p>
                <Link to="/projects" className="text-amber-500 hover:text-amber-400 text-sm font-medium">Create your first project</Link>
              </Card>
            ) : (
              recentProjects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                  <ProjectCard project={p} />
                </motion.div>
              ))
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4} direction="right">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <CalendarPlus size={18} className="text-amber-400" /> Today's Activity
            </h3>
            <Link to="/daily-log" className="text-sm text-amber-500 hover:text-amber-400 transition-colors">View all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {todayEntries.length === 0 ? (
              <Card className="text-center py-10">
                <CalendarPlus size={40} className="mx-auto mb-3 opacity-30 text-zinc-500" />
                <p className="text-zinc-500">No entries today</p>
              </Card>
            ) : (
              todayEntries.map((e, i) => {
                const project = data.projects.find(p => p.id === e.projectId)
                return (
                  <motion.div key={e.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.05 }}>
                    <Card hover={false}>
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-white font-medium text-sm">{e.title}</h4>
                        <span className="text-xs text-zinc-500">{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-zinc-400 text-xs line-clamp-2 mb-2">{e.content}</p>
                      {project && <span className="inline-flex px-2 py-0.5 text-[10px] rounded-lg bg-amber-600/20 text-amber-500 border border-amber-600/30">{project.name}</span>}
                    </Card>
                  </motion.div>
                )
              })
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
