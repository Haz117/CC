// Pruebas de los totales que la web calcula con las filas que llegan de la base.
// Corren con `pnpm test` (node --test), sin dependencias.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  resumenVentas, metodoDeVenta, pagosPorMetodo, pagosEnElTiempo, ventasPorDia, ventasPorHora, ventasPorSucursal,
  movimientosDeTurno, signoMovimiento, diferenciasPorCajero, nivelDe, esBajo, armarInventario, NIVEL,
} from '../src/lib/calculos.js'

// Fechas en hora local, como las ve quien usa la app: así las pruebas no dependen de la zona horaria.
const el = (dia, hora = 12, minuto = 0) => new Date(2026, 9, dia, hora, minuto).toISOString()
const venta = (extra) => ({ estado: 'COMPLETADA', total_centavos: 0, sucursal_id: 's1', fecha: el(8), venta_pagos: [], ...extra })

test('resumenVentas: las canceladas no suman al total vendido', () => {
  const r = resumenVentas([
    venta({ total_centavos: 1250 }),
    venta({ total_centavos: 8000, estado: 'CANCELADA' }),
    venta({ total_centavos: 2751 }),
    venta({ total_centavos: 500, estado: 'PENDIENTE' }),
  ])
  assert.equal(r.vendido, 4001)
  assert.equal(r.completadas, 2)
  assert.equal(r.canceladas, 1)
  assert.equal(r.cancelado, 8000)
  assert.equal(r.otras, 1)
  assert.equal(r.ticketPromedio, 2001) // 4001 / 2 = 2000.5, redondeado al centavo
})

test('resumenVentas: sin ventas no divide entre cero', () => {
  assert.deepEqual(resumenVentas([]), { completadas: 0, canceladas: 0, vendido: 0, cancelado: 0, otras: 0, ticketPromedio: 0 })
})

test('metodoDeVenta: un método, varios o ninguno', () => {
  assert.equal(metodoDeVenta({ venta_pagos: [{ metodo: 'EFECTIVO' }] }), 'Efectivo')
  assert.equal(metodoDeVenta({ venta_pagos: [{ metodo: 'TARJETA' }, { metodo: 'TARJETA' }] }), 'Tarjeta')
  assert.equal(metodoDeVenta({ venta_pagos: [{ metodo: 'EFECTIVO' }, { metodo: 'TRANSFERENCIA' }] }), 'Mixto')
  assert.equal(metodoDeVenta({ venta_pagos: [] }), '—')
  assert.equal(metodoDeVenta({}), '—')
})

test('pagosPorMetodo: solo ventas completadas, de mayor a menor', () => {
  const metodos = pagosPorMetodo([
    venta({ venta_pagos: [{ metodo: 'EFECTIVO', monto_centavos: 1000 }, { metodo: 'TARJETA', monto_centavos: 5000 }] }),
    venta({ venta_pagos: [{ metodo: 'EFECTIVO', monto_centavos: 500 }] }),
    venta({ estado: 'CANCELADA', venta_pagos: [{ metodo: 'EFECTIVO', monto_centavos: 99999 }] }),
  ])
  assert.deepEqual(metodos, [
    { metodo: 'TARJETA', centavos: 5000, pagos: 1 },
    { metodo: 'EFECTIVO', centavos: 1500, pagos: 2 },
  ])
})

test('pagosEnElTiempo: por día con ceros, o por hora si es un solo día', () => {
  const pago = (metodo, monto_centavos) => ({ metodo, monto_centavos })
  const ventas = [
    venta({ fecha: el(8, 9), venta_pagos: [pago('TARJETA', 1000), pago('EFECTIVO', 250)] }),
    venta({ fecha: el(10, 11), venta_pagos: [pago('EFECTIVO', 500)] }),
    venta({ fecha: el(10, 12), estado: 'CANCELADA', venta_pagos: [pago('EFECTIVO', 9999)] }),
  ]
  const r = pagosEnElTiempo(ventas, '2026-10-08', '2026-10-10')
  assert.deepEqual(r.metodos, ['EFECTIVO', 'TARJETA'])
  assert.equal(r.porHora, false)
  assert.deepEqual(r.filas.map(f => [f.EFECTIVO, f.TARJETA]), [[2.5, 10], [0, 0], [5, 0]])

  const h = pagosEnElTiempo(ventas.filter(v => v.fecha >= el(10, 0)), '2026-10-10', '2026-10-10')
  assert.equal(h.porHora, true)
  assert.deepEqual(h.filas.map(f => f.etiqueta), ['11:00'])
  assert.deepEqual(pagosEnElTiempo([], '2026-10-10', '2026-10-10').filas, [])
})

test('ventasPorDia: un renglón por día local, con los días sin venta en cero', () => {
  const dias = ventasPorDia([
    venta({ fecha: el(6, 9), total_centavos: 1000 }),
    venta({ fecha: el(6, 23, 59), total_centavos: 250 }),
    venta({ fecha: el(8, 0, 0), total_centavos: 4000 }),
    venta({ fecha: el(7), total_centavos: 7777, estado: 'CANCELADA' }),
    venta({ fecha: el(9), total_centavos: 123 }), // fuera del rango
  ], '2026-10-06', '2026-10-08')
  assert.deepEqual(dias.map(d => [d.dia, d.centavos, d.tickets, d.total]), [
    ['2026-10-06', 1250, 2, 12.5],
    ['2026-10-07', 0, 0, 0],
    ['2026-10-08', 4000, 1, 40],
  ])
})

