// Encabezado de una tarjeta de resumen: ícono suelto (sin recuadro), título y, como hijo, una nota
// opcional a la derecha. El ícono es decorativo: el título ya dice qué es.
export default function TituloTarjeta({ icon: Icon, titulo, children, className = 'mb-4' }) {
  return (
    <div className={`flex items-center flex-wrap gap-x-2 gap-y-1 ${className}`}>
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#627080' }} strokeWidth={2.1} aria-hidden="true" />}
      <h2 className="text-[0.9375rem] font-semibold" style={{ color: '#263442' }}>{titulo}</h2>
      {children && <span className="text-xs ml-auto" style={{ color: '#627080' }}>{children}</span>}
    </div>
  )
}
