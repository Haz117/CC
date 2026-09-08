import { useState, useEffect, useMemo } from 'react'
import { Monitor, Plus, DollarSign, ArrowUpCircle, ArrowDownCircle, Eye, Scissors, TrendingUp, User, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SkeletonCardGrid } from '../components/Skeleton'
import Badge from '../components/Badge'
import toast from '../utils/toast'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import KpiBar from '../components/KpiBar'
import { cajas } from '../data/cajas'
import { fmt } from '../utils/fmt'
import { useLoadDelay } from '../hooks/useLoadDelay'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import Modal from '../components/Modal'
import ModalFooter from '../components/ModalFooter'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import InfoCell from '../components/InfoCell'
import ChartTooltip from '../components/ChartTooltip'

const statusColor = { Abierta: 'green', Cerrada: 'gray', Inactiva: 'red' }
const iconStyle = {
  Abierta:  { bg: '#FFF7ED', color: '#F97316' },
  Cerrada:  { bg: '#FFF8F0', color: '#8FA1B2' },
  Inactiva: { bg: 'rgba(201,122,109,.08)', color: '#C97A6D' },
}

export default function Cajas() {
  const loaded = useLoadDelay()
  const [search, setSearch]           = usePersistedState('cajas-search', '')
  const debouncedSearch = useDebounce(search)
  const [showModal, setShowModal]     = useState(false)
  const [filterStatus, setFilterStatus] = usePersistedState('cajas-status', 'Todas')
  const [selectedCaja, setSelectedCaja] = useState(null)
  const [showCorte, setShowCorte]     = useState(null)
  const [data, setData]               = useState(cajas)

  const filtered = useMemo(() => data.filter(c =>
    (c.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) || c.sucursal.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
    (filterStatus === 'Todas' || c.status === filterStatus)
  ), [data, debouncedSearch, filterStatus])

  const counts = useMemo(() => {
    let abiertas = 0, cerradas = 0, inactivas = 0, totalDia = 0
    for (const c of data) {
      if (c.status === 'Abierta')   abiertas++
      else if (c.status === 'Cerrada')   cerradas++
      else if (c.status === 'Inactiva')  inactivas++
      totalDia += c.ventasDia
    }
    return { abiertas, cerradas, inactivas, totalDia }
  }, [data])

  const registrarCorte = (c) => {
    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
    setData(d => d.map(x => x.id === c.id ? { ...x, status: 'Cerrada', corte: hora } : x))
    toast.success('Corte registrado', `${c.nombre} · Suc. ${c.sucursal} · ${fmt(c.ventasDia + c.ingresos - c.retiros)}`)
    setShowCorte(null)
    setSelectedCaja(null)
  }

  useEscapeKey(() => { setShowModal(false); setSelectedCaja(null); setShowCorte(null) })

  const { abiertas, cerradas, inactivas, totalDia } = counts

  return (
    <div className="space-y-6">

      <PageHeader
        breadcrumb="Cajas"
        title="Control de Cajas"
        subtitle={`${abiertas} abiertas · ${cerradas} cerradas · ${inactivas} inactivas`}
      >
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva caja
        </button>
      </PageHeader>

      <KpiBar items={[
        { label: 'Abiertas',      value: abiertas,  good: true,             sub: 'en operación' },
        { label: 'Cerradas',      value: cerradas,                          sub: 'con corte' },
        { label: 'Inactivas',     value: inactivas, alert: inactivas > 0,   sub: 'sin cajero' },
        { label: 'Total del día', value: fmt(totalDia), good: true,         sub: 'ventas acumuladas' },
      ]} />

      {/* ══ Resumen visual ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Ventas por caja */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Ventas del día por caja</span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart data={data.map(c => ({ name: c.nombre, total: c.ventasDia, status: c.status }))} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#FDE8D0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8FA1B2' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#FFF7ED' }} content={props => <ChartTooltip {...props} format={fmt} />} />
              <Bar dataKey="total" radius={[5, 5, 0, 0]}>
                {data.map((c, i) => {
                  if (c.status === 'Inactiva') return <Cell key={c.id} fill="#FDE8D0" />
                  const maxV = Math.max(...data.filter(x => x.status !== 'Inactiva').map(x => x.ventasDia))
                  const ratio = c.ventasDia / maxV
                  const fill = ratio >= 0.8 ? '#059669' : ratio >= 0.5 ? '#d97706' : '#C97A6D'
                  return <Cell key={c.id} fill={fill} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de cajas */}
        <div className="card p-5 flex flex-col lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Estado de cajas</span>
          </div>
          <div className="flex flex-col gap-3 flex-1 justify-center">
            {[
              { label: 'Abiertas',  count: abiertas,  color: '#059669', bg: 'rgba(5,150,105,.1)' },
              { label: 'Cerradas',  count: cerradas,  color: '#8FA1B2', bg: '#F2F3F5' },
              { label: 'Inactivas', count: inactivas, color: '#C97A6D', bg: 'rgba(201,122,109,.1)' },
            ].map(s => {
              const pct = Math.round(s.count / data.length * 100)
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                    <span className="text-xs font-black" style={{ color: s.color }}>{s.count}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: '#627080' }}>{s.label}</span>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#FDE8D0' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #FDE8D0' }}>
            <span className="text-xs" style={{ color: '#8FA1B2' }}>Total acumulado</span>
            <span className="text-sm font-black" style={{ color: '#F97316' }}>{fmt(totalDia)}</span>
          </div>
        </div>
      </div>

      {/* Toolbar card */}
      <div className="card overflow-hidden">
        <div className="data-toolbar">
          <div className="data-toolbar-row">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar caja o sucursal..." resultCount={filtered.length} />
            <div className="filter-bar">
              {['Todas', 'Abierta', 'Cerrada', 'Inactiva'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`chip ${filterStatus === s ? 'active' : ''}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="section-head">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="section-head-text"><strong>Cajas</strong></span>
            <span className="badge" style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>{abiertas} abiertas</span>
            <span className="badge" style={{ background: 'rgba(143,161,178,.12)', color: '#627080' }}>{cerradas} cerradas</span>
            {inactivas > 0 && (
              <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{inactivas} inactivas</span>
            )}
          </div>
        </div>
      </div>

      {/* Caja cards grid */}
      {!loaded ? <SkeletonCardGrid count={6} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c, i) => {
            const saldo   = c.ventasDia + c.ingresos - c.retiros
            const metaPct = Math.min(100, Math.round((c.ventasDia / 20000) * 100))
            const isActive   = c.status === 'Abierta'
            const ist        = iconStyle[c.status]
            return (
              <div
                key={c.id}
                className="card p-5 flex flex-col gap-3 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 60, 200)}ms` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ist.bg }}>
                      <Monitor className="w-5 h-5" style={{ color: ist.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold leading-tight truncate" style={{ color: '#263442' }}>{c.nombre}</p>
                      <p className="text-xs truncate" style={{ color: '#8FA1B2' }}>Suc. {c.sucursal}</p>
                    </div>
                  </div>
                  <Badge label={c.status} color={statusColor[c.status]} />
                </div>

                {/* Saldo prominente */}
                <div>
                  <p style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: '#8FA1B2', marginBottom: '2px' }}>Saldo estimado</p>
                  <p className="font-black leading-none" style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.55rem)', color: isActive ? '#C2410C' : '#627080', letterSpacing: '-.03em' }}>
                    {fmt(saldo)}
                  </p>
                </div>

                {/* Mini stats: Ventas / Ingresos / Retiros */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Ventas',   value: fmt(c.ventasDia),        color: '#059669', bg: 'rgba(5,150,105,.08)'    },
                    { label: 'Ingresos', value: `+${fmt(c.ingresos)}`,   color: '#F97316', bg: '#FFF7ED'                },
                    { label: 'Retiros',  value: `-${fmt(c.retiros)}`,    color: '#C97A6D', bg: 'rgba(201,122,109,.08)' },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg px-2 py-1.5" style={{ background: item.bg }}>
                      <p style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#8FA1B2' }}>{item.label}</p>
                      <p className="font-bold truncate" style={{ fontSize: '.75rem', color: item.color, marginTop: '1px' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Cajero + apertura */}
                <div className="flex items-center gap-4 text-xs" style={{ borderTop: '1px solid #FFF8F0', paddingTop: '10px' }}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-3 h-3 flex-shrink-0" style={{ color: '#FED7AA' }} />
                    <span className="truncate" style={{ color: '#627080' }}>{c.cajero}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Clock className="w-3 h-3" style={{ color: '#FED7AA' }} />
                    <span style={{ color: '#627080' }}>{c.apertura}</span>
                  </div>
                </div>

                {/* Progress vs meta (solo cajas abiertas) */}
                {isActive && (
                  <div>
                    <div className="flex justify-between mb-1" style={{ fontSize: '10px', color: '#8FA1B2' }}>
                      <span>Avance vs meta $20K</span>
                      <span className="font-bold" style={{ color: metaPct >= 100 ? '#059669' : '#F97316' }}>{metaPct}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${metaPct >= 100 ? 'progress-fill-green' : 'progress-fill-orange'} transition-all duration-700`}
                        style={{ width: `${metaPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 mt-auto pt-1">
                  <button
                    onClick={() => setSelectedCaja(c)}
                    className="btn-soft-blue flex-1 py-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver detalle
                  </button>
                  {isActive && (
                    <button
                      onClick={() => setShowCorte(c)}
                      className="btn-soft-teal flex-1 py-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1"
                    >
                      <Scissors className="w-3.5 h-3.5" /> Corte
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <EmptyState icon={Monitor} title="Sin cajas" subtitle="No hay cajas que coincidan con el filtro seleccionado." className="col-span-full" />
          )}
        </div>
      )}

      {/* Modal detalle de caja */}
      {selectedCaja && (
        <Modal onClose={() => setSelectedCaja(null)} header={<div><div className="flex items-center gap-2"><h3 className="font-bold" style={{ color: '#263442' }}>{selectedCaja.nombre}</h3><Badge label={selectedCaja.status} color={statusColor[selectedCaja.status]} /></div><p className="text-xs mt-0.5" style={{ color: '#8FA1B2' }}>Suc. {selectedCaja.sucursal}</p></div>}>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Cajero',       value: selectedCaja.cajero },
                  { label: 'Apertura',     value: selectedCaja.apertura },
                  { label: 'Último corte', value: selectedCaja.corte },
                ].map(item => (
                  <InfoCell key={item.label} label={item.label} value={item.value} center />
                ))}
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #FDE8D0' }}>
                <div className="px-4 py-2.5" style={{ background: '#F2F3F5', borderBottom: '1px solid #FDE8D0' }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Resumen del día</p>
                </div>
                <div className="divide-y" style={{ borderColor: '#FDE8D0' }}>
                  {[
                    { label: 'Ventas del día', value: fmt(selectedCaja.ventasDia),            color: '#059669', icon: TrendingUp },
                    { label: 'Ingresos (+)',   value: `+${fmt(selectedCaja.ingresos)}`,        color: '#F97316', icon: ArrowUpCircle },
                    { label: 'Retiros (−)',    value: `-${fmt(selectedCaja.retiros)}`,          color: '#C97A6D', icon: ArrowDownCircle },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: item.color }} />
                        <span className="text-sm" style={{ color: '#627080' }}>{item.label}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3.5" style={{ background: '#FFF7ED' }}>
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: '#C2410C' }} />
                      <span className="text-sm font-bold" style={{ color: '#263442' }}>Saldo estimado en caja</span>
                    </div>
                    <span className="text-base font-black" style={{ color: '#C2410C' }}>
                      {fmt(selectedCaja.ventasDia + selectedCaja.ingresos - selectedCaja.retiros)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedCaja.status === 'Abierta' && (
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: '#8FA1B2' }}>
                    <span>Avance vs meta del día</span>
                    <span className="font-semibold">{Math.round((selectedCaja.ventasDia / 20000) * 100)}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill progress-fill-orange transition-all duration-700"
                      style={{ width: `${Math.min(100, (selectedCaja.ventasDia / 20000) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#8FA1B2' }}>Meta diaria: {fmt(20000)}</p>
                </div>
              )}

              {selectedCaja.status === 'Inactiva' && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(201,122,109,.07)', border: '1px solid rgba(201,122,109,.2)' }}>
                  <Monitor className="w-4 h-4 flex-shrink-0" style={{ color: '#C97A6D' }} />
                  <p className="text-xs font-semibold" style={{ color: '#A05A52' }}>Caja inactiva — sin cajero asignado</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 flex justify-between gap-3" style={{ borderTop: '1px solid #FDE8D0' }}>
              <button onClick={() => setSelectedCaja(null)} className="btn-secondary">Cerrar</button>
              {selectedCaja.status === 'Abierta' && (
                <button
                  className="btn-primary"
                  style={{ background: '#059669' }}
                  onClick={() => { setShowCorte(selectedCaja); setSelectedCaja(null) }}
                >
                  <Scissors className="w-4 h-4" /> Registrar corte de caja
                </button>
              )}
            </div>
        </Modal>
      )}

      {/* Modal corte de caja */}
      {showCorte && (
        <Modal maxWidth="sm" onClose={() => setShowCorte(null)} header={<div><div className="flex items-center gap-2"><h3 className="font-bold" style={{ color: '#263442' }}>Registrar corte</h3><span className="chip active">{showCorte.nombre}</span></div><p className="text-xs mt-0.5" style={{ color: '#8FA1B2' }}>Suc. {showCorte.sucursal} · {showCorte.cajero}</p></div>}>
            <div className="p-6 space-y-3">
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #FDE8D0' }}>
                <div className="px-4 py-2.5" style={{ background: '#F2F3F5', borderBottom: '1px solid #FDE8D0' }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Resumen del turno</p>
                </div>
                {[
                  { label: 'Ventas del día', value: fmt(showCorte.ventasDia),         color: '#059669' },
                  { label: 'Ingresos (+)',   value: `+${fmt(showCorte.ingresos)}`,     color: '#F97316' },
                  { label: 'Retiros (−)',    value: `-${fmt(showCorte.retiros)}`,       color: '#C97A6D' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #FDE8D0' }}>
                    <span className="text-sm" style={{ color: '#627080' }}>{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3.5" style={{ background: '#FFF7ED' }}>
                  <span className="text-sm font-bold" style={{ color: '#263442' }}>Saldo en caja</span>
                  <span className="text-lg font-black" style={{ color: '#C2410C' }}>
                    {fmt(showCorte.ventasDia + showCorte.ingresos - showCorte.retiros)}
                  </span>
                </div>
              </div>
            </div>
            <ModalFooter
              onCancel={() => setShowCorte(null)}
              onConfirm={() => registrarCorte(showCorte)}
              confirmLabel={<><Scissors className="w-4 h-4" /> Confirmar corte</>}
              confirmStyle={{ background: '#059669' }}
            />
        </Modal>
      )}

      {/* Modal nueva caja */}
      {showModal && (
        <Modal title="Registrar nueva caja" onClose={() => setShowModal(false)}>
            <div className="p-6 space-y-4">
              <FormField label="Nombre de la caja">
                <input type="text" placeholder="Ej: Caja 7" className="input-field" />
              </FormField>
              <FormField label="Sucursal">
                <select className="input-field">
                  <option>Seleccionar sucursal</option>
                  <option>Centro</option>
                  <option>Norte</option>
                  <option>Sur</option>
                  <option>Oriente</option>
                  <option>Poniente</option>
                </select>
              </FormField>
              <FormField label="Serie / Identificador">
                <input type="text" placeholder="Ej: CAJA-007" className="input-field" />
              </FormField>
            </div>
            <ModalFooter onCancel={() => setShowModal(false)} onConfirm={() => { toast.success('Caja registrada', 'La nueva caja fue agregada al sistema'); setShowModal(false) }} confirmLabel="Guardar caja" />
        </Modal>
      )}
    </div>
  )
}
