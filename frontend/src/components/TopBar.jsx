import { useState } from 'react'

function ThemeToggle() {
    const getIsDark = () => {
        const attr = document.documentElement.getAttribute('data-theme')
        return attr === 'dark' || (!attr && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    const [dark, setDark] = useState(getIsDark)

    const toggle = () => {
        const next = !dark
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
        localStorage.setItem('huddle_theme', next ? 'dark' : 'light')
        setDark(next)
    }

    return (
        <button
            onClick={toggle}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
                width: 32, height: 18, borderRadius: 9, cursor: 'pointer',
                background: dark ? '#185FA5' : 'var(--color-border-secondary)',
                border: 'none', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
        >
            <span style={{
                position: 'absolute', top: 2,
                left: dark ? 16 : 2,
                width: 14, height: 14, borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8,
            }}>
                {dark ? '☾' : '☀'}
            </span>
        </button>
    )
}

export default function TopBar({ title, action }) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 20px',
            background: 'var(--color-background-primary)',
            borderBottom: '0.5px solid var(--color-border-tertiary)',
            flexShrink: 0,
        }}>
            <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                    {title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>
                    {today}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {action}
                <ThemeToggle />
            </div>
        </div>
    )
}
