import { useEffect, useState } from 'react'
import { RefreshCw, CloudOff } from 'lucide-react'
import { useSincronizacion } from '../lib/sincronizacion'
import { haceCuanto, hora } from '../utils/fmt'

// Cuándo llegaron los últimos datos de la base, dicho en palabras ("Actualizado hace 2 min").
// La pantalla se actualiza sola con los cambios de las cajas; tocarlo vuelve a consultar ya.
// `error`: la consulta de esta pantalla falló. La hora de arriba es la de cualquier consulta que llegó bien,
// así que con error decía "Actualizado justo ahora" aunque aquí no se hubiera cargado nada.
export default function EnVivo({ actualizando = false, error = null }) {
  const { desde, enLinea } = useSincronizacion()
  const [ahora, setAhora] = useState(Date.now)

  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 20000)
    return () => clearInterval(reloj)
  }, [])

  const texto = !enLinea
    ? (desde ? `Sin conexión · datos de las ${hora(desde)}` : 'Sin conexión')
    : actualizando ? 'Actualizando…'
    : error ? 'No se pudo actualizar · reintentar'
    : !desde ? 'Actualizando…' : `Actualizado ${haceCuanto(desde, ahora)}`
  const Icono = enLinea ? RefreshCw : CloudOff

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('app:refrescar'))}
      disabled={!enLinea}
      title="Se actualiza sola cuando las cajas suben cambios. Toca para consultar ahora."
      className={`sincronia${enLinea ? (error && !actualizando ? ' con-error' : '') : ' sin-red'}`}
    >
      <Icono className={`sincronia-icono${actualizando && enLinea ? ' animate-spin' : ''}`} aria-hidden="true" />
      <span aria-live="polite">{texto}</span>
    </button>
  )
}
