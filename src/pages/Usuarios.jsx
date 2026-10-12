import { useState, useEffect, useMemo } from 'react'
import { Users, UserCheck, Search, Eye, Mail, Building2, TrendingUp, Link2, Unlink, UserX, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SkeletonTableRows } from '../components/Skeleton'
import Badge from '../components/Badge'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import FilaDesglose from '../components/FilaDesglose'
import TituloTarjeta from '../components/TituloTarjeta'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import ModalFooter from '../components/ModalFooter'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import ChartTooltip from '../components/ChartTooltip'
import AvisoError from '../components/AvisoError'
import SelectorSucursal from '../components/SelectorSucursal'
import toast from '../utils/toast'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import { useConsulta } from '../hooks/useConsulta'
import { useSucursales } from '../hooks/useSucursales'
import { ROLES, etiquetaRol } from '../lib/navegacion'
import { listarUsuarios, vincularUsuario } from '../api/organizacion'
import { iniciales } from '../utils/fmt'
import { esCorreo } from '../utils/validar'

const PER_PAGE = 8

const roleColor = { ADMINISTRADOR: 'purple', SUPERVISOR: 'blue', CAJERO: 'teal' }
const avatarBg = {
  ADMINISTRADOR: { bg: 'rgba(124,58,237,.12)', color: '#7c3aed' },
  SUPERVISOR:    { bg: '#FFF7ED',              color: '#F97316' },
  CAJERO:        { bg: 'rgba(5,150,105,.1)',   color: '#059669' },
}
const avatarDe = (u) => (u.activo ? avatarBg[u.rol] ?? avatarBg.CAJERO : { bg: 'rgba(201,122,109,.12)', color: '#C97A6D' })

