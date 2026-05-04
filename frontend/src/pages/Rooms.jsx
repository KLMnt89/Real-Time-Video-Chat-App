import { useEffect, useState } from 'react'
import { roomsApi } from '../api'
import TopBar from '../components/TopBar'
import ConfirmModal from '../components/ConfirmModal'

export default function Rooms() {
    const [rooms,    setRooms]    = useState([])
    const [filter,   setFilter]   = useState('ACTIVE')
    const [copiedId, setCopiedId] = useState(null)
    const [confirm,  setConfirm]  = useState(null)
    const [error,    setError]    = useState(null)

    const load = () => roomsApi.getAll()
        .then(r => setRooms(r.data))
        .catch(() => setError('Could not load rooms.'))

    useEffect(() => { load() }, [])

    const handleEnd = async (id) => {
        try { await roomsApi.end(id); load() } catch { setError('Could not end room.') }
    }

    const handleDelete = (id) => setConfirm({ id, message: 'Delete this room? This cannot be undone.' })

    const confirmDelete = async () => {
        try { await roomsApi.delete(confirm.id) } catch { setError('Could not delete room.') }
        setConfirm(null)
        load()
    }

    const copyLink = (inviteCode, id) => {
        navigator.clipboard.writeText(`${window.location.origin}/join/${inviteCode}`)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const counts = {
        ALL:    rooms.length,
        ACTIVE: rooms.filter(r => r.status === 'ACTIVE').length,
        ENDED:  rooms.filter(r => r.status === 'ENDED').length,
    }

    const filtered = filter === 'ALL' ? rooms
        : rooms.filter(r => r.status === filter)

    const FILTERS = [
        { key: 'ALL',    label: 'All' },
        { key: 'ACTIVE', label: 'Active' },
        { key: 'ENDED',  label: 'Ended' },
    ]

    return (
        <div className="main-content">
            <TopBar title="Groups" />

            <div className="page">
                {error && (
                    <div style={{
                        background: 'var(--red-light)', color: 'var(--red)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '10px 14px', fontSize: 13, marginBottom: 16,
                        display: 'flex', justifyContent: 'space-between',
                    }}>
                        {error}
                        <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 16, lineHeight: 1 }}>×</button>
                    </div>
                )}

                <div className="filter-bar">
                    {FILTERS.map(f => (
                        <button key={f.key}
                            className={`filter-tab${filter === f.key ? ' active' : ''}`}
                            onClick={() => setFilter(f.key)}>
                            {f.label}
                            <span className="count">{counts[f.key]}</span>
                        </button>
                    ))}
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Room</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Participants</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{r.name}</div>
                                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                                            {r.inviteCode}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${r.status === 'ACTIVE' ? 'badge-active' : 'badge-ended'}`}>
                                            {r.status === 'ACTIVE' ? 'Active' : 'Ended'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                        {r.createdAt ? new Date(r.createdAt).toLocaleString('en-US') : '—'}
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                        {r.participants?.length ?? 0}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-sm" onClick={() => copyLink(r.inviteCode, r.id)}>
                                                {copiedId === r.id ? '✓ Copied' : 'Copy link'}
                                            </button>
                                            {r.status === 'ACTIVE' && (
                                                <button className="btn btn-sm btn-primary"
                                                    onClick={() => window.open(`/join/${r.inviteCode}`, '_blank')}>
                                                    Join
                                                </button>
                                            )}
                                            {r.status === 'ACTIVE' && (
                                                <button className="btn btn-sm"
                                                    style={{ background: 'var(--amber-light)', color: 'var(--amber-800)', borderColor: 'transparent' }}
                                                    onClick={() => handleEnd(r.id)}>
                                                    End
                                                </button>
                                            )}
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)', fontSize: 13 }}>
                                        {filter === 'ACTIVE' ? 'No active rooms' : filter === 'ENDED' ? 'No ended rooms' : 'No rooms'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
