import { useEffect, useMemo, useRef, useState } from 'react'
import { Truck, Navigation, ShoppingCart, AlertTriangle, Eye, MapPin, ChevronRight, Plus, Edit, Receipt } from 'lucide-react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip as Etiqueta, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import PageHeader from '../components/PageHeader'
import EnVivo from '../components/EnVivo'
import KpiBar from '../components/KpiBar'
import AvisoError from '../components/AvisoError'
import FiltroPeriodo from '../components/FiltroPeriodo'
import Selector from '../components/Selector'
import Segmentado from '../components/Segmentado'
import Badge from '../components/Badge'
import Estado from '../components/Estado'
import Modal from '../components/Modal'
import ModalFooter from '../components/ModalFooter'
import FormField from '../components/FormField'
import Interruptor from '../components/Interruptor'
import InfoCell from '../components/InfoCell'
import EmptyState from '../components/EmptyState'
import { SkeletonTableRows } from '../components/Skeleton'
import { useConsulta } from '../hooks/useConsulta'
import { usePeriodo } from '../hooks/usePeriodo'
import { useEstadoSesion } from '../hooks/useEstadoSesion'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useSucursales } from '../hooks/useSucursales'
import { listarJornadas, listarVentasDeJornada, listarMermasDeJornada, listarRecorrido, listarCamiones, guardarCamion } from '../api/rutas'
import { resumenJornadas, enRuta, sinCerrar, sinUbicacionReciente, limitesDe, etiquetaMetodo, textoDesglose, MINUTOS_SIN_UBICACION } from '../lib/calculos'
import { pesos, hora, horario, diaCorto, fechaHora, haceCuanto, plural, rangoCorto } from '../utils/fmt'
import toast from '../utils/toast'

/* Ventas en ruta: lo que suben los teléfonos de los camiones (app cremeria-ruta).
   Solo consulta, salvo dar de alta los camiones (ruta_guardar_camion, solo administrador). */

const CENTRO_QRO = [20.5888, -100.3899]
// Cómo se entregó el ticket, tal como se lee en el renglón de la venta
const TICKET = { QR: 'ticket QR', IMPRESO: 'ticket impreso', REIMPRESO: 'ticket reimpreso', ENVIADO: 'ticket por WhatsApp', SIN_TICKET: 'sin ticket' }
const COLOR = { enRuta: '#C2410C', cerrada: '#627080', sinSenal: '#8A4A42', venta: '#047857', cancelada: '#8A4A42' }

function estadoDe(jornada, ahora) {
  if (!enRuta(jornada)) return { label: 'Cerrada', color: 'gray', normal: true, punto: COLOR.cerrada }
  if (sinCerrar(jornada, ahora)) return { label: `Sin cerrar desde el ${diaCorto(jornada.salida)}`, color: 'red', normal: false, punto: COLOR.sinSenal }
  if (sinUbicacionReciente(jornada, ahora)) {
    const desde = jornada.ultima_ubicacion_en ? haceCuanto(new Date(jornada.ultima_ubicacion_en).getTime(), ahora) : 'nunca'
    return { label: `Sin ubicación · ${desde}`, color: 'red', normal: false, punto: COLOR.sinSenal }
  }
  return { label: 'En ruta', color: 'amber', normal: false, punto: COLOR.enRuta }
}

// Encuadra el mapa solo cuando cambia `clave` (otra jornada, o llegó su recorrido): si se reencuadrara con
// cada punto nuevo, el mapa saltaría mientras alguien lo está moviendo.
function Encuadre({ limites, clave }) {
  const mapa = useMap()
  const ultimos = useRef(limites)
  useEffect(() => { ultimos.current = limites })
  useEffect(() => {
    const l = ultimos.current
    if (!l) return
    const [[s, o], [n, e]] = l
    if (s === n && o === e) mapa.setView([s, o], 15)
    else mapa.fitBounds(l, { padding: [36, 36], maxZoom: 15 })
  }, [mapa, clave])
  return null
}

