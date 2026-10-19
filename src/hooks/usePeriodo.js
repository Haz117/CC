import { rangoISO, rangoPreset } from '../utils/fmt'
import { useEstadoSesion } from './useEstadoSesion'

// Periodo de un filtro: primer y último día ('yyyy-mm-dd'), el atajo activo (si lo hay)
// y el mismo rango en ISO para consultar la base.
// Con `clave` se acuerda al cambiar de pantalla. Si se eligió un atajo ("Semana"), al volver se
// recalcula para hoy; si se eligió un rango a mano, se queda ese rango.
export function usePeriodo(inicial = 'hoy', clave = null) {
  const [guardado, setPeriodo] = useEstadoSesion(clave ? `periodo:${clave}` : null, { preset: inicial, rango: null })
  const preset = guardado.preset
  const rango = preset ? rangoPreset(preset) : guardado.rango ?? rangoPreset(inicial)
  const [dateFrom, dateTo] = rango

  const elegirPreset = (p) => setPeriodo({ preset: p, rango: null })
  // Un rango al revés se acomoda solo; una fecha vacía se ignora.
  const cambiarFecha = (desde, hasta) => {
    if (!desde || !hasta) return
    setPeriodo({ preset: null, rango: desde <= hasta ? [desde, hasta] : [hasta, desde] })
  }

  // "Hoy" va de la medianoche local a la siguiente, mandadas en ISO (la base guarda UTC).
  return { dateFrom, dateTo, ...rangoISO(dateFrom, dateTo), preset, elegirPreset, cambiarFecha }
}
