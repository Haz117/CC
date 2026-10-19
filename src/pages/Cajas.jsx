import { useState, useEffect, useMemo } from 'react'
import { Monitor, DollarSign, ArrowUpCircle, ArrowDownCircle, Eye, Scissors, TrendingUp, User, Clock, Search, Info, StickyNote, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { SkeletonCardGrid, SkeletonTableRows } from '../components/Skeleton'
import Badge from '../components/Badge'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import FilaDesglose from '../components/FilaDesglose'
import TituloTarjeta from '../components/TituloTarjeta'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import InfoCell from '../components/InfoCell'
import ChartTooltip from '../components/ChartTooltip'
import AvisoError from '../components/AvisoError'
import EnVivo from '../components/EnVivo'
import SelectorSucursal from '../components/SelectorSucursal'
import FiltroPeriodo from '../components/FiltroPeriodo'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import { useConsulta } from '../hooks/useConsulta'
import { usePeriodo } from '../hooks/usePeriodo'
import { useSucursales } from '../hooks/useSucursales'
import { listarTurnosAbiertos, listarCortes } from '../api/cajas'
import { movimientosDeTurno, signoMovimiento } from '../lib/calculos'
import { pesos, fecha, hora, fechaHora, diaCorto, fmtDec, rangoCorto } from '../utils/fmt'
import Grafica from '../components/Grafica'

const PER_PAGE = 8
const MAX_CORTES = 200

// Diferencia del corte = contado − esperado: negativa es faltante, positiva es sobrante.
function diferenciaDe(centavos) {
  if (centavos == null) return { label: 'Sin corte', color: 'gray', tono: '#627080' }
  if (centavos === 0)   return { label: 'Sin diferencia', color: 'green', tono: '#047857' }
  return centavos < 0
    ? { label: `Faltante ${pesos(-centavos)}`, color: 'red',   tono: '#8A4A42' }
    : { label: `Sobrante ${pesos(centavos)}`,  color: 'amber', tono: '#92400E' }
}

function tiempoAbierta(desde) {
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(desde).getTime()) / 60000))
  const h = Math.floor(minutos / 60)
  return h ? `${h} h ${minutos % 60} min` : `${minutos} min`
}

