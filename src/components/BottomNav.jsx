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
      className="flex flex-col items-center justify-center gap-0.5 py-3 relative transition-colors"
      style={isActive ? { color: '#C2410C' } : { color: '#8FA1B2' }}
    >
      {isActive && (
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full"
          style={{ background: '#F97316' }}
        />
      )}
      <Icon className="w-5 h-5" style={isActive ? { transform: 'scale(1.1)' } : {}} />
      <span className="text-[10px] font-bold">{label}</span>
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
        className="flex flex-col items-center justify-center gap-0.5 py-3 transition-colors"
        style={{ color: '#8FA1B2', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] font-bold">Más</span>
      </button>
    </nav>
  )
}
