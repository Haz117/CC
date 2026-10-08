import { supabase } from '../lib/supabase'
import { esDemo, demo, filas, traerTodo, aErrorDatos } from './fuente'

/* Ninguna consulta filtra por sucursal: la base ya lo hace según el usuario.
   Un administrador que quiere ver una sola sucursal manda `sucursalId`.
   Se ordena y filtra por `fecha` (la de la venta), no por `sincronizado_en`:
   una caja que estuvo sin internet sube después ventas con su fecha original. */

// `ventas` tiene tres llaves a `usuarios`, así que hay que decir por cuál columna se pide el cajero.
const ENCABEZADO = `id, folio, fecha, total_centavos, estado, sucursal_id,
  cajero:usuarios!usuario_id(nombre_completo)`

function enRango(consulta, { desde, hasta, sucursalId }) {
  if (desde) consulta = consulta.gte('fecha', desde)
  if (hasta) consulta = consulta.lt('fecha', hasta)
  if (sucursalId) consulta = consulta.eq('sucursal_id', sucursalId)
  return consulta.order('fecha', { ascending: false }).order('id')
}

// Ventas con cajero y pagos en el rango [desde, hasta) (ISO). Regresa { filas, total, truncado }.
export async function listarVentas(filtro = {}) {
  if (esDemo()) return (await demo()).listarVentas(filtro)
  return traerTodo(opciones => enRango(
    supabase.from('ventas').select(`${ENCABEZADO}, venta_pagos(metodo, monto_centavos)`, opciones),
    filtro,
  ))
}

// Solo lo necesario para sumar (tablero y reportes de periodos largos).
export async function listarVentasResumen(filtro = {}) {
  if (esDemo()) return (await demo()).listarVentas(filtro)
  return traerTodo(opciones => enRango(
    supabase.from('ventas').select('id, folio, fecha, total_centavos, estado, sucursal_id', opciones),
    filtro,
  ))
}

// Un ticket completo: renglones (copian nombre y precio al vender) y pagos.
export async function obtenerTicket(ventaId) {
  if (esDemo()) return (await demo()).obtenerTicket(ventaId)
  const { data, error } = await supabase
    .from('ventas')
    .select(`${ENCABEZADO},
      venta_detalle(renglon, descripcion, unidad, cantidad, precio_unitario_centavos, importe_centavos),
      venta_pagos(metodo, monto_centavos)`)
    .eq('id', ventaId)
    .maybeSingle()
  if (error) throw aErrorDatos(error)
  return data
}

// Últimas ventas del día, para la actividad en vivo del tablero.
export async function listarUltimasVentas({ desde, limite = 8 } = {}) {
  if (esDemo()) return (await demo()).listarUltimasVentas({ desde, limite })
  return filas(
    supabase.from('ventas').select(ENCABEZADO).gte('fecha', desde)
      .order('fecha', { ascending: false }).limit(limite),
  )
}
