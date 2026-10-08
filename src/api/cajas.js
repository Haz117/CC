import { supabase } from '../lib/supabase'
import { esDemo, demo, filas, aErrorDatos } from './fuente'

// Turno de cada caja y su corte (esperado, contado, diferencia), con quién lo abrió,
// quién lo cerró, la caja y sus entradas y retiros de efectivo.
const TURNO = `id, sucursal_id, estado, abierto_en, cerrado_en, fondo_inicial_centavos,
  efectivo_esperado_centavos, efectivo_contado_centavos, diferencia_centavos, notas_cierre,
  cajero:usuarios!usuario_id(nombre_completo),
  cerro:usuarios!cerrado_por(nombre_completo),
  caja:dispositivo(nombre),
  movimientos_caja(tipo, monto_centavos, concepto, fecha)`

// Cajas abiertas ahora.
export async function listarTurnosAbiertos({ sucursalId } = {}) {
  if (esDemo()) return (await demo()).listarTurnosAbiertos({ sucursalId })
  let consulta = supabase.from('turnos_caja').select(TURNO).eq('estado', 'ABIERTO')
  if (sucursalId) consulta = consulta.eq('sucursal_id', sucursalId)
  return filas(consulta.order('abierto_en', { ascending: false }))
}

// Cortes de caja (turnos cerrados), del más reciente al más antiguo. Regresa { filas, total }.
export async function listarCortes({ sucursalId, desde, hasta, pagina = 0, porPagina = 50 } = {}) {
  if (esDemo()) return (await demo()).listarCortes({ sucursalId, desde, hasta, pagina, porPagina })
  let consulta = supabase.from('turnos_caja').select(TURNO, { count: 'exact' }).eq('estado', 'CERRADO')
  if (sucursalId) consulta = consulta.eq('sucursal_id', sucursalId)
  if (desde) consulta = consulta.gte('cerrado_en', desde)
  if (hasta) consulta = consulta.lt('cerrado_en', hasta)
  const { data, error, count } = await consulta
    .order('cerrado_en', { ascending: false })
    .range(pagina * porPagina, (pagina + 1) * porPagina - 1)
  if (error) throw aErrorDatos(error)
  return { filas: data ?? [], total: count ?? data?.length ?? 0 }
}
