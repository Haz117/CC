import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react'
import { useAuth } from '../auth/contexto'

// Error al consultar la base, con el mensaje legible de src/api y un botón para reintentar.
// Con la sesión vencida reintentar no sirve: el botón lleva a iniciar sesión de nuevo.
export default function AvisoError({ error, onReintentar, className = '' }) {
  const { cerrarSesion } = useAuth()
  if (!error) return null
  const sesionVencida = error.codigo === 'SESION'
  return (
    <div
      role="alert"
      className={`flex items-center gap-3 flex-wrap rounded-2xl px-4 py-3.5${className ? ' ' + className : ''}`}
      style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.25)' }}
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#C97A6D' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: '#A05A52' }}>No se pudieron cargar los datos</p>
        <p className="text-xs mt-0.5" style={{ color: '#C97A6D' }}>{error.message}</p>
      </div>
      {sesionVencida ? (
        <button onClick={cerrarSesion} className="btn-primary">
          <LogIn className="w-4 h-4" /> Iniciar sesión
        </button>
      ) : onReintentar && (
        <button onClick={onReintentar} className="btn-secondary">
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      )}
    </div>
  )
}
