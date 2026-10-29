// Totales de las ventas en ruta: lo que se ve en Rutas y Distribuidores.
import test from 'node:test'
import assert from 'node:assert/strict'
import { resumenJornadas, jornadasPorChofer, sinUbicacionReciente, sinCerrar, limitesDe, enRuta, textoDesglose } from '../src/lib/calculos.js'

const jornada = (extra) => ({ estado: 'CERRADA', vendido_centavos: 0, ventas: 0, a_cargo_centavos: 0, chofer_id: 'juan', chofer: 'Juan Pérez', ...extra })

const AHORA = Date.parse('2026-10-28T18:00:00Z')
const haceHoras = (h) => new Date(AHORA - h * 3600000).toISOString()

test('resumenJornadas: suma lo vendido, la merma y lo que quedó a cargo; las abiertas de días pasados no cuentan como en ruta', () => {
  const r = resumenJornadas([
    jornada({ vendido_centavos: 120000, ventas: 8, a_cargo_centavos: 18500, merma_centavos: 6800 }),
    jornada({ vendido_centavos: 50000, ventas: 3 }),
    jornada({ estado: 'EN_RUTA', salida: haceHoras(3), vendido_centavos: 30000, ventas: 2, a_cargo_centavos: null }),
    jornada({ estado: 'EN_RUTA', salida: haceHoras(30), vendido_centavos: 10000, ventas: 1, a_cargo_centavos: null }),
  ], AHORA)
  assert.deepEqual(r, { jornadas: 4, enRuta: 1, sinCerrar: 1, vendido: 210000, ventas: 14, aCargo: 18500, conCargo: 1, merma: 6800 })
  assert.deepEqual(resumenJornadas([]), { jornadas: 0, enRuta: 0, sinCerrar: 0, vendido: 0, ventas: 0, aCargo: 0, conCargo: 0, merma: 0 })
})

test('sinCerrar: abierta hace más de 18 h; tampoco se reporta como "sin ubicación"', () => {
  const vieja = jornada({ estado: 'EN_RUTA', salida: haceHoras(19), ultima_ubicacion_en: haceHoras(17) })
  assert.equal(sinCerrar(vieja, AHORA), true)
  assert.equal(sinUbicacionReciente(vieja, AHORA), false)
  assert.equal(sinCerrar(jornada({ estado: 'EN_RUTA', salida: haceHoras(10) }), AHORA), false)
  assert.equal(sinCerrar(jornada({ estado: 'CERRADA', salida: haceHoras(40) }), AHORA), false)
  // Quien tiene una jornada vieja sin cerrar no aparece "en ruta ahora"
  assert.equal(jornadasPorChofer([vieja], AHORA)[0].enRuta, false)
})

test('jornadasPorChofer: primero quien más debe, luego quien más vendió', () => {
  const filas = jornadasPorChofer([
    jornada({ chofer_id: 'juan', chofer: 'Juan', vendido_centavos: 100000 }),
    jornada({ chofer_id: 'juan', chofer: 'Juan', vendido_centavos: 50000, estado: 'EN_RUTA' }),
    jornada({ chofer_id: 'mario', chofer: 'Mario', vendido_centavos: 20000, a_cargo_centavos: 4500 }),
    jornada({ chofer_id: 'carlos', chofer: 'Carlos', vendido_centavos: 300000 }),
  ])
  assert.deepEqual(filas.map(f => f.nombre), ['Mario', 'Carlos', 'Juan'])
  const juan = filas.find(f => f.chofer_id === 'juan')
  assert.equal(juan.jornadas, 2)
  assert.equal(juan.vendido, 150000)
  assert.equal(juan.enRuta, true)
})

test('sinUbicacionReciente: solo cuenta con la ruta abierta y más de 15 min sin ubicación', () => {
  const ahora = Date.parse('2026-10-28T18:00:00Z')
  const hace = (min) => new Date(ahora - min * 60000).toISOString()
  assert.equal(sinUbicacionReciente(jornada({ estado: 'EN_RUTA', ultima_ubicacion_en: hace(5) }), ahora), false)
  assert.equal(sinUbicacionReciente(jornada({ estado: 'EN_RUTA', ultima_ubicacion_en: hace(16) }), ahora), true)
  assert.equal(sinUbicacionReciente(jornada({ estado: 'EN_RUTA', ultima_ubicacion_en: null }), ahora), true)
  assert.equal(sinUbicacionReciente(jornada({ estado: 'CERRADA', ultima_ubicacion_en: hace(300) }), ahora), false)
  assert.equal(enRuta(jornada({ estado: 'EN_RUTA' })), true)
})

test('limitesDe: encierra los puntos y se salta los que no tienen coordenadas', () => {
  assert.deepEqual(
    limitesDe([[20.6, -100.4], [20.55, -100.3], [null, null], undefined, [20.7, -100.35]]),
    [[20.55, -100.4], [20.7, -100.3]],
  )
  assert.equal(limitesDe([]), null)
})

test('textoDesglose: con qué billetes se entregó el efectivo del cierre', () => {
  const desglose = { billetes: [{ valor_centavos: 100000, piezas: 1 }, { valor_centavos: 50000, piezas: 3 }, { valor_centavos: 2000, piezas: 4 }], monedas_centavos: 1550, total_centavos: 259550 }
  assert.equal(textoDesglose(desglose).replace(/\u00a0/g, ' '), '1 de $1,000, 3 de $500, 4 de $20, monedas $15.50')
  assert.equal(textoDesglose({ billetes: [], monedas_centavos: 0 }), null)
  assert.equal(textoDesglose(null), null) // lo escribieron de un jalón
})
