import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../services/api'
import { useAuth } from '../context/AuthContext'

function StatusBadge({ status }) {
  const map = { TODO: 'badge-todo', IN_PROGRESS: 'badge-inprogress', COMPLETED: 'badge-completed', OVERDUE: 'badge-overdue' }
  const label = { TODO: 'To Do', IN_PROGRESS: 'In Progress', COMPLETED: 'Done', OVERDUE: 'Overdue' }
  return <span className={`badge ${map[status] || 'badge-todo'}`}>{label[status] || status}</span>
}

function PriorityBadge({ priority }) {
  const map = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
  return <span className={`badge ${map[priority] || ''}`}>{priority}</span>
}

const statCards = [
  { key: 'totalProjects', label: 'Total Projects', color: 'purple', icon: '📁' },
  { key: 'totalTasks', label: 'Total Tasks', color: 'blue', icon: '✅' },
  { key: 'inProgressTasks', label: 'In Progress', color: 'yellow', icon: '⚡' },
  { key: 'completedTasks', label: 'Completed', color: 'green', icon: '🎯' },
  { key: 'overdueTasks', label: 'Overdue', color: 'red', icon: '⚠️' },
]

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading">
      <span className="spinner"></span> Loading dashboard...
    </div>
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page-container page-enter">

      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your projects today</p>
        </div>
        <div className="dash-date">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map(({ key, label, color, icon }) => (
          <div key={key} className={`stat-card ${color}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{data?.[key] ?? 0}</div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: `${Math.min(((data?.[key] ?? 0) / Math.max(data?.totalTasks ?? 1, 1)) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Two column section */}
      <div className="two-col" style={{ marginBottom: 24 }}>

        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header-row">
            <div className="card-title-group">
              <span className="card-title-icon">📋</span>
              <div className="card-title" style={{ margin: 0 }}>Recent Tasks</div>
            </div>
            <Link to="/tasks" className="btn btn-secondary btn-sm">View all →</Link>
          </div>

          {!data?.myRecentTasks?.length ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📋</div>
              <div className="empty-text">No tasks assigned yet</div>
            </div>
          ) : (
            <div className="task-list">
              {data.myRecentTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-item-top">
                    <span className="task-item-title">{task.title}</span>
                    <StatusBadge status={task.overdue ? 'OVERDUE' : task.status} />
                  </div>
                  <div className="task-item-meta">
                    <PriorityBadge priority={task.priority} />
                    <span className="task-project-name">📁 {task.projectName}</span>
                    {task.dueDate && (
                      <span className="task-due" style={{ marginLeft: 'auto' }}>
                        🗓 {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Projects */}
        <div className="card">
          <div className="card-header-row">
            <div className="card-title-group">
              <span className="card-title-icon">🗂</span>
              <div className="card-title" style={{ margin: 0 }}>My Projects</div>
            </div>
            <Link to="/projects" className="btn btn-secondary btn-sm">View all →</Link>
          </div>

          {!data?.myProjects?.length ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📁</div>
              <div className="empty-text">No projects yet</div>
            </div>
          ) : (
            <div className="task-list">
              {data.myProjects.map(project => {
                const pct = project.totalTasks > 0
                  ? Math.round((project.completedTasks / project.totalTasks) * 100)
                  : 0
                return (
                  <Link to={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none' }}>
                    <div className="project-dash-item">
                      <div className="project-dash-top">
                        <span className="task-item-title">{project.name}</span>
                        <span className="project-pct-badge">{pct}%</span>
                      </div>
                      <div className="project-progress" style={{ margin: '8px 0 4px' }}>
                        <div className="project-progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="project-dash-meta">
                        <span>{project.completedTasks}/{project.totalTasks} tasks done</span>
                        <span>{project.members?.length ?? 0} members</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}