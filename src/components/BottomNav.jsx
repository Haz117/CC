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
      className="flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors"
      style={{ color: isActive ? '#C2410C' : '#8FA1B2' }}
    >
      {/* Pill background on active */}
      <div
        className="flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200"
        style={isActive
          ? { background: 'rgba(249,115,22,.13)', transform: 'scale(1.05)' }
          : { background: 'transparent' }
        }
      >
        <Icon
          className="w-5 h-5 transition-transform duration-200"
          style={isActive ? { transform: 'scale(1.12)' } : {}}
        />
      </div>
      <span
        className="text-[10px] font-bold transition-all duration-200"
        style={isActive ? { color: '#C2410C' } : { color: '#8FA1B2' }}
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
        boxShadow: '0 -4px 20px rgba(194,65,12,.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map(tab => (
        <BottomTab key={tab.path} {...tab} />
      ))}
      <button
        onClick={onMoreClick}
        aria-label="Más opciones de navegación"
        className="flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
        style={{ color: '#8FA1B2', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <div className="flex items-center justify-center w-12 h-7 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold">Más</span>
      </button>
    </nav>
  )
}
