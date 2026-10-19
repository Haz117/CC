import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

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
  const tarjeta = useRef(null)
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

  // Al abrir, el foco entra al modal (salvo que un campo de adentro ya lo tenga); Tab da la vuelta
  // sin salirse y, al cerrar, el foco regresa al botón que lo abrió.
  useEffect(() => {
    const nodo = tarjeta.current
    const previo = document.activeElement
    if (!nodo.contains(previo)) nodo.focus()
    const alTeclear = (e) => {
      if (e.key !== 'Tab') return
      const lista = [...nodo.querySelectorAll(ENFOCABLES)].filter(el => el.offsetParent !== null)
      if (lista.length === 0) return e.preventDefault()
      const primero = lista[0]
      const ultimo = lista[lista.length - 1]
      const actual = document.activeElement
      if (e.shiftKey && (actual === primero || actual === nodo)) { e.preventDefault(); ultimo.focus() }
      else if (!e.shiftKey && actual === ultimo) { e.preventDefault(); primero.focus() }
    }
    nodo.addEventListener('keydown', alTeclear)
    return () => {
      nodo.removeEventListener('keydown', alTeclear)
      if (previo instanceof HTMLElement && document.contains(previo)) previo.focus()
    }
  }, [])

  // Se monta en <body>: así queda centrado en la ventana y encima del menú,
  // sin importar dentro de qué tarjeta o encabezado se haya abierto.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="modal-overlay"
      onClick={closeOnOverlay && onClose ? e => { if (e.target === e.currentTarget) onClose() } : undefined}
    >
      <div
        ref={tarjeta}
        tabIndex={-1}
        className={`modal-card ${sizes[maxWidth]}${shake ? ' animate-shake' : ''}`}
        style={{ outline: 'none' }}
        {...(id ? { id } : {})}
      >
        <div className="modal-header">
          {header ? <div id={titleId}>{header}</div> : (subtitle
            ? <div id={titleId}>
                <h3 className="font-bold" style={{ color: '#263442' }}>{title}</h3>
                <p className="text-xs mt-0.5" style={{ color: '#627080' }}>{subtitle}</p>
              </div>
            : <h3 id={titleId} className="font-bold" style={{ color: '#263442' }}>{title}</h3>
          )}
          <button onClick={onClose} aria-label="Cerrar" className="modal-close">×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
