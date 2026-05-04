import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { meetingsApi, contactsApi, roomsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'
import ConfirmModal from '../components/ConfirmModal'

function useCountdown(targetDate) {
    const [label, setLabel] = useState('')
    useEffect(() => {
        const calc = () => {
            if (!targetDate) return setLabel('')
            const diff = new Date(targetDate) - new Date()
            if (diff < 0)   return setLabel('passed')
            const mins = Math.floor(diff / 60000)
            if (mins === 0) return setLabel('now')
            if (mins < 60)  return setLabel(`in ${mins}m`)
            const hrs = Math.floor(mins / 60)
            if (hrs < 24)   return setLabel(`in ${hrs}h`)
            return setLabel(`in ${Math.floor(hrs / 24)}d`)
        }
        calc()
        const t = setInterval(calc, 30000)
        return () => clearInterval(t)
    }, [targetDate])
    return label
}

function CountdownBadge({ scheduledAt }) {
    const label = useCountdown(scheduledAt)
    if (!label) return null
    const mins   = scheduledAt ? Math.floor((new Date(scheduledAt) - new Date()) / 60000) : 999
    const urgent = mins >= 0 && mins < 60
    return (
        <span className="badge" style={{
            background: urgent ? 'var(--amber-light)' : 'var(--blue-light)',
            color:      urgent ? 'var(--amber-800)'   : 'var(--blue-800)',
        }}>
            {label}
        </span>
    )
}

function MeetingRow({ m, onStart, onEnd, onCancel, onDelete, onNotes }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '0.5px solid var(--color-border-tertiary)',
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {m.title}
                    </span>
                    {m.status === 'SCHEDULED' && <CountdownBadge scheduledAt={m.scheduledAt} />}
                    {m.status === 'CANCELLED' && (
                        <span className="badge" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>Cancelled</span>
                    )}
                    {m.status === 'ENDED' && (
                        <span className="badge" style={{ background: 'var(--color-background-secondary)', color: 'var(--color-text-muted)' }}>Ended</span>
                    )}
                </div>
                {m.description && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                        {m.description}
                    </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {m.scheduledAt
                        ? new Date(m.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    {(m.participants?.length ?? 0) > 0 && ` · ${m.participants.length} participant${m.participants.length !== 1 ? 's' : ''}`}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 16, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {m.status === 'ACTIVE' && m.room?.inviteCode && (
                    <button className="btn btn-sm btn-primary"
                        onClick={() => window.open(`/join/${m.room.inviteCode}`, '_blank')}>
                        Join
                    </button>
                )}
                {m.status === 'SCHEDULED' && (
                    <button className="btn btn-sm"
                        style={{ background: 'var(--green-light)', color: 'var(--green-800)', borderColor: 'transparent' }}
                        onClick={() => onStart(m.id)}>
                        Start
                    </button>
                )}
                {m.status === 'ACTIVE' && (
                    <button className="btn btn-sm"
                        style={{ background: 'var(--amber-light)', color: 'var(--amber-800)', borderColor: 'transparent' }}
                        onClick={() => onEnd(m.id)}>
                        End
                    </button>
                )}
                {m.status === 'SCHEDULED' && (
                    <button className="btn btn-sm"
                        style={{ background: 'var(--red-light)', color: 'var(--red)', borderColor: 'transparent' }}
                        onClick={() => onCancel(m.id)}>
                        Cancel
                    </button>
                )}
                <button className="btn btn-sm"
                    style={{ background: 'var(--violet-light)', color: 'var(--violet-800)', borderColor: 'transparent' }}
                    onClick={() => onNotes(m.id)}>
                    Notes
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => onDelete(m.id)}>Delete</button>
            </div>
        </div>
    )
}

export default function Meetings() {
    const { user } = useAuth()
    const navigate  = useNavigate()
    const createdBy = user ? `${user.firstName} ${user.lastName}` : 'admin'

    const [meetings,  setMeetings]  = useState([])
    const [contacts,  setContacts]  = useState([])
    const [filter,    setFilter]    = useState('upcoming')
    const [showModal, setShowModal] = useState(false)
    const [form,      setForm]      = useState({ title: '', description: '', scheduledAt: '', participantIds: [] })
    const [confirm,   setConfirm]   = useState(null)
    const [error,     setError]     = useState(null)

    const load = () => meetingsApi.getAll()
        .then(r => setMeetings(r.data))
        .catch(() => setError('Could not load meetings.'))

    useEffect(() => {
        load()
        contactsApi.getAll().then(r => setContacts(r.data)).catch(() => {})
    }, [])

    const activeMeetings   = meetings.filter(m => m.status === 'ACTIVE')
    const upcomingMeetings = meetings.filter(m => m.status === 'SCHEDULED')
    const endedMeetings    = meetings.filter(m => m.status === 'ENDED' || m.status === 'CANCELLED')

    const handleMeetNow = async () => {
        try {
            const now  = new Date()
            const name = `Huddle ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
            const res  = await roomsApi.create({ name, createdBy })
            window.open(`/join/${res.data.inviteCode}`, '_blank')
        } catch (e) {
            setError(e?.response?.status === 429
                ? 'Rate limit reached — max 10 rooms per hour.'
                : 'Could not start meeting.')
        }
    }

    const handleCreate = async () => {
        try {
            await meetingsApi.create({
                title: form.title, description: form.description,
                scheduledAt: form.scheduledAt, createdBy,
                participantIds: form.participantIds,
            })
            setShowModal(false)
            setForm({ title: '', description: '', scheduledAt: '', participantIds: [] })
            load()
        } catch { setError('Could not create meeting.') }
    }

    const handleStart = async (id) => {
        try {
            const res = await meetingsApi.start(id, { createdBy })
            load()
            const inviteCode = res.data.room?.inviteCode
            if (inviteCode) window.open(`/join/${inviteCode}`, '_blank')
        } catch { setError('Could not start meeting.') }
    }

    const handleEnd    = async (id) => { try { await meetingsApi.end(id);    load() } catch { setError('Could not end meeting.') } }
    const handleCancel = async (id) => { try { await meetingsApi.cancel(id); load() } catch { setError('Could not cancel meeting.') } }
    const handleDelete = (id) => setConfirm({ id, message: 'Delete this meeting?' })

    const confirmDelete = async () => {
        try { await meetingsApi.delete(confirm.id) } catch { setError('Could not delete meeting.') }
        setConfirm(null)
        load()
    }

    const toggleParticipant = (id) => setForm(f => ({
        ...f,
        participantIds: f.participantIds.includes(id)
            ? f.participantIds.filter(x => x !== id)
            : [...f.participantIds, id],
    }))

    const currentList = filter === 'upcoming' ? upcomingMeetings : endedMeetings

    const rowHandlers = {
        onStart:  handleStart,
        onEnd:    handleEnd,
        onCancel: handleCancel,
        onDelete: handleDelete,
        onNotes:  (id) => navigate(`/notes?meetingId=${id}`),
    }

    return (
        <div className="main-content">
            <TopBar title="Meetings" />

            <div className="page">
                {error && (
                    <div style={{
                        background: 'var(--red-light)', color: 'var(--red)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '10px 14px', fontSize: 13, marginBottom: 20,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        {error}
                        <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 18, lineHeight: 1, paddingLeft: 8 }}>×</button>
                    </div>
                )}

                {/* Hero buttons */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
                    <button className="btn-hero btn-hero-primary" onClick={handleMeetNow}>⚡ Meet now</button>
                    <button className="btn-hero" onClick={() => setShowModal(true)}>📅 Schedule meeting</button>
                </div>

                {/* Active section */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        {activeMeetings.length > 0 && (
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                                background: '#22c55e',
                                boxShadow: '0 0 0 0 rgba(34,197,94,0.4)',
                                animation: 'pulse 2s infinite',
                                display: 'inline-block',
                            }} />
                        )}
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                            Active
                        </span>
                        {activeMeetings.length > 0 && (
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>({activeMeetings.length})</span>
                        )}
                    </div>

                    {activeMeetings.length === 0 ? (
                        <div style={{
                            padding: '22px', borderRadius: 'var(--border-radius-md)',
                            border: '0.5px dashed var(--color-border-tertiary)',
                            color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center',
                        }}>
                            No active meetings right now
                        </div>
                    ) : (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {activeMeetings.map(m => (
                                <MeetingRow key={m.id} m={m} {...rowHandlers} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming / Ended toggle */}
                <div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                        <button
                            className={`filter-tab${filter === 'upcoming' ? ' active' : ''}`}
                            onClick={() => setFilter('upcoming')}>
                            Upcoming ({upcomingMeetings.length})
                        </button>
                        <button
                            className={`filter-tab${filter === 'ended' ? ' active' : ''}`}
                            onClick={() => setFilter('ended')}>
                            Ended ({endedMeetings.length})
                        </button>
                    </div>

                    {currentList.length === 0 ? (
                        <div style={{ padding: 36, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                            {filter === 'upcoming' ? 'No upcoming meetings' : 'No ended meetings'}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {currentList.map(m => (
                                <MeetingRow key={m.id} m={m} {...rowHandlers} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Schedule meeting</h3>
                        <input placeholder="Title" value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })} />
                        <textarea placeholder="Description (optional)" rows={3} value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })} />
                        <input type="datetime-local" value={form.scheduledAt}
                            onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
                        {contacts.length > 0 && (
                            <>
                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Participants</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                    {contacts.map(c => (
                                        <div key={c.id} onClick={() => toggleParticipant(c.id)}
                                            style={{
                                                padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                                                background: form.participantIds.includes(c.id) ? '#185FA5' : 'var(--color-background-secondary)',
                                                color:      form.participantIds.includes(c.id) ? '#fff'    : 'var(--color-text-secondary)',
                                                border: '0.5px solid var(--color-border-secondary)',
                                                transition: 'all 0.12s',
                                            }}>
                                            {c.firstName} {c.lastName}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={!form.title.trim()}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirm && (
                <ConfirmModal
                    message={confirm.message}
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    )
}
