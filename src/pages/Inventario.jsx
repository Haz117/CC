import { useState, useEffect, useMemo } from 'react'
import { Package, Search, AlertTriangle, LayoutGrid, List, TrendingUp, Download, Eye, Truck, Barcode } from 'lucide-react'
import { downloadCSV } from '../utils/csv'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { SkeletonCardGrid } from '../components/Skeleton'
import Badge from '../components/Badge'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import FilaDesglose from '../components/FilaDesglose'
import TituloTarjeta from '../components/TituloTarjeta'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import AlertBanner from '../components/AlertBanner'
import AvisoError from '../components/AvisoError'
import InfoCell from '../components/InfoCell'
import SelectorSucursal from '../components/SelectorSucursal'
import TablaGenerica from '../components/TablaGenerica'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import { useConsulta } from '../hooks/useConsulta'
import { useSucursales } from '../hooks/useSucursales'
import { listarProductos, listarExistencias, listarLimites, listarOrdenesPendientes } from '../api/inventario'
import { armarInventario, NIVEL, esBajo } from '../lib/calculos'
import { cantidad } from '../utils/fmt'

const PER_PAGE = 10
const PER_PAGE_GRID = 12
const MAX_ORDENES = 30
const COLORES = ['#F97316', '#059669', '#d97706', '#7c3aed', '#0d9488', '#C2410C']

