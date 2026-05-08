import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { authApi } from '../api'

export default function Register() {
    const [form,    setForm]    = useState({ firstName: '', lastName: '', username: '', email: '', password: '' })
    const [error,   setError]   = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirectTo = searchParams.get('redirect') || ''

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await authApi.register(form)
            navigate(redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const field = (label, key, type = 'text', placeholder = '') => (
        <div>
            <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 5 }}>
                {label}
            </label>
            <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} />
        </div>
    )

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.6px', marginBottom: 6 }}>
                        <span style={{ color: '#185FA5' }}>hud</span>
                        <span style={{ color: 'var(--color-text-primary)' }}>dle</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Create a new account</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {field('First name', 'firstName', 'text', 'John')}
                        {field('Last name',  'lastName',  'text', 'Doe')}
                    </div>
                    {field('Username', 'username', 'text',     'john.doe')}
                    {field('Email',    'email',    'email',    'john@example.com')}
                    {field('Password', 'password', 'password', '••••••••')}

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
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '10px 0', fontSize: 13, marginTop: 4 }}>
                        {loading ? 'Registering…' : 'Create account'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#185FA5', textDecoration: 'none', fontWeight: 500 }}>
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
