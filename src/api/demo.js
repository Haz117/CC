/* Datos de ejemplo para el modo demostración.
   Tienen la misma forma que regresa Supabase (dinero en centavos, fechas ISO en UTC, estados en
   mayúsculas) y respetan la misma regla de la base: un supervisor o cajero solo ve su sucursal.
   Nunca se mezclan con datos reales. */
import { diaLocal, inicioDelDia, sumarDias } from '../utils/fmt.js'

export const PERFIL_DEMO = { tipo: 'USUARIO', id: 'usr-carlos', nombre: 'Carlos Mendoza', rol: 'ADMINISTRADOR', sucursal_id: 'suc-almacen', sucursal: 'Almacén Central', es_almacen: true }

/* ── Catálogos ───────────────────────────────────────────── */
const SUCURSALES = [
  { id: 'suc-almacen',  nombre: 'Almacén Central',   es_almacen: true,  activo: true,  direccion: 'Carretera a Celaya km 4' },
  { id: 'suc-centro',   nombre: 'Sucursal Centro',   es_almacen: false, activo: true,  direccion: 'Av. Morelos 145, Centro',          prefijo: 'CENTRO',  terminales: ['04E2', '9B1C'], peso: 1.3 },
  { id: 'suc-norte',    nombre: 'Sucursal Norte',    es_almacen: false, activo: true,  direccion: 'Blvd. Norte 820, Col. Las Flores', prefijo: 'NORTE',   terminales: ['A1B7'],         peso: 1.0 },
  { id: 'suc-sur',      nombre: 'Sucursal Sur',      es_almacen: false, activo: true,  direccion: 'Calle 5 de Mayo 310, Col. Sur',    prefijo: 'SUR',     terminales: ['7F30'],         peso: 0.8 },
  { id: 'suc-oriente',  nombre: 'Sucursal Oriente',  es_almacen: false, activo: true,  direccion: 'Av. Oriente 56, Col. Jardines',    prefijo: 'ORIENTE', terminales: ['C4D9'],         peso: 0.6 },
  { id: 'suc-poniente', nombre: 'Sucursal Poniente', es_almacen: false, activo: false, direccion: 'Blvd. Poniente 200, Fracc. Nuevo' },
]

const USUARIOS = [
  { id: 'usr-carlos',  nombre_completo: 'Carlos Mendoza', rol: 'ADMINISTRADOR', sucursal_id: 'suc-almacen', auth_user_id: 'auth-carlos',  usuario: 'carlos.mendoza', activo: true  },
  { id: 'usr-ana',     nombre_completo: 'Ana Ramos',      rol: 'SUPERVISOR',    sucursal_id: 'suc-centro',  auth_user_id: 'auth-ana',     usuario: 'ana.ramos',      activo: true  },
  { id: 'usr-maria',   nombre_completo: 'María López',    rol: 'CAJERO',        sucursal_id: 'suc-centro',  auth_user_id: 'auth-maria',   usuario: 'maria.lopez',    activo: true  },
  { id: 'usr-jose',    nombre_completo: 'José Pérez',     rol: 'CAJERO',        sucursal_id: 'suc-centro',  auth_user_id: null,           usuario: 'jose.perez',     activo: true  },
  { id: 'usr-roberto', nombre_completo: 'Roberto Silva',  rol: 'SUPERVISOR',    sucursal_id: 'suc-norte',   auth_user_id: 'auth-roberto', usuario: 'roberto.silva',  activo: true  },
  { id: 'usr-sandra',  nombre_completo: 'Sandra Ruiz',    rol: 'CAJERO',        sucursal_id: 'suc-norte',   auth_user_id: null,           usuario: 'sandra.ruiz',    activo: true  },
  { id: 'usr-lucia',   nombre_completo: 'Lucía Pérez',    rol: 'SUPERVISOR',    sucursal_id: 'suc-sur',     auth_user_id: 'auth-lucia',   usuario: 'lucia.perez',    activo: true  },
  { id: 'usr-pedro',   nombre_completo: 'Pedro García',   rol: 'CAJERO',        sucursal_id: 'suc-sur',     auth_user_id: null,           usuario: 'pedro.garcia',   activo: true  },
  { id: 'usr-miguel',  nombre_completo: 'Miguel Torres',  rol: 'SUPERVISOR',    sucursal_id: 'suc-oriente', auth_user_id: null,           usuario: 'miguel.torres',  activo: true  },
  { id: 'usr-luis',    nombre_completo: 'Luis Mora',      rol: 'CAJERO',        sucursal_id: 'suc-oriente', auth_user_id: null,           usuario: 'luis.mora',      activo: true  },
  { id: 'usr-elena',   nombre_completo: 'Elena Vargas',   rol: 'CAJERO',        sucursal_id: 'suc-poniente', auth_user_id: null,          usuario: 'elena.vargas',   activo: false },
]

const CATEGORIAS = {
  quesos:       { nombre: 'Quesos',       color: '#F97316' },
  cremas:       { nombre: 'Cremas',       color: '#059669' },
  mantequillas: { nombre: 'Mantequillas', color: '#d97706' },
  otros:        { nombre: 'Otros',        color: '#7c3aed' },
}

