import { supabase } from '../lib/supabase'
import { esDemo, demo, filas, aErrorDatos } from './fuente'

// Clave y valor globales (ej. alerta.dias_sin_venta = 30).
export async function listarConfiguracion() {
  if (esDemo()) return (await demo()).listarConfiguracion()
  return filas(supabase.from('configuracion_general').select('*'))
}

// Auditoría de cada acción, con folio único. Regresa { filas, total }.
export async function listarBitacora({ pagina = 0, porPagina = 25 } = {}) {
  if (esDemo()) return (await demo()).listarBitacora({ pagina, porPagina })
  const { data, error, count } = await supabase
    .from('bitacora')
    .select('*', { count: 'exact' })
    .order('fecha', { ascending: false })
    .range(pagina * porPagina, (pagina + 1) * porPagina - 1)
  if (error) throw aErrorDatos(error)
  return { filas: data ?? [], total: count ?? data?.length ?? 0 }
}

// Cuenta filas sin traerlas. Si el rol no puede ver la tabla la base regresa 0, no un error.
async function contar(consulta) {
  const { count, error } = await consulta
  return error ? null : count ?? 0
}

// Avisos del encabezado y del menú: cuatro conteos baratos sobre tablas que cambian en vivo.
export async function contarAvisos({ hoy }) {
  if (esDemo()) return (await demo()).contarAvisos({ hoy })
  const cabeza = { count: 'exact', head: true }
  const [ordenesPendientes, canceladasHoy, cortesConDiferencia, cajasAbiertas] = await Promise.all([
    contar(supabase.from('ordenes_reabastecimiento').select('*', cabeza).eq('estado', 'PENDIENTE')),
    contar(supabase.from('ventas').select('id', cabeza).eq('estado', 'CANCELADA').gte('fecha', hoy)),
    contar(supabase.from('turnos_caja').select('id', cabeza).eq('estado', 'CERRADO')
      .neq('diferencia_centavos', 0).gte('cerrado_en', hoy)),
    contar(supabase.from('turnos_caja').select('id', cabeza).eq('estado', 'ABIERTO')),
  ])
  return { ordenesPendientes, canceladasHoy, cortesConDiferencia, cajasAbiertas }
}
