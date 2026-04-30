import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>
        Task<span>Flow</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/projects" className={({isActive}) => isActive ? 'active' : ''}>
          <span className="nav-icon">📁</span> Projects
        </NavLink>
        <NavLink to="/tasks" className={({isActive}) => isActive ? 'active' : ''}>
          <span className="nav-icon">✅</span> My Tasks
        </NavLink>
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role?.toLowerCase()}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">⏏</button>
      </div>
    </aside>
  )
}