// `precio` solo sirve para armar los tickets de ejemplo: en la base el precio vive en lote_precios.
const PRODUCTOS = [
  { id: 'prd-oaxaca',   clave: 'QOX',     nombre: 'Queso Oaxaca',        unidad: 'KG',  cat: 'quesos',       precio: 18500, minimo: 15 },
  { id: 'prd-panela',   clave: 'QPA',     nombre: 'Queso Panela',        unidad: 'KG',  cat: 'quesos',       precio: 12000, minimo: 12 },
  { id: 'prd-manchego', clave: 'QMA',     nombre: 'Queso Manchego',      unidad: 'KG',  cat: 'quesos',       precio: 14500, minimo: 10 },
  { id: 'prd-cotija',   clave: 'QCO',     nombre: 'Queso Cotija',        unidad: 'KG',  cat: 'quesos',       precio: 16000, minimo: 8  },
  { id: 'prd-requeson', clave: 'REQ-250', nombre: 'Requesón 250 g',      unidad: 'PZA', cat: 'quesos',       precio: 2800,  minimo: 20 },
  { id: 'prd-crema',    clave: 'CRA-1L',  nombre: 'Crema Ácida 1 L',     unidad: 'PZA', cat: 'cremas',       precio: 3800,  minimo: 30 },
  { id: 'prd-espesa',   clave: 'CRE-500', nombre: 'Crema Espesa 500 ml', unidad: 'PZA', cat: 'cremas',       precio: 3500,  minimo: 24 },
  { id: 'prd-mantequi', clave: 'MAN-200', nombre: 'Mantequilla 200 g',   unidad: 'PZA', cat: 'mantequillas', precio: 4200,  minimo: 24 },
  { id: 'prd-jocoque',  clave: 'JOC-1L',  nombre: 'Jocoque 1 L',         unidad: 'PZA', cat: 'otros',        precio: 3000,  minimo: 12 },
  { id: 'prd-yogurt',   clave: 'YOG-1L',  nombre: 'Yogurt Natural 1 L',  unidad: 'PZA', cat: 'otros',        precio: 3400,  minimo: 18 },
]

const presentacionesDe = (p) => p.unidad === 'KG'
  ? [
      { id: `${p.id}-granel`, nombre: 'Granel',      tipo: 'GRANEL', factor: 1,   codigo_barras: null,                     es_principal: true,  activo: true },
      { id: `${p.id}-pieza`,  nombre: 'Pieza 500 g', tipo: 'PIEZA',  factor: 0.5, codigo_barras: `20${p.clave}500`,        es_principal: false, activo: true },
    ]
  : [
      { id: `${p.id}-pieza`,  nombre: 'Pieza',       tipo: 'PIEZA',  factor: 1,   codigo_barras: `750100${String(p.precio).padStart(7, '0')}`, es_principal: true,  activo: true },
      { id: `${p.id}-caja`,   nombre: 'Caja con 12', tipo: 'CAJA',   factor: 12,  codigo_barras: null,                     es_principal: false, activo: true },
    ]

/* ── Utilidades ──────────────────────────────────────────── */
// Generador determinista: los mismos datos en cada recarga.
function azar(semilla) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const espera = () => new Promise(resolver => setTimeout(resolver, 220))
const tiendas = () => SUCURSALES.filter(s => !s.es_almacen && s.activo)
const deSucursal = (sucursalId) => (fila) => !sucursalId || fila.sucursal_id === sucursalId
const pagina = (lista, n, porPagina) => ({ filas: lista.slice(n * porPagina, (n + 1) * porPagina), total: lista.length })

/* ── Ventas de los últimos 35 días ───────────────────────── */
let ventasGeneradas = null

function generarVentas() {
  const r = azar(20261007)
  const ahora = new Date()
  const ventas = []
  const consecutivo = {}

  for (let atras = 34; atras >= 0; atras--) {
    const dia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - atras)
    const finDeSemana = dia.getDay() === 0 || dia.getDay() === 6

    for (const suc of tiendas()) {
      const cajeros = USUARIOS.filter(u => u.sucursal_id === suc.id && u.activo)
      const tickets = Math.round((14 + r() * 10) * suc.peso * (finDeSemana ? 1.3 : 1))
      const minutos = Array.from({ length: tickets }, () => Math.floor(r() * 12 * 60)).sort((a, b) => a - b)

      for (const minuto of minutos) {
        const fecha = new Date(dia)
        fecha.setHours(8, minuto, Math.floor(r() * 60), 0)

        const renglones = []
        const elegidos = [...PRODUCTOS].sort(() => r() - 0.5).slice(0, 1 + Math.floor(r() * 4))
        elegidos.forEach((p, i) => {
          const cant = p.unidad === 'KG' ? Math.round((0.25 + r() * 1.25) * 20) / 20 : 1 + Math.floor(r() * 3)
          renglones.push({
            renglon: i + 1, descripcion: p.nombre, unidad: p.unidad, cantidad: cant,
            precio_unitario_centavos: p.precio, importe_centavos: Math.round(cant * p.precio),
          })
        })
        const total = renglones.reduce((s, x) => s + x.importe_centavos, 0)

        const suerte = r()
        const pagos = suerte < 0.6  ? [{ metodo: 'EFECTIVO', monto_centavos: total }]
          : suerte < 0.85 ? [{ metodo: 'TARJETA', monto_centavos: total }]
          : suerte < 0.95 ? [{ metodo: 'TRANSFERENCIA', monto_centavos: total }]
          : [{ metodo: 'EFECTIVO', monto_centavos: Math.floor(total / 2) }, { metodo: 'TARJETA', monto_centavos: total - Math.floor(total / 2) }]

        const terminal = suc.terminales[Math.floor(r() * suc.terminales.length)]
        const cajero = cajeros[Math.floor(r() * cajeros.length)]
        const cancelada = r() < 0.03
        if (fecha > ahora) continue

        const clave = `${suc.prefijo}-${terminal}`
        consecutivo[clave] = (consecutivo[clave] || 0) + 1
        ventas.push({
          id: `vta-${ventas.length + 1}`,
          folio: `${clave}-${String(consecutivo[clave]).padStart(6, '0')}`,
          fecha: fecha.toISOString(),
          total_centavos: total,
          estado: cancelada ? 'CANCELADA' : 'COMPLETADA',
          sucursal_id: suc.id,
          terminal,
          cajero: { nombre_completo: cajero.nombre_completo },
          venta_pagos: pagos,
          venta_detalle: renglones,
        })
      }
    }
  }
  return ventas.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