/* ── Mapa: dónde está cada camión y el recorrido de la jornada elegida ── */
function MapaRutas({ jornadas, elegida, onElegir, ahora }) {
  // Cada respuesta dice de qué jornada es: al elegir otra, useConsulta conserva la anterior mientras
  // carga, y sin esto se dibujaría (y encuadraría) el recorrido equivocado.
  const turno = elegida?.turno_id
  const recorrido = useConsulta(() => listarRecorrido(turno).then(filas => ({ turno, filas })), [turno], { activo: !!turno, enVivo: ['ruta_envios'] })
  const ventas = useConsulta(() => listarVentasDeJornada(turno).then(filas => ({ turno, filas })), [turno], { activo: !!turno, enVivo: ['ruta_envios'] })
  const deEsta = (consulta) => (consulta.datos?.turno === turno ? consulta.datos.filas : null)
  const puntos = deEsta(recorrido)
  const linea = (puntos ?? []).map(p => [p.lat, p.lng])
  const conVentas = (deEsta(ventas) ?? []).filter(v => Number.isFinite(v.lat))
  const posiciones = jornadas.filter(j => Number.isFinite(j.lat))

  const limites = limitesDe(linea.length ? [...linea, ...conVentas.map(v => [v.lat, v.lng])] : posiciones.map(j => [j.lat, j.lng]))
  const clave = `${turno}|${puntos ? 'listo' : 'cargando'}|${linea.length > 0}|${posiciones.length}`

  return (
    <div className="card overflow-hidden">
      <div className="section-head">
        <div className="flex items-center gap-2 flex-wrap">
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#627080' }} aria-hidden="true" />
          <span className="section-head-text"><strong>{elegida ? `${elegida.ruta} · ${elegida.chofer ?? '—'}` : 'Mapa'}</strong></span>
          {elegida && (
            <span style={{ fontSize: '.75rem', color: '#627080' }}>
              {recorrido.error ? `Error: ${recorrido.error.message}` : !puntos ? 'Cargando…' : linea.length ? `${plural(linea.length, 'punto')}, ${plural(conVentas.length, 'venta')}` : 'Sin recorrido'}
            </span>
          )}
        </div>
      </div>
      <div style={{ height: 380 }} role="region" aria-label="Mapa de los camiones">
        <MapContainer center={CENTRO_QRO} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Encuadre limites={limites} clave={clave} />
          {linea.length > 1 && <Polyline positions={linea} pathOptions={{ color: COLOR.enRuta, weight: 4, opacity: 0.75 }} />}
          {conVentas.map(v => (
            <CircleMarker key={v.id} center={[v.lat, v.lng]} radius={6}
              pathOptions={{ color: '#fff', weight: 2, fillColor: v.estado === 'CANCELADA' ? COLOR.cancelada : COLOR.venta, fillOpacity: 1 }}>
              <Etiqueta>{`${v.folio.split('-').pop()} · ${hora(v.fecha)} · ${pesos(v.total_centavos)}${v.estado === 'CANCELADA' ? ' · cancelada' : ''}`}</Etiqueta>
            </CircleMarker>
          ))}
          {posiciones.map(j => {
            const est = estadoDe(j, ahora)
            const actual = j.turno_id === elegida?.turno_id
            return (
              <CircleMarker key={j.turno_id} center={[j.lat, j.lng]} radius={actual ? 11 : 8}
                pathOptions={{ color: '#fff', weight: 3, fillColor: est.punto, fillOpacity: 1 }}
                eventHandlers={{ click: () => onElegir(j.turno_id) }}>
                <Etiqueta>{`${j.ruta} · ${j.chofer ?? '—'} · ${est.label}`}</Etiqueta>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 px-5 py-3 text-xs" style={{ color: '#627080', borderTop: '1px solid #E8EBEF' }}>
        {[[COLOR.enRuta, 'En ruta'], [COLOR.sinSenal, `Sin ubicación (+${MINUTOS_SIN_UBICACION} min)`], [COLOR.cerrada, 'Cerrada'], [COLOR.venta, 'Venta'], [COLOR.cancelada, 'Cancelada']].map(([c, t]) => (
          <span key={t} className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />{t}</span>
        ))}
      </div>
    </div>
  )
}

/* ── Detalle de una jornada: liquidación, merma y ventas ──── */
function DetalleJornada({ jornada, onClose }) {
  const { datos: ventas, cargando, error, recargar } = useConsulta(() => listarVentasDeJornada(jornada.turno_id), [jornada.turno_id], { enVivo: ['ruta_envios'] })
  const mermas = useConsulta(() => listarMermasDeJornada(jornada.turno_id), [jornada.turno_id], { enVivo: ['ruta_envios'] })
  const cerrada = !enRuta(jornada)
  const est = estadoDe(jornada, Date.now())

  return (
    <Modal
      onClose={onClose}
      maxWidth="lg"
      header={
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold" style={{ color: '#263442' }}>{jornada.ruta}</h3>
            <Badge label={est.label} color={est.color} />
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#627080' }}>{jornada.camion} · {diaCorto(jornada.salida)}</p>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <InfoCell label="Chofer" value={jornada.chofer ?? '—'} center />
          <InfoCell label="Salió" value={hora(jornada.salida)} center />
          <InfoCell label="Cerró" value={cerrada ? hora(jornada.cierre) : '—'} center />
          <InfoCell label="Fondo" value={pesos(jornada.fondo_centavos)} center />
          <InfoCell label="Vendido" value={pesos(jornada.vendido_centavos)} center bold />
          <InfoCell label="Ventas" value={`${jornada.ventas}${jornada.canceladas ? ` · ${jornada.canceladas} canc.` : ''}`} center />
        </div>

        {cerrada && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8EBEF' }}>
            {[
              ['Debía entregar', pesos(jornada.efectivo_esperado_centavos)],
              // Si el almacén lo contó billete por billete en el teléfono, con qué se entregó
              ['Entregó', pesos(jornada.efectivo_contado_centavos), textoDesglose(jornada.efectivo_desglose)],
            ].map(([t, v, desglose]) => (
              <div key={t} className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: '1px solid #E8EBEF' }}>
                <span className="min-w-0">
                  <span className="block text-sm" style={{ color: '#627080' }}>{t}</span>
                  {desglose && <span className="block text-xs mt-0.5" style={{ color: '#627080' }}>{desglose}</span>}
                </span>
                <span className="text-sm font-semibold flex-shrink-0" style={{ color: '#263442' }}>{v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3.5" style={{ background: jornada.a_cargo_centavos ? 'rgba(201,122,109,.08)' : 'rgba(5,150,105,.08)' }}>
              <span className="text-sm font-bold" style={{ color: '#263442' }}>A cargo del chofer</span>
              <span className="text-base font-bold" style={{ color: jornada.a_cargo_centavos ? '#8A4A42' : '#047857' }}>
                {jornada.a_cargo_centavos ? pesos(jornada.a_cargo_centavos) : 'Sin diferencias'}
              </span>
            </div>
          </div>
        )}

        {(mermas.datos ?? []).length > 0 && (
          <div>
            <p className="text-[0.8125rem] font-semibold mb-2" style={{ color: '#627080' }}>
              Merma ({pesos(mermas.datos.reduce((s, m) => s + (m.importe_centavos ?? 0), 0))})
            </p>
            <ul className="space-y-1.5">
              {mermas.datos.map(m => (
                <li key={m.id} className="rounded-xl px-3 py-2 flex items-center justify-between gap-3" style={{ background: 'rgba(217,119,6,.08)' }}>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold truncate" style={{ color: '#263442' }}>{m.cantidad}{m.unidad === 'KG' ? ' kg' : ''} · {m.descripcion ?? 'Producto'}</span>
                    <span className="block text-xs" style={{ color: '#627080' }}>{hora(m.fecha)} · {m.motivo}</span>
                  </span>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: '#92400E', fontVariantNumeric: 'tabular-nums' }}>
                    {m.importe_centavos != null ? pesos(m.importe_centavos) : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-[0.8125rem] font-semibold mb-2" style={{ color: '#627080' }}>Ventas</p>
          <AvisoError error={error} onReintentar={recargar} />
          {cargando ? <SkeletonTableRows rows={3} /> : (ventas ?? []).length === 0 ? (
            <p className="text-sm" style={{ color: '#627080' }}>Todavía no hay ventas en esta jornada.</p>
          ) : (
            <ul className="space-y-1.5" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {ventas.map(v => (
                <li key={v.id} className="rounded-xl px-3 py-2" style={{ background: v.estado === 'CANCELADA' ? 'rgba(201,122,109,.08)' : '#F2F3F5' }}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold" style={{ color: '#263442', fontVariantNumeric: 'tabular-nums' }}>
                      {v.folio.split('-').pop()} · {hora(v.fecha)}
                    </span>
                    <span className="text-sm font-bold" style={{ color: v.estado === 'CANCELADA' ? '#8A4A42' : '#263442', fontVariantNumeric: 'tabular-nums', textDecoration: v.estado === 'CANCELADA' ? 'line-through' : 'none' }}>
                      {pesos(v.total_centavos)}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#627080' }}>
                    {[etiquetaMetodo(v.metodo), v.ticket ? TICKET[v.ticket] ?? `ticket ${v.ticket}` : 'ticket pendiente', (v.detalle ?? []).map(r => `${r.cantidad}${r.unidad === 'KG' ? ' kg' : ''} ${r.descripcion}`).join(', ')].filter(Boolean).join(' · ')}
                  </p>
                  {v.estado === 'CANCELADA' && <p className="text-xs mt-0.5 font-semibold" style={{ color: '#8A4A42' }}>Cancelada{v.motivo_cancelacion ? `: ${v.motivo_cancelacion}` : ''}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="px-6 py-4 flex justify-end" style={{ borderTop: '1px solid #E8EBEF' }}>
        <button onClick={onClose} className="btn-primary">Cerrar</button>
      </div>
    </Modal>
  )
}

/* ── Jornadas: camiones del periodo, en el mapa y en la tabla ──── */
function Jornadas({ camiones }) {
  const periodo = usePeriodo('hoy', 'rutas')
  const { dateFrom, dateTo, desde, hasta } = periodo
  const [sucursalId, setSucursalId] = useEstadoSesion('rutas:camion', '')
  const [elegidaId, setElegidaId] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [ahora, setAhora] = useState(Date.now)

  const { datos, cargando, actualizando, error, recargar } = useConsulta(
    () => listarJornadas({ desde, hasta, sucursalId: sucursalId || undefined }),
    [desde, hasta, sucursalId],
    { enVivo: ['ruta_envios'] },
  )
  // "Sin ubicación hace X min" cambia aunque no llegue nada nuevo
  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 30000)
    return () => clearInterval(reloj)
  }, [])
  useEscapeKey(() => setDetalle(null))

  const jornadas = useMemo(() => datos ?? [], [datos])
  const r = useMemo(() => resumenJornadas(jornadas, ahora), [jornadas, ahora])
  const sinSenal = jornadas.filter(j => sinUbicacionReciente(j, ahora)).length
  const elegida = jornadas.find(j => j.turno_id === elegidaId) ?? jornadas.find(enRuta) ?? jornadas[0] ?? null
  const estadoKpi = cargando ? 'cargando' : datos === undefined ? 'error' : null

  const opcionesCamion = [{ valor: '', texto: 'Todos los camiones' }, ...camiones.map(c => ({ valor: c.sucursal_id, texto: `${c.sucursal?.nombre ?? c.nombre} · ${c.nombre}` }))]

  return (
    <>
      <div className="barra-filtros">
        <FiltroPeriodo periodo={periodo} />
        <Selector value={sucursalId} onChange={setSucursalId} opciones={opcionesCamion} etiqueta="Camión" icono={Truck} />
        <EnVivo actualizando={actualizando} error={error} />
      </div>

      <KpiBar estado={estadoKpi} items={[
        { icon: Navigation, label: 'En ruta ahora', value: r.enRuta, good: r.enRuta > 0 && !sinSenal && !r.sinCerrar, alert: sinSenal > 0 || r.sinCerrar > 0,
          sub: [
            r.sinCerrar && `${r.sinCerrar} sin cerrar`,
            sinSenal && `${sinSenal} sin ubicación`,
          ].filter(Boolean).join(', ') || (r.enRuta ? 'con ubicación' : '—') },
        { icon: ShoppingCart, label: 'Vendido', value: pesos(r.vendido), sub: `${plural(r.ventas, 'venta')}${r.merma ? ` · merma ${pesos(r.merma)}` : ''}` },
        { icon: Truck, label: 'Jornadas', value: r.jornadas, sub: `${plural(r.jornadas - r.enRuta - r.sinCerrar, 'cerrada')} · ${rangoCorto(dateFrom, dateTo)}` },
        { icon: AlertTriangle, label: 'A cargo de choferes', value: pesos(r.aCargo), alert: r.aCargo > 0, good: r.aCargo === 0 && r.jornadas > r.enRuta,
          sub: r.conCargo ? plural(r.conCargo, 'jornada') : '—' },
      ]} />

      <AvisoError error={error} onReintentar={recargar} />

      {!cargando && !error && jornadas.length === 0 ? (
        <div className="card">
          <EmptyState icon={Truck} title="Sin jornadas en este periodo" />
        </div>
      ) : (
        <div className="space-y-5">
          {jornadas.length > 0 && <MapaRutas jornadas={jornadas} elegida={elegida} onElegir={setElegidaId} ahora={ahora} />}

          {cargando ? <SkeletonTableRows /> : jornadas.length > 0 && (
            <div className="card overflow-hidden">
              <div className="section-head">
                <div className="flex items-center gap-2 flex-wrap">
                  <Truck className="w-4 h-4 flex-shrink-0" style={{ color: '#627080' }} aria-hidden="true" />
                  <span className="section-head-text"><strong>Jornadas</strong></span>
                  <span style={{ fontSize: '.75rem', color: '#627080' }}>{rangoCorto(dateFrom, dateTo)}</span>
                </div>
              </div>

              <ul className="sm:hidden lista-movil">
                {jornadas.map(j => {
                  const est = estadoDe(j, ahora)
                  return (
                    <li key={j.turno_id}>
                      <button type="button" onClick={() => setDetalle(j)} className="lista-movil-fila" aria-label={`Ver jornada de ${j.ruta}, ${j.chofer ?? ''}`}>
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold truncate" style={{ color: '#263442' }}>{j.ruta} · {j.chofer ?? '—'}</span>
                          <span className="text-sm font-semibold flex-shrink-0" style={{ color: '#263442', fontVariantNumeric: 'tabular-nums' }}>{pesos(j.vendido_centavos)}</span>
                        </span>
                        <span className="flex items-center justify-between gap-3 mt-1">
                          <span className="text-xs truncate" style={{ color: '#627080' }}>{diaCorto(j.salida)} · {horario(j.salida, j.cierre)}</span>
                          <Estado label={est.label} color={est.color} normal={est.normal} />
                          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#D4DDE6' }} aria-hidden="true" />
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="hidden sm:block overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla de jornadas">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Camión</th>
                      <th>Chofer</th>
                      <th>Horario</th>
                      <th>Estado</th>
                      <th>Vendido</th>
                      <th className="hidden md:table-cell">A cargo</th>
                      <th>Ver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jornadas.map(j => {
                      const est = estadoDe(j, ahora)
                      const actual = j.turno_id === elegida?.turno_id
                      return (
                        <tr key={j.turno_id} style={actual ? { background: '#FFF7ED' } : undefined}>
                          <td>
                            <p className="text-sm font-semibold" style={{ color: '#263442' }}>{j.ruta}</p>
                            <p className="text-xs" style={{ color: '#627080' }}>{j.camion}</p>
                          </td>
                          <td><span className="text-sm" style={{ color: '#627080' }}>{j.chofer ?? '—'}</span></td>
                          <td className="whitespace-nowrap" title={`Salió ${fechaHora(j.salida)}`}>
                            <p className="text-xs font-medium" style={{ color: '#263442', fontVariantNumeric: 'tabular-nums' }}>{horario(j.salida, j.cierre)}</p>
                            <p className="text-xs" style={{ color: '#627080' }}>{diaCorto(j.salida)}</p>
                          </td>
                          <td><Estado label={est.label} color={est.color} normal={est.normal} /></td>
                          <td>
                            <p className="text-sm font-semibold" style={{ color: '#263442', fontVariantNumeric: 'tabular-nums' }}>{pesos(j.vendido_centavos)}</p>
                            <p className="text-xs" style={{ color: '#627080' }}>{plural(j.ventas, 'venta')}{j.canceladas ? ` · ${j.canceladas} canc.` : ''}</p>
                            {j.merma_centavos > 0 && <p className="text-xs" style={{ color: '#92400E' }}>merma {pesos(j.merma_centavos)}</p>}
                          </td>
                          <td className="hidden md:table-cell">
                            {enRuta(j)
                              ? <span className="text-sm" style={{ color: '#627080' }}>—</span>
                              : j.a_cargo_centavos
                                ? <span className="text-sm font-semibold" style={{ color: '#8A4A42' }}>{pesos(j.a_cargo_centavos)}</span>
                                : <span className="text-sm" style={{ color: '#047857' }}>Cuadró</span>}
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button onClick={() => setElegidaId(j.turno_id)} className="action-btn" title="Ver en el mapa" aria-label={`Ver en el mapa ${j.ruta}`} aria-pressed={actual}>
                                <MapPin className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDetalle(j)} className="action-btn" title="Ver ventas y liquidación" aria-label={`Ver jornada de ${j.ruta}`}>
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {detalle && <DetalleJornada jornada={detalle} onClose={() => setDetalle(null)} />}
    </>
  )
}

/* ── Alta o cambio de un camión ──── */
function FormCamion({ camion, camiones, onClose, onGuardado }) {
  const { sucursales } = useSucursales()
  const nuevo = !camion
  const [form, setForm] = useState(() => ({
    sucursalId: camion?.sucursal_id ?? '',
    nombre: camion?.nombre ?? '',
    placas: camion?.placas ?? '',
    prefijo: camion?.prefijo ?? '',
    activo: camion?.activo ?? true,
  }))
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const libres = sucursales.filter(s => !s.es_almacen && !camiones.some(c => c.sucursal_id === s.id))
  const cambiar = (campo) => (valor) => { setForm(f => ({ ...f, [campo]: valor })); setError('') }

  const guardar = async () => {
    if (!form.sucursalId) return setError('Elige la sucursal del camión')
    if (!form.nombre.trim()) return setError('Escribe el nombre del camión')
    if (!/^[A-Z0-9]{2,10}$/i.test(form.prefijo.trim())) return setError('El prefijo lleva de 2 a 10 letras o números, sin espacios')
    setGuardando(true)
    try {
      await guardarCamion(form)
      toast.success(nuevo ? 'Camión agregado' : 'Camión actualizado', form.nombre.trim())
      onGuardado()
    } catch (e) {
      setError(e.message)
      setGuardando(false)
    }
  }

  return (
    <Modal title={nuevo ? 'Agregar camión' : `Editar ${camion.nombre}`} onClose={onClose}>
      <div className="p-6 space-y-4">
        {nuevo ? (
          <FormField label="Sucursal del camión" required>
            {libres.length ? (
              <Selector value={form.sucursalId} onChange={cambiar('sucursalId')} etiqueta="Sucursal del camión"
                opciones={[{ valor: '', texto: 'Elige una sucursal' }, ...libres.map(s => ({ valor: s.id, texto: s.nombre }))]} />
            ) : (
              <p className="text-sm" style={{ color: '#627080' }}>No hay sucursales libres. Da de alta la sucursal en la caja del almacén.</p>
            )}
          </FormField>
        ) : (
          <InfoCell label="Sucursal" value={camion.sucursal?.nombre ?? '—'} />
        )}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nombre" required>
            <input className="input-field" placeholder="Camión 1" value={form.nombre} onChange={e => cambiar('nombre')(e.target.value)} />
          </FormField>
          <FormField label="Placas">
            <input className="input-field" placeholder="JAL-123-B" value={form.placas} onChange={e => cambiar('placas')(e.target.value.toUpperCase())} />
          </FormField>
        </div>
        <FormField label="Prefijo de folios" required>
          <input className="input-field" placeholder="RNORTE" maxLength={10} value={form.prefijo} onChange={e => cambiar('prefijo')(e.target.value.toUpperCase().replace(/\s/g, ''))} />
          <p className="text-xs mt-1" style={{ color: '#627080' }}>Ej. {form.prefijo.trim() || 'RNORTE'}-3F25-000001</p>
        </FormField>
        {!nuevo && <Interruptor activo={form.activo} onChange={cambiar('activo')}>Activo</Interruptor>}
        {error && <p className="text-sm font-semibold" role="alert" style={{ color: '#8A4A42' }}>{error}</p>}
      </div>
      <ModalFooter onCancel={onClose} onConfirm={guardar} disabled={guardando || (nuevo && !libres.length)} confirmLabel={guardando ? 'Guardando…' : 'Guardar'} />
    </Modal>
  )
}

/* ── Camiones: alta, prefijo de folios y teléfonos ligados ──── */
function Camiones({ consulta }) {
  const { datos, cargando, error, recargar } = consulta
  const [editando, setEditando] = useState(undefined) // undefined: cerrado · null: nuevo · camión: editar
  const camiones = datos ?? []
  useEscapeKey(() => setEditando(undefined))

  return (
    <div className="space-y-5">
      <AvisoError error={error} onReintentar={recargar} />
      {cargando ? <SkeletonTableRows rows={3} /> : (
        <div className="card overflow-hidden">
          <div className="section-head">
            <div className="flex items-center gap-2 flex-wrap">
              <Truck className="w-4 h-4 flex-shrink-0" style={{ color: '#627080' }} aria-hidden="true" />
              <span className="section-head-text"><strong>Camiones</strong></span>
              {datos !== undefined && <span style={{ fontSize: '.75rem', color: '#627080' }}>{plural(camiones.length, 'camión', 'camiones')}</span>}
            </div>
            <button className="btn-primary" onClick={() => setEditando(null)} disabled={datos === undefined}><Plus className="w-4 h-4" /> Agregar camión</button>
          </div>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla de camiones">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Camión</th>
                  <th>Folios</th>
                  <th className="hidden md:table-cell">Teléfonos</th>
                  <th>Estado</th>
                  <th>Editar</th>
                </tr>
              </thead>
              <tbody>
                {camiones.map(c => (
                  <tr key={c.sucursal_id}>
                    <td>
                      <p className="text-sm font-semibold" style={{ color: '#263442' }}>{c.nombre}{c.placas ? ` · ${c.placas}` : ''}</p>
                      <p className="text-xs" style={{ color: '#627080' }}>{c.sucursal?.nombre ?? '—'}</p>
                    </td>
                    <td><span className="text-sm font-semibold" style={{ color: '#263442', fontFamily: 'ui-monospace, monospace' }}>{c.prefijo}</span></td>
                    <td className="hidden md:table-cell">
                      {c.telefonos.length === 0 ? <span className="text-sm" style={{ color: '#627080' }}>Ninguno ligado</span> : c.telefonos.map(t => (
                        <p key={t.dispositivo_id} className="text-xs" style={{ color: '#627080' }}>
                          Terminal <strong style={{ color: '#263442' }}>{t.terminal}</strong> · {t.cuenta?.usuario ?? '—'} · {t.ultimo_contacto ? `subió ${haceCuanto(new Date(t.ultimo_contacto).getTime())}` : 'sin subir nada'}
                        </p>
                      ))}
                    </td>
                    <td><Estado label={c.activo ? 'Activo' : 'Inactivo'} color="gray" normal={c.activo} /></td>
                    <td>
                      <button onClick={() => setEditando(c)} className="action-btn" title="Editar camión" aria-label={`Editar ${c.nombre}`}><Edit className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {datos !== undefined && camiones.length === 0 && (
            <EmptyState icon={Truck} title="Sin camiones" />
          )}
        </div>
      )}

      {editando !== undefined && (
        <FormCamion camion={editando} camiones={camiones} onClose={() => setEditando(undefined)} onGuardado={() => { setEditando(undefined); recargar() }} />
      )}
    </div>
  )
}

export default function Rutas() {
  const [vista, setVista] = useEstadoSesion('rutas:vista', 'jornadas')
  const camiones = useConsulta(listarCamiones, [], { enVivo: ['ruta_envios'] })

  return (
    <div className="space-y-6">
      <PageHeader title="Rutas">
        <Segmentado
          opciones={[{ valor: 'jornadas', texto: 'Jornadas', icono: Receipt }, { valor: 'camiones', texto: 'Camiones', icono: Truck, cuenta: camiones.datos?.length }]}
          value={vista}
          onChange={setVista}
          etiqueta="Vista"
        />
      </PageHeader>
      {vista === 'camiones' ? <Camiones consulta={camiones} /> : <Jornadas camiones={camiones.datos ?? []} />}
    </div>
  )
}
