import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'
import ScrollToTop from './ScrollToTop'
import CommandPalette from './CommandPalette'

export default function Layout({ children, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const location = useLocation()

  const pageTitles = {
    '/dashboard': 'Panel Principal', '/sucursales': 'Sucursales', '/cajas': 'Cajas',
    '/ventas': 'Ventas', '/inventario': 'Inventario', '/distribuidores': 'Distribuidores',
    '/rutas': 'Rutas', '/compras': 'Compras', '/reportes': 'Reportes',
    '/usuarios': 'Usuarios', '/configuracion': 'Configuración',
  }

  useEffect(() => {
    document.title = `${pageTitles[location.pathname] || 'Inicio'} · Cremerías Admin`
  }, [location.pathname])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(p => !p)
      }
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <a href="#main-content" className="skip-nav">Ir al contenido principal</a>

    <div className="flex h-screen overflow-hidden" style={{ background: '#F2F3F5' }}>

      {/* Floating sidebar — always overlay, never pushes content */}
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
        user={user}
      />

      {/* Main content — offset por sidebar en desktop */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-72">
        <Header
          user={user}
          onLogout={onLogout}
          onOpenPalette={() => setPaletteOpen(true)}
          onMenuClick={() => setMenuOpen(o => !o)}
        />
        <main id="main-content" className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <div key={location.key} className="max-w-screen-2xl mx-auto p-5 lg:p-8" style={{ animation: 'pageReveal .38s cubic-bezier(.16,1,.3,1) both' }}>
            {children}
          </div>
        </main>
      </div>

      <BottomNav onMoreClick={() => setMenuOpen(o => !o)} />
      <ScrollToTop />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
    </>
  )
}
