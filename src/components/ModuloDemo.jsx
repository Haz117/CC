import { FlaskConical } from 'lucide-react'

// Envuelve los módulos que la base todavía no respalda (distribuidores, rutas, compras),
// para que nadie confunda sus datos de ejemplo con datos reales.
export default function ModuloDemo({ nombre, children }) {
  return (
    <>
      <div
        role="note"
        className="flex items-start gap-3 rounded-2xl px-4 py-3.5 mb-5"
        style={{ background: 'rgba(124,58,237,.06)', border: '1px solid rgba(124,58,237,.22)' }}
      >
        <FlaskConical className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
        <div>
          <p className="text-sm font-bold" style={{ color: '#7c3aed' }}>{nombre}: módulo con datos de ejemplo</p>
          <p className="text-xs mt-0.5" style={{ color: '#627080' }}>
            La base todavía no tiene tablas para este módulo. Lo que ves aquí no viene de las cajas y los cambios no se guardan.
          </p>
        </div>
      </div>
      {children}
    </>
  )
}
