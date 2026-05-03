import { useEffect, useState } from 'react'
import { roomsApi } from '../api'
import TopBar from '../components/TopBar'
import ConfirmModal from '../components/ConfirmModal'

export default function Rooms() {
    const [rooms,    setRooms]    = useState([])
    const [filter,   setFilter]   = useState('ALL')
    const [copiedId, setCopiedId] = useState(null)
    const [confirm,  setConfirm]  = useState(null)

    const load = () => roomsApi.getAll().then(r => setRooms(r.data))
    useEffect(() => { load() }, [])

    const handleEnd = async (id) => {
        await roomsApi.end(id)
        load()
    }

    const handleDelete = (id) => {
        setConfirm({ id, message: 'Are you sure you want to delete this room? This action cannot be undone.' })
    }

    const confirmDelete = async () => {
        await roomsApi.delete(confirm.id)
        setConfirm(null)
        load()
    }

    const copyLink = (inviteCode, id) => {
        navigator.clipboard.writeText(`${window.location.origin}/join/${inviteCode}`)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const filtered = rooms.filter(r => {
        if (filter === 'ACTIVE') return r.status === 'ACTIVE'
        if (filter === 'ENDED')  return r.status === 'ENDED'
        return true
    })

    const FILTERS = [
        { key: 'ALL',    label: 'All' },
        { key: 'ACTIVE', label: 'Active' },
        { key: 'ENDED',  label: 'Ended' },
    ]

    return (
        <div className="main-content">
            <TopBar title="Rooms" />
            <div className="page">

                {/* Filter tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    {FILTERS.map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            style={{
                                padding: '6px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
                                border: '0.5px solid rgba(0,0,0,0.12)', fontWeight: filter === f.key ? 600 : 400,
                                background: filter === f.key ? '#185FA5' : 'white',
                                color:      filter === f.key ? 'white'   : '#6b7280',
                                transition: 'all 0.12s',
                            }}>
                            {f.label}
                            {f.key === 'ALL'    && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>{rooms.length}</span>}
                            {f.key === 'ACTIVE' && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>{rooms.filter(r => r.status === 'ACTIVE').length}</span>}
                            {f.key === 'ENDED'  && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>{rooms.filter(r => r.status === 'ENDED').length}</span>}
                        </button>
                    ))}
                </div>

                <div className="card">
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
                                        <div style={{ fontWeight: 500 }}>{r.name}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>{r.inviteCode}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${r.status === 'ACTIVE' ? 'badge-active' : 'badge-ended'}`}>
                                            {r.status === 'ACTIVE' ? 'Active' : 'Ended'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: '#6b7280' }}>
                                        {r.createdAt ? new Date(r.createdAt).toLocaleString('en-US') : '—'}
                                    </td>
                                    <td style={{ fontSize: 12 }}>{r.participants?.length ?? 0}</td>
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
                                                <button className="btn btn-sm" style={{ background: '#FAEEDA', color: '#633806', border: 'none' }}
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
                                    <td colSpan={5} style={{ color: '#9ca3af', textAlign: 'center', padding: 32 }}>
                                        No rooms
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
