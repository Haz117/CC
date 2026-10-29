import { useMemo, useState } from 'react'
import { Users, Plus, Edit, UserX, Navigation, ShoppingCart, AlertTriangle, KeyRound, Truck, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EnVivo from '../components/EnVivo'
import KpiBar from '../components/KpiBar'
import AvisoError from '../components/AvisoError'
import FiltroPeriodo from '../components/FiltroPeriodo'
import SearchInput from '../components/SearchInput'
import Segmentado from '../components/Segmentado'
import Selector from '../components/Selector'
import Badge from '../components/Badge'
import Estado from '../components/Estado'
import Modal from '../components/Modal'
import ModalFooter from '../components/ModalFooter'
import FormField from '../components/FormField'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { SkeletonTableRows } from '../components/Skeleton'
import { useConsulta } from '../hooks/useConsulta'
import { usePeriodo } from '../hooks/usePeriodo'
import { useEstadoSesion } from '../hooks/useEstadoSesion'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import { listarPersonalRuta, guardarPersonalRuta, quitarPersonalRuta, etiquetaRolRuta, ROL_RUTA } from '../api/distribuidores'
import { listarJornadas, listarCamiones } from '../api/rutas'
import { listarUsuarios } from '../api/organizacion'
import { jornadasPorChofer, resumenJornadas } from '../lib/calculos'
import { pesos, plural, rangoCorto, sinAcentos, contiene } from '../utils/fmt'
import toast from '../utils/toast'

/* Distribuidores: el personal de la app de ruta. Choferes (venden), encargados (autorizan
   cancelaciones) y almacenistas (firman la carga y el cierre), cada uno con su PIN de 4 dígitos.
   Las personas salen de `usuarios`; aquí solo se les da acceso a la app del camión. */

const ORDEN_ROL = [ROL_RUTA.CHOFER, ROL_RUTA.ENCARGADO, ROL_RUTA.ALMACEN]
const COLOR_ROL = { CHOFER: 'orange', ENCARGADO: 'purple', ALMACEN: 'teal' }
const QUE_HACE = {
  CHOFER: 'Vende en ruta.',
  ENCARGADO: 'Autoriza cancelaciones.',
  ALMACEN: 'Firma carga y cierre.',
}

function FormPersona({ persona, personal, camiones, onClose, onGuardado, onQuitar }) {
  const nueva = !persona
  // Al devolver el acceso también hace falta PIN nuevo: el viejo pudo dársele a otra persona mientras
  const pidePin = nueva || !persona.activo
  const usuarios = useConsulta(listarUsuarios, [], { activo: nueva })
  const [form, setForm] = useState(() => ({
    usuarioId: persona?.usuario_id ?? '',
    rol: persona?.rol_ruta ?? ROL_RUTA.CHOFER,
    sucursalId: persona?.sucursal_id ?? '',
    pin: '',
  }))
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const cambiar = (campo) => (valor) => { setForm(f => ({ ...f, [campo]: valor })); setError('') }
  const yaEstan = new Set(personal.map(p => p.usuario_id))
  const candidatos = (usuarios.datos ?? []).filter(u => u.activo && !yaEstan.has(u.id))

  const guardar = async () => {
    if (!form.usuarioId) return setError('Elige a la persona')
    if (pidePin && !form.pin) return setError(nueva ? 'Asigna un PIN de 4 números' : 'Para devolverle el acceso asigna un PIN nuevo')
    if (form.pin && !/^\d{4}$/.test(form.pin)) return setError('El PIN son 4 números')
    setGuardando(true)
    try {
      await guardarPersonalRuta(form)
      const nombre = persona?.usuario?.nombre_completo ?? candidatos.find(u => u.id === form.usuarioId)?.nombre_completo ?? ''
      toast.success(nueva ? 'Acceso dado' : 'Cambios guardados', nombre)
      onGuardado()
    } catch (e) {
      setError(e.message)
      setGuardando(false)
    }
  }

  return (
    <Modal title={nueva ? 'Dar acceso' : persona.usuario?.nombre_completo} subtitle={nueva ? undefined : persona.usuario?.usuario} onClose={onClose}>
      <div className="p-6 space-y-4">
        {nueva && (
          <FormField label="Persona" required>
            <AvisoError error={usuarios.error} onReintentar={usuarios.recargar} />
            {usuarios.cargando ? <p className="text-sm" style={{ color: '#627080' }}>Cargando usuarios…</p> : candidatos.length ? (
              <Selector value={form.usuarioId} onChange={cambiar('usuarioId')} etiqueta="Persona"
                opciones={[{ valor: '', texto: 'Elige a la persona' }, ...candidatos.map(u => ({ valor: u.id, texto: `${u.nombre_completo} · ${u.usuario}` }))]} />
            ) : (
              <p className="text-sm" style={{ color: '#627080' }}>No hay usuarios sin acceso. Da de alta a la persona en la caja del almacén.</p>
            )}
          </FormField>
        )}
        <FormField label="Qué hace en la ruta" required>
          <Segmentado opciones={ORDEN_ROL.map(r => ({ valor: r, texto: etiquetaRolRuta(r) }))} value={form.rol} onChange={cambiar('rol')} etiqueta="Rol en la ruta" />
          <p className="text-xs mt-1.5" style={{ color: '#627080' }}>{QUE_HACE[form.rol]}</p>
        </FormField>
        <FormField label="Camión">
          <Selector value={form.sucursalId} onChange={cambiar('sucursalId')} etiqueta="Camión"
            opciones={[{ valor: '', texto: 'Cualquier camión' }, ...camiones.map(c => ({ valor: c.sucursal_id, texto: `${c.sucursal?.nombre ?? c.nombre} · ${c.nombre}` }))]} />
        </FormField>
        <FormField label={nueva ? 'PIN' : 'PIN nuevo'} required={pidePin}>
          <input
            className="input-field"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            placeholder={pidePin ? '4 números' : 'Déjalo vacío para conservar el actual'}
            value={form.pin}
            onChange={e => cambiar('pin')(e.target.value.replace(/\D/g, '').slice(0, 4))}
            style={{ letterSpacing: form.pin ? '.4em' : undefined, fontVariantNumeric: 'tabular-nums' }}
          />
          <p className="text-xs mt-1" style={{ color: '#627080' }}>4 dígitos, distinto para cada persona.</p>
        </FormField>
        {error && <p className="text-sm font-semibold" role="alert" style={{ color: '#8A4A42' }}>{error}</p>}
        {/* En celular la tabla no trae columna de acciones: quitar el acceso también se hace desde aquí */}
        {!nueva && persona.activo && (
          <button type="button" onClick={() => onQuitar(persona)} className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#8A4A42', minHeight: 44 }}>
            <UserX className="w-4 h-4" aria-hidden="true" /> Quitar acceso a la app de ruta
          </button>
        )}
      </div>
      <ModalFooter onCancel={onClose} onConfirm={guardar} disabled={guardando || (nueva && !candidatos.length)} confirmLabel={guardando ? 'Guardando…' : nueva ? 'Dar acceso' : !persona.activo ? 'Devolver acceso' : 'Guardar'} />
    </Modal>
  )
}

export default function Distribuidores() {
  const periodo = usePeriodo('semana', 'distribuidores')
  const { dateFrom, dateTo, desde, hasta } = periodo
  const [search, setSearch] = usePersistedState('distribuidores-search', '')
  const debouncedSearch = useDebounce(search)
  const [rol, setRol] = useEstadoSesion('distribuidores:rol', 'TODOS')
  const [editando, setEditando] = useState(undefined) // undefined: cerrado · null: nueva · persona: editar
  const [quitando, setQuitando] = useState(null)

  const personal = useConsulta(listarPersonalRuta)
  const jornadas = useConsulta(() => listarJornadas({ desde, hasta }), [desde, hasta], { enVivo: ['ruta_envios'] })
  const camiones = useConsulta(listarCamiones)
  useEscapeKey(() => { setEditando(undefined); setQuitando(null) })

  const nombreCamion = useMemo(() => {
    const porId = new Map((camiones.datos ?? []).map(c => [c.sucursal_id, `${c.sucursal?.nombre ?? c.nombre} · ${c.nombre}`]))
    return (id) => (id ? porId.get(id) ?? '—' : 'Cualquier camión')
  }, [camiones.datos])

  const porChofer = useMemo(() => new Map(jornadasPorChofer(jornadas.datos ?? []).map(f => [f.chofer_id, f])), [jornadas.datos])
  const r = useMemo(() => resumenJornadas(jornadas.datos ?? []), [jornadas.datos])

  const filas = useMemo(() => {
    const q = sinAcentos(debouncedSearch.trim())
    return (personal.datos ?? [])
      .filter(p => rol === 'TODOS' || p.rol_ruta === rol)
      .filter(p => !q || [p.usuario?.nombre_completo, p.usuario?.usuario].some(x => contiene(x, q)))
      .sort((a, b) => (b.activo - a.activo) || (ORDEN_ROL.indexOf(a.rol_ruta) - ORDEN_ROL.indexOf(b.rol_ruta))
        || String(a.usuario?.nombre_completo).localeCompare(String(b.usuario?.nombre_completo), 'es'))
  }, [personal.datos, rol, debouncedSearch])

  const activos = (personal.datos ?? []).filter(p => p.activo)
  const cuantos = (rolRuta) => activos.filter(p => p.rol_ruta === rolRuta).length
  const error = personal.error || jornadas.error
  const estadoKpi = personal.cargando || jornadas.cargando ? 'cargando' : personal.datos === undefined || jornadas.datos === undefined ? 'error' : null

  const quitar = async () => {
    const p = quitando
    setQuitando(null)
    try {
      await quitarPersonalRuta(p.usuario_id)
      toast.success('Acceso quitado', p.usuario?.nombre_completo)
      personal.recargar()
    } catch (e) {
      toast.error('No se pudo quitar el acceso', e.message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Distribuidores">
        <EnVivo actualizando={personal.actualizando || jornadas.actualizando} error={error} />
        <button className="btn-primary" onClick={() => setEditando(null)} disabled={personal.datos === undefined}>
          <Plus className="w-4 h-4" /> Dar acceso
        </button>
      </PageHeader>

      <div className="barra-filtros">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o usuario…" resultCount={filas.length} className="barra-filtros-busqueda" />
        <FiltroPeriodo periodo={periodo} />
      </div>

      <KpiBar estado={estadoKpi} items={[
        { icon: Users, label: 'Choferes', value: cuantos(ROL_RUTA.CHOFER), sub: `${plural(cuantos(ROL_RUTA.ENCARGADO), 'encargado')} · ${cuantos(ROL_RUTA.ALMACEN)} de almacén` },
        { icon: Navigation, label: 'En ruta ahora', value: r.enRuta, good: r.enRuta > 0, sub: r.sinCerrar ? `${r.sinCerrar} sin cerrar` : '—' },
        { icon: ShoppingCart, label: 'Vendido', value: pesos(r.vendido), sub: rangoCorto(dateFrom, dateTo) },
        { icon: AlertTriangle, label: 'A cargo de choferes', value: pesos(r.aCargo), alert: r.aCargo > 0, sub: r.conCargo ? plural(r.conCargo, 'jornada') : '—' },
      ]} />

      <AvisoError error={error} onReintentar={() => { personal.recargar(); jornadas.recargar() }} />

      {personal.cargando ? <SkeletonTableRows /> : (
        <div className="card overflow-hidden">
          <div className="section-head">
            <div className="flex items-center gap-2 flex-wrap">
              <KeyRound className="w-4 h-4 flex-shrink-0" style={{ color: '#627080' }} aria-hidden="true" />
              <span className="section-head-text"><strong>Personal de ruta</strong></span>
              <span style={{ fontSize: '.75rem', color: '#627080' }}>{rangoCorto(dateFrom, dateTo)}</span>
            </div>
            <Segmentado
              opciones={[{ valor: 'TODOS', texto: 'Todos' }, ...ORDEN_ROL.map(x => ({ valor: x, texto: etiquetaRolRuta(x) }))]}
              value={rol}
              onChange={setRol}
              etiqueta="Filtrar por rol"
            />
          </div>
          {/* Celular: un renglón por persona; al tocarlo se edita (y desde ahí se quita el acceso) */}
          <ul className="sm:hidden lista-movil">
            {filas.map(p => {
              const stats = porChofer.get(p.usuario_id)
              const esChofer = p.rol_ruta === ROL_RUTA.CHOFER
              return (
                <li key={p.usuario_id} style={p.activo ? undefined : { opacity: 0.6 }}>
                  <button type="button" onClick={() => setEditando(p)} className="lista-movil-fila" aria-label={`Editar a ${p.usuario?.nombre_completo}`}>
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold truncate" style={{ color: '#263442' }}>{p.usuario?.nombre_completo ?? '—'}</span>
                      <Badge label={etiquetaRolRuta(p.rol_ruta)} color={COLOR_ROL[p.rol_ruta]} />
                    </span>
                    <span className="flex items-center justify-between gap-3 mt-1">
                      <span className="text-xs truncate" style={{ color: '#627080' }}>
                        {[
                          !p.activo && 'Sin acceso',
                          stats?.enRuta && 'en ruta ahora',
                          esChofer && `${pesos(stats?.vendido ?? 0)} en ${plural(stats?.jornadas ?? 0, 'jornada')}`,
                          esChofer && stats?.aCargo > 0 && `a cargo ${pesos(stats.aCargo)}`,
                          !esChofer && nombreCamion(p.sucursal_id),
                        ].filter(Boolean).join(' · ')}
                      </span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#D4DDE6' }} aria-hidden="true" />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="hidden sm:block overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla del personal de ruta">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Rol</th>
                  <th className="hidden md:table-cell">Camión</th>
                  <th>Vendido</th>
                  <th className="hidden md:table-cell">A cargo</th>
                  <th>Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(p => {
                  const stats = porChofer.get(p.usuario_id)
                  const esChofer = p.rol_ruta === ROL_RUTA.CHOFER
                  return (
                    <tr key={p.usuario_id} style={p.activo ? undefined : { opacity: 0.6 }}>
                      <td>
                        <p className="text-sm font-semibold" style={{ color: '#263442' }}>{p.usuario?.nombre_completo ?? '—'}</p>
                        <p className="text-xs" style={{ color: '#627080' }}>{p.usuario?.usuario ?? ''}{stats?.enRuta ? ' · en ruta ahora' : ''}</p>
                      </td>
                      <td><Badge label={etiquetaRolRuta(p.rol_ruta)} color={COLOR_ROL[p.rol_ruta]} /></td>
                      <td className="hidden md:table-cell"><span className="text-sm" style={{ color: '#627080' }}>{nombreCamion(p.sucursal_id)}</span></td>
                      <td>
                        {esChofer ? (
                          <>
                            <p className="text-sm font-semibold" style={{ color: '#263442', fontVariantNumeric: 'tabular-nums' }}>{pesos(stats?.vendido ?? 0)}</p>
                            <p className="text-xs" style={{ color: '#627080' }}>{plural(stats?.jornadas ?? 0, 'jornada')}</p>
                            {stats?.merma > 0 && <p className="text-xs" style={{ color: '#92400E' }}>merma {pesos(stats.merma)}</p>}
                          </>
                        ) : <span className="text-sm" style={{ color: '#627080' }}>—</span>}
                      </td>
                      <td className="hidden md:table-cell">
                        {esChofer && stats?.aCargo
                          ? <span className="text-sm font-semibold" style={{ color: '#8A4A42' }}>{pesos(stats.aCargo)}</span>
                          : <span className="text-sm" style={{ color: '#627080' }}>—</span>}
                      </td>
                      <td><Estado label={p.activo ? 'Con acceso' : 'Sin acceso'} color="gray" normal={p.activo} /></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => setEditando(p)} className="action-btn" title={p.activo ? 'Editar' : 'Devolver acceso'} aria-label={`Editar a ${p.usuario?.nombre_completo}`}>
                            <Edit className="w-4 h-4" />
                          </button>
                          {p.activo && (
                            <button onClick={() => setQuitando(p)} className="action-btn" title="Quitar acceso" aria-label={`Quitar acceso a ${p.usuario?.nombre_completo}`}>
                              <UserX className="w-4 h-4" />
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
          {personal.datos !== undefined && filas.length === 0 && (
            <EmptyState
              icon={(personal.datos ?? []).length ? Users : Truck}
              title={(personal.datos ?? []).length ? 'Sin resultados' : 'Sin personal de ruta'}
            />
          )}
        </div>
      )}

      {editando !== undefined && (
        <FormPersona
          persona={editando}
          personal={personal.datos ?? []}
          camiones={camiones.datos ?? []}
          onClose={() => setEditando(undefined)}
          onGuardado={() => { setEditando(undefined); personal.recargar() }}
          onQuitar={(persona) => { setEditando(undefined); setQuitando(persona) }}
        />
      )}
      {quitando && (
        <ConfirmDialog
          title={`¿Quitar acceso a ${quitando.usuario?.nombre_completo}?`}
          message="Ya no podrá entrar ni autorizar con su PIN. Los teléfonos se enteran al empezar el día: si está en ruta, termina su jornada. Sus ventas se conservan."
          confirmLabel="Quitar acceso"
          onConfirm={quitar}
          onCancel={() => setQuitando(null)}
        />
      )}
    </div>
  )
}
