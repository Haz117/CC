import { Fragment, useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Search, Eye, XCircle, Download, DollarSign, CreditCard, Smartphone, TrendingDown, AlertTriangle, CheckCircle2, Milk, TrendingUp, Wallet, Info, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { downloadCSV } from '../utils/csv'
import Modal from '../components/Modal'
import SortTh from '../components/SortTh'
import { SkeletonTableRows, SkeletonLine } from '../components/Skeleton'
import Badge from '../components/Badge'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import FilaDesglose from '../components/FilaDesglose'
import TituloTarjeta from '../components/TituloTarjeta'
import KpiBar from '../components/KpiBar'
import EmptyState from '../components/EmptyState'
import AlertBanner from '../components/AlertBanner'
import AvisoError from '../components/AvisoError'
import EnVivo from '../components/EnVivo'
import SelectorSucursal from '../components/SelectorSucursal'
import FiltroPeriodo from '../components/FiltroPeriodo'
import Segmentado from '../components/Segmentado'
import ChartTooltip from '../components/ChartTooltip'
import { useSort } from '../hooks/useSort'
import { usePersistedState } from '../hooks/usePersistedState'
import { useDebounce } from '../hooks/useDebounce'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useConsulta } from '../hooks/useConsulta'
import { usePeriodo } from '../hooks/usePeriodo'
import { useSucursales } from '../hooks/useSucursales'
import { listarVentas, obtenerTicket } from '../api/ventas'
import {
  resumenVentas, ventasPorDia, ventasPorHora, pagosPorMetodo, metodoDeVenta,
  etiquetaEstado, colorEstado, etiquetaMetodo, colorMetodo, esCancelada, esCompletada,
} from '../lib/calculos'
import { pesos, cantidad, fecha, hora, fechaHora, diaCorto, fmtDec } from '../utils/fmt'
import Grafica from '../components/Grafica'

const PER_PAGE = 10
const metodoIcon = { Efectivo: DollarSign, Tarjeta: CreditCard, Transferencia: Smartphone, Mixto: Wallet }

const rowStyle = (venta) =>
  esCancelada(venta) ? { background: 'rgba(201,122,109,.04)', borderLeft: '3px solid rgba(201,122,109,.4)' } : {}

const ordenar = {
  total_centavos: (a, b) => a.total_centavos - b.total_centavos,
}