const todasLasVentas = () => (ventasGeneradas ??= generarVentas())

// El encabezado como lo regresa la lista: sin renglones.
const sinDetalle = ({ venta_detalle: _detalle, terminal: _terminal, ...venta }) => venta

export async function listarVentas({ desde, hasta, sucursalId } = {}) {
  await espera()
  const lista = todasLasVentas()
    .filter(deSucursal(sucursalId))
    .filter(v => (!desde || v.fecha >= desde) && (!hasta || v.fecha < hasta))
    .map(sinDetalle)
  return { filas: lista, total: lista.length, truncado: false }
}

export async function listarUltimasVentas({ desde, limite = 8 } = {}) {
  const { filas } = await listarVentas({ desde })
  return filas.slice(0, limite)
}

export async function obtenerTicket(ventaId) {
  await espera()
  const venta = todasLasVentas().find(v => v.id === ventaId)
  if (!venta) return null
  const { terminal: _terminal, ...ticket } = venta
  return ticket
}

/* ── Turnos de caja ──────────────────────────────────────── */
let turnosGenerados = null

function generarTurnos() {
  const r = azar(77)
  const ahora = new Date()
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const turnos = []
  const nombre = (id) => ({ nombre_completo: USUARIOS.find(u => u.id === id)?.nombre_completo })

  for (const suc of tiendas()) {
    const cajero = USUARIOS.find(u => u.sucursal_id === suc.id && u.rol === 'CAJERO')
    const supervisor = USUARIOS.find(u => u.sucursal_id === suc.id && u.rol === 'SUPERVISOR')

    suc.terminales.forEach((terminal, n) => {
      const caja = { nombre: `Caja ${n + 1} · ${terminal}` }

      // Turno abierto de hoy
      let apertura = new Date(hoy)
      apertura.setHours(7, 45 + n * 10, 0, 0)
      if (apertura > ahora) apertura = new Date(ahora.getTime() - 30 * 60_000)
      const retiro = new Date(Math.min(ahora.getTime(), apertura.getTime() + 4 * 3600_000))
      turnos.push({
        id: `trn-${suc.id}-${terminal}-hoy`, sucursal_id: suc.id, estado: 'ABIERTO',
        abierto_en: apertura.toISOString(), cerrado_en: null,
        fondo_inicial_centavos: 100000, efectivo_esperado_centavos: null,
        efectivo_contado_centavos: null, diferencia_centavos: null, notas_cierre: null,
        cajero: nombre(cajero.id), cerro: null, caja,
        movimientos_caja: n === 0 ? [{ tipo: 'RETIRO', monto_centavos: 200000, concepto: 'Retiro a caja fuerte', fecha: retiro.toISOString() }] : [],
      })

      // Cortes de los 12 días anteriores
      for (let atras = 1; atras <= 12; atras++) {
        const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - atras)
        const abre = new Date(dia); abre.setHours(8, 0, 0, 0)
        const cierra = new Date(dia); cierra.setHours(20, 5 + Math.floor(r() * 20), 0, 0)
        const efectivo = todasLasVentas()
          .filter(v => v.sucursal_id === suc.id && v.terminal === terminal && v.estado === 'COMPLETADA'
            && v.fecha >= abre.toISOString() && v.fecha < cierra.toISOString())
          .flatMap(v => v.venta_pagos)
          .filter(p => p.metodo === 'EFECTIVO')
          .reduce((s, p) => s + p.monto_centavos, 0)
        const movimientos = [
          { tipo: 'RETIRO', monto_centavos: Math.min(150000, Math.floor(efectivo / 2)), concepto: 'Retiro a caja fuerte', fecha: new Date(abre.getTime() + 6 * 3600_000).toISOString() },
          ...(r() < 0.3 ? [{ tipo: 'ENTRADA', monto_centavos: 50000, concepto: 'Cambio en monedas', fecha: new Date(abre.getTime() + 2 * 3600_000).toISOString() }] : []),
        ]
        const neto = movimientos.reduce((s, m) => s + (m.tipo === 'RETIRO' ? -m.monto_centavos : m.monto_centavos), 0)
        const esperado = 100000 + efectivo + neto
        const suerte = r()
        const diferencia = suerte < 0.7 ? 0 : suerte < 0.85 ? -Math.round(r() * 60) * 50 : suerte < 0.95 ? Math.round(r() * 20) * 50 : -12000
        turnos.push({
          id: `trn-${suc.id}-${terminal}-${atras}`, sucursal_id: suc.id, estado: 'CERRADO',
          abierto_en: abre.toISOString(), cerrado_en: cierra.toISOString(),
          fondo_inicial_centavos: 100000, efectivo_esperado_centavos: esperado,
          efectivo_contado_centavos: esperado + diferencia, diferencia_centavos: diferencia,
          notas_cierre: diferencia <= -10000 ? 'Faltante por revisar con el cajero' : null,
          cajero: nombre(cajero.id), cerro: nombre((supervisor ?? cajero).id), caja,
          movimientos_caja: movimientos,
        })
      }
    })
  }
  return turnos
}

const todosLosTurnos = () => (turnosGenerados ??= generarTurnos())

