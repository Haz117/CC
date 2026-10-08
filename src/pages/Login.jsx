import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User, Loader2, CheckCircle2, ArrowRight, ArrowLeft, PlugZap } from 'lucide-react'
import PantallaAcceso from '../components/PantallaAcceso'
import { useAuth } from '../auth/contexto'
import { getRecordarSesion, aCorreo } from '../lib/supabase'
import { esCorreo } from '../utils/validar'

const etiqueta   = { fontSize: 12, fontWeight: 700, color: '#627080', letterSpacing: '.02em' }
const iconoCampo = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#FB923C', pointerEvents: 'none' }
const enlace     = { fontSize: 12, fontWeight: 600, color: '#F97316', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }

// Solo hay inicio de sesión y recuperar contraseña: el registro libre está desactivado en la base.
export default function Login() {
  const {
    iniciarSesion, recuperarContrasena, entrarDemo, aviso, limpiarAviso,
    demoDisponible, supabaseConfigurado, errorConfiguracion,
  } = useAuth()
  const [vista,    setVista]    = useState('entrar') // entrar | recuperar
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(getRecordarSesion)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [enviado,  setEnviado]  = useState(false)

  const limpiar = () => { setError(''); limpiarAviso() }
  const cambiarVista = (v) => { limpiar(); setEnviado(false); setVista(v) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    limpiar()
    if (!email.trim() || !password) { setError('Escribe tu usuario y tu contraseña.'); return }
    setLoading(true)
    try {
      await iniciarSesion(aCorreo(email), password, remember)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleRecuperar = async (e) => {
    e.preventDefault()
    limpiar()
    if (!esCorreo(email.trim())) { setError('Las cuentas que entran con usuario no tienen correo: pide a quien administra la base que te asigne una contraseña nueva.'); return }
    setLoading(true)
    try {
      await recuperarContrasena(email.trim())
      setEnviado(true)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleDemo = async () => {
    limpiar()
    setLoading(true)
    await entrarDemo()
  }

  // Se entra con usuario; el enlace de recuperación solo sirve para cuentas dadas de alta con correo.
  const entrando = vista === 'entrar'
  const IconoCampo = entrando ? User : Mail
  const campoCorreo = (
    <div style={{ marginBottom: 28 }}>
      <label htmlFor="login-email" style={{ ...etiqueta, display: 'block', marginBottom: 10 }}>{entrando ? 'Usuario' : 'Correo electrónico'}</label>
      <div style={{ position: 'relative' }}>
        <IconoCampo style={iconoCampo} />
        <input
          id="login-email"
          type={entrando ? 'text' : 'email'}
          value={email}
          onChange={e => { setEmail(e.target.value); limpiar() }}
          placeholder={entrando ? 'tu usuario' : 'correo@ejemplo.com'}
          autoComplete={entrando ? 'username' : 'email'}
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          disabled={!supabaseConfigurado}
          className="input-field"
          style={{ paddingLeft: 44, paddingTop: 15, paddingBottom: 15, fontSize: 14 }}
        />
      </div>
    </div>
  )

  if (vista === 'recuperar') {
    return (
      <PantallaAcceso
        titulo="Recupera tu acceso"
        subtitulo="Solo para cuentas dadas de alta con correo. Si entras con usuario, pide a quien administra la base una contraseña nueva."
        error={error}
        exito={enviado && 'Si el correo está registrado, en unos minutos recibirás el enlace. Revisa también el correo no deseado.'}
      >
        <form onSubmit={handleRecuperar} aria-label="Recuperar contraseña" noValidate>
          {campoCorreo}
          <button type="submit" disabled={loading || enviado} className="btn-primary w-full" style={{ padding: '16px 24px', fontSize: 15, borderRadius: 14 }}>
            {loading
              ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Enviando...</>
              : <>Enviar enlace <ArrowRight style={{ width: 16, height: 16 }} /></>
            }
          </button>
        </form>
        <button type="button" onClick={() => cambiarVista('entrar')} style={{ ...enlace, display: 'flex', alignItems: 'center', gap: 6, marginTop: 28 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Volver a iniciar sesión
        </button>
      </PantallaAcceso>
    )
  }

  return (
    <PantallaAcceso
      titulo="Inicia sesión"
      subtitulo="Entra con tu usuario y tu contraseña"
      error={error || aviso || errorConfiguracion}
    >
      {!supabaseConfigurado && !errorConfiguracion && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, lineHeight: 1.5, padding: '13px 16px', borderRadius: 12, marginBottom: 32, background: '#FFF7ED', border: '1px solid #FDBA74', color: '#C2410C' }}>
          <PlugZap style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2 }} />
          <span>
            <strong>Falta configurar la conexión.</strong> Pon <code>VITE_SUPABASE_URL</code> y{' '}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> en el archivo <code>.env.local</code> y reinicia el servidor.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} aria-label="Inicio de sesión" noValidate>
        {campoCorreo}

        {/* Contraseña */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label htmlFor="login-password" style={etiqueta}>Contraseña</label>
            <button type="button" style={enlace} disabled={!supabaseConfigurado} onClick={() => cambiarVista('recuperar')}>
              ¿Olvidaste?
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock style={iconoCampo} />
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); limpiar() }}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={!supabaseConfigurado}
              className="input-field"
              style={{ paddingLeft: 44, paddingRight: 48, paddingTop: 15, paddingBottom: 15, fontSize: 14 }}
            />
            <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8FA1B2', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
              {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
        </div>

        {/* Recordar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <button type="button" role="checkbox" aria-checked={remember} aria-label="Mantener sesión iniciada" onClick={() => setRemember(v => !v)}
            style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', ...(remember ? { background: '#F97316', borderColor: '#F97316' } : { background: '#fff', borderColor: '#D4DDE6' }) }}>
            {remember && <CheckCircle2 style={{ width: 11, height: 11, color: '#fff' }} strokeWidth={3} />}
          </button>
          <span style={{ fontSize: 13, color: '#627080', cursor: 'pointer', userSelect: 'none' }} onClick={() => setRemember(v => !v)}>
            Mantener sesión iniciada
          </span>
        </div>

        <button type="submit" disabled={loading || !supabaseConfigurado} className="btn-primary w-full" style={{ padding: '16px 24px', fontSize: 15, borderRadius: 14 }}>
          {loading
            ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Verificando...</>
            : <>Iniciar sesión <ArrowRight style={{ width: 16, height: 16 }} /></>
          }
        </button>
      </form>

      {demoDisponible && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '40px 0 24px' }}>
            <div style={{ flex: 1, height: 1, background: '#FDE8D0' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#627080', letterSpacing: '.12em', textTransform: 'uppercase' }}>demostración</span>
            <div style={{ flex: 1, height: 1, background: '#FDE8D0' }} />
          </div>
          <p style={{ fontSize: 12, color: '#627080', marginBottom: 12, lineHeight: 1.5 }}>
            Datos de ejemplo, sin conexión a la base.
          </p>
          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            style={{ width: '100%', padding: '12px 8px', borderRadius: 12, background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FDE8D0' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFF7ED' }}
          >
            Entrar en modo demostración
          </button>
        </>
      )}
    </PantallaAcceso>
  )
}
