import { useState, useEffect, useMemo, useRef } from 'react'
import { Users, Plus, Search, Shield, Edit, Trash2, Lock, Unlock, KeyRound, Eye, AlertTriangle, UserX, Mail, Building2, Clock, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonTableRows, SkeletonCardGrid } from '../components/Skeleton'
import Badge from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'
import toast from '../utils/toast'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import { INIT_USUARIOS, roles, sucursalesOpts as sucursales } from '../data/usuarios'
import { useLoadDelay } from '../hooks/useLoadDelay'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import Modal from '../components/Modal'
import ModalFooter from '../components/ModalFooter'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import AlertBanner from '../components/AlertBanner'
import ChartTooltip from '../components/ChartTooltip'

const roleColor = {
  'Superadmin':       'purple',
  'Administrador':    'blue',
  'Cajero':           'teal',
  'Distribuidor':     'amber',
  'Encargado de ruta':'green',
}

const avatarBg = {
  'Superadmin':        { bg: 'rgba(124,58,237,.12)', color: '#7c3aed' },
  'Administrador':     { bg: '#FFF7ED',              color: '#F97316' },
  'Cajero':            { bg: 'rgba(5,150,105,.1)',   color: '#059669' },
  'Distribuidor':      { bg: 'rgba(217,119,6,.1)',   color: '#d97706' },
  'Encargado de ruta': { bg: '#F2F3F5',              color: '#627080' },
}

