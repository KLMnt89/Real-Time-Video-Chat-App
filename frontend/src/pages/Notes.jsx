import { useEffect, useState } from 'react'
import { meetingsApi, notesApi, roomsApi, roomNoteApi } from '../api'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'
import ConfirmModal from '../components/ConfirmModal'

export default function Notes() {
    const { user } = useAuth()
    const writtenBy = user ? `${user.firstName} ${user.lastName}` : 'admin'

    const [tab, setTab] = useState('meetings')

    // Meetings tab
    const [meetings,     setMeetings]     = useState([])
    const [selMeeting,   setSelMeeting]   = useState(null)
    const [notes,        setNotes]        = useState([])
    const [noteContent,  setNoteContent]  = useState('')
    const [editId,       setEditId]       = useState(null)
    const [editContent,  setEditContent]  = useState('')
    const [confirm,      setConfirm]      = useState(null)

    // Rooms tab
    const [rooms,        setRooms]        = useState([])
    const [selRoom,      setSelRoom]      = useState(null)
    const [roomNote,     setRoomNote]     = useState('')
    const [roomNoteSaved,setRoomNoteSaved]= useState(false)
    const [savingRoom,   setSavingRoom]   = useState(false)

    useEffect(() => { meetingsApi.getAll().then(r => setMeetings(r.data)) }, [])
    useEffect(() => { if (tab === 'rooms') roomsApi.getAll().then(r => setRooms(r.data)) }, [tab])

    // ── Meetings tab ─────────────────────────────────────────────────────────

    const selectMeeting = (m) => {
        setSelMeeting(m)
        notesApi.getByMeeting(m.id).then(r => setNotes(r.data))
    }

    const handleAddNote = async () => {
        if (!noteContent.trim()) return
        await notesApi.create(selMeeting.id, { content: noteContent, writtenBy })
        setNoteContent('')
        notesApi.getByMeeting(selMeeting.id).then(r => setNotes(r.data))
    }

    const handleUpdateNote = async (noteId) => {
        await notesApi.update(selMeeting.id, noteId, editContent)
        setEditId(null)
        notesApi.getByMeeting(selMeeting.id).then(r => setNotes(r.data))
    }

    const handleDeleteNote = (noteId) => {
        setConfirm({ action: 'note', noteId, message: 'Are you sure you want to delete this note?' })
    }

    const confirmAction = async () => {
        if (confirm.action === 'note') {
            await notesApi.delete(selMeeting.id, confirm.noteId)
            notesApi.getByMeeting(selMeeting.id).then(r => setNotes(r.data))
        }
        setConfirm(null)
    }

    // ── Rooms tab ────────────────────────────────────────────────────────────

    const selectRoom = async (r) => {
        setSelRoom(r)
        setRoomNoteSaved(false)
        try {
            const res = await roomNoteApi.getNote(r.id)
            setRoomNote(res.data?.content ?? '')
        } catch {
            setRoomNote('')
        }
    }

    const handleSaveRoomNote = async () => {
        setSavingRoom(true)
        try {
            await roomNoteApi.saveNote(selRoom.id, roomNote, writtenBy)
            setRoomNoteSaved(true)
            setTimeout(() => setRoomNoteSaved(false), 2500)
        } finally {
            setSavingRoom(false)
        }
    }

    // ── render ───────────────────────────────────────────────────────────────

    const TAB_STYLE = (active) => ({
        padding: '7px 16px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
        border: '0.5px solid rgba(0,0,0,0.12)', fontWeight: active ? 600 : 400,
        background: active ? '#185FA5' : 'white',
        color:      active ? 'white'   : '#6b7280',
        transition: 'all 0.12s',
    })

    return (
        <div className="main-content">
            <TopBar title="Notes" />
            <div className="page">

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    <button style={TAB_STYLE(tab === 'meetings')} onClick={() => setTab('meetings')}>Meetings</button>
                    <button style={TAB_STYLE(tab === 'rooms')}    onClick={() => setTab('rooms')}>Rooms</button>
                </div>

                {/* ── Meetings tab ── */}
                {tab === 'meetings' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, borderBottom: '0.5px solid rgba(0,0,0,0.08)', color: '#6b7280' }}>
                                Meetings
                            </div>
                            {meetings.length === 0 && (
                                <div style={{ padding: '16px', fontSize: 12, color: '#9ca3af' }}>No meetings</div>
                            )}
                            {meetings.map(m => (
                                <div key={m.id} onClick={() => selectMeeting(m)}
                                    style={{
                                        padding: '12px 16px', cursor: 'pointer', fontSize: 13,
                                        borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                                        background: selMeeting?.id === m.id ? '#E6F1FB' : 'transparent',
                                        color:      selMeeting?.id === m.id ? '#0C447C'  : '#1a1a2e',
                                    }}>
                                    <div style={{ fontWeight: 500 }}>{m.title}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                                        {m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('en-US') : '—'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            {!selMeeting ? (
                                <div className="card" style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>
                                    Select a meeting to view notes
                                </div>
                            ) : (
                                <div>
                                    <div className="card" style={{ marginBottom: 12 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{selMeeting.title}</div>
                                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{notes.length} note(s)</div>
                                    </div>

                                    {notes.map(n => (
                                        <div key={n.id} className="card" style={{ marginBottom: 10 }}>
                                            {editId === n.id ? (
                                                <div>
                                                    <textarea rows={3} value={editContent} onChange={e => setEditContent(e.target.value)} />
                                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                        <button className="btn btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                                                        <button className="btn btn-sm btn-primary" onClick={() => handleUpdateNote(n.id)}>Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{n.content}</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                                            {n.writtenBy} · {new Date(n.createdAt).toLocaleString('en-US')}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            <button className="btn btn-sm" onClick={() => { setEditId(n.id); setEditContent(n.content) }}>Edit</button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteNote(n.id)}>Delete</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="card">
                                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Add note</div>
                                        <textarea rows={3} placeholder="Write a note..." value={noteContent} onChange={e => setNoteContent(e.target.value)} />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-primary btn-sm" onClick={handleAddNote}>Add</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Rooms tab ── */}
                {tab === 'rooms' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, borderBottom: '0.5px solid rgba(0,0,0,0.08)', color: '#6b7280' }}>
                                Rooms
                            </div>
                            {rooms.length === 0 && (
                                <div style={{ padding: '16px', fontSize: 12, color: '#9ca3af' }}>No rooms</div>
                            )}
                            {rooms.map(r => (
                                <div key={r.id} onClick={() => selectRoom(r)}
                                    style={{
                                        padding: '12px 16px', cursor: 'pointer', fontSize: 13,
                                        borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                                        background: selRoom?.id === r.id ? '#E6F1FB' : 'transparent',
                                        color:      selRoom?.id === r.id ? '#0C447C'  : '#1a1a2e',
                                    }}>
                                    <div style={{ fontWeight: 500 }}>{r.name}</div>
                                    <div style={{ fontSize: 11, marginTop: 2 }}>
                                        <span className={`badge ${r.status === 'ACTIVE' ? 'badge-active' : 'badge-ended'}`} style={{ fontSize: 10 }}>
                                            {r.status === 'ACTIVE' ? 'Active' : 'Ended'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            {!selRoom ? (
                                <div className="card" style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>
                                    Select a room to view or edit its note
                                </div>
                            ) : (
                                <div className="card">
                                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{selRoom.name}</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
                                        Notes are saved per room and visible to all participants
                                    </div>
                                    <textarea
                                        rows={10}
                                        placeholder="Write room notes..."
                                        value={roomNote}
                                        onChange={e => { setRoomNote(e.target.value); setRoomNoteSaved(false) }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        {roomNoteSaved
                                            ? <span style={{ fontSize: 12, color: '#085041' }}>✓ Saved</span>
                                            : <span />
                                        }
                                        <button className="btn btn-primary btn-sm" onClick={handleSaveRoomNote} disabled={savingRoom}>
                                            {savingRoom ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {confirm && (
                <ConfirmModal
                    message={confirm.message}
                    onConfirm={confirmAction}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    )
}
