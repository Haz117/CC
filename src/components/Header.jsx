import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, Search, Bell, ChevronDown, RefreshCw, LogOut,
  User, KeyRound, ClipboardList, X, Building2, Package,
  ShoppingCart, Users, BarChart3, Truck, AlertTriangle,
  CheckCircle2, Info,
} from 'lucide-react'
import toast from '../utils/toast'

/* ── Page title map ─────────────────────────────────────────── */
const pageMap = {
  '/dashboard':      'Panel Principal',
  '/sucursales':     'Sucursales',
  '/cajas':          'Cajas',
  '/ventas':         'Ventas',
  '/inventario':     'Inventario',
  '/distribuidores': 'Distribuidores',
  '/rutas':          'Rutas',
  '/compras':        'Compras',
  '/usuarios':       'Usuarios',
  '/reportes':       'Reportes',
  '/configuracion':  'Configuración',
}

/* ── Search index ───────────────────────────────────────────── */
const searchIndex = [
  { id: 's1', type: 'Sucursal',     label: 'Sucursal Centro',       subtitle: '12 empleados · Activa',                  path: '/sucursales',     Icon: Building2    },
  { id: 's2', type: 'Sucursal',     label: 'Sucursal Norte',        subtitle: '8 empleados · Activa',                   path: '/sucursales',     Icon: Building2    },
  { id: 's3', type: 'Sucursal',     label: 'Sucursal Sur',          subtitle: '6 empleados · Activa',                   path: '/sucursales',     Icon: Building2    },
  { id: 's4', type: 'Sucursal',     label: 'Sucursal Oriente',      subtitle: '5 empleados · Activa',                   path: '/sucursales',     Icon: Building2    },
  { id: 's5', type: 'Sucursal',     label: 'Sucursal Poniente',     subtitle: '7 empleados · Inactiva',                 path: '/sucursales',     Icon: Building2    },
  { id: 'p1', type: 'Producto',     label: 'Queso Oaxaca',          subtitle: 'Quesos · Stock: 8 kg · Crítico',         path: '/inventario',     Icon: Package      },
  { id: 'p2', type: 'Producto',     label: 'Queso Manchego',        subtitle: 'Quesos · Stock: 32 kg',                  path: '/inventario',     Icon: Package      },
  { id: 'p3', type: 'Producto',     label: 'Crema Ácida',           subtitle: 'Cremas · Stock: 15 L · Bajo',            path: '/inventario',     Icon: Package      },
  { id: 'p4', type: 'Producto',     label: 'Mantequilla',           subtitle: 'Mantequillas · Stock: 6 kg · Crítico',   path: '/inventario',     Icon: Package      },
  { id: 'p5', type: 'Producto',     label: 'Queso Panela',          subtitle: 'Quesos · Stock: 45 kg',                  path: '/inventario',     Icon: Package      },
  { id: 'u1', type: 'Usuario',      label: 'María López',           subtitle: 'Cajera · Suc. Centro · Activa',          path: '/usuarios',       Icon: Users        },
  { id: 'u2', type: 'Usuario',      label: 'Sandra Ruiz',           subtitle: 'Cajera · Suc. Norte · Bloqueada',        path: '/usuarios',       Icon: Users        },
  { id: 'u3', type: 'Usuario',      label: 'Ana Torres',            subtitle: 'Distribuidora · Ruta Oriente',           path: '/usuarios',       Icon: Users        },
  { id: 'd1', type: 'Distribuidor', label: 'Carlos Mendoza',        subtitle: 'Ruta Norte · En ruta',                  path: '/distribuidores', Icon: Truck        },
  { id: 'd2', type: 'Distribuidor', label: 'Roberto Sánchez',       subtitle: 'Ruta Sur · Activo',                     path: '/distribuidores', Icon: Truck        },
  { id: 'd3', type: 'Distribuidor', label: 'Miguel Ángel Cruz',     subtitle: 'Ruta Centro · Saldo pendiente',         path: '/distribuidores', Icon: Truck        },
  { id: 'v1', type: 'Venta',        label: 'Venta V-00521',         subtitle: '$345.50 · Suc. Centro · 09:14',         path: '/ventas',         Icon: ShoppingCart },
  { id: 'v2', type: 'Venta',        label: 'Venta V-00520',         subtitle: '$189.00 · Suc. Norte · Tarjeta',        path: '/ventas',         Icon: ShoppingCart },
  { id: 'r1', type: 'Reporte',      label: 'Reporte de Ventas',     subtitle: 'Análisis por periodo y sucursal',       path: '/reportes',       Icon: BarChart3    },
  { id: 'r2', type: 'Reporte',      label: 'Reporte de Inventario', subtitle: 'Existencias y movimientos',             path: '/reportes',       Icon: BarChart3    },
  { id: 'r3', type: 'Reporte',      label: 'Reporte de Ganancias',  subtitle: 'Utilidad neta por periodo',             path: '/reportes',       Icon: BarChart3    },
]