/* ── Detalle de un turno: corte y movimientos de efectivo ──── */
function DetalleTurno({ turno, onClose }) {
  const abierto = turno.estado === 'ABIERTO'
  const dif = diferenciaDe(turno.diferencia_centavos)
  const movimientos = [...(turno.movimientos_caja ?? [])].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))

  return (
    <Modal
      onClose={onClose}
      header={
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold" style={{ color: '#263442' }}>{turno.cajaNombre}</h3>
            <Badge label={abierto ? 'Abierta' : 'Cerrada'} color={abierto ? 'green' : 'gray'} />
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#627080' }}>{turno.sucursalNombre}</p>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <InfoCell label="Cajero" value={turno.cajeroNombre} center />
          <InfoCell label="Apertura" value={`${diaCorto(turno.abierto_en)} ${hora(turno.abierto_en)}`} center />
          <InfoCell label="Cierre" value={abierto ? '—' : `${diaCorto(turno.cerrado_en)} ${hora(turno.cerrado_en)}`} center />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #FDE8D0' }}>
          <div className="px-4 py-2.5" style={{ background: '#F2F3F5', borderBottom: '1px solid #FDE8D0' }}>
            <p className="text-[13px] font-semibold" style={{ color: '#627080' }}>{abierto ? 'Efectivo del turno' : 'Corte de caja'}</p>
          </div>
          <div>
            {[
              { label: 'Fondo inicial',     value: pesos(turno.fondo_inicial_centavos), color: '#627080', icon: DollarSign },
              { label: 'Entradas (+)',      value: `+${pesos(turno.entradas)}`,         color: '#C2410C', icon: ArrowUpCircle },
              { label: 'Retiros (−)',       value: `-${pesos(turno.retiros)}`,          color: '#8A4A42', icon: ArrowDownCircle },
              !abierto && { label: 'Efectivo esperado', value: pesos(turno.efectivo_esperado_centavos), color: '#263442', icon: TrendingUp },
              !abierto && { label: 'Efectivo contado',  value: pesos(turno.efectivo_contado_centavos),  color: '#263442', icon: Scissors },
            ].filter(Boolean).map(item => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #FDE8D0' }}>
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: item.color }} />
                  <span className="text-sm" style={{ color: '#627080' }}>{item.label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
            {!abierto && (
              <div className="flex items-center justify-between px-4 py-3.5" style={{ background: turno.diferencia_centavos ? `${dif.tono}14` : 'rgba(5,150,105,.08)' }}>
                <span className="text-sm font-bold" style={{ color: '#263442' }}>Diferencia</span>
                <span className="text-base font-bold" style={{ color: dif.tono }}>{dif.label}</span>
              </div>
            )}
          </div>
        </div>

        {abierto && (
          <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: '#FFF7ED', border: '1px solid #FDBA74' }}>
            <Info className="w-4 h-4 flex-shrink-0" style={{ color: '#C2410C' }} />
            <p className="text-xs font-semibold" style={{ color: '#C2410C' }}>El corte se registra en la caja al cerrar el turno; aquí aparece en cuanto se sincroniza.</p>
          </div>
        )}

        {movimientos.length > 0 && (
          <div>
            <p className="text-[13px] font-semibold mb-2" style={{ color: '#627080' }}>Movimientos de efectivo</p>
            <div className="space-y-1.5">
              {movimientos.map((m, i) => {
                const retiro = signoMovimiento(m) < 0
                return (
                  <div key={`${m.fecha}-${i}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2" style={{ background: '#F2F3F5' }}>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: '#263442' }}>{m.concepto || (retiro ? 'Retiro' : 'Entrada')}</p>
                      <p className="text-[10px]" style={{ color: '#627080' }}>{hora(m.fecha)}</p>
                    </div>
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: retiro ? '#8A4A42' : '#C2410C' }}>
                      {retiro ? '-' : '+'}{pesos(m.monto_centavos)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {turno.notas_cierre && (
          <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: '#F2F3F5' }}>
            <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#627080' }} />
            <p className="text-xs" style={{ color: '#627080' }}><strong>Notas del cierre:</strong> {turno.notas_cierre}</p>
          </div>
        )}

        {!abierto && turno.cerro?.nombre_completo && (
          <p className="text-xs" style={{ color: '#627080' }}>Cerró el turno: <strong style={{ color: '#627080' }}>{turno.cerro.nombre_completo}</strong></p>
        )}
      </div>
      <div className="px-6 py-4 flex justify-end" style={{ borderTop: '1px solid #FDE8D0' }}>
        <button onClick={onClose} className="btn-primary">Cerrar</button>
      </div>
    </Modal>
  )
}

export default function Cajas() {
  const { sucursales, nombreCorto, nombreSucursal } = useSucursales()

  const [search, setSearch] = usePersistedState('cajas-search', '')
  const debouncedSearch = useDebounce(search)
  const periodo = usePeriodo('semana')
  const { dateFrom, dateTo, desde, hasta } = periodo
  const [sucursalId, setSucursalId] = useState('')
  const [page, setPage] = useState(1)
  const [detalle, setDetalle] = useState(null)

  const filtroSucursal = sucursalId || undefined

  const abiertas = useConsulta(
    () => listarTurnosAbiertos({ sucursalId: filtroSucursal }),
    [sucursalId],
    { enVivo: ['turnos_caja'] },
  )
  const cortes = useConsulta(
    () => listarCortes({ sucursalId: filtroSucursal, desde, hasta, porPagina: MAX_CORTES }),
    [sucursalId, desde, hasta],
    { enVivo: ['turnos_caja'] },
  )

  const modelo = useMemo(() => {
    const armar = (t) => ({
      ...t,
      ...movimientosDeTurno(t),
      cajaNombre: t.caja?.nombre ?? 'Caja',
      cajeroNombre: t.cajero?.nombre_completo ?? '—',
      sucursal: nombreCorto(t.sucursal_id),
      sucursalNombre: nombreSucursal(t.sucursal_id),
    })
    const q = debouncedSearch.trim().toLowerCase()
    const coincide = (t) => !q || [t.cajaNombre, t.cajeroNombre, t.sucursal].some(x => x.toLowerCase().includes(q))
    return {
      abiertas: (abiertas.datos ?? []).map(armar).filter(coincide),
      cortes:   (cortes.datos?.filas ?? []).map(armar).filter(coincide),
    }
  }, [abiertas.datos, cortes.datos, debouncedSearch, nombreCorto, nombreSucursal])

  const stats = useMemo(() => {
    let faltantes = 0, sobrantes = 0, neta = 0
    for (const c of modelo.cortes) {
      const d = c.diferencia_centavos ?? 0
      neta += d
      if (d < 0) faltantes++
      else if (d > 0) sobrantes++
    }
    return { faltantes, sobrantes, neta, cuadrados: modelo.cortes.length - faltantes - sobrantes }
  }, [modelo.cortes])

  // Últimos cortes, del más antiguo al más reciente, para la gráfica
  const grafica = useMemo(() => modelo.cortes.slice(0, 14).reverse().map(c => ({
    id: c.id,
    etiqueta: `${diaCorto(c.cerrado_en)} · ${c.cajaNombre}`,
    diferencia: (c.diferencia_centavos ?? 0) / 100,
  })), [modelo.cortes])

  const paginados = useMemo(() => modelo.cortes.slice((page - 1) * PER_PAGE, page * PER_PAGE), [modelo.cortes, page])

  useEffect(() => { setPage(1) }, [debouncedSearch, sucursalId, desde, hasta])
  useEscapeKey(() => setDetalle(null))

  const totalCortes = cortes.datos?.total ?? 0
  const conDiferencia = stats.faltantes + stats.sobrantes

  // Mientras llega la primera respuesta, o si falló, no hay cifras que mostrar: un cero se leería como dato real.
  const sinDatos = abiertas.datos === undefined || cortes.datos === undefined
  const estadoKpi = abiertas.cargando || cortes.cargando ? 'cargando' : sinDatos ? 'error' : null

  return (
    <div className="space-y-6">

      <PageHeader breadcrumb="Cajas" title="Control de Cajas">
        <EnVivo actualizando={abiertas.actualizando || cortes.actualizando} />
      </PageHeader>

      {/* ══ Filtros: arriba de todo lo que cambian ════════════════ */}
      <div className="barra-filtros">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar caja, cajero o sucursal…" resultCount={modelo.cortes.length + modelo.abiertas.length} className="barra-filtros-busqueda" />
        <FiltroPeriodo periodo={periodo} />
        <SelectorSucursal value={sucursalId} onChange={setSucursalId} sucursales={sucursales} soloTiendas />
      </div>

      <KpiBar estado={estadoKpi} items={[
        { icon: Monitor, label: 'Abiertas ahora', value: modelo.abiertas.length, good: modelo.abiertas.length > 0, sub: 'turnos en operación' },
        { icon: Scissors, label: 'Cortes', value: modelo.cortes.length,                                     sub: 'turnos cerrados' },
        { icon: AlertTriangle, label: 'Con diferencia', value: conDiferencia, alert: conDiferencia > 0,                  sub: `${stats.faltantes} faltante${stats.faltantes !== 1 ? 's' : ''} · ${stats.sobrantes} sobrante${stats.sobrantes !== 1 ? 's' : ''}` },
        { icon: TrendingUp, label: 'Diferencia neta', value: `${stats.neta < 0 ? '-' : ''}${pesos(Math.abs(stats.neta))}`, alert: stats.neta < 0, good: stats.neta === 0 && modelo.cortes.length > 0, sub: 'contado − esperado' },
      ]} />

      <AvisoError error={abiertas.error || cortes.error} onReintentar={() => { abiertas.recargar(); cortes.recargar() }} />

      {/* ══ Cajas abiertas: son de este momento, el periodo no las cambia ══ */}
      <div className="titulo-seccion">
        <h2>Abiertas ahora</h2>
        {abiertas.datos !== undefined && <p>{modelo.abiertas.length} en operación · no dependen del periodo</p>}
      </div>

      {/* ══ Cajas abiertas ════════════════════════════════════════ */}
      {abiertas.cargando ? <SkeletonCardGrid count={3} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {modelo.abiertas.map((c, i) => (
            <div key={c.id} className="card p-5 flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 60, 200)}ms` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="font-bold leading-tight truncate" style={{ color: '#263442' }}>{c.cajaNombre}</p>
                    <p className="text-xs truncate" style={{ color: '#627080' }}>{c.sucursalNombre}</p>
                  </div>
                </div>
                <Badge label="Abierta" color="green" />
              </div>

              <div>
                <p style={{ fontSize: '.8125rem', fontWeight: 500, color: '#627080', marginBottom: '2px' }}>Fondo inicial</p>
                <p className="font-bold leading-none" style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.55rem)', color: '#C2410C', letterSpacing: '-.02em' }}>
                  {pesos(c.fondo_inicial_centavos)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Entradas', value: `+${pesos(c.entradas)}`, color: '#C2410C', bg: '#FFF7ED' },
                  { label: 'Retiros',  value: `-${pesos(c.retiros)}`,  color: '#8A4A42', bg: 'rgba(201,122,109,.08)' },
                ].map(item => (
                  <div key={item.label} className="rounded-lg px-2 py-1.5" style={{ background: item.bg }}>
                    <p style={{ fontSize: '.75rem', fontWeight: 500, color: '#627080' }}>{item.label}</p>
                    <p className="font-bold truncate" style={{ fontSize: '.75rem', color: item.color, marginTop: '1px' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs" style={{ borderTop: '1px solid #FFF8F0', paddingTop: '10px' }}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <User className="w-3 h-3 flex-shrink-0" style={{ color: '#627080' }} aria-hidden="true" />
                  <span className="truncate" style={{ color: '#627080' }}>{c.cajeroNombre}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0" title={`Abierta desde ${fechaHora(c.abierto_en)}`}>
                  <Clock className="w-3 h-3" style={{ color: '#627080' }} aria-hidden="true" />
                  <span style={{ color: '#627080' }}>{hora(c.abierto_en)} · {tiempoAbierta(c.abierto_en)}</span>
                </div>
              </div>

              <button onClick={() => setDetalle(c)} className="btn-soft-blue py-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1 mt-auto">
                <Eye className="w-3.5 h-3.5" /> Ver detalle
              </button>
            </div>
          ))}

          {modelo.abiertas.length === 0 && abiertas.datos !== undefined && (
            <EmptyState icon={Monitor} title="Ninguna caja abierta" subtitle="Cuando una caja abra turno aparecerá aquí al momento." className="col-span-full" />
          )}
        </div>
      )}

      {/* ══ Resumen de cortes ═════════════════════════════════════ */}
      {modelo.cortes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="card p-5 lg:col-span-3">
            <TituloTarjeta icon={TrendingUp} titulo="Diferencia por corte">últimos {grafica.length}</TituloTarjeta>
            <Grafica titulo="Diferencia por corte" datos={grafica} etiqueta="etiqueta" valor="diferencia">
            <ResponsiveContainer width="100%" height={148}>
              <BarChart data={grafica} maxBarSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#FDE8D0" />
                <XAxis dataKey="etiqueta" tick={false} axisLine={false} tickLine={false} height={4} />
                <ReferenceLine y={0} stroke="#D4DDE6" />
                <Tooltip cursor={{ fill: '#FFF7ED' }} content={props => <ChartTooltip {...props} format={fmtDec} />} />
                <Bar dataKey="diferencia" radius={[4, 4, 4, 4]} minPointSize={3}>
                  {grafica.map(g => <Cell key={g.id} fill={g.diferencia < 0 ? '#8A4A42' : g.diferencia > 0 ? '#92400E' : '#047857'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </Grafica>
          </div>

          <div className="card p-5 flex flex-col lg:col-span-2">
            <TituloTarjeta icon={Scissors} titulo="Resultado de los cortes" />
            <div className="flex flex-col gap-3 flex-1 justify-center">
              {[
                { label: 'Sin diferencia', count: stats.cuadrados, color: '#047857' },
                { label: 'Con faltante',   count: stats.faltantes, color: '#8A4A42' },
                { label: 'Con sobrante',   count: stats.sobrantes, color: '#92400E' },
              ].map(s => {
                const pct = Math.round(s.count / modelo.cortes.length * 100)
                return <FilaDesglose key={s.label} cuenta={s.count} etiqueta={s.label} derecha={`${pct}%`} pct={pct} color={s.color} />
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ Cortes de caja ════════════════════════════════════════ */}
      {cortes.cargando ? <SkeletonTableRows /> : (
        <div className="card overflow-hidden">
          <div className="section-head">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="section-head-text"><strong>Cortes de caja</strong></span>
              <span style={{ fontSize: '.75rem', color: '#627080' }}>{rangoCorto(dateFrom, dateTo)}</span>
              {conDiferencia > 0 && <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#8A4A42' }}>{conDiferencia} con diferencia</span>}
            </div>
          </div>
          {totalCortes > MAX_CORTES && (
            <p className="px-5 py-2 text-xs font-semibold" style={{ color: '#C2410C', background: '#FFF7ED', borderBottom: '1px solid #FDE8D0' }}>
              El periodo tiene {totalCortes} cortes; se muestran los {MAX_CORTES} más recientes. Acorta el rango para verlos todos.
            </p>
          )}
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla de cortes de caja">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Caja</th>
                  <th className="hidden lg:table-cell">Cajero</th>
                  <th className="hidden md:table-cell">Apertura</th>
                  <th>Cierre</th>
                  <th className="hidden md:table-cell">Esperado</th>
                  <th className="hidden md:table-cell">Contado</th>
                  <th>Diferencia</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {paginados.map(c => {
                  const dif = diferenciaDe(c.diferencia_centavos)
                  return (
                    <tr key={c.id} style={c.diferencia_centavos < 0 ? { background: 'rgba(201,122,109,.04)', borderLeft: '3px solid rgba(201,122,109,.4)' } : {}}>
                      <td>
                        <p className="text-sm font-semibold" style={{ color: '#263442' }}>{c.cajaNombre}</p>
                        <p className="text-xs" style={{ color: '#627080' }}>{c.sucursal}</p>
                      </td>
                      <td className="hidden lg:table-cell"><span className="text-sm" style={{ color: '#627080' }}>{c.cajeroNombre}</span></td>
                      <td className="hidden md:table-cell"><span className="text-xs" style={{ color: '#627080' }}>{diaCorto(c.abierto_en)} {hora(c.abierto_en)}</span></td>
                      <td className="whitespace-nowrap">
                        <p className="text-xs font-medium" style={{ color: '#263442' }}>{hora(c.cerrado_en)}</p>
                        <p className="text-xs" style={{ color: '#627080' }}>{fecha(c.cerrado_en)}</p>
                      </td>
                      <td className="hidden md:table-cell"><span className="text-sm" style={{ color: '#627080' }}>{pesos(c.efectivo_esperado_centavos)}</span></td>
                      <td className="hidden md:table-cell"><span className="text-sm font-semibold" style={{ color: '#263442' }}>{pesos(c.efectivo_contado_centavos)}</span></td>
                      <td><Badge label={dif.label} color={dif.color} /></td>
                      <td>
                        <button onClick={() => setDetalle(c)} className="action-btn" title="Ver corte" aria-label={`Ver corte de ${c.cajaNombre}`}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {modelo.cortes.length === 0 && cortes.datos !== undefined && (
            <EmptyState icon={Search} title="Sin cortes en este periodo" subtitle="Prueba con un rango de fechas más amplio." />
          )}
          <Pagination total={modelo.cortes.length} page={page} perPage={PER_PAGE} onChange={setPage} />
        </div>
      )}

      {detalle && <DetalleTurno turno={detalle} onClose={() => setDetalle(null)} />}
    </div>
  )
}
