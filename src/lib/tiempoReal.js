import { supabase } from './supabase'

// Tablas que avisan al momento cuando cambian (también respetan la sucursal del usuario).
export const TABLAS_EN_VIVO = ['ventas', 'turnos_caja', 'ordenes_reabastecimiento', 'bloqueos_acceso', 'ruta_envios']

// Un canal por tabla, compartido entre todas las pantallas que la escuchan.
const canales = new Map() // tabla → { canal, oyentes, cierre }

export function escucharTabla(tabla, alCambiar) {
  if (!supabase) return () => {}

  let entrada = canales.get(tabla)
  if (!entrada) {
    const oyentes = new Set()
    const canal = supabase
      .channel(`web-${tabla}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, (cambio) => {
        oyentes.forEach(fn => fn(cambio))
      })
      .subscribe()
    entrada = { canal, oyentes, cierre: null }
    canales.set(tabla, entrada)
  }
  clearTimeout(entrada.cierre)
  entrada.oyentes.add(alCambiar)

  return () => {
    entrada.oyentes.delete(alCambiar)
    if (entrada.oyentes.size > 0) return
    // Se espera un momento antes de cerrar: al cambiar de página la siguiente suele escuchar la misma tabla.
    entrada.cierre = setTimeout(() => {
      if (entrada.oyentes.size > 0 || canales.get(tabla) !== entrada) return
      canales.delete(tabla)
      supabase.removeChannel(entrada.canal)
    }, 3000)
  }
}

export function cerrarCanales() {
  canales.forEach(entrada => clearTimeout(entrada.cierre))
  canales.clear()
  supabase?.removeAllChannels()
}
