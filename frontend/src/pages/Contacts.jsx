import { useEffect, useState } from 'react'
import { contactsApi } from '../api'
import TopBar from '../components/TopBar'
import ConfirmModal from '../components/ConfirmModal'

const AVATAR_COLORS = [
    ['#E6F1FB', '#0C447C'], ['#EEEDFE', '#3C3489'], ['#EAF3DE', '#27500A'],
    ['#FAEEDA', '#633806'], ['#FBEAF0', '#72243E'], ['#E1F5EE', '#085041'],
]

const STATUS_OPTIONS = ['ONLINE', 'BUSY', 'OFFLINE']
const STATUS_CLASS   = { ONLINE: 'badge-online', BUSY: 'badge-busy', OFFLINE: 'badge-offline' }
const STATUS_LABEL   = { ONLINE: 'Online',       BUSY: 'Busy',       OFFLINE: 'Offline' }

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '' }

export default function Contacts() {
    const [contacts,   setContacts]   = useState([])
    const [search,     setSearch]     = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [form,       setForm]       = useState(EMPTY_FORM)
    const [editForm,   setEditForm]   = useState({ ...EMPTY_FORM, status: 'OFFLINE' })
    const [confirm,    setConfirm]    = useState(null)
    const [error,      setError]      = useState(null)

    const load = (s) => contactsApi.getAll(s ? { search: s } : {})
        .then(r => setContacts(r.data))
        .catch(() => setError('Could not load contacts.'))

    useEffect(() => { load() }, [])

    const handleCreate = async () => {
        try {
            await contactsApi.create(form)
            setShowCreate(false)
            setForm(EMPTY_FORM)
            load(search)
        } catch {
            setError('Could not create contact.')
        }
    }

    const openEdit = (c) => {
        setEditTarget(c)
        setEditForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone ?? '', status: c.status ?? 'OFFLINE' })
    }

    const handleEdit = async () => {
        try {
            await contactsApi.update(editTarget.id, { firstName: editForm.firstName, lastName: editForm.lastName, email: editForm.email, phone: editForm.phone })
            if (editForm.status !== editTarget.status) {
                await contactsApi.updateStatus(editTarget.id, editForm.status)
            }
            setEditTarget(null)
            load(search)
        } catch {
            setError('Could not update contact.')
        }
    }

    const handleDelete = (id) => setConfirm({ id, message: 'Delete this contact?' })

    const confirmDelete = async () => {
        try { await contactsApi.delete(confirm.id) } catch { setError('Could not delete contact.') }
        setConfirm(null)
        load(search)
    }

    return (
        <div className="main-content">
            <TopBar title="Contacts" action={
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New contact</button>
            } />

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

                <div style={{ marginBottom: 16 }}>
                    <input
                        style={{ maxWidth: 300, marginBottom: 0 }}
                        placeholder="Search by name…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); load(e.target.value) }}
                    />
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                            {contacts.map((c, i) => {
                                const [bg, clr] = AVATAR_COLORS[i % AVATAR_COLORS.length]
                                return (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="avatar" style={{ background: bg, color: clr }}>
                                                    {c.firstName?.[0]}{c.lastName?.[0]}
                                                </div>
                                                <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                                    {c.firstName} {c.lastName}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                                            {c.email}
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                            {c.phone ?? '—'}
                                        </td>
                                        <td>
                                            <span className={`badge ${STATUS_CLASS[c.status] || 'badge-offline'}`}>
                                                {STATUS_LABEL[c.status] || 'Offline'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-sm" onClick={() => openEdit(c)}>Edit</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)', fontSize: 13 }}>
                                        {search ? 'No contacts match your search' : 'No contacts yet'}
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
                            <input placeholder="First name" value={form.firstName}
                                onChange={e => setForm({ ...form, firstName: e.target.value })} />
                            <input placeholder="Last name" value={form.lastName}
                                onChange={e => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                        <input placeholder="Email" value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })} />
                        <input placeholder="Phone (optional)" value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })} />
                        <div className="modal-actions">
                            <button className="btn" onClick={() => { setShowCreate(false); setForm(EMPTY_FORM) }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={!form.firstName.trim()}>Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit modal — includes status field */}
            {editTarget && (
                <div className="modal-overlay" onClick={() => setEditTarget(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Edit contact</h3>
                        <div className="form-row">
                            <input placeholder="First name" value={editForm.firstName}
                                onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                            <input placeholder="Last name" value={editForm.lastName}
                                onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                        </div>
                        <input placeholder="Email" value={editForm.email}
                            onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                        <input placeholder="Phone (optional)" value={editForm.phone}
                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Status</div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                            {STATUS_OPTIONS.map(s => (
                                <button key={s} onClick={() => setEditForm({ ...editForm, status: s })}
                                    style={{
                                        padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                                        border: '0.5px solid var(--color-border-secondary)',
                                        background: editForm.status === s ? '#185FA5' : 'var(--color-background-secondary)',
                                        color:      editForm.status === s ? '#fff'    : 'var(--color-text-secondary)',
                                        fontFamily: 'inherit', transition: 'all 0.12s',
                                    }}>
                                    {STATUS_LABEL[s]}
                                </button>
                            ))}
                        </div>
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
