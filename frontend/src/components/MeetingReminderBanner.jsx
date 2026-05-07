import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { meetingsApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function MeetingReminderBanner() {
    const { user } = useAuth()
    const navigate  = useNavigate()
    const createdBy = user ? `${user.firstName} ${user.lastName}` : ''
    const [popup, setPopup]       = useState(null)
    const [secondsLeft, setSecondsLeft] = useState(0)
    const [joining, setJoining]   = useState(false)
    const shownRef = useRef(new Set())
    const tickRef  = useRef(null)

    const check = useCallback(async () => {
        if (!user) return
        try {
            const res = await meetingsApi.getAll()
            const now = Date.now()
            for (const m of res.data) {
                if (m.status !== 'SCHEDULED' || !m.scheduledAt) continue
                if (shownRef.current.has(m.id)) continue
                const msLeft = new Date(m.scheduledAt).getTime() - now
                if (msLeft >= 0 && msLeft <= 30000) {
                    shownRef.current.add(m.id)
                    setPopup({ id: m.id, title: m.title })
                    setSecondsLeft(Math.floor(msLeft / 1000))
                    break
                }
            }
        } catch {}
    }, [user])

    useEffect(() => {
        if (!user) return
        check()
        const interval = setInterval(check, 5000)
        return () => clearInterval(interval)
    }, [user, check])

    useEffect(() => {
        if (!popup) return
        clearInterval(tickRef.current)
        tickRef.current = setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) {
                    clearInterval(tickRef.current)
                    setPopup(null)
                    return 0
                }
                return s - 1
            })
        }, 1000)
        return () => clearInterval(tickRef.current)
    }, [popup?.id])

    if (!popup) return null

    const urgent = secondsLeft <= 10

    return (
        <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            background: 'var(--color-background-card)',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: `1px solid ${urgent ? 'rgba(220,38,38,0.3)' : 'rgba(24,95,165,0.2)'}`,
            padding: '16px 20px',
            width: 300,
            animation: 'reminderSlideIn 0.25s ease',
        }}>
            <style>{`
                @keyframes reminderSlideIn {
                    from { opacity: 0; transform: translateX(24px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: urgent ? '#dc2626' : '#185FA5',
                        boxShadow: urgent ? '0 0 0 3px rgba(220,38,38,0.2)' : '0 0 0 3px rgba(24,95,165,0.15)',
                    }} />
                    <span style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: urgent ? '#dc2626' : '#185FA5',
                    }}>
                        Meeting starting soon
                    </span>
                </div>
                <button onClick={() => setPopup(null)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', fontSize: 20, lineHeight: 1,
                    padding: 0, marginLeft: 8,
                }}>×</button>
            </div>

            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                {popup.title}
            </div>

            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 14 }}>
                Starts in{' '}
                <span style={{ fontWeight: 700, color: urgent ? '#dc2626' : '#185FA5' }}>
                    {secondsLeft}s
                </span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px 0', fontSize: 13 }}
                    onClick={() => { setPopup(null); navigate('/meetings') }}>
                    View meeting
                </button>
                <button
                    className="btn"
                    style={{ padding: '8px 14px', fontSize: 13 }}
                    onClick={() => setPopup(null)}>
                    Dismiss
                </button>
            </div>
        </div>
    )
}
