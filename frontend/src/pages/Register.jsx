import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'

export default function Register() {
    const [form, setForm]     = useState({ firstName: '', lastName: '', username: '', email: '', password: '' })
    const [error, setError]   = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await authApi.register(form)
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const field = (label, key, type = 'text', placeholder = '') => (
        <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                {label}
            </label>
            <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                   style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
    )

    return (
        <div style={{
            minHeight: '100vh', background: '#f4f6f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: 'white', borderRadius: 16, padding: 40,
                width: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>
                        <span style={{ color: '#185FA5' }}>hud</span>dle
                    </div>
                    <div style={{ fontSize: 13, color: '#9ca3af' }}>Create a new account</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {field('First name', 'firstName', 'text', 'John')}
                        {field('Last name', 'lastName', 'text', 'Doe')}
                    </div>
                    {field('Username', 'username', 'text', 'john.doe')}
                    {field('Email', 'email', 'email', 'john@example.com')}
                    {field('Password', 'password', 'password', '••••••••')}

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
                        disabled={loading}
                        style={{
                            width: '100%', padding: 11,
                            background: loading ? '#9ca3af' : '#185FA5',
                            color: 'white', border: 'none', borderRadius: 8,
                            fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 500
                        }}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#185FA5', textDecoration: 'none', fontWeight: 500 }}>
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
