export default function ConfirmModal({ message, onConfirm, onCancel, danger = true }) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 10 }}>Confirm</h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
                <div className="modal-actions">
                    <button className="btn" onClick={onCancel}>Cancel</button>
                    <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    )
}
