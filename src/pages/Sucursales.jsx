import { useState, useEffect, useMemo } from 'react'
import { Building2, Plus, MapPin, Users, Monitor, TrendingUp, Edit, Trash2, ToggleLeft, ToggleRight, LayoutGrid, LayoutList, Search, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SkeletonCardGrid } from '../components/Skeleton'
import Badge from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'
import toast from '../utils/toast'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import { sucursales } from '../data/sucursales'
import { fmt } from '../utils/fmt'
import { useLoadDelay } from '../hooks/useLoadDelay'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import Modal from '../components/Modal'
import ModalFooter from '../components/ModalFooter'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import ChartTooltip from '../components/ChartTooltip'

function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className="flex rounded-xl overflow-hidden flex-shrink-0" style={{ border: '1px solid #FDE8D0', height: 36 }}>
      <button onClick={() => setViewMode('table')} title="Vista tabla"
        className="px-3 flex items-center transition-colors"
        style={viewMode === 'table' ? { background: '#F97316', color: '#fff' } : { background: '#F2F3F5', color: '#8FA1B2' }}>
        <LayoutList className="w-4 h-4" />
      </button>
      <button onClick={() => setViewMode('cards')} title="Vista tarjetas"
        className="px-3 flex items-center transition-colors"
        style={{ ...(viewMode === 'cards' ? { background: '#F97316', color: '#fff' } : { background: '#F2F3F5', color: '#8FA1B2' }), borderLeft: '1px solid #FDE8D0' }}>
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function Sucursales() {
  const PER_PAGE = 5
  const loaded = useLoadDelay()
  const [search, setSearch]           = usePersistedState('sucursales-search', '')
  const debouncedSearch = useDebounce(search)
  const [page, setPage]               = useState(1)
  const [showModal, setShowModal]     = useState(false)
  const [viewMode, setViewMode]       = usePersistedState('sucursales-view', 'table')
  const [filterStatus, setFilterStatus] = usePersistedState('sucursales-status', 'Todas')
  const [data, setData]               = useState(sucursales)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editSuc, setEditSuc]         = useState(null)
  const [editForm, setEditForm]       = useState({})
  const [confirmDel, setConfirmDel]   = useState(null)

  const filtered = useMemo(() => data.filter(s =>
    (s.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) || s.admin.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
    (filterStatus === 'Todas' || (filterStatus === 'Activas' ? s.status : !s.status))
  ), [data, debouncedSearch, filterStatus])
  const { sortedByVentas, maxVentas } = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.ventasMes - a.ventasMes)
    return { sortedByVentas: sorted, maxVentas: sorted[0]?.ventasMes || 1 }
  }, [data])
  const getRank = (id) => sortedByVentas.findIndex(s => s.id === id) + 1

  const sucStats = useMemo(() => {
    let activas = 0, inactivas = 0, cajasTotales = 0, ventasMes = 0
    for (const s of data) {
      if (s.status) activas++; else inactivas++
      cajasTotales += s.cajas
      ventasMes    += s.ventasMes
    }
    return { activas, inactivas, cajasTotales, ventasMes }
  }, [data])

  const toggleStatus  = (id) => setData(d => d.map(s => s.id === id ? { ...s, status: !s.status } : s))
  const openEdit      = (s)  => { setEditSuc(s); setEditForm({ nombre: s.nombre, direccion: s.direccion, admin: s.admin }); setShowEditModal(true) }
  const handleSaveEdit = ()  => {
    if (!editForm.nombre.trim()) return
    setData(d => d.map(s => s.id === editSuc.id ? { ...s, ...editForm } : s))
    toast.success('Sucursal actualizada', `${editForm.nombre} fue modificada correctamente`)
    setShowEditModal(false); setEditSuc(null)
  }
  const handleDelete = (s) => {
    const snapshot = [...data]
    setData(d => d.filter(x => x.id !== s.id))
    toast.error('Sucursal eliminada', s.nombre, { label: 'Deshacer', fn: () => setData(snapshot) })
    setConfirmDel(null)
  }

  useEffect(() => { setPage(1) }, [debouncedSearch, filterStatus])
  useEscapeKey(() => { setShowModal(false); setShowEditModal(false) })

  const FilterChips = () => (
    <div className="filter-bar">
      {['Todas', 'Activas', 'Inactivas'].map(f => (
        <button key={f} onClick={() => setFilterStatus(f)} className={`chip ${filterStatus === f ? 'active' : ''}`}>{f}</button>
      ))}
    </div>
  )

  const totalVentas = useMemo(() => filtered.reduce((a, s) => a + s.ventasMes, 0), [filtered])

  return (
    <div className="space-y-4">

      <PageHeader breadcrumb="Sucursales" title="Sucursales"
        subtitle={`${data.length} sucursales · ${sucStats.activas} activas · ${sucStats.inactivas} inactivas`}
      >
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva sucursal
        </button>
      </PageHeader>

      <KpiBar items={[
        { label: 'Total',          value: data.length,             sub: 'sucursales' },
        { label: 'Activas',        value: sucStats.activas,        good: true,                              sub: 'en operación' },
        { label: 'Inactivas',      value: sucStats.inactivas,      alert: sucStats.inactivas > 0,           sub: 'sin operación' },
        { label: 'Cajas totales',  value: sucStats.cajasTotales,   sub: 'registradas' },
        { label: 'Ventas del mes', value: fmt(sucStats.ventasMes), good: true,                              sub: 'todas las sucursales' },
      ]} />

      {/* ══ Resumen visual ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ventas por sucursal */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Ventas del mes por sucursal</span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart data={data.map(s => ({ name: s.nombre.replace('Sucursal ', ''), ventas: s.ventasMes, activa: s.status }))} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#FDE8D0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8FA1B2' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#FFF7ED' }} content={props => <ChartTooltip {...props} format={fmt} />} />
              <Bar dataKey="ventas" radius={[5, 5, 0, 0]}>
                {data.map((s, i) => <Cell key={s.id} fill={!s.status ? '#FDE8D0' : i === 0 ? '#F97316' : '#FDBA74'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Participación */}
        <div className="card p-5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Participación</span>
          </div>
          {(() => {
            const total = sucStats.ventasMes
            return data.map((s, i) => {
              const pct = total ? Math.round(s.ventasMes / total * 100) : 0
              const colors = ['#F97316', '#C2410C', '#059669', '#d97706', '#D4DDE6']
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold w-14 truncate flex-shrink-0" style={{ color: '#627080' }}>{s.nombre.replace('Sucursal ', '')}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: '#FDE8D0' }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: s.status ? colors[i] : '#D4DDE6' }} />
                  </div>
                  <span className="text-[10px] font-bold w-7 text-right flex-shrink-0" style={{ color: s.status ? colors[i] : '#D4DDE6' }}>{pct}%</span>
                </div>
              )
            })
          })()}
          <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #FDE8D0' }}>
            <span className="text-xs" style={{ color: '#8FA1B2' }}>Total mes</span>
            <span className="text-sm font-black" style={{ color: '#F97316' }}>{fmt(sucStats.ventasMes)}</span>
          </div>
        </div>
      </div>

      {/* ── Data section ─────────────────────────────────────── */}
      {!loaded ? <SkeletonCardGrid count={5} /> : <>

        {/* ── CARDS VIEW ── */}
        {viewMode === 'cards' && <>
          <div className="card overflow-hidden">
            <div className="data-toolbar">
              <div className="data-toolbar-row">
                <div style={{ flex: 1, minWidth: 200 }}>
                  <SearchInput value={search} onChange={setSearch}
                    placeholder="Buscar por nombre o administrador..."
                    resultCount={filtered.length} />
                </div>
                <FilterChips />
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
              </div>
              <div className="data-toolbar-footer">
                <div className="toolbar-summary">
                  <span><b>{filtered.length}</b> sucursales</span>
                  <span className="sep">·</span>
                  <span><b>{sucStats.activas}</b> activas</span>
                </div>
                <span className="toolbar-summary">Ventas mes: <b>{fmt(totalVentas)}</b></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s, i) => {
              const rank = getRank(s.id)
              const pct  = Math.round((s.ventasMes / maxVentas) * 100)
              const rankStyle = rank === 1
                ? { background: 'rgba(217,119,6,.12)', color: '#d97706' }
                : rank === 2
                  ? { background: '#F2F3F5', color: '#627080' }
                  : rank === 3
                    ? { background: 'rgba(166,195,218,.2)', color: '#627080' }
                    : { background: '#F2F3F5', color: '#8FA1B2' }
              const adminInitials = s.admin !== 'Sin asignar'
                ? s.admin.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                : '—'
              return (
                <div key={s.id}
                  className="card card-glow p-5 flex flex-col gap-3.5 animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i * 60, 200)}ms`, borderColor: !s.status ? 'rgba(201,122,109,.25)' : undefined }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: s.status ? '#FFF7ED' : 'rgba(201,122,109,.08)' }}>
                        <Building2 className="w-5 h-5" style={{ color: s.status ? '#F97316' : '#C97A6D' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#263442' }}>{s.nombre}</p>
                        <p className="text-xs flex items-center gap-1 truncate mt-0.5" style={{ color: '#8FA1B2' }}>
                          <MapPin className="w-3 h-3 flex-shrink-0" />{s.direccion}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <Badge label={s.status ? 'Activa' : 'Inactiva'} color={s.status ? 'green' : 'red'} />
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black" style={rankStyle}>
                        #{rank}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl p-2.5 text-center" style={{ background: '#FFF7ED' }}>
                      <Monitor className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: '#F97316' }} />
                      <p className="text-xs font-bold leading-none" style={{ color: '#C2410C' }}>{s.cajas}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#627080' }}>Cajas</p>
                    </div>
                    <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(124,58,237,.08)' }}>
                      <Users className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: '#7c3aed' }} />
                      <p className="text-xs font-bold leading-none" style={{ color: '#7c3aed' }}>{s.usuarios}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#627080' }}>Usuarios</p>
                    </div>
                    <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(5,150,105,.08)' }}>
                      <TrendingUp className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: '#059669' }} />
                      <p className="text-[10px] font-bold leading-none" style={{ color: '#059669' }}>{fmt(s.ventasMes)}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#627080' }}>Ventas mes</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] mb-1.5">
                      <span className="font-medium" style={{ color: '#8FA1B2' }}>Participación en ventas</span>
                      <span className="font-bold" style={{ color: '#F97316' }}>{pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill progress-fill-orange" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 border-t pt-3" style={{ borderColor: '#FFF8F0' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        background: s.admin !== 'Sin asignar' ? '#FFF7ED' : '#FFF8F0',
                        color: s.admin !== 'Sin asignar' ? '#F97316' : '#8FA1B2',
                      }}>
                      {adminInitials}
                    </div>
                    <span className="text-xs truncate" style={{ color: '#627080' }}>
                      {s.admin === 'Sin asignar' ? <em style={{ color: '#8FA1B2' }}>Sin administrador</em> : s.admin}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="btn-soft-blue flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1">
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button onClick={() => toggleStatus(s.id)} className="action-btn px-3 rounded-xl"
                      style={s.status ? { color: '#059669' } : { color: '#C97A6D' }} title={s.status ? 'Desactivar' : 'Activar'}>
                      {s.status ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setConfirmDel(s)} className="action-btn danger px-3 rounded-xl" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <EmptyState icon={Search} title="Sin resultados" subtitle="Intenta con otro término o limpia los filtros." className="col-span-full" />
            )}
          </div>
        </>}

        {/* ── TABLE VIEW ── */}
        {viewMode === 'table' && (
          <div className="card overflow-hidden">
            <div className="data-toolbar">
              <div className="data-toolbar-row">
                <div style={{ flex: 1, minWidth: 200 }}>
                  <SearchInput value={search} onChange={setSearch}
                    placeholder="Buscar por nombre o administrador..."
                    resultCount={filtered.length} />
                </div>
                <FilterChips />
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
              </div>
              <div className="data-toolbar-footer">
                <div className="toolbar-summary">
                  <span><b>{filtered.length}</b> sucursales</span>
                  <span className="sep">·</span>
                  <span><b>{sucStats.activas}</b> activas</span>
                </div>
                <span className="toolbar-summary">Ventas mes: <b>{fmt(totalVentas)}</b></span>
              </div>
            </div>

            <div className="section-head">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
                <span className="section-head-text"><strong>Sucursales</strong></span>
                <span style={{ fontSize: '.7rem', color: '#8FA1B2' }}>{filtered.length} encontrada{filtered.length !== 1 ? 's' : ''}</span>
                <span className="badge" style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>{sucStats.activas} activas</span>
                {sucStats.inactivas > 0 && (
                  <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{sucStats.inactivas} inactivas</span>
                )}
              </div>
            </div>

            <div className="table-scroll-wrapper">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Sucursal</th>
                    <th className="hidden md:table-cell">Administrador</th>
                    <th className="hidden lg:table-cell">Cajas</th>
                    <th className="hidden lg:table-cell">Usuarios</th>
                    <th className="hidden xl:table-cell">Ventas mes</th>
                    <th>Estado</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: s.status ? '#FFF7ED' : 'rgba(201,122,109,.1)' }}>
                            <Building2 className="w-4 h-4" style={{ color: s.status ? '#F97316' : '#C97A6D' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#263442' }}>{s.nombre}</p>
                            <p className="text-xs flex items-center gap-1 min-w-0" style={{ color: '#8FA1B2' }}>
                              <MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{s.direccion}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        <p className="text-sm" style={{ color: '#627080' }}>{s.admin}</p>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-sm font-medium" style={{ color: '#627080' }}>{s.cajas}</span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-sm font-medium" style={{ color: '#627080' }}>{s.usuarios}</span>
                      </td>
                      <td className="hidden xl:table-cell">
                        <span className="text-sm font-semibold" style={{ color: '#059669' }}>{fmt(s.ventasMes)}</span>
                      </td>
                      <td>
                        <Badge label={s.status ? 'Activa' : 'Inactiva'} color={s.status ? 'green' : 'gray'} />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(s)} className="action-btn" title="Editar"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => toggleStatus(s.id)} className="action-btn"
                            style={s.status ? { color: '#059669' } : {}} title={s.status ? 'Desactivar' : 'Activar'}>
                            {s.status ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setConfirmDel(s)} className="action-btn danger" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <EmptyState icon={Search} title="Sin resultados" subtitle="Intenta con otro término o limpia los filtros." />
            )}

            <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
            <div className="table-foot-row">
              <p className="total-label">Ventas del mes · todas las sucursales</p>
              <p className="total-value">{fmt(sucStats.ventasMes)}</p>
            </div>
          </div>
        )}

      </>}

      {/* ── Edit modal ─────────────────────────────────────── */}
      {showEditModal && editSuc && (
        <Modal title="Editar sucursal" subtitle={`ID #${editSuc.id}`} maxWidth="lg" onClose={() => setShowEditModal(false)}>
            <div className="p-6 space-y-4">
              <FormField label="Nombre" required>
                <input type="text" value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} className="input-field" autoFocus />
              </FormField>
              <FormField label="Dirección">
                <input type="text" value={editForm.direccion} onChange={e => setEditForm(f => ({ ...f, direccion: e.target.value }))} className="input-field" />
              </FormField>
              <FormField label="Administrador">
                <select value={editForm.admin} onChange={e => setEditForm(f => ({ ...f, admin: e.target.value }))} className="input-field">
                  <option value="Sin asignar">Sin asignar</option>
                  {['Ana Ramos', 'Roberto Silva', 'Lucía Pérez', 'Miguel Torres'].map(a => <option key={a}>{a}</option>)}
                </select>
              </FormField>
            </div>
            <ModalFooter onCancel={() => setShowEditModal(false)} onConfirm={handleSaveEdit} confirmLabel="Guardar cambios" />
        </Modal>
      )}

      {/* ── Confirm delete ─────────────────────────────────── */}
      {confirmDel && (
        <ConfirmDialog
          title="¿Eliminar esta sucursal?"
          message={`"${confirmDel.nombre}" será eliminada del sistema. Podrás deshacer esta acción desde la notificación.`}
          confirmLabel="Sí, eliminar"
          onConfirm={() => handleDelete(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {/* ── Nueva sucursal modal ───────────────────────────── */}
      {showModal && (
        <Modal title="Nueva sucursal" maxWidth="lg" onClose={() => setShowModal(false)}>
            <div className="p-6 space-y-4">
              <FormField label="Nombre de la sucursal">
                <input type="text" placeholder="Ej: Sucursal Centro" className="input-field" autoFocus />
              </FormField>
              <FormField label="Dirección">
                <input type="text" placeholder="Calle, número, colonia" className="input-field" />
              </FormField>
              <FormField label="Teléfono">
                <input type="tel" placeholder="Ej: 442-123-4567" className="input-field" />
              </FormField>
              <FormField label="Correo electrónico">
                <input type="email" placeholder="sucursal@cremeria.mx" className="input-field" />
              </FormField>
              <FormField label="Administrador">
                <select className="input-field">
                  <option>Seleccionar usuario</option>
                  <option>Ana Ramos</option>
                  <option>Roberto Silva</option>
                </select>
              </FormField>
            </div>
            <ModalFooter onCancel={() => setShowModal(false)} onConfirm={() => { toast.success('Sucursal guardada', 'La nueva sucursal fue registrada exitosamente'); setShowModal(false) }} confirmLabel="Guardar sucursal" />
        </Modal>
      )}
    </div>
  )
}