const typeColor = {
  Sucursal:     { bg: '#FFF7ED', text: '#C2410C' },
  Producto:     { bg: 'rgba(5,150,105,.08)', text: '#059669' },
  Usuario:      { bg: 'rgba(124,58,237,.08)', text: '#7c3aed' },
  Distribuidor: { bg: 'rgba(217,119,6,.08)',  text: '#d97706' },
  Venta:        { bg: '#FFF7ED', text: '#C2410C' },
  Reporte:      { bg: '#F2F3F5', text: '#627080' },
}

/* ── Notifications ──────────────────────────────────────────── */
const notifications = [
  { id: 1, type: 'error',   Icon: AlertTriangle, text: 'Stock crítico: Queso Oaxaca — Suc. Norte (8 uds / mín 20)',  time: 'hace 5 min',  unread: true  },
  { id: 2, type: 'error',   Icon: AlertTriangle, text: 'Caja 3 · Diferencia en corte: $245.00 — requiere revisión',  time: 'hace 22 min', unread: true  },
  { id: 3, type: 'error',   Icon: AlertTriangle, text: 'Venta V-00518 cancelada · $78.50 · Caja 2 Suc. Centro',      time: 'hace 45 min', unread: true  },
  { id: 4, type: 'success', Icon: CheckCircle2,  text: 'Ruta Sur finalizada · Carlos López · 15/15 clientes',         time: 'hace 1 hr',   unread: false },
  { id: 5, type: 'info',    Icon: Info,          text: 'Compra OC-0234 recibida · Lácteos del Norte · $24,500',       time: 'hace 2 hrs',  unread: false },
]

const notifStyle = {
  error:   { bg: 'rgba(201,122,109,.12)', icon: '#C97A6D', dot: '#C97A6D' },
  success: { bg: 'rgba(5,150,105,.08)',   icon: '#059669', dot: '#059669' },
  info:    { bg: 'rgba(249,115,22,.07)',  icon: '#F97316', dot: '#F97316' },
}

