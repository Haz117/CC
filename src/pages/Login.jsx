import { useState, useRef } from 'react'
import {
  Milk, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  CheckCircle2, Shield, ArrowRight, TrendingUp, Users, Monitor, Package, Zap,
} from 'lucide-react'
import toast from '../utils/toast'

const DEMO_USERS = [
  { email: 'admin@cremeria.mx', password: '123456', nombre: 'Carlos Mendoza', rol: 'Superadministrador' },
]

const FEATURES = [
  { icon: TrendingUp, label: 'Ventas en tiempo real',     sub: 'Reportes y analytics por sucursal' },
  { icon: Package,    label: 'Inventario y stock',        sub: 'Alertas automáticas de mínimos'    },
  { icon: Users,      label: 'Gestión de distribuidores', sub: 'Rutas, saldos y cobranza'          },
  { icon: Monitor,    label: 'Cajas y cortes de caja',    sub: 'Cierre de día sin papel'           },
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
    <div className="min-h-screen flex">

      {/* ══════════════════════════════════════════════
          PANEL IZQUIERDO — Marca
      ══════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[54%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#1C0702 0%,#7c2d12 42%,#C2410C 100%)' }}
      >
        {/* Anillos decorativos sutiles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {[380, 640, 920, 1200].map((s, i) => (
            <div
              key={s}
              className="absolute rounded-full"
              style={{
                width: s, height: s,
                border: '1px solid rgba(255,255,255,.045)',
                animation: `splashRing ${4.5 + i * .65}s ease-in-out infinite`,
                animationDelay: `${i * .55}s`,
              }}
            />
          ))}
        </div>

        {/* Resplandor esquina superior derecha */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(249,115,22,.18) 0%,transparent 70%)' }}
        />

        {/* Contenido */}
        <div className="relative z-10 flex flex-col h-full px-14 py-12">

          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.2)' }}
            >
              <Milk className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-[15px] leading-tight tracking-tight">Cremerías Admin</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: 'rgba(251,146,60,.52)' }}>
                Sistema de Punto de Venta
              </p>
            </div>
          </div>

          {/* Headline + KPI */}
          <div className="flex-1 flex flex-col justify-center animate-fade-in-up delay-75">
            <h1 className="font-black text-white leading-[1.07] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 3.2vw, 2.75rem)' }}>
              Administra toda<br />
              tu red de cremerías<br />
              <span style={{ color: '#FED7AA' }}>desde un solo lugar.</span>
            </h1>
            <p className="text-[14.5px] leading-relaxed max-w-[360px] mb-10"
              style={{ color: 'rgba(251,146,60,.58)' }}>
              Ventas, inventario, rutas y distribuidores unificados para la industria láctea.
            </p>

            {/* KPI tiles */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {KPI_STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="rounded-2xl px-4 py-4 animate-fade-in-up"
                  style={{
                    background: 'rgba(255,255,255,.08)',
                    border: '1px solid rgba(255,255,255,.1)',
                    animationDelay: `${120 + i * 60}ms`,
                  }}
                >
                  <p className="font-black text-white leading-none mb-1.5"
                    style={{ fontSize: 'clamp(1.2rem,2vw,1.5rem)', letterSpacing: '-.03em' }}>
                    {s.value}
                  </p>
                  <p className="text-[11px] font-semibold" style={{ color: 'rgba(251,146,60,.52)' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3.5 mb-10 animate-fade-in-up delay-200">
            {FEATURES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.08)' }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,.78)' }} />
                </div>
                <div>
                  <p className="text-white text-[13.5px] font-semibold leading-tight">{label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(251,146,60,.48)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status bar */}
          <div
            className="rounded-2xl px-5 py-3.5 flex items-center gap-3 animate-fade-in-up delay-300"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}
          >
            <span className="live-dot flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-[13.5px]">Sistema operando al 100%</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(251,146,60,.48)' }}>
                5 sucursales · 18 cajas activas
              </p>
            </div>
            <Zap className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(251,146,60,.22)' }} />
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════
          PANEL DERECHO — Formulario (blanco puro)
      ══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col" style={{ background: '#fff' }}>

        {/* Barra de acento */}
        <div className="h-[3px] flex-shrink-0"
          style={{ background: 'linear-gradient(to right,#C2410C,#F97316)' }} />

        {/* Formulario centrado */}
        <div className="flex-1 flex items-center justify-center py-8 sm:py-12 px-5 sm:px-8 overflow-y-auto">
          <div className="w-full max-w-[400px] animate-fade-in-up">

            {/* Logo móvil */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#FFF7ED' }}
              >
                <Milk className="w-5 h-5" style={{ color: '#F97316' }} />
              </div>
              <div>
                <p className="font-bold text-[15px]" style={{ color: '#263442' }}>Cremerías Admin</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: '#8FA1B2' }}>Sistema de Punto de Venta</p>
              </div>
            </div>

            {/* Encabezado */}
            <div className="mb-8">
              <p
                className="text-[10px] font-black uppercase tracking-[.18em] mb-3"
                style={{ color: '#F97316' }}
              >
                Bienvenido de nuevo
              </p>
              <h2
                className="font-black tracking-tight leading-tight"
                style={{ fontSize: 'clamp(1.75rem,3vw,2.1rem)', color: '#C2410C' }}
              >
                Inicia sesión
              </h2>
              <p className="text-sm mt-2 font-medium" style={{ color: '#8FA1B2' }}>
                Ingresa tus credenciales de acceso al sistema
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-3 text-sm px-4 py-3.5 rounded-2xl mb-6 animate-scale-in"
                style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.25)', color: '#A05A52' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Formulario */}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" aria-label="Inicio de sesión">

              {/* Correo */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[10px] font-black mb-2.5 uppercase tracking-[.14em]"
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
                    style={{ padding: '13px 14px 13px 44px', background: '#FFF8F0' }}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
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
                    style={{ padding: '13px 48px 13px 44px', background: '#FFF8F0' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                    style={{ color: '#FB923C' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C2410C' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#FB923C' }}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Recordar sesión */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={remember}
                  aria-label="Mantener sesión iniciada"
                  onClick={() => setRemember(v => !v)}
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={remember
                    ? { background: '#F97316', borderColor: '#F97316', boxShadow: '0 0 0 3px rgba(249,115,22,.18)' }
                    : { borderColor: '#D4DDE6', background: '#fff' }
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

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-2xl"
                style={{ padding: '14px 20px', fontSize: '15px', marginTop: '4px' }}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                  : <>Iniciar sesión <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            {/* Seguridad */}
            <div className="flex items-center justify-center gap-2 mt-6 mb-6">
              <Shield className="w-3.5 h-3.5" style={{ color: '#D4DDE6' }} />
              <p className="text-xs font-medium" style={{ color: '#B0BEC8' }}>
                Cifrado SSL · Acceso seguro
              </p>
            </div>

            {/* Demo box — gris neutro */}
            <div
              className="rounded-2xl p-5"
              style={{ background: '#FFF8F0', border: '1px solid #FDE8D0' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <p
                    className="text-[10px] font-black uppercase tracking-[.14em]"
                    style={{ color: '#F97316' }}
                  >
                    Modo demo
                  </p>
                </div>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74' }}
                >
                  Sin registro
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Correo',     value: 'admin@cremeria.mx' },
                  { label: 'Contraseña', value: '123456'           },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-xl px-3.5 py-2.5"
                    style={{ background: '#fff', border: '1px solid #FDE8D0' }}
                  >
                    <p className="text-[10px] font-medium mb-1" style={{ color: '#8FA1B2' }}>
                      {item.label}
                    </p>
                    <p className="text-xs font-bold font-mono truncate" style={{ color: '#C2410C' }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={fillDemo}
                disabled={loading}
                className="btn-primary w-full rounded-xl"
                style={{ fontSize: '14px', padding: '11px 18px' }}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</> : 'Entrar a la demo →'}
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs mt-6 font-medium" style={{ color: '#D4DDE6' }}>
              © 2026 Cremerías Admin · Todos los derechos reservados
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
