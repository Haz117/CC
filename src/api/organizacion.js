import { supabase } from '../lib/supabase'
import { esDemo, demo, filas, aErrorDatos, conCache } from './fuente'

const porNombre = (campo) => (a, b) => String(a[campo] ?? '').localeCompare(String(b[campo] ?? ''), 'es')

// Sucursales; una es el almacén central (es_almacen = true). Todos los usuarios ligados pueden leerlas.
export function listarSucursales() {
  return conCache('sucursales', 5 * 60_000, async () => {
    if (esDemo()) return (await demo()).listarSucursales()
    const sucursales = await filas(supabase.from('sucursales').select('*').is('eliminado_en', null))
    return sucursales.sort(porNombre('nombre'))
  })
}

// Personas con rol. Un supervisor o cajero solo recibe a los de su sucursal y a sí mismo.
export async function listarUsuarios() {
  if (esDemo()) return (await demo()).listarUsuarios()
  const usuarios = await filas(supabase.from('usuarios').select('*').is('eliminado_en', null))
  return usuarios.sort(porNombre('nombre_completo'))
}

// Versión ligera para contar usuarios por sucursal sin traer todas las columnas.
export async function listarUsuariosSlim() {
  if (esDemo()) return (await demo()).listarUsuarios()
  return filas(supabase.from('usuarios').select('id, sucursal_id, activo').is('eliminado_en', null))
}

// Liga a una persona de `usuarios` con su cuenta de Auth. Solo administrador.
// Antes hay que crear la cuenta en el panel: Authentication → Users → Add user (con Auto Confirm User).
export async function vincularUsuario(usuarioId, correo) {
  if (esDemo()) return (await demo()).vincularUsuario(usuarioId, correo)
  const { error } = await supabase.rpc('vincular_usuario', { p_usuario_id: usuarioId, p_correo: correo })
  if (error) throw aErrorDatos(error)
}

// Meta mensual de venta por sucursal (una por año y mes).
export async function listarMetas(dia = new Date()) {
  if (esDemo()) return (await demo()).listarMetas()
  return filas(
    supabase.from('metas_sucursal').select('sucursal_id, meta_centavos')
      .eq('anio', dia.getFullYear()).eq('mes', dia.getMonth() + 1),
  )
}

// Lo que cada sucursal le debe al almacén (cargos menos abonos).
export async function listarSaldosCredito() {
  if (esDemo()) return (await demo()).listarSaldosCredito()
  return filas(supabase.from('v_saldo_credito').select('sucursal_id, saldo_centavos'))
}
