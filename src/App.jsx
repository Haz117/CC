import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './auth/AuthProvider'
import { useAuth } from './auth/contexto'
import { PAGINAS } from './lib/navegacion'
import Layout from './components/Layout'
import ModuloDemo from './components/ModuloDemo'
import ToastContainer from './components/ToastContainer'
import NotificationBanner from './components/NotificationBanner'
import SplashScreen from './components/SplashScreen'
import PwaInstallPrompt from './components/PwaInstallPrompt'
import OfflineIndicator from './components/OfflineIndicator'
import Login from './pages/Login'
import NuevaContrasena from './pages/NuevaContrasena'

const PANTALLAS = {
  '/dashboard':      lazy(() => import('./pages/Dashboard')),
  '/sucursales':     lazy(() => import('./pages/Sucursales')),
  '/cajas':          lazy(() => import('./pages/Cajas')),
  '/usuarios':       lazy(() => import('./pages/Usuarios')),
  '/inventario':     lazy(() => import('./pages/Inventario')),
  '/ventas':         lazy(() => import('./pages/Ventas')),
  '/distribuidores': lazy(() => import('./pages/Distribuidores')),
  '/rutas':          lazy(() => import('./pages/Rutas')),
  '/compras':        lazy(() => import('./pages/Compras')),
  '/reportes':       lazy(() => import('./pages/Reportes')),
  '/configuracion':  lazy(() => import('./pages/Configuracion')),
}
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader({ pantallaCompleta = false }) {
  return (
    <div className="page-loader" style={pantallaCompleta ? { height: '100vh' } : undefined}>
      <div className="skeleton page-loader-spinner" />
    </div>
  )
}

function pantallaDe(pagina) {
  const Pantalla = PANTALLAS[pagina.path]
  return pagina.demo ? <ModuloDemo nombre={pagina.label}><Pantalla /></ModuloDemo> : <Pantalla />
}

function Contenido() {
  const { estado, recuperando } = useAuth()
  const [splashDone, setSplashDone] = useState(false)
  const terminarSplash = useCallback(() => setSplashDone(true), [])

  // Mientras la persona escribe su contraseña se adelanta la descarga del panel (y de las gráficas),
  // para que aparezca al instante después de entrar.
  useEffect(() => {
    const adelantar = () => { import('./pages/Dashboard') }
    if (!window.requestIdleCallback) {
      const espera = setTimeout(adelantar, 1500)
      return () => clearTimeout(espera)
    }
    const turno = requestIdleCallback(adelantar, { timeout: 3000 })
    return () => cancelIdleCallback(turno)
  }, [])

  if (!splashDone) return <SplashScreen onDone={terminarSplash} />
  if (estado === 'cargando') return <PageLoader pantallaCompleta />
  if (estado !== 'dentro') return <Login />
  if (recuperando) return <NuevaContrasena />

  return (
    <Router>
      <OfflineIndicator />
      <PwaInstallPrompt />
      <NotificationBanner />
      <Layout>
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {PAGINAS.map(pagina => (
              <Route key={pagina.path} path={pagina.path} element={pantallaDe(pagina)} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </Layout>
    </Router>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Contenido />
    </AuthProvider>
  )
}
