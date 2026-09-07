import { useState, useRef } from 'react'
import {
  Building, Percent, CreditCard, FileText, Shield, Printer,
  ClipboardList, ChevronRight, Save, Upload, CheckCircle2, X
} from 'lucide-react'
import toast from '../utils/toast'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'

const sections = [
  { id: 'empresa',   label: 'Datos de la empresa',      icon: Building    },
  { id: 'impuestos', label: 'Impuestos y precios',       icon: Percent     },
  { id: 'pagos',     label: 'Métodos de pago',           icon: CreditCard  },
  { id: 'tickets',   label: 'Tickets e impresión',       icon: Printer     },
  { id: 'permisos',  label: 'Permisos por rol',          icon: Shield      },
  { id: 'bitacora',  label: 'Bitácora de acciones',      icon: ClipboardList },
]

const payMethods  = ['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia bancaria', 'Crédito interno']
const roles       = ['Superadministrador', 'Administrador', 'Cajero', 'Distribuidor', 'Encargado de ruta']
const permissions = [
  'Ver ventas', 'Crear ventas', 'Cancelar ventas', 'Autorizar descuentos',
  'Ver inventario', 'Modificar inventario', 'Ver reportes', 'Exportar reportes',
  'Ver usuarios', 'Gestionar usuarios', 'Ver distribuidores',
  'Ver configuración', 'Modificar configuración',
]

const bitacora = [
  { user: 'Carlos Mendoza', action: 'Inició sesión',                       ip: '192.168.1.10', time: '2026-07-29 09:00', type: 'info' },
  { user: 'Ana Ramos',      action: 'Editó sucursal "Centro"',              ip: '192.168.1.22', time: '2026-07-29 09:14', type: 'edit' },
  { user: 'Carlos Mendoza', action: 'Creó usuario "Sandra Ruiz"',           ip: '192.168.1.10', time: '2026-07-29 09:32', type: 'create' },
  { user: 'Roberto Silva',  action: 'Generó reporte de ventas',             ip: '192.168.1.35', time: '2026-07-29 10:05', type: 'report' },
  { user: 'Carlos Mendoza', action: 'Modificó precio de "Queso Oaxaca"',    ip: '192.168.1.10', time: '2026-07-29 10:22', type: 'edit' },
  { user: 'Ana Ramos',      action: 'Registró entrada de inventario',       ip: '192.168.1.22', time: '2026-07-29 11:00', type: 'create' },
  { user: 'Carlos Mendoza', action: 'Bloqueó usuario "Pedro García"',       ip: '192.168.1.10', time: '2026-07-29 11:45', type: 'warn' },
]

const logDot = { info: '#F97316', edit: '#d97706', create: '#059669', report: '#7c3aed', warn: '#C97A6D' }

