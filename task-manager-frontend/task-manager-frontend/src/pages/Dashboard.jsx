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

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading"><span className="spinner"></span> Loading dashboard...</div>

  return (
    <div className="page-container page-enter">
      <div className="page-header">
        <h1 className="page-title">Good day, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening with your projects today</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-label">Total Projects</div>
          <div className="stat-value">{data?.totalProjects ?? 0}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{data?.totalTasks ?? 0}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{data?.inProgressTasks ?? 0}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{data?.completedTasks ?? 0}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{data?.overdueTasks ?? 0}</div>
        </div>
      </div>

      <div className="two-col" style={{marginBottom: 24}}>
        {/* Recent Tasks */}
        <div className="card">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
            <div className="card-title" style={{margin:0}}>Recent Tasks</div>
            <Link to="/tasks" className="btn btn-secondary btn-sm">View all</Link>
          </div>
          {data?.myRecentTasks?.length === 0 ? (
            <div className="empty-state" style={{padding:'30px 0'}}>
              <div className="empty-icon">📋</div>
              <div className="empty-text">No tasks assigned yet</div>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {data?.myRecentTasks?.map(task => (
                <div key={task.id} style={{padding:'12px 14px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)'}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6}}>
                    <span style={{fontWeight:600, fontSize:14, color:'var(--text)'}}>{task.title}</span>
                    <StatusBadge status={task.overdue ? 'OVERDUE' : task.status} />
                  </div>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <PriorityBadge priority={task.priority} />
                    <span style={{fontSize:12, color:'var(--text3)'}}>{task.projectName}</span>
                    {task.dueDate && <span style={{fontSize:12, color:'var(--text3)', marginLeft:'auto'}}>Due {task.dueDate}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Projects */}
        <div className="card">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
            <div className="card-title" style={{margin:0}}>My Projects</div>
            <Link to="/projects" className="btn btn-secondary btn-sm">View all</Link>
          </div>
          {data?.myProjects?.length === 0 ? (
            <div className="empty-state" style={{padding:'30px 0'}}>
              <div className="empty-icon">📁</div>
              <div className="empty-text">No projects yet</div>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {data?.myProjects?.map(project => {
                const pct = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0
                return (
                  <Link to={`/projects/${project.id}`} key={project.id} style={{textDecoration:'none'}}>
                    <div style={{padding:'12px 14px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', transition:'border-color 0.15s'}}
                         onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                         onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                        <span style={{fontWeight:600, fontSize:14, color:'var(--text)'}}>{project.name}</span>
                        <span style={{fontSize:12, color:'var(--text3)'}}>{project.completedTasks}/{project.totalTasks} tasks</span>
                      </div>
                      <div className="project-progress">
                        <div className="project-progress-bar" style={{width:`${pct}%`}}></div>
                      </div>
                      <span style={{fontSize:12, color:'var(--accent2)'}}>{pct}% complete</span>
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
