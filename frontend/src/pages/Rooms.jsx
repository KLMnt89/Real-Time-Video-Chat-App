import { useEffect, useState } from 'react'
import { roomsApi } from '../api'
import TopBar from '../components/TopBar'

export default function Rooms() {
    const [rooms, setRooms] = useState([])

    const load = () => roomsApi.getAll().then(r => setRooms(r.data))
    useEffect(() => { load() }, [])

    const handleEnd = async (id) => { await roomsApi.end(id); load() }
    const handleDelete = async (id) => { if (confirm('Избриши соба?')) { await roomsApi.delete(id); load() } }

    const copyInvite = (code) => {
        navigator.clipboard.writeText(`http://localhost:5173/join/${code}`)
        alert('Линкот е копиран!')
    }

    return (
        <div className="main-content">
            <TopBar title="Соби" />
            <div className="page">
                <div className="card">
                    <table>
                        <thead>
                        <tr>
                            <th>Соба</th>
                            <th>Статус</th>
                            <th>Креирана</th>
                            <th>Учесници</th>
                            <th>Акции</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rooms.map(r => (
                            <tr key={r.id}>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{r.name}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>{r.inviteCode}</div>
                                </td>
                                <td>
                    <span className={`badge ${r.status === 'ACTIVE' ? 'badge-active' : 'badge-ended'}`}>
                      {r.status === 'ACTIVE' ? 'Активна' : 'Завршена'}
                    </span>
                                </td>
                                <td style={{ fontSize: 12, color: '#6b7280' }}>
                                    {r.createdAt ? new Date(r.createdAt).toLocaleString('mk-MK') : '—'}
                                </td>
                                <td style={{ fontSize: 12 }}>{r.participants?.length ?? 0}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn btn-sm" onClick={() => copyInvite(r.inviteCode)}>
                                            Копирај линк
                                        </button>
                                        {r.status === 'ACTIVE' && (
                                            <button className="btn btn-sm" style={{ background: '#FAEEDA', color: '#633806', border: 'none' }}
                                                    onClick={() => handleEnd(r.id)}>
                                                Заврши
                                            </button>
                                        )}
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>
                                            Избриши
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rooms.length === 0 && (
                            <tr><td colSpan={5} style={{ color: '#9ca3af', textAlign: 'center', padding: 24 }}>Нема соби</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}