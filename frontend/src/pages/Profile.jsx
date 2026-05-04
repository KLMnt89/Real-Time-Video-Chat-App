import { useState } from 'react'
import { usersApi } from '../api'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'

const AVATAR_COLORS = ['#185FA5', '#3C3489', '#27500A', '#633806', '#72243E', '#085041']

export default function Profile() {
    const { user, updateUser } = useAuth()
    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName:  user?.lastName  || '',
        username:  user?.username  || '',
        email:     user?.email     || '',
        password:  '',
    })
    const [saving,  setSaving]  = useState(false)
    const [success, setSuccess] = useState(false)
    const [error,   setError]   = useState(null)

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const initials = `${form.firstName?.[0] ?? ''}${form.lastName?.[0] ?? ''}`.toUpperCase()
    const avatarBg = AVATAR_COLORS[(user?.id ?? 0) % AVATAR_COLORS.length]

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)
        try {
            const payload = { ...form }
            if (!payload.password) delete payload.password
            const res = await usersApi.updateMe(payload)
            updateUser(res.data)
            setSuccess(true)
            setForm(f => ({ ...f, password: '' }))
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Error saving changes')
        } finally {
            setSaving(false)
        }
    }

    const label = (text, hint) => (
        <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 5 }}>
            {text} {hint && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>{hint}</span>}
        </label>
    )

    return (
        <div className="main-content">
            <TopBar title="Profile" />
            <div className="page">
                <div style={{ maxWidth: 500 }}>

                    {/* Avatar header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: avatarBg, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, fontWeight: 500, flexShrink: 0,
                        }}>
                            {initials || '?'}
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                {form.firstName} {form.lastName}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                                @{form.username} · {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <div>
                                    {label('First name')}
                                    <input value={form.firstName} onChange={set('firstName')} style={{ marginBottom: 0 }} />
                                </div>
                                <div>
                                    {label('Last name')}
                                    <input value={form.lastName} onChange={set('lastName')} style={{ marginBottom: 0 }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                {label('Username')}
                                <input value={form.username} onChange={set('username')} style={{ marginBottom: 0 }} />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                {label('Email')}
                                <input type="email" value={form.email} onChange={set('email')} style={{ marginBottom: 0 }} />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                {label('New password', '(leave blank to keep current)')}
                                <input type="password" value={form.password} onChange={set('password')}
                                    placeholder="••••••••" style={{ marginBottom: 0 }} />
                            </div>

                            {error && (
                                <div style={{
                                    background: 'var(--red-light)', color: 'var(--red)',
                                    borderRadius: 'var(--border-radius-md)',
                                    padding: '10px 14px', fontSize: 13, marginBottom: 14,
                                }}>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div style={{
                                    background: 'var(--green-light)', color: 'var(--green-800)',
                                    borderRadius: 'var(--border-radius-md)',
                                    padding: '10px 14px', fontSize: 13, marginBottom: 14,
                                }}>
                                    ✓ Changes saved
                                </div>
                            )}

                            <button type="submit" disabled={saving} className="btn btn-primary"
                                style={{ minWidth: 120 }}>
                                {saving ? 'Saving…' : 'Save changes'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
