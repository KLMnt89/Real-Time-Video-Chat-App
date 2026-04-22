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
        password:  ''
    })
    const [saving, setSaving]   = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError]     = useState(null)

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
            setError(err.response?.data?.error || 'Грешка при зачувување')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="main-content">
            <TopBar title="Профил" />
            <div className="page">
                <div style={{ maxWidth: 520 }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: avatarBg, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 26, fontWeight: 600, flexShrink: 0
                        }}>
                            {initials || '?'}
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 600 }}>
                                {form.firstName} {form.lastName}
                            </div>
                            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
                                @{form.username} · {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Корисник'}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>Ime</label>
                                    <input value={form.firstName} onChange={set('firstName')} style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>Презime</label>
                                    <input value={form.lastName} onChange={set('lastName')} style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>Корисничко ime</label>
                                <input value={form.username} onChange={set('username')} style={{ width: '100%', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>Email</label>
                                <input type="email" value={form.email} onChange={set('email')} style={{ width: '100%', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                                    Нова лозинка <span style={{ color: '#b0b0b0' }}>(остави празно за да не менуваш)</span>
                                </label>
                                <input type="password" value={form.password} onChange={set('password')}
                                       placeholder="••••••••" style={{ width: '100%', boxSizing: 'border-box' }} />
                            </div>

                            {error && (
                                <div style={{
                                    background: '#FCEBEB', color: '#A32D2D',
                                    borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14
                                }}>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div style={{
                                    background: '#E1F5EE', color: '#085041',
                                    borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14
                                }}>
                                    ✓ Промените се зачувани
                                </div>
                            )}

                            <button type="submit" disabled={saving} className="btn btn-primary"
                                    style={{ minWidth: 120 }}>
                                {saving ? 'Зачувување...' : 'Зачувај промени'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
