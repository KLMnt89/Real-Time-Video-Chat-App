import { useEffect, useState } from 'react'
import { meetingsApi, contactsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'
import ConfirmModal from '../components/ConfirmModal'

function useCountdown(targetDate) {
    const [label, setLabel] = useState('')
    useEffect(() => {
        const calc = () => {
            if (!targetDate) return setLabel('')
            const diff = new Date(targetDate) - new Date()
            if (diff < 0)           return setLabel('passed')
            const mins = Math.floor(diff / 60000)
            if (mins === 0)         return setLabel('now')
            if (mins < 60)          return setLabel(`in ${mins}m`)
            const hrs = Math.floor(mins / 60)
            if (hrs < 24)           return setLabel(`in ${hrs}h`)
            const days = Math.floor(hrs / 24)
            return setLabel(`in ${days}d`)
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
    const mins  = scheduledAt ? Math.floor((new Date(scheduledAt) - new Date()) / 60000) : 999
    const urgent = mins >= 0 && mins < 60
    return (
        <span style={{
            fontSize: 11, padding: '2px 7px', borderRadius: 6, fontWeight: 600,
            background: urgent ? '#FAEEDA' : '#E6F1FB',
            color:      urgent ? '#633806' : '#0C447C',
            marginLeft: 6
        }}>
            {label}
        </span>
    )
}

export default function Meetings() {
    const { user } = useAuth()
    const createdBy = user ? `${user.firstName} ${user.lastName}` : 'admin'

    const [meetings,   setMeetings]   = useState([])
    const [contacts,   setContacts]   = useState([])
    const [showModal,  setShowModal]  = useState(false)
    const [form,       setForm]       = useState({ title: '', description: '', scheduledAt: '', participantIds: [] })
    const [confirm,    setConfirm]    = useState(null)

    const load = () => meetingsApi.getAll().then(r => setMeetings(r.data))

    useEffect(() => {
        load()
        contactsApi.getAll().then(r => setContacts(r.data))
    }, [])

    const handleCreate = async () => {
        await meetingsApi.create({ title: form.title, description: form.description, scheduledAt: form.scheduledAt, createdBy, participantIds: form.participantIds })
        setShowModal(false)
        setForm({ title: '', description: '', scheduledAt: '', participantIds: [] })
        load()
    }

    const handleStart = async (id) => {
        const res = await meetingsApi.start(id, { createdBy })
        load()
        const inviteCode = res.data.room?.inviteCode
        if (inviteCode) window.open(`/join/${inviteCode}`, '_blank')
    }

    const handleEnd    = async (id) => { await meetingsApi.end(id);    load() }
    const handleCancel = async (id) => { await meetingsApi.cancel(id); load() }

    const handleDelete = (id) => {
        setConfirm({ id, message: 'Are you sure you want to delete this meeting?' })
    }

    const confirmDelete = async () => {
        await meetingsApi.delete(confirm.id)
        setConfirm(null)
        load()
    }

    const toggleParticipant = (id) => {
        setForm(f => ({
            ...f,
            participantIds: f.participantIds.includes(id)
                ? f.participantIds.filter(x => x !== id)
                : [...f.participantIds, id]
        }))
    }

    const statusBadge = (s) => {
        const map   = { ACTIVE: 'badge-active', SCHEDULED: 'badge-scheduled', ENDED: 'badge-ended', CANCELLED: 'badge-cancelled' }
        const label = { ACTIVE: 'Active', SCHEDULED: 'Scheduled', ENDED: 'Ended', CANCELLED: 'Cancelled' }
        return <span className={`badge ${map[s]}`}>{label[s]}</span>
    }

    return (
        <div className="main-content">
            <TopBar title="Meetings" action={
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New meeting</button>
            } />
            <div className="page">
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Scheduled</th>
                                <th>Participants</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meetings.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{m.title}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{m.description}</div>
                                    </td>
                                    <td>{statusBadge(m.status)}</td>
                                    <td style={{ fontSize: 12, color: '#6b7280' }}>
                                        {m.scheduledAt
                                            ? <>
                                                {new Date(m.scheduledAt).toLocaleString('en-US')}
                                                {m.status === 'SCHEDULED' && <CountdownBadge scheduledAt={m.scheduledAt} />}
                                              </>
                                            : '—'
                                        }
                                    </td>
                                    <td style={{ fontSize: 12 }}>{m.participants?.length ?? 0}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {m.status === 'ACTIVE' && m.room?.inviteCode && (
                                                <button className="btn btn-sm btn-primary"
                                                    onClick={() => window.open(`/join/${m.room.inviteCode}`, '_blank')}>
                                                    Join
                                                </button>
                                            )}
                                            {m.status === 'SCHEDULED' && (
                                                <button className="btn btn-sm" style={{ background: '#E1F5EE', color: '#085041', border: 'none' }}
                                                    onClick={() => handleStart(m.id)}>
                                                    Start
                                                </button>
                                            )}
                                            {m.status === 'ACTIVE' && (
                                                <button className="btn btn-sm" style={{ background: '#FAEEDA', color: '#633806', border: 'none' }}
                                                    onClick={() => handleEnd(m.id)}>
                                                    End
                                                </button>
                                            )}
                                            {m.status === 'SCHEDULED' && (
                                                <button className="btn btn-sm" style={{ background: '#FCEBEB', color: '#A32D2D', border: 'none' }}
                                                    onClick={() => handleCancel(m.id)}>
                                                    Cancel
                                                </button>
                                            )}
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {meetings.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ color: '#9ca3af', textAlign: 'center', padding: 32 }}>
                                        No meetings
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>New meeting</h3>
                        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        <textarea placeholder="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Participants:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                            {contacts.map(c => (
                                <div key={c.id} onClick={() => toggleParticipant(c.id)}
                                    style={{
                                        padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                                        background: form.participantIds.includes(c.id) ? '#185FA5' : '#f4f6f9',
                                        color:      form.participantIds.includes(c.id) ? 'white'   : '#6b7280',
                                        border: '0.5px solid rgba(0,0,0,0.1)'
                                    }}>
                                    {c.firstName} {c.lastName}
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate}>Create</button>
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