/* ── Ligar una persona con su cuenta de Auth (solo administrador) ── */
function VincularCuenta({ usuario, onClose, onListo }) {
  const [correo,    setCorreo]    = useState('')
  const [error,     setError]     = useState('')
  const [guardando, setGuardando] = useState(false)

  const vincular = async () => {
    const limpio = correo.trim().toLowerCase()
    if (!esCorreo(limpio)) { setError('Escribe un correo válido.'); return }
    setGuardando(true)
    try {
      await vincularUsuario(usuario.id, limpio)
      toast.success('Cuenta vinculada', `${usuario.nombre} ya puede entrar con ${limpio}`)
      onListo()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal title="Dar acceso a la app web" subtitle={usuario.nombre} maxWidth="lg" onClose={onClose}>
      <div className="p-6 space-y-4">
        <ol className="space-y-2.5">
          {[
            <>La persona ya existe en <strong>usuarios</strong> (se da de alta desde la caja del almacén).</>,
            <>En el panel de Supabase abre <strong>Authentication → Users → Add user</strong> y crea la cuenta con su correo, una contraseña de mínimo 8 caracteres y <strong>Auto Confirm User</strong>.</>,
            <>Escribe aquí ese mismo correo para ligar la cuenta con {usuario.nombre.split(' ')[0]}.</>,
          ].map((paso, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0" style={{ background: '#FFF7ED', color: '#F97316' }}>{i + 1}</span>
              <p className="text-sm" style={{ color: '#627080' }}>{paso}</p>
            </li>
          ))}
        </ol>
        <FormField label="Correo de la cuenta" required error={error}>
          <input
            type="email"
            autoFocus
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={e => { setCorreo(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') vincular() }}
            className={`input-field ${error ? 'input-field-error' : ''}`}
          />
        </FormField>
      </div>
      <ModalFooter onCancel={onClose} onConfirm={vincular} disabled={guardando} confirmLabel={guardando ? 'Vinculando...' : 'Vincular cuenta'} />
    </Modal>
  )
}

export default function Usuarios() {
  const { sucursales, nombreCorto, nombreSucursal } = useSucursales()

  const [search, setSearch]             = usePersistedState('usuarios-search', '')
  const debouncedSearch = useDebounce(search)
  const [filterRol, setFilterRol]       = useState('Todos')
  const [sucursalId, setSucursalId]     = useState('')
  const [page, setPage]                 = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [porVincular, setPorVincular]   = useState(null)

  const { datos, cargando, error, recargar } = useConsulta(listarUsuarios)

  const data = useMemo(() => (datos ?? []).map(u => ({
    ...u,
    nombre: u.nombre_completo ?? '—',
    sucursal: nombreCorto(u.sucursal_id),
    activo: u.activo !== false,
    vinculado: Boolean(u.auth_user_id),
  })), [datos, nombreCorto])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return data.filter(u =>
      (filterRol === 'Todos' || u.rol === filterRol) &&
      (!sucursalId || u.sucursal_id === sucursalId) &&
      (!q || u.nombre.toLowerCase().includes(q) || String(u.usuario ?? '').toLowerCase().includes(q))
    )
  }, [data, debouncedSearch, filterRol, sucursalId])
  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page])

  const stats = useMemo(() => {
    const activos = data.filter(u => u.activo)
    const vinculados = activos.filter(u => u.vinculado).length
    const porRol = Object.fromEntries(ROLES.map(r => [r, data.filter(u => u.rol === r).length]))
    const porSucursal = new Map()
    for (const u of activos) porSucursal.set(u.sucursal_id, (porSucursal.get(u.sucursal_id) ?? 0) + 1)
    return {
      activos: activos.length, inactivos: data.length - activos.length,
      vinculados, sinVincular: activos.length - vinculados, porRol,
      porSucursal: [...porSucursal.entries()].sort((a, b) => b[1] - a[1]),
    }
  }, [data])

  useEffect(() => { setPage(1) }, [debouncedSearch, filterRol, sucursalId])
  useEscapeKey(() => { setSelectedUser(null); setPorVincular(null) })

  const abrirVincular = (u) => { setSelectedUser(null); setPorVincular(u) }
  const maxRol = Math.max(1, ...Object.values(stats.porRol))

  // Mientras llega la primera respuesta, o si falló, no hay cifras que mostrar: un cero se leería como dato real.
  const sinDatos = datos === undefined
  const estadoKpi = cargando ? 'cargando' : sinDatos ? 'error' : null

  return (
    <div className="space-y-6">

      <PageHeader
        breadcrumb="Usuarios"
        title="Usuarios"
        subtitle={sinDatos ? 'Personas que operan las cajas y la app web' : `${data.length} personas · ${stats.activos} activas · ${stats.vinculados} con acceso a la app web`}
      />

      <KpiBar estado={estadoKpi} items={[
        { icon: Users, label: 'Total usuarios', value: data.length,       sub: 'todas las sucursales' },
        { icon: UserCheck, label: 'Activos', value: stats.activos,     good: true,                 sub: 'pueden operar' },
        { icon: Link2, label: 'Con acceso web', value: stats.vinculados,                              sub: 'cuenta vinculada' },
        { icon: Unlink, label: 'Sin vincular', value: stats.sinVincular,                             sub: 'solo entran en la caja' },
        { icon: UserX, label: 'Inactivos', value: stats.inactivos,   alert: stats.inactivos > 0, sub: 'dados de baja' },
      ]} />

      <AvisoError error={error} onReintentar={recargar} />

      {/* ══ Resumen visual ════════════════════════════════════════ */}
      {!sinDatos && <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="card p-5 lg:col-span-3">
          <TituloTarjeta icon={TrendingUp} titulo="Distribución por rol" />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={ROLES.map(r => ({ rol: r, name: etiquetaRol(r), count: stats.porRol[r] }))} maxBarSize={40} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#FDE8D0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#627080' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#FFF7ED' }} content={props => <ChartTooltip {...props} format={v => `${v} usuario${v !== 1 ? 's' : ''}`} />} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {ROLES.map(r => {
                  const ratio = stats.porRol[r] / maxRol
                  return <Cell key={r} fill={ratio >= 0.8 ? '#059669' : ratio >= 0.4 ? '#F97316' : '#FDBA74'} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 flex flex-col gap-3 lg:col-span-2">
          <TituloTarjeta icon={Link2} titulo="Acceso a la app web" className="mb-1" />
          {[
            { label: 'Cuenta vinculada', count: stats.vinculados,  color: '#059669' },
            { label: 'Sin vincular',     count: stats.sinVincular, color: '#627080', fondo: '#F2F3F5' },
          ].map(s => {
            const pct = stats.activos ? Math.round(s.count / stats.activos * 100) : 0
            return <FilaDesglose key={s.label} cuenta={s.count} etiqueta={s.label} derecha={`${pct}%`} pct={pct} color={s.color} fondo={s.fondo} />
          })}
          <div className="mt-2 rounded-xl p-3" style={{ background: '#FFF7ED' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#627080' }}>Usuarios activos por sucursal</p>
            {stats.porSucursal.map(([id, n]) => (
              <div key={id ?? 'sin'} className="flex justify-between items-center py-0.5">
                <span className="text-xs" style={{ color: '#627080' }}>{nombreCorto(id)}</span>
                <span className="text-xs font-bold" style={{ color: '#F97316' }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {cargando ? <SkeletonTableRows rows={6} /> : <>
      {/* Table */}
      <div className="card overflow-hidden">
        <div className="data-toolbar">
          <div className="data-toolbar-row">
            <div style={{ flex: 1, minWidth: 200 }}>
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o usuario..." resultCount={filtered.length} />
            </div>
            <div className="filter-bar" role="group" aria-label="Rol">
              {['Todos', ...ROLES].map(r => (
                <button key={r} type="button" onClick={() => setFilterRol(r)} aria-pressed={filterRol === r} className={`chip ${filterRol === r ? 'active' : ''}`}>
                  {r === 'Todos' ? `Todos (${data.length})` : `${etiquetaRol(r)} (${stats.porRol[r]})`}
                </button>
              ))}
            </div>
            <SelectorSucursal value={sucursalId} onChange={setSucursalId} sucursales={sucursales} />
          </div>
        </div>
        <div className="section-head">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#7c3aed' }} />
            <span className="section-head-text"><strong>Usuarios del sistema</strong></span>
            <span style={{ fontSize: '.7rem', color: '#627080' }}>{filtered.length} usuario{filtered.length !== 1 ? 's' : ''}</span>
            {stats.inactivos > 0 && <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{stats.inactivos} inactivos</span>}
          </div>
          <span className="hidden md:inline text-xs" style={{ color: '#627080' }}>Las altas y bajas se hacen desde la caja del almacén</span>
        </div>
        {/* Móvil: una tarjeta compacta por persona; al tocarla se abre su perfil */}
        <ul className="sm:hidden lista-movil">
          {paginated.map(u => {
            const av = avatarDe(u)
            return (
              <li key={u.id}>
                <button type="button" onClick={() => setSelectedUser(u)} className="lista-movil-fila" aria-label={`Ver a ${u.nombre}`}
                  style={u.activo ? {} : { background: 'rgba(201,122,109,.04)', borderLeft: '3px solid rgba(201,122,109,.35)' }}>
                  <span className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: av.bg, color: av.color }}>
                      {u.activo ? iniciales(u.nombre) : <UserX className="w-3.5 h-3.5" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold truncate" style={{ color: u.activo ? '#263442' : '#A05A52' }}>{u.nombre}</span>
                      <span className="block text-xs truncate" style={{ color: '#627080' }}>{u.sucursal} · {u.usuario ?? (u.vinculado ? 'Cuenta vinculada' : 'Sin cuenta web')}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#D4DDE6' }} />
                  </span>
                  <span className="flex items-center gap-2 flex-wrap mt-2.5">
                    <Badge label={etiquetaRol(u.rol)} color={roleColor[u.rol] ?? 'gray'} />
                    <Badge label={u.vinculado ? 'Vinculada' : 'Sin vincular'} color={u.vinculado ? 'green' : 'gray'} />
                    {!u.activo && <Badge label="Inactivo" color="red" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="hidden sm:block overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th className="hidden md:table-cell">Sucursal</th>
                <th>Acceso web</th>
                <th className="hidden lg:table-cell">Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(u => {
                const av = avatarDe(u)
                return (
                  <tr key={u.id} style={u.activo ? {} : { background: 'rgba(201,122,109,.04)', borderLeft: '3px solid rgba(201,122,109,.35)' }}>
                    <td>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: av.bg, color: av.color }}>
                          {u.activo ? iniciales(u.nombre) : <UserX className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: u.activo ? '#263442' : '#A05A52' }}>{u.nombre}</p>
                          <p className="text-xs truncate" style={{ color: '#627080' }}>{u.usuario ?? (u.vinculado ? 'Cuenta vinculada' : 'Sin cuenta web')}</p>
                        </div>
                      </div>
                    </td>
                    <td><Badge label={etiquetaRol(u.rol)} color={roleColor[u.rol] ?? 'gray'} /></td>
                    <td className="hidden md:table-cell"><span className="text-sm" style={{ color: '#627080' }}>{u.sucursal}</span></td>
                    <td>
                      <Badge label={u.vinculado ? 'Vinculada' : 'Sin vincular'} color={u.vinculado ? 'green' : 'gray'} />
                    </td>
                    <td className="hidden lg:table-cell"><Badge label={u.activo ? 'Activo' : 'Inactivo'} color={u.activo ? 'green' : 'red'} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button className="action-btn" title="Ver" aria-label={`Ver a ${u.nombre}`} onClick={() => setSelectedUser(u)}><Eye className="w-4 h-4" /></button>
                        {u.activo && !u.vinculado && (
                          <button className="action-btn" title="Dar acceso a la app web" aria-label={`Vincular cuenta de ${u.nombre}`} onClick={() => abrirVincular(u)}>
                            <Link2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !sinDatos && (
          <EmptyState icon={Search} title="Sin resultados" subtitle="No hay usuarios con ese criterio de búsqueda.">
            <button onClick={() => { setSearch(''); setFilterRol('Todos'); setSucursalId('') }} className="btn-soft-blue mt-3 px-4 py-2 text-xs font-semibold rounded-xl">
              Limpiar filtros
            </button>
          </EmptyState>
        )}
        <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </div>
      </>}

      {/* Modal perfil de usuario */}
      {selectedUser && (() => {
        const u = selectedUser
        const av = avatarDe(u)
        return (
          <Modal title="Perfil de usuario" onClose={() => setSelectedUser(null)}>
            <div className="px-6 pt-6 pb-5 flex items-center gap-4" style={{ borderBottom: '1px solid #FDE8D0' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0" style={{ background: av.bg, color: av.color }}>
                {u.activo ? iniciales(u.nombre) : <UserX className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-lg font-bold leading-tight" style={{ color: '#263442' }}>{u.nombre}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge label={etiquetaRol(u.rol)} color={roleColor[u.rol] ?? 'gray'} />
                  <Badge label={u.activo ? 'Activo' : 'Inactivo'} color={u.activo ? 'green' : 'red'} />
                </div>
              </div>
            </div>

            <div className="px-6 py-5 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F2F3F5' }}>
                <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA1B2' }} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#627080' }}>Sucursal</p>
                  <p className="text-sm font-semibold" style={{ color: '#263442' }}>{nombreSucursal(u.sucursal_id)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F2F3F5' }}>
                {u.vinculado ? <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} /> : <Unlink className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA1B2' }} />}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#627080' }}>Acceso a la app web</p>
                  <p className="text-sm font-semibold truncate" style={{ color: '#263442' }}>
                    {u.vinculado ? 'Cuenta vinculada' : 'Sin cuenta vinculada: solo entra en la caja'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setSelectedUser(null)}>Cerrar</button>
              {u.activo && !u.vinculado && (
                <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={() => abrirVincular(u)}>
                  <Link2 className="w-4 h-4" /> Dar acceso web
                </button>
              )}
            </div>
          </Modal>
        )
      })()}

      {porVincular && (
        <VincularCuenta
          usuario={porVincular}
          onClose={() => setPorVincular(null)}
          onListo={() => { setPorVincular(null); recargar() }}
        />
      )}
    </div>
  )
}
