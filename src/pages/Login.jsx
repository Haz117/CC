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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: '#F5F0EB' }}
    >
      {/* Card */}
      <div
        className="w-full animate-fade-in-up"
        style={{
          maxWidth: 420,
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 4px 32px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04)',
          overflow: 'hidden',
        }}
      >
        {/* Accent bar */}
        <div style={{ height: 4, background: 'linear-gradient(to right,#C2410C,#F97316,#FB923C)' }} />

        <div className="px-8 py-8">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#FFF7ED', border: '1.5px solid #FDE8D0' }}
            >
              <Milk className="w-5 h-5" style={{ color: '#F97316' }} />
            </div>
            <div>
              <p className="font-bold text-[15px] leading-tight" style={{ color: '#1A1A1A' }}>
                Cremerías Admin
              </p>
              <p className="text-[11px]" style={{ color: '#8FA1B2' }}>Sistema de Punto de Venta</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-black text-[1.5rem] leading-none tracking-tight" style={{ color: '#1A1A1A' }}>
              Inicia sesión
            </h1>
            <p className="text-sm mt-1.5" style={{ color: '#8FA1B2' }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2.5 text-sm px-4 py-3 rounded-xl mb-5 animate-shake"
              style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.25)', color: '#A05A52' }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold mb-1.5" style={{ color: '#627080' }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#FB923C' }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="usuario@cremeria.mx"
                  autoComplete="email"
                  autoFocus
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold" style={{ color: '#627080' }}>
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold"
                  style={{ color: '#F97316' }}
                  onClick={() => toast.info('Modo demo', 'Usa las credenciales del recuadro.')}
                >
                  ¿Olvidaste?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#FB923C' }} />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-field"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg"
                  style={{ color: '#8FA1B2' }}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Recordar */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember(v => !v)}
                className="w-4.5 h-4.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={remember
                  ? { width: 18, height: 18, background: '#F97316', borderColor: '#F97316' }
                  : { width: 18, height: 18, borderColor: '#D4DDE6', background: '#fff' }
                }
              >
                {remember && <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </button>
              <span className="text-sm cursor-pointer select-none" style={{ color: '#627080' }} onClick={() => setRemember(v => !v)}>
                Mantener sesión iniciada
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ padding: '12px 20px', fontSize: '14.5px', borderRadius: 14, marginTop: 4 }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                : <>Iniciar sesión <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          {/* Demo */}
          <div className="mt-6 rounded-xl p-4" style={{ background: '#FFF8F0', border: '1px solid #FDE8D0' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: '#FB923C' }}>
              Acceso de demostración
            </p>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 rounded-lg px-3 py-2" style={{ background: '#fff', border: '1px solid #FDE8D0' }}>
                <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#8FA1B2' }}>Correo</p>
                <p className="text-xs font-bold font-mono" style={{ color: '#C2410C' }}>admin@cremeria.mx</p>
              </div>
              <div className="flex-1 rounded-lg px-3 py-2" style={{ background: '#fff', border: '1px solid #FDE8D0' }}>
                <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#8FA1B2' }}>Contraseña</p>
                <p className="text-xs font-bold font-mono" style={{ color: '#C2410C' }}>123456</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              disabled={loading}
              className="w-full text-sm font-bold py-2.5 rounded-xl transition-all"
              style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FDE8D0' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFF7ED' }}
            >
              {loading ? 'Verificando...' : 'Entrar a la demo →'}
            </button>
          </div>

          <p className="text-center text-[11px] mt-5" style={{ color: '#C8D0D8' }}>
            © 2026 Cremerías Admin · Acceso seguro SSL
          </p>
        </div>
      </div>
    </div>
  )
}
