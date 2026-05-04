import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavIcon({ type }) {
    const p = {
        width: 15, height: 15, viewBox: '0 0 14 14',
        fill: 'none', stroke: 'currentColor', strokeWidth: '1.5',
        strokeLinecap: 'round', strokeLinejoin: 'round',
    }
    if (type === 'overview') return (
        <svg {...p}><path d="M1.5 6.5L7 1.5L12.5 6.5V12.5H9V9.5H5V12.5H1.5V6.5Z" /></svg>
    )
    if (type === 'meetings') return (
        <svg {...p}>
            <rect x="1.5" y="2" width="11" height="10.5" rx="1.5" />
            <line x1="1.5" y1="5.5" x2="12.5" y2="5.5" />
            <line x1="4.5" y1="0.5" x2="4.5" y2="3.5" />
            <line x1="9.5" y1="0.5" x2="9.5" y2="3.5" />
        </svg>
    )
    if (type === 'contacts') return (
        <svg {...p}>
            <circle cx="5" cy="4.5" r="2.5" />
            <path d="M0.5 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
            <circle cx="10.5" cy="5" r="1.8" />
            <path d="M13.5 12.5c0-1.8-1.2-3.3-2.8-3.5" />
        </svg>
    )
    if (type === 'groups') return (
        <svg {...p}>
            <circle cx="4" cy="4" r="2" />
            <circle cx="10" cy="4" r="2" />
            <circle cx="7" cy="9" r="2" />
            <line x1="4" y1="6" x2="7" y2="7" />
            <line x1="10" y1="6" x2="7" y2="7" />
        </svg>
    )
    if (type === 'notes') return (
        <svg {...p}>
            <rect x="2.5" y="0.5" width="9" height="13" rx="1.5" />
            <line x1="5" y1="4.5" x2="9" y2="4.5" />
            <line x1="5" y1="7" x2="9" y2="7" />
            <line x1="5" y1="9.5" x2="7.5" y2="9.5" />
        </svg>
    )
    if (type === 'calendar') return (
        <svg {...p}>
            <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" />
            <line x1="1.5" y1="6" x2="12.5" y2="6" />
            <line x1="4.5" y1="1" x2="4.5" y2="4" />
            <line x1="9.5" y1="1" x2="9.5" y2="4" />
            <circle cx="4.5" cy="9" r="0.8" fill="currentColor" stroke="none" />
            <circle cx="7" cy="9" r="0.8" fill="currentColor" stroke="none" />
        </svg>
    )
    return null
}

const LINKS = [
    { to: '/',          label: 'Overview',  icon: 'overview',  end: true },
    { to: '/meetings',  label: 'Meetings',  icon: 'meetings' },
    { to: '/contacts',  label: 'Contacts',  icon: 'contacts' },
    { to: '/groups',    label: 'Groups',    icon: 'groups' },
    { to: '/notes',     label: 'Notes',     icon: 'notes' },
    { to: '/#calendar', label: 'Calendar',  icon: 'calendar',  noActive: true },
]

const AVATAR_COLORS = ['#185FA5', '#3C3489', '#27500A', '#633806', '#72243E', '#085041']

export default function Sidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()
    const avatarBg  = AVATAR_COLORS[(user?.id ?? 0) % AVATAR_COLORS.length]

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <aside style={{
            width: 218, minWidth: 218,
            background: 'var(--color-background-primary)',
            borderRight: '0.5px solid var(--color-border-tertiary)',
            display: 'flex', flexDirection: 'column', height: '100vh',
            flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{
                padding: '22px 16px 18px',
                textAlign: 'center',
                borderBottom: '0.5px solid var(--color-border-tertiary)',
            }}>
                <div style={{ fontSize: 23, fontWeight: 500, letterSpacing: '-0.7px', lineHeight: 1 }}>
                    <span style={{ color: '#185FA5' }}>hud</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>dle</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 5 }}>
                    Video meetings, simplified
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '10px 8px' }}>
                {LINKS.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 9,
                            padding: '9px 10px',
                            borderRadius: 'var(--border-radius-md)',
                            fontSize: 14, textDecoration: 'none',
                            marginBottom: 3,
                            background: (!item.noActive && isActive) ? 'var(--blue-light)' : 'transparent',
                            color: (!item.noActive && isActive) ? 'var(--blue-800)' : 'var(--color-text-secondary)',
                            fontWeight: (!item.noActive && isActive) ? 500 : 400,
                            transition: 'background 0.12s, color 0.12s',
                        })}
                    >
                        <NavIcon type={item.icon} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Profile */}
            <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', padding: '10px 8px 12px' }}>
                <NavLink to="/profile" style={{ textDecoration: 'none' }}>
                    {({ isActive }) => (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 10px', borderRadius: 'var(--border-radius-md)',
                            cursor: 'pointer',
                            background: isActive ? 'var(--blue-light)' : 'transparent',
                            transition: 'background 0.12s',
                        }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: '50%',
                                background: avatarBg, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 500, flexShrink: 0,
                            }}>
                                {initials || '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                                    {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                                </div>
                            </div>
                        </div>
                    )}
                </NavLink>
                <button onClick={handleLogout} style={{
                    width: '100%', marginTop: 2, padding: '6px 10px',
                    background: 'transparent', border: 'none',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 12, color: 'var(--color-text-muted)',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}>
                    Sign out
                </button>
            </div>
        </aside>
    )
}
