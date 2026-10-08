export const fmt    = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
export const fmtDec = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

/* ── Dinero ──────────────────────────────────────────────────
   La base guarda centavos enteros (*_centavos): $12.50 = 1250.
   Se divide entre 100 solo al mostrar. */
export const pesos      = (centavos) => fmtDec((Number(centavos) || 0) / 100)
export const pesosCorto = (centavos) => fmt((Number(centavos) || 0) / 100)

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
export const diaCorto  = (iso) => iso ? fDiaCorto.format(new Date(iso)) : '—'
export const hora      = (iso) => iso ? fHora.format(new Date(iso)) : '—'
export const fechaHora = (iso) => iso ? `${fecha(iso)} · ${hora(iso)}` : '—'
export const mesLargo  = (d = new Date()) => fMes.format(d)

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
