import { useLocation } from 'react-router-dom'
import { PAGINAS } from '../lib/navegacion'

// Encabezado de cada pantalla: ícono de la página (tomado de la ruta), breadcrumb, título y subtítulo,
// con espacio a la derecha para los botones de acción. Claro, para que respire.
export default function PageHeader({ breadcrumb, title, subtitle, children }) {
  const { pathname } = useLocation()
  const Icon = PAGINAS.find(p => p.path === pathname)?.icon

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6 animate-fade-in">
      <div className="flex items-center gap-3.5 min-w-0">
        {Icon && (
          <span className="page-header-icon">
            <Icon style={{ width: 22, height: 22, color: '#F97316' }} />
          </span>
        )}
        <div className="min-w-0">
          {breadcrumb && (
            <p className="text-[10px] font-bold uppercase tracking-[.15em] mb-1" style={{ color: '#8FA1B2' }}>
              Panel &rsaquo; {breadcrumb}
            </p>
          )}
          <h1 className="font-black leading-none tracking-tight" style={{ fontSize: 'clamp(1.375rem, 3.5vw, 2rem)', color: '#263442' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-1.5 font-medium page-header-sub" style={{ color: '#627080' }}>{subtitle}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}
