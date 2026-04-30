import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProject, addMember, removeMember, getTasksByProject, createTask, updateTaskStatus, deleteTask } from '../services/api'
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

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [form, setForm] = useState({ email: '', role: 'MEMBER' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addMember(projectId, form)
      onAdded()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Add Member</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Member Email *</label>
              <input className="form-input" type="email" placeholder="member@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateTaskModal({ projectId, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', projectId, assignedToUserId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, assignedToUserId: form.assignedToUserId ? Number(form.assignedToUserId) : null }
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

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  const fetchAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([getProject(id), getTasksByProject(id)])
      setProject(pRes.data)
      setTasks(tRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [id])

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status)
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t))
    } catch (err) { alert('Failed to update status') }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (err) { alert('Failed to delete task') }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await removeMember(id, userId)
      fetchAll()
    } catch (err) { alert(err.response?.data?.message || 'Failed to remove member') }
  }

  if (loading) return <div className="loading"><span className="spinner"></span> Loading project...</div>
  if (!project) return <div className="page-container"><div className="alert alert-error">Project not found</div></div>

  const pct = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0

  return (
    <div className="page-container page-enter">
      <div style={{marginBottom:24}}>
        <Link to="/projects" style={{color:'var(--text3)', fontSize:14, display:'inline-flex', alignItems:'center', gap:6, marginBottom:12}}>
          ← Back to Projects
        </Link>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16}}>
          <div>
            <h1 className="page-title">{project.name}</h1>
            <p className="page-subtitle">{project.description || 'No description'}</p>
            <p style={{fontSize:12, color:'var(--text3)', marginTop:4}}>Created by {project.createdByName}</p>
          </div>
          <div style={{display:'flex', gap:10, flexShrink:0}}>
            {user?.role === 'ADMIN' && (
              <>
                <button className="btn btn-secondary" onClick={() => setShowAddMember(true)}>+ Add Member</button>
                <button className="btn btn-primary" onClick={() => setShowCreateTask(true)}>+ New Task</button>
              </>
            )}
          </div>
        </div>

        <div style={{marginTop:16, display:'flex', gap:24}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:22, fontWeight:800, color:'var(--accent2)', fontFamily:'var(--font-display)'}}>{project.totalTasks}</div>
            <div style={{fontSize:11, color:'var(--text3)'}}>Total Tasks</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:22, fontWeight:800, color:'var(--green)', fontFamily:'var(--font-display)'}}>{project.completedTasks}</div>
            <div style={{fontSize:11, color:'var(--text3)'}}>Completed</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:22, fontWeight:800, color:'var(--text)', fontFamily:'var(--font-display)'}}>{project.members?.length}</div>
            <div style={{fontSize:11, color:'var(--text3)'}}>Members</div>
          </div>
          <div style={{flex:1, alignSelf:'center'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text3)', marginBottom:6}}>
              <span>Progress</span><span style={{color:'var(--accent2)'}}>{pct}%</span>
            </div>
            <div className="project-progress" style={{marginBottom:0}}>
              <div className="project-progress-bar" style={{width:`${pct}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--border)', paddingBottom:0}}>
        {['tasks','members'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{padding:'8px 20px', background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:600,
              color: activeTab === tab ? 'var(--accent2)' : 'var(--text3)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              textTransform:'capitalize', transition:'all 0.15s', marginBottom:'-1px'}}>
            {tab} {tab === 'tasks' ? `(${tasks.length})` : `(${project.members?.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <div className="empty-title">No tasks yet</div>
              <div className="empty-text">Create the first task for this project</div>
            </div>
          ) : (
            <div className="card" style={{padding:0}}>
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>Task</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Due Date</th>
                    {user?.role === 'ADMIN' && <th>Actions</th>}
                  </tr></thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <div className="td-main">{task.title}</div>
                          {task.description && <div style={{fontSize:12, color:'var(--text3)', marginTop:2}}>{task.description.slice(0,60)}{task.description.length > 60 ? '...' : ''}</div>}
                        </td>
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
                        <td>{task.assignedToName || <span style={{color:'var(--text3)'}}>Unassigned</span>}</td>
                        <td>{task.dueDate ? <span style={{color: task.overdue ? 'var(--red)' : 'var(--text2)'}}>{task.dueDate}</span> : '—'}</td>
                        {user?.role === 'ADMIN' && (
                          <td>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'members' && (
        <div className="members-list">
          {project.members?.map(member => (
            <div className="member-item" key={member.userId}>
              <div className="member-info">
                <div className="member-avatar">{member.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="member-name">{member.name}</div>
                  <div className="member-email">{member.email}</div>
                </div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span className={`badge ${member.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>{member.role}</span>
                {user?.role === 'ADMIN' && member.userId !== user.userId && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(member.userId)}>Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddMember && <AddMemberModal projectId={id} onClose={() => setShowAddMember(false)} onAdded={fetchAll} />}
      {showCreateTask && <CreateTaskModal projectId={Number(id)} onClose={() => setShowCreateTask(false)} onCreated={fetchAll} />}
    </div>
  )
}