export default function Usuarios() {
  const BLANK_USER = { nombre: '', email: '', telefono: '', rol: 'Cajero', sucursal: 'Centro', password: '' }
  const PER_PAGE = 6

  const loaded = useLoadDelay()
  const [search, setSearch]             = usePersistedState('usuarios-search', '')
  const debouncedSearch = useDebounce(search)
  const [filterRol, setFilterRol]       = usePersistedState('usuarios-rol', 'Todos')
  const [page, setPage]                 = useState(1)
  const [showModal, setShowModal]       = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editUser, setEditUser]         = useState(null)
  const [editForm, setEditForm]         = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirmBlock, setConfirmBlock] = useState(null)
  const [data, setData]                 = useState(INIT_USUARIOS)
  const [nuevoForm, setNuevoForm]       = useState(BLANK_USER)
  const [nuevoErrors, setNuevoErrors]   = useState({})
  const [shake, setShake]               = useState(false)
  const shakeTimer = useRef(null)

  const openEdit = (u) => {
    setEditUser(u)
    setEditForm({ nombre: u.nombre, email: u.email, rol: u.rol, sucursal: u.sucursal })
    setShowEditModal(true)
    setSelectedUser(null)
  }

  const handleSaveEdit = () => {
    if (!editForm.nombre.trim() || !editForm.email.trim()) return
    setData(d => d.map(u => u.id === editUser.id ? { ...u, ...editForm } : u))
    toast.success('Usuario actualizado', `${editForm.nombre} fue modificado correctamente`)
    setShowEditModal(false)
    setEditUser(null)
  }

  const filtered = useMemo(() => data.filter(u =>
    (u.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) || u.email.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
    (filterRol === 'Todos' || u.rol === filterRol)
  ), [data, debouncedSearch, filterRol])
  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page])

  const { bloqueados, activosCount, roleCounts, sucursalCounts } = useMemo(() => {
    const bloqueados = data.filter(u => u.status === 'Bloqueado')
    const activosCount = data.length - bloqueados.length
    const roleCounts = Object.fromEntries(roles.map(r => [r, data.filter(u => u.rol === r).length]))
    const sucursalCounts = Object.fromEntries(
      ['Centro', 'Norte', 'Sur', 'Oriente', 'Global'].map(suc => [suc, data.filter(u => u.sucursal === suc).length])
    )
    return { bloqueados, activosCount, roleCounts, sucursalCounts }
  }, [data])

  const toggleBlock = (id) => {
    setData(d => d.map(u => u.id === id ? { ...u, status: u.status === 'Activo' ? 'Bloqueado' : 'Activo' } : u))
    const u = data.find(u => u.id === id)
    if (u?.status === 'Activo')
      toast.error('Usuario bloqueado', `${u.nombre} ya no puede acceder al sistema`)
    else
      toast.success('Usuario desbloqueado', `${u?.nombre} puede acceder nuevamente`)
  }

  useEffect(() => { setPage(1) }, [debouncedSearch, filterRol])
  useEscapeKey(() => { setShowModal(false); setSelectedUser(null) })

  const uniqueRoles = [...new Set(data.map(u => u.rol))].length

  const validateNuevo = () => {
    const errs = {}
    if (!nuevoForm.nombre.trim())                              errs.nombre   = 'El nombre es requerido'
    if (!nuevoForm.email.trim())                               errs.email    = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(nuevoForm.email))           errs.email    = 'Email inválido'
    if (!nuevoForm.password || nuevoForm.password.length < 8) errs.password = 'Mínimo 8 caracteres'
    return errs
  }

  const handleGuardarUsuario = () => {
    const errs = validateNuevo()
    if (Object.keys(errs).length > 0) {
      setNuevoErrors(errs)
      setShake(true)
      clearTimeout(shakeTimer.current)
      shakeTimer.current = setTimeout(() => setShake(false), 400)
      return
    }
    const nextId = Math.max(...data.map(u => u.id)) + 1
    setData(d => [...d, { id: nextId, nombre: nuevoForm.nombre, email: nuevoForm.email, rol: nuevoForm.rol, sucursal: nuevoForm.sucursal, status: 'Activo', ultimo: 'Ahora' }])
    toast.success('Usuario creado', `${nuevoForm.nombre} fue registrado y puede iniciar sesión`)
    setShowModal(false)
    setNuevoForm(BLANK_USER)
    setNuevoErrors({})
  }

  return (
    <div className="space-y-4">

      <PageHeader
        breadcrumb="Usuarios"
        title="Gestión de Usuarios"
        subtitle={`${data.length} usuarios registrados · ${activosCount} activos · ${bloqueados.length} bloqueados`}
      >
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo usuario
        </button>
      </PageHeader>

      <KpiBar items={[
        { label: 'Total usuarios', value: data.length,                                                         sub: 'registrados' },
        { label: 'Activos',        value: activosCount, good: true,                                              sub: 'con acceso' },
        { label: 'Bloqueados',     value: bloqueados.length, alert: bloqueados.length > 0,                     sub: 'acceso suspendido' },
        { label: 'Roles activos',  value: uniqueRoles,                                                         sub: 'distintos' },
      ]} />

      {/* ══ Resumen visual ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Usuarios por rol */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Distribución por rol</span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart
              data={roles.map(r => ({ name: r === 'Encargado de ruta' ? 'Enc. ruta' : r, count: roleCounts[r] }))}
              barSize={32} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#FDE8D0" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8FA1B2' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#FFF7ED' }} content={props => <ChartTooltip {...props} format={v => `${v} usuario${v !== 1 ? 's' : ''}`} />} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]} fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Por estado y sucursal */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Estado de acceso</span>
          </div>
          {[
            { label: 'Activos',    count: activosCount,                                       color: '#059669', bg: 'rgba(5,150,105,.08)' },
            { label: 'Bloqueados', count: bloqueados.length,                                  color: '#C97A6D', bg: 'rgba(201,122,109,.08)' },
          ].map(s => {
            const pct = Math.round(s.count / data.length * 100)
            return (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                  <span className="text-xs font-black" style={{ color: s.color }}>{s.count}</span>
                </div>
                <div className="flex-1">
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
          <div className="mt-2 rounded-xl p-3" style={{ background: '#FFF7ED' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#8FA1B2' }}>Sucursales con usuarios</p>
            {['Centro', 'Norte', 'Sur', 'Oriente', 'Global'].map(suc => {
              const n = sucursalCounts[suc]
              return n > 0 ? (
                <div key={suc} className="flex justify-between items-center py-0.5">
                  <span className="text-xs" style={{ color: '#627080' }}>{suc}</span>
                  <span className="text-xs font-bold" style={{ color: '#F97316' }}>{n}</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      </div>

      {/* Alerta de usuarios bloqueados */}
      {bloqueados.length > 0 && (
        <AlertBanner
          icon={UserX}
          title={`${bloqueados.length} usuario${bloqueados.length > 1 ? 's bloqueados' : ' bloqueado'} — acceso al sistema suspendido`}
          subtitle={bloqueados.map(u => u.nombre).join(' · ')}
          className="mb-5"
        />
      )}

      {!loaded ? (
        <>
          <SkeletonCardGrid count={5} cols={5} />
          <SkeletonTableRows rows={6} />
        </>
      ) : <>
      {/* Role stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {roles.map((r, i) => {
          const count = roleCounts[r]
          const isSelected = filterRol === r
          return (
            <div
              key={r}
              className="card card-glow p-4 cursor-pointer animate-fade-in-up"
              style={{ ...(isSelected ? { borderColor: '#FDBA74', background: '#FFF7ED' } : {}), animationDelay: `${Math.min(i * 55, 200)}ms` }}
              onClick={() => setFilterRol(isSelected ? 'Todos' : r)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: (avatarBg[r] || avatarBg['Cajero']).bg }}
                >
                  <Shield className="w-4 h-4" style={{ color: (avatarBg[r] || avatarBg['Cajero']).color }} />
                </div>
                <p className="text-2xl font-black" style={{ color: '#263442' }}>{count}</p>
              </div>
              <p className="text-xs font-semibold leading-tight" style={{ color: isSelected ? '#C2410C' : '#8FA1B2' }}>{r}</p>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="data-toolbar">
          <div className="data-toolbar-row">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o email..." resultCount={filtered.length} />
            <select value={filterRol} onChange={e => setFilterRol(e.target.value)} className="filter-input">
              <option value="Todos">Todos los roles</option>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
            <select className="filter-input">
              <option>Todas las sucursales</option>
              {sucursales.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="section-head">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#7c3aed' }} />
            <span className="section-head-text"><strong>Usuarios del Sistema</strong></span>
            <span style={{ fontSize: '.7rem', color: '#8FA1B2' }}>{filtered.length} usuario{filtered.length !== 1 ? 's' : ''}</span>
            <span className="badge" style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>{activosCount} activos</span>
            {bloqueados.length > 0 && <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{bloqueados.length} bloqueados</span>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th className="hidden md:table-cell">Sucursal</th>
                <th className="hidden lg:table-cell">Último acceso</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(u => {
                const isBlocked = u.status === 'Bloqueado'
                return (
                  <tr
                    key={u.id}
                    style={isBlocked ? { background: 'rgba(201,122,109,.04)', borderLeft: '3px solid rgba(201,122,109,.35)' } : {}}
                  >
                    <td>
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: isBlocked ? 'rgba(201,122,109,.12)' : (avatarBg[u.rol] || avatarBg['Cajero']).bg,
                            color: isBlocked ? '#C97A6D' : (avatarBg[u.rol] || avatarBg['Cajero']).color,
                            opacity: isBlocked ? 0.8 : 1,
                          }}
                        >
                          {isBlocked
                            ? <Lock className="w-3.5 h-3.5" />
                            : u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: isBlocked ? '#A05A52' : '#263442' }}>{u.nombre}</p>
                          <p className="text-xs truncate" style={{ color: '#8FA1B2' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><Badge label={u.rol} color={roleColor[u.rol]} /></td>
                    <td className="hidden md:table-cell"><span className="text-sm" style={{ color: '#627080' }}>{u.sucursal}</span></td>
                    <td className="hidden lg:table-cell">
                      <span className="text-xs" style={{ color: isBlocked ? '#C97A6D' : '#8FA1B2' }}>{u.ultimo}</span>
                    </td>
                    <td><Badge label={u.status} color={u.status === 'Activo' ? 'green' : 'red'} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button className="action-btn" title="Ver" onClick={() => setSelectedUser(u)}><Eye className="w-4 h-4" /></button>
                        <button className="action-btn" title="Editar" onClick={() => openEdit(u)}><Edit className="w-4 h-4" /></button>
                        <button
                          className="action-btn"
                          title="Restablecer contraseña"
                          onClick={() => toast.info('Contraseña restablecida', `Se envió el acceso temporal a ${u.email}`)}
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => isBlocked ? toggleBlock(u.id) : setConfirmBlock(u)}
                          className={`action-btn ${isBlocked ? '' : 'danger'}`}
                          style={isBlocked ? { color: '#059669' } : {}}
                          title={isBlocked ? 'Desbloquear' : 'Bloquear'}
                        >
                          {isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
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
          <EmptyState icon={Search} title="Sin resultados" subtitle="No hay usuarios con ese criterio de búsqueda.">
            <button onClick={() => { setSearch(''); setFilterRol('Todos') }} className="btn-soft-blue mt-3 px-4 py-2 text-xs font-semibold rounded-xl">
              Limpiar filtros
            </button>
          </EmptyState>
        )}
        <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </div>
      </>}

      {/* Confirm bloqueo */}
      {confirmBlock && (
        <ConfirmDialog
          title="¿Bloquear este usuario?"
          message={`${confirmBlock.nombre} no podrá iniciar sesión hasta que sea desbloqueado manualmente.`}
          confirmLabel="Sí, bloquear"
          onConfirm={() => { toggleBlock(confirmBlock.id); setConfirmBlock(null) }}
          onCancel={() => setConfirmBlock(null)}
        />
      )}

      {/* Modal perfil de usuario */}
      {selectedUser && (() => {
        const u = selectedUser
        const isBlocked = u.status === 'Bloqueado'
        const initials = u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)
        return (
          <Modal title="Perfil de usuario" onClose={() => setSelectedUser(null)}>

              {/* Avatar + name */}
              <div className="px-6 pt-6 pb-5 flex items-center gap-4" style={{ borderBottom: '1px solid #FDE8D0' }}>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
                  style={{
                    background: isBlocked ? 'rgba(201,122,109,.12)' : (avatarBg[u.rol] || avatarBg['Cajero']).bg,
                    color: isBlocked ? '#C97A6D' : (avatarBg[u.rol] || avatarBg['Cajero']).color,
                  }}
                >
                  {isBlocked ? <Lock className="w-6 h-6" /> : initials}
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight" style={{ color: '#263442' }}>{u.nombre}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge label={u.rol} color={roleColor[u.rol]} />
                    <Badge label={u.status} color={isBlocked ? 'red' : 'green'} />
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="px-6 py-5 grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F2F3F5' }}>
                  <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA1B2' }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Correo</p>
                    <p className="text-sm font-semibold font-mono" style={{ color: '#627080' }}>{u.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F2F3F5' }}>
                    <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA1B2' }} />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Sucursal</p>
                      <p className="text-sm font-semibold" style={{ color: '#627080' }}>{u.sucursal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F2F3F5' }}>
                    <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA1B2' }} />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Último acceso</p>
                      <p className="text-sm font-semibold" style={{ color: '#627080' }}>{u.ultimo}</p>
                    </div>
                  </div>
                </div>
                {isBlocked && (
                  <div className="flex items-center gap-2.5 rounded-xl px-4 py-3" style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.25)' }}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#C97A6D' }} />
                    <p className="text-xs font-semibold" style={{ color: '#A05A52' }}>Acceso al sistema suspendido</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    onClick={() => {
                      toast.info('Contraseña restablecida', `Se envió el acceso temporal a ${u.email}`)
                    }}
                  >
                    <KeyRound className="w-4 h-4" /> Restablecer contraseña
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all"
                    style={isBlocked
                      ? { background: 'rgba(5,150,105,.1)', color: '#059669', border: '1px solid rgba(5,150,105,.25)' }
                      : { background: 'rgba(201,122,109,.1)', color: '#A05A52', border: '1px solid rgba(201,122,109,.25)' }
                    }
                    onClick={() => {
                      toggleBlock(u.id)
                      setSelectedUser(d => ({ ...d, status: d.status === 'Activo' ? 'Bloqueado' : 'Activo' }))
                    }}
                  >
                    {isBlocked ? <><Unlock className="w-4 h-4" /> Desbloquear</> : <><Lock className="w-4 h-4" /> Bloquear</>}
                  </button>
                </div>
                <button
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={() => openEdit(u)}
                >
                  <Edit className="w-4 h-4" /> Editar usuario
                </button>
              </div>
          </Modal>
        )
      })()}

      {/* Modal editar usuario */}
      {showEditModal && editUser && (
        <Modal title="Editar usuario" subtitle={editUser.email} maxWidth="lg" onClose={() => setShowEditModal(false)}>
            <div className="p-6 grid grid-cols-2 gap-4">
              <FormField label="Nombre completo" required className="col-span-2">
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                  className="input-field"
                  autoFocus
                />
              </FormField>
              <FormField label="Email" required className="col-span-2">
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field"
                />
              </FormField>
              <FormField label="Rol">
                <select value={editForm.rol} onChange={e => setEditForm(f => ({ ...f, rol: e.target.value }))} className="input-field">
                  {roles.map(r => <option key={r}>{r}</option>)}
                </select>
              </FormField>
              <FormField label="Sucursal">
                <select value={editForm.sucursal} onChange={e => setEditForm(f => ({ ...f, sucursal: e.target.value }))} className="input-field">
                  {sucursales.map(s => <option key={s}>{s}</option>)}
                </select>
              </FormField>
            </div>
            <ModalFooter onCancel={() => setShowEditModal(false)} onConfirm={handleSaveEdit} confirmLabel="Guardar cambios" />
        </Modal>
      )}

      {/* Modal nuevo usuario */}
      {showModal && (
        <Modal title="Nuevo usuario" maxWidth="lg" shake={shake} onClose={() => { setShowModal(false); setNuevoForm(BLANK_USER); setNuevoErrors({}) }}>
            <div className="p-6 grid grid-cols-2 gap-4">
              <FormField label="Nombre completo" required error={nuevoErrors.nombre} className="col-span-2">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nuevoForm.nombre}
                  onChange={e => { setNuevoForm(f => ({ ...f, nombre: e.target.value })); setNuevoErrors(er => ({ ...er, nombre: '' })) }}
                  className={`input-field ${nuevoErrors.nombre ? 'input-field-error' : ''}`}
                  autoFocus
                />
              </FormField>
              <FormField label="Email" required error={nuevoErrors.email}>
                <input
                  type="email"
                  placeholder="correo@cremeria.mx"
                  value={nuevoForm.email}
                  onChange={e => { setNuevoForm(f => ({ ...f, email: e.target.value })); setNuevoErrors(er => ({ ...er, email: '' })) }}
                  className={`input-field ${nuevoErrors.email ? 'input-field-error' : ''}`}
                />
              </FormField>
              <FormField label="Teléfono">
                <input
                  type="tel"
                  placeholder="442-000-0000"
                  value={nuevoForm.telefono}
                  onChange={e => setNuevoForm(f => ({ ...f, telefono: e.target.value }))}
                  className="input-field"
                />
              </FormField>
              <FormField label="Rol">
                <select
                  value={nuevoForm.rol}
                  onChange={e => setNuevoForm(f => ({ ...f, rol: e.target.value }))}
                  className="input-field"
                >
                  {roles.map(r => <option key={r}>{r}</option>)}
                </select>
              </FormField>
              <FormField label="Sucursal">
                <select
                  value={nuevoForm.sucursal}
                  onChange={e => setNuevoForm(f => ({ ...f, sucursal: e.target.value }))}
                  className="input-field"
                >
                  {sucursales.map(s => <option key={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Contraseña temporal" required error={nuevoErrors.password} className="col-span-2">
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={nuevoForm.password}
                  onChange={e => { setNuevoForm(f => ({ ...f, password: e.target.value })); setNuevoErrors(er => ({ ...er, password: '' })) }}
                  className={`input-field ${nuevoErrors.password ? 'input-field-error' : ''}`}
                />
                {nuevoForm.password && !nuevoErrors.password && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{
                        background: i < Math.min(4, Math.floor(nuevoForm.password.length / 2))
                          ? nuevoForm.password.length < 6 ? '#C97A6D'
                          : nuevoForm.password.length < 10 ? '#d97706'
                          : '#059669'
                          : '#FDE8D0'
                      }} />
                    ))}
                  </div>
                )}
              </FormField>
            </div>
            <ModalFooter onCancel={() => { setShowModal(false); setNuevoForm(BLANK_USER); setNuevoErrors({}) }} onConfirm={handleGuardarUsuario} confirmLabel="Crear usuario" />
        </Modal>
      )}
    </div>
  )
}
