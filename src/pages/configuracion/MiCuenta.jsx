import { useState } from 'react'
import { Building, Shield, UserRound, KeyRound, LogOut } from 'lucide-react'
import Badge from '../../components/Badge'
import CambiarContrasena from '../../components/CambiarContrasena'
import { useAuth } from '../../auth/contexto'
import { etiquetaRol } from '../../lib/navegacion'
import { iniciales } from '../../utils/fmt'
import { Dato } from './piezas'

/* ── Mi cuenta: lo que mi_perfil() dice de la sesión ───────── */
export default function MiCuenta() {
  const { perfil, cerrarSesion } = useAuth()
  const [cambiarClave, setCambiarClave] = useState(false)

  return (
    <div className="card p-6 animate-fade-in-up">
      <div className="card-header">
        <div>
          <p className="section-title">Mi cuenta</p>
          <p className="section-sub">La cuenta con la que entraste a la app</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0" style={{ background: '#FFF7ED', color: '#F97316' }}>
          {iniciales(perfil.nombre)}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight truncate" style={{ color: '#263442' }}>{perfil.nombre}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge label={etiquetaRol(perfil.rol)} color="orange" />
            {perfil.es_almacen && <Badge label="Almacén central" color="gray" dot={false} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Dato icon={UserRound} label="Correo">{perfil.correo ?? '—'}</Dato>
        <Dato icon={Building} label="Sucursal">{perfil.sucursal ?? '—'}</Dato>
        <Dato icon={Shield} label="Rol">{etiquetaRol(perfil.rol)}</Dato>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button className="btn-secondary" onClick={cerrarSesion}><LogOut className="w-4 h-4" /> Cerrar sesión</button>
        <button className="btn-primary" onClick={() => setCambiarClave(true)}><KeyRound className="w-4 h-4" /> Cambiar contraseña</button>
      </div>

      {cambiarClave && <CambiarContrasena onClose={() => setCambiarClave(false)} />}
    </div>
  )
}
