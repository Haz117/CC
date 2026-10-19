import { useState, useEffect, useMemo } from 'react'
import { Building2, MapPin, Monitor, TrendingUp, LayoutGrid, LayoutList, Search, Target, Warehouse, HandCoins } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SkeletonCardGrid } from '../components/Skeleton'
import Badge from '../components/Badge'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import Segmentado from '../components/Segmentado'
import TituloTarjeta from '../components/TituloTarjeta'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import AvisoError from '../components/AvisoError'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import { useConsulta } from '../hooks/useConsulta'
import { useSucursales } from '../hooks/useSucursales'
import { listarVentasResumen } from '../api/ventas'
import { listarTurnosAbiertos } from '../api/cajas'
import { listarMetas, listarSaldosCredito, listarUsuarios } from '../api/organizacion'
import { ventasPorSucursal } from '../lib/calculos'
import { pesos, pesosCorto, inicioDelMes, mesLargo } from '../utils/fmt'
import Grafica from '../components/Grafica'

const PER_PAGE = 8

// Avance de la meta contra lo que ya debería llevar el mes a la fecha.
function ritmoDe(avance) {
  if (avance == null) return { color: '#627080', clase: 'progress-fill-orange' }
  const hoy = new Date()
  const esperado = hoy.getDate() / new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate() * 100
  if (avance >= esperado)       return { color: '#047857', clase: 'progress-fill-green' }
  if (avance >= esperado * 0.8) return { color: '#92400E', clase: 'progress-fill-amber' }
  return { color: '#8A4A42', clase: 'progress-fill-red' }
}

function ViewToggle({ viewMode, setViewMode }) {
  return (
    <Segmentado
      opciones={[{ valor: 'table', texto: 'Tabla', icono: LayoutList }, { valor: 'cards', texto: 'Tarjetas', icono: LayoutGrid }]}
      value={viewMode}
      onChange={setViewMode}
      etiqueta="Vista"
    />
  )
}

