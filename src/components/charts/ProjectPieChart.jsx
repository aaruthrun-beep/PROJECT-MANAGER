import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#6b7280']

export default function ProjectPieChart({ projects = [] }) {
  const statusCounts = {}
  projects.forEach(p => {
    const s = p.status || 'active'
    statusCounts[s] = (statusCounts[s] || 0) + 1
  })
  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  if (data.length === 0) return null

  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Project Status</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
          <Legend formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
