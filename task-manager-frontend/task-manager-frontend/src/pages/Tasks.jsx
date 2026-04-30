import { useState, useEffect } from 'react'
import { getTasks, updateTaskStatus, deleteTask, getProjects, createTask } from '../services/api'
import { useAuth } from '../context/AuthContext'

function StatusBadge({ status, overdue }) {
  if (overdue) return <span className="badge badge-overdue">Overdue</span>
  const map = { TODO: ['badge-todo','To Do'], IN_PROGRESS: ['badge-inprogress','In Progress'], COMPLETED: ['badge-completed','Done'] }
  const [cls, label] = map[status] || ['badge-todo', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

function PriorityBadge({ priority }) {
  const map = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
  return <span className={`badge ${map[priority] || ''}`}>{priority}</span>
}

function CreateTaskModal({ onClose, onCreated }) {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', projectId: '', assignedToUserId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { getProjects().then(r => setProjects(r.data)).catch(console.error) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.projectId) { setError('Please select a project'); return }
    setLoading(true)
    try {
      const payload = { ...form, projectId: Number(form.projectId), assignedToUserId: form.assignedToUserId ? Number(form.assignedToUserId) : null }
      if (!payload.dueDate) delete payload.dueDate
      await createTask(payload)
      onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth:520}}>
        <div className="modal-header">
          <div className="modal-title">New Task</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input className="form-input" placeholder="e.g. Design homepage"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select className="form-select" value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} required>
                <option value="">Select a project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Task details..."
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="two-col">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date"
                  value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To (User ID)</label>
              <input className="form-input" type="number" placeholder="User ID (optional)"
                value={form.assignedToUserId} onChange={e => setForm({...form, assignedToUserId: e.target.value})} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const { user } = useAuth()

  const fetchTasks = () => {
    getTasks().then(r => setTasks(r.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchTasks() }, [])

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status)
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t))
    } catch { alert('Failed to update status') }
  }

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch { alert('Failed to delete task') }
  }

  const filtered = filter === 'ALL' ? tasks : filter === 'OVERDUE'
    ? tasks.filter(t => t.overdue)
    : tasks.filter(t => t.status === filter)

  if (loading) return <div className="loading"><span className="spinner"></span> Loading tasks...</div>

  return (
    <div className="page-container page-enter">
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20}}>
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Task</button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex', gap:8, marginBottom:20, flexWrap:'wrap'}}>
        {['ALL','TODO','IN_PROGRESS','COMPLETED','OVERDUE'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{fontSize:12}}>
            {f === 'ALL' ? `All (${tasks.length})` :
             f === 'TODO' ? `To Do (${tasks.filter(t=>t.status==='TODO').length})` :
             f === 'IN_PROGRESS' ? `In Progress (${tasks.filter(t=>t.status==='IN_PROGRESS').length})` :
             f === 'COMPLETED' ? `Done (${tasks.filter(t=>t.status==='COMPLETED').length})` :
             `Overdue (${tasks.filter(t=>t.overdue).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <div className="empty-title">No tasks found</div>
          <div className="empty-text">
            {filter === 'ALL' ? 'No tasks assigned to you yet' : `No ${filter.toLowerCase()} tasks`}
          </div>
        </div>
      ) : (
        <div className="card" style={{padding:0}}>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Task</th><th>Project</th><th>Priority</th><th>Status</th><th>Due Date</th>
                {user?.role === 'ADMIN' && <th>Actions</th>}
              </tr></thead>
              <tbody>
                {filtered.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className="td-main">{task.title}</div>
                      {task.description && <div style={{fontSize:12, color:'var(--text3)', marginTop:2}}>{task.description.slice(0,50)}...</div>}
                    </td>
                    <td><span style={{color:'var(--accent2)', fontWeight:500}}>{task.projectName}</span></td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td>
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        style={{background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:6, padding:'4px 8px', fontSize:13, cursor:'pointer'}}>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td>
                      {task.dueDate
                        ? <span style={{color: task.overdue ? 'var(--red)' : 'var(--text2)', fontWeight: task.overdue ? 600 : 400}}>
                            {task.overdue ? '⚠ ' : ''}{task.dueDate}
                          </span>
                        : '—'}
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={fetchTasks} />}
    </div>
  )
}
