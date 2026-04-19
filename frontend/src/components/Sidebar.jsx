import { NavLink } from 'react-router-dom'

const links = [
    { group: 'ГЛАВНО', items: [
            { to: '/', label: 'Dashboard' },
            { to: '/meetings', label: 'Состаноци' },
            { to: '/rooms', label: 'Соби' },
        ]},
    { group: 'УПРАВУВАЊЕ', items: [
            { to: '/contacts', label: 'Контакти' },
            { to: '/notes', label: 'Записници' },
        ]}
]

export default function Sidebar() {
    return (
        <aside style={{
            width: 210, minWidth: 210, background: 'white',
            borderRight: '0.5px solid rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', height: '100vh'
        }}>
            <div style={{ padding: '20px 16px 16px', fontSize: 16, fontWeight: 500, borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                <span style={{ color: '#185FA5' }}>meet</span>flow
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}>
                    <div className="avatar" style={{ background: '#E6F1FB', color: '#0C447C' }}>АП</div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>Александар П.</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>Admin</div>
                    </div>
                </div>
            </div>
        </aside>
    )
}