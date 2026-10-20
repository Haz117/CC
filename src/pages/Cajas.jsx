import { useState, useEffect, useMemo } from 'react'
import { Monitor, DollarSign, ArrowUpCircle, ArrowDownCircle, Eye, Scissors, TrendingUp, Scale, Users, ChevronRight, Info, StickyNote, AlertTriangle } from 'lucide-react'
import { SkeletonTableRows } from '../components/Skeleton'
import Badge from '../components/Badge'
import Estado from '../components/Estado'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import FilaDesglose from '../components/FilaDesglose'
import TituloTarjeta from '../components/TituloTarjeta'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import InfoCell from '../components/InfoCell'
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
import { movimientosDeTurno, signoMovimiento, diferenciasPorCajero } from '../lib/calculos'
import { pesos, fecha, hora, fechaHora, diaCorto, rangoCorto, horario, plural } from '../utils/fmt'
import { useEstadoSesion } from '../hooks/useEstadoSesion'

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

// "+$150.00", "−$2,000.00" o "$0.00": el signo solo cuando hubo movimiento.
const conSigno = (centavos, signo) => `${centavos ? signo : ''}${pesos(centavos)}`

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

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8EBEF' }}>
          <div className="px-4 py-2.5" style={{ background: '#F2F3F5', borderBottom: '1px solid #E8EBEF' }}>
            <p className="text-[0.8125rem] font-semibold" style={{ color: '#627080' }}>{abierto ? 'Efectivo del turno' : 'Corte de caja'}</p>
          </div>
          <div>
            {[
              { label: 'Fondo inicial',     value: pesos(turno.fondo_inicial_centavos), color: '#627080', icon: DollarSign },
              { label: 'Entradas (+)',      value: conSigno(turno.entradas, '+'),       color: turno.entradas ? '#C2410C' : '#627080', icon: ArrowUpCircle },
              { label: 'Retiros (−)',       value: conSigno(turno.retiros, '−'),        color: turno.retiros ? '#8A4A42' : '#627080', icon: ArrowDownCircle },
              !abierto && { label: 'Efectivo esperado', value: pesos(turno.efectivo_esperado_centavos), color: '#263442', icon: TrendingUp },
              !abierto && { label: 'Efectivo contado',  value: pesos(turno.efectivo_contado_centavos),  color: '#263442', icon: Scissors },
            ].filter(Boolean).map(item => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #E8EBEF' }}>
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
            <p className="text-[0.8125rem] font-semibold mb-2" style={{ color: '#627080' }}>Movimientos de efectivo</p>
            <div className="space-y-1.5">
              {movimientos.map((m, i) => {
                const retiro = signoMovimiento(m) < 0
                return (
                  <div key={`${m.fecha}-${i}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2" style={{ background: '#F2F3F5' }}>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: '#263442' }}>{m.concepto || (retiro ? 'Retiro' : 'Entrada')}</p>
                      <p className="text-xs" style={{ color: '#627080' }}>{hora(m.fecha)}</p>
                    </div>
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: retiro ? '#8A4A42' : '#C2410C' }}>
                      {retiro ? '−' : '+'}{pesos(m.monto_centavos)}
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
      <div className="px-6 py-4 flex justify-end" style={{ borderTop: '1px solid #E8EBEF' }}>
        <button onClick={onClose} className="btn-primary">Cerrar</button>
      </div>
    </Modal>
  )
}

export default function Cajas() {
  const { sucursales, nombreCorto, nombreSucursal } = useSucursales()

  const [search, setSearch] = usePersistedState('cajas-search', '')
  const debouncedSearch = useDebounce(search)
  const periodo = usePeriodo('semana', 'cajas')
  const { dateFrom, dateTo, desde, hasta } = periodo
  const [sucursalId, setSucursalId] = useEstadoSesion('cajas:sucursal', '')
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
    let faltantes = 0, sobrantes = 0, neta = 0, contado = 0
    for (const c of modelo.cortes) {
      const d = c.diferencia_centavos ?? 0
      neta += d
      contado += c.efectivo_contado_centavos ?? 0
      if (d < 0) faltantes++
      else if (d > 0) sobrantes++
    }
    // La caja que lleva más tiempo abierta
    const primeraAbierta = modelo.abiertas.reduce((min, t) => (!min || t.abierto_en < min ? t.abierto_en : min), null)
    return { faltantes, sobrantes, neta, contado, primeraAbierta, cuadrados: modelo.cortes.length - faltantes - sobrantes }
  }, [modelo.cortes, modelo.abiertas])

  // Quién cuadra y quién no: los cortes del periodo por cajero, primero quien más faltante acumula
  const porCajero = useMemo(() => diferenciasPorCajero(modelo.cortes, c => c.cajeroNombre), [modelo.cortes])

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

      <PageHeader breadcrumb="Cajas" title="Cajas">
        <EnVivo actualizando={abiertas.actualizando || cortes.actualizando} error={abiertas.error || cortes.error} />
      </PageHeader>

      {/* ══ Filtros: arriba de todo lo que cambian ════════════════ */}
      <div className="barra-filtros">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar caja, cajero o sucursal…" resultCount={modelo.cortes.length + modelo.abiertas.length} className="barra-filtros-busqueda" />
        <FiltroPeriodo periodo={periodo} />
        <SelectorSucursal value={sucursalId} onChange={setSucursalId} sucursales={sucursales} soloTiendas />
      </div>

      <KpiBar estado={estadoKpi} items={[
        { icon: Monitor, label: 'Abiertas ahora', value: modelo.abiertas.length, good: modelo.abiertas.length > 0, sub: stats.primeraAbierta ? `la primera desde las ${hora(stats.primeraAbierta)}` : 'ninguna en este momento' },
        { icon: Scissors, label: 'Cortes', value: modelo.cortes.length,                                     sub: modelo.cortes.length ? `${pesos(stats.contado)} contados` : 'ninguno en el periodo' },
        { icon: AlertTriangle, label: 'Con diferencia', value: conDiferencia, alert: conDiferencia > 0,                  sub: `${plural(stats.faltantes, 'faltante')} · ${plural(stats.sobrantes, 'sobrante')}` },
        { icon: Scale, label: 'Diferencia neta', value: `${stats.neta < 0 ? '−' : ''}${pesos(Math.abs(stats.neta))}`, alert: stats.neta < 0, good: stats.neta === 0 && modelo.cortes.length > 0, sub: 'contado − esperado' },
      ]} />

      <AvisoError error={abiertas.error || cortes.error} onReintentar={() => { abiertas.recargar(); cortes.recargar() }} />

      {/* ══ Cajas abiertas: son de este momento, el periodo no las cambia.
           Tabla compacta como la de cortes; antes era una tarjeta grande por caja que repetía el mismo fondo ══ */}
      {abiertas.cargando ? <SkeletonTableRows rows={3} /> : (
        <div className="card overflow-hidden">
          <div className="section-head">
            <div className="flex items-center gap-2 flex-wrap">
              <Monitor className="w-4 h-4 flex-shrink-0" style={{ color: '#627080' }} aria-hidden="true" />
              <span className="section-head-text"><strong>Abiertas ahora</strong></span>
              {abiertas.datos !== undefined && <span style={{ fontSize: '.75rem', color: '#627080' }}>{plural(modelo.abiertas.length, 'caja')} · no dependen del periodo</span>}
            </div>
          </div>

          {/* Móvil: un renglón por caja; al tocarlo se abre su turno */}
          <ul className="sm:hidden lista-movil">
            {modelo.abiertas.map(c => (
              <li key={c.id}>
                <button type="button" onClick={() => setDetalle(c)} className="lista-movil-fila" aria-label={`Ver turno de ${c.cajaNombre}, ${c.sucursal}`}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold truncate" style={{ color: '#263442' }}>{c.cajaNombre} · {c.sucursal}</span>
                    <span className="text-sm font-semibold flex-shrink-0" style={{ color: '#263442', fontVariantNumeric: 'tabular-nums' }}>{pesos(c.fondo_inicial_centavos)}</span>
                  </span>
                  <span className="flex items-center justify-between gap-3 mt-1">
                    <span className="text-xs truncate" style={{ color: '#627080' }}>{c.cajeroNombre} · desde {hora(c.abierto_en)}, {tiempoAbierta(c.abierto_en)}</span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#D4DDE6' }} aria-hidden="true" />
                  </span>
                  {(c.entradas > 0 || c.retiros > 0) && (
                    <span className="block text-xs mt-1" style={{ color: '#627080' }}>
                      {[c.entradas > 0 && `entradas ${conSigno(c.entradas, '+')}`, c.retiros > 0 && `retiros ${conSigno(c.retiros, '−')}`].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla de cajas abiertas">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Caja</th>
                  <th>Cajero</th>
                  <th>Abierta desde</th>
                  <th>Fondo</th>
                  <th className="hidden lg:table-cell">Entradas</th>
                  <th className="hidden lg:table-cell">Retiros</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {modelo.abiertas.map(c => (
                  <tr key={c.id}>
                    <td>
                      <p className="text-sm font-semibold" style={{ color: '#263442' }}>{c.cajaNombre}</p>
                      <p className="text-xs" style={{ color: '#627080' }}>{c.sucursal}</p>
                    </td>
                    <td><span className="text-sm" style={{ color: '#627080' }}>{c.cajeroNombre}</span></td>
                    <td className="whitespace-nowrap" title={`Abierta desde ${fechaHora(c.abierto_en)}`}>
                      <p className="text-xs font-medium" style={{ color: '#263442', fontVariantNumeric: 'tabular-nums' }}>{hora(c.abierto_en)}</p>
                      <p className="text-xs" style={{ color: '#627080' }}>{tiempoAbierta(c.abierto_en)}</p>
                    </td>
                    <td><span className="text-sm font-semibold" style={{ color: '#263442', fontVariantNumeric: 'tabular-nums' }}>{pesos(c.fondo_inicial_centavos)}</span></td>
                    <td className="hidden lg:table-cell"><span className="text-sm" style={{ color: c.entradas ? '#C2410C' : '#627080', fontVariantNumeric: 'tabular-nums' }}>{conSigno(c.entradas, '+')}</span></td>
                    <td className="hidden lg:table-cell"><span className="text-sm" style={{ color: c.retiros ? '#8A4A42' : '#627080', fontVariantNumeric: 'tabular-nums' }}>{conSigno(c.retiros, '−')}</span></td>
                    <td>
                      <button onClick={() => setDetalle(c)} className="action-btn" title="Ver turno" aria-label={`Ver turno de ${c.cajaNombre}, ${c.sucursal}`}>
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {modelo.abiertas.length === 0 && abiertas.datos !== undefined && (
            <EmptyState icon={Monitor} title="Ninguna caja abierta" subtitle="Cuando una caja abra turno aparecerá aquí al momento." />
          )}
        </div>
      )}

      {/* ══ Resumen de cortes ═════════════════════════════════════ */}
      {modelo.cortes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="card p-5 lg:col-span-3">
            <TituloTarjeta icon={Users} titulo="Diferencia por cajero">{plural(modelo.cortes.length, 'corte')} del periodo</TituloTarjeta>
            <ul className="lista-cajeros">
              {porCajero.slice(0, 6).map(x => {
                const detalle = [
                  plural(x.cortes, 'corte'),
                  x.faltantes > 0 && `${x.faltantes} con faltante`,
                  x.sobrantes > 0 && `${x.sobrantes} con sobrante`,
                ].filter(Boolean).join(' · ')
                return (
                  <li key={x.nombre}>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold truncate" style={{ color: '#263442' }}>{x.nombre}</span>
                      <span className="block text-xs" style={{ color: '#627080' }}>{detalle}</span>
                    </span>
                    <span className="text-sm font-semibold flex-shrink-0" style={{ color: diferenciaDe(x.neta).tono, fontVariantNumeric: 'tabular-nums' }}>
                      {x.neta === 0 ? 'Cuadra' : `${x.neta < 0 ? '−' : '+'}${pesos(Math.abs(x.neta))}`}
                    </span>
                  </li>
                )
              })}
            </ul>
            {porCajero.length > 6 && (
              <p className="text-xs mt-2" style={{ color: '#627080' }}>Y {plural(porCajero.length - 6, 'cajero')} más; búscalos en la tabla de cortes.</p>
            )}
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
                return <FilaDesglose key={s.label} etiqueta={s.label} cuenta={plural(s.count, 'corte')} derecha={`${pct}%`} pct={pct} color={s.color} />
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
              <Scissors className="w-4 h-4 flex-shrink-0" style={{ color: '#627080' }} aria-hidden="true" />
              <span className="section-head-text"><strong>Cortes de caja</strong></span>
              <span style={{ fontSize: '.75rem', color: '#627080' }}>{rangoCorto(dateFrom, dateTo)}</span>
              {conDiferencia > 0 && <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#8A4A42' }}>{conDiferencia} con diferencia</span>}
            </div>
          </div>
          {totalCortes > MAX_CORTES && (
            <p className="px-5 py-2 text-xs font-semibold" style={{ color: '#C2410C', background: '#FFF7ED', borderBottom: '1px solid #E8EBEF' }}>
              El periodo tiene {totalCortes} cortes; se muestran los {MAX_CORTES} más recientes. Acorta el rango para verlos todos.
            </p>
          )}
          {/* Móvil: un renglón por corte, igual que las cajas abiertas */}
          <ul className="sm:hidden lista-movil">
            {paginados.map(c => {
              const dif = diferenciaDe(c.diferencia_centavos)
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setDetalle(c)} className="lista-movil-fila" aria-label={`Ver corte de ${c.cajaNombre}, ${c.sucursal}`}
                    style={c.diferencia_centavos < 0 ? { background: 'rgba(201,122,109,.04)' } : undefined}>
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold truncate" style={{ color: '#263442' }}>{c.cajaNombre} · {c.sucursal}</span>
                      <Estado label={dif.label} color={dif.color} normal={c.diferencia_centavos === 0} />
                    </span>
                    <span className="flex items-center justify-between gap-3 mt-1">
                      <span className="text-xs truncate" style={{ color: '#627080' }}>{c.cajeroNombre} · {horario(c.abierto_en, c.cerrado_en)}, {diaCorto(c.cerrado_en)}</span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#D4DDE6' }} aria-hidden="true" />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="hidden sm:block overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla de cortes de caja">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Caja</th>
                  <th className="hidden lg:table-cell">Cajero</th>
                  <th>Turno</th>
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
                      <td className="whitespace-nowrap">
                        <p className="text-xs font-medium" style={{ color: '#263442', fontVariantNumeric: 'tabular-nums' }}>{horario(c.abierto_en, c.cerrado_en)}</p>
                        <p className="text-xs" style={{ color: '#627080' }}>{fecha(c.cerrado_en)}</p>
                      </td>
                      <td className="hidden md:table-cell"><span className="text-sm" style={{ color: '#627080' }}>{pesos(c.efectivo_esperado_centavos)}</span></td>
                      <td className="hidden md:table-cell"><span className="text-sm font-semibold" style={{ color: '#263442' }}>{pesos(c.efectivo_contado_centavos)}</span></td>
                      <td><Estado label={dif.label} color={dif.color} normal={c.diferencia_centavos === 0} /></td>
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
            <EmptyState icon={Scissors} title="Sin cortes en este periodo" subtitle="Prueba con un rango de fechas más amplio." />
          )}
          <Pagination total={modelo.cortes.length} page={page} perPage={PER_PAGE} onChange={setPage} />
        </div>
      )}

      {detalle && <DetalleTurno turno={detalle} onClose={() => setDetalle(null)} />}
    </div>
  )
}
