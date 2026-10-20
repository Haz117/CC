import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'
import ScrollToTop from './ScrollToTop'
import CommandPalette from './CommandPalette'
import { useAuth } from '../auth/contexto'
import { useAvisos } from '../hooks/useAvisos'
import { tituloDe } from '../lib/navegacion'

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const location = useLocation()
  const { modoDemo } = useAuth()
  const avisos = useAvisos()

  useEffect(() => {
    document.title = `${tituloDe(location.pathname) || 'Inicio'} · Cremerías Admin`
  }, [location.pathname])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname, location.key])

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
        globos={avisos.globos}
      />

      {/* Main content — offset por sidebar en desktop */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden xl:pl-72">
        <Header
          avisos={avisos.lista}
          onOpenPalette={() => setPaletteOpen(true)}
          onMenuClick={() => setMenuOpen(o => !o)}
        />
        {modoDemo && (
          <div
            role="status"
            className="no-imprimir flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium flex-shrink-0"
            style={{ background: '#FFF7ED', color: '#9A3412', borderBottom: '1px solid #E8EBEF' }}
          >
            <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Modo demostración · datos de ejemplo, sin conexión a la base
          </div>
        )}
        <main id="main-content" className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto pb-20 lg:pb-0" style={{ overscrollBehavior: 'contain' }}>
          <div key={location.key} className="max-w-screen-2xl min-w-0 mx-auto p-4 sm:p-5 lg:p-8" style={{ animation: 'fadeIn .18s ease-out both' }}>
            {children}
          </div>
        </main>
      </div>

      <BottomNav onMoreClick={() => setMenuOpen(o => !o)} globos={avisos.globos} />
      <ScrollToTop />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
    </>
  )
}
