import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Banknote, Truck, CalendarDays, Receipt, Monitor, Target, XCircle } from 'lucide-react'
import ChartTooltip from '../components/ChartTooltip'
import AvisoError from '../components/AvisoError'
import EnVivo from '../components/EnVivo'
import { SkeletonLine } from '../components/Skeleton'
import { useConsulta } from '../hooks/useConsulta'
import { useEnfocarTitulo } from '../hooks/useEnfocarTitulo'
import { useSucursales } from '../hooks/useSucursales'
import { useAuth } from '../auth/contexto'
import { listarVentasResumen, listarUltimasVentas } from '../api/ventas'
import { listarTurnosAbiertos } from '../api/cajas'
import { listarOrdenesPendientes } from '../api/inventario'
import { listarMetas } from '../api/organizacion'
import { resumenVentas, ventasPorDia, ventasPorSucursal, esCancelada } from '../lib/calculos'
import { pesos, pesosCorto, pesosEje, plural, hora, fmtDec, inicioDelDia, inicioDelMes, sumarDias, diaLargo, mesNombre, diaLocal } from '../utils/fmt'
import Grafica from '../components/Grafica'

const UN_DIA = 24 * 60 * 60 * 1000

const enlace = { fontSize: '0.8125rem', fontWeight: 600, color: '#C2410C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, padding: '2px 0' }
const tarjeta = { display: 'flex', flexDirection: 'column', minWidth: 0 }
const filaLista = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 6px', borderRadius: 10 }

// Encabezado de cada tarjeta: ícono, título, una nota opcional y, a la derecha, el enlace a su pantalla.
// Las cuatro tarjetas usan el mismo; antes cada una tenía su propio botón (con borde, ancho o de texto).
function Encabezado({ icon: Icon, titulo, nota, accion, onAccion }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9375rem', fontWeight: 600, color: '#263442' }}>
          <Icon size={16} color="#627080" strokeWidth={2.1} aria-hidden="true" style={{ flexShrink: 0 }} />
          {titulo}
        </h2>
        {nota && <p style={{ fontSize: '0.75rem', color: '#627080', marginTop: 3 }}>{nota}</p>}
      </div>
      {accion && <button onClick={onAccion} style={enlace}>{accion}</button>}
    </div>
  )
}

