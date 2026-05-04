import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error,    setError]    = useState(null)
    const [loading,  setLoading]  = useState(false)
    const { login }  = useAuth()
    const navigate   = useNavigate()
    const [searchParams] = useSearchParams()
    const redirectTo = searchParams.get('redirect') || '/'

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username.trim() || !password.trim()) return
        setLoading(true)
        setError(null)
        try {
            const res = await authApi.login({ username, password })
            const { token, refreshToken, ...userData } = res.data
            login(userData, token, refreshToken)
            navigate(redirectTo, { replace: true })
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid username or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.6px', marginBottom: 6 }}>
                        <span style={{ color: '#185FA5' }}>hud</span>
                        <span style={{ color: 'var(--color-text-primary)' }}>dle</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Sign in to your account</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 5 }}>
                            Username
                        </label>
                        <input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="username"
                            autoFocus
                            style={{ marginBottom: 0 }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 5 }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ marginBottom: 0 }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'var(--red-light)', color: 'var(--red)',
                            borderRadius: 'var(--border-radius-md)',
                            padding: '10px 14px', fontSize: 13, marginBottom: 16,
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !username.trim() || !password.trim()}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '10px 0', fontSize: 13 }}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#185FA5', textDecoration: 'none', fontWeight: 500 }}>
                        Register
                    </Link>
                </div>
            </div>
        </div>
    )
}
