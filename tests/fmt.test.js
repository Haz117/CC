// Pruebas del formato de dinero y cantidades, y de los rangos de fechas que se mandan a la base.
import test from 'node:test'
import assert from 'node:assert/strict'
import { pesos, pesosCorto, cantidad, iniciales, diaLocal, inicioDelDia, sumarDias, rangoISO, rangoPreset, rangoCorto, haceCuanto, diaCorto } from '../src/utils/fmt.js'

test('pesos: la base guarda centavos enteros', () => {
  assert.equal(pesos(1250), '$12.50')
  assert.equal(pesos(100000), '$1,000.00')
  assert.equal(pesos(5), '$0.05')
  assert.equal(pesos(null), '$0.00')
  assert.equal(pesos('abc'), '$0.00')
  assert.equal(pesosCorto(1299900), '$12,999')
})

test('cantidad: hasta 3 decimales y la unidad en minúsculas', () => {
  assert.equal(cantidad(0.25, 'KG'), '0.25 kg')
  assert.equal(cantidad(259.757, 'KG'), '259.757 kg')
  assert.equal(cantidad(12, 'PZA'), '12 pza')
  assert.equal(cantidad(1500), '1,500')
  assert.equal(cantidad('33.712'), '33.712') // numeric llega como texto
})

test('iniciales: dos letras, o una raya si no hay nombre', () => {
  assert.equal(iniciales('Carlos Mendoza'), 'CM')
  assert.equal(iniciales('  ana   maría  ramos '), 'AM')
  assert.equal(iniciales('Rosa'), 'R')
  assert.equal(iniciales(''), '—')
  assert.equal(iniciales(undefined), '—')
})

test('rangoISO: de la medianoche local del primer día a la del día siguiente al último', () => {
  const unDia = rangoISO('2026-10-08')
  assert.equal(unDia.desde, new Date(2026, 9, 8).toISOString())
  assert.equal(unDia.hasta, new Date(2026, 9, 9).toISOString())

  const semana = rangoISO('2026-10-05', '2026-10-08')
  assert.equal(semana.desde, new Date(2026, 9, 5).toISOString())
  assert.equal(semana.hasta, new Date(2026, 9, 9).toISOString())

  // Fin de mes: el día siguiente cae en el mes que sigue
  assert.equal(rangoISO('2026-10-31').hasta, new Date(2026, 10, 1).toISOString())
})

test('rangoCorto: solo repite el mes y el año cuando cambian', () => {
  assert.equal(rangoCorto('2026-10-19'), '19 oct 2026')
  assert.equal(rangoCorto('2026-10-19', '2026-10-19'), '19 oct 2026')
  assert.equal(rangoCorto('2026-10-13', '2026-10-19'), '13 – 19 oct 2026')
  assert.equal(rangoCorto('2026-09-28', '2026-10-19'), '28 sep – 19 oct 2026')
  assert.equal(rangoCorto('2025-12-28', '2026-01-03'), '28 dic 2025 – 3 ene 2026')
})

test('diaCorto: día y mes separados por espacio, sin guion ni punto', () => {
  assert.equal(diaCorto(new Date(2026, 9, 19, 12).toISOString()), '19 oct')
  assert.equal(diaCorto(new Date(2026, 8, 3, 12).toISOString()), '03 sep')
  assert.equal(diaCorto(null), '—')
})

test('haceCuanto: justo ahora, minutos y, pasada una hora, la hora', () => {
  const t = new Date(2026, 9, 19, 13, 5).getTime()
  assert.equal(haceCuanto(t, t + 10_000), 'justo ahora')
  assert.equal(haceCuanto(t, t - 5_000), 'justo ahora') // reloj desfasado: nunca "hace -1 min"
  assert.equal(haceCuanto(t, t + 50_000), 'hace 1 min')
  assert.equal(haceCuanto(t, t + 12 * 60_000), 'hace 12 min')
  assert.equal(haceCuanto(t, t + 2 * 3600_000), 'a las 13:05')
})

test('diaLocal e inicioDelDia usan la hora local, no UTC', () => {
  const casiMedianoche = new Date(2026, 9, 8, 23, 59)
  assert.equal(diaLocal(casiMedianoche), '2026-10-08')
  assert.equal(inicioDelDia(casiMedianoche).getTime(), new Date(2026, 9, 8).getTime())
  assert.equal(inicioDelDia('2026-10-08').getTime(), new Date(2026, 9, 8).getTime())
  assert.equal(diaLocal(sumarDias(new Date(2026, 9, 31), 1)), '2026-11-01')
})

test('rangoPreset: los atajos de los filtros terminan hoy (salvo "ayer")', () => {
  const hoy = diaLocal()
  assert.deepEqual(rangoPreset('hoy'), [hoy, hoy])

  const ayer = diaLocal(sumarDias(new Date(), -1))
  assert.deepEqual(rangoPreset('ayer'), [ayer, ayer])

  const [lunes, finSemana] = rangoPreset('semana')
  assert.equal(inicioDelDia(lunes).getDay(), 1)
  assert.equal(finSemana, hoy)
  assert.ok(lunes <= hoy)

  const [primero, finMes] = rangoPreset('mes')
  assert.equal(primero.slice(8), '01')
  assert.equal(primero.slice(0, 7), hoy.slice(0, 7))
  assert.equal(finMes, hoy)

  const [hace90, finTrimestre] = rangoPreset('trimestre')
  assert.equal(hace90, diaLocal(sumarDias(new Date(), -89)))
  assert.equal(finTrimestre, hoy)
})
