import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { meetingsApi, notesApi, roomsApi, roomNoteApi } from '../api'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'
import ConfirmModal from '../components/ConfirmModal'

export default function Notes() {
    const { user } = useAuth()
    const writtenBy = user ? `${user.firstName} ${user.lastName}` : 'admin'
    const [searchParams] = useSearchParams()

    const [tab, setTab] = useState('meetings')

    const [meetings,      setMeetings]      = useState([])
    const [selMeeting,    setSelMeeting]    = useState(null)
    const [notes,         setNotes]         = useState([])
    const [noteContent,   setNoteContent]   = useState('')
    const [editId,        setEditId]        = useState(null)
    const [editContent,   setEditContent]   = useState('')
    const [confirm,       setConfirm]       = useState(null)
    const [error,         setError]         = useState(null)

    const [rooms,         setRooms]         = useState([])
    const [selRoom,       setSelRoom]       = useState(null)
    const [roomNote,      setRoomNote]      = useState('')
    const [roomNoteSaved, setRoomNoteSaved] = useState(false)
    const [savingRoom,    setSavingRoom]    = useState(false)

    useEffect(() => {
        meetingsApi.getAll().then(r => setMeetings(r.data)).catch(() => setError('Could not load meetings.'))
    }, [])

    useEffect(() => {
        if (tab === 'rooms') roomsApi.getAll().then(r => setRooms(r.data)).catch(() => setError('Could not load rooms.'))
    }, [tab])

    // Pre-select meeting from URL param (e.g. /notes?meetingId=5)
    useEffect(() => {
        const meetingIdParam = searchParams.get('meetingId')
        if (!meetingIdParam || meetings.length === 0) return
        const m = meetings.find(x => x.id.toString() === meetingIdParam)
        if (m) {
            setTab('meetings')
            selectMeeting(m)
        }
    }, [meetings, searchParams])

    const selectMeeting = (m) => {
        setSelMeeting(m)
        notesApi.getByMeeting(m.id).then(r => setNotes(r.data)).catch(() => setError('Could not load notes.'))
    }

    const handleAddNote = async () => {
        if (!noteContent.trim()) return
        try {
            await notesApi.create(selMeeting.id, { content: noteContent, writtenBy })
            setNoteContent('')
            notesApi.getByMeeting(selMeeting.id).then(r => setNotes(r.data))
        } catch { setError('Could not add note.') }
    }

    const handleUpdateNote = async (noteId) => {
        try {
            await notesApi.update(selMeeting.id, noteId, editContent)
            setEditId(null)
            notesApi.getByMeeting(selMeeting.id).then(r => setNotes(r.data))
        } catch { setError('Could not update note.') }
    }

    const handleDeleteNote = (noteId) => setConfirm({ action: 'note', noteId, message: 'Delete this note?' })

    const confirmAction = async () => {
        if (confirm.action === 'note') {
            try { await notesApi.delete(selMeeting.id, confirm.noteId) } catch { setError('Could not delete note.') }
            notesApi.getByMeeting(selMeeting.id).then(r => setNotes(r.data))
        }
        setConfirm(null)
    }

    const selectRoom = async (r) => {
        setSelRoom(r)
        setRoomNoteSaved(false)
        try {
            const res = await roomNoteApi.getNote(r.id)
            setRoomNote(res.data?.content ?? '')
        } catch { setRoomNote('') }
    }

    const handleSaveRoomNote = async () => {
        setSavingRoom(true)
        try {
            await roomNoteApi.saveNote(selRoom.id, roomNote, writtenBy)
            setRoomNoteSaved(true)
            setTimeout(() => setRoomNoteSaved(false), 2500)
        } catch { setError('Could not save note.') }
        finally { setSavingRoom(false) }
    }

    const tabStyle = (t) => ({
        padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
        border: '0.5px solid var(--color-border-secondary)',
        fontWeight: t === tab ? 500 : 400,
        background: t === tab ? '#185FA5' : 'transparent',
        color:      t === tab ? '#fff'    : 'var(--color-text-secondary)',
        fontFamily: 'inherit', transition: 'all 0.12s',
    })

    return (
        <div className="main-content">
            <TopBar title="Notes" />

            <div className="page">
                {error && (
                    <div style={{
                        background: 'var(--red-light)', color: 'var(--red)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '10px 14px', fontSize: 13, marginBottom: 16,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        {error}
                        <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 18, lineHeight: 1, paddingLeft: 8 }}>×</button>
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    <button style={tabStyle('meetings')} onClick={() => setTab('meetings')}>All notes</button>
                    <button style={tabStyle('rooms')}    onClick={() => setTab('rooms')}>Meeting notes</button>
                </div>

                {/* All notes tab — meeting-based notes */}
                {tab === 'meetings' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
                        <div className="card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
                            <div style={{
                                padding: '12px 16px', fontSize: 11, fontWeight: 500,
                                color: 'var(--color-text-muted)', textTransform: 'uppercase',
                                letterSpacing: '0.05em', borderBottom: '0.5px solid var(--color-border-tertiary)',
                            }}>
                                Meetings
                            </div>
                            {meetings.length === 0 && (
                                <div style={{ padding: 16, fontSize: 12, color: 'var(--color-text-muted)' }}>No meetings</div>
                            )}
                            {meetings.map(m => (
                                <div key={m.id} onClick={() => selectMeeting(m)}
                                    style={{
                                        padding: '11px 16px', cursor: 'pointer', fontSize: 13,
                                        borderBottom: '0.5px solid var(--color-border-tertiary)',
                                        background: selMeeting?.id === m.id ? 'var(--blue-light)' : 'transparent',
                                        color:      selMeeting?.id === m.id ? 'var(--blue-800)'   : 'var(--color-text-primary)',
                                        transition: 'background 0.1s',
                                    }}>
                                    <div style={{ fontWeight: 500 }}>{m.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                                        {m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('en-US') : '—'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            {!selMeeting ? (
                                <div className="card" style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 48, fontSize: 13 }}>
                                    Select a meeting to view notes
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div className="card">
                                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 3 }}>
                                            {selMeeting.title}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                                            {notes.length} note{notes.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    {notes.map(n => (
                                        <div key={n.id} className="card">
                                            {editId === n.id ? (
                                                <>
                                                    <textarea rows={3} value={editContent}
                                                        onChange={e => setEditContent(e.target.value)} />
                                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                        <button className="btn btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                                                        <button className="btn btn-sm btn-primary" onClick={() => handleUpdateNote(n.id)}>Save</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10, color: 'var(--color-text-primary)' }}>
                                                        {n.content}
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                                                            {n.writtenBy} · {new Date(n.createdAt).toLocaleString('en-US')}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            <button className="btn btn-sm"
                                                                onClick={() => { setEditId(n.id); setEditContent(n.content) }}>
                                                                Edit
                                                            </button>
                                                            <button className="btn btn-sm btn-danger"
                                                                onClick={() => handleDeleteNote(n.id)}>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}

                                    <div className="card">
                                        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Add note
                                        </div>
                                        <textarea rows={3} placeholder="Write a note…" value={noteContent}
                                            onChange={e => setNoteContent(e.target.value)} />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-sm btn-primary" onClick={handleAddNote} disabled={!noteContent.trim()}>
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Meeting notes tab — room notes */}
                {tab === 'rooms' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
                        <div className="card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
                            <div style={{
                                padding: '12px 16px', fontSize: 11, fontWeight: 500,
                                color: 'var(--color-text-muted)', textTransform: 'uppercase',
                                letterSpacing: '0.05em', borderBottom: '0.5px solid var(--color-border-tertiary)',
                            }}>
                                Rooms
                            </div>
                            {rooms.length === 0 && (
                                <div style={{ padding: 16, fontSize: 12, color: 'var(--color-text-muted)' }}>No rooms</div>
                            )}
                            {rooms.map(r => (
                                <div key={r.id} onClick={() => selectRoom(r)}
                                    style={{
                                        padding: '11px 16px', cursor: 'pointer', fontSize: 13,
                                        borderBottom: '0.5px solid var(--color-border-tertiary)',
                                        background: selRoom?.id === r.id ? 'var(--blue-light)' : 'transparent',
                                        color:      selRoom?.id === r.id ? 'var(--blue-800)'   : 'var(--color-text-primary)',
                                        transition: 'background 0.1s',
                                    }}>
                                    <div style={{ fontWeight: 500 }}>{r.name}</div>
                                    <div style={{ marginTop: 4 }}>
                                        <span className={`badge ${r.status === 'ACTIVE' ? 'badge-active' : 'badge-ended'}`}>
                                            {r.status === 'ACTIVE' ? 'Active' : 'Ended'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            {!selRoom ? (
                                <div className="card" style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 48, fontSize: 13 }}>
                                    Select a room to view or edit its note
                                </div>
                            ) : (
                                <div className="card">
                                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 3 }}>
                                        {selRoom.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16 }}>
                                        Notes are shared with all participants in this room
                                    </div>
                                    <textarea rows={10} placeholder="Write room notes…"
                                        value={roomNote}
                                        onChange={e => { setRoomNote(e.target.value); setRoomNoteSaved(false) }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        {roomNoteSaved ? (
                                            <span style={{ fontSize: 12, color: 'var(--green-800)' }}>✓ Saved</span>
                                        ) : <span />}
                                        <button className="btn btn-sm btn-primary"
                                            onClick={handleSaveRoomNote} disabled={savingRoom}>
                                            {savingRoom ? 'Saving…' : 'Save'}
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
