import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
    { group: 'MAIN', items: [
        { to: '/',         label: 'Dashboard' },
        { to: '/meetings', label: 'Meetings' },
        { to: '/rooms',    label: 'Rooms' },
    ]},
    { group: 'MANAGE', items: [
        { to: '/contacts', label: 'Contacts' },
        { to: '/notes',    label: 'Notes' },
    ]}
]

const AVATAR_COLORS = ['#185FA5', '#3C3489', '#27500A', '#633806', '#72243E', '#085041']

export default function Sidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()
    const avatarBg = AVATAR_COLORS[(user?.id ?? 0) % AVATAR_COLORS.length]

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <aside style={{
            width: 210, minWidth: 210, background: 'white',
            borderRight: '0.5px solid rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', height: '100vh'
        }}>
            <div style={{ padding: '20px 16px 16px', fontSize: 16, fontWeight: 500, borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                <span style={{ color: '#185FA5' }}>hud</span>dle
            </div>

            <nav style={{ flex: 1, padding: '8px' }}>
                {links.map(group => (
                    <div key={group.group} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: '#9ca3af', padding: '8px 8px 4px', letterSpacing: '0.06em' }}>
                            {group.group}
                        </div>
                        {group.items.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                style={({ isActive }) => ({
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '8px 10px', borderRadius: 8,
                                    fontSize: 13, textDecoration: 'none',
                                    marginBottom: 2,
                                    background: isActive ? '#E6F1FB' : 'transparent',
                                    color: isActive ? '#0C447C' : '#6b7280',
                                    fontWeight: isActive ? 500 : 400
                                })}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', opacity: 0.6 }} />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)', padding: '12px 8px' }}>
                <NavLink to="/profile" style={{ textDecoration: 'none' }}>
                    {({ isActive }) => (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                            background: isActive ? '#E6F1FB' : 'transparent'
                        }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: '50%',
                                background: avatarBg, color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 600, flexShrink: 0
                            }}>
                                {initials || '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                    {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                                </div>
                            </div>
                        </div>
                    )}
                </NavLink>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%', marginTop: 4, padding: '7px 10px',
                        background: 'transparent', border: 'none',
                        borderRadius: 8, fontSize: 12, color: '#9ca3af',
                        cursor: 'pointer', textAlign: 'left'
                    }}>
                    Sign out
                </button>
            </div>
        </aside>
    )
}
