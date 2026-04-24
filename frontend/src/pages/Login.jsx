import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError]       = useState(null)
    const [loading, setLoading]   = useState(false)
    const { login } = useAuth()
    const navigate  = useNavigate()
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
            setError(err.response?.data?.error || 'Погрешно корисничко ime или лозинка')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#f4f6f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: 'white', borderRadius: 16, padding: 40,
                width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>
                        <span style={{ color: '#185FA5' }}>hud</span>dle
                    </div>
                    <div style={{ fontSize: 13, color: '#9ca3af' }}>Најавете се на вашиот акаунт</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                            Корисничко ime
                        </label>
                        <input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="username"
                            autoFocus
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                            Лозинка
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: '#FCEBEB', color: '#A32D2D',
                            borderRadius: 8, padding: '10px 14px',
                            fontSize: 13, marginBottom: 16
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !username.trim() || !password.trim()}
                        style={{
                            width: '100%', padding: 11,
                            background: loading ? '#9ca3af' : '#185FA5',
                            color: 'white', border: 'none', borderRadius: 8,
                            fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 500
                        }}>
                        {loading ? 'Најавување...' : 'Најави се'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
                    Немате акаунт?{' '}
                    <Link to="/register" style={{ color: '#185FA5', textDecoration: 'none', fontWeight: 500 }}>
                        Регистрирај се
                    </Link>
                </div>
            </div>
        </div>
    )
}
