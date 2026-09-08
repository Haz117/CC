import { NavLink, useMatch, useResolvedPath } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Package, Map, MoreHorizontal } from 'lucide-react'

const tabs = [
  { path: '/dashboard',  icon: LayoutDashboard, label: 'Panel' },
  { path: '/ventas',     icon: ShoppingCart,    label: 'Ventas' },
  { path: '/inventario', icon: Package,         label: 'Stock' },
  { path: '/rutas',      icon: Map,             label: 'Rutas' },
]

function BottomTab({ path, icon: Icon, label }) {
  const resolved = useResolvedPath(path)
  const isActive = !!useMatch({ path: resolved.pathname, end: true })

  return (
    <NavLink
      to={path}
      aria-current={isActive ? 'page' : undefined}
      className="flex flex-col items-center justify-center gap-1 py-2 relative"
      style={{ color: isActive ? '#C2410C' : '#8FA1B2', minHeight: 56, WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Active indicator dot at top */}
      {isActive && (
        <span
          style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 24, height: 3, borderRadius: '0 0 4px 4px',
            background: '#F97316',
          }}
        />
      )}

      {/* Icon pill */}
      <div
        className="flex items-center justify-center rounded-2xl transition-all duration-200"
        style={{
          width: 48, height: 30,
          background: isActive ? 'rgba(249,115,22,.12)' : 'transparent',
          transform: isActive ? 'scale(1.06)' : 'scale(1)',
        }}
      >
        <Icon
          size={isActive ? 20 : 19}
          style={{ color: isActive ? '#F97316' : '#8FA1B2', transition: 'all .2s' }}
          strokeWidth={isActive ? 2.3 : 1.8}
        />
      </div>

      <span
        className="text-[10px] font-bold transition-all duration-200"
        style={{ color: isActive ? '#C2410C' : '#8FA1B2', letterSpacing: isActive ? '.01em' : '0' }}
      >
        {label}
      </span>
    </NavLink>
  )
}

export default function BottomNav({ onMoreClick }) {
  return (
    <nav
      aria-label="Navegación principal"
      className="lg:hidden fixed bottom-0 inset-x-0 z-20 grid grid-cols-5"
      style={{
        background: '#fff',
        borderTop: '1px solid #FDE8D0',
        boxShadow: '0 -4px 24px rgba(194,65,12,.10)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map(tab => (
        <BottomTab key={tab.path} {...tab} />
      ))}
      <button
        onClick={onMoreClick}
        aria-label="Más opciones de navegación"
        className="flex flex-col items-center justify-center gap-1 py-2"
        style={{
          color: '#8FA1B2', border: 'none', background: 'transparent',
          cursor: 'pointer', fontFamily: 'inherit', minHeight: 56,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div className="flex items-center justify-center rounded-2xl" style={{ width: 48, height: 30 }}>
          <MoreHorizontal size={19} strokeWidth={1.8} />
        </div>
        <span className="text-[10px] font-bold">Más</span>
      </button>
    </nav>
  )
}
