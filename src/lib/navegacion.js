import {
  LayoutDashboard, Building2, Monitor, Users, Package,
  ShoppingCart, Truck, Map, ShoppingBag, BarChart3, Settings,
} from 'lucide-react'

// Roles de las personas en la base: los usan las cajas. A la app web solo entra el administrador.
export const ROL = { ADMIN: 'ADMINISTRADOR', SUPERVISOR: 'SUPERVISOR', CAJERO: 'CAJERO' }
export const ROLES = [ROL.ADMIN, ROL.SUPERVISOR, ROL.CAJERO]

const ETIQUETA_ROL = { ADMINISTRADOR: 'Administrador', SUPERVISOR: 'Supervisor', CAJERO: 'Cajero' }
export const etiquetaRol = (rol) => ETIQUETA_ROL[rol] ?? rol ?? '—'

export const esAdmin = (perfil) => perfil?.rol === ROL.ADMIN

/* Pantallas de la app. La web es de consulta y solo para el administrador, que ve todas las
   sucursales y el almacén. `demo: true` marca los módulos que todavía no tienen tablas en la base. */
const TODAS = [
  { path: '/dashboard',      label: 'Panel principal', corto: 'Panel',   icon: LayoutDashboard, grupo: null },
  { path: '/sucursales',     label: 'Sucursales',                        icon: Building2,       grupo: 'Operaciones' },
  { path: '/cajas',          label: 'Cajas',                             icon: Monitor,         grupo: 'Operaciones' },
  { path: '/ventas',         label: 'Ventas',                            icon: ShoppingCart,    grupo: 'Operaciones' },
  { path: '/inventario',     label: 'Inventario',                        icon: Package,         grupo: 'Operaciones' },
  { path: '/rutas',          label: 'Rutas',                             icon: Map,             grupo: 'Logística' },
  { path: '/distribuidores', label: 'Distribuidores',                    icon: Truck,           grupo: 'Logística' },
  { path: '/compras',        label: 'Compras',                           icon: ShoppingBag,     grupo: 'Logística', demo: true },
  { path: '/usuarios',       label: 'Usuarios',                          icon: Users,           grupo: 'Recursos' },
  { path: '/reportes',       label: 'Reportes',                          icon: BarChart3,       grupo: 'Sistema' },
  { path: '/configuracion',  label: 'Configuración',   corto: 'Ajustes', icon: Settings,        grupo: 'Sistema' },
]

// Los módulos con datos de ejemplo (Compras) quedan fuera del menú, la búsqueda y las rutas hasta
// que la base tenga sus tablas: mostrar datos inventados confundía. Rutas y Distribuidores ya leen
// de las tablas de ventas en ruta (cremeria-ruta/supabase/propuesta-ruta.sql); mientras la base no
// las tenga, sus pantallas lo dicen en lugar de mostrar datos.
export const PAGINAS = TODAS.filter(p => !p.demo)

export const tituloDe = (path) => PAGINAS.find(p => p.path === path)?.label ?? ''