export default function Sucursales() {
  const { sucursales, nombreCorto, cargando: cargandoSucursales, error: errorSucursales } = useSucursales()

  const [search, setSearch]             = usePersistedState('sucursales-search', '')
  const debouncedSearch = useDebounce(search)
  const [page, setPage]                 = useState(1)
  const [viewMode, setViewMode]         = usePersistedState('sucursales-view', 'cards')
  const [filterStatus, setFilterStatus] = usePersistedState('sucursales-status', 'Todas')

  // Lo que llega ya viene limitado por la base: el administrador ve todas las sucursales y el supervisor la suya.
  const desdeMes = inicioDelMes().toISOString()
  const { datos, cargando, error, recargar } = useConsulta(async () => {
    const [ventas, metas, saldos, usuarios, abiertas] = await Promise.all([
      listarVentasResumen({ desde: desdeMes }),
      listarMetas(), listarSaldosCredito(), listarUsuarios(), listarTurnosAbiertos(),
    ])
    return { ventas, metas, saldos, usuarios, abiertas }
  }, [desdeMes])

  const data = useMemo(() => {
    const ventas = ventasPorSucursal(datos?.ventas.filas ?? [])
    const metas  = new Map((datos?.metas ?? []).map(m => [m.sucursal_id, m.meta_centavos]))
    const saldos = new Map((datos?.saldos ?? []).map(s => [s.sucursal_id, s.saldo_centavos]))
    const contar = (lista) => {
      const mapa = new Map()
      for (const x of lista ?? []) mapa.set(x.sucursal_id, (mapa.get(x.sucursal_id) ?? 0) + 1)
      return mapa
    }
    const usuarios = contar(datos?.usuarios?.filter(u => u.activo !== false))
    const cajas    = contar(datos?.abiertas)

    return sucursales.map(s => {
      const vendido = ventas.get(s.id)?.centavos ?? 0
      const meta = metas.get(s.id) ?? null
      return {
        ...s,
        activa: s.activo !== false,
        vendido,
        tickets: ventas.get(s.id)?.tickets ?? 0,
        meta,
        avance: meta ? Math.round(vendido / meta * 100) : null,
        saldo: saldos.get(s.id) ?? null,
        usuarios: usuarios.get(s.id) ?? 0,
        cajas: cajas.get(s.id) ?? 0,
      }
    })
  }, [sucursales, datos])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return data.filter(s =>
      (!q || String(s.nombre ?? '').toLowerCase().includes(q) || String(s.direccion ?? '').toLowerCase().includes(q)) &&
      (filterStatus === 'Todas' || (filterStatus === 'Activas' ? s.activa : !s.activa))
    )
  }, [data, debouncedSearch, filterStatus])

  const stats = useMemo(() => {
    let activas = 0, vendido = 0, meta = 0, saldo = 0, cajas = 0
    for (const s of data) {
      if (s.activa) activas++
      vendido += s.vendido
      meta    += s.meta ?? 0
      saldo   += Math.max(0, s.saldo ?? 0)
      cajas   += s.cajas
    }
    return { activas, inactivas: data.length - activas, vendido, meta, saldo, cajas, avance: meta ? Math.round(vendido / meta * 100) : null }
  }, [data])

  // Solo las tiendas entran al comparativo de ventas (el almacén no vende al público).
  const tiendas = useMemo(
    () => data.filter(s => !s.es_almacen).sort((a, b) => b.vendido - a.vendido),
    [data],
  )
  const rango = (id) => tiendas.findIndex(s => s.id === id) + 1

  useEffect(() => { setPage(1) }, [debouncedSearch, filterStatus])

  const mes = mesLargo()
  const paginadas = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Mientras llega la primera respuesta, o si falló, no hay cifras que mostrar: un cero se leería como dato real.
  const estadoKpi = cargando || cargandoSucursales ? 'cargando' : datos === undefined ? 'error' : null

  const toolbar = (
    <div className="data-toolbar">
      <div className="data-toolbar-row">
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o dirección…" resultCount={filtered.length} />
        </div>
        <div className="flex items-center justify-between gap-2.5">
          <Segmentado
            opciones={['Todas', 'Activas', 'Inactivas'].map(f => ({ valor: f, texto: f }))}
            value={filterStatus}
            onChange={setFilterStatus}
            etiqueta="Estado"
          />
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>
      <div className="data-toolbar-footer">
        <div className="toolbar-summary">
          <span><b>{filtered.length}</b> sucursal{filtered.length !== 1 ? 'es' : ''}</span>
          <span className="sep">·</span>
          <span><b>{stats.activas}</b> activas</span>
        </div>
        <span className="toolbar-summary">Ventas de {mes}: <b>{pesos(stats.vendido)}</b></span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">

      <PageHeader breadcrumb="Sucursales" title="Sucursales" />

      <KpiBar estado={estadoKpi} items={[
        { icon: Building2, label: 'Sucursales', value: data.length,             sub: `${stats.activas} activas` },
        { icon: Monitor, label: 'Cajas abiertas', value: stats.cajas,             good: stats.cajas > 0, sub: 'en este momento' },
        { icon: TrendingUp, label: 'Ventas del mes', value: pesosCorto(stats.vendido), good: true, sub: mes },
        { icon: Target, label: 'Avance de meta', value: stats.avance == null ? '—' : `${stats.avance}%`, sub: stats.meta ? `meta ${pesosCorto(stats.meta)}` : 'sin meta este mes' },
        { icon: HandCoins, label: 'Crédito almacén', value: pesosCorto(stats.saldo), alert: stats.saldo > 0, sub: 'saldo por pagar' },
      ]} />

      <AvisoError error={error || errorSucursales} onReintentar={recargar} />

      {datos?.ventas.truncado && (
        <p className="text-xs font-semibold rounded-2xl px-4 py-3" style={{ color: '#C2410C', background: '#FFF7ED', border: '1px solid #FDBA74' }}>
          El mes tiene {datos.ventas.total.toLocaleString('es-MX')} ventas y solo se sumaron las más recientes: las ventas del mes son parciales.
        </p>
      )}

      {/* ══ Resumen visual ════════════════════════════════════════ */}
      {tiendas.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="card p-5 lg:col-span-3">
            <TituloTarjeta icon={TrendingUp} titulo="Ventas del mes por sucursal" />
            <Grafica titulo="Ventas del mes por sucursal" datos={tiendas.map(s => ({ n: nombreCorto(s.id), v: s.vendido / 100 }))} etiqueta="n" valor="v">
            <ResponsiveContainer width="100%" height={148}>
              <BarChart data={tiendas.map(s => ({ id: s.id, name: nombreCorto(s.id), ventas: s.vendido / 100, meta: s.meta, avance: s.avance, activa: s.activa }))} maxBarSize={32} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#FDE8D0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#627080' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#FFF7ED' }}
                  content={({ active, payload, label }) => active && payload?.length ? (
                    <div style={{ background: '#fff', border: '1px solid #FDE8D0', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(249,115,22,.12)' }}>
                      <p style={{ fontSize: 10, color: '#627080', fontWeight: 700 }}>{label}</p>
                      <p style={{ fontSize: 13, color: '#C2410C', fontWeight: 800 }}>{pesos(payload[0].value * 100)}</p>
                      {payload[0].payload.meta && <p style={{ fontSize: 11, color: '#627080' }}>Meta: {pesos(payload[0].payload.meta)} · {payload[0].payload.avance}%</p>}
                    </div>
                  ) : null}
                />
                <Bar dataKey="ventas" radius={[5, 5, 0, 0]}>
                  {tiendas.map(s => <Cell key={s.id} fill={!s.activa ? '#FDE8D0' : s.meta ? ritmoDe(s.avance).color : '#C2410C'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </Grafica>
          </div>

          <div className="card p-5 flex flex-col gap-2.5 lg:col-span-2">
            <TituloTarjeta icon={Target} titulo="Avance de la meta mensual" className="mb-1" />
            {tiendas.filter(s => s.meta).map(s => {
              const r = ritmoDe(s.avance)
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold w-16 truncate flex-shrink-0" style={{ color: '#627080' }}>{nombreCorto(s.id)}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: '#FDE8D0' }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, s.avance)}%`, background: r.color }} />
                  </div>
                  <span className="text-[10px] font-bold w-9 text-right flex-shrink-0" style={{ color: r.color }}>{s.avance}%</span>
                </div>
              )
            })}
            {tiendas.every(s => !s.meta) && (
              <p className="text-xs" style={{ color: '#627080' }}>No hay metas capturadas para {mes}.</p>
            )}
            <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #FDE8D0' }}>
              <span className="text-xs" style={{ color: '#627080' }}>Total del mes</span>
              <span className="text-sm font-bold" style={{ color: '#C2410C' }}>{pesos(stats.vendido)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Data section ─────────────────────────────────────── */}
      {cargando || cargandoSucursales ? <SkeletonCardGrid count={5} /> : <>

        {/* ── CARDS VIEW ── */}
        {viewMode === 'cards' && <>
          <div className="card overflow-hidden">{toolbar}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {paginadas.map((s, i) => {
              const r = ritmoDe(s.avance)
              const puesto = rango(s.id)
              return (
                <div key={s.id}
                  className="card card-glow p-5 flex flex-col gap-3.5 animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i * 60, 200)}ms`, borderColor: !s.activa ? 'rgba(201,122,109,.25)' : undefined }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-snug line-clamp-2" style={{ color: '#263442' }}>{s.nombre}</p>
                        {s.direccion && (
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#627080' }} title={s.direccion}>
                            <MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{s.direccion}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <Badge label={s.activa ? 'Activa' : 'Inactiva'} color={s.activa ? 'green' : 'red'} />
                      {!s.es_almacen && puesto > 0 && tiendas.length > 1 && (
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                          style={puesto === 1 ? { background: 'rgba(217,119,6,.12)', color: '#92400E' } : { background: '#F2F3F5', color: '#627080' }}>
                          #{puesto}
                        </div>
                      )}
                    </div>
                  </div>

                  <>
                    <dl className="datos-fila">
                      <div><dt>Cajas abiertas</dt><dd>{s.cajas}</dd></div>
                      <div><dt>Usuarios</dt><dd>{s.usuarios}</dd></div>
                      <div><dt>Ventas del mes</dt><dd>{pesosCorto(s.vendido)}</dd></div>
                    </dl>

                    {s.meta ? (
                      <div>
                        <div className="flex justify-between text-[10px] mb-1.5">
                          <span className="font-medium" style={{ color: '#627080' }}>Meta del mes · {pesosCorto(s.meta)}</span>
                          <span className="font-bold" style={{ color: r.color }}>{s.avance}%</span>
                        </div>
                        <div className="progress-track">
                          <div className={`progress-fill ${r.clase}`} style={{ width: `${Math.min(100, s.avance)}%` }} />
                        </div>
                      </div>
                    ) : !s.es_almacen && (
                      <p className="text-[10px]" style={{ color: '#627080' }}>Sin meta capturada para {mes}.</p>
                    )}

                    {s.es_almacen && (
                      <div className="flex items-center gap-2.5 border-t pt-3 mt-auto" style={{ borderColor: '#FFF8F0' }}>
                        <Warehouse className="w-4 h-4 flex-shrink-0" style={{ color: '#C2410C' }} />
                        <span className="text-xs" style={{ color: '#627080' }}>Almacén central: surte a las sucursales</span>
                      </div>
                    )}

                    {s.saldo != null && (
                      <div className="flex items-center gap-2.5 border-t pt-3 mt-auto" style={{ borderColor: '#FFF8F0' }}>
                        <HandCoins className="w-4 h-4 flex-shrink-0" style={{ color: s.saldo > 0 ? '#92400E' : '#047857' }} />
                        <span className="text-xs" style={{ color: '#627080' }}>
                          {s.saldo > 0
                            ? <>Debe al almacén <strong style={{ color: '#92400E' }}>{pesos(s.saldo)}</strong></>
                            : 'Sin adeudo con el almacén'}
                        </span>
                      </div>
                    )}
                  </>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <EmptyState icon={Search} title="Sin resultados" subtitle="Intenta con otro término o limpia los filtros." className="col-span-full" />
            )}
          </div>
          {filtered.length > PER_PAGE && (
            <div className="card overflow-hidden">
              <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
            </div>
          )}
        </>}

        {/* ── TABLE VIEW ── */}
        {viewMode === 'table' && (
          <div className="card overflow-hidden">
            {toolbar}

            <div className="section-head">
              <div className="flex items-center gap-2">
                <span className="section-head-text"><strong>Sucursales</strong></span>
                <span style={{ fontSize: '.7rem', color: '#627080' }}>{filtered.length} encontrada{filtered.length !== 1 ? 's' : ''}</span>
                {stats.inactivas > 0 && (
                  <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#8A4A42' }}>{stats.inactivas} inactivas</span>
                )}
              </div>
            </div>

            <div className="table-scroll-wrapper">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Sucursal</th>
                    <th className="hidden lg:table-cell">Cajas abiertas</th>
                    <th className="hidden lg:table-cell">Usuarios</th>
                    <th>Ventas del mes</th>
                    <th className="hidden md:table-cell">Meta</th>
                    <th className="hidden xl:table-cell">Crédito almacén</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {paginadas.map(s => {
                    const r = ritmoDe(s.avance)
                    const sinDatos = <span className="text-xs" style={{ color: '#627080' }}>—</span>
                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: '#263442' }}>{s.nombre}</p>
                              <p className="text-xs truncate" style={{ color: '#627080' }}>{s.es_almacen ? 'Almacén central' : s.direccion}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell"><span className="text-sm font-medium" style={{ color: '#627080' }}>{s.cajas}</span></td>
                        <td className="hidden lg:table-cell"><span className="text-sm font-medium" style={{ color: '#627080' }}>{s.usuarios}</span></td>
                        <td><span className="text-sm font-semibold" style={{ color: '#047857' }}>{pesos(s.vendido)}</span></td>
                        <td className="hidden md:table-cell">
                          {s.meta
                            ? <span className="text-xs font-bold" style={{ color: r.color }}>{s.avance}% <span className="font-normal" style={{ color: '#627080' }}>de {pesosCorto(s.meta)}</span></span>
                            : sinDatos}
                        </td>
                        <td className="hidden xl:table-cell">
                          {s.saldo != null
                            ? <span className="text-sm font-semibold" style={{ color: s.saldo > 0 ? '#92400E' : '#627080' }}>{pesos(s.saldo)}</span>
                            : sinDatos}
                        </td>
                        <td><Badge label={s.activa ? 'Activa' : 'Inactiva'} color={s.activa ? 'green' : 'gray'} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <EmptyState icon={Search} title="Sin resultados" subtitle="Intenta con otro término o limpia los filtros." />
            )}

            <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
            <div className="table-foot-row">
              <p className="total-label">Ventas de {mes} · todas las sucursales</p>
              <p className="total-value">{pesos(stats.vendido)}</p>
            </div>
          </div>
        )}

      </>}
    </div>
  )
}