// La etiqueta, el ícono y el borde avisan de la sucursal que peor está (`nivel`);
// la cifra y su barra son la suma de las sucursales a la vista y se colorean por ese total (`nivelTotal`).
const bajo      = (p) => esBajo(p.nivel)
const accent    = (p) => p.nivel === NIVEL.CRITICO ? 'card-accent-red' : p.nivel === NIVEL.BAJO ? 'card-accent-amber' : 'card-accent-blue'
const fondo     = (p) => p.nivel === NIVEL.CRITICO ? 'rgba(201,122,109,.12)' : p.nivel === NIVEL.BAJO ? 'rgba(217,119,6,.1)' : '#FFF7ED'
const tono      = (nivel) => esBajo(nivel) ? nivel.tono : '#F97316'
const tonoTotal = (p) => esBajo(p.nivelTotal) ? p.nivelTotal.tono : '#263442'
const fill      = (p) => p.nivelTotal === NIVEL.CRITICO ? 'progress-fill-red' : p.nivelTotal === NIVEL.BAJO ? 'progress-fill-amber' : 'progress-fill-green'
// El color de la categoría viene del catálogo; si no es un color válido se usa la paleta.
const colorDe = (color, i) => (/^#[0-9a-f]{6}$/i.test(color ?? '') ? color : COLORES[i % COLORES.length])

/* ── Detalle: existencia por sucursal y presentaciones ─────── */
function DetalleProducto({ producto: p, nombreSucursal, onClose }) {
  const presentaciones = (p.presentaciones ?? []).filter(x => x.activo !== false)
  return (
    <Modal title={p.nombre} subtitle={`Clave ${p.clave}`} maxWidth="lg" onClose={onClose}>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <InfoCell label="Categoría" value={p.categoria} center />
          <InfoCell label="Unidad base" value={p.unidad} center />
          <InfoCell label="Existencia" value={cantidad(p.existencia, p.unidad)} color={tonoTotal(p)} bold center />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#627080' }}>Existencia por sucursal</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #FDE8D0' }}>
            {p.porSucursal.map(s => (
              <div key={s.sucursal_id} className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid #FDE8D0' }}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug" style={{ color: '#263442' }}>{nombreSucursal(s.sucursal_id)}</p>
                  <p className="text-xs" style={{ color: '#627080' }}>
                    {s.minimo == null ? 'Sin mínimo configurado' : `mín ${cantidad(s.minimo)} · máx ${cantidad(s.maximo)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold" style={{ color: esBajo(s.nivel) ? s.nivel.tono : '#263442' }}>
                    {cantidad(s.existencia, p.unidad)}
                  </span>
                  <Badge label={s.nivel.label} color={s.nivel.color} />
                </div>
              </div>
            ))}
            {p.porSucursal.length === 0 && (
              <p className="px-4 py-4 text-xs text-center" style={{ color: '#627080' }}>Sin existencia registrada.</p>
            )}
          </div>
        </div>

        {presentaciones.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#627080' }}>Presentaciones</p>
            <div className="space-y-1.5">
              {presentaciones.map(x => (
                <div key={x.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2" style={{ background: '#F2F3F5' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#263442' }}>
                      {x.nombre} {x.es_principal && <span className="tag tag-orange ml-1">Principal</span>}
                    </p>
                    <p className="text-xs" style={{ color: '#627080' }}>{x.tipo} · equivale a {cantidad(x.factor, p.unidad)}</p>
                  </div>
                  {x.codigo_barras && (
                    <span className="flex items-center gap-1.5 text-xs font-mono flex-shrink-0" style={{ color: '#627080' }}>
                      <Barcode className="w-3.5 h-3.5" style={{ color: '#8FA1B2' }} /> {x.codigo_barras}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="px-6 py-4 flex justify-end" style={{ borderTop: '1px solid #FDE8D0' }}>
        <button onClick={onClose} className="btn-primary">Cerrar</button>
      </div>
    </Modal>
  )
}

export default function Inventario() {
  const { sucursales, nombreSucursal } = useSucursales()

  const [search, setSearch] = usePersistedState('inventario-search', '')
  const debouncedSearch = useDebounce(search)
  const [cat, setCat] = useState('Todos')
  const [soloBajos, setSoloBajos] = useState(false)
  const [sucursalId, setSucursalId] = useState('')
  const [page, setPage] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const [viewMode, setViewMode] = usePersistedState('inventario-view', 'grid')

  // La existencia cambia con cada venta, pero la base solo avisa en vivo de los pedidos de reabastecimiento.
  const { datos, cargando, error, recargar } = useConsulta(async () => {
    const filtro = { sucursalId: sucursalId || undefined }
    const [productos, existencias, limites, ordenes] = await Promise.all([
      listarProductos(), listarExistencias(filtro), listarLimites(filtro), listarOrdenesPendientes(),
    ])
    return { productos, existencias, limites, ordenes }
  }, [sucursalId], { enVivo: ['ordenes_reabastecimiento'] })

  const productos = useMemo(() => (datos ? armarInventario(datos) : []), [datos])
  const ordenes = datos?.ordenes ?? []
  const [nombreProducto, unidadProducto] = useMemo(() => {
    const porId = new Map(productos.map(p => [p.id, p]))
    return [(id) => porId.get(id)?.nombre ?? '—', (id) => porId.get(id)?.unidad]
  }, [productos])

  const categorias = useMemo(() => {
    const mapa = new Map()
    for (const p of productos) {
      const c = mapa.get(p.categoria) ?? { nombre: p.categoria, color: p.categorias?.color, count: 0, bajos: 0 }
      c.count++
      if (bajo(p)) c.bajos++
      mapa.set(p.categoria, c)
    }
    return [...mapa.values()].sort((a, b) => b.count - a.count).map((c, i) => ({ ...c, color: colorDe(c.color, i) }))
  }, [productos])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return productos.filter(p =>
      (cat === 'Todos' || p.categoria === cat) &&
      (!soloBajos || bajo(p)) &&
      (!q || p.nombre.toLowerCase().includes(q) || String(p.clave ?? '').toLowerCase().includes(q))
    )
  }, [productos, debouncedSearch, cat, soloBajos])

  const bajos    = useMemo(() => productos.filter(bajo), [productos])
  const criticos = bajos.filter(p => p.nivel === NIVEL.CRITICO).length

  // Los más cerca (o más abajo) de su mínimo, como % del mínimo: sirve igual para piezas y kilos.
  // Cada producto entra con la sucursal donde peor está, para que el almacén no tape a una tienda.
  const masBajos = useMemo(() => productos
    .filter(p => p.peor)
    .map(p => ({ id: p.id, nombre: p.nombre, clave: p.clave, unidad: p.unidad, ...p.peor, pct: Math.round(p.peor.existencia / p.peor.minimo * 100) }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 10), [productos])

  const porPagina = viewMode === 'grid' ? PER_PAGE_GRID : PER_PAGE
  const visibles = filtered.slice((page - 1) * porPagina, page * porPagina)

  useEffect(() => { setPage(1) }, [debouncedSearch, cat, soloBajos, sucursalId, viewMode])
  useEffect(() => { if (cat !== 'Todos' && !categorias.some(c => c.nombre === cat)) setCat('Todos') }, [categorias, cat])
  useEscapeKey(() => setDetalle(null))

  const handleExportCSV = () => downloadCSV(filtered.map(p => ({
    clave: p.clave,
    nombre: p.nombre,
    categoria: p.categoria,
    unidad: p.unidad,
    existencia: p.existencia,
    minimo: p.minimo ?? '',
    maximo: p.maximo ?? '',
    estado: p.nivel.label,
  })), 'inventario')

  const alcance = sucursalId ? nombreSucursal(sucursalId) : 'todas las sucursales'

  // Mientras llega la primera respuesta, o si falló, no hay cifras que mostrar: un cero se leería como dato real.
  const sinDatos = datos === undefined
  const estadoKpi = cargando ? 'cargando' : sinDatos ? 'error' : null
  // Catálogo vacío no es lo mismo que una búsqueda sin coincidencias.
  const vacio = sinDatos ? null : productos.length === 0
    ? <EmptyState icon={Package} title="Todavía no hay productos en el catálogo" subtitle="Aparecerán aquí en cuanto las cajas los sincronicen." className="col-span-full" />
    : <EmptyState icon={Search} title="Sin resultados" subtitle="Intenta con otro término de búsqueda o limpia los filtros." className="col-span-full" />

  const toolbar = (
    <div className="data-toolbar">
      <div className="data-toolbar-row">
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o clave..." resultCount={filtered.length} />
        </div>
        <div className="filter-bar">
          <button onClick={() => setCat('Todos')} className={`chip ${cat === 'Todos' ? 'active' : ''}`}>Todos</button>
          {categorias.map(c => (
            <button key={c.nombre} onClick={() => setCat(c.nombre)} className={`chip ${cat === c.nombre ? 'active' : ''}`}>{c.nombre}</button>
          ))}
        </div>
        <SelectorSucursal value={sucursalId} onChange={setSucursalId} sucursales={sucursales} />
      </div>
      <div className="data-toolbar-footer">
        <div className="toolbar-summary">
          <span><b>{filtered.length}</b> producto{filtered.length !== 1 ? 's' : ''}</span>
          <span className="sep">·</span>
          <span>{alcance}</span>
        </div>
        <button
          onClick={() => setSoloBajos(v => !v)}
          className={`chip ${soloBajos ? 'active' : ''}`}
          style={soloBajos ? { background: 'rgba(201,122,109,.15)', color: '#A05A52', borderColor: 'rgba(201,122,109,.35)', boxShadow: 'none' } : {}}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Solo bajo mínimo ({bajos.length})
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">

      <PageHeader
        breadcrumb="Inventario"
        title="Inventario"
        subtitle={sinDatos ? `Existencias · ${alcance}` : `${productos.length} producto${productos.length !== 1 ? 's activos' : ' activo'} · ${bajos.length} bajo mínimo · ${alcance}`}
      >
        <button onClick={handleExportCSV} className="btn-secondary" disabled={filtered.length === 0}>
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
        <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: '#FDBA74' }}>
          <button
            onClick={() => setViewMode('grid')}
            className="px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={viewMode === 'grid' ? { background: '#F97316', color: '#fff' } : { background: '#F2F3F5', color: '#627080' }}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={viewMode === 'list' ? { background: '#F97316', color: '#fff', borderLeft: '1px solid #FDBA74' } : { background: '#F2F3F5', color: '#627080', borderLeft: '1px solid #FDBA74' }}
          >
            <List className="w-3.5 h-3.5" /> Lista
          </button>
        </div>
      </PageHeader>

      <KpiBar estado={estadoKpi} items={[
        { label: 'Productos',        value: productos.length,                          sub: 'activos en catálogo' },
        { label: 'Bajo mínimo',      value: bajos.length, alert: bajos.length > 0,     sub: 'por reabastecer' },
        { label: 'Críticos',         value: criticos, alert: criticos > 0,             sub: 'a la mitad del mínimo o menos' },
        { label: 'Reabastecimiento', value: ordenes.length, alert: ordenes.length > 0, sub: 'pedidos pendientes' },
      ]} />

      <AvisoError error={error} onReintentar={recargar} />

      {/* ══ Resumen visual ════════════════════════════════════════ */}
      {productos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card p-5 lg:col-span-2">
            <TituloTarjeta icon={TrendingUp} titulo="Existencia contra el mínimo">{masBajos.length === 1 ? 'el más bajo' : `los ${masBajos.length} más bajos`} · % del mínimo de su sucursal</TituloTarjeta>
            {masBajos.length === 0 ? (
              <p className="text-xs text-center py-14" style={{ color: '#627080' }}>No hay mínimos configurados para estas sucursales</p>
            ) : (
              <ResponsiveContainer width="100%" height={148}>
                <BarChart data={masBajos.map(p => ({ ...p, barra: Math.min(p.pct, 300) }))} maxBarSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#FDE8D0" />
                  <XAxis dataKey="clave" tick={{ fontSize: 9, fill: '#627080' }} axisLine={false} tickLine={false} minTickGap={6} />
                  <ReferenceLine y={100} stroke="#059669" strokeDasharray="5 3" label={{ value: 'Mínimo', position: 'insideBottomLeft', fontSize: 9, fill: '#059669', fontWeight: 700 }} />
                  <Tooltip
                    cursor={{ fill: '#FFF7ED' }}
                    content={({ active, payload }) => active && payload?.length ? (
                      <div style={{ background: '#fff', border: '1px solid #FDE8D0', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(249,115,22,.12)' }}>
                        <p style={{ fontSize: 10, color: '#627080', fontWeight: 700 }}>{payload[0].payload.nombre} · {nombreSucursal(payload[0].payload.sucursal_id)}</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: tono(payload[0].payload.nivel) }}>{cantidad(payload[0].payload.existencia, payload[0].payload.unidad)} · {payload[0].payload.pct}%</p>
                        <p style={{ fontSize: 11, color: '#627080' }}>Mínimo: {cantidad(payload[0].payload.minimo, payload[0].payload.unidad)}</p>
                      </div>
                    ) : null}
                  />
                  <Bar dataKey="barra" radius={[5, 5, 0, 0]} minPointSize={3}>
                    {masBajos.map(p => <Cell key={p.id} fill={tono(p.nivel)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-5 flex flex-col gap-3">
            <TituloTarjeta icon={Package} titulo="Por categoría" className="mb-1" />
            {categorias.slice(0, 6).map(c => {
              const pct = Math.round(c.count / productos.length * 100)
              const color = c.bajos ? '#C97A6D' : c.color
              return <FilaDesglose key={c.nombre} cuenta={c.count} etiqueta={c.nombre} derecha={c.bajos > 0 ? `${c.bajos} bajo mínimo` : null} pct={pct} color={color} />
            })}
          </div>
        </div>
      )}

      {/* ══ Low stock alert banner ════════════════════════════════ */}
      {bajos.length > 0 && (
        <AlertBanner
          icon={AlertTriangle}
          title={`${bajos.length} producto${bajos.length > 1 ? 's' : ''} bajo el inventario mínimo`}
          subtitle={bajos.slice(0, 8).map(p => p.nombre).join(' · ') + (bajos.length > 8 ? ` · y ${bajos.length - 8} más` : '')}
        />
      )}

      {/* ══ Pedidos de reabastecimiento ═══════════════════════════ */}
      {ordenes.length > 0 && (
        <div className="card overflow-hidden">
          <div className="section-head">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
              <span className="section-head-text"><strong>Reabastecimiento pendiente</strong></span>
              <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{ordenes.length} pedido{ordenes.length !== 1 ? 's' : ''}</span>
            </div>
            <span className="hidden sm:inline text-xs" style={{ color: '#627080' }}>Los genera la base cuando un producto baja del mínimo</span>
          </div>
          <TablaGenerica
            filas={ordenes.slice(0, MAX_ORDENES)}
            primero={['sucursal_id', 'producto_id']}
            resolver={{
              sucursal_id: nombreSucursal,
              producto_id: nombreProducto,
              cantidad_sugerida: (valor, orden) => cantidad(valor, unidadProducto(orden.producto_id)),
            }}
          />
          {ordenes.length > MAX_ORDENES && (
            <p className="px-5 py-2.5 text-xs" style={{ color: '#627080', borderTop: '1px solid #FDE8D0' }}>
              Se muestran {MAX_ORDENES} de {ordenes.length} pedidos pendientes.
            </p>
          )}
        </div>
      )}

      {/* ══ Grid / List view ══════════════════════════════════════ */}
      {cargando ? <SkeletonCardGrid count={8} cols={4} /> : <>
      {viewMode === 'grid' && (<>
        <div className="card overflow-hidden">{toolbar}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibles.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setDetalle(p)}
              className={`card card-glow p-4 animate-fade-in-up cursor-pointer text-left ${accent(p)}`}
              style={{ animationDelay: `${Math.min(i * 40, 200)}ms`, fontFamily: 'inherit' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: fondo(p) }}>
                  <Package className="w-6 h-6" style={{ color: tono(p.nivel) }} />
                </div>
                <Badge label={p.nivel.label} color={p.nivel.color} />
              </div>

              <p className="font-bold text-sm mb-0.5 leading-snug" style={{ color: '#263442' }}>{p.nombre}</p>
              <p className="text-xs font-mono mb-3" style={{ color: '#627080' }}>{p.clave}</p>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1 gap-2">
                  <span className="font-medium" style={{ color: '#627080' }}>Existencia</span>
                  <span className="font-bold text-right" style={{ color: tonoTotal(p) }}>
                    {cantidad(p.existencia, p.unidad)}
                    {p.minimo != null && <span className="font-normal" style={{ color: '#627080' }}> / mín {cantidad(p.minimo)}</span>}
                  </span>
                </div>
                <div className="progress-track">
                  <div className={`progress-fill ${fill(p)}`} style={{ width: `${p.minimo ? Math.min(100, p.existencia / (p.minimo * 3) * 100) : p.existencia > 0 ? 100 : 0}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="tag tag-orange">{p.categoria}</span>
                {p.porSucursal.length > 1 && p.bajos > 0 && (
                  <span className="text-[10px] font-bold" style={{ color: '#C97A6D' }}>bajo en {p.bajos} suc.</span>
                )}
              </div>
            </button>
          ))}

          {filtered.length === 0 && vacio}
        </div>
        {filtered.length > porPagina && (
          <div className="card overflow-hidden">
            <Pagination total={filtered.length} page={page} perPage={porPagina} onChange={setPage} />
          </div>
        )}
      </>)}

      {/* ══ List view (table) ══════════════════════════════════════ */}
      {viewMode === 'list' && (
        <div className="card overflow-hidden">
          {toolbar}
          <div className="section-head">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
              <span className="section-head-text"><strong>Existencias</strong></span>
              <span style={{ fontSize: '.7rem', color: '#627080' }}>{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</span>
              {bajos.length > 0 && <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{bajos.length} bajo mínimo</span>}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="hidden md:table-cell">Categoría</th>
                  <th>Existencia</th>
                  <th className="hidden lg:table-cell">Mínimo</th>
                  <th className="hidden lg:table-cell">Máximo</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: fondo(p) }}>
                          <Package className="w-4 h-4" style={{ color: tono(p.nivel) }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: '#263442' }}>{p.nombre}</p>
                          <p className="text-xs font-mono truncate" style={{ color: '#627080' }}>{p.clave}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell"><Badge label={p.categoria} color="blue" /></td>
                    <td><span className="text-sm font-bold" style={{ color: tonoTotal(p) }}>{cantidad(p.existencia, p.unidad)}</span></td>
                    <td className="hidden lg:table-cell"><span className="text-xs" style={{ color: '#627080' }}>{p.minimo == null ? '—' : cantidad(p.minimo)}</span></td>
                    <td className="hidden lg:table-cell"><span className="text-xs" style={{ color: '#627080' }}>{p.maximo == null ? '—' : cantidad(p.maximo)}</span></td>
                    <td>
                      <Badge label={p.nivel.label} color={p.nivel.color} />
                      {p.porSucursal.length > 1 && p.bajos > 0 && (
                        <p className="text-[10px] font-bold mt-1" style={{ color: '#C97A6D' }}>en {p.bajos} sucursal{p.bajos !== 1 ? 'es' : ''}</p>
                      )}
                    </td>
                    <td>
                      <button onClick={() => setDetalle(p)} className="action-btn" title="Ver detalle" aria-label={`Ver ${p.nombre}`}>
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && vacio}
          <Pagination total={filtered.length} page={page} perPage={porPagina} onChange={setPage} />
        </div>
      )}
      </>}

      {detalle && <DetalleProducto producto={detalle} nombreSucursal={nombreSucursal} onClose={() => setDetalle(null)} />}
    </div>
  )
}
