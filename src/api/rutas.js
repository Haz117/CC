import { supabase } from '../lib/supabase'
import { esDemo, demo, filas, traerTodo, aErrorDatos } from './fuente'

/* Ventas en ruta: lo que suben los teléfonos de los camiones (app cremeria-ruta).
   Las tablas, vistas y funciones están en cremeria-ruta/supabase/propuesta-ruta.sql. Mientras Luis
   no la aplique, la base responde que no existen y las pantallas lo dicen (código SIN_TABLAS).
   Cada camión es una sucursal; las vistas ya traen su nombre. */

// Jornadas que salieron en el periodo, más las que siguen en ruta aunque hayan salido antes.
export async function listarJornadas({ desde, hasta, sucursalId } = {}) {
  if (esDemo()) return (await demo()).listarJornadas({ desde, hasta, sucursalId })
  let consulta = supabase.from('v_ruta_jornadas').select('*')
    .or(`estado.eq.EN_RUTA,and(salida.gte."${desde}",salida.lt."${hasta}")`)
  if (sucursalId) consulta = consulta.eq('sucursal_id', sucursalId)
  return filas(consulta.order('salida', { ascending: false }).limit(1000))
}

// Ventas de una jornada, la más reciente primero, con su estado final y el ticket que se entregó.
export async function listarVentasDeJornada(turnoId) {
  if (esDemo()) return (await demo()).listarVentasDeJornada(turnoId)
  return filas(
    supabase.from('v_ruta_ventas')
      .select('id, folio, fecha, total_centavos, estado, metodo, ticket, motivo_cancelacion, lat, lng, detalle')
      .eq('turno_id', turnoId)
      .order('fecha', { ascending: false }),
  )
}

// Merma de una jornada, con su valor a precio de venta. En ruta nadie la autoriza: aquí se revisa.
export async function listarMermasDeJornada(turnoId) {
  if (esDemo()) return (await demo()).listarMermasDeJornada(turnoId)
  const filasMerma = await filas(
    supabase.from('ruta_envios').select('id, datos').eq('turno_id', turnoId).eq('tipo', 'merma'),
  )
  return filasMerma
    .map(({ id, datos }) => ({
      id, fecha: datos.fecha, descripcion: datos.descripcion, cantidad: datos.cantidad, unidad: datos.unidad,
      motivo: datos.motivo, importe_centavos: datos.importe_centavos ?? null,
    }))
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
}

// Puntos del recorrido en orden (uno por minuto en movimiento, uno cada 5 min parado).
export async function listarRecorrido(turnoId) {
  if (esDemo()) return (await demo()).listarRecorrido(turnoId)
  const { filas: puntos } = await traerTodo(opciones =>
    supabase.from('v_ruta_recorrido').select('lat, lng, precision_m, en', opciones).eq('turno_id', turnoId).order('en'),
  )
  return puntos
}

// Camiones dados de alta, con los teléfonos ligados a cada uno y cuándo subieron algo por última vez.
export async function listarCamiones() {
  if (esDemo()) return (await demo()).listarCamiones()
  const [camiones, telefonos] = await Promise.all([
    filas(supabase.from('ruta_camiones').select('sucursal_id, nombre, placas, prefijo, activo, actualizado_en, sucursal:sucursales(nombre)').order('nombre')),
    filas(supabase.from('ruta_telefonos').select('dispositivo_id, terminal, sucursal_id, registrado_en, ultimo_contacto, cuenta:usuarios(nombre_completo, usuario)')),
  ])
  return camiones.map(c => ({ ...c, telefonos: telefonos.filter(t => t.sucursal_id === c.sucursal_id) }))
}

// Alta o cambio de un camión. Solo administrador (la función lo revisa).
export async function guardarCamion({ sucursalId, nombre, placas, prefijo, activo = true }) {
  if (esDemo()) return (await demo()).guardarCamion({ sucursalId, nombre, placas, prefijo, activo })
  const { error } = await supabase.rpc('ruta_guardar_camion', {
    p_sucursal_id: sucursalId, p_nombre: nombre, p_placas: placas, p_prefijo: prefijo, p_activo: activo,
  })
  if (error) throw aErrorDatos(error)
}
