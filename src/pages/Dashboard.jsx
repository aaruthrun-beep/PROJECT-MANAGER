import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderKanban, CalendarPlus, TrendingUp, Activity, Clock, Target, Sparkles } from 'lucide-react'
import { loadData, getStats, getLogEntries } from '../data/store'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import ProjectCard from '../components/ProjectCard'
import ActivityChart from '../components/charts/ActivityChart'
import ProjectPieChart from '../components/charts/ProjectPieChart'
import HeatmapChart from '../components/charts/HeatmapChart'

export default function Dashboard() {
  const [data, setData] = useState({ projects: [], logEntries: [] })
  const [stats, setStats] = useState({})

  useEffect(() => {
    setData(loadData())
    setStats(getStats())
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayEntries = data.logEntries.filter(e =>
    (e.date || e.createdAt).split('T')[0] === today
  ).slice(0, 5)

  const recentProjects = [...data.projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects || 0, icon: FolderKanban, color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30', iconBg: 'bg-indigo-500/20 text-indigo-300' },
    { label: 'Active Projects', value: stats.activeProjects || 0, icon: Activity, color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30', iconBg: 'bg-emerald-500/20 text-emerald-300' },
    { label: 'Log Entries', value: stats.totalEntries || 0, icon: CalendarPlus, color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30', iconBg: 'bg-amber-500/20 text-amber-300' },
    { label: "Today's Entries", value: stats.entriesToday || 0, icon: TrendingUp, color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30', iconBg: 'bg-pink-500/20 text-pink-300' },
    { label: 'Total Hours', value: Math.round((stats.totalTime || 0) / 60), icon: Clock, color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30', iconBg: 'bg-sky-500/20 text-sky-300' },
    { label: 'Milestones', value: `${stats.completedMilestones || 0}/${stats.totalMilestones || 0}`, icon: Target, color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30', iconBg: 'bg-violet-500/20 text-violet-300' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            Dashboard
            <Sparkles size={24} className="text-amber-400" />
          </h2>
          <p className="text-gray-400 mt-1">Your command center for all projects and activity</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className={`glass rounded-2xl p-4 border ${stat.color}`}>
              <div className={`p-2 rounded-xl inline-flex mb-3 ${stat.iconBg}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <ActivityChart entriesByDay={stats.entriesByDay} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <ProjectPieChart projects={data.projects} />
        </motion.div>
      </div>

      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <HeatmapChart entriesByDay={stats.entriesByDay} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FolderKanban size={18} className="text-indigo-400" /> Recent Projects
            </h3>
            <Link to="/projects" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentProjects.length === 0 ? (
              <Card className="text-center py-10">
                <FolderKanban size={40} className="mx-auto mb-3 opacity-30 text-gray-500" />
                <p className="text-gray-500 mb-2">No projects yet</p>
                <Link to="/projects" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">Create your first project</Link>
              </Card>
            ) : (
              recentProjects.map(p => <ProjectCard key={p.id} project={p} />)
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <CalendarPlus size={18} className="text-amber-400" /> Today's Activity
            </h3>
            <Link to="/daily-log" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {todayEntries.length === 0 ? (
              <Card className="text-center py-10">
                <CalendarPlus size={40} className="mx-auto mb-3 opacity-30 text-gray-500" />
                <p className="text-gray-500">No entries today</p>
              </Card>
            ) : (
              todayEntries.map(e => {
                const project = data.projects.find(p => p.id === e.projectId)
                return (
                  <Card key={e.id} hover={false}>
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-white font-medium text-sm">{e.title}</h4>
                      <span className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-2">{e.content}</p>
                    {project && <Badge color="indigo" className="text-[10px]">{project.name}</Badge>}
                  </Card>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