/* ── Ticket: los renglones se piden al abrirlo ─────────────── */
function Ticket({ venta, onClose }) {
  const { datos: ticket, cargando, error, recargar } = useConsulta(() => obtenerTicket(venta.id), [venta.id])
  const cancelada = esCancelada(venta)
  const renglones = [...(ticket?.venta_detalle ?? [])].sort((a, b) => a.renglon - b.renglon)

  return (
    <Modal
      id="ticket-print-area"
      maxWidth="sm"
      onClose={onClose}
      header={
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold" style={{ color: '#263442' }}>{venta.folio}</h3>
            <Badge label={etiquetaEstado(venta.estado)} color={colorEstado(venta.estado)} />
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#627080' }}>{fechaHora(venta.fecha)}</p>
        </div>
      }
    >
      <div className="p-0">
        {/* Receipt header */}
        <div className="px-6 pt-6 pb-5 text-center" style={{ borderBottom: '2px dashed #FDE8D0' }}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#FFF7ED' }}>
            <Milk className="w-6 h-6" style={{ color: '#C2410C' }} />
          </div>
          <p className="font-bold text-sm" style={{ color: '#263442' }}>{venta.sucursal}</p>
          <p className="text-xs mt-0.5" style={{ color: '#627080' }}>Atendió: {venta.cajeroNombre}</p>
        </div>

        {cancelada && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.25)' }}>
            <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#8A4A42' }} />
            <p className="text-xs font-semibold" style={{ color: '#8A4A42' }}>Esta venta fue cancelada y no cuenta en los totales</p>
          </div>
        )}

        {/* Renglones */}
        <div className="px-6 py-4 space-y-2.5" style={{ borderBottom: '2px dashed #FDE8D0' }}>
          {cargando && <><SkeletonLine h="h-3" /><SkeletonLine w="w-2/3" h="h-3" /><SkeletonLine h="h-3" /></>}
          <AvisoError error={error} onReintentar={recargar} />
          {renglones.map(r => (
            <div key={r.renglon} className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#263442' }}>{r.descripcion}</p>
                <p className="text-xs" style={{ color: '#627080' }}>{cantidad(r.cantidad, r.unidad)} × {pesos(r.precio_unitario_centavos)}</p>
              </div>
              <span className="text-sm font-semibold flex-shrink-0" style={{ color: '#627080' }}>{pesos(r.importe_centavos)}</span>
            </div>
          ))}
          {ticket && renglones.length === 0 && (
            <p className="text-xs text-center" style={{ color: '#627080' }}>Este ticket no tiene renglones.</p>
          )}
        </div>

        {/* Pagos */}
        <div className="px-6 py-4 space-y-2" style={{ borderBottom: '2px dashed #FDE8D0' }}>
          {(venta.venta_pagos ?? []).map((p, i) => (
            <div key={`${p.metodo}-${i}`} className="flex justify-between items-center">
              <span className="text-xs font-medium" style={{ color: '#627080' }}>Pago · {etiquetaMetodo(p.metodo)}</span>
              <span className="text-sm font-semibold" style={{ color: '#627080' }}>{pesos(p.monto_centavos)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="px-6 py-5 text-center">
          <p className="text-xs font-semibold mb-2" style={{ color: cancelada ? '#8A4A42' : '#C2410C' }}>
            Total de venta
          </p>
          <p className="text-4xl font-bold" style={{ color: cancelada ? '#8A4A42' : '#C2410C' }}>
            {pesos(venta.total_centavos)}
          </p>
          {esCompletada(venta) && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(5,150,105,.1)', color: '#047857' }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Pago recibido
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-4 flex justify-between gap-3" style={{ borderTop: '1px solid #FDE8D0' }}>
        <button className="btn-secondary flex items-center gap-2" onClick={() => window.print()}>
          <Download className="w-4 h-4" /> Imprimir ticket
        </button>
        <button onClick={onClose} className="btn-primary">Cerrar</button>
      </div>
    </Modal>
  )
}

export default function Ventas() {
  const { sucursales, nombreCorto } = useSucursales()

  const [search, setSearch] = usePersistedState('ventas-search', '')
  const debouncedSearch = useDebounce(search)
  const [filterEstado, setFilterEstado] = useState('Todas')
  const periodo = usePeriodo('hoy')
  const { dateFrom, dateTo, desde, hasta } = periodo
  const [sucursalId, setSucursalId] = useState('')
  const [page, setPage] = useState(1)
  const [ticket, setTicket] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const { sortKey, sortDir, handleSort } = useSort('fecha', 'desc')

  const { datos, cargando, error, actualizando, recargar } = useConsulta(
    () => listarVentas({ desde, hasta, sucursalId: sucursalId || undefined }),
    [desde, hasta, sucursalId],
    { enVivo: ['ventas'] },
  )

  const ventas = useMemo(() => (datos?.filas ?? []).map(v => ({
    ...v,
    sucursal: nombreCorto(v.sucursal_id),
    cajeroNombre: v.cajero?.nombre_completo ?? '—',
    metodo: metodoDeVenta(v),
  })), [datos, nombreCorto])

  const estados = useMemo(() => ['Todas', ...new Set(ventas.map(v => v.estado))], [ventas])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return ventas.filter(v =>
      (filterEstado === 'Todas' || v.estado === filterEstado) &&
      (!q || v.folio.toLowerCase().includes(q) || v.cajeroNombre.toLowerCase().includes(q) || v.sucursal.toLowerCase().includes(q))
    )
  }, [ventas, debouncedSearch, filterEstado])

  const sorted = useMemo(() => {
    const mult = sortDir === 'asc' ? 1 : -1
    const comparar = ordenar[sortKey] ?? ((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey]), 'es'))
    return [...filtered].sort((a, b) => mult * comparar(a, b))
  }, [filtered, sortKey, sortDir])

  const paginated = useMemo(() => sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE), [sorted, page])

  // Los totales salen de todas las ventas del periodo; las canceladas no suman.
  const resumen   = useMemo(() => resumenVentas(ventas), [ventas])
  const filtrado  = useMemo(() => resumenVentas(filtered), [filtered])
  const metodos   = useMemo(() => pagosPorMetodo(ventas), [ventas])
  const canceladas = useMemo(() => ventas.filter(esCancelada), [ventas])
  const unSoloDia = dateFrom === dateTo
  const tendencia = useMemo(
    () => unSoloDia ? ventasPorHora(ventas) : ventasPorDia(ventas, dateFrom, dateTo),
    [ventas, unSoloDia, dateFrom, dateTo],
  )
  const cobrado = metodos.reduce((s, m) => s + m.centavos, 0)

  useEffect(() => { setPage(1); setExpandedId(null) }, [debouncedSearch, filterEstado, sortKey, sortDir, desde, hasta, sucursalId])
  useEffect(() => { if (!estados.includes(filterEstado)) setFilterEstado('Todas') }, [estados, filterEstado])
  useEscapeKey(() => { setTicket(null); setExpandedId(null) })

  const handleExportCSV = () => downloadCSV(sorted.map(v => ({
    folio: v.folio,
    fecha: `${fecha(v.fecha)} ${hora(v.fecha)}`,
    sucursal: v.sucursal,
    cajero: v.cajeroNombre,
    pago: v.metodo,
    total: (v.total_centavos / 100).toFixed(2),
    estado: etiquetaEstado(v.estado),
  })), `ventas_${dateFrom}_${dateTo}`)

  // Mientras llega la primera respuesta, o si falló, no hay cifras que mostrar: un cero se leería como dato real.
  const sinDatos = datos === undefined
  const estadoKpi = cargando ? 'cargando' : sinDatos ? 'error' : null

  return (
    <div className="space-y-6">

      <PageHeader breadcrumb="Ventas" title="Registro de Ventas">
        <EnVivo actualizando={actualizando} />
        <button onClick={handleExportCSV} className="btn-secondary" disabled={sorted.length === 0}>
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </PageHeader>

      {/* ══ Filtros: cambian los totales, las gráficas y la tabla ═══ */}
      <div className="barra-filtros">
        <FiltroPeriodo periodo={periodo} />
        <SelectorSucursal value={sucursalId} onChange={setSucursalId} sucursales={sucursales} soloTiendas />
      </div>

      <KpiBar estado={estadoKpi} items={[
        { icon: TrendingUp, label: 'Total vendido',   value: pesos(resumen.vendido),        sub: 'ventas completadas',  good: true },
        { icon: ShoppingCart, label: 'Tickets', value: resumen.completadas,           sub: 'completados' },
        { icon: Wallet, label: 'Ticket promedio', value: pesos(resumen.ticketPromedio), sub: 'por venta' },
        { icon: XCircle, label: 'Canceladas', value: resumen.canceladas,            sub: resumen.canceladas ? pesos(resumen.cancelado) : 'sin cancelaciones', alert: resumen.canceladas > 0 },
      ]} />

      <AvisoError error={error} onReintentar={recargar} />

      {datos?.truncado && (
        <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3" style={{ background: '#FFF7ED', border: '1px solid #FDBA74' }}>
          <Info className="w-4 h-4 flex-shrink-0" style={{ color: '#C2410C' }} />
          <p className="text-xs font-semibold" style={{ color: '#C2410C' }}>
            El periodo tiene {datos.total.toLocaleString('es-MX')} ventas y se cargaron las {ventas.length.toLocaleString('es-MX')} más recientes: los totales son parciales. Acorta el rango o elige una sucursal.
          </p>
        </div>
      )}

      {/* ══ Resumen visual — solo desktop ══════════════════════════ */}
      {!sinDatos && <div className="hidden lg:grid lg:grid-cols-5 gap-5">
        <div className="card p-5 lg:col-span-3">
          <TituloTarjeta icon={TrendingUp} titulo={unSoloDia ? 'Ventas por hora' : 'Ventas por día'}>solo completadas</TituloTarjeta>
          {tendencia.length === 0 ? (
            <p className="text-xs text-center py-14" style={{ color: '#627080' }}>Sin ventas completadas en este periodo</p>
          ) : (
            <Grafica titulo={unSoloDia ? 'Ventas por hora' : 'Ventas por día'} datos={tendencia} etiqueta="etiqueta" valor="total">
            <ResponsiveContainer width="100%" height={148}>
              <BarChart data={tendencia} maxBarSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#FDE8D0" />
                <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: '#627080' }} axisLine={false} tickLine={false} minTickGap={12} />
                <Tooltip cursor={{ fill: '#FFF7ED' }} content={props => <ChartTooltip {...props} format={fmtDec} />} />
                <Bar dataKey="total" radius={[5, 5, 0, 0]} fill="#C2410C" />
              </BarChart>
            </ResponsiveContainer>
            </Grafica>
          )}
        </div>

        <div className="card p-5 flex flex-col lg:col-span-2">
          <TituloTarjeta icon={Wallet} titulo="Por método de pago" />
          <div className="flex flex-col gap-3 flex-1 justify-center">
            {metodos.map(m => {
              const pct = cobrado ? Math.round(m.centavos / cobrado * 100) : 0
              return <FilaDesglose key={m.metodo} cuenta={m.pagos} etiqueta={etiquetaMetodo(m.metodo)} derecha={`${pesos(m.centavos)} · ${pct}%`} pct={pct} color={colorMetodo(m.metodo)} />
            })}
            {metodos.length === 0 && <p className="text-xs text-center" style={{ color: '#627080' }}>Sin pagos en este periodo</p>}
          </div>
          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #FDE8D0' }}>
            <span className="text-xs" style={{ color: '#627080' }}>Total cobrado</span>
            <span className="text-sm font-bold" style={{ color: '#C2410C' }}>{pesos(cobrado)}</span>
          </div>
        </div>
      </div>}

      {/* ══ Alerta de cancelaciones ══════════════════════════════ */}
      {canceladas.length > 0 && (
        <AlertBanner
          icon={AlertTriangle}
          title={`${canceladas.length} venta${canceladas.length > 1 ? 's' : ''} cancelada${canceladas.length > 1 ? 's' : ''} en el periodo`}
          subtitle={canceladas.slice(0, 4).map(v => `${v.folio} · ${pesos(v.total_centavos)}`).join('  ·  ') + (canceladas.length > 4 ? `  ·  y ${canceladas.length - 4} más` : '')}
        />
      )}

      {/* ══ Data Section ══════════════════════════════════════════ */}
      {cargando ? <SkeletonTableRows /> : <div className="card overflow-hidden">

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-toolbar-row">
            <div style={{ flex: 1, minWidth: 200 }}>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar por folio, cajero, sucursal…"
                resultCount={filtered.length}
              />
            </div>
            <Segmentado
              opciones={estados.map(s => ({ valor: s, texto: s === 'Todas' ? s : etiquetaEstado(s) }))}
              value={filterEstado}
              onChange={setFilterEstado}
              etiqueta="Estado de la venta"
            />
          </div>
          <div className="data-toolbar-footer">
            {!sinDatos && <div className="toolbar-summary">
              <span><b>{filtered.length}</b> venta{filtered.length !== 1 ? 's' : ''}</span>
              <span className="sep">·</span>
              <span>Total: <b>{pesos(filtrado.vendido)}</b></span>
            </div>}
          </div>
        </div>

        {/* Section head */}
        <div className="section-head">
          <div className="flex items-center gap-2">
            <span className="section-head-text"><strong>Transacciones</strong></span>
            {!sinDatos && <span style={{ fontSize: '.7rem', color: '#627080' }}>{sorted.length} resultado{sorted.length !== 1 ? 's' : ''}</span>}
            {canceladas.length > 0 && <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#8A4A42' }}>{canceladas.length} cancelada{canceladas.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>

        {/* Móvil: una tarjeta compacta por venta; al tocarla se abre el ticket */}
        <ul className="sm:hidden lista-movil">
          {paginated.map(v => {
            const MIcon = metodoIcon[v.metodo] || DollarSign
            const cancelada = esCancelada(v)
            return (
              <li key={v.id}>
                <button type="button" onClick={() => setTicket(v)} className="lista-movil-fila" style={rowStyle(v)} aria-label={`Ver ticket ${v.folio}`}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="folio">{v.folio}</span>
                    <span className="text-base font-bold flex-shrink-0" style={{ color: cancelada ? '#8A4A42' : '#263442', textDecoration: cancelada ? 'line-through' : 'none' }}>
                      {pesos(v.total_centavos)}
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-3 mt-2">
                    <span className="text-xs truncate" style={{ color: '#627080' }}>
                      <b style={{ color: '#263442' }}>{unSoloDia ? hora(v.fecha) : `${diaCorto(v.fecha)} ${hora(v.fecha)}`}</b> · {v.sucursal} · {v.cajeroNombre}
                    </span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#D4DDE6' }} />
                  </span>
                  <span className="flex items-center justify-between gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#627080' }}>
                      <MIcon className="w-3.5 h-3.5" style={{ color: '#627080' }} aria-hidden="true" /> {v.metodo}
                    </span>
                    <Badge label={etiquetaEstado(v.estado)} color={colorEstado(v.estado)} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Table */}
        <div className="hidden sm:block overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla de ventas">
          <table className="table-modern animate-rows">
            <thead>
              <tr>
                <SortTh col="folio" label="Folio" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="fecha" label="Fecha" className="hidden sm:table-cell" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="sucursal" label="Sucursal" className="hidden md:table-cell" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="cajeroNombre" label="Cajero" className="hidden lg:table-cell" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="hidden lg:table-cell">Pago</th>
                <SortTh col="total_centavos" label="Total" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="estado" label="Estado" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(v => {
                const MIcon = metodoIcon[v.metodo] || DollarSign
                const isExpanded = expandedId === v.id
                const cancelada = esCancelada(v)
                return (
                  <Fragment key={v.id}>
                    <tr
                      className="cursor-pointer"
                      style={{ ...rowStyle(v), ...(isExpanded ? { background: '#FFF7ED' } : {}) }}
                      onClick={() => setExpandedId(isExpanded ? null : v.id)}
                    >
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-3.5 h-3.5 rounded-sm text-center leading-none transition-transform duration-200 flex-shrink-0"
                            style={{
                              background: isExpanded ? '#C2410C' : '#FFF7ED',
                              color: isExpanded ? '#fff' : '#C2410C',
                              fontSize: 9, fontWeight: 800,
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                          >▶</span>
                          <span className="folio">{v.folio}</span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell whitespace-nowrap">
                        <p className="text-xs font-medium" style={{ color: '#263442' }}>{hora(v.fecha)}</p>
                        <p className="text-xs" style={{ color: '#627080' }}>{fecha(v.fecha)}</p>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-sm font-medium" style={{ color: '#263442' }}>{v.sucursal}</span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-sm" style={{ color: '#627080' }}>{v.cajeroNombre}</span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <MIcon className="w-3.5 h-3.5" style={{ color: '#627080' }} aria-hidden="true" />
                          <span className="text-sm" style={{ color: '#627080' }}>{v.metodo}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm font-bold" style={{ color: cancelada ? '#8A4A42' : '#263442' }}>
                          {cancelada && <TrendingDown className="w-3 h-3 inline mr-1 opacity-70" />}
                          {pesos(v.total_centavos)}
                        </span>
                      </td>
                      <td><Badge label={etiquetaEstado(v.estado)} color={colorEstado(v.estado)} /></td>
                      <td onClick={e => e.stopPropagation()}>
                        <button onClick={() => setTicket(v)} className="action-btn" title="Ver ticket completo" aria-label={`Ver ticket ${v.folio}`}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: '#FFF7ED' }}>
                        <td colSpan={8} className="px-6 py-3">
                          <div className="flex flex-wrap items-center gap-4">
                            {[
                              ['Fecha', fechaHora(v.fecha)],
                              ['Sucursal', v.sucursal],
                              ['Cajero', v.cajeroNombre],
                              ...(v.venta_pagos ?? []).map(p => [etiquetaMetodo(p.metodo), pesos(p.monto_centavos)]),
                            ].map(([k, valor], i) => (
                              <div key={`${k}-${i}`} className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold" style={{ color: '#627080' }}>{k}</span>
                                <span className="text-xs font-semibold" style={{ color: '#263442' }}>{valor}</span>
                              </div>
                            ))}
                            <button
                              className="ml-auto text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                              style={{ color: '#C2410C', background: 'rgba(249,115,22,.1)' }}
                              onClick={() => { setTicket(v); setExpandedId(null) }}
                            >
                              Ver ticket completo →
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (sinDatos
          ? <EmptyState icon={Search} title="No se pudieron cargar las ventas" subtitle="Revisa el aviso de arriba y vuelve a intentar." />
          : <EmptyState
              icon={Search}
              title={ventas.length === 0 ? 'Sin ventas en este periodo' : 'Sin resultados'}
              subtitle={ventas.length === 0
                ? 'Las cajas suben sus ventas cada 10 segundos cuando tienen internet.'
                : 'Intenta con otro término de búsqueda o limpia los filtros.'}
            />
        )}

        <Pagination total={sorted.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </div>}

      {ticket && <Ticket key={ticket.id} venta={ticket} onClose={() => setTicket(null)} />}
    </div>
  )
}
