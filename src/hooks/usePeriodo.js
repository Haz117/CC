import { useState } from 'react'
import { rangoISO, rangoPreset } from '../utils/fmt'

// Periodo de un filtro: primer y último día ('yyyy-mm-dd'), el atajo activo (si lo hay)
// y el mismo rango en ISO para consultar la base.
export function usePeriodo(inicial = 'hoy') {
  const [{ preset, rango }, setPeriodo] = useState(() => ({ preset: inicial, rango: rangoPreset(inicial) }))
  const [dateFrom, dateTo] = rango

  const elegirPreset = (p) => setPeriodo({ preset: p, rango: rangoPreset(p) })
  // Un rango al revés se acomoda solo; una fecha vacía se ignora.
  const cambiarFecha = (desde, hasta) => {
    if (!desde || !hasta) return
    setPeriodo({ preset: null, rango: desde <= hasta ? [desde, hasta] : [hasta, desde] })
  }

  // "Hoy" va de la medianoche local a la siguiente, mandadas en ISO (la base guarda UTC).
  return { dateFrom, dateTo, ...rangoISO(dateFrom, dateTo), preset, elegirPreset, cambiarFecha }
}
