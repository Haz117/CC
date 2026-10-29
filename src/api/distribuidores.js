import { supabase } from '../lib/supabase'
import { esDemo, demo, filas, aErrorDatos } from './fuente'

/* Personal de ruta: choferes, encargados (autorizan cancelaciones) y almacenistas (firman la carga
   y el cierre). Son personas de `usuarios` con su fila en ruta_personal y un PIN de 4 dígitos que la
   app del camión revisa sin internet. El hash del PIN nunca se lee por la API. */
export const ROL_RUTA = { CHOFER: 'CHOFER', ENCARGADO: 'ENCARGADO', ALMACEN: 'ALMACEN' }
const ETIQUETA_ROL_RUTA = { CHOFER: 'Chofer', ENCARGADO: 'Encargado', ALMACEN: 'Almacén' }
export const etiquetaRolRuta = (rol) => ETIQUETA_ROL_RUTA[rol] ?? rol ?? '—'

export async function listarPersonalRuta() {
  if (esDemo()) return (await demo()).listarPersonalRuta()
  return filas(
    supabase.from('ruta_personal')
      .select('usuario_id, rol_ruta, sucursal_id, activo, actualizado_en, usuario:usuarios(nombre_completo, usuario, activo)'),
  )
}

// Alta o cambio. Sin `pin` conserva el que tenía (al dar de alta es obligatorio).
export async function guardarPersonalRuta({ usuarioId, rol, sucursalId = null, pin = null }) {
  if (esDemo()) return (await demo()).guardarPersonalRuta({ usuarioId, rol, sucursalId, pin })
  const { error } = await supabase.rpc('ruta_guardar_personal', {
    p_usuario_id: usuarioId, p_rol: rol, p_sucursal_id: sucursalId || null, p_pin: pin || null,
  })
  if (error) throw aErrorDatos(error)
}

// Nada se borra: la persona deja de poder entrar a la app del camión.
export async function quitarPersonalRuta(usuarioId) {
  if (esDemo()) return (await demo()).quitarPersonalRuta(usuarioId)
  const { error } = await supabase.rpc('ruta_quitar_personal', { p_usuario_id: usuarioId })
  if (error) throw aErrorDatos(error)
}
