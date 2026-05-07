import { useEffect, useState } from 'react'
import { contactsApi, meetingsApi, roomsApi, groupsApi } from '../api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'
import ConfirmModal from '../components/ConfirmModal'

const AVATAR_COLORS = ['#185FA5', '#3C3489', '#27500A', '#633806', '#72243E', '#085041']

function Avatar({ name = '', size = 32 }) {
    const parts    = name.trim().split(' ').filter(Boolean)
    const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : (parts[0]?.slice(0, 2) ?? '?')
    const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: AVATAR_COLORS[colorIdx], color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.36, fontWeight: 500, flexShrink: 0,
            textTransform: 'uppercase', letterSpacing: '-0.5px',
        }}>
            {initials.toUpperCase()}
        </div>
    )
}

const STATUS_STYLE = {
    ONLINE:  { bg: 'var(--green-light)',  color: 'var(--green-800)' },
    BUSY:    { bg: 'var(--amber-light)',  color: 'var(--amber-800)' },
    OFFLINE: { bg: 'var(--color-background-secondary)', color: 'var(--color-text-muted)' },
}

export default function Groups() {
    const { user }   = useAuth()
    const navigate   = useNavigate()
    const createdBy  = user ? `${user.firstName} ${user.lastName}` : 'admin'

    const [groups,        setGroups]        = useState([])
    const [contacts,      setContacts]      = useState([])
    const [selGroup,      setSelGroup]      = useState(null)
    const [groupMeetings, setGroupMeetings] = useState([])
    const [showCreate,    setShowCreate]    = useState(false)
    const [showSched,     setShowSched]     = useState(false)
    const [newName,       setNewName]       = useState('')
    const [newContactIds, setNewContactIds] = useState([])
    const [schedForm,     setSchedForm]     = useState({ title: '', description: '', scheduledAt: '' })
    const [showEdit,      setShowEdit]      = useState(false)
    const [editName,      setEditName]      = useState('')
    const [editContactIds,setEditContactIds]= useState([])
    const [confirm,       setConfirm]       = useState(null)
    const [error,         setError]         = useState(null)

    useEffect(() => {
        groupsApi.getAll()
            .then(r => setGroups(r.data))
            .catch(() => setError('Could not load groups.'))
        contactsApi.getAll()
            .then(r => setContacts(r.data))
            .catch(() => setError('Could not load contacts.'))
    }, [])

    const handleCreate = async () => {
        if (!newName.trim()) return
        try {
            const res = await groupsApi.create({ name: newName.trim(), createdBy, contactIds: newContactIds })
            setGroups(g => [...g, res.data])
            setShowCreate(false)
            setNewName('')
            setNewContactIds([])
        } catch { setError('Could not create group.') }
    }

    const openEdit = (g) => {
        setEditName(g.name)
        setEditContactIds((g.contacts ?? []).map(c => c.id))
        setShowEdit(true)
    }

    const handleEdit = async () => {
        try {
            const res = await groupsApi.update(selGroup.id, { name: editName.trim(), contactIds: editContactIds })
            const updated = res.data
            setGroups(gs => gs.map(g => g.id === updated.id ? updated : g))
            setSelGroup(updated)
            setShowEdit(false)
        } catch { setError('Could not update group.') }
    }

    const toggleEditContact = (id) => setEditContactIds(ids =>
        ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    )

    const handleDeleteGroup = (id) => setConfirm({ id, message: 'Delete this group?' })

    const confirmDelete = async () => {
        try {
            await groupsApi.delete(confirm.id)
            if (selGroup?.id === confirm.id) { setSelGroup(null); setGroupMeetings([]) }
            setGroups(g => g.filter(x => x.id !== confirm.id))
        } catch { setError('Could not delete group.') }
        setConfirm(null)
    }

    const toggleNewContact = (id) => setNewContactIds(ids =>
        ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    )

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

    const loadGroupMeetings = (groupId) =>
        meetingsApi.getByGroup(groupId)
            .then(r => setGroupMeetings(r.data))
            .catch(() => setGroupMeetings([]))

    const handleSchedule = async () => {
        try {
            const memberIds = (selGroup?.contacts ?? []).map(c => c.id)
            await meetingsApi.create({
                title:          schedForm.title,
                description:    schedForm.description,
                scheduledAt:    schedForm.scheduledAt,
                createdBy,
                participantIds: memberIds,
                groupId:        selGroup?.id,
            })
            setShowSched(false)
            setSchedForm({ title: '', description: '', scheduledAt: '' })
            if (selGroup) loadGroupMeetings(selGroup.id)
        } catch { setError('Could not schedule meeting.') }
    }

    const members = (g) => g?.contacts ?? []

    return (
        <div className="main-content">
            <TopBar title="Groups" action={
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New group</button>
            } />

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

                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>

                    {/* Left: group list */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '12px 16px', fontSize: 11, fontWeight: 600,
                            color: 'var(--color-text-muted)', textTransform: 'uppercase',
                            letterSpacing: '0.06em', borderBottom: '0.5px solid var(--color-border-tertiary)',
                        }}>
                            Groups ({groups.length})
                        </div>

                        {groups.length === 0 && (
                            <div style={{ padding: '28px 16px', fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                                <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
                                No groups yet
                            </div>
                        )}

                        {groups.map(g => {
                            const mbs      = members(g)
                            const isActive = selGroup?.id === g.id
                            return (
                                <div key={g.id} onClick={() => { setSelGroup(g); loadGroupMeetings(g.id) }}
                                    style={{
                                        padding: '13px 16px', cursor: 'pointer',
                                        borderBottom: '0.5px solid var(--color-border-tertiary)',
                                        background: isActive ? 'var(--blue-light)' : 'transparent',
                                        transition: 'background 0.12s',
                                    }}>
                                    <div style={{
                                        fontWeight: 500, fontSize: 13, marginBottom: 8,
                                        color: isActive ? 'var(--blue-800)' : 'var(--color-text-primary)',
                                    }}>
                                        {g.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', position: 'relative', height: 22 }}>
                                            {mbs.slice(0, 5).map((c, i) => (
                                                <div key={c.id} style={{ position: 'absolute', left: i * 14 }}>
                                                    <div style={{ border: '1.5px solid var(--color-background-primary)', borderRadius: '50%' }}>
                                                        <Avatar name={`${c.firstName} ${c.lastName}`} size={20} />
                                                    </div>
                                                </div>
                                            ))}
                                            {mbs.length > 5 && (
                                                <div style={{
                                                    position: 'absolute', left: 5 * 14,
                                                    width: 20, height: 20, borderRadius: '50%',
                                                    background: 'var(--color-background-secondary)',
                                                    border: '1.5px solid var(--color-background-primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 9, color: 'var(--color-text-muted)',
                                                }}>
                                                    +{mbs.length - 5}
                                                </div>
                                            )}
                                        </div>
                                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: Math.min(mbs.length, 5) * 14 + 8 }}>
                                            {mbs.length} member{mbs.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Right: group detail */}
                    {!selGroup ? (
                        <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                            Select a group to view details,<br />or create a new one
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Header card */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                                    <div>
                                        <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 5 }}>
                                            {selGroup.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                                            {members(selGroup).length} member{members(selGroup).length !== 1 ? 's' : ''}
                                            {' · '}Created {new Date(selGroup.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-sm" onClick={() => openEdit(selGroup)}>
                                            Edit members
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteGroup(selGroup.id)}>
                                            Delete group
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="btn-hero btn-hero-primary" onClick={handleMeetNow}>⚡ Meet now</button>
                                    <button className="btn-hero" onClick={() => setShowSched(true)}>📅 Schedule meeting</button>
                                </div>
                            </div>

                            {/* Members card */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{
                                    padding: '12px 18px', fontSize: 11, fontWeight: 600,
                                    color: 'var(--color-text-muted)', textTransform: 'uppercase',
                                    letterSpacing: '0.06em', borderBottom: '0.5px solid var(--color-border-tertiary)',
                                }}>
                                    Members
                                </div>

                                {members(selGroup).length === 0 ? (
                                    <div style={{ padding: '20px 18px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                                        No members in this group
                                    </div>
                                ) : members(selGroup).map(c => {
                                    const s = STATUS_STYLE[c.status] ?? STATUS_STYLE.OFFLINE
                                    return (
                                        <div key={c.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 13,
                                            padding: '13px 18px',
                                            borderBottom: '0.5px solid var(--color-border-tertiary)',
                                        }}>
                                            <Avatar name={`${c.firstName} ${c.lastName}`} size={36} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                                    {c.firstName} {c.lastName}
                                                </div>
                                                {c.email && (
                                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>{c.email}</div>
                                                )}
                                            </div>
                                            <span style={{
                                                padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500,
                                                background: s.bg, color: s.color,
                                            }}>
                                                {c.status ? c.status.charAt(0) + c.status.slice(1).toLowerCase() : 'Offline'}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Meetings card */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{
                                    padding: '12px 18px', fontSize: 11, fontWeight: 600,
                                    color: 'var(--color-text-muted)', textTransform: 'uppercase',
                                    letterSpacing: '0.06em', borderBottom: '0.5px solid var(--color-border-tertiary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <span>Meetings ({groupMeetings.length})</span>
                                </div>

                                {groupMeetings.length === 0 ? (
                                    <div style={{ padding: '20px 18px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                                        No meetings scheduled for this group
                                    </div>
                                ) : groupMeetings.map(m => {
                                    const statusColors = {
                                        SCHEDULED: { bg: 'var(--blue-light)',   color: 'var(--blue-800)',   label: 'Scheduled' },
                                        ACTIVE:    { bg: 'var(--green-light)',  color: 'var(--green-800)',  label: 'Active' },
                                        ENDED:     { bg: 'var(--color-background-secondary)', color: 'var(--color-text-muted)', label: 'Ended' },
                                        CANCELLED: { bg: 'var(--red-light)',    color: 'var(--red)',        label: 'Cancelled' },
                                        PASSED:    { bg: 'var(--amber-light)',  color: 'var(--amber-800)',  label: 'No show' },
                                    }
                                    const sc = statusColors[m.status] ?? statusColors.ENDED
                                    return (
                                        <div key={m.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 13,
                                            padding: '13px 18px',
                                            borderBottom: '0.5px solid var(--color-border-tertiary)',
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                                                    {m.title}
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                                                    {m.scheduledAt
                                                        ? new Date(m.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                        : '—'}
                                                </div>
                                            </div>
                                            <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500, background: sc.bg, color: sc.color }}>
                                                {sc.label}
                                            </span>
                                            <button className="btn btn-sm" onClick={() => navigate(`/notes?meetingId=${m.id}`)}>
                                                Notes
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create group modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => { setShowCreate(false); setNewName(''); setNewContactIds([]) }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>New group</h3>
                        <input
                            placeholder="Group name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            autoFocus
                        />
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>Add members</div>
                        {contacts.length === 0 ? (
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                                No contacts yet — add contacts first
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                                {contacts.map(c => {
                                    const sel = newContactIds.includes(c.id)
                                    return (
                                        <div key={c.id} onClick={() => toggleNewContact(c.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '5px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                                                background: sel ? '#185FA5' : 'var(--color-background-secondary)',
                                                color:      sel ? '#fff'    : 'var(--color-text-secondary)',
                                                border: '0.5px solid var(--color-border-secondary)',
                                                transition: 'all 0.12s',
                                            }}>
                                            {sel && <span style={{ fontSize: 10 }}>✓</span>}
                                            {c.firstName} {c.lastName}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {newContactIds.length > 0 && (
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                                {newContactIds.length} member{newContactIds.length !== 1 ? 's' : ''} selected
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="btn" onClick={() => { setShowCreate(false); setNewName(''); setNewContactIds([]) }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={!newName.trim()}>
                                Create group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule meeting modal */}
            {showSched && (
                <div className="modal-overlay" onClick={() => setShowSched(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Schedule meeting</h3>
                        <div style={{
                            fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 14,
                            padding: '8px 12px', background: 'var(--color-background-secondary)',
                            borderRadius: 'var(--border-radius-md)',
                        }}>
                            Group: <strong style={{ color: 'var(--color-text-primary)' }}>{selGroup?.name}</strong>
                            {' · '}{members(selGroup).length} participant{members(selGroup).length !== 1 ? 's' : ''}
                        </div>
                        <input
                            placeholder="Meeting title"
                            value={schedForm.title}
                            onChange={e => setSchedForm({ ...schedForm, title: e.target.value })}
                            autoFocus
                        />
                        <textarea
                            placeholder="Description (optional)"
                            rows={2}
                            value={schedForm.description}
                            onChange={e => setSchedForm({ ...schedForm, description: e.target.value })}
                        />
                        <input
                            type="datetime-local"
                            value={schedForm.scheduledAt}
                            onChange={e => setSchedForm({ ...schedForm, scheduledAt: e.target.value })}
                        />
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowSched(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSchedule} disabled={!schedForm.title.trim()}>
                                Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit group modal */}
            {showEdit && (
                <div className="modal-overlay" onClick={() => setShowEdit(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Edit group</h3>
                        <input
                            placeholder="Group name"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            autoFocus
                        />
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>Members</div>
                        {contacts.length === 0 ? (
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                                No contacts yet
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                                {contacts.map(c => {
                                    const sel = editContactIds.includes(c.id)
                                    return (
                                        <div key={c.id} onClick={() => toggleEditContact(c.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '5px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                                                background: sel ? '#185FA5' : 'var(--color-background-secondary)',
                                                color:      sel ? '#fff'    : 'var(--color-text-secondary)',
                                                border: '0.5px solid var(--color-border-secondary)',
                                                transition: 'all 0.12s',
                                            }}>
                                            {sel && <span style={{ fontSize: 10 }}>✓</span>}
                                            {c.firstName} {c.lastName}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {editContactIds.length > 0 && (
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                                {editContactIds.length} member{editContactIds.length !== 1 ? 's' : ''} selected
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowEdit(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEdit} disabled={!editName.trim()}>
                                Save changes
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
