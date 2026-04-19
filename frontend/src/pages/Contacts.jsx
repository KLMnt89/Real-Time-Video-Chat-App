import { useEffect, useState } from 'react'
import { contactsApi } from '../api'
import TopBar from '../components/TopBar'

const avatarColors = ['#E6F1FB:#0C447C','#EEEDFE:#3C3489','#EAF3DE:#27500A','#FAEEDA:#633806','#FBEAF0:#72243E','#E1F5EE:#085041']
const avatarColor = (i) => { const [bg, color] = avatarColors[i % avatarColors.length].split(':'); return { background: bg, color } }

export default function Contacts() {
    const [contacts, setContacts] = useState([])
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })

    const load = (s) => contactsApi.getAll(s ? { search: s } : {}).then(r => setContacts(r.data))

    useEffect(() => { load() }, [])

    const handleCreate = async () => {
        await contactsApi.create(form)
        setShowModal(false)
        setForm({ firstName: '', lastName: '', email: '', phone: '' })
        load()
    }

    const handleDelete = async (id) => { if (confirm('Избриши контакт?')) { await contactsApi.delete(id); load() } }

    const handleStatusChange = async (id, status) => { await contactsApi.updateStatus(id, status); load() }

    const statusBadge = (s) => {
        const map = { ONLINE: 'badge-online', BUSY: 'badge-busy', OFFLINE: 'badge-offline' }
        const label = { ONLINE: 'Онлајн', BUSY: 'Зафатен', OFFLINE: 'Офлајн' }
        return <span className={`badge ${map[s]}`}>{label[s]}</span>
    }

    return (
        <div className="main-content">
            <TopBar title="Контакти" action={
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Нов контакт</button>
            } />
            <div className="page">
                <div style={{ marginBottom: 16 }}>
                    <input style={{ maxWidth: 300, marginBottom: 0 }} placeholder="Пребарај по име..."
                           value={search} onChange={e => { setSearch(e.target.value); load(e.target.value) }} />
                </div>
                <div className="card">
                    <table>
                        <thead>
                        <tr>
                            <th>Контакт</th>
                            <th>Email</th>
                            <th>Телефон</th>
                            <th>Статус</th>
                            <th>Акции</th>
                        </tr>
                        </thead>
                        <tbody>
                        {contacts.map((c, i) => (
                            <tr key={c.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="avatar" style={avatarColor(i)}>{c.firstName?.[0]}{c.lastName?.[0]}</div>
                                        <div style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</div>
                                    </div>
                                </td>
                                <td style={{ color: '#6b7280', fontSize: 12 }}>{c.email}</td>
                                <td style={{ color: '#6b7280', fontSize: 12 }}>{c.phone ?? '—'}</td>
                                <td>
                                    <select value={c.status} onChange={e => handleStatusChange(c.id, e.target.value)}
                                            style={{ width: 'auto', padding: '4px 8px', marginBottom: 0, fontSize: 12 }}>
                                        <option value="ONLINE">Онлајн</option>
                                        <option value="BUSY">Зафатен</option>
                                        <option value="OFFLINE">Офлајн</option>
                                    </select>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Избриши</button>
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
                        <h3>Нов контакт</h3>
                        <div className="form-row">
                            <input placeholder="Име" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                            <input placeholder="Презиме" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        <input placeholder="Телефон" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowModal(false)}>Откажи</button>
                            <button className="btn btn-primary" onClick={handleCreate}>Додај</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}