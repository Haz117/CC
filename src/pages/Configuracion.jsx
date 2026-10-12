import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building, Percent, CreditCard, Printer, ClipboardList, ChevronRight, Save, Upload, X, UserRound, SlidersHorizontal, FlaskConical } from 'lucide-react'
import toast from '../utils/toast'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import { Toggle, SettingRow } from './configuracion/piezas'
import MiCuenta from './configuracion/MiCuenta'
import Sistema from './configuracion/Sistema'
import Bitacora from './configuracion/Bitacora'

// `local: true` marca las secciones que la base todavía no respalda: lo que se cambia ahí no se guarda.
const sections = [
  { id: 'cuenta',    label: 'Mi cuenta',            icon: UserRound},
  { id: 'sistema',   label: 'Sistema y parámetros', icon: SlidersHorizontal},
  { id: 'bitacora',  label: 'Bitácora de acciones', icon: ClipboardList},
  { id: 'empresa',   label: 'Datos de la empresa',  icon: Building, local: true },
  { id: 'impuestos', label: 'Impuestos y precios',  icon: Percent, local: true },
  { id: 'pagos',     label: 'Métodos de pago',      icon: CreditCard, local: true },
  { id: 'tickets',   label: 'Tickets e impresión',  icon: Printer, local: true },
]

const payMethods = ['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia bancaria', 'Crédito interno']

