import { supabase } from '../lib/supabase'
import { esDemo, demo, filas, traerTodo, aErrorDatos } from './fuente'

// Catálogo con su categoría y sus presentaciones (granel, pieza, caja).
// No se borra nada: en catálogos se filtra `activo = true` y `eliminado_en is null`.
export async function listarProductos() {
  if (esDemo()) return (await demo()).listarProductos()
  const { filas: productos } = await traerTodo(opciones =>
    supabase.from('productos')
      .select(`id, clave, nombre, unidad, categoria_id,
        categorias(nombre, color),
        presentaciones(id, nombre, tipo, factor, codigo_barras, es_principal, activo)`, opciones)
      .eq('activo', true).is('eliminado_en', null)
      .order('nombre').order('id'),
  )
  return productos
}

// Existencia por producto y sucursal, en la unidad del producto (piezas o kilos).
export async function listarExistencias({ sucursalId } = {}) {
  if (esDemo()) return (await demo()).listarExistencias({ sucursalId })
  const { filas: existencias } = await traerTodo(opciones => {
    let consulta = supabase.from('v_existencias').select('producto_id, sucursal_id, existencia', opciones)
    if (sucursalId) consulta = consulta.eq('sucursal_id', sucursalId)
    return consulta.order('producto_id').order('sucursal_id')
  })
  return existencias
}

// Mínimo y máximo por producto y sucursal, para marcar lo que está bajo el mínimo.
export async function listarLimites({ sucursalId } = {}) {
  if (esDemo()) return (await demo()).listarLimites({ sucursalId })
  const { filas: limites } = await traerTodo(opciones => {
    let consulta = supabase.from('limites_sucursal').select('*', opciones)
    if (sucursalId) consulta = consulta.eq('sucursal_id', sucursalId)
    return consulta.order('producto_id').order('sucursal_id')
  })
  return limites // esta tabla no tiene borrado lógico (ni `activo` ni `eliminado_en`)
}

// Pedidos sugeridos que la base generó cuando un producto bajó del mínimo.
export async function listarOrdenesPendientes() {
  if (esDemo()) return (await demo()).listarOrdenesPendientes()
  return filas(supabase.from('ordenes_reabastecimiento').select('*').eq('estado', 'PENDIENTE'))
}

// Producto perdido o dañado, con su costo. Regresa { filas, total }.
export async function listarMermas({ sucursalId, desde, hasta, pagina = 0, porPagina = 100 } = {}) {
  if (esDemo()) return (await demo()).listarMermas({ sucursalId, desde, hasta, pagina, porPagina })
  let consulta = supabase.from('mermas')
    .select('folio, fecha, cantidad, costo_centavos, motivo, sucursal_id, productos(nombre, unidad)', { count: 'exact' })
  if (sucursalId) consulta = consulta.eq('sucursal_id', sucursalId)
  if (desde) consulta = consulta.gte('fecha', desde)
  if (hasta) consulta = consulta.lt('fecha', hasta)
  const { data, error, count } = await consulta
    .order('fecha', { ascending: false })
    .range(pagina * porPagina, (pagina + 1) * porPagina - 1)
  if (error) throw aErrorDatos(error)
  return { filas: data ?? [], total: count ?? data?.length ?? 0 }
}