export async function listarTurnosAbiertos({ sucursalId } = {}) {
  await espera()
  return todosLosTurnos()
    .filter(t => t.estado === 'ABIERTO').filter(deSucursal(sucursalId))
    .sort((a, b) => b.abierto_en.localeCompare(a.abierto_en))
}

export async function listarCortes({ sucursalId, desde, hasta, pagina: n = 0, porPagina = 50 } = {}) {
  await espera()
  const lista = todosLosTurnos()
    .filter(t => t.estado === 'CERRADO').filter(deSucursal(sucursalId))
    .filter(t => (!desde || t.cerrado_en >= desde) && (!hasta || t.cerrado_en < hasta))
    .sort((a, b) => b.cerrado_en.localeCompare(a.cerrado_en))
  return pagina(lista, n, porPagina)
}

/* ── Inventario ──────────────────────────────────────────── */
let existenciasGeneradas = null

function generarExistencias() {
  const r = azar(4242)
  const lista = []
  for (const suc of SUCURSALES.filter(s => s.activo)) {
    for (const p of PRODUCTOS) {
      const suerte = r()
      const factor = suc.es_almacen ? 6 + r() * 6 : suerte < 0.05 ? r() * 0.4 : suerte < 0.13 ? 0.55 + r() * 0.4 : 1.2 + r() * 2.5
      const existencia = p.unidad === 'KG' ? Math.round(p.minimo * factor * 1000) / 1000 : Math.round(p.minimo * factor)
      lista.push({ producto_id: p.id, sucursal_id: suc.id, existencia })
    }
  }
  return lista
}

const todasLasExistencias = () => (existenciasGeneradas ??= generarExistencias())

const todosLosLimites = () => SUCURSALES.filter(s => s.activo).flatMap(suc =>
  PRODUCTOS.map(p => ({
    id: `lim-${suc.id}-${p.id}`, sucursal_id: suc.id, producto_id: p.id,
    minimo: p.minimo * (suc.es_almacen ? 4 : 1), maximo: p.minimo * (suc.es_almacen ? 12 : 4),
  })),
)

export async function listarProductos() {
  await espera()
  return PRODUCTOS.map(p => ({
    id: p.id, clave: p.clave, nombre: p.nombre, unidad: p.unidad,
    categoria_id: p.cat,
    categorias: CATEGORIAS[p.cat],
    presentaciones: presentacionesDe(p),
  }))
}

export async function listarExistencias({ sucursalId } = {}) {
  await espera()
  return todasLasExistencias().filter(deSucursal(sucursalId))
}

export async function listarLimites({ sucursalId } = {}) {
  await espera()
  return todosLosLimites().filter(deSucursal(sucursalId))
}

function ordenesPendientes() {
  const limites = new Map(todosLosLimites().map(l => [`${l.producto_id}|${l.sucursal_id}`, l]))
  return todasLasExistencias()
    .map(e => ({ e, limite: limites.get(`${e.producto_id}|${e.sucursal_id}`) }))
    .filter(({ e, limite }) => limite && e.existencia < limite.minimo)
    .map(({ e, limite }, i) => ({
      id: `ord-${i + 1}`, sucursal_id: e.sucursal_id, producto_id: e.producto_id,
      cantidad_sugerida: Math.round((limite.maximo - e.existencia) * 1000) / 1000,
      estado: 'PENDIENTE',
      creado_en: new Date(Date.now() - (i + 1) * 3 * 3600_000).toISOString(),
    }))
}

export async function listarOrdenesPendientes() {
  await espera()
  return ordenesPendientes()
}

const MERMAS = [
  ['prd-crema', 'suc-centro', 3, 'Caducidad', 1],        ['prd-oaxaca', 'suc-norte', 1.2, 'Producto dañado', 2],
  ['prd-yogurt', 'suc-sur', 4, 'Caducidad', 4],          ['prd-panela', 'suc-centro', 0.8, 'Mal estado', 6],
  ['prd-mantequi', 'suc-oriente', 2, 'Empaque roto', 9], ['prd-espesa', 'suc-norte', 5, 'Caducidad', 12],
  ['prd-jocoque', 'suc-centro', 2, 'Derrame', 15],       ['prd-manchego', 'suc-sur', 0.65, 'Mal estado', 19],
  ['prd-requeson', 'suc-oriente', 6, 'Caducidad', 23],   ['prd-cotija', 'suc-norte', 0.4, 'Producto dañado', 27],
]

export async function listarMermas({ sucursalId, desde, hasta, pagina: n = 0, porPagina = 100 } = {}) {
  await espera()
  const lista = MERMAS.map(([productoId, sucursal_id, cant, motivo, atras], i) => {
    const p = PRODUCTOS.find(x => x.id === productoId)
    return {
      folio: `MER-${String(MERMAS.length - i).padStart(5, '0')}`,
      fecha: new Date(Date.now() - atras * 24 * 3600_000).toISOString(),
      cantidad: cant, costo_centavos: Math.round(cant * p.precio * 0.62), motivo, sucursal_id,
      productos: { nombre: p.nombre, unidad: p.unidad },
    }
  })
    .filter(deSucursal(sucursalId))
    .filter(m => (!desde || m.fecha >= desde) && (!hasta || m.fecha < hasta))
  return pagina(lista, n, porPagina)
}

/* ── Organización ────────────────────────────────────────── */
export async function listarSucursales() {
  await espera()
  return SUCURSALES.map(({ prefijo: _prefijo, terminales: _terminales, peso: _peso, ...s }) => s)
}

export async function listarUsuarios() {
  await espera()
  return USUARIOS
}

