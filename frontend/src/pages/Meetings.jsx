import { useEffect, useState } from 'react'
import { meetingsApi, contactsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'

export default function Meetings() {
    const { user } = useAuth()
    const createdBy = user ? `${user.firstName} ${user.lastName}` : 'admin'
    const [meetings, setMeetings] = useState([])
    const [contacts, setContacts] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ title: '', description: '', scheduledAt: '', participantIds: [] })

    const load = () => meetingsApi.getAll().then(r => setMeetings(r.data))

    useEffect(() => {
        load()
        contactsApi.getAll().then(r => setContacts(r.data))
    }, [])

    const handleCreate = async () => {
        await meetingsApi.create({
            title: form.title,
            description: form.description,
            scheduledAt: form.scheduledAt,
            createdBy,
            participantIds: form.participantIds
        })
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

    const handleEnd = async (id) => { await meetingsApi.end(id); load() }
    const handleCancel = async (id) => { await meetingsApi.cancel(id); load() }
    const handleDelete = async (id) => { if (confirm('Избриши состанок?')) { await meetingsApi.delete(id); load() } }

    const statusBadge = (s) => {
        const map = { ACTIVE: 'badge-active', SCHEDULED: 'badge-scheduled', ENDED: 'badge-ended', CANCELLED: 'badge-cancelled' }
        const label = { ACTIVE: 'Активен', SCHEDULED: 'Закажан', ENDED: 'Завршен', CANCELLED: 'Откажан' }
        return <span className={`badge ${map[s]}`}>{label[s]}</span>
    }

    const toggleParticipant = (id) => {
        setForm(f => ({
            ...f,
            participantIds: f.participantIds.includes(id)
                ? f.participantIds.filter(x => x !== id)
                : [...f.participantIds, id]
        }))
    }

    return (
        <div className="main-content">
            <TopBar title="Состаноци" action={
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Нов состанок</button>
            } />
            <div className="page">
                <div className="card">
                    <table>
                        <thead>
                        <tr>
                            <th>Наслов</th>
                            <th>Статус</th>
                            <th>Закажан</th>
                            <th>Учесници</th>
                            <th>Акции</th>
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
                                    {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('mk-MK') : '—'}
                                </td>
                                <td style={{ fontSize: 12 }}>{m.participants?.length ?? 0}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {m.status === 'SCHEDULED' && (
                                            <button className="btn btn-sm" style={{ background: '#E1F5EE', color: '#085041', border: 'none' }}
                                                    onClick={() => handleStart(m.id)}>
                                                Старт
                                            </button>
                                        )}
                                        {m.status === 'ACTIVE' && (
                                            <button className="btn btn-sm" style={{ background: '#FAEEDA', color: '#633806', border: 'none' }}
                                                    onClick={() => handleEnd(m.id)}>
                                                Заврши
                                            </button>
                                        )}
                                        {m.status === 'SCHEDULED' && (
                                            <button className="btn btn-sm" style={{ background: '#FCEBEB', color: '#A32D2D', border: 'none' }}
                                                    onClick={() => handleCancel(m.id)}>
                                                Откажи
                                            </button>
                                        )}
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>
                                            Избриши
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Нов состанок</h3>
                        <input placeholder="Наслов" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        <textarea placeholder="Опис" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Учесници:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                            {contacts.map(c => (
                                <div key={c.id}
                                     onClick={() => toggleParticipant(c.id)}
                                     style={{
                                         padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                                         background: form.participantIds.includes(c.id) ? '#185FA5' : '#f4f6f9',
                                         color: form.participantIds.includes(c.id) ? 'white' : '#6b7280',
                                         border: '0.5px solid rgba(0,0,0,0.1)'
                                     }}>
                                    {c.firstName} {c.lastName}
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowModal(false)}>Откажи</button>
                            <button className="btn btn-primary" onClick={handleCreate}>Креирај</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}