export const fmt    = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
export const fmtDec = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

/* ── Dinero ──────────────────────────────────────────────────
   La base guarda centavos enteros (*_centavos): $12.50 = 1250.
   Se divide entre 100 solo al mostrar. */
export const pesos      = (centavos) => fmtDec((Number(centavos) || 0) / 100)
export const pesosCorto = (centavos) => fmt((Number(centavos) || 0) / 100)
// Eje de las gráficas (en pesos, no centavos): "$850", "$12.5k", "-$1.2k"
export const pesosEje   = (v) => `${v < 0 ? '-' : ''}$${Math.abs(v) >= 1000 ? `${Math.round(Math.abs(v) / 100) / 10}k` : Math.abs(v)}`

/* ── Buscar ───────────────────────────────────────────────
   Sin acentos ni mayúsculas: "jose" encuentra a "José", "crema acida" a "Crema Ácida". */
export const sinAcentos = (texto) => String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
// `q` ya pasado por sinAcentos
export const contiene = (texto, q) => sinAcentos(texto).includes(q)

// "1 corte", "3 cortes"; el plural irregular va como tercer argumento.
export const plural = (n, uno, varios = `${uno}s`) => `${n} ${n === 1 ? uno : varios}`

/* ── Cantidades ──────────────────────────────────────────────
   numeric(14,3) en la unidad base del producto: piezas, o kilos con 3 decimales (0.250 = 250 g). */
const numCantidad = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 3 })
export const cantidad = (n, unidad) => {
  const valor = numCantidad.format(Number(n) || 0)
  return unidad ? `${valor} ${String(unidad).toLowerCase()}` : valor
}

/* ── Fechas ──────────────────────────────────────────────────
   La base guarda timestamptz en UTC; aquí se muestran en hora local. */
const fFecha    = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
const fDiaCorto = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' })
const fHora     = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const fMes      = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' })

export const fecha     = (iso) => iso ? fFecha.format(new Date(iso)) : '—'
// Chrome escribe "19-oct" en es-MX; se arma con las partes para que siempre diga "19 oct"
export const diaCorto  = (iso) => {
  if (!iso) return '—'
  const partes = Object.fromEntries(fDiaCorto.formatToParts(new Date(iso)).map(p => [p.type, p.value]))
  return `${partes.day} ${String(partes.month).replace('.', '')}`
}
export const hora      = (iso) => iso ? fHora.format(new Date(iso)) : '—'
export const fechaHora = (iso) => iso ? `${fecha(iso)} · ${hora(iso)}` : '—'
// Horario de un turno: "08:00 – 20:17" si abrió y cerró el mismo día; si no, con los dos días.
export const horario = (inicio, fin) => {
  if (!fin) return `desde ${hora(inicio)}`
  return diaLocal(inicio) === diaLocal(fin)
    ? `${hora(inicio)} – ${hora(fin)}`
    : `${diaCorto(inicio)} ${hora(inicio)} – ${diaCorto(fin)} ${hora(fin)}`
}
export const mesLargo  = (d = new Date()) => fMes.format(d)
const fMesNombre = new Intl.DateTimeFormat('es-MX', { month: 'long' })
export const mesNombre = (d = new Date()) => fMesNombre.format(d)
// "Lunes 20 de octubre": el día de la semana con mayúscula porque abre el renglón
const fDiaLargo = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
export const diaLargo  = (d = new Date()) => {
  const t = fDiaLargo.format(d).replace(',', '')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

// Cuánto hace de un momento (ms), para "Actualizado justo ahora / hace 3 min / a las 13:05".
export const haceCuanto = (desde, ahora = Date.now()) => {
  const segundos = Math.max(0, (ahora - desde) / 1000)
  if (segundos < 45) return 'justo ahora'
  const minutos = Math.max(1, Math.round(segundos / 60))
  return minutos < 60 ? `hace ${minutos} min` : `a las ${hora(desde)}`
}

const dos = (n) => String(n).padStart(2, '0')

// 'yyyy-mm-dd' en hora local (el formato de <input type="date">)
export const diaLocal = (d = new Date()) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${dos(x.getMonth() + 1)}-${dos(x.getDate())}`
}

// Medianoche local de un día ('yyyy-mm-dd' o Date)
export const inicioDelDia = (d = new Date()) => {
  if (typeof d === 'string') {
    const [anio, mes, dia] = d.split('-').map(Number)
    return new Date(anio, mes - 1, dia)
  }
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export const sumarDias = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export const inicioDelMes = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1)

// Rango [desde, hasta) en ISO para filtrar por `fecha`: va de la medianoche local
// del primer día a la medianoche del día siguiente al último.
export const rangoISO = (primerDia, ultimoDia = primerDia) => ({
  desde: inicioDelDia(primerDia).toISOString(),
  hasta: sumarDias(inicioDelDia(ultimoDia), 1).toISOString(),
})

// Rango 'yyyy-mm-dd' en corto para el botón del filtro: "19 oct 2026", "13 – 19 oct 2026",
// "28 sep – 19 oct 2026" o "28 dic 2025 – 3 ene 2026". Solo repite lo que cambia.
const fMesCorto = new Intl.DateTimeFormat('es-MX', { month: 'short' })
export const rangoCorto = (primerDia, ultimoDia = primerDia) => {
  const [a, b] = [inicioDelDia(primerDia), inicioDelDia(ultimoDia)]
  const mes = (d) => fMesCorto.format(d).replace('.', '')
  const fin = `${b.getDate()} ${mes(b)} ${b.getFullYear()}`
  if (primerDia === ultimoDia) return fin
  if (a.getFullYear() !== b.getFullYear()) return `${a.getDate()} ${mes(a)} ${a.getFullYear()} – ${fin}`
  if (a.getMonth() !== b.getMonth()) return `${a.getDate()} ${mes(a)} – ${fin}`
  return `${a.getDate()} – ${fin}`
}

export const iniciales = (nombre) =>
  (nombre || '').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || '—'

// Primer y último día ('yyyy-mm-dd') de los periodos rápidos de los filtros.
export const rangoPreset = (preset) => {
  const hoy = new Date()
  const desde = {
    ayer:      sumarDias(hoy, -1),
    semana:    sumarDias(hoy, -((hoy.getDay() + 6) % 7)), // lunes de esta semana
    mes:       inicioDelMes(hoy),
    trimestre: sumarDias(hoy, -89),
  }[preset] ?? hoy
  return [diaLocal(desde), diaLocal(preset === 'ayer' ? desde : hoy)]
}