export async function vincularUsuario(usuarioId) {
  await espera()
  const usuario = USUARIOS.find(u => u.id === usuarioId)
  if (!usuario) throw new Error('El usuario no existe.')
  usuario.auth_user_id = `auth-${usuarioId}`
}

const METAS = { 'suc-centro': 18000000, 'suc-norte': 16000000, 'suc-sur': 11000000, 'suc-oriente': 12000000 }
const SALDOS = { 'suc-centro': 1250000, 'suc-norte': 845000, 'suc-sur': 0, 'suc-oriente': 2310000 }

export async function listarMetas() {
  await espera()
  return Object.entries(METAS).map(([sucursal_id, meta_centavos]) => ({ sucursal_id, meta_centavos }))
}

export async function listarSaldosCredito() {
  await espera()
  return Object.entries(SALDOS).map(([sucursal_id, saldo_centavos]) => ({ sucursal_id, saldo_centavos }))
}

/* ── Sistema ─────────────────────────────────────────────── */
export async function listarConfiguracion() {
  await espera()
  return [
    { clave: 'alerta.dias_sin_venta', valor: '30' },
    { clave: 'empresa.nombre',        valor: 'Cremerías El Rancho' },
    { clave: 'ticket.mensaje_pie',    valor: '¡Gracias por su compra!' },
  ]
}

const BITACORA = [
  ['VENTA_CANCELADA',  'Canceló una venta de $185.00',               'usr-ana',     'suc-centro',  0.4],
  ['CORTE_CAJA',       'Cerró el turno de Caja 1 sin diferencia',     'usr-ana',     'suc-centro',  13],
  ['SURTIDO_RECIBIDO', 'Recibió surtido del almacén a crédito',       'usr-roberto', 'suc-norte',   20],
  ['MERMA',            'Registró merma: Crema Ácida 1 L × 3',         'usr-maria',   'suc-centro',  26],
  ['USUARIO_ALTA',     'Dio de alta a Elena Vargas como cajera',      'usr-carlos',  'suc-almacen', 49],
  ['PRECIO_CAMBIO',    'Cambió el precio de Queso Oaxaca',            'usr-carlos',  'suc-almacen', 52],
  ['CORTE_CAJA',       'Cerró el turno de Caja 1 con faltante',       'usr-lucia',   'suc-sur',     61],
  ['RETIRO_EFECTIVO',  'Retiro a caja fuerte por $1,500.00',          'usr-pedro',   'suc-sur',     68],
]

export async function listarBitacora({ pagina: n = 0, porPagina = 25 } = {}) {
  await espera()
  const lista = BITACORA.map(([accion, descripcion, usuario_id, sucursal_id, horas], i) => ({
    folio: `BIT-${String(4200 - i).padStart(6, '0')}`,
    fecha: new Date(Date.now() - horas * 3600_000).toISOString(),
    accion, descripcion, usuario_id, sucursal_id,
  }))
  return pagina(lista, n, porPagina)
}

export async function contarAvisos({ hoy }) {
  await espera()
  const turnos = todosLosTurnos()
  return {
    ordenesPendientes:   ordenesPendientes().length,
    canceladasHoy:       todasLasVentas().filter(v => v.estado === 'CANCELADA' && v.fecha >= hoy).length,
    cortesConDiferencia: turnos.filter(t => t.estado === 'CERRADO' && t.diferencia_centavos !== 0 && t.cerrado_en >= hoy).length,
    cajasAbiertas:       turnos.filter(t => t.estado === 'ABIERTO').length,
  }
}

/* ── Ventas en ruta (camiones) ───────────────────────────── */
// Con la forma de las vistas y tablas de cremeria-ruta/supabase/propuesta-ruta.sql. En la base cada
// camión es una sucursal; aquí van aparte para no mezclarlos con las tiendas de los demás ejemplos.
const ALMACEN_GPS = [20.5755, -100.3610] // Carretera a Celaya km 4

const CAMIONES = [
  { sucursal_id: 'suc-ruta-norte',   nombre: 'Camión 1', placas: 'JAL-123-B', prefijo: 'RNORTE',   activo: true, sucursal: { nombre: 'Ruta Norte' },
    camino: [[20.624, -100.420], [20.635, -100.405], [20.649, -100.397], [20.660, -100.380], [20.672, -100.392]] },
  { sucursal_id: 'suc-ruta-sur',     nombre: 'Camión 2', placas: 'QRO-456-C', prefijo: 'RSUR',     activo: true, sucursal: { nombre: 'Ruta Sur' },
    camino: [[20.570, -100.455], [20.582, -100.430], [20.594, -100.410], [20.608, -100.392]] },
  { sucursal_id: 'suc-ruta-oriente', nombre: 'Camión 3', placas: 'QRO-321-A', prefijo: 'RORIENTE', activo: true, sucursal: { nombre: 'Ruta Oriente' },
    camino: [[20.590, -100.375], [20.604, -100.360], [20.620, -100.345], [20.638, -100.330]] },
]

