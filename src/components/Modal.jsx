import { useId } from 'react'

export default function Modal({
  title,
  subtitle,
  header,
  onClose,
  closeOnOverlay = true,
  maxWidth = 'md',
  shake = false,
  id,
  children
}) {
  const titleId = useId()
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="modal-overlay"
      onClick={closeOnOverlay && onClose ? e => { if (e.target === e.currentTarget) onClose() } : undefined}
    >
      <div
        className={`modal-card ${sizes[maxWidth]}${shake ? ' animate-shake' : ''}`}
        {...(id ? { id } : {})}
      >
        <div className="modal-header">
          {header ?? (subtitle
            ? <div id={titleId}>
                <h3 className="font-bold" style={{ color: '#263442' }}>{title}</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8FA1B2' }}>{subtitle}</p>
              </div>
            : <h3 id={titleId} className="font-bold" style={{ color: '#263442' }}>{title}</h3>
          )}
          <button onClick={onClose} aria-label="Cerrar" className="modal-close">×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