/* ── Toggle switch ──────────────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-11 h-6 rounded-full relative transition-all duration-200 flex-shrink-0"
      style={{ background: on ? '#F97316' : '#D4DDE6', boxShadow: on ? '0 0 0 3px rgba(249,115,22,.15)' : 'none' }}
    >
      <div
        className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200"
        style={{ left: on ? 'calc(100% - 20px)' : '4px', boxShadow: '0 1px 3px rgba(38,52,66,.12)' }}
      />
    </button>
  )
}

/* ── Setting row (label + toggle) ───────────────────────────── */
function SettingRow({ label, sub, on, onChange }) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl cursor-pointer select-none transition-colors"
      style={{ background: on ? '#FFF7ED' : '#F2F3F5', border: `1px solid ${on ? '#FDBA74' : '#FDE8D0'}` }}
      onClick={onChange}
    >
      <div className="min-w-0 mr-4">
        <p className="text-sm font-semibold" style={{ color: '#263442' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#8FA1B2' }}>{sub}</p>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function Configuracion() {
  const [activeSection,    setActiveSection]    = useState('empresa')
  const [logoSrc,          setLogoSrc]          = useState(null)
  const logoInputRef = useRef(null)
  const [enabledPayments,  setEnabledPayments]  = useState(['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia bancaria'])
  const [selectedRole,     setSelectedRole]     = useState('Cajero')
  const [enabledPerms,     setEnabledPerms]     = useState(['Ver ventas', 'Crear ventas', 'Ver inventario', 'Ver reportes'])
  const [iva,              setIva]              = useState('16')
  const [descMax,          setDescMax]          = useState('15')
  const [preciosConIva,    setPreciosConIva]    = useState(true)
  const [reqAutorizacion,  setReqAutorizacion]  = useState(true)
  const [ticketOpts,       setTicketOpts]       = useState({ logo: true, rfc: true, copia: false })

  const togglePayment = (m) => setEnabledPayments(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])
  const togglePerm    = (p) => setEnabledPerms(ps => ps.includes(p) ? ps.filter(x => x !== p) : [...ps, p])
  const handleGuardar = () => toast.success('Configuración guardada', 'Los cambios fueron aplicados correctamente')

  const isSuperAdmin = selectedRole === 'Superadministrador'

  return (
    <div>

      <PageHeader breadcrumb="Configuración" title="Configuración" subtitle="Personaliza tu sistema Cremerías Admin" />

      {/* ── Mobile horizontal tab nav ── */}
      <div className="lg:hidden mb-2">
        <div className="card overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-1 p-2" style={{ minWidth: 'max-content' }}>
            {sections.map(s => {
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
            {sections.map((s, i) => {
              const active = activeSection === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all"
                  style={{
                    color:      active ? '#C2410C' : '#627080',
                    background: active ? '#FFF7ED' : 'transparent',
                    borderLeft: `3px solid ${active ? '#F97316' : 'transparent'}`,
                    borderBottom: i < sections.length - 1 ? '1px solid #F2F3F5' : 'none',
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
              )
            })}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">

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
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#8FA1B2' }}>
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
                      <Toggle on={on} onChange={() => togglePayment(m)} />
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
                    <input type="text" defaultValue="Cremerías El Rancho" className="input-field" />
                  </FormField>
                  <FormField label="Mensaje de pie">
                    <input type="text" defaultValue="¡Gracias por su compra!" className="input-field" />
                  </FormField>
                  <FormField label="Teléfono en ticket">
                    <input type="tel" defaultValue="442-100-2000" className="input-field" />
                  </FormField>
                  <FormField label="Dirección en ticket">
                    <input type="text" defaultValue="Av. Morelos 145, Centro" className="input-field" />
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
                  <p className="text-xs font-bold uppercase tracking-widest text-center mb-3" style={{ color: '#8FA1B2' }}>
                    Vista previa
                  </p>
                  <div className="bg-white rounded-xl p-4 font-mono text-xs" style={{ color: '#263442', border: '1px solid #FDE8D0', boxShadow: '0 1px 4px rgba(38,52,66,.06)' }}>
                    <p className="text-center font-bold text-sm mb-0.5">CREMERÍAS EL RANCHO</p>
                    <p className="text-center text-[10px]" style={{ color: '#8FA1B2' }}>Av. Morelos 145, Centro</p>
                    <p className="text-center text-[10px]" style={{ color: '#8FA1B2' }}>Tel: 442-100-2000</p>
                    {ticketOpts.rfc && <p className="text-center text-[10px]" style={{ color: '#8FA1B2' }}>RFC: XAXX010101000</p>}
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
                    <p className="text-[10px]" style={{ color: '#8FA1B2' }}>IVA incluido (16%): $17.66</p>
                    <div className="my-2 border-t border-dashed" style={{ borderColor: '#FDE8D0' }} />
                    <p className="text-center font-medium" style={{ color: '#F97316' }}>¡Gracias por su compra!</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button className="btn-primary" onClick={handleGuardar}><Save className="w-4 h-4" /> Guardar configuración</button>
              </div>
            </div>
          )}

          {/* PERMISOS */}
          {activeSection === 'permisos' && (
            <div className="card p-6 animate-fade-in-up">
              <div className="card-header">
                <div>
                  <p className="section-title">Permisos por rol</p>
                  <p className="section-sub">Define qué puede hacer cada tipo de usuario</p>
                </div>
              </div>
              <div className="filter-bar flex-wrap mb-5">
                {roles.map(r => (
                  <button key={r} onClick={() => setSelectedRole(r)} className={`chip ${selectedRole === r ? 'active' : ''}`}>
                    {r}
                  </button>
                ))}
              </div>
              <div
                className="flex items-center gap-3 rounded-xl p-4 mb-5"
                style={{ background: isSuperAdmin ? 'rgba(249,115,22,.07)' : '#F2F3F5', border: `1px solid ${isSuperAdmin ? '#FDBA74' : '#FDE8D0'}` }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isSuperAdmin ? 'rgba(249,115,22,.15)' : '#F2F3F5' }}
                >
                  <Shield className="w-4 h-4" style={{ color: isSuperAdmin ? '#F97316' : '#8FA1B2' }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#263442' }}>Rol: {selectedRole}</p>
                  <p className="text-xs" style={{ color: '#8FA1B2' }}>
                    {isSuperAdmin ? 'Acceso total — todos los permisos activos' : `${enabledPerms.length} de ${permissions.length} permisos activos`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {permissions.map(p => {
                  const on = isSuperAdmin || enabledPerms.includes(p)
                  return (
                    <div
                      key={p}
                      onClick={() => !isSuperAdmin && togglePerm(p)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                      style={{
                        background:  on ? 'rgba(5,150,105,.08)' : '#F2F3F5',
                        borderColor: on ? 'rgba(5,150,105,.22)' : '#FDE8D0',
                        cursor:      isSuperAdmin ? 'default' : 'pointer',
                        opacity:     isSuperAdmin ? 0.85 : 1,
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: on ? '#059669' : '#FDE8D0', border: `1.5px solid ${on ? '#059669' : '#D4DDE6'}` }}
                      >
                        {on && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-medium" style={{ color: on ? '#059669' : '#627080' }}>{p}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end mt-6">
                <button className="btn-primary" onClick={handleGuardar}><Save className="w-4 h-4" /> Guardar permisos</button>
              </div>
            </div>
          )}

          {/* BITÁCORA */}
          {activeSection === 'bitacora' && (
            <div className="card p-6 animate-fade-in-up">
              <div className="card-header">
                <div>
                  <p className="section-title">Bitácora de acciones</p>
                  <p className="section-sub">{bitacora.length} registros recientes</p>
                </div>
                <button className="btn-soft-blue flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl">
                  <FileText className="w-3.5 h-3.5" /> Exportar
                </button>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-px" style={{ background: '#FDE8D0' }} />
                <div className="space-y-1">
                  {bitacora.map((b, i) => {
                    const color = logDot[b.type] || '#8FA1B2'
                    const initials = b.user.split(' ').map(n => n[0]).join('').slice(0, 2)
                    return (
                      <div
                        key={b.user + b.time}
                        className="flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(i * 40, 200)}ms` }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FFF7ED'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 z-10"
                          style={{ background: `${color}22`, color }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold" style={{ color: '#263442' }}>{b.user}</p>
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                            <p className="text-xs font-medium" style={{ color: '#627080' }}>{b.action}</p>
                          </div>
                          <p className="text-[10px] mt-0.5 font-medium" style={{ color: '#FED7AA' }}>
                            {b.ip} · {b.time}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button className="mt-4 pt-3 w-full text-xs font-semibold flex items-center justify-center gap-1 py-1.5 transition-colors border-t" style={{ color: '#F97316', borderColor: '#F2F3F5' }}>
                Cargar más registros →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
