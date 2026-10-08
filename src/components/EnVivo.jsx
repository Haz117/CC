import { useAuth } from '../auth/contexto'

// Indica que la pantalla se actualiza sola cuando las cajas suben cambios.
export default function EnVivo({ actualizando = false }) {
  const { modoDemo } = useAuth()
  if (modoDemo) return null
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold"
      style={{ background: 'rgba(5,150,105,.08)', color: '#059669', border: '1px solid rgba(5,150,105,.18)' }}
      title="Se actualiza sola cuando las cajas suben cambios"
    >
      <span className="live-dot" style={{ background: '#059669' }} />
      {actualizando ? 'Actualizando…' : 'En vivo'}
    </span>
  )
}
