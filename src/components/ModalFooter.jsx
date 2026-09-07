export default function ModalFooter({ onCancel, onConfirm, confirmLabel = 'Guardar', cancelLabel = 'Cancelar', disabled = false, confirmStyle = {} }) {
  return (
    <div className="modal-footer px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #FDE8D0' }}>
      <button onClick={onCancel} className="btn-secondary">{cancelLabel}</button>
      <button onClick={onConfirm} className="btn-primary" disabled={disabled} style={confirmStyle}>{confirmLabel}</button>
    </div>
  )
}
