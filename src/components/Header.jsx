import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, Search, Bell, ChevronDown, RefreshCw, LogOut,
  User, KeyRound, ClipboardList, BellOff,
} from 'lucide-react'
import CambiarContrasena from './CambiarContrasena'
import { useAuth } from '../auth/contexto'
import { tituloDe, etiquetaRol } from '../lib/navegacion'
import { useTituloVisible } from '../lib/tituloEnPantalla'
import { iniciales, plural } from '../utils/fmt'
import { useMenuDesplegable } from '../hooks/useMenuDesplegable'

const ATAJO = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K'

const notifStyle = {
  error: { bg: 'rgba(201,122,109,.12)', icon: '#8A4A42', dot: '#8A4A42' },
  aviso: { bg: 'rgba(217,119,6,.09)',   icon: '#92400E', dot: '#92400E' },
  info:  { bg: 'rgba(249,115,22,.07)',  icon: '#C2410C', dot: '#C2410C' },
}

/* ═══════════════════════════════════════════════════════════ */
export default function Header({ onMenuClick, onOpenPalette, avisos = [] }) {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { perfil, cerrarSesion } = useAuth()
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const [spinning,     setSpinning]     = useState(false)
  const [cambiarClave, setCambiarClave] = useState(false)
  const spinTimer = useRef(null)

  useEffect(() => () => clearTimeout(spinTimer.current), [])

  const rol       = etiquetaRol(perfil?.rol)
  const initials  = iniciales(perfil?.nombre)
  const pageTitle = tituloDe(location.pathname)
  // El nombre de la página sale aquí solo cuando el título grande ya se desplazó fuera de la vista
  const tituloVisible = useTituloVisible()
  const tituloArriba = { opacity: tituloVisible ? 0 : 1, transition: 'opacity .2s' }
  const closeAll  = () => { setNotifOpen(false); setProfileOpen(false) }
  const menuAvisos = useMenuDesplegable(notifOpen, closeAll)
  const menuPerfil = useMenuDesplegable(profileOpen, closeAll)

  // Las pantallas abiertas escuchan este evento y vuelven a consultar sus datos.
  const handleRefresh = () => {
    window.dispatchEvent(new Event('app:refrescar'))
    setSpinning(true)
    clearTimeout(spinTimer.current)
    spinTimer.current = setTimeout(() => setSpinning(false), 900)
  }

  const errorCount = avisos.filter(n => n.tipo === 'error').length
  const hasErrors  = errorCount > 0

  return (
    <header
      className="flex items-center px-4 gap-3 flex-shrink-0 sticky top-0 z-10 relative app-header"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8EBEF',
        boxShadow: '0 1px 0 rgba(194,65,12,.06)',
      }}
    >
      {/* Hamburger — oculto en desktop donde la sidebar está fija */}
      <button className="header-icon-btn xl:hidden!" onClick={onMenuClick} title="Menú" aria-label="Abrir menú">
        <Menu className="w-5 h-5" />
      </button>

      {/* Título de página en móvil — junto al menú y recortado si no cabe (centrado se encimaba con los iconos) */}
      {pageTitle && (
        <span className="flex-1 min-w-0 truncate text-sm font-bold sm:hidden" style={{ color: '#263442', ...tituloArriba }} aria-hidden={tituloVisible || undefined}>
          {pageTitle}
        </span>
      )}

      {/* Page title (desktop) */}
      {pageTitle && (
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0" style={tituloArriba} aria-hidden={tituloVisible || undefined}>
          <div className="w-px h-4" style={{ background: '#D4DDE6' }} />
          <span className="text-sm font-bold" style={{ color: '#263442' }}>{pageTitle}</span>
        </div>
      )}

      {/* Search — click opens Command Palette */}
      <div className="flex-1 max-w-sm relative hidden sm:block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#627080' }}
        />
        <button
          onClick={onOpenPalette}
          className="header-search-input w-full text-left flex items-center"
          style={{ paddingLeft: '2.25rem', cursor: 'text', color: '#627080', userSelect: 'none' }}
        >
          Buscar páginas y accesos…
          <span
            className="ml-auto text-[0.6875rem] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={{ background: '#fff', color: '#4A5664', border: '1px solid #D4DDE6' }}
          >
            {ATAJO}
          </span>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">

        {/* Búsqueda — solo visible en móvil (en desktop está la barra arriba) */}
        <button className="header-icon-btn sm:hidden!" onClick={onOpenPalette} title="Buscar" aria-label="Buscar">
          <Search className="w-5 h-5" />
        </button>

        {/* Refresh */}
        <button className="header-icon-btn max-sm:hidden!" onClick={handleRefresh} title="Actualizar" aria-label="Actualizar datos">
          <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
        </button>

        {/* Notifications — conditional color: keep inline */}
        <div className="relative">
          <button
            ref={menuAvisos.boton}
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            aria-expanded={notifOpen}
            aria-haspopup="true"
            className="relative p-2 rounded-xl transition-all duration-200"
            style={hasErrors
              ? { color: '#8A4A42', background: 'rgba(201,122,109,.08)' }
              : { color: '#627080' }
            }
            onMouseEnter={e => {
              e.currentTarget.style.background = hasErrors ? 'rgba(201,122,109,.16)' : '#FFF7ED'
              e.currentTarget.style.color = hasErrors ? '#8A4A42' : '#C2410C'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = hasErrors ? 'rgba(201,122,109,.08)' : 'transparent'
              e.currentTarget.style.color = hasErrors ? '#8A4A42' : '#627080'
            }}
          >
            {/* El número del globo va oculto: se leía "Notificaciones2" */}
            <span className="sr-only">Notificaciones{avisos.length ? `: ${plural(avisos.length, 'aviso')}` : ''}</span>
            <Bell className="w-5 h-5" aria-hidden="true" />
            {avisos.length > 0 && (
              <span
                aria-hidden="true"
                className={`absolute top-0.5 right-0.5 min-w-[17px] h-[17px] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 animate-badge-pop`}
                style={{ background: hasErrors ? '#8A4A42' : '#C2410C' }}
              >
                {avisos.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeAll} />
              <div
                ref={menuAvisos.menu}
                role="menu"
                aria-label="Notificaciones"
                className="absolute right-0 top-12 w-80 max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-16 max-sm:w-auto rounded-2xl overflow-hidden animate-scale-in z-50"
                style={{ background: '#fff', border: '1px solid #E8EBEF', boxShadow: '0 16px 48px rgba(194,65,12,.14)' }}
              >
                <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F2F3F5' }}>
                  {hasErrors && <span className="red-dot" />}
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#263442' }}>Avisos</p>
                    <p className="text-xs" style={{ color: hasErrors ? '#8A4A42' : '#627080' }}>
                      {hasErrors
                        ? `${errorCount} requiere${errorCount > 1 ? 'n' : ''} atención`
                        : 'Se actualizan en vivo con las cajas'}
                    </p>
                  </div>
                </div>

                <div className="max-h-[340px] overflow-y-auto">
                  {avisos.map(n => {
                    const ns = notifStyle[n.tipo] || notifStyle.info
                    return (
                      <button
                        key={n.id}
                        role="menuitem"
                        className="w-full text-left px-4 py-3.5 flex items-start gap-3 cursor-pointer transition-colors border-b"
                        style={{ borderColor: '#F2F3F5', background: 'transparent', fontFamily: 'inherit' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FFF7ED'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        onClick={() => { closeAll(); navigate(n.path) }}
                      >
                        <n.Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ns.icon }} aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-snug font-semibold" style={{ color: '#263442' }}>{n.texto}</p>
                          <p className="text-[0.6875rem] mt-1" style={{ color: '#627080' }}>Ver en {tituloDe(n.path)}</p>
                        </div>
                      </button>
                    )
                  })}
                  {avisos.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <BellOff className="w-6 h-6 mx-auto mb-2" style={{ color: '#D4DDE6' }} />
                      <p className="text-xs font-medium" style={{ color: '#627080' }}>Sin avisos por ahora</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 mx-0.5" style={{ background: '#D4DDE6' }} />

        {/* Profile */}
        <div className="relative">
          <button
            ref={menuPerfil.boton}
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            className="header-profile-btn flex items-center gap-2.5 pl-2 pr-3 py-1.5"
          >
            <span className="sr-only">Menú de perfil:</span>
            <div
              aria-hidden="true"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[0.6875rem] font-bold flex-shrink-0"
              style={{ background: '#FFF7ED', color: '#C2410C' }}
            >
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold leading-tight" style={{ color: '#263442' }}>
                {perfil.nombre?.split(' ')[0]}
              </p>
              <p className="text-[0.6875rem] leading-tight" style={{ color: '#627080' }}>
                {rol}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              style={{ color: '#627080' }}
            />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeAll} />
              <div
                ref={menuPerfil.menu}
                role="menu"
                aria-label="Menú de perfil"
                className="absolute right-0 top-12 w-56 rounded-2xl overflow-hidden animate-scale-in z-50"
                style={{ background: '#fff', border: '1px solid #E8EBEF', boxShadow: '0 16px 48px rgba(194,65,12,.14)' }}
              >
                {/* Profile card */}
                <div className="px-4 py-3.5" style={{ borderBottom: '1px solid #F2F3F5' }}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: '#FFF7ED', color: '#C2410C' }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: '#263442' }}>{perfil?.nombre}</p>
                      <p className="text-xs truncate" style={{ color: '#627080' }}>{rol} · {perfil?.sucursal}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {[
                    { icon: User,          label: 'Mi cuenta',            action: () => { closeAll(); navigate('/configuracion') } },
                    { icon: KeyRound,      label: 'Cambiar contraseña',   action: () => { closeAll(); setCambiarClave(true) } },
                    { icon: ClipboardList, label: 'Bitácora de acciones', action: () => { closeAll(); navigate('/configuracion?seccion=bitacora') } },
                  ].map(({ icon: Icon, label, action }) => (
                    <button key={label} role="menuitem" onClick={action} className="header-menu-btn">
                      <Icon className="w-4 h-4" style={{ color: '#627080' }} aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="py-1" style={{ borderTop: '1px solid #F2F3F5' }}>
                  <button
                    role="menuitem"
                    onClick={() => { closeAll(); cerrarSesion() }}
                    className="header-menu-btn-danger"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {cambiarClave && <CambiarContrasena onClose={() => setCambiarClave(false)} />}
    </header>
  )
}