/* ═══════════════════════════════════════════════════════════ */
export default function Configuracion() {
  const [params] = useSearchParams()
  const visibles = sections
  // El menú de perfil abre una sección concreta con ?seccion=
  const [activeSection, setActiveSection] = useState(() => {
    const pedida = params.get('seccion')
    return visibles.some(s => s.id === pedida) ? pedida : 'cuenta'
  })
  const esLocal = sections.find(s => s.id === activeSection)?.local

  const [logoSrc,          setLogoSrc]          = useState(null)
  const logoInputRef = useRef(null)
  const [enabledPayments,  setEnabledPayments]  = useState(['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia bancaria'])
  const [iva,              setIva]              = useState('16')
  const [descMax,          setDescMax]          = useState('15')
  const [preciosConIva,    setPreciosConIva]    = useState(true)
  const [reqAutorizacion,  setReqAutorizacion]  = useState(true)
  const [ticketOpts,       setTicketOpts]       = useState({ logo: true, rfc: true, copia: false })

  /* ── Ticket preview state ── */
  const [ticketNombre,   setTicketNombre]   = useState('Cremerías El Rancho')
  const [ticketMensaje,  setTicketMensaje]  = useState('¡Gracias por su compra!')
  const [ticketTel,      setTicketTel]      = useState('442-100-2000')
  const [ticketDir,      setTicketDir]      = useState('Av. Morelos 145, Centro')
  const ticketRfc = 'XAXX010101000'

  const togglePayment = (m) => setEnabledPayments(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])
  const handleGuardar = () => toast.info('Aún no se guarda en la base', 'Esta sección todavía no tiene tabla: el cambio solo vive en esta pantalla')

  return (
    <div>

      <PageHeader breadcrumb="Configuración" title="Configuración" subtitle="Tu cuenta, la bitácora y los parámetros del sistema" />

      {/* ── Mobile horizontal tab nav ── */}
      <div className="lg:hidden mb-2">
        <div className="card overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-1 p-2" style={{ minWidth: 'max-content' }}>
            {visibles.map(s => {
              const active = activeSection === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                  style={active
                    ? { background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74' }
                    : { color: '#627080', border: '1px solid transparent' }
                  }
                >
                  <s.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: active ? '#F97316' : '#FED7AA' }} />
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">

        {/* ── Desktop vertical section nav ── */}
        <div className="hidden lg:block lg:w-60 flex-shrink-0">
          <div className="card overflow-hidden">
            {visibles.map((s, i) => {
              const active = activeSection === s.id
              return (
                <div key={s.id}>
                  {s.local && !visibles[i - 1]?.local && (
                    <p className="px-4 pt-3 pb-1.5 text-[9px] font-extrabold uppercase tracking-[.14em]" style={{ color: '#7c3aed', background: 'rgba(124,58,237,.05)' }}>
                      Sin conexión a la base
                    </p>
                  )}
                  <button
                    onClick={() => setActiveSection(s.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all"
                    style={{
                      color:      active ? '#C2410C' : '#627080',
                      background: active ? '#FFF7ED' : 'transparent',
                      borderLeft: `3px solid ${active ? '#F97316' : 'transparent'}`,
                      borderBottom: i < visibles.length - 1 ? '1px solid #F2F3F5' : 'none',
                    }}
                  >
                    <s.icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: active ? '#F97316' : '#FED7AA' }}
                    />
                    <span className="flex-1 text-left">{s.label}</span>
                    <ChevronRight
                      className="w-3.5 h-3.5"
                      style={{ color: active ? '#F97316' : '#D4DDE6', transform: active ? 'translateX(1px)' : 'none' }}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">

          {activeSection === 'cuenta'   && <MiCuenta />}
          {activeSection === 'sistema'  && <Sistema />}
          {activeSection === 'bitacora' && <Bitacora />}

          {esLocal && (
            <div role="note" className="flex items-start gap-3 rounded-2xl px-4 py-3.5 mb-4" style={{ background: 'rgba(124,58,237,.06)', border: '1px solid rgba(124,58,237,.22)' }}>
              <FlaskConical className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#7c3aed' }}>Vista previa: esta sección todavía no se guarda</p>
                <p className="text-xs mt-0.5" style={{ color: '#627080' }}>
                  La base no tiene tablas para estos ajustes, así que lo que cambies aquí no llega a las cajas.
                </p>
              </div>
            </div>
          )}

          {/* EMPRESA */}
          {activeSection === 'empresa' && (
            <div className="card p-6 animate-fade-in-up">
              <div className="card-header">
                <div>
                  <p className="section-title">Datos de la empresa</p>
                  <p className="section-sub">Información fiscal y de contacto</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const url = URL.createObjectURL(file)
                        setLogoSrc(url)
                        toast.success('Logo actualizado', file.name)
                      }
                    }}
                  />
                  <div
                    className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden flex-shrink-0"
                    style={{ background: logoSrc ? 'transparent' : '#FFF7ED', border: '2px dashed #FED7AA' }}
                    onClick={() => logoInputRef.current?.click()}
                    onMouseEnter={e => { if (!logoSrc) { e.currentTarget.style.borderColor='#F97316'; e.currentTarget.style.background='#FDBA74' } }}
                    onMouseLeave={e => { if (!logoSrc) { e.currentTarget.style.borderColor='#FED7AA'; e.currentTarget.style.background='#FFF7ED' } }}
                  >
                    {logoSrc
                      ? <img src={logoSrc} alt="Logo" className="w-full h-full object-contain" />
                      : <>
                          <Upload className="w-6 h-6 mb-1" style={{ color: '#F97316' }} />
                          <span className="text-xs font-semibold" style={{ color: '#F97316' }}>Subir logo</span>
                        </>
                    }
                  </div>
                  {logoSrc && (
                    <button
                      onClick={() => { setLogoSrc(null); if (logoInputRef.current) logoInputRef.current.value = '' }}
                      className="text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors"
                      style={{ color: '#C97A6D', background: 'rgba(201,122,109,.1)' }}
                    >
                      <X className="w-3 h-3" /> Quitar
                    </button>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nombre de la empresa">
                    <input type="text" defaultValue="Cremerías El Rancho" className="input-field" />
                  </FormField>
                  <FormField label="RFC">
                    <input type="text" defaultValue="XAXX010101000" className="input-field" />
                  </FormField>
                  <FormField label="Dirección fiscal" className="sm:col-span-2">
                    <input type="text" defaultValue="Calle Morelos 145, Centro" className="input-field" />
                  </FormField>
                  <FormField label="Teléfono">
                    <input type="tel" defaultValue="442-100-2000" className="input-field" />
                  </FormField>
                  <FormField label="Correo">
                    <input type="email" defaultValue="admin@cremeria.mx" className="input-field" />
                  </FormField>
                  <FormField label="Sitio web">
                    <input type="url" defaultValue="www.cremeria.mx" className="input-field" />
                  </FormField>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary" onClick={handleGuardar}>
                  <Save className="w-4 h-4" /> Guardar cambios
                </button>
              </div>
            </div>
          )}

          {/* IMPUESTOS */}
          {activeSection === 'impuestos' && (
            <div className="card p-6 animate-fade-in-up">
              <div className="card-header">
                <div>
                  <p className="section-title">Impuestos y política de precios</p>
                  <p className="section-sub">Parámetros aplicados a todas las ventas</p>
                </div>
              </div>
              <div className="space-y-5 max-w-md">
                <FormField label="IVA aplicado">
                  <div className="filter-bar">
                    {['0', '8', '16'].map(v => (
                      <button key={v} onClick={() => setIva(v)} className={`chip flex-1 ${iva === v ? 'active' : ''}`}>
                        {v}%
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Descuento máximo (%)">
                  <input
                    type="number" value={descMax}
                    onChange={e => setDescMax(e.target.value)}
                    min="0" max="100" className="input-field"
                  />
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#627080' }}>
                    Los cajeros no podrán superar este porcentaje sin autorización
                  </p>
                </FormField>
                <SettingRow
                  label="Precio con IVA incluido"
                  sub="Mostrar precios al público con IVA ya incluido"
                  on={preciosConIva}
                  onChange={() => setPreciosConIva(v => !v)}
                />
                <SettingRow
                  label="Requerir autorización para descuentos"
                  sub="Cajeros necesitan aprobación del administrador"
                  on={reqAutorizacion}
                  onChange={() => setReqAutorizacion(v => !v)}
                />
              </div>
              <div className="flex justify-end mt-6">
                <button className="btn-primary" onClick={handleGuardar}><Save className="w-4 h-4" /> Guardar cambios</button>
              </div>
            </div>
          )}

          {/* PAGOS */}
          {activeSection === 'pagos' && (
            <div className="card p-6 animate-fade-in-up">
              <div className="card-header">
                <div>
                  <p className="section-title">Métodos de pago aceptados</p>
                  <p className="section-sub">{enabledPayments.length} de {payMethods.length} habilitados</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {payMethods.map(m => {
                  const on = enabledPayments.includes(m)
                  return (
                    <div
                      key={m}
                      onClick={() => togglePayment(m)}
                      className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all"
                      style={{
                        background:   on ? '#FFF7ED' : '#F2F3F5',
                        borderColor:  on ? '#FDBA74' : '#FDE8D0',
                        opacity:      on ? 1 : 0.65,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: on ? 'rgba(249,115,22,.15)' : '#F2F3F5' }}
                        >
                          <CreditCard className="w-4 h-4" style={{ color: on ? '#F97316' : '#8FA1B2' }} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: on ? '#263442' : '#627080' }}>{m}</span>
                      </div>
                      <Toggle on={on} onChange={() => togglePayment(m)} etiqueta={m} />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end mt-6">
                <button className="btn-primary" onClick={handleGuardar}><Save className="w-4 h-4" /> Guardar cambios</button>
              </div>
            </div>
          )}

          {/* TICKETS */}
          {activeSection === 'tickets' && (
            <div className="card p-6 animate-fade-in-up">
              <div className="card-header">
                <div>
                  <p className="section-title">Configuración de tickets e impresión</p>
                  <p className="section-sub">Personalización del comprobante de venta</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField label="Encabezado del ticket">
                    <input type="text" value={ticketNombre} onChange={e => setTicketNombre(e.target.value)} className="input-field" />
                  </FormField>
                  <FormField label="Mensaje de pie">
                    <input type="text" value={ticketMensaje} onChange={e => setTicketMensaje(e.target.value)} className="input-field" />
                  </FormField>
                  <FormField label="Teléfono en ticket">
                    <input type="tel" value={ticketTel} onChange={e => setTicketTel(e.target.value)} className="input-field" />
                  </FormField>
                  <FormField label="Dirección en ticket">
                    <input type="text" value={ticketDir} onChange={e => setTicketDir(e.target.value)} className="input-field" />
                  </FormField>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Mostrar logotipo',          key: 'logo'  },
                      { label: 'Mostrar RFC',                key: 'rfc'   },
                      { label: 'Imprimir copia del cliente', key: 'copia' },
                    ].map(({ label, key }) => (
                      <SettingRow
                        key={key}
                        label={label}
                        on={ticketOpts[key]}
                        onChange={() => setTicketOpts(o => ({ ...o, [key]: !o[key] }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Ticket preview */}
                <div
                  className="rounded-2xl p-4"
                  style={{ background: '#F2F3F5', border: '1.5px dashed #D4DDE6' }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: '#627080' }}>
                    Vista previa
                  </p>
                  <div className="bg-white rounded-xl p-4 font-mono text-xs" style={{ color: '#263442', border: '1px solid #FDE8D0', boxShadow: '0 1px 4px rgba(38,52,66,.06)' }}>
                    <p className="text-center font-bold text-sm mb-0.5">{ticketNombre || 'Nombre de empresa'}</p>
                    <p className="text-center text-[10px]" style={{ color: '#627080' }}>{ticketDir || 'Dirección'}</p>
                    <p className="text-center text-[10px]" style={{ color: '#627080' }}>Tel: {ticketTel || '—'}</p>
                    {ticketOpts.rfc && <p className="text-center text-[10px]" style={{ color: '#627080' }}>RFC: {ticketRfc || '—'}</p>}
                    <div className="my-2 border-t border-dashed" style={{ borderColor: '#FDE8D0' }} />
                    <p>Venta: V-00522</p>
                    <p>Fecha: 29/07/2026 09:45</p>
                    <p>Cajero: María López</p>
                    <p>Caja: Caja 1 - Centro</p>
                    <div className="my-2 border-t border-dashed" style={{ borderColor: '#FDE8D0' }} />
                    <p>Queso Oaxaca 500g x2 &nbsp;$90.00</p>
                    <p>Crema Ácida 1L x1 &nbsp;&nbsp;&nbsp;&nbsp;$38.00</p>
                    <div className="my-2 border-t border-dashed" style={{ borderColor: '#FDE8D0' }} />
                    <p className="font-bold" style={{ color: '#C2410C' }}>TOTAL: $128.00</p>
                    <p className="text-[10px]" style={{ color: '#627080' }}>IVA incluido (16%): $17.66</p>
                    <div className="my-2 border-t border-dashed" style={{ borderColor: '#FDE8D0' }} />
                    <p className="text-center font-medium" style={{ color: '#F97316' }}>{ticketMensaje || 'Mensaje de pie'}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button className="btn-primary" onClick={handleGuardar}><Save className="w-4 h-4" /> Guardar configuración</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