const PERSONAL_RUTA = [
  { usuario_id: 'usr-ruta-juan',   rol_ruta: 'CHOFER',    sucursal_id: null,               activo: true, usuario: { nombre_completo: 'Juan Pérez',    usuario: 'juan.perez',    activo: true } },
  { usuario_id: 'usr-ruta-carlos', rol_ruta: 'CHOFER',    sucursal_id: null,               activo: true, usuario: { nombre_completo: 'Carlos López',  usuario: 'carlos.lopez',  activo: true } },
  { usuario_id: 'usr-ruta-mario',  rol_ruta: 'CHOFER',    sucursal_id: 'suc-ruta-oriente', activo: true, usuario: { nombre_completo: 'Mario García',  usuario: 'mario.garcia',  activo: true } },
  { usuario_id: 'usr-ruta-rosa',   rol_ruta: 'ENCARGADO', sucursal_id: null,               activo: true, usuario: { nombre_completo: 'Rosa Martínez', usuario: 'rosa.martinez', activo: true } },
  { usuario_id: 'usr-ruta-pedro',  rol_ruta: 'ALMACEN',   sucursal_id: null,               activo: true, usuario: { nombre_completo: 'Pedro Gómez',   usuario: 'pedro.gomez',   activo: true } },
]
// Solo para revisar que dos personas no tengan el mismo PIN, como la función de la base
const PINES_RUTA = new Map([['usr-ruta-juan', '1234'], ['usr-ruta-carlos', '2468'], ['usr-ruta-mario', '4321'], ['usr-ruta-rosa', '9999'], ['usr-ruta-pedro', '5678']])

const PRODUCTOS_RUTA = [
  ['Queso Oaxaca 1 kg', 'PZA', 18500], ['Queso Panela 400 g', 'PZA', 7200], ['Queso Manchego a granel', 'KG', 21000],
  ['Crema ácida 1 L', 'PZA', 6800], ['Mantequilla 200 g', 'PZA', 4500], ['Yogurt natural 1 L', 'PZA', 4800],
]

// Punto del camino a una fracción `t` del día: sale del almacén, recorre su zona y regresa.
function puntoEn(camino, t) {
  const paradas = [ALMACEN_GPS, ...camino, ALMACEN_GPS]
  const tramo = Math.min(paradas.length - 2, Math.floor(t * (paradas.length - 1)))
  const f = t * (paradas.length - 1) - tramo
  const [a, b] = [paradas[tramo], paradas[tramo + 1]]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
}

function armarJornada({ camion, chofer, salida, horas, cerrada, faltante = 0, sinSenalMin = 0, semilla }) {
  const r = azar(semilla)
  const inicio = salida.getTime()
  const finPlan = inicio + horas * 3600000
  const fin = cerrada ? finPlan : Math.min(Date.now(), finPlan)
  const turno_id = `turno-${camion.sucursal_id}-${diaLocal(salida)}`
  const en = (ms) => new Date(ms).toISOString()
  const dondeA = (ms) => {
    const [lat, lng] = puntoEn(camion.camino, (ms - inicio) / (finPlan - inicio))
    return [Number((lat + (r() - 0.5) * 0.0008).toFixed(6)), Number((lng + (r() - 0.5) * 0.0008).toFixed(6))]
  }

  // Un punto cada 3 min; si el teléfono dejó de mandar, el recorrido se corta ahí
  const ultimoGps = fin - sinSenalMin * 60000
  const recorrido = []
  for (let ms = inicio; ms <= ultimoGps; ms += 180000) {
    const [lat, lng] = dondeA(ms)
    recorrido.push({ lat, lng, precision_m: 8 + Math.round(r() * 20), en: en(ms) })
  }

  const ventas = []
  let n = 0
  for (let ms = inicio + 1200000; ms < fin - 600000; ms += (18 + r() * 22) * 60000) {
    // Un renglón por producto, como lo manda el teléfono (cada toque suma al mismo renglón)
    const elegidos = new Set(Array.from({ length: 1 + Math.floor(r() * 3) }, () => Math.floor(r() * PRODUCTOS_RUTA.length)))
    const renglones = [...elegidos].map(i => {
      const [descripcion, unidad, precio] = PRODUCTOS_RUTA[i]
      const cantidad = unidad === 'KG' ? Math.round((0.25 + r() * 1.5) * 1000) / 1000 : 1 + Math.floor(r() * 4)
      return { descripcion, unidad, cantidad, precio_unitario_centavos: precio, importe_centavos: Math.round(cantidad * precio) }
    })
    const cancelada = r() < 0.06
    const [lat, lng] = dondeA(ms)
    const suerte = r()
    n++
    ventas.push({
      id: `${turno_id}-v${n}`,
      folio: `${camion.prefijo}-3F25-${String(semilla * 40 + n).padStart(6, '0')}`,
      fecha: en(ms),
      total_centavos: renglones.reduce((s, x) => s + x.importe_centavos, 0),
      estado: cancelada ? 'CANCELADA' : 'COMPLETADA',
      metodo: r() < 0.78 ? 'EFECTIVO' : 'TRANSFERENCIA',
      ticket: suerte < 0.4 ? 'QR' : suerte < 0.6 ? 'ENVIADO' : suerte < 0.9 ? 'IMPRESO' : 'SIN_TICKET',
      motivo_cancelacion: cancelada ? 'El cliente la regresó' : null,
      lat,
      lng,
      detalle: renglones,
    })
  }
  ventas.reverse()

  // Merma en algunas jornadas, con su valor a precio de venta (como la manda el teléfono)
  const cuantasMermas = semilla % 3 === 0 ? 1 : semilla % 5 === 0 ? 2 : 0
  const mermas = Array.from({ length: cuantasMermas }, (_, i) => {
    const [descripcion, unidad, precio] = PRODUCTOS_RUTA[(semilla + i) % PRODUCTOS_RUTA.length]
    const cantidad = unidad === 'KG' ? 0.75 : 1 + i
    return {
      id: `merma:${turno_id}-${i}`, fecha: en(inicio + (1 + i) * 5400000), descripcion, cantidad, unidad,
      motivo: i ? 'Se dañó el empaque' : 'Se echó a perder', importe_centavos: Math.round(cantidad * precio),
    }
  })

  const completas = ventas.filter(v => v.estado === 'COMPLETADA')
  const esperado = 50000 + completas.filter(v => v.metodo === 'EFECTIVO').reduce((s, v) => s + v.total_centavos, 0)
  const ultimo = recorrido.at(-1)
  return {
    turno_id,
    sucursal_id: camion.sucursal_id,
    ruta: camion.sucursal.nombre,
    camion: `${camion.nombre} · ${camion.placas}`,
    chofer_id: chofer.usuario_id,
    chofer: chofer.usuario.nombre_completo,
    salida: en(inicio),
    cierre: cerrada ? en(fin) : null,
    estado: cerrada ? 'CERRADA' : 'EN_RUTA',
    fondo_centavos: 50000,
    vendido_centavos: completas.reduce((s, v) => s + v.total_centavos, 0),
    ventas: completas.length,
    canceladas: ventas.length - completas.length,
    efectivo_esperado_centavos: cerrada ? esperado : null,
    efectivo_contado_centavos: cerrada ? esperado - faltante : null,
    // En unas el almacén contó billete por billete; en otras escribió el total de un jalón
    efectivo_desglose: cerrada && semilla % 2 === 1 ? desgloseDemo(esperado - faltante) : null,
    a_cargo_centavos: cerrada ? faltante : null,
    mermas: mermas.length,
    merma_centavos: mermas.reduce((s, m) => s + m.importe_centavos, 0),
    lat: ultimo?.lat ?? null,
    lng: ultimo?.lng ?? null,
    ultima_ubicacion_en: ultimo?.en ?? null,
    _ventas: ventas,
    _recorrido: recorrido,
    _mermas: mermas,
  }
}

