import { NavLink, useMatch, useResolvedPath } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Monitor, Users, Package,
  ShoppingCart, Truck, Map, ShoppingBag, BarChart3,
  Settings, X, Milk, LogOut,
} from 'lucide-react'

const groups = [
  {
    label: null,
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Panel Principal' },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { path: '/sucursales', icon: Building2,    label: 'Sucursales' },
      { path: '/cajas',      icon: Monitor,      label: 'Cajas',      badge: '3' },
      { path: '/ventas',     icon: ShoppingCart, label: 'Ventas' },
      { path: '/inventario', icon: Package,      label: 'Inventario', badge: '5', badgeRed: true },
    ],
  },
  {
    label: 'Logística',
    items: [
      { path: '/distribuidores', icon: Truck,       label: 'Distribuidores' },
      { path: '/rutas',          icon: Map,         label: 'Rutas',    badge: '2', badgeAmber: true },
      { path: '/compras',        icon: ShoppingBag, label: 'Compras' },
    ],
  },
  {
    label: 'Recursos',
    items: [
      { path: '/usuarios', icon: Users, label: 'Usuarios' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { path: '/reportes',      icon: BarChart3, label: 'Reportes' },
      { path: '/configuracion', icon: Settings,  label: 'Configuración' },
    ],
  },
]

function NavItem({ path, icon: Icon, label, badge, badgeRed, badgeAmber, onClose, index = 0 }) {
  const resolved = useResolvedPath(path)
  const isActive = !!useMatch({ path: resolved.pathname, end: true })
  const badgeBg  = badgeRed ? '#C97A6D' : badgeAmber ? '#d97706' : 'rgba(255,255,255,.28)'

  return (
    <NavLink
      to={path}
      onClick={onClose}
      aria-current={isActive ? 'page' : undefined}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 animate-slide-left"
      style={{
        background: isActive ? 'rgba(255,255,255,.18)' : 'transparent',
        boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,.12), 0 2px 8px rgba(0,0,0,.12)' : 'none',
        animationDelay: `${index * 35}ms`,
        animationFillMode: 'both',
      }}
    >
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{ background: '#FED7AA', boxShadow: '0 0 10px rgba(254,215,170,.65)' }}
        />
      )}

      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={isActive
          ? { background: 'rgba(255,255,255,.94)', boxShadow: '0 2px 12px rgba(249,115,22,.38)' }
          : { background: 'rgba(255,255,255,.08)' }
        }
      >
        <Icon
          className="w-4 h-4"
          style={{ color: isActive ? '#F97316' : 'rgba(255,255,255,.68)' }}
        />
      </div>

      <span
        className="flex-1 text-[13.5px] font-medium"
        style={{ color: isActive ? '#fff' : 'rgba(255,255,255,.62)' }}
      >
        {label}
      </span>

      {badge && (
        <span
          className={`text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full leading-none ${badgeRed ? 'red-badge-pulse' : ''}`}
          style={{ background: badgeBg }}
        >
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose, onLogout, user }) {
  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SA'

  return (
    <>
      {/* Backdrop — solo visible en móvil cuando está abierto */}
      <div
        className="fixed inset-0 z-30 lg:hidden transition-all duration-300"
        style={{
          background: open ? 'rgba(10,22,40,.45)' : 'transparent',
          backdropFilter: open ? 'blur(3px)' : 'none',
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Panel — overlay en móvil, fijo en desktop */}
      <aside
        className="fixed top-0 left-0 h-full z-40 flex flex-col w-72 lg:translate-x-0"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
          background: 'linear-gradient(180deg,#431407 0%,#C2410C 35%,#EA580C 70%,#9a2d08 100%)',
          boxShadow: open ? '12px 0 40px rgba(10,22,40,.4)' : 'none',
        }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Logo row */}
        <div
          className="relative z-10 flex items-center justify-between px-5 h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,.09)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255,255,255,.15)',
                border: '1px solid rgba(255,255,255,.22)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18)',
              }}
            >
              <Milk className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-tight tracking-tight">Cremerías Admin</p>
              <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,.46)' }}>
                {user?.rol || 'Superadministrador'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="sidebar-close lg:hidden relative z-10 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ color: 'rgba(255,255,255,.45)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.45)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav aria-label="Navegación principal" className="relative z-10 flex-1 overflow-y-auto py-4 px-3">
          {groups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
              {group.label && (
                <p
                  className="text-[9px] font-black uppercase tracking-[.18em] px-3 mb-2"
                  style={{ color: 'rgba(255,255,255,.28)' }}
                >
                  {group.label}
                </p>
              )}

              <div className="space-y-0.5">
                {group.items.map((item, ii) => {
                  const globalIdx = groups.slice(0, gi).reduce((s, g) => s + g.items.length, 0) + ii
                  return <NavItem key={item.path} {...item} index={globalIdx} onClose={onClose} />
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User card + logout */}
        <div
          className="relative z-10 p-3 flex-shrink-0 space-y-2"
          style={{ borderTop: '1px solid rgba(255,255,255,.09)' }}
        >
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,.07)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.3),rgba(255,255,255,.14))' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.nombre || 'Super Admin'}</p>
              <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,.46)' }}>
                {user?.rol || 'Superadministrador'}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#22c55e' }} />
          </div>

          <button
            onClick={() => { onClose(); onLogout?.() }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
            style={{ background: 'rgba(201,122,109,.12)', border: '1px solid rgba(201,122,109,.18)', color: '#F4A79D' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,122,109,.22)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,122,109,.12)' }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="text-[13px] font-semibold">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
