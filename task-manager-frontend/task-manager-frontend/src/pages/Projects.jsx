import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProjects, createProject, deleteProject } from '../services/api'
import { useAuth } from '../context/AuthContext'

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createProject(form)
      onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">New Project</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input className="form-input" placeholder="e.g. Website Redesign"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="What is this project about?"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const { user } = useAuth()

  const fetchProjects = () => {
    getProjects().then(r => setProjects(r.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [])

  const handleDelete = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this project? This cannot be undone.')) return
    try {
      await deleteProject(id)
      setProjects(projects.filter(p => p.id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project')
    }
  }

  if (loading) return <div className="loading"><span className="spinner"></span> Loading projects...</div>

  return (
    <div className="page-container page-enter">
      <div className="topbar" style={{padding:'16px 0', background:'transparent', border:'none', position:'relative', marginBottom:8}}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <div className="empty-title">No projects yet</div>
          <div className="empty-text">Create your first project to get started</div>
          {user?.role === 'ADMIN' && (
            <button className="btn btn-primary" style={{marginTop:16}} onClick={() => setShowCreate(true)}>
              + Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const pct = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0
            return (
              <Link to={`/projects/${project.id}`} key={project.id} style={{textDecoration:'none'}}>
                <div className="project-card">
                  <div className="project-card-header">
                    <div className="project-name">{project.name}</div>
                    {user?.role === 'ADMIN' && (
                      <button className="btn btn-danger btn-sm btn-icon"
                        onClick={(e) => handleDelete(e, project.id)}
                        style={{padding:'4px 8px', fontSize:14}}>🗑</button>
                    )}
                  </div>
                  <div className="project-desc">{project.description || 'No description provided.'}</div>
                  <div className="project-progress">
                    <div className="project-progress-bar" style={{width:`${pct}%`}}></div>
                  </div>
                  <div className="project-meta">
                    <span style={{color:'var(--accent2)', fontWeight:600}}>{pct}% complete</span>
                    <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                    <span>{project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={fetchProjects} />}
    </div>
  )
}
