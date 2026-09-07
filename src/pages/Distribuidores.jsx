import { useState, useEffect, useMemo } from 'react'
import { Truck, Plus, Package, DollarSign, Eye, Edit, Trash2, Users, TrendingUp } from 'lucide-react'
import Modal from '../components/Modal'
import SortTh from '../components/SortTh'
import { useSort } from '../hooks/useSort'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonTableRows } from '../components/Skeleton'
import Badge from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'
import toast from '../utils/toast'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import { distribuidores } from '../data/distribuidores'
import { fmt } from '../utils/fmt'
import { useLoadDelay } from '../hooks/useLoadDelay'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import ModalFooter from '../components/ModalFooter'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import InfoCell from '../components/InfoCell'

const statusColor = { Activo: 'green', 'En ruta': 'blue', 'Saldo pendiente': 'red' }
const BLANK_FORM = { nombre: '', telefono: '', ruta: 'Sin ruta', listaPrecio: 'Lista general', credito: '' }

export default function Distribuidores() {
  const PER_PAGE = 5
  const loaded = useLoadDelay()
  const [search, setSearch]       = usePersistedState('distribuidores-search', '')
  const debouncedSearch = useDebounce(search)
  const [page, setPage]           = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected]   = useState(null)
  const [editItem, setEditItem]   = useState(null)
  const [editForm, setEditForm]   = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [newForm, setNewForm]     = useState(BLANK_FORM)
  const [data, setData]           = useState(distribuidores)
  const { sortKey, sortDir, handleSort } = useSort('nombre')

  const filtered = useMemo(() => data.filter(d =>
    d.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) || d.ruta.toLowerCase().includes(debouncedSearch.toLowerCase())
  ), [data, debouncedSearch])

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1
    if (['mercancia', 'vendido', 'saldo', 'devoluciones', 'clientes'].includes(sortKey))
      return mult * (a[sortKey] - b[sortKey])
    return mult * String(a[sortKey]).localeCompare(String(b[sortKey]))
  }), [filtered, sortKey, sortDir])
  const paginated = useMemo(() => sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE), [sorted, page])

  const totalRutas = new Set(data.map(d => d.ruta)).size
  const distCounts = useMemo(() => {
    let activos = 0, enRuta = 0, saldo = 0
    let totalMercancia = 0, totalVendido = 0, totalSaldo = 0, totalDevoluciones = 0
    const withSales = []
    for (const d of data) {
      if (d.status === 'Activo')           activos++
      else if (d.status === 'En ruta')     enRuta++
      else if (d.status === 'Saldo pendiente') saldo++
      if (d.mercancia > 0) withSales.push(d)
      totalMercancia    += d.mercancia
      totalVendido      += d.vendido
      totalSaldo        += d.saldo
      totalDevoluciones += d.devoluciones
    }
    return { activos, enRuta, saldo, withSales, totalMercancia, totalVendido, totalSaldo, totalDevoluciones }
  }, [data])

  const openEdit = (d) => {
    setEditItem(d)
    setEditForm({ nombre: d.nombre, telefono: d.telefono, ruta: d.ruta })
  }

  const saveEdit = () => {
    setData(d => d.map(x => x.id === editItem.id ? { ...x, ...editForm } : x))
    toast.success('Distribuidor actualizado', `Los datos de ${editForm.nombre} fueron guardados`)
    setEditItem(null)
  }

  const deleteItem = (d) => {
    setData(arr => arr.filter(x => x.id !== d.id))
    toast.error('Distribuidor eliminado', `${d.nombre} fue removido del sistema`)
    setConfirmDel(null)
  }

  const saveNew = () => {
    if (!newForm.nombre.trim()) return toast.error('Falta nombre', 'Ingresa el nombre del distribuidor')
    const nextId = Math.max(...data.map(d => d.id)) + 1
    setData(arr => [...arr, {
      id: nextId, codigo: `D-00${nextId}`,
      nombre: newForm.nombre, ruta: newForm.ruta, telefono: newForm.telefono,
      clientes: 0, mercancia: 0, vendido: 0, saldo: 0, devoluciones: 0, status: 'Activo'
    }])
    toast.success('Distribuidor guardado', `${newForm.nombre} fue registrado en el sistema`)
    setShowModal(false)
    setNewForm(BLANK_FORM)
  }

  useEffect(() => { setPage(1) }, [debouncedSearch, sortKey, sortDir])
  useEscapeKey(() => { setShowModal(false); setSelected(null); setEditItem(null) })

  return (
    <div className="space-y-4">

      <PageHeader breadcrumb="Distribuidores" title="Distribuidores" subtitle={`${data.length} distribuidores registrados`}>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo distribuidor
        </button>
      </PageHeader>
      <KpiBar items={[
        { label: 'Total', value: data.length, sub: 'distribuidores' },
        { label: 'Activos', value: distCounts.activos, good: true, sub: 'en operación' },
        { label: 'En ruta', value: distCounts.enRuta, sub: 'activos ahora' },
        { label: 'Saldo pendiente', value: distCounts.saldo, alert: distCounts.saldo > 0, sub: 'por cobrar' },
        { label: 'Total mercancía', value: fmt(distCounts.totalMercancia), sub: 'en distribución' },
      ]} />

      {/* ══ Resumen visual ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mercancía vs vendido */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#2F8CEB' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Mercancía vs vendido</span>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded" style={{ background: '#2F8CEB' }} /><span className="text-xs" style={{ color: '#8FA1B2' }}>Vendido</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded" style={{ background: '#C8DEFA' }} /><span className="text-xs" style={{ color: '#8FA1B2' }}>Mercancía</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart data={data.map(d => ({ name: d.nombre.split(' ')[0], vendido: d.vendido, mercancia: d.mercancia - d.vendido }))} barSize={14} barGap={2} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E2EAF2" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8FA1B2' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#EBF5FF' }}
                content={({ active, payload, label }) => active && payload?.length ? (
                  <div style={{ background: '#fff', border: '1px solid #E2EAF2', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(47,140,235,.12)' }}>
                    <p style={{ fontSize: 10, color: '#8FA1B2', fontWeight: 700 }}>{label}</p>
                    {payload.map(p => <p key={p.name} style={{ fontSize: 12, color: p.fill, fontWeight: 700 }}>{p.name === 'vendido' ? 'Vendido' : 'Restante'}: {fmt(p.value)}</p>)}
                  </div>
                ) : null}
              />
              <Bar dataKey="vendido" stackId="a" radius={[0, 0, 0, 0]} fill="#2F8CEB" name="vendido" />
              <Bar dataKey="mercancia" stackId="a" radius={[4, 4, 0, 0]} fill="#C8DEFA" name="mercancia" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Métricas clave */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 flex-shrink-0" style={{ color: '#2F8CEB' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Métricas clave</span>
          </div>
          {[
            { label: 'Total vendido',    value: fmt(distCounts.totalVendido),      color: '#059669', bg: 'rgba(5,150,105,.08)' },
            { label: 'Saldo por cobrar', value: fmt(distCounts.totalSaldo),        color: '#C97A6D', bg: 'rgba(201,122,109,.08)' },
            { label: 'Devoluciones',     value: fmt(distCounts.totalDevoluciones), color: '#d97706', bg: 'rgba(217,119,6,.08)' },
          ].map(m => (
            <div key={m.label} className="rounded-xl p-3 flex items-center justify-between" style={{ background: m.bg }}>
              <span className="text-xs font-semibold" style={{ color: '#627080' }}>{m.label}</span>
              <span className="text-sm font-black" style={{ color: m.color }}>{m.value}</span>
            </div>
          ))}
          <div className="rounded-xl p-3 mt-auto" style={{ background: '#EBF5FF' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#8FA1B2' }}>Eficiencia promedio</p>
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-black" style={{ color: '#2F8CEB' }}>
                {distCounts.withSales.length
                  ? Math.round(distCounts.withSales.reduce((a, d) => a + (d.vendido / d.mercancia * 100), 0) / distCounts.withSales.length)
                  : 0}%
              </span>
              <span className="text-xs mb-1" style={{ color: '#8FA1B2' }}>de mercancía vendida</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLE / CARDS ── */}
      {!loaded ? <SkeletonTableRows /> : <>
      <div className="card overflow-hidden mb-6 hidden lg:block">
        <div className="data-toolbar">
          <div className="data-toolbar-row">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar distribuidor o ruta..." resultCount={filtered.length} />
          </div>
        </div>
        <div className="section-head">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 flex-shrink-0" style={{ color: '#2F8CEB' }} />
            <span className="section-head-text"><strong>Distribuidores</strong></span>
            <span style={{ fontSize: '.7rem', color: '#8FA1B2' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
            <span className="badge" style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>{distCounts.activos} activos</span>
            {distCounts.saldo > 0 && (
              <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{distCounts.saldo} saldo</span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Código</th>
                <SortTh col="nombre" label="Distribuidor" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="ruta" label="Ruta" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="clientes" label="Clientes" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th>Mercancía</th>
                <th>Vendido</th>
                <th className="hidden xl:table-cell">Devoluciones</th>
                <SortTh col="saldo" label="Saldo" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="status" label="Estado" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(d => {
                const pct = d.mercancia > 0 ? Math.min(100, Math.round((d.vendido / d.mercancia) * 100)) : 0
                return (
                  <tr key={d.id}>
                    <td><span className="folio">{d.codigo}</span></td>
                    <td>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EBF4FC' }}>
                          <Truck className="w-4 h-4" style={{ color: '#2F8CEB' }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs truncate" style={{ color: '#263442' }}>{d.nombre}</p>
                          <p className="text-xs truncate" style={{ color: '#8FA1B2' }}>{d.telefono}</p>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ color: '#627080' }}>{d.ruta}</span></td>
                    <td>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" style={{ color: '#A6C3DA' }} />
                        <span className="font-semibold" style={{ color: '#263442' }}>{d.clientes}</span>
                      </span>
                    </td>
                    <td><span className="font-medium" style={{ color: '#627080' }}>{fmt(d.mercancia)}</span></td>
                    <td>
                      <div>
                        <span className="font-bold" style={{ color: '#059669' }}>{fmt(d.vendido)}</span>
                        <div className="progress-track mt-1">
                          <div className="progress-fill progress-fill-orange" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#8FA1B2' }}>{pct}%</p>
                      </div>
                    </td>
                    <td className="hidden xl:table-cell"><span style={{ color: '#627080' }}>{fmt(d.devoluciones)}</span></td>
                    <td>
                      {d.saldo > 0
                        ? <span className="font-bold" style={{ color: '#C97A6D' }}>{fmt(d.saldo)}</span>
                        : <span className="text-xs" style={{ color: '#8FA1B2' }}>—</span>}
                    </td>
                    <td><Badge label={d.status} color={statusColor[d.status]} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="action-btn" title="Ver detalle" onClick={() => setSelected(d)}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="action-btn" title="Editar" onClick={() => openEdit(d)}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="action-btn danger" title="Eliminar" onClick={() => setConfirmDel(d)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <EmptyState icon={Truck} title="Sin resultados" subtitle="No hay distribuidores que coincidan con la búsqueda." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={sorted.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </div>

      {/* ── CARDS (mobile / tablet) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6 lg:hidden">
        {filtered.map((d, i) => (
          <div
            key={d.id}
            className="card p-5 animate-fade-in-up"
            style={{ animationDelay: `${Math.min(i * 60, 200)}ms`, ...(d.saldo > 0 ? { borderColor: 'rgba(201,122,109,.25)' } : {}) }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#EBF5FF' }}
                >
                  <Truck className="w-5 h-5" style={{ color: '#2F8CEB' }} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: '#263442' }}>{d.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    <span className="folio text-xs flex-shrink-0">{d.codigo}</span>
                    <span style={{ color: '#D4DDE6' }}>·</span>
                    <span className="text-xs truncate" style={{ color: '#8FA1B2' }}>{d.telefono}</span>
                  </div>
                  <p className="text-xs font-medium mt-0.5 truncate" style={{ color: '#2F8CEB' }}>{d.ruta}</p>
                </div>
              </div>
              <Badge label={d.status} color={statusColor[d.status]} />
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Clientes', value: d.clientes, color: '#263442' },
                { label: 'Mercancía', value: fmt(d.mercancia), color: '#263442' },
                { label: 'Vendido', value: fmt(d.vendido), color: '#059669' },
                { label: 'Devoluciones', value: fmt(d.devoluciones), color: d.devoluciones > 0 ? '#C97A6D' : '#8FA1B2' },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-2.5" style={{ background: '#F2F3F5' }}>
                  <p className="text-[10px] mb-0.5" style={{ color: '#8FA1B2' }}>{item.label}</p>
                  <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Saldo pendiente */}
            {d.saldo > 0 && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-3" style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.2)' }}>
                <p className="text-xs font-semibold" style={{ color: '#A05A52' }}>Saldo pendiente</p>
                <p className="text-sm font-black" style={{ color: '#C97A6D' }}>{fmt(d.saldo)}</p>
              </div>
            )}

            {/* Mercancía utilization */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: '#8FA1B2' }}>
                <span>Utilización de mercancía</span>
                <span className="font-bold" style={{ color: '#2F8CEB' }}>
                  {d.mercancia > 0 ? Math.round((d.vendido / d.mercancia) * 100) : 0}%
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill progress-fill-orange transition-all duration-700"
                  style={{ width: `${d.mercancia > 0 ? Math.min(100, (d.vendido / d.mercancia) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSelected(d)} className="btn-soft-blue flex-1 py-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Ver detalle
              </button>
              <button onClick={() => openEdit(d)} className="btn-secondary flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1">
                <Edit className="w-3.5 h-3.5" /> Editar
              </button>
            </div>
          </div>
        ))}
      </div>
      </>}

      {/* ── MODAL: Detalle distribuidor ── */}
      {selected && (
        <Modal onClose={() => setSelected(null)} header={<div><h3 className="font-bold" style={{ color: '#263442' }}>{selected.nombre}</h3><span className="folio">{selected.codigo}</span></div>}>
            <div className="p-6 space-y-3">
              {/* Avatar + progreso */}
              <div className="flex items-center gap-4 mb-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#EBF5FF' }}>
                  <Truck className="w-7 h-7" style={{ color: '#2F8CEB' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#8FA1B2' }}>Utilización de mercancía</p>
                  {(() => {
                    const pct = selected.mercancia > 0 ? Math.min(100, Math.round((selected.vendido / selected.mercancia) * 100)) : 0
                    return (
                      <>
                        <div className="progress-track" style={{ marginBottom: 4 }}>
                          <div className="progress-fill progress-fill-orange" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs font-black" style={{ color: '#2F8CEB' }}>{pct}% <span className="font-normal" style={{ color: '#8FA1B2' }}>de mercancía vendida</span></p>
                      </>
                    )
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Ruta', value: selected.ruta },
                  { label: 'Teléfono', value: selected.telefono },
                  { label: 'Clientes', value: selected.clientes },
                  { label: 'Mercancía', value: fmt(selected.mercancia) },
                  { label: 'Vendido', value: fmt(selected.vendido), color: '#059669' },
                  { label: 'Devoluciones', value: fmt(selected.devoluciones), color: selected.devoluciones > 0 ? '#d97706' : undefined },
                ].map(item => (
                  <InfoCell key={item.label} label={item.label} value={item.value} color={item.color || '#263442'} bold />
                ))}
                {/* Estado — full width */}
                <div className="col-span-2 rounded-xl p-3 flex items-center justify-between" style={{ background: '#F2F3F5' }}>
                  <p className="text-xs" style={{ color: '#8FA1B2' }}>Estado</p>
                  <Badge label={selected.status} color={statusColor[selected.status]} />
                </div>
                {/* Saldo — full width, destacado si > 0 */}
                <div
                  className="col-span-2 rounded-xl p-3 flex items-center justify-between"
                  style={selected.saldo > 0
                    ? { background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.2)' }
                    : { background: '#F2F3F5' }}
                >
                  <p className="text-xs font-semibold" style={{ color: selected.saldo > 0 ? '#A05A52' : '#8FA1B2' }}>Saldo pendiente</p>
                  <p className="text-sm font-black" style={{ color: selected.saldo > 0 ? '#C97A6D' : '#8FA1B2' }}>
                    {selected.saldo > 0 ? fmt(selected.saldo) : '—'}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer px-6 py-4 flex justify-end" style={{ borderTop: '1px solid #E2EAF2' }}>
              <button onClick={() => setSelected(null)} className="btn-secondary">Cerrar</button>
            </div>
        </Modal>
      )}

      {/* ── MODAL: Editar distribuidor ── */}
      {editItem && editForm && (
        <Modal maxWidth="lg" onClose={() => setEditItem(null)} header={<div><h3 className="font-bold" style={{ color: '#263442' }}>Editar distribuidor</h3><span className="folio">{editItem.codigo}</span></div>}>
            <div className="p-6 grid grid-cols-2 gap-4">
              <FormField label="Nombre completo" className="col-span-2">
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                  className="input-field"
                  autoFocus
                />
              </FormField>
              <FormField label="Teléfono">
                <input
                  type="tel"
                  value={editForm.telefono}
                  onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))}
                  className="input-field"
                />
              </FormField>
              <FormField label="Ruta asignada">
                <select
                  className="input-field"
                  value={editForm.ruta}
                  onChange={e => setEditForm(f => ({ ...f, ruta: e.target.value }))}
                >
                  <option>Sin ruta</option>
                  {['Norte', 'Sur', 'Centro', 'Oriente', 'Poniente'].map(r => <option key={r}>Ruta {r}</option>)}
                </select>
              </FormField>
            </div>
            <ModalFooter onCancel={() => setEditItem(null)} onConfirm={saveEdit} confirmLabel="Guardar cambios" />
        </Modal>
      )}

      {/* ── CONFIRM: Eliminar distribuidor ── */}
      {confirmDel && (
        <ConfirmDialog
          title="¿Eliminar distribuidor?"
          message={`${confirmDel.nombre} (${confirmDel.codigo}) será eliminado permanentemente del sistema.`}
          confirmLabel="Sí, eliminar"
          onConfirm={() => deleteItem(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {/* ── MODAL: Nuevo distribuidor ── */}
      {showModal && (
        <Modal title="Nuevo distribuidor" maxWidth="lg" onClose={() => { setShowModal(false); setNewForm(BLANK_FORM) }}>
            <div className="p-6 grid grid-cols-2 gap-4">
              <FormField label="Nombre completo" className="col-span-2">
                <input
                  type="text"
                  placeholder="Nombre del distribuidor"
                  value={newForm.nombre}
                  onChange={e => setNewForm(f => ({ ...f, nombre: e.target.value }))}
                  className="input-field"
                  autoFocus
                />
              </FormField>
              <FormField label="Teléfono">
                <input
                  type="tel"
                  placeholder="442-000-0000"
                  value={newForm.telefono}
                  onChange={e => setNewForm(f => ({ ...f, telefono: e.target.value }))}
                  className="input-field"
                />
              </FormField>
              <FormField label="Ruta asignada">
                <select
                  className="input-field"
                  value={newForm.ruta}
                  onChange={e => setNewForm(f => ({ ...f, ruta: e.target.value }))}
                >
                  <option>Sin ruta</option>
                  {['Norte', 'Sur', 'Centro', 'Oriente', 'Poniente'].map(r => <option key={r}>Ruta {r}</option>)}
                </select>
              </FormField>
              <FormField label="Lista de precios">
                <select
                  className="input-field"
                  value={newForm.listaPrecio}
                  onChange={e => setNewForm(f => ({ ...f, listaPrecio: e.target.value }))}
                >
                  <option>Lista general</option>
                  <option>Lista distribuidores</option>
                  <option>Lista especial</option>
                </select>
              </FormField>
              <FormField label="Crédito máximo">
                <input
                  type="number"
                  placeholder="$0.00"
                  value={newForm.credito}
                  onChange={e => setNewForm(f => ({ ...f, credito: e.target.value }))}
                  className="input-field"
                />
              </FormField>
            </div>
            <ModalFooter onCancel={() => { setShowModal(false); setNewForm(BLANK_FORM) }} onConfirm={saveNew} confirmLabel="Guardar distribuidor" />
        </Modal>
      )}
    </div>
  )
}
