import { useState, useRef } from 'react'
import { Milk, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import toast from '../utils/toast'

const DEMO_USERS = [
  { email: 'admin@cremeria.mx', password: '123456', nombre: 'Carlos Mendoza', rol: 'Superadministrador' },
]

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [remember, setRemember] = useState(false)
  const formRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Ingresa tu correo y contraseña.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1100))
    const user = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (user) { onLogin(user) }
    else { setError('Correo o contraseña incorrectos.'); setLoading(false) }
  }

  const fillDemo = () => {
    setEmail('admin@cremeria.mx')
    setPassword('123456')
    setError('')
    setTimeout(() => formRef.current?.requestSubmit(), 80)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Barra naranja arriba */}
      <div style={{ height: 4, background: 'linear-gradient(to right,#C2410C,#F97316,#FB923C)', flexShrink: 0 }} />

      {/* Contenido */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '56px 32px 40px', maxWidth: 420, width: '100%', margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFF7ED', border: '1.5px solid #FDE8D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Milk style={{ width: 22, height: 22, color: '#F97316' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#111', lineHeight: 1.2 }}>Cremerías Admin</p>
            <p style={{ fontSize: 12, color: '#8FA1B2', marginTop: 3 }}>Sistema de Punto de Venta</p>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-.04em', color: '#111', lineHeight: 1, marginBottom: 10 }}>
            Inicia sesión
          </h1>
          <p style={{ fontSize: 14, color: '#8FA1B2', lineHeight: 1.6 }}>
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-shake" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '13px 16px', borderRadius: 12, marginBottom: 32, background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.22)', color: '#A05A52' }}>
            <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit}>

          {/* Correo */}
          <div style={{ marginBottom: 28 }}>
            <label htmlFor="login-email" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#627080', marginBottom: 10, letterSpacing: '.02em' }}>
              Correo electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#FB923C', pointerEvents: 'none' }} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="usuario@cremeria.mx"
                autoComplete="email"
                autoFocus
                className="input-field"
                style={{ paddingLeft: 44, paddingTop: 15, paddingBottom: 15, fontSize: 14 }}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label htmlFor="login-password" style={{ fontSize: 12, fontWeight: 700, color: '#627080', letterSpacing: '.02em' }}>
                Contraseña
              </label>
              <button type="button" style={{ fontSize: 12, fontWeight: 600, color: '#F97316', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => toast.info('Modo demo', 'Usa las credenciales del recuadro.')}>
                ¿Olvidaste?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#FB923C', pointerEvents: 'none' }} />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-field"
                style={{ paddingLeft: 44, paddingRight: 48, paddingTop: 15, paddingBottom: 15, fontSize: 14 }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8FA1B2', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* Recordar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <button type="button" role="checkbox" aria-checked={remember} onClick={() => setRemember(v => !v)}
              style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', ...(remember ? { background: '#F97316', borderColor: '#F97316' } : { background: '#fff', borderColor: '#D4DDE6' }) }}>
              {remember && <CheckCircle2 style={{ width: 11, height: 11, color: '#fff' }} strokeWidth={3} />}
            </button>
            <span style={{ fontSize: 13, color: '#627080', cursor: 'pointer', userSelect: 'none' }} onClick={() => setRemember(v => !v)}>
              Mantener sesión iniciada
            </span>
          </div>

          {/* Botón */}
          <button type="submit" disabled={loading} className="btn-primary w-full" style={{ padding: '16px 24px', fontSize: 15, borderRadius: 14 }}>
            {loading
              ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Verificando...</>
              : <>Iniciar sesión <ArrowRight style={{ width: 16, height: 16 }} /></>
            }
          </button>

        </form>

        {/* Divisor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '40px 0 32px' }}>
          <div style={{ flex: 1, height: 1, background: '#FDE8D0' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#8FA1B2', letterSpacing: '.12em', textTransform: 'uppercase' }}>demo</span>
          <div style={{ flex: 1, height: 1, background: '#FDE8D0' }} />
        </div>

        {/* Demo — sin cajas anidadas */}
        <div>
          <p style={{ fontSize: 12, color: '#8FA1B2', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, color: '#FB923C' }}>admin@cremeria.mx</span>
            {' · '}
            <span style={{ fontWeight: 700, color: '#FB923C' }}>123456</span>
          </p>
          <button
            type="button"
            onClick={fillDemo}
            disabled={loading}
            style={{ width: '100%', padding: '14px 20px', borderRadius: 12, background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FDE8D0' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFF7ED' }}
          >
            {loading ? 'Verificando...' : 'Entrar a la demo →'}
          </button>
        </div>

      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: 11, color: '#8FA1B2', padding: '0 0 28px' }}>
        © 2026 Cremerías Admin · Acceso seguro SSL
      </p>

    </div>
  )
}
