import { useEffect, useState } from 'react'
import { contactsApi } from '../api'
import TopBar from '../components/TopBar'
import ConfirmModal from '../components/ConfirmModal'

const AVATAR_COLORS = ['#E6F1FB:#0C447C','#EEEDFE:#3C3489','#EAF3DE:#27500A','#FAEEDA:#633806','#FBEAF0:#72243E','#E1F5EE:#085041']
const avatarColor = (i) => { const [bg, color] = AVATAR_COLORS[i % AVATAR_COLORS.length].split(':'); return { background: bg, color } }

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '' }

export default function Contacts() {
    const [contacts,   setContacts]   = useState([])
    const [search,     setSearch]     = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [form,       setForm]       = useState(EMPTY_FORM)
    const [editForm,   setEditForm]   = useState(EMPTY_FORM)
    const [confirm,    setConfirm]    = useState(null)

    const load = (s) => contactsApi.getAll(s ? { search: s } : {}).then(r => setContacts(r.data))
    useEffect(() => { load() }, [])

    const handleCreate = async () => {
        await contactsApi.create(form)
        setShowCreate(false)
        setForm(EMPTY_FORM)
        load(search)
    }

    const openEdit = (c) => {
        setEditTarget(c)
        setEditForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone ?? '' })
    }

    const handleEdit = async () => {
        await contactsApi.update(editTarget.id, editForm)
        setEditTarget(null)
        load(search)
    }

    const handleDelete = (id) => {
        setConfirm({ id, message: 'Are you sure you want to delete this contact?' })
    }

    const confirmDelete = async () => {
        await contactsApi.delete(confirm.id)
        setConfirm(null)
        load(search)
    }

    const handleStatusChange = async (id, status) => {
        await contactsApi.updateStatus(id, status)
        load(search)
    }

    const statusBadge = (s) => {
        const map   = { ONLINE: 'badge-online', BUSY: 'badge-busy', OFFLINE: 'badge-offline' }
        const label = { ONLINE: 'Online', BUSY: 'Busy', OFFLINE: 'Offline' }
        return <span className={`badge ${map[s]}`}>{label[s]}</span>
    }

    return (
        <div className="main-content">
            <TopBar title="Contacts" action={
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New contact</button>
            } />
            <div className="page">
                <div style={{ marginBottom: 16 }}>
                    <input style={{ maxWidth: 300, marginBottom: 0 }} placeholder="Search by name..."
                        value={search} onChange={e => { setSearch(e.target.value); load(e.target.value) }} />
                </div>

                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Contact</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
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
                                            <option value="ONLINE">Online</option>
                                            <option value="BUSY">Busy</option>
                                            <option value="OFFLINE">Offline</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-sm" onClick={() => openEdit(c)}>Edit</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ color: '#9ca3af', textAlign: 'center', padding: 32 }}>
                                        {search ? 'No results' : 'No contacts'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>New contact</h3>
                        <div className="form-row">
                            <input placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                            <input placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        <div className="modal-actions">
                            <button className="btn" onClick={() => { setShowCreate(false); setForm(EMPTY_FORM) }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate}>Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit modal */}
            {editTarget && (
                <div className="modal-overlay" onClick={() => setEditTarget(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Edit contact</h3>
                        <div className="form-row">
                            <input placeholder="First name" value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                            <input placeholder="Last name" value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                        </div>
                        <input placeholder="Email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                        <input placeholder="Phone" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setEditTarget(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEdit}>Save</button>
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
