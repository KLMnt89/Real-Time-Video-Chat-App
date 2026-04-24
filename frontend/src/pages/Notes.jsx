import { useEffect, useState } from 'react'
import { meetingsApi, notesApi } from '../api'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'

export default function Notes() {
    const { user } = useAuth()
    const writtenBy = user ? `${user.firstName} ${user.lastName}` : 'admin'
    const [meetings, setMeetings] = useState([])
    const [selected, setSelected] = useState(null)
    const [notes, setNotes] = useState([])
    const [content, setContent] = useState('')
    const [editId, setEditId] = useState(null)
    const [editContent, setEditContent] = useState('')

    useEffect(() => { meetingsApi.getAll().then(r => setMeetings(r.data)) }, [])

    const selectMeeting = (m) => {
        setSelected(m)
        notesApi.getByMeeting(m.id).then(r => setNotes(r.data))
    }

    const handleAdd = async () => {
        if (!content.trim()) return
        await notesApi.create(selected.id, { content, writtenBy })
        setContent('')
        notesApi.getByMeeting(selected.id).then(r => setNotes(r.data))
    }

    const handleUpdate = async (noteId) => {
        await notesApi.update(selected.id, noteId, editContent)
        setEditId(null)
        notesApi.getByMeeting(selected.id).then(r => setNotes(r.data))
    }

    const handleDelete = async (noteId) => {
        await notesApi.delete(selected.id, noteId)
        notesApi.getByMeeting(selected.id).then(r => setNotes(r.data))
    }

    return (
        <div className="main-content">
            <TopBar title="Записници" />
            <div className="page">
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>

                    {/* Meeting list */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 500, borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                            Состаноци
                        </div>
                        {meetings.map(m => (
                            <div key={m.id}
                                 onClick={() => selectMeeting(m)}
                                 style={{
                                     padding: '12px 16px', cursor: 'pointer', fontSize: 13,
                                     borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                                     background: selected?.id === m.id ? '#E6F1FB' : 'transparent',
                                     color: selected?.id === m.id ? '#0C447C' : '#1a1a2e'
                                 }}>
                                <div style={{ fontWeight: 500 }}>{m.title}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                                    {m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('mk-MK') : '—'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Notes panel */}
                    <div>
                        {!selected ? (
                            <div className="card" style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>
                                Избери состанок за да ги видиш записниците
                            </div>
                        ) : (
                            <div>
                                <div className="card" style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{selected.title}</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{notes.length} записник/ци</div>
                                </div>

                                {notes.map(n => (
                                    <div key={n.id} className="card" style={{ marginBottom: 10 }}>
                                        {editId === n.id ? (
                                            <div>
                                                <textarea rows={3} value={editContent} onChange={e => setEditContent(e.target.value)} />
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                    <button className="btn btn-sm" onClick={() => setEditId(null)}>Откажи</button>
                                                    <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(n.id)}>Зачувај</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{n.content}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                                        {n.writtenBy} · {new Date(n.createdAt).toLocaleString('mk-MK')}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button className="btn btn-sm" onClick={() => { setEditId(n.id); setEditContent(n.content) }}>Уреди</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id)}>Избриши</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="card">
                                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Додај записник</div>
                                    <textarea rows={3} placeholder="Напиши записник..." value={content} onChange={e => setContent(e.target.value)} />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-primary btn-sm" onClick={handleAdd}>Додај</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}