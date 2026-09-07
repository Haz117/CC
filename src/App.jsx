import { lazy, Suspense, useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ToastContainer from './components/ToastContainer'
import NotificationBanner from './components/NotificationBanner'
import SplashScreen from './components/SplashScreen'
import Login from './pages/Login'

const Dashboard      = lazy(() => import('./pages/Dashboard'))
const Sucursales     = lazy(() => import('./pages/Sucursales'))
const Cajas          = lazy(() => import('./pages/Cajas'))
const Usuarios       = lazy(() => import('./pages/Usuarios'))
const Inventario     = lazy(() => import('./pages/Inventario'))
const Ventas         = lazy(() => import('./pages/Ventas'))
const Distribuidores = lazy(() => import('./pages/Distribuidores'))
const Rutas          = lazy(() => import('./pages/Rutas'))
const Compras        = lazy(() => import('./pages/Compras'))
const Reportes       = lazy(() => import('./pages/Reportes'))
const Configuracion  = lazy(() => import('./pages/Configuracion'))
const NotFound       = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="skeleton page-loader-spinner" />
    </div>
  )
}

function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [user, setUser] = useState(null)

  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />
  if (!user) return <Login onLogin={setUser} />

  return (
    <Router>
      <ToastContainer />
      <NotificationBanner />
      <Layout user={user} onLogout={() => setUser(null)}>
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/sucursales" element={<Sucursales />} />
            <Route path="/cajas" element={<Cajas />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/distribuidores" element={<Distribuidores />} />
            <Route path="/rutas" element={<Rutas />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </Layout>
    </Router>
  )
}

export default App