/* ═══════════════════════════════════════════════════════════ */
export default function Header({ onMenuClick, user, onLogout, onOpenPalette }) {
  const navigate   = useNavigate()
  const location   = useLocation()
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchVal,   setSearchVal]   = useState('')
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [spinning,    setSpinning]    = useState(false)
  const [notifItems,  setNotifItems]  = useState(notifications)
  const searchRef    = useRef(null)
  const spinTimer    = useRef(null)
  const dismissNotif = (id, e) => { e.stopPropagation(); setNotifItems(items => items.filter(n => n.id !== id)) }

  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SA'

  const pageTitle  = pageMap[location.pathname] || ''
  const closeAll   = () => { setNotifOpen(false); setProfileOpen(false) }
  const markRead   = (id) => setNotifItems(items => items.map(n => n.id === id ? { ...n, unread: false } : n))
  const markAllRead = () => setNotifItems(items => items.map(n => ({ ...n, unread: false })))

  const handleRefresh = () => { setSpinning(true); clearTimeout(spinTimer.current); spinTimer.current = setTimeout(() => setSpinning(false), 900) }

  const results = searchVal.length >= 2
    ? searchIndex.filter(item =>
        item.label.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.type.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchVal.toLowerCase())
      ).slice(0, 7)
    : []

  const handleSelect = (item) => { setSearchVal(''); setSearchOpen(false); navigate(item.path) }

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Ctrl+K is now handled by Layout → CommandPalette; header input still gets focus from / shortcut via SearchInput

  const unreadCount = notifItems.filter(n => n.unread).length
  const errorCount  = notifItems.filter(n => n.unread && n.type === 'error').length
  const hasErrors   = errorCount > 0

  return (
    <header
      className="flex items-center px-4 gap-3 flex-shrink-0 sticky top-0 z-10 relative app-header"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #FDE8D0',
        boxShadow: '0 1px 0 rgba(194,65,12,.06)',
      }}
    >
      {/* Hamburger — oculto en desktop donde la sidebar está fija */}
      <button className="header-icon-btn lg:hidden" onClick={onMenuClick} title="Menú" aria-label="Abrir menú">
        <Menu className="w-5 h-5" />
      </button>

      {/* Título de página en móvil — centrado absolutamente */}
      {pageTitle && (
        <span
          className="absolute left-1/2 -translate-x-1/2 text-sm font-bold sm:hidden pointer-events-none"
          style={{ color: '#263442', maxWidth: '52vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {pageTitle}
        </span>
      )}

      {/* Page title (desktop) */}
      {pageTitle && (
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          <div className="w-px h-4" style={{ background: '#D4DDE6' }} />
          <span className="text-sm font-bold" style={{ color: '#263442' }}>{pageTitle}</span>
        </div>
      )}

      {/* Search — click opens Command Palette */}
      <div ref={searchRef} className="flex-1 max-w-sm relative hidden sm:block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#8FA1B2' }}
        />
        <button
          onClick={onOpenPalette}
          className="header-search-input w-full text-left flex items-center"
          style={{ paddingLeft: '2.25rem', cursor: 'text', color: '#8FA1B2', userSelect: 'none' }}
        >
          Buscar páginas y acciones...
          <span
            className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={{ background: '#FFF7ED', color: '#F97316', border: '1px solid #FDBA74' }}
          >
            ⌘K
          </span>
        </button>
        <input
          type="text"
          placeholder="Buscar..."
          value={searchVal}
          onChange={e => { setSearchVal(e.target.value); setSearchOpen(true) }}
          onFocus={() => setSearchOpen(true)}
          className="sr-only"
        />
        {searchVal && (
          <button
            onClick={() => { setSearchVal(''); setSearchOpen(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md header-icon-btn p-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Search results dropdown */}
        {searchOpen && results.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl overflow-hidden animate-scale-in"
            style={{ background: '#fff', border: '1px solid #FDE8D0', boxShadow: '0 16px 48px rgba(194,65,12,.14)', zIndex: 60 }}
          >
            <div className="px-3 pt-2.5 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA1B2' }}>
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </p>
            </div>
            {results.map(item => {
              const c = typeColor[item.type] || typeColor.Reporte
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="search-result-item"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c.bg }}>
                    <item.Icon className="w-4 h-4" style={{ color: c.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.label}</p>
                    <p className="text-xs truncate" style={{ color: '#8FA1B2' }}>{item.subtitle}</p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {item.type}
                  </span>
                </button>
              )
            })}
            <div className="px-3 py-2" style={{ borderTop: '1px solid #F2F3F5' }}>
              <p className="text-[10px]" style={{ color: '#8FA1B2' }}>Presiona Enter para buscar</p>
            </div>
          </div>
        )}

        {searchOpen && searchVal.length >= 2 && results.length === 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl px-4 py-5 text-center animate-scale-in"
            style={{ background: '#fff', border: '1px solid #FDE8D0', boxShadow: '0 16px 48px rgba(194,65,12,.14)', zIndex: 60 }}
          >
            <p className="text-sm font-medium" style={{ color: '#627080' }}>Sin resultados para "{searchVal}"</p>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">

        {/* Búsqueda — solo visible en móvil (en desktop está la barra arriba) */}
        <button className="header-icon-btn sm:hidden" onClick={onOpenPalette} title="Buscar">
          <Search className="w-5 h-5" />
        </button>

        {/* Refresh */}
        <button className="header-icon-btn hidden sm:flex" onClick={handleRefresh} title="Actualizar">
          <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
        </button>

        {/* Notifications — conditional color: keep inline */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            aria-label="Notificaciones"
            aria-expanded={notifOpen}
            aria-haspopup="true"
            className="relative p-2 rounded-xl transition-all duration-200"
            style={hasErrors
              ? { color: '#C97A6D', background: 'rgba(201,122,109,.08)' }
              : { color: '#8FA1B2' }
            }
            onMouseEnter={e => {
              e.currentTarget.style.background = hasErrors ? 'rgba(201,122,109,.16)' : '#FFF7ED'
              e.currentTarget.style.color = hasErrors ? '#C97A6D' : '#C2410C'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = hasErrors ? 'rgba(201,122,109,.08)' : 'transparent'
              e.currentTarget.style.color = hasErrors ? '#C97A6D' : '#8FA1B2'
            }}
          >
            <Bell className={`w-5 h-5 ${hasErrors ? 'animate-breathe' : ''}`} />
            {unreadCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 animate-badge-pop red-badge-pulse"
                style={{ background: hasErrors ? '#C97A6D' : '#F97316' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeAll} />
              <div
                role="menu"
                aria-label="Notificaciones"
                className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1rem)] rounded-2xl overflow-hidden animate-scale-in z-50"
                style={{ background: '#fff', border: '1px solid #FDE8D0', boxShadow: '0 16px 48px rgba(194,65,12,.14)' }}
              >
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #F2F3F5' }}>
                  <div className="flex items-center gap-2">
                    {hasErrors && <span className="red-dot" />}
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#263442' }}>Notificaciones</p>
                      <p className="text-xs" style={{ color: hasErrors ? '#C97A6D' : '#8FA1B2' }}>
                        {errorCount > 0
                          ? `${errorCount} alerta${errorCount > 1 ? 's' : ''} crítica${errorCount > 1 ? 's' : ''}`
                          : `${unreadCount} sin leer`}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-xs font-semibold transition-opacity"
                    style={{ color: '#F97316', opacity: unreadCount > 0 ? 1 : 0.4 }}
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                  >
                    Leer todo
                  </button>
                </div>

                <div className="max-h-[340px] overflow-y-auto">
                  {notifItems.map(n => {
                    const ns = notifStyle[n.type] || notifStyle.info
                    return (
                      <div
                        key={n.id}
                        className="px-4 py-3.5 flex items-start gap-3 cursor-pointer transition-colors border-b group"
                        style={{ borderColor: '#F2F3F5', background: n.unread ? ns.bg : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FFF7ED'}
                        onMouseLeave={e => e.currentTarget.style.background = n.unread ? ns.bg : 'transparent'}
                        onClick={() => markRead(n.id)}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: n.unread ? ns.bg : '#F2F3F5',
                            border: `1px solid ${n.unread ? ns.dot + '33' : 'transparent'}`,
                          }}
                        >
                          <n.Icon className="w-3.5 h-3.5" style={{ color: ns.icon }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs leading-snug ${n.unread ? 'font-semibold' : 'font-normal'}`}
                            style={{ color: n.unread ? '#263442' : '#627080' }}
                          >
                            {n.text}
                          </p>
                          <p className="text-[10px] mt-1" style={{ color: '#8FA1B2' }}>{n.time}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-1">
                          {n.unread && <div className="w-2 h-2 rounded-full" style={{ background: ns.dot }} />}
                          <button
                            onClick={(e) => dismissNotif(n.id, e)}
                            className="w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: '#8FA1B2' }}
                            onMouseEnter={e2 => { e2.currentTarget.style.background = '#F2F3F5'; e2.currentTarget.style.opacity = '1' }}
                            onMouseLeave={e2 => { e2.currentTarget.style.background = 'transparent' }}
                            title="Descartar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="px-4 py-3" style={{ borderTop: '1px solid #F2F3F5', background: '#F2F3F5' }}>
                  <button className="text-xs font-semibold w-full text-center" style={{ color: '#F97316' }}>
                    Ver todas las notificaciones →
                  </button>
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
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            aria-label="Menú de perfil"
            aria-expanded={profileOpen}
            aria-haspopup="true"
            className="header-profile-btn flex items-center gap-2.5 pl-2 pr-3 py-1.5"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: '#FFF7ED', color: '#C2410C' }}
            >
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold leading-tight" style={{ color: '#263442' }}>
                {user?.nombre?.split(' ')[0] || 'Admin'}
              </p>
              <p className="text-[10px] leading-tight" style={{ color: '#8FA1B2' }}>
                {user?.rol || 'Superadministrador'}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              style={{ color: '#8FA1B2' }}
            />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeAll} />
              <div
                role="menu"
                aria-label="Menú de perfil"
                className="absolute right-0 top-12 w-56 rounded-2xl overflow-hidden animate-scale-in z-50"
                style={{ background: '#fff', border: '1px solid #FDE8D0', boxShadow: '0 16px 48px rgba(194,65,12,.14)' }}
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
                      <p className="text-sm font-bold truncate" style={{ color: '#263442' }}>{user?.nombre}</p>
                      <p className="text-xs truncate" style={{ color: '#8FA1B2' }}>{user?.rol}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {[
                    { icon: User,          label: 'Mi perfil',            action: () => { closeAll(); navigate('/configuracion') } },
                    { icon: KeyRound,      label: 'Cambiar contraseña',   action: () => { closeAll(); toast.info('Contraseña', 'Ingresa tu contraseña actual para cambiarla') } },
                    { icon: ClipboardList, label: 'Bitácora de acciones', action: () => { closeAll(); navigate('/configuracion') } },
                  ].map(({ icon: Icon, label, action }) => (
                    <button key={label} role="menuitem" onClick={action} className="header-menu-btn">
                      <Icon className="w-4 h-4" style={{ color: '#FB923C' }} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="py-1" style={{ borderTop: '1px solid #F2F3F5' }}>
                  <button
                    role="menuitem"
                    onClick={() => { closeAll(); onLogout() }}
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
    </header>
  )
}
