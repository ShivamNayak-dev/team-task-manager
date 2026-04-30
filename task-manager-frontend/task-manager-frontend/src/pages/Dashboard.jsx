import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../services/api'
import { useAuth } from '../context/AuthContext'


function StatusBadge({ status }) {

  const styles = {
    TODO: { background: 'rgba(255,255,255,0.06)', color: '#8899aa', border: '1px solid #2a3d52' },
    IN_PROGRESS: { background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' },
    COMPLETED: { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' },
    OVERDUE: { background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' },
  }

  const labels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', COMPLETED: 'Done', OVERDUE: 'Overdue' }

  const s = styles[status] || styles.TODO

  return (
    <span style={{
      ...s,
      padding: '3px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap'
    }}>
      {labels[status] || status}
    </span>
  )
}


function PriorityBadge({ priority }) {

  const styles = {
    HIGH: { background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' },
    MEDIUM: { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' },
    LOW: { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' },
  }

  const s = styles[priority] || styles.MEDIUM

  return (
    <span style={{
      ...s,
      padding: '3px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }}>
      {priority}
    </span>
  )
}


const statCards = [
  { key: 'totalProjects', label: 'Projects', icon: '📁', color: '#0ea5e9', glow: 'rgba(14,165,233,0.15)' },
  { key: 'totalTasks', label: 'Total Tasks', icon: '📋', color: '#6366f1', glow: 'rgba(99,102,241,0.15)' },
  { key: 'inProgressTasks', label: 'In Progress', icon: '⚡', color: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
  { key: 'completedTasks', label: 'Completed', icon: '✅', color: '#10b981', glow: 'rgba(16,185,129,0.15)' },
  { key: 'overdueTasks', label: 'Overdue', icon: '⚠️', color: '#f43f5e', glow: 'rgba(244,63,94,0.15)' },
]


export default function Dashboard() {

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])


  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px', color: '#4a5a6a', gap: '10px', fontSize: '14px'
    }}>
      <span style={{
        width: '18px', height: '18px',
        border: '2px solid #1e2d3d',
        borderTopColor: '#0ea5e9',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite'
      }} />
      Loading dashboard...
    </div>
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric'
  })


  return (
    <div style={{ padding: '32px 36px', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '26px',
            fontWeight: '700',
            color: '#e8edf2',
            letterSpacing: '-0.3px',
            marginBottom: '4px'
          }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#8899aa', fontSize: '14px' }}>
            Here's what's happening with your projects today
          </p>
        </div>

        <div style={{
          fontSize: '13px',
          color: '#4a5a6a',
          background: '#0d1117',
          border: '1px solid #1e2d3d',
          borderRadius: '8px',
          padding: '8px 14px'
        }}>
          {dateStr}
        </div>
      </div>


      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
        gap: '14px',
        marginBottom: '28px'
      }}>
        {statCards.map(({ key, label, icon, color, glow }) => (
          <div key={key} style={{
            background: '#0d1117',
            border: `1px solid #1e2d3d`,
            borderRadius: '12px',
            padding: '18px 20px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s, border-color 0.2s',
            cursor: 'default'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = color
              e.currentTarget.style.boxShadow = `0 4px 20px ${glow}`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#1e2d3d'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* top color strip */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '2px', background: color, opacity: 0.6
            }} />

            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>

            <div style={{
              fontSize: '11px', fontWeight: '600',
              color: '#4a5a6a', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '6px'
            }}>
              {label}
            </div>

            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '34px',
              fontWeight: '800',
              color: color,
              lineHeight: '1',
              letterSpacing: '-1px'
            }}>
              {data?.[key] ?? 0}
            </div>

          </div>
        ))}
      </div>


      {/* Two column */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '24px'
      }}>

        {/* Recent Tasks */}
        <div style={{
          background: '#0d1117',
          border: '1px solid #1e2d3d',
          borderRadius: '12px',
          padding: '20px'
        }}>

          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '16px'
          }}>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '15px', fontWeight: '600', color: '#e8edf2',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>📋</span> Recent Tasks
            </div>
            <Link to="/tasks" style={{
              fontSize: '13px', color: '#0ea5e9', fontWeight: '500',
              textDecoration: 'none', padding: '5px 10px',
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: '6px'
            }}>
              View all →
            </Link>
          </div>

          {!data?.myRecentTasks?.length ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#4a5a6a', fontSize: '14px' }}>
              No tasks assigned yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.myRecentTasks.map(task => (
                <div key={task.id} style={{
                  padding: '12px 14px',
                  background: '#161c24',
                  borderRadius: '8px',
                  border: '1px solid #1e2d3d',
                  transition: 'border-color 0.15s, transform 0.15s'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#2a3d52'
                    e.currentTarget.style.transform = 'translateX(3px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1e2d3d'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '7px', gap: '8px'
                  }}>
                    <span style={{
                      fontWeight: '600', fontSize: '14px', color: '#e8edf2',
                      flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {task.title}
                    </span>
                    <StatusBadge status={task.overdue ? 'OVERDUE' : task.status} />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <PriorityBadge priority={task.priority} />
                    <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '500' }}>
                      📁 {task.projectName}
                    </span>
                    {task.dueDate && (
                      <span style={{ fontSize: '12px', color: '#4a5a6a', marginLeft: 'auto' }}>
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
        <div style={{
          background: '#0d1117',
          border: '1px solid #1e2d3d',
          borderRadius: '12px',
          padding: '20px'
        }}>

          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '16px'
          }}>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '15px', fontWeight: '600', color: '#e8edf2',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>🗂</span> My Projects
            </div>
            <Link to="/projects" style={{
              fontSize: '13px', color: '#0ea5e9', fontWeight: '500',
              textDecoration: 'none', padding: '5px 10px',
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: '6px'
            }}>
              View all →
            </Link>
          </div>

          {!data?.myProjects?.length ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#4a5a6a', fontSize: '14px' }}>
              No projects yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.myProjects.map(project => {

                const pct = project.totalTasks > 0
                  ? Math.round((project.completedTasks / project.totalTasks) * 100)
                  : 0

                return (
                  <Link to={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '12px 14px',
                      background: '#161c24',
                      borderRadius: '8px',
                      border: '1px solid #1e2d3d',
                      transition: 'border-color 0.15s, transform 0.15s'
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#0ea5e9'
                        e.currentTarget.style.transform = 'translateX(3px)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#1e2d3d'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }}
                    >

                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '8px'
                      }}>
                        <span style={{
                          fontWeight: '600', fontSize: '14px', color: '#e8edf2',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1
                        }}>
                          {project.name}
                        </span>
                        <span style={{
                          fontSize: '12px', fontWeight: '700',
                          color: '#38bdf8',
                          background: 'rgba(14,165,233,0.1)',
                          border: '1px solid rgba(14,165,233,0.2)',
                          padding: '2px 8px', borderRadius: '6px',
                          marginLeft: '8px', whiteSpace: 'nowrap'
                        }}>
                          {pct}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{
                        height: '3px', background: '#1e2530',
                        borderRadius: '2px', marginBottom: '8px', overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #0ea5e9, #10b981)',
                          borderRadius: '2px',
                          transition: 'width 0.6s ease'
                        }} />
                      </div>

                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: '12px', color: '#4a5a6a'
                      }}>
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