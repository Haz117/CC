/* PostgREST no suma ni agrupa: los totales se calculan aquí, con las filas que llegan.
   Todo el dinero sigue en centavos; se convierte a pesos solo al mostrar. */
// Con extensión para que `node --test` pueda importar este módulo sin pasar por Vite.
import { diaLocal, diaCorto, inicioDelDia, sumarDias } from '../utils/fmt.js'

const capital = (texto) => {
  const t = String(texto ?? '').replace(/_/g, ' ').toLowerCase()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/* ── Ventas ──────────────────────────────────────────────── */
// Las ventas canceladas siguen en `ventas` con estado = 'CANCELADA': se excluyen de los totales.
export const esCompletada = (venta) => venta.estado === 'COMPLETADA'
export const esCancelada  = (venta) => venta.estado === 'CANCELADA'

export const etiquetaEstado = (estado) => capital(estado) || '—'
// Códigos de la base para la gente: 'VENTA_CANCELADA' → 'Venta cancelada'
export const etiquetaCodigo = (codigo) => capital(codigo) || '—'
export const colorEstado    = (estado) => ({ COMPLETADA: 'green', CANCELADA: 'red' })[estado] ?? 'amber'

const ETIQUETA_METODO = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' }
const COLOR_METODO    = { EFECTIVO: '#047857', TARJETA: '#C2410C', TRANSFERENCIA: '#6D28D9' }
export const etiquetaMetodo = (metodo) => ETIQUETA_METODO[metodo] ?? capital(metodo)
export const colorMetodo    = (metodo) => COLOR_METODO[metodo] ?? '#627080'

// Un ticket puede pagarse con varios métodos.
export function metodoDeVenta(venta) {
  const metodos = [...new Set((venta.venta_pagos ?? []).map(p => p.metodo))]
  if (metodos.length === 0) return '—'
  return metodos.length > 1 ? 'Mixto' : etiquetaMetodo(metodos[0])
}

export function resumenVentas(ventas) {
  let completadas = 0, canceladas = 0, vendido = 0, cancelado = 0
  for (const v of ventas) {
    if (esCompletada(v)) { completadas++; vendido += v.total_centavos }
    else if (esCancelada(v)) { canceladas++; cancelado += v.total_centavos }
  }
  return {
    completadas, canceladas, vendido, cancelado,
    otras: ventas.length - completadas - canceladas,
    ticketPromedio: completadas ? Math.round(vendido / completadas) : 0,
  }
}

// Ventas completadas por día local, con los días sin venta en cero.
export function ventasPorDia(ventas, primerDia, ultimoDia) {
  const dias = new Map()
  const fin = inicioDelDia(ultimoDia)
  for (let d = inicioDelDia(primerDia); d <= fin; d = sumarDias(d, 1)) {
    dias.set(diaLocal(d), { dia: diaLocal(d), etiqueta: diaCorto(d), centavos: 0, tickets: 0 })
  }
  for (const v of ventas) {
    const dia = esCompletada(v) && dias.get(diaLocal(v.fecha))
    if (dia) { dia.centavos += v.total_centavos; dia.tickets++ }
  }
  return [...dias.values()].map(d => ({ ...d, total: d.centavos / 100 }))
}

// Ventas completadas de un día por hora local, de la primera a la última hora con venta.
export function ventasPorHora(ventas) {
  const horas = new Map()
  for (const v of ventas) {
    if (!esCompletada(v)) continue
    const h = new Date(v.fecha).getHours()
    const hora = horas.get(h) ?? { hora: h, centavos: 0, tickets: 0 }
    hora.centavos += v.total_centavos
    hora.tickets++
    horas.set(h, hora)
  }
  if (horas.size === 0) return []
  const lista = []
  for (let h = Math.min(...horas.keys()); h <= Math.max(...horas.keys()); h++) {
    const hora = horas.get(h) ?? { hora: h, centavos: 0, tickets: 0 }
    lista.push({ ...hora, etiqueta: `${String(h).padStart(2, '0')}:00`, total: hora.centavos / 100 })
  }
  return lista
}

// Por sucursal: Map sucursal_id → { centavos, tickets, canceladas }
export function ventasPorSucursal(ventas) {
  const mapa = new Map()
  for (const v of ventas) {
    const s = mapa.get(v.sucursal_id) ?? { sucursal_id: v.sucursal_id, centavos: 0, tickets: 0, canceladas: 0 }
    if (esCompletada(v)) { s.centavos += v.total_centavos; s.tickets++ }
    else if (esCancelada(v)) s.canceladas++
    mapa.set(v.sucursal_id, s)
  }
  return mapa
}

// Cobrado por método de pago en las ventas completadas, de mayor a menor.
export function pagosPorMetodo(ventas) {
  const mapa = new Map()
  for (const v of ventas) {
    if (!esCompletada(v)) continue
    for (const p of v.venta_pagos ?? []) {
      const m = mapa.get(p.metodo) ?? { metodo: p.metodo, centavos: 0, pagos: 0 }
      m.centavos += p.monto_centavos
      m.pagos++
      mapa.set(p.metodo, m)
    }
  }
  return [...mapa.values()].sort((a, b) => b.centavos - a.centavos)
}

// Cobrado en el tiempo por método, solo ventas completadas: por hora si es un solo día, si no por día
// (con los días sin cobro en cero). Cada renglón trae { etiqueta, [METODO]: pesos }; `metodos` va en
// orden fijo (efectivo, tarjeta, transferencia y luego los demás) para que cada uno conserve su color.
const ORDEN_METODOS = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']
export function pagosEnElTiempo(ventas, primerDia, ultimoDia) {
  const porHora = primerDia === ultimoDia
  const grupos = new Map()
  if (!porHora) {
    const fin = inicioDelDia(ultimoDia)
    for (let d = inicioDelDia(primerDia); d <= fin; d = sumarDias(d, 1)) {
      grupos.set(diaLocal(d), { clave: diaLocal(d), etiqueta: diaCorto(d), centavos: {} })
    }
  }
  const metodos = new Set()
  for (const v of ventas) {
    if (!esCompletada(v)) continue
    const clave = porHora ? new Date(v.fecha).getHours() : diaLocal(v.fecha)
    if (!porHora && !grupos.has(clave)) continue
    const g = grupos.get(clave) ?? { clave, etiqueta: `${String(clave).padStart(2, '0')}:00`, centavos: {} }
    for (const p of v.venta_pagos ?? []) {
      metodos.add(p.metodo)
      g.centavos[p.metodo] = (g.centavos[p.metodo] ?? 0) + p.monto_centavos
    }
    grupos.set(clave, g)
  }
  // Por hora: de la primera a la última hora con cobro, sin huecos
  if (porHora && grupos.size) {
    for (let h = Math.min(...grupos.keys()); h <= Math.max(...grupos.keys()); h++) {
      if (!grupos.has(h)) grupos.set(h, { clave: h, etiqueta: `${String(h).padStart(2, '0')}:00`, centavos: {} })
    }
  }
  const orden = [...ORDEN_METODOS.filter(m => metodos.has(m)), ...[...metodos].filter(m => !ORDEN_METODOS.includes(m)).sort()]
  const filas = [...grupos.values()]
    .sort((a, b) => (a.clave < b.clave ? -1 : 1))
    .map(g => ({ clave: g.clave, etiqueta: g.etiqueta, ...Object.fromEntries(orden.map(m => [m, (g.centavos[m] ?? 0) / 100])) }))
  return { filas, metodos: orden, porHora }
}

/* ── Turnos de caja ──────────────────────────────────────── */
const esRetiro = (movimiento) => /RETIRO|SALIDA/i.test(movimiento.tipo ?? '')

export function movimientosDeTurno(turno) {
  let entradas = 0, retiros = 0
  for (const m of turno.movimientos_caja ?? []) {
    if (esRetiro(m)) retiros += m.monto_centavos
    else entradas += m.monto_centavos
  }
  return { entradas, retiros }
}

export const signoMovimiento = (movimiento) => (esRetiro(movimiento) ? -1 : 1)

// Cortes agrupados por quien atendió la caja: cuántos hizo, cuántos con faltante o sobrante
// y la diferencia neta (contado − esperado). Primero quien más faltante acumula.
export function diferenciasPorCajero(cortes, nombreDe = (c) => c.cajero?.nombre_completo ?? '—') {
  const mapa = new Map()
  for (const c of cortes) {
    const nombre = nombreDe(c)
    const x = mapa.get(nombre) ?? { nombre, cortes: 0, faltantes: 0, sobrantes: 0, neta: 0 }
    const d = c.diferencia_centavos ?? 0
    x.cortes++
    x.neta += d
    if (d < 0) x.faltantes++
    else if (d > 0) x.sobrantes++
    mapa.set(nombre, x)
  }
  return [...mapa.values()].sort((a, b) => a.neta - b.neta || b.faltantes - a.faltantes || a.nombre.localeCompare(b.nombre, 'es'))
}

/* ── Inventario ──────────────────────────────────────────── */
export const NIVEL = {
  CRITICO: { clave: 'CRITICO', label: 'Crítico',    color: 'red',   tono: '#8A4A42' },
  BAJO:    { clave: 'BAJO',    label: 'Bajo',       color: 'amber', tono: '#92400E' },
  NORMAL:  { clave: 'NORMAL',  label: 'Normal',     color: 'green', tono: '#047857' },
  LIBRE:   { clave: 'LIBRE',   label: 'Sin mínimo', color: 'gray',  tono: '#627080' },
  SIN:     { clave: 'SIN',     label: 'Sin existencia', color: 'gray', tono: '#627080' },
}

// Bajar del mínimo dispara el reabastecimiento; a la mitad del mínimo (o agotado) ya es crítico.
// Sin límite configurado no hay alerta: la sucursal puede simplemente no manejar el producto.
export function nivelDe(existencia, minimo) {
  if (minimo == null) return existencia > 0 ? NIVEL.LIBRE : NIVEL.SIN
  if (existencia <= minimo / 2) return NIVEL.CRITICO
  return existencia < minimo ? NIVEL.BAJO : NIVEL.NORMAL
}

export const esBajo = (nivel) => nivel === NIVEL.CRITICO || nivel === NIVEL.BAJO

const PEOR = ['CRITICO', 'BAJO', 'NORMAL', 'LIBRE', 'SIN']
const razon = (s) => s.existencia / s.minimo

/* Une el catálogo con sus existencias (v_existencias) y límites (limites_sucursal).
   Regresa un renglón por producto con el desglose por sucursal. Viendo varias sucursales a la vez:
   - `existencia`, `minimo` y `nivelTotal` son la suma: el almacén puede tapar el faltante de una tienda.
   - `nivel` es el de la sucursal que peor está, y `peor` es esa sucursal. */
export function armarInventario({ productos = [], existencias = [], limites = [] }) {
  const limiteDe = new Map(limites.map(l => [`${l.producto_id}|${l.sucursal_id}`, l]))
  const porProducto = new Map()
  for (const e of existencias) {
    const limite = limiteDe.get(`${e.producto_id}|${e.sucursal_id}`)
    const existencia = Number(e.existencia) || 0
    const minimo = limite ? Number(limite.minimo) : null
    const lista = porProducto.get(e.producto_id) ?? []
    lista.push({
      sucursal_id: e.sucursal_id, existencia, minimo,
      maximo: limite ? Number(limite.maximo) : null,
      nivel: nivelDe(existencia, minimo),
    })
    porProducto.set(e.producto_id, lista)
  }

  return productos.map(p => {
    const porSucursal = porProducto.get(p.id) ?? []
    const conMinimo = porSucursal.filter(s => s.minimo != null)
    const comparables = conMinimo.filter(s => s.minimo > 0)
    const existencia = porSucursal.reduce((s, x) => s + x.existencia, 0)
    const minimo = conMinimo.length ? conMinimo.reduce((s, x) => s + x.minimo, 0) : null
    return {
      ...p,
      categoria: p.categorias?.nombre ?? 'Sin categoría',
      existencia,
      minimo,
      maximo: conMinimo.length ? conMinimo.reduce((s, x) => s + (x.maximo ?? 0), 0) : null,
      bajos: porSucursal.filter(s => esBajo(s.nivel)).length,
      porSucursal,
      nivel: NIVEL[PEOR.find(clave => porSucursal.some(s => s.nivel.clave === clave)) ?? 'SIN'],
      nivelTotal: nivelDe(existencia, minimo),
      peor: comparables.length ? comparables.reduce((a, b) => (razon(b) < razon(a) ? b : a)) : null,
    }
  })
}
