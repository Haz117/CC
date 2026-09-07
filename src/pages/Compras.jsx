import { useState, useEffect, useMemo } from 'react'
import { ShoppingBag, Plus, Search, Check, Package, DollarSign, Eye, FileText, Edit, Trash2, Building2, Phone, Mail, X, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonTableRows } from '../components/Skeleton'
import Badge from '../components/Badge'
import toast from '../utils/toast'
import SearchInput from '../components/SearchInput'
import ConfirmDialog from '../components/ConfirmDialog'
import PageHeader from '../components/PageHeader'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import { INIT_PROVEEDORES, INIT_ORDENES } from '../data/compras'
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

const statusColor = { Recibida: 'green', 'En tránsito': 'amber', Pendiente: 'gray' }
const pagoColor   = { Pagado: 'green',   Pendiente: 'red',       'Crédito 30d': 'amber' }
const EMPTY_PROV = { nombre: '', rfc: '', contacto: '', telefono: '', email: '', categoria: 'Lácteos' }

export default function Compras() {
  const PER_PAGE = 5
  const loaded = useLoadDelay()
  const [tab,             setTab]             = usePersistedState('compras-tab', 'ordenes')
  const [page,            setPage]            = useState(1)
  const [ordenes,         setOrdenes]         = useState(INIT_ORDENES)
  const [showOrdenModal,  setShowOrdenModal]  = useState(false)
  const [showProvModal,   setShowProvModal]   = useState(false)
  const [editingProv,     setEditingProv]     = useState(null)  // null = new, object = editing
  const [search,          setSearch]          = usePersistedState('compras-search', '')
  const debouncedSearch = useDebounce(search)
  const [proveedores,     setProveedores]     = useState(INIT_PROVEEDORES)
  const [provForm,        setProvForm]        = useState(EMPTY_PROV)
  const [provErrors,      setProvErrors]      = useState({})
  const [ordenErrors,     setOrdenErrors]     = useState({})
  const [ordenForm,       setOrdenForm]       = useState({ proveedor: '', fecha: '', pago: 'Contado', notas: '' })
  const [confirmDelProv,  setConfirmDelProv]  = useState(null)

  const filtered = useMemo(() => ordenes.filter(o =>
    o.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    o.proveedor.toLowerCase().includes(debouncedSearch.toLowerCase())
  ), [ordenes, debouncedSearch])
  const paginatedOrdenes = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page])

  const ordenStats = useMemo(() => {
    let totalGastado = 0, enTransito = 0, recibidas = 0
    let pagadoTotal = 0, pendienteTotal = 0, credito30Total = 0
    let pagadoCount = 0, pendienteCount = 0, credito30Count = 0
    const provMap = {}, provFullMap = {}
    for (const o of ordenes) {
      totalGastado += o.total
      if (o.status === 'En tránsito') enTransito++
      if (o.status === 'Recibida')    recibidas++
      if (o.pago === 'Pagado')       { pagadoTotal += o.total; pagadoCount++ }
      if (o.pago === 'Pendiente')    { pendienteTotal += o.total; pendienteCount++ }
      if (o.pago === 'Crédito 30d') { credito30Total += o.total; credito30Count++ }
      const name = o.proveedor.split(' ').slice(0, 2).join(' ')
      provMap[name] = (provMap[name] || 0) + o.total
      if (!provFullMap[o.proveedor]) provFullMap[o.proveedor] = { count: 0, total: 0 }
      provFullMap[o.proveedor].count++
      provFullMap[o.proveedor].total += o.total
    }
    return {
      totalGastado, enTransito, recibidas,
      pagoRows: [
        { label: 'Pagado',      count: pagadoCount,   total: pagadoTotal,   color: '#059669', bg: 'rgba(5,150,105,.08)' },
        { label: 'Pendiente',   count: pendienteCount, total: pendienteTotal, color: '#C97A6D', bg: 'rgba(201,122,109,.08)' },
        { label: 'Crédito 30d', count: credito30Count, total: credito30Total, color: '#d97706', bg: 'rgba(217,119,6,.08)' },
      ],
      chartData: Object.entries(provMap).map(([name, total]) => ({ name, total })),
      provFullMap,
    }
  }, [ordenes])

  useEffect(() => { setPage(1) }, [debouncedSearch, tab])
  useEscapeKey(() => { setShowOrdenModal(false); setShowProvModal(false) })

  // Open proveedor modal
  const openNewProv = () => {
    setEditingProv(null)
    setProvForm(EMPTY_PROV)
    setProvErrors({})
    setShowProvModal(true)
  }
  const openEditProv = (p) => {
    setEditingProv(p)
    setProvForm({ nombre: p.nombre, rfc: p.rfc, contacto: p.contacto, telefono: p.telefono, email: p.email, categoria: p.categoria })
    setProvErrors({})
    setShowProvModal(true)
  }

  // Validate proveedor form
  const validateProv = () => {
    const errs = {}
    if (!provForm.nombre.trim())    errs.nombre    = 'El nombre es requerido'
    if (!provForm.rfc.trim())       errs.rfc       = 'El RFC es requerido'
    if (!provForm.contacto.trim())  errs.contacto  = 'El contacto es requerido'
    if (!provForm.telefono.trim())  errs.telefono  = 'El teléfono es requerido'
    if (!provForm.email.trim())     errs.email     = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(provForm.email)) errs.email = 'Email inválido'
    return errs
  }

  const handleSaveProv = () => {
    const errs = validateProv()
    if (Object.keys(errs).length > 0) { setProvErrors(errs); return }
    if (editingProv) {
      setProveedores(prev => prev.map(p => p.id === editingProv.id ? { ...p, ...provForm } : p))
      toast.success('Proveedor actualizado', `${provForm.nombre} fue editado correctamente`)
    } else {
      const newProv = { id: Date.now(), ...provForm }
      setProveedores(prev => [...prev, newProv])
      toast.success('Proveedor agregado', `${provForm.nombre} fue registrado`)
    }
    setShowProvModal(false)
  }

  const handleDeleteProv = (p) => {
    const snapshot = [...proveedores]
    setProveedores(prev => prev.filter(x => x.id !== p.id))
    toast.info('Proveedor eliminado', p.nombre, {
      label: 'Deshacer',
      fn: () => setProveedores(snapshot)
    })
  }

  // Validate orden form
  const validateOrden = () => {
    const errs = {}
    if (!ordenForm.proveedor) errs.proveedor = 'Selecciona un proveedor'
    if (!ordenForm.fecha)     errs.fecha     = 'La fecha de entrega es requerida'
    return errs
  }

  const handleSaveOrden = () => {
    const errs = validateOrden()
    if (Object.keys(errs).length > 0) { setOrdenErrors(errs); return }
    toast.success('Orden creada', 'La orden de compra fue enviada al proveedor')
    setShowOrdenModal(false)
    setOrdenForm({ proveedor: '', fecha: '', pago: 'Contado', notas: '' })
    setOrdenErrors({})
  }

  return (
    <div className="space-y-4">

      <PageHeader breadcrumb="Compras" title="Compras" subtitle="Órdenes de compra y proveedores">
        <button onClick={() => { setShowOrdenModal(true); setOrdenErrors({}) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva orden
        </button>
      </PageHeader>
      <KpiBar items={[
        { label: 'Órdenes',      value: ordenes.length,                                                                                sub: 'totales' },
        { label: 'En tránsito',  value: ordenStats.enTransito,                                                                         sub: 'en camino' },
        { label: 'Pagado',       value: fmt(ordenStats.pagoRows[0].total), good: true,                                                 sub: 'pagos al día' },
        { label: 'Pendiente',    value: fmt(ordenStats.pagoRows[1].total + ordenStats.pagoRows[2].total), alert: (ordenStats.pagoRows[1].count + ordenStats.pagoRows[2].count) > 0, sub: 'por pagar' },
        { label: 'Total gastado',value: fmt(ordenStats.totalGastado),                                                                  sub: 'este período' },
      ]} />

      {/* ══ Resumen visual ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gasto por proveedor */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Gasto por proveedor</span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart
              data={ordenStats.chartData}
              barSize={32} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#FDE8D0" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8FA1B2' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#FFF7ED' }} content={props => <ChartTooltip {...props} format={fmt} />} />
              <Bar dataKey="total" radius={[5, 5, 0, 0]} fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de pagos */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Estado de pagos</span>
          </div>
          {ordenStats.pagoRows.map(s => (
            <div key={s.label} className="rounded-xl p-3 flex items-center justify-between" style={{ background: s.bg }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#627080' }}>{s.label}</p>
                <p className="text-[11px]" style={{ color: '#8FA1B2' }}>{s.count} orden{s.count !== 1 ? 'es' : ''}</p>
              </div>
              <span className="text-sm font-black" style={{ color: s.color }}>{fmt(s.total)}</span>
            </div>
          ))}
          <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #FDE8D0' }}>
            <span className="text-xs" style={{ color: '#8FA1B2' }}>Total gastado</span>
            <span className="text-sm font-black" style={{ color: '#F97316' }}>{fmt(ordenStats.totalGastado)}</span>
          </div>
        </div>
      </div>

      {/* ── TAB SWITCHER ── */}
      <div className="inline-flex gap-1 p-1 rounded-2xl mb-5" style={{ background: '#F2F3F5', border: '1px solid #FDE8D0' }}>
        {[['ordenes','Órdenes de compra',FileText],['proveedores','Proveedores',Building2]].map(([key,label,Icon])=>(
          <button
            key={key}
            onClick={()=>setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={tab === key
              ? { background: '#fff', color: '#F97316', boxShadow: '0 1px 4px rgba(194,65,12,.1)', border: '1px solid #FDE8D0' }
              : { background: 'transparent', color: '#8FA1B2', border: '1px solid transparent' }
            }
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      {!loaded ? <SkeletonTableRows /> : <>
      {tab === 'ordenes' && (
        <>
          <div className="card overflow-hidden">
            <div className="data-toolbar">
              <div className="data-toolbar-row">
                <SearchInput value={search} onChange={setSearch} placeholder="Buscar por folio o proveedor..." resultCount={filtered.length} />
              </div>
            </div>
            <div className="section-head">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
                <span className="section-head-text"><strong>Órdenes de Compra</strong></span>
                <span style={{ fontSize: '.7rem', color: '#8FA1B2' }}>{filtered.length} orden{filtered.length !== 1 ? 'es' : ''}</span>
                <span className="badge" style={{ background: 'rgba(217,119,6,.1)', color: '#d97706' }}>{ordenStats.enTransito} en tránsito</span>
                <span className="badge" style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>{ordenStats.recibidas} recibidas</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>{['Orden','Proveedor','Fecha','Items','Total','Estado','Pago','Acciones'].map(h=>(
                    <th key={h} className={
                      h==='Items' ? 'hidden lg:table-cell' :
                      h==='Fecha' ? 'hidden sm:table-cell' :
                      h==='Pago'  ? 'hidden md:table-cell' : ''
                    }>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {paginatedOrdenes.map(o=>(
                    <tr key={o.id}>
                      <td><span className="folio">{o.id}</span></td>
                      <td>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FFF7ED' }}>
                            <ShoppingBag className="w-3.5 h-3.5" style={{ color: '#F97316' }} />
                          </div>
                          <span className="font-medium truncate" style={{ color: '#263442' }}>{o.proveedor}</span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell"><span style={{ color: '#8FA1B2' }}>{o.fecha}</span></td>
                      <td className="hidden lg:table-cell">
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" style={{ color: '#8FA1B2' }} />
                          <span style={{ color: '#627080' }}>{o.items} productos</span>
                        </span>
                      </td>
                      <td><span className="font-bold" style={{ color: '#263442' }}>{fmt(o.total)}</span></td>
                      <td><Badge label={o.status} color={statusColor[o.status]||'gray'} /></td>
                      <td className="hidden md:table-cell"><Badge label={o.pago}   color={pagoColor[o.pago]||'gray'} /></td>
                      <td>
                        <div className="flex gap-1">
                          <button className="action-btn" title="Ver detalle"><Eye className="w-4 h-4" /></button>
                          {o.status==='En tránsito' && (
                            <button
                              className="action-btn"
                              title="Confirmar recepción"
                              style={{ color: '#059669' }}
                              onClick={() => {
                                const snapshot = ordenes.map(x => ({ ...x }))
                                setOrdenes(prev => prev.map(x => x.id === o.id ? { ...x, status: 'Recibida' } : x))
                                toast.success('Recepción confirmada', `${o.id} marcada como recibida`, {
                                  label: 'Deshacer',
                                  fn: () => setOrdenes(snapshot)
                                })
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button className="action-btn" title="Editar"><Edit className="w-4 h-4" /></button>
                          <button className="action-btn danger" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length===0 && (
                    <tr><td colSpan={8}>
                      <EmptyState icon={Search} title="Sin resultados" subtitle="Intenta con otro término de búsqueda." />
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
          </div>
        </>
      )}

      {/* ── PROVEEDORES ── */}
      {tab === 'proveedores' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {proveedores.map((p, i) => {
            const { count: provOrdenesCount = 0, total: provTotal = 0 } = ordenStats.provFullMap[p.nombre] || {}
            return (
            <div key={p.id} className="card card-glow p-5 animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 75, 200)}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#FFF7ED' }}>
                  <ShoppingBag className="w-5 h-5" style={{ color: '#F97316' }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#FFF7ED', color: '#C2410C' }}>
                  {p.categoria}
                </span>
              </div>
              <p className="font-bold mb-0.5" style={{ color: '#263442' }}>{p.nombre}</p>
              <p className="text-xs mb-1 font-mono" style={{ color: '#8FA1B2' }}>{p.rfc}</p>
              <p className="text-xs mb-3" style={{ color: '#627080' }}>{p.contacto}</p>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FED7AA' }} />
                  <p className="text-xs" style={{ color: '#627080' }}>{p.telefono}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FED7AA' }} />
                  <p className="text-xs truncate" style={{ color: '#627080' }}>{p.email}</p>
                </div>
              </div>
              {/* Mini stats row */}
              <div className="grid grid-cols-2 gap-2 mb-4 rounded-xl p-3" style={{ background: '#F2F3F5' }}>
                <div className="text-center">
                  <p className="text-base font-black" style={{ color: '#263442' }}>{provOrdenesCount}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Órdenes</p>
                </div>
                <div className="text-center" style={{ borderLeft: '1px solid #FDE8D0' }}>
                  <p className="text-base font-black" style={{ color: '#F97316' }}>{fmt(provTotal)}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Total</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditProv(p)}
                  className="btn-soft-blue flex-1 py-2 text-xs font-semibold rounded-xl">
                  Editar
                </button>
                <button onClick={() => setConfirmDelProv(p)}
                  className="btn-soft-red flex-1 py-2 text-xs font-semibold rounded-xl">
                  Eliminar
                </button>
              </div>
            </div>
            )
          })}

          {/* Add new */}
          <button onClick={openNewProv}
            className="btn-add-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-2">
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">Agregar proveedor</span>
          </button>
        </div>
      )}
      </>}

      {confirmDelProv && (
        <ConfirmDialog
          title="¿Eliminar proveedor?"
          message={`${confirmDelProv.nombre} será removido permanentemente de la lista de proveedores.`}
          confirmLabel="Sí, eliminar"
          onConfirm={() => { handleDeleteProv(confirmDelProv); setConfirmDelProv(null) }}
          onCancel={() => setConfirmDelProv(null)}
        />
      )}

      {/* ── MODAL: Nueva orden ── */}
      {showOrdenModal && (
        <Modal title="Nueva orden de compra" maxWidth="lg" closeOnOverlay={false} onClose={() => setShowOrdenModal(false)}>
            <div className="p-6 space-y-4">
              <FormField label="Proveedor *" error={ordenErrors.proveedor}>
                <select className="input-field" value={ordenForm.proveedor}
                  onChange={e => { setOrdenForm(f=>({...f,proveedor:e.target.value})); setOrdenErrors(er=>({...er,proveedor:''})) }}
                  style={ordenErrors.proveedor?{borderColor:'#C97A6D'}:{}}
                  autoFocus>
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map(p=><option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                </select>
              </FormField>
              <FormField label="Fecha de entrega esperada *" error={ordenErrors.fecha}>
                <input type="date" className="input-field" value={ordenForm.fecha}
                  onChange={e => { setOrdenForm(f=>({...f,fecha:e.target.value})); setOrdenErrors(er=>({...er,fecha:''})) }}
                  style={ordenErrors.fecha?{borderColor:'#C97A6D'}:{}} />
              </FormField>
              <FormField label="Condición de pago">
                <select className="input-field" value={ordenForm.pago} onChange={e=>setOrdenForm(f=>({...f,pago:e.target.value}))}>
                  <option>Contado</option>
                  <option>Crédito 15 días</option>
                  <option>Crédito 30 días</option>
                </select>
              </FormField>
              <FormField label="Observaciones">
                <textarea rows={2} placeholder="Notas adicionales..." className="input-field resize-none"
                  value={ordenForm.notas} onChange={e=>setOrdenForm(f=>({...f,notas:e.target.value}))} />
              </FormField>
            </div>
            <ModalFooter onCancel={() => setShowOrdenModal(false)} onConfirm={handleSaveOrden} confirmLabel="Crear orden" />
        </Modal>
      )}

      {/* ── MODAL: Proveedor (add/edit) ── */}
      {showProvModal && (
        <Modal title={editingProv ? 'Editar proveedor' : 'Nuevo proveedor'} maxWidth="lg" closeOnOverlay={false} onClose={() => setShowProvModal(false)}>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Empresa *" error={provErrors.nombre}>
                  <input className="input-field" placeholder="Nombre de la empresa" value={provForm.nombre}
                    onChange={e=>{setProvForm(f=>({...f,nombre:e.target.value}));setProvErrors(er=>({...er,nombre:''}))}}
                    style={provErrors.nombre?{borderColor:'#C97A6D'}:{}}
                    autoFocus />
                </FormField>
                <FormField label="RFC *" error={provErrors.rfc}>
                  <input className="input-field" placeholder="RFC de la empresa" value={provForm.rfc}
                    onChange={e=>{setProvForm(f=>({...f,rfc:e.target.value}));setProvErrors(er=>({...er,rfc:''}))}}
                    style={provErrors.rfc?{borderColor:'#C97A6D'}:{}} />
                </FormField>
              </div>
              <FormField label="Contacto *" error={provErrors.contacto}>
                <input className="input-field" placeholder="Nombre del representante" value={provForm.contacto}
                  onChange={e=>{setProvForm(f=>({...f,contacto:e.target.value}));setProvErrors(er=>({...er,contacto:''}))}}
                  style={provErrors.contacto?{borderColor:'#C97A6D'}:{}} />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Teléfono *" error={provErrors.telefono}>
                  <input className="input-field" placeholder="000-000-0000" value={provForm.telefono}
                    onChange={e=>{setProvForm(f=>({...f,telefono:e.target.value}));setProvErrors(er=>({...er,telefono:''}))}}
                    style={provErrors.telefono?{borderColor:'#C97A6D'}:{}} />
                </FormField>
                <FormField label="Categoría">
                  <select className="input-field" value={provForm.categoria} onChange={e=>setProvForm(f=>({...f,categoria:e.target.value}))}>
                    {['Lácteos','Derivados','Insumos','Empaques','Otros'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </FormField>
              </div>
              <FormField label="Email *" error={provErrors.email}>
                <input type="email" className="input-field" placeholder="email@proveedor.com" value={provForm.email}
                  onChange={e=>{setProvForm(f=>({...f,email:e.target.value}));setProvErrors(er=>({...er,email:''}))}}
                  style={provErrors.email?{borderColor:'#C97A6D'}:{}} />
              </FormField>
            </div>
            <ModalFooter onCancel={() => setShowProvModal(false)} onConfirm={handleSaveProv} confirmLabel={editingProv ? 'Guardar cambios' : 'Agregar proveedor'} />
        </Modal>
      )}
    </div>
  )
}
