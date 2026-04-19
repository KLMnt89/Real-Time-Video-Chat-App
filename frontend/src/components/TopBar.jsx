export default function TopBar({ title, action }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 24px', background: 'white',
            borderBottom: '0.5px solid rgba(0,0,0,0.08)'
        }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{title}</div>
            {action && <div style={{ display: 'flex', gap: 8 }}>{action}</div>}
        </div>
    )
}