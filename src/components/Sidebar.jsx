import { NavLink, useMatch, useResolvedPath } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Monitor, Users, Package,
  ShoppingCart, Truck, Map, ShoppingBag, BarChart3,
  Settings, X, Milk, LogOut,
} from 'lucide-react'

const C = {
  bg:        '#fff',
  border:    '#FDE8D0',
  text:      '#263442',
  sub:       '#8FA1B2',
  orange:    '#F97316',
  orangeDeep:'#C2410C',
  orangeLight:'#FFF7ED',
  appBg:     '#F2F3F5',
}

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

  const badgeBg = badgeRed ? '#C97A6D' : badgeAmber ? '#d97706' : C.sub

  return (
    <NavLink
      to={path}
      onClick={onClose}
      aria-current={isActive ? 'page' : undefined}
      className="animate-slide-left"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 10,
        background: isActive ? C.orangeLight : 'transparent',
        border: isActive ? `1px solid ${C.border}` : '1px solid transparent',
        boxShadow: isActive ? '0 1px 4px rgba(249,115,22,.10)' : 'none',
        animationDelay: `${index * 35}ms`,
        animationFillMode: 'both',
        textDecoration: 'none',
        position: 'relative',
        transition: 'background .15s, border-color .15s',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.appBg }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      {isActive && (
        <span style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: 20, borderRadius: '0 3px 3px 0',
          background: C.orange,
        }} />
      )}

      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isActive ? '#fff' : C.appBg,
        border: isActive ? `1px solid ${C.border}` : '1px solid transparent',
        boxShadow: isActive ? '0 1px 6px rgba(249,115,22,.14)' : 'none',
        transition: 'background .15s',
      }}>
        <Icon size={15} style={{ color: isActive ? C.orange : C.sub }} strokeWidth={isActive ? 2.2 : 1.8} />
      </div>

      <span style={{
        flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 500,
        color: isActive ? C.text : C.sub,
        transition: 'color .15s',
      }}>
        {label}
      </span>

      {badge && (
        <span style={{
          fontSize: 10, fontWeight: 700, color: '#fff',
          background: badgeBg, padding: '2px 6px',
          borderRadius: 99, lineHeight: 1.4,
        }}>
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 lg:hidden"
        style={{
          background: open ? 'rgba(38,52,66,.35)' : 'transparent',
          backdropFilter: open ? 'blur(2px)' : 'none',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'background .25s, backdrop-filter .25s',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed top-0 left-0 h-full z-40 flex flex-col w-72 lg:translate-x-0"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
          background: C.bg,
          borderRight: `1px solid ${C.border}`,
          boxShadow: open ? '8px 0 32px rgba(38,52,66,.10)' : 'none',
        }}
      >

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 64, flexShrink: 0,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: C.orangeLight, border: `1.5px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Milk size={18} style={{ color: C.orange }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>Cremerías Admin</p>
              <p style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{user?.rol || 'Superadministrador'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="lg:hidden"
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: C.sub, transition: 'background .15s, color .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.appBg; e.currentTarget.style.color = C.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.sub }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav aria-label="Navegación principal" style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {groups.map((group, gi) => (
            <div key={gi} style={{ marginTop: gi > 0 ? 20 : 0 }}>
              {group.label && (
                <p style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: '.14em',
                  textTransform: 'uppercase', color: C.sub,
                  padding: '0 12px', marginBottom: 6,
                }}>
                  {group.label}
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map((item, ii) => {
                  const globalIdx = groups.slice(0, gi).reduce((s, g) => s + g.items.length, 0) + ii
                  return <NavItem key={item.path} {...item} index={globalIdx} onClose={onClose} />
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: '12px 10px', flexShrink: 0,
          borderTop: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            background: C.appBg, border: `1px solid ${C.border}`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: C.orangeLight, border: `1.5px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: C.orange,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.2 }}
                className="truncate">
                {user?.nombre || 'Super Admin'}
              </p>
              <p style={{ fontSize: 11, color: C.sub, marginTop: 1 }}
                className="truncate">
                {user?.rol || 'Superadministrador'}
              </p>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
          </div>

          <button
            onClick={() => { onClose(); onLogout?.() }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(201,122,109,.07)', border: '1px solid rgba(201,122,109,.18)',
              color: '#C97A6D', fontFamily: 'inherit', textAlign: 'left',
              fontSize: 13, fontWeight: 600, transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,122,109,.14)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,122,109,.07)' }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
