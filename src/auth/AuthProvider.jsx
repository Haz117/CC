import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from './contexto'
import { supabase, supabaseConfigurado, errorConfiguracion, setRecordarSesion } from '../lib/supabase'
import { cerrarCanales } from '../lib/tiempoReal'
import { fijarDemo, esDemo, limpiarCache, demo } from '../api/fuente'
import { esAdmin } from '../lib/navegacion'

const SIN_USUARIO = 'Sin acceso: tu cuenta no está ligada a un usuario activo. Pide a un administrador que la vincule.'
const ES_CAJA     = 'Sin acceso: esta es la cuenta de una caja de escritorio y no puede entrar a la app web.'
const NO_ES_ADMIN = 'Sin acceso: la app web es solo para el administrador.'

// El modo demostración solo se ofrece si no hay conexión configurada, o si se pide a propósito.
const demoDisponible = !supabaseConfigurado || import.meta.env.VITE_MODO_DEMO === 'true'

class AccesoDenegado extends Error {}

function mensajeAuth(error) {
  const texto = error?.message || ''
  if (/invalid login credentials/i.test(texto)) return 'Usuario o contraseña incorrectos.'
  if (/email not confirmed/i.test(texto))       return 'La cuenta aún no está confirmada. Pide a un administrador que la active.'
  if (/rate limit|too many/i.test(texto))       return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (/at least|weak|password should/i.test(texto)) return 'La contraseña debe tener al menos 8 caracteres.'
  if (/different from the old/i.test(texto))    return 'La nueva contraseña debe ser distinta a la anterior.'
  if (/failed to fetch|networkerror|load failed/i.test(texto)) return 'No se pudo conectar con el servidor. Revisa tu conexión a internet.'
  return texto || 'No se pudo completar la operación.'
}

// Le pregunta a la base quién es el usuario de la sesión: su rol y su sucursal.
async function consultarPerfil() {
  const { data, error } = await supabase.rpc('mi_perfil')
  if (error) throw new Error(mensajeAuth(error))
  const perfil = Array.isArray(data) ? data[0] : data
  if (!perfil) throw new AccesoDenegado(SIN_USUARIO)
  // Las cuentas de las cajas ven y cambian todas las sucursales: la web nunca entra con una.
  if (perfil.tipo !== 'USUARIO') throw new AccesoDenegado(ES_CAJA)
  // La web consume los datos de todas las sucursales y el almacén: eso solo lo ve el administrador.
  if (!esAdmin(perfil)) throw new AccesoDenegado(NO_ES_ADMIN)
  return perfil
}

export default function AuthProvider({ children }) {
  const [estado, setEstado]           = useState(supabaseConfigurado ? 'cargando' : 'fuera') // cargando | fuera | dentro
  const [perfil, setPerfil]           = useState(null)
  const [aviso, setAviso]             = useState(null)
  const [recuperando, setRecuperando] = useState(false)
  const cuenta  = useRef(null) // id de Auth cuyo perfil ya está validado
  const enCurso = useRef(null)

  const salir = useCallback(() => {
    cuenta.current = null
    setPerfil(null)
    setRecuperando(false)
    setEstado('fuera')
    limpiarCache()
    cerrarCanales()
  }, [])

  // Valida la sesión contra mi_perfil(). Si la cuenta no puede entrar, cierra la sesión.
  const entrar = useCallback((sesion) => {
    if (enCurso.current?.id === sesion.user.id) return enCurso.current.promesa

    const promesa = (async () => {
      try {
        const nuevo = { ...(await consultarPerfil()), correo: sesion.user.email }
        if (cuenta.current !== sesion.user.id) limpiarCache()
        cuenta.current = sesion.user.id
        // En las revalidaciones el perfil casi nunca cambia: se conserva el objeto para no repintar todo.
        setPerfil(previo => (previo && JSON.stringify(previo) === JSON.stringify(nuevo) ? previo : nuevo))
        setAviso(null)
        setEstado('dentro')
      } catch (error) {
        if (error instanceof AccesoDenegado) {
          setAviso(error.message)
          await supabase.auth.signOut()
        } else if (cuenta.current === null) {
          setAviso(error.message)
          setEstado('fuera')
        }
        throw error
      } finally {
        enCurso.current = null
      }
    })()

    enCurso.current = { id: sesion.user.id, promesa }
    return promesa
  }, [])

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((evento, sesion) => {
      // Se difiere: llamar a supabase dentro de este callback bloquea al cliente de Auth.
      setTimeout(() => {
        if (evento === 'SIGNED_OUT') {
          if (!esDemo()) salir()
          return
        }
        if (evento === 'PASSWORD_RECOVERY') setRecuperando(true)
        if (!sesion) {
          if (evento === 'INITIAL_SESSION') setEstado('fuera')
          return
        }
        // Al entrar, al restaurar la sesión y en cada renovación (cada hora) se vuelve a validar el perfil.
        if (evento === 'TOKEN_REFRESHED' || sesion.user.id !== cuenta.current) entrar(sesion).catch(() => {})
      }, 0)
    })
    return () => data.subscription.unsubscribe()
  }, [entrar, salir])

  const iniciarSesion = useCallback(async (correo, contrasena, recordar) => {
    setRecordarSesion(recordar)
    const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena })
    if (error) throw new Error(mensajeAuth(error))
    if (cuenta.current !== data.user.id) await entrar(data.session)
  }, [entrar])

  const cerrarSesion = useCallback(async () => {
    if (esDemo()) {
      fijarDemo(null)
      salir()
      return
    }
    const { error } = await supabase.auth.signOut()
    // Sin internet no se puede avisar al servidor: se cierra al menos en este dispositivo.
    if (error) await supabase.auth.signOut({ scope: 'local' })
  }, [salir])

  const recuperarContrasena = useCallback(async (correo) => {
    const { error } = await supabase.auth.resetPasswordForEmail(correo, { redirectTo: window.location.origin })
    if (error) throw new Error(mensajeAuth(error))
  }, [])

  const cambiarContrasena = useCallback(async (nueva) => {
    if (esDemo()) return
    const { error } = await supabase.auth.updateUser({ password: nueva })
    if (error) throw new Error(mensajeAuth(error))
    setRecuperando(false)
  }, [])

  const entrarDemo = useCallback(async () => {
    const { PERFIL_DEMO } = await demo()
    fijarDemo(PERFIL_DEMO)
    setPerfil({ ...PERFIL_DEMO, correo: 'demo@cremeria.mx', demo: true })
    setAviso(null)
    setEstado('dentro')
  }, [])

  const valor = useMemo(() => ({
    estado, perfil, aviso, recuperando,
    modoDemo: Boolean(perfil?.demo),
    demoDisponible, supabaseConfigurado, errorConfiguracion,
    limpiarAviso: () => setAviso(null),
    iniciarSesion, cerrarSesion, recuperarContrasena, cambiarContrasena, entrarDemo,
  }), [estado, perfil, aviso, recuperando, iniciarSesion, cerrarSesion, recuperarContrasena, cambiarContrasena, entrarDemo])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
