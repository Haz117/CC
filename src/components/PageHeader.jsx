import { useEnfocarTitulo } from '../hooks/useEnfocarTitulo'

// Encabezado de cada pantalla: título grande y, a la derecha, los botones de acción.
// Sin ruta de migas ni ícono: la barra de arriba y el menú ya dicen dónde está la persona.
// `breadcrumb` se acepta por compatibilidad, pero ya no se muestra.
export default function PageHeader({ title, subtitle, children }) {
  const titulo = useEnfocarTitulo()
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap mb-6 animate-fade-in">
      <div className="min-w-0">
        <h1 ref={titulo} className="font-bold leading-tight" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', color: '#263442', letterSpacing: '-.02em' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1 page-header-sub" style={{ color: '#627080' }}>{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}