// Como lo cuenta el almacén con "Contar billetes": de mayor a menor; lo que no hace billete, en monedas
function desgloseDemo(total) {
  let resto = total
  const billetes = []
  for (const valor of [100000, 50000, 20000, 10000, 5000, 2000]) {
    const piezas = Math.floor(resto / valor)
    if (piezas) billetes.push({ valor_centavos: valor, piezas })
    resto -= piezas * valor
  }
  return { billetes, monedas_centavos: resto, total_centavos: total }
}

let jornadasGeneradas = null
function jornadasRuta() {
  if (jornadasGeneradas) return jornadasGeneradas
  const [norte, sur, oriente] = CAMIONES
  const [juan, carlos, mario] = PERSONAL_RUTA
  const lista = []
  // Hoy: dos camiones en ruta (uno lleva rato sin mandar ubicación) y uno ya cerrado con faltante.
  // Si es muy temprano, la salida se recorre para que ya lleven un par de horas.
  const hoy = inicioDelDia()
  const salidaHoy = (h) => new Date(Math.min(hoy.getTime() + h * 3600000, Date.now() - 2 * 3600000))
  lista.push(armarJornada({ camion: norte, chofer: juan, salida: salidaHoy(7.5), horas: 8, cerrada: false, semilla: 11 }))
  lista.push(armarJornada({ camion: oriente, chofer: mario, salida: salidaHoy(8), horas: 8, cerrada: false, sinSenalMin: 45, semilla: 12 }))
  lista.push(armarJornada({ camion: sur, chofer: carlos, salida: salidaHoy(6.5), horas: 1.8, cerrada: true, faltante: 18500, semilla: 13 }))
  // La semana anterior, todas cerradas
  for (let d = 1; d <= 6; d++) {
    const dia = sumarDias(hoy, -d)
    const salida = (h) => new Date(dia.getTime() + h * 3600000)
    lista.push(armarJornada({ camion: norte, chofer: juan, salida: salida(7.5), horas: 6.5, cerrada: true, faltante: d === 3 ? 4500 : 0, semilla: 100 + d }))
    lista.push(armarJornada({ camion: sur, chofer: carlos, salida: salida(7), horas: 6, cerrada: true, semilla: 200 + d }))
    if (d % 2) lista.push(armarJornada({ camion: oriente, chofer: mario, salida: salida(8), horas: 5.5, cerrada: true, faltante: d === 5 ? 12000 : 0, semilla: 300 + d }))
  }
  jornadasGeneradas = lista
  return lista
}

const sinInternos = ({ _ventas: _v, _recorrido: _r, _mermas: _m, ...j }) => j

export async function listarJornadas({ desde, hasta, sucursalId } = {}) {
  await espera()
  return jornadasRuta()
    .filter(j => j.estado === 'EN_RUTA' || ((!desde || j.salida >= desde) && (!hasta || j.salida < hasta)))
    .filter(deSucursal(sucursalId))
    .sort((a, b) => b.salida.localeCompare(a.salida))
    .map(sinInternos)
}

export async function listarVentasDeJornada(turnoId) {
  await espera()
  return jornadasRuta().find(j => j.turno_id === turnoId)?._ventas ?? []
}

export async function listarMermasDeJornada(turnoId) {
  await espera()
  return jornadasRuta().find(j => j.turno_id === turnoId)?._mermas ?? []
}

export async function listarRecorrido(turnoId) {
  await espera()
  return jornadasRuta().find(j => j.turno_id === turnoId)?._recorrido ?? []
}

