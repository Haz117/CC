import { Shield, Database, Radio, Eye } from 'lucide-react'
import TablaGenerica from '../../components/TablaGenerica'
import AvisoError from '../../components/AvisoError'
import { SkeletonTableRows } from '../../components/Skeleton'
import { useAuth } from '../../auth/contexto'
import { useConsulta } from '../../hooks/useConsulta'
import { listarConfiguracion } from '../../api/sistema'
import { TABLAS_EN_VIVO } from '../../lib/tiempoReal'
import { Dato } from './piezas'

// Las tablas que se escuchan en vivo, con el nombre que les da la gente
const NOMBRE_TABLA = {
  ventas: 'ventas',
  turnos_caja: 'turnos de caja',
  ordenes_reabastecimiento: 'pedidos de reabastecimiento',
  bloqueos_acceso: 'bloqueos de acceso',
}
const enVivo = TABLAS_EN_VIVO.map(t => NOMBRE_TABLA[t] ?? t.replace(/_/g, ' '))
const listaEnVivo = enVivo.length > 1 ? `${enVivo.slice(0, -1).join(', ')} y ${enVivo.at(-1)}` : enVivo.join('')

/* ── Sistema: conexión y configuracion_general (solo lectura) ── */
export default function Sistema() {
  const { modoDemo } = useAuth()
  const { datos, cargando, error, recargar } = useConsulta(listarConfiguracion)
  const origen = modoDemo ? 'Datos de ejemplo (modo demostración)' : new URL(import.meta.env.VITE_SUPABASE_URL).host

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="card p-6">
        <div className="card-header">
          <div>
            <p className="section-title">Conexión</p>
            <p className="section-sub">La app lee de la misma base con la que se sincronizan las cajas</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Dato icon={Database} label="Origen de los datos">{origen}</Dato>
          <Dato icon={Eye} label="Modo">Solo consulta: la web no registra ventas ni inventario</Dato>
          <Dato icon={Radio} label="Se actualizan en vivo">{listaEnVivo.charAt(0).toUpperCase() + listaEnVivo.slice(1)}</Dato>
          <Dato icon={Shield} label="Seguridad">La base filtra por sucursal según el usuario</Dato>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 pt-6">
          <div className="card-header">
            <div>
              <p className="section-title">Parámetros generales</p>
              <p className="section-sub">Clave y valor globales que usan las cajas · solo lectura</p>
            </div>
          </div>
        </div>
        <AvisoError error={error} onReintentar={recargar} className="mx-6 mb-6" />
        {cargando
          ? <div className="px-6 pb-6"><SkeletonTableRows rows={3} /></div>
          : datos?.length > 0
            ? <TablaGenerica filas={datos} primero={['clave', 'valor']} resolver={{ clave: c => <span className="folio">{c}</span> }} />
            : !error && <p className="px-6 pb-6 text-sm" style={{ color: '#627080' }}>No hay parámetros capturados.</p>}
      </div>
    </div>
  )
}
