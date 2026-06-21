import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, CalendarPlus, TrendingUp, Activity } from 'lucide-react'
import { loadData } from '../data/store'
import ProjectCard from '../components/ProjectCard'
import LogEntryCard from '../components/LogEntryCard'

export default function Dashboard() {
  const [data, setData] = useState({ projects: [], logEntries: [] })

  useEffect(() => {
    setData(loadData())
  }, [])

  const today = new Date().toDateString()
  const todayEntries = data.logEntries.filter(e =>
    new Date(e.date || e.createdAt).toDateString() === today
  )
  const recentEntries = [...data.logEntries]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 3)

  const stats = [
    { label: 'Total Projects', value: data.projects.length, icon: FolderKanban, color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'Active Projects', value: data.projects.filter(p => p.status === 'active').length, icon: Activity, color: 'text-green-400 bg-green-500/10' },
    { label: 'Log Entries', value: data.logEntries.length, icon: CalendarPlus, color: 'text-purple-400 bg-purple-500/10' },
    { label: "Today's Entries", value: todayEntries.length, icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1">Overview of your projects and activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Projects</h3>
            <Link to="/projects" className="text-sm text-indigo-400 hover:text-indigo-300">View all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {data.projects.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                <FolderKanban size={40} className="mx-auto mb-3 opacity-50" />
                <p className="mb-1">No projects yet</p>
                <Link to="/projects" className="text-indigo-400 hover:text-indigo-300 text-sm">Create your first project</Link>
              </div>
            ) : (
              data.projects.slice(0, 4).map(p => <ProjectCard key={p.id} project={p} />)
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
            <Link to="/daily-log" className="text-sm text-indigo-400 hover:text-indigo-300">View all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                <CalendarPlus size={40} className="mx-auto mb-3 opacity-50" />
                <p>No log entries yet</p>
              </div>
            ) : (
              recentEntries.map(e => (
                <LogEntryCard key={e.id} entry={e} onView={() => {}} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
