import { useState, useEffect, useMemo } from 'react'
import { Package, Plus, Search, AlertTriangle, ArrowUp, ArrowDown, RotateCcw, Filter, LayoutGrid, List, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SkeletonCardGrid } from '../components/Skeleton'
import Badge from '../components/Badge'
import SearchInput from '../components/SearchInput'
import toast from '../utils/toast'
import PageHeader from '../components/PageHeader'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import { INIT_PRODUCTOS, categorias } from '../data/inventario'
import { fmtDec as fmt } from '../utils/fmt'
import { useLoadDelay } from '../hooks/useLoadDelay'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import Modal from '../components/Modal'
import ModalFooter from '../components/ModalFooter'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import AlertBanner from '../components/AlertBanner'

export default function Inventario() {
  const PER_PAGE = 6
  const loaded = useLoadDelay()
  const [productos, setProductos] = useState(INIT_PRODUCTOS)
  const [search, setSearch] = usePersistedState('inventario-search', '')
  const debouncedSearch = useDebounce(search)
  const [cat, setCat] = usePersistedState('inventario-cat', 'Todos')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showMov, setShowMov] = useState(null)
  const [viewMode, setViewMode] = usePersistedState('inventario-view', 'grid')
  const [editingId, setEditingId] = useState(null)
  const [editingStock, setEditingStock] = useState('')

  const saveStock = (id) => {
    const val = parseInt(editingStock, 10)
    if (!isNaN(val) && val >= 0) {
      const prev = productos.find(p => p.id === id)?.stock
      setProductos(ps => ps.map(p => p.id === id ? { ...p, stock: val } : p))
      toast.success('Stock actualizado', `${productos.find(p => p.id === id)?.nombre}: ${prev} → ${val}`, {
        label: 'Deshacer',
        fn: () => setProductos(ps => ps.map(p => p.id === id ? { ...p, stock: prev } : p))
      })
    }
    setEditingId(null)
    setEditingStock('')
  }

  const filtered       = useMemo(() => productos.filter(p =>
    (p.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) || p.codigo.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
    (cat === 'Todos' || p.categoria === cat)
  ), [productos, debouncedSearch, cat])
  const filteredValor  = useMemo(() => filtered.reduce((a, p) => a + p.stock * p.costo, 0), [filtered])

  const lowStock   = useMemo(() => productos.filter(p => p.stock <= p.min), [productos])
  const totalValor = useMemo(() => productos.reduce((a, p) => a + p.stock * p.costo, 0), [productos])

  const catStats = useMemo(() => {
    const map = {}
    for (const p of productos) {
      if (!map[p.categoria]) map[p.categoria] = { count: 0, hasLow: false }
      map[p.categoria].count++
      if (p.stock < p.min) map[p.categoria].hasLow = true
    }
    return map
  }, [productos])

  const getStockStatus = (p) => {
    if (p.stock <= p.min * 0.5) return { label: 'Crítico', color: 'red' }
    if (p.stock <= p.min) return { label: 'Bajo', color: 'amber' }
    return { label: 'Normal', color: 'green' }
  }

  // Returns the card-accent class based on stock level
  const getCardAccent = (p) => {
    if (p.stock <= p.min * 0.5) return 'card-accent-red'
    if (p.stock <= p.min) return 'card-accent-amber'
    return 'card-accent-blue'
  }

  useEffect(() => { setPage(1) }, [debouncedSearch, cat])
  useEscapeKey(() => { setShowModal(false); setShowMov(null) })

  return (
    <div className="space-y-5">

      <PageHeader
        breadcrumb="Inventario"
        title="Inventario"
        subtitle={`${productos.length} productos registrados · ${lowStock.length} con stock bajo`}
      >
        {/* View toggle */}
        <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: '#FDBA74' }}>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5`}
            style={viewMode === 'grid' ? { background: '#F97316', color: '#fff' } : { background: '#F2F3F5', color: '#8FA1B2' }}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5`}
            style={viewMode === 'list' ? { background: '#F97316', color: '#fff', borderLeft: '1px solid #FDBA74' } : { background: '#F2F3F5', color: '#8FA1B2', borderLeft: '1px solid #FDBA74' }}
          >
            <List className="w-3.5 h-3.5" /> Lista
          </button>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </PageHeader>

      <KpiBar items={[
        { label: 'Total SKUs',       value: productos.length,                                                             sub: 'registrados' },
        { label: 'Stock bajo',       value: lowStock.length, alert: lowStock.length > 0,                                 sub: 'bajo mínimo' },
        { label: 'Categorías',       value: categorias.length - 1,                                                       sub: 'activas' },
        { label: 'Valor inventario', value: fmt(totalValor), good: true,       sub: 'costo total' },
      ]} />

      {/* ══ Resumen visual ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stock por producto */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Stock actual por producto</span>
            <span className="text-xs ml-auto" style={{ color: '#8FA1B2' }}>unidades</span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart data={productos.map(p => ({ name: p.codigo, stock: p.stock, min: p.min, lowStock: p.stock < p.min }))} barSize={20} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#FDE8D0" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8FA1B2' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#FFF7ED' }}
                content={({ active, payload, label }) => active && payload?.length ? (
                  <div style={{ background: '#fff', border: '1px solid #FDE8D0', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(249,115,22,.12)' }}>
                    <p style={{ fontSize: 10, color: '#8FA1B2', fontWeight: 700 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: payload[0].payload.lowStock ? '#C97A6D' : '#F97316' }}>Stock: {payload[0].value}</p>
                    <p style={{ fontSize: 11, color: '#8FA1B2' }}>Mínimo: {payload[0].payload.min}</p>
                  </div>
                ) : null}
              />
              <Bar dataKey="stock" radius={[5, 5, 0, 0]}>
                {productos.map(p => <Cell key={p.id} fill={p.stock < p.min ? '#C97A6D' : p.stock < p.min * 2 ? '#d97706' : '#F97316'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Por categoría */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Por categoría</span>
          </div>
          {categorias.filter(c => c !== 'Todos').map((cat, i) => {
            const { count = 0, hasLow = false } = catStats[cat] || {}
            const pct = Math.round(count / productos.length * 100)
            const colors = ['#F97316', '#059669', '#d97706', '#7c3aed']
            return (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: hasLow ? 'rgba(201,122,109,.1)' : `${colors[i]}18` }}>
                  <span className="text-xs font-black" style={{ color: hasLow ? '#C97A6D' : colors[i] }}>{count}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: '#627080' }}>{cat}</span>
                    {hasLow && <span className="text-[10px] font-bold" style={{ color: '#C97A6D' }}>bajo stock</span>}
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#FDE8D0' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: hasLow ? '#C97A6D' : colors[i] }} />
                  </div>
                </div>
              </div>
            )
          })}
          <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #FDE8D0' }}>
            <span className="text-xs" style={{ color: '#8FA1B2' }}>Valor total</span>
            <span className="text-sm font-black" style={{ color: '#F97316' }}>{fmt(totalValor)}</span>
          </div>
        </div>
      </div>

      {/* ══ Low stock alert banner ════════════════════════════════ */}
      {lowStock.length > 0 && (
        <AlertBanner
          icon={AlertTriangle}
          title={`${lowStock.length} productos bajo inventario mínimo`}
          subtitle={lowStock.map(p => p.nombre).join(' · ')}
        />
      )}

      {/* ══ Grid / List view ══════════════════════════════════════ */}
      {!loaded ? <SkeletonCardGrid count={8} cols={4} /> : <>
      {viewMode === 'grid' && (<>
        <div className="card overflow-hidden">
          <div className="data-toolbar">
            <div className="data-toolbar-row">
              <div style={{ flex: 1, minWidth: 200 }}>
                <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o código..." resultCount={filtered.length} />
              </div>
              <div className="filter-bar">
                {categorias.map(c => (
                  <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? 'active' : ''}`}>{c}</button>
                ))}
              </div>
            </div>
            <div className="data-toolbar-footer">
              <div className="toolbar-summary">
                <span><b>{filtered.length}</b> productos</span>
                {lowStock.length > 0 && <><span className="sep">·</span><span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{lowStock.length} bajo mínimo</span></>}
              </div>
              <div className="toolbar-summary">Valor: <b>{fmt(filteredValor)}</b></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => {
            const st = getStockStatus(p)
            const accent = getCardAccent(p)
            return (
              <div
                key={p.id}
                className={`card card-glow p-4 animate-fade-in-up group cursor-pointer ${accent}`}
                style={{ animationDelay: `${Math.min(i * 40, 200)}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                    style={{
                      background: p.stock <= p.min * 0.5 ? 'rgba(201,122,109,.12)'
                        : p.stock <= p.min ? 'rgba(217,119,6,.1)'
                        : '#FFF7ED',
                    }}
                  >
                    <Package
                      className="w-6 h-6"
                      style={{
                        color: p.stock <= p.min * 0.5 ? '#C97A6D'
                          : p.stock <= p.min ? '#d97706'
                          : '#F97316',
                      }}
                    />
                  </div>
                  <Badge label={st.label} color={st.color} />
                </div>

                {/* Name + code */}
                <p className="font-bold text-sm mb-0.5 leading-snug" style={{ color: '#263442' }}>{p.nombre}</p>
                <p className="text-xs font-mono mb-3" style={{ color: '#8FA1B2' }}>{p.codigo}</p>

                {/* Stock gauge */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: '#8FA1B2' }}>Stock</span>
                    {editingId === p.id ? (
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        className="w-16 text-xs text-center font-bold rounded-md px-1 py-0.5"
                        style={{ border: '1.5px solid #F97316', color: '#263442', outline: 'none' }}
                        value={editingStock}
                        onChange={e => setEditingStock(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveStock(p.id)
                          if (e.key === 'Escape') { setEditingId(null); setEditingStock('') }
                        }}
                        onBlur={() => saveStock(p.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="font-bold cursor-pointer"
                        title="Clic para editar stock"
                        style={{ color: p.stock <= p.min ? '#C97A6D' : '#263442', textDecoration: 'underline dotted' }}
                        onClick={e => { e.stopPropagation(); setEditingId(p.id); setEditingStock(String(p.stock)) }}
                      >
                        {p.stock} <span className="font-normal" style={{ color: '#8FA1B2', textDecoration: 'none' }}>/ mín {p.min}</span>
                      </span>
                    )}
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${
                        p.stock <= p.min * 0.5 ? 'progress-fill-red' :
                        p.stock <= p.min ? 'progress-fill-amber' : 'progress-fill-green'
                      }`}
                      style={{ width: `${Math.min(100, (p.stock / (p.min * 3)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Price + category */}
                <div className="flex items-center justify-between">
                  <span className="tag tag-orange">{p.categoria}</span>
                  <span className="text-sm font-bold" style={{ color: '#263442' }}>{fmt(p.precio)}</span>
                </div>

                {/* Actions (show on hover / always on touch) */}
                <div className="flex gap-1.5 mt-3 inv-card-actions opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowMov({ product: p, type: 'Entrada' })}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
                    style={{ color: '#059669', background: 'rgba(5,150,105,.08)' }}
                  >
                    <ArrowUp className="w-3 h-3" /> Entrada
                  </button>
                  <button
                    onClick={() => setShowMov({ product: p, type: 'Salida' })}
                    className="btn-soft-red flex-1 py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                  >
                    <ArrowDown className="w-3 h-3" /> Salida
                  </button>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <EmptyState icon={Search} title="Sin resultados" subtitle="Intenta con otro término de búsqueda o limpia los filtros." className="col-span-full" />
          )}
        </div>
      </>)}

      {/* ══ List view (table) ══════════════════════════════════════ */}
      {viewMode === 'list' && (
        <div className="card overflow-hidden">
          <div className="data-toolbar">
            <div className="data-toolbar-row">
              <div style={{ flex: 1, minWidth: 200 }}>
                <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o código..." resultCount={filtered.length} />
              </div>
              <div className="filter-bar">
                {categorias.map(c => (
                  <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? 'active' : ''}`}>{c}</button>
                ))}
              </div>
            </div>
            <div className="data-toolbar-footer">
              <div className="toolbar-summary">
                <span><b>{filtered.length}</b> productos</span>
                {lowStock.length > 0 && <><span className="sep">·</span><span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{lowStock.length} bajo mínimo</span></>}
              </div>
              <div className="toolbar-summary">Valor: <b>{fmt(filteredValor)}</b></div>
            </div>
          </div>
          <div className="section-head">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
              <span className="section-head-text"><strong>Catálogo de Productos</strong></span>
              <span style={{ fontSize: '.7rem', color: '#8FA1B2' }}>{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</span>
              {lowStock.length > 0 && <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{lowStock.length} bajo mínimo</span>}
              <span className="badge" style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>{productos.length - lowStock.length} en stock</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  {['Producto', 'Categoría', 'Precio', 'Costo', 'Stock', 'Mínimo', 'Estado', 'Acciones'].map(h => (
                    <th
                      key={h}
                      className={`${['Categoría', 'Costo'].includes(h) ? 'hidden md:table-cell' : ''} ${h === 'Mínimo' ? 'hidden lg:table-cell' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(p => {
                  const st = getStockStatus(p)
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFF7ED' }}>
                            <Package className="w-4 h-4" style={{ color: '#F97316' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#263442' }}>{p.nombre}</p>
                            <p className="text-xs font-mono truncate" style={{ color: '#8FA1B2' }}>{p.codigo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell"><Badge label={p.categoria} color="blue" /></td>
                      <td><span className="text-sm font-semibold" style={{ color: '#263442' }}>{fmt(p.precio)}</span></td>
                      <td className="hidden md:table-cell"><span className="text-sm" style={{ color: '#8FA1B2' }}>{fmt(p.costo)}</span></td>
                      <td>
                        {editingId === p.id ? (
                          <input
                            type="number"
                            min="0"
                            autoFocus
                            className="w-20 text-sm text-center font-bold rounded-lg px-2 py-1"
                            style={{ border: '1.5px solid #F97316', color: '#263442', outline: 'none' }}
                            value={editingStock}
                            onChange={e => setEditingStock(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveStock(p.id)
                              if (e.key === 'Escape') { setEditingId(null); setEditingStock('') }
                            }}
                            onBlur={() => saveStock(p.id)}
                          />
                        ) : (
                          <span
                            className="text-sm font-bold cursor-pointer"
                            title="Clic para editar stock"
                            style={{ color: p.stock <= p.min ? '#C97A6D' : '#263442', textDecoration: 'underline dotted' }}
                            onClick={() => { setEditingId(p.id); setEditingStock(String(p.stock)) }}
                          >
                            {p.stock}
                          </span>
                        )}
                      </td>
                      <td className="hidden lg:table-cell"><span className="text-xs" style={{ color: '#8FA1B2' }}>{p.min}</span></td>
                      <td><Badge label={st.label} color={st.color} /></td>
                      <td>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => setShowMov({ product: p, type: 'Entrada' })} className="action-btn" title="Entrada">
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button onClick={() => setShowMov({ product: p, type: 'Salida' })} className="action-btn danger" title="Salida">
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button onClick={() => setShowMov({ product: p, type: 'Ajuste' })} className="action-btn" title="Ajuste">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <EmptyState icon={Search} title="Sin resultados" subtitle="Intenta con otro término de búsqueda o limpia los filtros." />
          )}
          <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
        </div>
      )}
      </>}

      {/* ══ Modal nuevo producto ══════════════════════════════════ */}
      {showModal && (
        <Modal title="Nuevo producto" maxWidth="lg" onClose={() => setShowModal(false)}>
            <div className="p-6 grid grid-cols-2 gap-4">
              <FormField label="Nombre del producto" className="col-span-2">
                <input type="text" placeholder="Ej: Queso Oaxaca 500g" className="input-field" autoFocus />
              </FormField>
              {[['Código de barras', 'Ej: 7501234567890'], ['Categoría', null, true], ['Precio de venta', 'Ej: 45.00'], ['Costo', 'Ej: 28.00'], ['Stock inicial', 'Ej: 100'], ['Mínimo', 'Ej: 20']].map(([label, ph, isSelect]) => (
                <FormField key={label} label={label}>
                  {isSelect ? (
                    <select className="input-field">
                      {['Quesos', 'Cremas', 'Mantequillas', 'Otros'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input type="text" placeholder={ph} className="input-field" />
                  )}
                </FormField>
              ))}
            </div>
            <ModalFooter onCancel={() => setShowModal(false)} onConfirm={() => { toast.success('Producto guardado', 'Agregado al inventario'); setShowModal(false) }} confirmLabel="Guardar producto" />
        </Modal>
      )}

      {/* ══ Modal movimiento ══════════════════════════════════════ */}
      {showMov && (
        <Modal title="Movimiento de inventario" subtitle={showMov.type} onClose={() => setShowMov(null)}>
            <div className="p-6 space-y-4">
              <div className="rounded-xl p-3" style={{ background: '#FFF7ED', border: '1px solid #FDBA74' }}>
                <p className="text-sm font-semibold" style={{ color: '#263442' }}>{showMov.product.nombre}</p>
                <p className="text-xs" style={{ color: '#8FA1B2' }}>Stock actual: <strong style={{ color: '#F97316' }}>{showMov.product.stock}</strong> unidades</p>
              </div>
              <FormField label="Tipo de movimiento">
                <select className="input-field" defaultValue={showMov.type}>
                  <option>Entrada</option>
                  <option>Salida</option>
                  <option>Ajuste</option>
                  <option>Transferencia</option>
                </select>
              </FormField>
              <FormField label="Cantidad">
                <input type="number" placeholder="0" min="1" className="input-field" />
              </FormField>
              <FormField label="Motivo / Referencia">
                <input type="text" placeholder="Ej: Orden de compra #0234" className="input-field" />
              </FormField>
            </div>
            <ModalFooter onCancel={() => setShowMov(null)} onConfirm={() => { toast.success('Movimiento registrado', 'El inventario fue actualizado'); setShowMov(null) }} confirmLabel="Registrar movimiento" />
        </Modal>
      )}
    </div>
  )
}
