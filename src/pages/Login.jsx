import { useState, useRef } from 'react'
import {
  Milk, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  CheckCircle2, Shield, ArrowRight, Zap,
} from 'lucide-react'
import toast from '../utils/toast'

const DEMO_USERS = [
  { email: 'admin@cremeria.mx', password: '123456', nombre: 'Carlos Mendoza', rol: 'Superadministrador' },
]

const KPI_STATS = [
  { value: '$47,800', label: 'Ventas hoy'    },
  { value: '87',      label: 'Transacciones' },
  { value: '18/21',   label: 'Cajas activas' },
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
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#1C0702 0%,#7c2d12 30%,#C2410C 60%,#EA580C 82%,#F97316 100%)' }}
    >
      {/* Dot grid */}
      <div className="hero-dots absolute inset-0 opacity-[0.07] pointer-events-none" />

      {/* Anillos decorativos */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[480, 720, 1020, 1380].map((s, i) => (
          <div
            key={s}
            className="absolute rounded-full"
            style={{
              width: s, height: s,
              border: '1px solid rgba(255,255,255,.06)',
              animation: `splashRing ${5 + i * .7}s ease-in-out infinite`,
              animationDelay: `${i * .6}s`,
            }}
          />
        ))}
      </div>

      {/* Resplandor superior */}
      <div
        className="absolute -top-48 -right-24 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(251,146,60,.22) 0%,transparent 65%)' }}
      />
      {/* Resplandor inferior */}
      <div
        className="absolute -bottom-48 -left-24 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(194,65,12,.35) 0%,transparent 65%)' }}
      />

      {/* ── Tarjeta principal ── */}
      <div
        className="relative z-10 w-full animate-scale-in"
        style={{ maxWidth: 460, margin: '1.5rem' }}
      >
        {/* ── Cabecera de la tarjeta — fondo oscuro ── */}
        <div
          className="rounded-t-[28px] px-8 pt-8 pb-7 relative overflow-hidden"
          style={{
            background: 'linear-gradient(150deg,#431407 0%,#7c2d12 55%,#9a3412 100%)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}
        >
          {/* Textura sutil */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative z-10">
            {/* Logo row */}
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255,255,255,.13)',
                  border: '1.5px solid rgba(255,255,255,.22)',
                  boxShadow: '0 4px 16px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.16)',
                }}
              >
                <Milk className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-[15px] leading-tight tracking-tight">
                  Cremerías Admin
                </p>
                <p className="text-[11px] font-medium" style={{ color: 'rgba(253,186,116,.65)' }}>
                  Sistema de Punto de Venta
                </p>
              </div>

              {/* Live badge */}
              <div className="ml-auto flex items-center gap-1.5">
                <span className="live-dot" />
                <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,.45)' }}>
                  EN LÍNEA
                </span>
              </div>
            </div>

            {/* KPI mini-row */}
            <div className="grid grid-cols-3 gap-2.5 animate-fade-in-up delay-50">
              {KPI_STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl px-3 py-2.5"
                  style={{
                    background: 'rgba(255,255,255,.07)',
                    border: '1px solid rgba(255,255,255,.09)',
                  }}
                >
                  <p className="font-black text-white leading-none" style={{ fontSize: '1.05rem', letterSpacing: '-.03em' }}>
                    {s.value}
                  </p>
                  <p className="text-[10px] font-semibold mt-1" style={{ color: 'rgba(253,186,116,.55)' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Cuerpo de la tarjeta — blanco ── */}
        <div
          className="rounded-b-[28px] px-8 pt-7 pb-8 animate-fade-in-up delay-75"
          style={{
            background: '#fff',
            boxShadow: '0 32px 80px rgba(0,0,0,.38), 0 8px 24px rgba(0,0,0,.18)',
          }}
        >
          {/* Encabezado del form */}
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[.18em] mb-1.5" style={{ color: '#F97316' }}>
              Bienvenido de nuevo
            </p>
            <h2
              className="font-black tracking-tight leading-none"
              style={{ fontSize: '1.625rem', color: '#1A1A1A' }}
            >
              Inicia sesión
            </h2>
            <p className="text-sm mt-1.5 font-medium" style={{ color: '#8FA1B2' }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-3 text-sm px-4 py-3 rounded-2xl mb-5 animate-shake"
              style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.28)', color: '#A05A52' }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Formulario */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" aria-label="Inicio de sesión">

            {/* Correo */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-[10px] font-black mb-2 uppercase tracking-[.14em]"
                style={{ color: '#8FA1B2' }}
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: '#FB923C' }}
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="usuario@cremeria.mx"
                  autoComplete="email"
                  autoFocus
                  className="input-field pl-11"
                  style={{ padding: '12px 14px 12px 42px', background: '#FFFBF7' }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="text-[10px] font-black uppercase tracking-[.14em]"
                  style={{ color: '#8FA1B2' }}
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: '#F97316' }}
                  onClick={() => toast.info('Modo demo', 'Usa las credenciales del recuadro para ingresar.')}
                >
                  ¿Olvidaste?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: '#FB923C' }}
                />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-field pr-12"
                  style={{ padding: '12px 48px 12px 42px', background: '#FFFBF7' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                  style={{ color: '#FB923C' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#C2410C' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#FB923C' }}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Recordar sesión */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                aria-label="Mantener sesión iniciada"
                onClick={() => setRemember(v => !v)}
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={remember
                  ? { background: '#F97316', borderColor: '#F97316', boxShadow: '0 0 0 3px rgba(249,115,22,.18)' }
                  : { borderColor: '#E2EAF2', background: '#fff' }
                }
              >
                {remember && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>
              <span
                className="text-sm font-medium cursor-pointer select-none"
                style={{ color: '#627080' }}
                onClick={() => setRemember(v => !v)}
              >
                Mantener sesión iniciada
              </span>
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-2xl"
              style={{ padding: '13px 20px', fontSize: '15px', marginTop: '4px' }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                : <>Iniciar sesión <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: '#F2F3F5' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#D4DDE6' }}>
              Demo rápida
            </span>
            <div className="flex-1 h-px" style={{ background: '#F2F3F5' }} />
          </div>

          {/* Demo box */}
          <div
            className="rounded-2xl p-4"
            style={{ background: '#FFF8F0', border: '1px solid #FDE8D0' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" style={{ color: '#F97316' }} />
                <p className="text-[10px] font-black uppercase tracking-[.14em]" style={{ color: '#F97316' }}>
                  Acceso de prueba
                </p>
              </div>
              <span
                className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74' }}
              >
                Sin registro
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div
                className="flex-1 rounded-xl px-3 py-2"
                style={{ background: '#fff', border: '1px solid #FDE8D0' }}
              >
                <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#8FA1B2' }}>Correo</p>
                <p className="text-xs font-bold font-mono" style={{ color: '#C2410C' }}>admin@cremeria.mx</p>
              </div>
              <div
                className="flex-1 rounded-xl px-3 py-2"
                style={{ background: '#fff', border: '1px solid #FDE8D0' }}
              >
                <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#8FA1B2' }}>Contraseña</p>
                <p className="text-xs font-bold font-mono" style={{ color: '#C2410C' }}>123456</p>
              </div>
            </div>

            <button
              type="button"
              onClick={fillDemo}
              disabled={loading}
              className="btn-primary w-full rounded-xl"
              style={{ fontSize: '13.5px', padding: '10px 18px' }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                : 'Entrar a la demo →'
              }
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <Shield className="w-3 h-3" style={{ color: '#D4DDE6' }} />
            <p className="text-[11px] font-medium" style={{ color: '#C8D0D8' }}>
              Cifrado SSL · Acceso seguro · © 2026 Cremerías Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
