import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Info } from 'lucide-react'

// Se monta en <body>, como Modal: dentro de la página quedaba debajo de la barra de navegación del
// celular y sus botones no se podían tocar. El foco entra en "Cancelar", la opción segura.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  type         = 'danger',
  onConfirm,
  onCancel,
}) {
  const isDanger   = type === 'danger'
  const accentColor = isDanger ? '#8A4A42' : '#C2410C'
  const iconBg      = isDanger ? 'rgba(201,122,109,.12)' : '#FFF7ED'
  const btnBg       = isDanger ? '#8A4A42' : '#C2410C'
  const ringColor   = isDanger ? 'rgba(201,122,109,.14)' : 'rgba(249,115,22,.14)'
  const idTitulo = useId()
  const idMensaje = useId()
  // En un efecto y no con autoFocus: si se abre al cerrar otra ventana, esa devuelve el foco a su botón
  // después de montar esta, y el efecto corre después de esa limpieza.
  const cancelar = useRef(null)
  useEffect(() => { cancelar.current?.focus() }, [])

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card max-w-sm" role="alertdialog" aria-modal="true" aria-labelledby={idTitulo} aria-describedby={idMensaje} style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: 'calc(100dvh - 2rem)' }}>
        {/* Top accent stripe */}
        <div className="h-[3px] w-full" style={{ background: accentColor }} />

        <div className="p-7 flex flex-col items-center text-center">
          {/* Icon with ring */}
          <div className="relative mb-6">
            <div
              className="absolute inset-0 rounded-2xl confirm-icon-ring"
              style={{ boxShadow: `0 0 0 10px ${ringColor}`, borderRadius: '20px' }}
            />
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{ background: iconBg }}
            >
              {isDanger
                ? <AlertTriangle className="w-8 h-8" style={{ color: accentColor }} />
                : <Info className="w-8 h-8" style={{ color: accentColor }} />
              }
            </div>
          </div>

          <h3 id={idTitulo} className="text-base font-bold mb-2 tracking-tight" style={{ color: '#263442' }}>{title}</h3>
          <p id={idMensaje} className="text-sm leading-relaxed max-w-[260px]" style={{ color: '#627080' }}>{message}</p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            className="btn-secondary flex-1"
            onClick={onCancel}
            style={{ fontWeight: 700 }}
            ref={cancelar}
          >
            {cancelLabel}
          </button>
          <button
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: btnBg }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '.88' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            onMouseDown={e => { e.currentTarget.style.opacity = '.75' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