function Vacio({ children }) {
  return <p style={{ fontSize: '0.75rem', color: '#627080', padding: '18px 6px', textAlign: 'center' }}>{children}</p>
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const { nombreCorto } = useSucursales()

  // Una sola consulta de ventas cubre hoy, los últimos 7 días y el mes en curso.
  const hoy      = inicioDelDia()
  const hoyISO   = hoy.toISOString()
  const hace7    = sumarDias(hoy, -6)
  const mesISO   = inicioDelMes(hoy).toISOString()
  const desdeISO = hace7.toISOString() < mesISO ? hace7.toISOString() : mesISO

  const { datos, cargando, error, recargar } = useConsulta(async () => {
    const [ventas, ultimas, abiertas, metas, ordenes] = await Promise.all([
      listarVentasResumen({ desde: desdeISO }),
      listarUltimasVentas({ desde: hoyISO, limite: 7 }),
      listarTurnosAbiertos(),
      listarMetas(),
      listarOrdenesPendientes(),
    ])
    return { ventas, ultimas, abiertas, metas, ordenes }
  }, [desdeISO, hoyISO], { enVivo: ['ventas', 'turnos_caja', 'ordenes_reabastecimiento'] })

  const r = useMemo(() => {
    const filas = datos?.ventas.filas ?? []
    const inicioHoy = new Date(hoyISO)
    // Para comparar parejo: lo vendido ayer hasta esta misma hora
    const ayerISO  = sumarDias(inicioHoy, -1).toISOString()
    const corteISO = new Date(Date.now() - UN_DIA).toISOString()
    const ayer = resumenVentas(filas.filter(v => v.fecha >= ayerISO && v.fecha < corteISO))
    const hoyR = resumenVentas(filas.filter(v => v.fecha >= hoyISO))

    const delMes = ventasPorSucursal(filas.filter(v => v.fecha >= mesISO))
    const mesVendido = [...delMes.values()].reduce((s, x) => s + x.centavos, 0)
    const mesMeta = (datos?.metas ?? []).reduce((s, m) => s + (m.meta_centavos ?? 0), 0)
    const metas = (datos?.metas ?? [])
      .map(m => {
        const vendido = delMes.get(m.sucursal_id)?.centavos ?? 0
        return { id: m.sucursal_id, vendido, meta: m.meta_centavos, avance: m.meta_centavos ? Math.round(vendido / m.meta_centavos * 100) : 0 }
      })
      .sort((a, b) => b.avance - a.avance)

    return {
      hoy: hoyR,
      delta: ayer.vendido ? Math.round((hoyR.vendido - ayer.vendido) / ayer.vendido * 100) : null,
      semana: ventasPorDia(filas, sumarDias(inicioHoy, -6), inicioHoy),
      mesVendido, mesMeta, metas,
    }
  }, [datos, hoyISO, mesISO])

  // Mientras llega la primera respuesta, o si falló, no hay cifras que mostrar: un cero se leería como dato real.
  const sinDatos = datos === undefined
  const abiertas = datos?.abiertas ?? []
  const ordenes  = datos?.ordenes ?? []
  const ultimas  = datos?.ultimas ?? []
  const esperado = hoy.getDate() / new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate() * 100

  const nombre = perfil.nombre?.split(' ')[0]
  const h = new Date().getHours()
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  const titulo = useEnfocarTitulo()
  const ir = (path) => () => navigate(path)

  // La nota de cada indicador lleva un dato, no repite la etiqueta
  const primeraAbierta = abiertas.reduce((min, t) => (!min || t.abierto_en < min ? t.abierto_en : min), null)
  const sucursalesPorSurtir = new Set(ordenes.map(o => o.sucursal_id)).size
  const kpis = [
    { Icon: Banknote, label: 'Ventas hoy',     value: pesosCorto(r.hoy.vendido), sub: r.delta == null ? 'sin contar canceladas' : `${r.delta >= 0 ? '+' : '−'}${Math.abs(r.delta)}% vs ayer a esta hora`, good: r.delta > 0, alert: r.delta < 0, iconColor: '#627080', path: '/ventas' },
    { Icon: Receipt,  label: 'Tickets hoy',    value: r.hoy.completadas,         sub: r.hoy.completadas ? `promedio ${pesos(r.hoy.ticketPromedio)}` : 'aún sin ventas', iconColor: '#627080', path: '/ventas' },
    { Icon: Monitor,  label: 'Cajas abiertas', value: abiertas.length,           sub: primeraAbierta ? `la primera desde las ${hora(primeraAbierta)}` : 'ninguna en este momento', iconColor: '#047857', path: '/cajas' },
    // Son pedidos, no productos: en Inventario "Bajo mínimo" cuenta productos y daría otra cifra
    { Icon: Truck,    label: 'Por reabastecer', value: ordenes.length,           sub: ordenes.length ? `pedidos en ${plural(sucursalesPorSurtir, 'sucursal', 'sucursales')}` : 'inventario en orden', alert: ordenes.length > 0, iconColor: ordenes.length ? '#8A4A42' : '#627080', path: '/inventario' },
  ]

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ══ HERO DEL PANEL (claro) ════════════════════════════ */}
      <div className="panel-hero">
        <div className="min-w-0">
          <p className="panel-hero-crumb">{diaLargo(hoy)}</p>
          <h1 ref={titulo} className="panel-hero-title">{saludo}, {nombre}</h1>
          <p className="panel-hero-sub">Resumen de hoy en todas las sucursales</p>
          <div className="panel-hero-tags">
            <EnVivo error={error} />
            {r.hoy.canceladas > 0 && !sinDatos && (
              <button onClick={ir('/ventas')} className="cancel-chip-light">
                <XCircle size={12} /> {r.hoy.canceladas} cancelada{r.hoy.canceladas > 1 ? 's' : ''} hoy
              </button>
            )}
          </div>
        </div>
        {/* Cifra del mes: no se repite en los indicadores (esos son de hoy) */}
        <div className="panel-hero-metric">
          <p className="panel-hero-metric-label">Ventas de {mesNombre(hoy)}</p>
          <p className="panel-hero-metric-value">{sinDatos ? '—' : pesosCorto(r.mesVendido)}</p>
          <p className="panel-hero-metric-sub">
            {sinDatos
              ? ' '
              : r.mesMeta
                ? `meta ${pesosCorto(r.mesMeta)} · ${Math.round(r.mesVendido / r.mesMeta * 100)}%`
                : 'sin meta este mes'}
          </p>
        </div>
      </div>

      <AvisoError error={error} onReintentar={recargar} />

      {/* ══ KPI GRID: cada indicador lleva a su pantalla; es un botón de verdad, también con teclado ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {kpis.map(({ Icon, label, value, sub, good, alert, iconColor, path }) => (
          <button key={label} type="button" className="card kpi-enlace" onClick={ir(path)}>
            <span className="kpi-cell-label">
              <Icon size={15} color={iconColor} aria-hidden="true" style={{ flexShrink: 0 }} />
              {label}
            </span>
            {cargando
              ? <SkeletonLine w="w-2/3" h="h-7" />
              : <span className="kpi-cell-value" style={{ color: '#263442' }}>{sinDatos ? '—' : value}</span>}
            <span className="kpi-cell-sub" style={{ color: good ? '#047857' : alert ? '#8A4A42' : '#627080' }}>{sinDatos ? ' ' : sub}</span>
          </button>
        ))}
      </div>

      {/* ══ GRID 60/40: cada renglón empareja el alto de sus dos tarjetas ══ */}
      <div className="dashboard-grid">

        {/* Ventas de los últimos 7 días */}
        <div className="card p-5" style={tarjeta}>
          <Encabezado
            icon={CalendarDays}
            titulo="Ventas de los últimos 7 días"
            nota={<>Total: <strong style={{ color: '#263442' }}>{sinDatos ? '—' : pesos(r.semana.reduce((s, d) => s + d.centavos, 0))}</strong> · sin contar canceladas</>}
            accion="Ver ventas"
            onAccion={ir('/ventas')}
          />
          {/* La gráfica ocupa el alto que le deje la tarjeta de al lado */}
          <div style={{ flex: 1, minHeight: 200, position: 'relative' }}>
            {/* Una semana sin ventas no se dibuja como gráfica vacía con un eje de $0 a $4 */}
            {!cargando && (sinDatos || r.semana.every(d => !d.centavos))
              ? <Vacio>{sinDatos ? 'No se pudieron cargar las ventas.' : 'Sin ventas en los últimos 7 días.'}</Vacio>
              : <div style={{ position: 'absolute', inset: 0 }}>
              <Grafica titulo="Ventas de los últimos 7 días" datos={r.semana} etiqueta="etiqueta" valor="total">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={r.semana} barCategoryGap="32%" margin={{ top: 8, left: 0, right: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 0" stroke="#E8EBEF" vertical={false} />
                  <XAxis dataKey="etiqueta" tick={{ fontSize: 10, fill: '#627080', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  {/* Eje con montos para leer la gráfica sin pasar el mouse */}
                  <YAxis tick={{ fontSize: 10, fill: '#627080' }} axisLine={false} tickLine={false} width={46} tickFormatter={pesosEje} />
                  <Tooltip content={props => <ChartTooltip {...props} format={fmtDec} />} cursor={{ fill: 'rgba(249,115,22,.06)' }} />
                  <Bar dataKey="total" radius={[7, 7, 2, 2]}>
                    {r.semana.map(d => <Cell key={d.dia} fill={d.dia === diaLocal(hoy) ? '#C2410C' : '#FDBA74'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </Grafica>
            </div>}
          </div>
        </div>

        {/* Últimas ventas */}
        <div className="card p-5" style={tarjeta}>
          <Encabezado icon={Receipt} titulo="Últimas ventas de hoy" nota="Las cajas suben sus ventas cada 10 segundos" accion="Ver todas" onAccion={ir('/ventas')} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ultimas.map((v, i) => {
              const cancelada = esCancelada(v)
              return (
                <div key={v.id}>
                  {i > 0 && <div style={{ height: 1, background: '#E8EBEF', margin: '0 4px' }} />}
                  <div style={filaLista}>
                    {cancelada
                      ? <XCircle size={17} color="#8A4A42" aria-hidden="true" style={{ flexShrink: 0 }} />
                      : <Receipt size={17} color="#627080" aria-hidden="true" style={{ flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="truncate" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#263442' }}>{v.folio}</p>
                      <p className="truncate" style={{ fontSize: '0.6875rem', color: '#627080' }}>
                        {hora(v.fecha)} · {v.cajero?.nombre_completo ?? nombreCorto(v.sucursal_id)}{cancelada ? ' · cancelada' : ''}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: cancelada ? '#8A4A42' : '#263442', textDecoration: cancelada ? 'line-through' : 'none', flexShrink: 0 }}>
                      {pesos(v.total_centavos)}
                    </span>
                  </div>
                </div>
              )
            })}
            {!cargando && ultimas.length === 0 && <Vacio>{sinDatos ? 'No se pudieron cargar las ventas.' : 'Todavía no hay ventas hoy.'}</Vacio>}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">

        {/* Meta del mes */}
        <div className="card p-5" style={tarjeta}>
          <Encabezado icon={Target} titulo={`Meta de ${mesNombre(hoy)}`} nota="La línea gris marca el avance esperado a hoy" accion="Ver sucursales" onAccion={ir('/sucursales')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'space-around' }}>
            {r.metas.map(m => {
              const color = m.avance >= esperado ? '#047857' : m.avance >= esperado * 0.8 ? '#92400E' : '#8A4A42'
              return (
                <div key={m.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#263442' }}>{nombreCorto(m.id)}</span>
                    <span style={{ fontSize: '0.6875rem', color: '#627080' }}>
                      {pesosCorto(m.vendido)} de {pesosCorto(m.meta)} · <strong style={{ color }}>{m.avance}%</strong>
                    </span>
                  </div>
                  <div className="progress-track" style={{ position: 'relative' }}>
                    <div className="progress-fill" style={{ width: `${Math.min(100, m.avance)}%`, background: color }} />
                    {/* Lo que debería llevar el mes a la fecha */}
                    <span title="Avance esperado a la fecha" style={{ position: 'absolute', top: -2, bottom: -2, left: `${esperado}%`, width: 2, background: '#263442', opacity: .35, borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
            {!cargando && r.metas.length === 0 && <Vacio>{sinDatos ? 'No se pudieron cargar las metas.' : 'No hay metas capturadas para este mes.'}</Vacio>}
          </div>
        </div>

        {/* Cajas abiertas */}
        <div className="card p-5" style={tarjeta}>
          <Encabezado icon={Monitor} titulo="Cajas abiertas ahora" accion="Ver cajas" onAccion={ir('/cajas')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {abiertas.slice(0, 6).map((t, i) => (
              <div key={t.id}>
                {i > 0 && <div style={{ height: 1, background: '#E8EBEF', margin: '0 4px' }} />}
                <div style={filaLista}>
                  <Monitor size={17} color="#627080" aria-hidden="true" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="truncate" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#263442' }}>{t.caja?.nombre ?? 'Caja'} · {nombreCorto(t.sucursal_id)}</p>
                    <p className="truncate" style={{ fontSize: '0.6875rem', color: '#627080' }}>{t.cajero?.nombre_completo ?? '—'}</p>
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#627080', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>desde {hora(t.abierto_en)}</span>
                </div>
              </div>
            ))}
            {!cargando && abiertas.length === 0 && <Vacio>{sinDatos ? 'No se pudieron cargar las cajas.' : 'Ninguna caja abierta en este momento.'}</Vacio>}
          </div>
        </div>
      </div>
    </div>
  )
}