test('ventasPorHora: de la primera a la última hora con venta, sin huecos', () => {
  const horas = ventasPorHora([
    venta({ fecha: el(8, 8, 15), total_centavos: 1000 }),
    venta({ fecha: el(8, 8, 50), total_centavos: 500 }),
    venta({ fecha: el(8, 11, 5), total_centavos: 2000 }),
    venta({ fecha: el(8, 14), total_centavos: 9000, estado: 'CANCELADA' }),
  ])
  assert.deepEqual(horas.map(h => [h.etiqueta, h.centavos, h.tickets]), [
    ['08:00', 1500, 2], ['09:00', 0, 0], ['10:00', 0, 0], ['11:00', 2000, 1],
  ])
  assert.deepEqual(ventasPorHora([]), [])
})

test('ventasPorSucursal: suma completadas y cuenta canceladas por sucursal', () => {
  const mapa = ventasPorSucursal([
    venta({ sucursal_id: 'a', total_centavos: 100 }),
    venta({ sucursal_id: 'a', total_centavos: 200 }),
    venta({ sucursal_id: 'a', total_centavos: 999, estado: 'CANCELADA' }),
    venta({ sucursal_id: 'b', total_centavos: 50 }),
  ])
  assert.deepEqual(mapa.get('a'), { sucursal_id: 'a', centavos: 300, tickets: 2, canceladas: 1 })
  assert.deepEqual(mapa.get('b'), { sucursal_id: 'b', centavos: 50, tickets: 1, canceladas: 0 })
})

test('movimientosDeTurno: separa entradas de retiros', () => {
  const turno = { movimientos_caja: [
    { tipo: 'ENTRADA', monto_centavos: 1000 },
    { tipo: 'RETIRO', monto_centavos: 30000 },
    { tipo: 'SALIDA', monto_centavos: 500 },
  ] }
  assert.deepEqual(movimientosDeTurno(turno), { entradas: 1000, retiros: 30500 })
  assert.deepEqual(movimientosDeTurno({}), { entradas: 0, retiros: 0 })
  assert.equal(signoMovimiento({ tipo: 'RETIRO' }), -1)
  assert.equal(signoMovimiento({ tipo: 'ENTRADA' }), 1)
})

test('diferenciasPorCajero: primero quien más faltante acumula', () => {
  const corte = (nombre, diferencia_centavos) => ({ cajero: { nombre_completo: nombre }, diferencia_centavos })
  const r = diferenciasPorCajero([
    corte('Ana', 0), corte('Luis', -1250), corte('Ana', 300), corte('Luis', 200), corte('Rosa', null), corte('Rosa', -50),
  ])
  assert.deepEqual(r.map(x => x.nombre), ['Luis', 'Rosa', 'Ana'])
  assert.deepEqual(r[0], { nombre: 'Luis', cortes: 2, faltantes: 1, sobrantes: 1, neta: -1050 })
  assert.deepEqual(r[2], { nombre: 'Ana', cortes: 2, faltantes: 0, sobrantes: 1, neta: 300 })
  assert.equal(r[1].cortes, 2) // un corte sin diferencia registrada cuenta como corte, sin sumar
  assert.deepEqual(diferenciasPorCajero([]), [])
})

test('nivelDe: bajo el mínimo es Bajo; a la mitad o menos, Crítico', () => {
  assert.equal(nivelDe(10, 10), NIVEL.NORMAL)
  assert.equal(nivelDe(9.999, 10), NIVEL.BAJO)
  assert.equal(nivelDe(5.001, 10), NIVEL.BAJO)
  assert.equal(nivelDe(5, 10), NIVEL.CRITICO)
  assert.equal(nivelDe(0, 10), NIVEL.CRITICO)
  // Sin mínimo configurado no hay alerta
  assert.equal(nivelDe(3, null), NIVEL.LIBRE)
  assert.equal(nivelDe(0, null), NIVEL.SIN)
  assert.equal(esBajo(NIVEL.BAJO) && esBajo(NIVEL.CRITICO), true)
  assert.equal(esBajo(NIVEL.NORMAL) || esBajo(NIVEL.LIBRE) || esBajo(NIVEL.SIN), false)
})

test('armarInventario: el total puede estar bien aunque una sucursal esté en crítico', () => {
  const [queso, crema, nuevo] = armarInventario({
    productos: [
      { id: 'p1', nombre: 'Queso Oaxaca', categorias: { nombre: 'Quesos' } },
      { id: 'p2', nombre: 'Crema' },
      { id: 'p3', nombre: 'Sin existencias todavía' },
    ],
    existencias: [
      { producto_id: 'p1', sucursal_id: 'almacen', existencia: '100.000' }, // la base manda numeric como texto
      { producto_id: 'p1', sucursal_id: 'centro', existencia: 2 },
      { producto_id: 'p2', sucursal_id: 'centro', existencia: 7 },
    ],
    limites: [
      { producto_id: 'p1', sucursal_id: 'almacen', minimo: 60, maximo: 180 },
      { producto_id: 'p1', sucursal_id: 'centro', minimo: 15, maximo: 60 },
    ],
  })

  assert.equal(queso.categoria, 'Quesos')
  assert.equal(queso.existencia, 102)
  assert.equal(queso.minimo, 75)
  assert.equal(queso.maximo, 240)
  assert.equal(queso.nivelTotal, NIVEL.NORMAL)  // 102 de 75 en total…
  assert.equal(queso.nivel, NIVEL.CRITICO)      // …pero Centro tiene 2 de 15
  assert.equal(queso.peor.sucursal_id, 'centro')
  assert.equal(queso.bajos, 1)

  assert.equal(crema.categoria, 'Sin categoría')
  assert.equal(crema.minimo, null)
  assert.equal(crema.nivel, NIVEL.LIBRE)
  assert.equal(crema.peor, null)

  assert.equal(nuevo.existencia, 0)
  assert.equal(nuevo.nivel, NIVEL.SIN)
  assert.deepEqual(nuevo.porSucursal, [])
})