export async function listarCamiones() {
  await espera()
  const hace = (min) => new Date(Date.now() - min * 60000).toISOString()
  const telefonos = {
    'suc-ruta-norte':   [{ dispositivo_id: 'tel-1', terminal: '3F25', registrado_en: '2026-10-01T14:00:00Z', ultimo_contacto: hace(1),   cuenta: { nombre_completo: 'Camión Norte',   usuario: 'ruta-norte' } }],
    'suc-ruta-sur':     [{ dispositivo_id: 'tel-2', terminal: 'A07C', registrado_en: '2026-10-01T14:10:00Z', ultimo_contacto: hace(190), cuenta: { nombre_completo: 'Camión Sur',     usuario: 'ruta-sur' } }],
    'suc-ruta-oriente': [{ dispositivo_id: 'tel-3', terminal: '5B91', registrado_en: '2026-10-02T13:30:00Z', ultimo_contacto: hace(45),  cuenta: { nombre_completo: 'Camión Oriente', usuario: 'ruta-oriente' } }],
  }
  return CAMIONES.map(({ camino: _camino, ...c }) => ({ ...c, telefonos: telefonos[c.sucursal_id] ?? [] }))
}

// Las mismas reglas que ruta_guardar_camion: prefijo de 2 a 10 letras o números, sin repetirse.
export async function guardarCamion({ sucursalId, nombre, placas, prefijo, activo }) {
  await espera()
  const p = String(prefijo ?? '').trim().toUpperCase()
  if (!/^[A-Z0-9]{2,10}$/.test(p)) throw new Error('El prefijo lleva de 2 a 10 letras o números, sin espacios.')
  if (CAMIONES.some(c => c.prefijo === p && c.sucursal_id !== sucursalId)) throw new Error('Ese prefijo ya lo usa otro camión.')
  const datos = { nombre: nombre.trim(), placas: String(placas ?? '').trim().toUpperCase(), prefijo: p, activo }
  const camion = CAMIONES.find(c => c.sucursal_id === sucursalId)
  if (camion) Object.assign(camion, datos)
  else CAMIONES.push({ sucursal_id: sucursalId, ...datos, sucursal: { nombre: SUCURSALES.find(s => s.id === sucursalId)?.nombre ?? 'Sucursal' }, camino: CAMIONES[0].camino })
}

export async function listarPersonalRuta() {
  await espera()
  return PERSONAL_RUTA.map(p => ({ ...p }))
}

// Las mismas reglas que ruta_guardar_personal: PIN de 4 números, obligatorio al dar o devolver el
// acceso y sin repetirse.
export async function guardarPersonalRuta({ usuarioId, rol, sucursalId, pin }) {
  await espera()
  const existente = PERSONAL_RUTA.find(p => p.usuario_id === usuarioId)
  if (!pin && !existente?.activo) throw new Error('Asigna un PIN de 4 números (es obligatorio al dar o devolver el acceso)')
  if (pin && !/^\d{4}$/.test(pin)) throw new Error('El PIN son 4 números')
  const repetido = [...PINES_RUTA].some(([id, otro]) => id !== usuarioId && otro === pin && PERSONAL_RUTA.find(p => p.usuario_id === id)?.activo)
  if (pin && repetido) throw new Error('Ese PIN ya lo tiene otra persona')
  if (pin) PINES_RUTA.set(usuarioId, pin)
  if (existente) {
    Object.assign(existente, { rol_ruta: rol, sucursal_id: sucursalId || null, activo: true })
    return
  }
  const u = USUARIOS.find(x => x.id === usuarioId)
  PERSONAL_RUTA.push({
    usuario_id: usuarioId, rol_ruta: rol, sucursal_id: sucursalId || null, activo: true,
    usuario: { nombre_completo: u?.nombre_completo ?? '—', usuario: u?.usuario ?? '', activo: true },
  })
}

export async function quitarPersonalRuta(usuarioId) {
  await espera()
  const p = PERSONAL_RUTA.find(x => x.usuario_id === usuarioId)
  if (p) p.activo = false
}


/* ── Compras (proveedores y órdenes) ─────────────────────── */
const PROVEEDORES_DEMO = [
  { id: 1, nombre: 'Lácteos del Norte S.A.',     rfc: 'LNO820415GH3', contacto: 'Ing. Pedro Soto',    telefono: '442-800-1234', email: 'ventas@lacteosdelNorte.mx',    categoria: 'Lácteos'   },
  { id: 2, nombre: 'Cremería Industrial CDMX',   rfc: 'CIC940230JK7', contacto: 'Lic. Sofía Ávila',   telefono: '55-1234-5678', email: 'pedidos@cremeriaindustrial.mx', categoria: 'Derivados' },
  { id: 3, nombre: 'Distribuidora Láctea Bajío', rfc: 'DLB761005PQ2', contacto: 'Sr. Armando Cruz',   telefono: '476-200-9900', email: 'a.cruz@lacteabajio.com',        categoria: 'Lácteos'   },
]

const ORDENES_DEMO = [
  { id: 'OC-0234', proveedor: 'Lácteos del Norte S.A.',     fecha: '2026-07-28', items: 8,  total: 24500, status: 'Recibida',    pago: 'Pagado'      },
  { id: 'OC-0233', proveedor: 'Cremería Industrial CDMX',   fecha: '2026-07-27', items: 5,  total: 18900, status: 'En tránsito', pago: 'Pendiente'   },
  { id: 'OC-0232', proveedor: 'Distribuidora Láctea Bajío', fecha: '2026-07-25', items: 12, total: 32400, status: 'Recibida',    pago: 'Pagado'      },
  { id: 'OC-0231', proveedor: 'Lácteos del Norte S.A.',     fecha: '2026-07-22', items: 6,  total: 15800, status: 'Recibida',    pago: 'Pagado'      },
  { id: 'OC-0230', proveedor: 'Cremería Industrial CDMX',   fecha: '2026-07-20', items: 9,  total: 27100, status: 'Recibida',    pago: 'Crédito 30d' },
]

export async function listarProveedores() {
  await espera()
  return [...PROVEEDORES_DEMO]
}

export async function listarOrdenes() {
  await espera()
  return [...ORDENES_DEMO]
}
