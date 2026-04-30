import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await loginApi(form)
      const { token, ...userData } = res.data
      login(userData, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#070b0f',
      backgroundImage: `
        radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.08) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.05) 0%, transparent 50%)
      `
    }}>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#0d1117',
        border: '1px solid #1e2d3d',
        borderRadius: '18px',
        padding: '44px 40px',
        boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
        margin: '20px'
      }}>

        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '24px',
          fontWeight: '800',
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '-0.5px'
        }}>
          🚀 Flow<span style={{ color: '#0ea5e9' }}>Board</span>
        </div>

        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#e8edf2',
          marginBottom: '6px',
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '-0.3px'
        }}>
          Welcome back
        </h1>

        <p style={{ color: '#8899aa', fontSize: '14px', marginBottom: '28px' }}>
          Sign in to your account to continue
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.25)',
            color: '#f43f5e',
            padding: '11px 14px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#8899aa',
              marginBottom: '7px'
            }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              style={{
                width: '100%',
                background: '#161c24',
                border: '1px solid #1e2d3d',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#e8edf2',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = '#0ea5e9'}
              onBlur={e => e.target.style.borderColor = '#1e2d3d'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#8899aa',
              marginBottom: '7px'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              style={{
                width: '100%',
                background: '#161c24',
                border: '1px solid #1e2d3d',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#e8edf2',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = '#0ea5e9'}
              onBlur={e => e.target.style.borderColor = '#1e2d3d'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#0284c7' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 12px rgba(14,165,233,0.25)',
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '0.01em',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { if (!loading) e.target.style.boxShadow = '0 4px 20px rgba(14,165,233,0.4)' }}
            onMouseLeave={e => { e.target.style.boxShadow = '0 2px 12px rgba(14,165,233,0.25)' }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '16px', height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite'
                }} />
                Signing in...
              </>
            ) : (
              'Sign in →'
            )}
          </button>

        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '22px',
          fontSize: '14px',
          color: '#8899aa'
        }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#38bdf8', fontWeight: '600', textDecoration: 'none' }}>
            Create one
          </Link>
        </div>

      </div>
    </div>
  )
}