// Encabezado de una tarjeta de resumen: título y, como hijo, una nota opcional a la derecha.
// `icon` se acepta por compatibilidad, pero ya no se muestra: el título solo se entiende.
export default function TituloTarjeta({ titulo, children, className = 'mb-4' }) {
  return (
    <div className={`flex items-baseline flex-wrap gap-x-2 gap-y-1 ${className}`}>
      <h2 className="text-[15px] font-semibold" style={{ color: '#263442' }}>{titulo}</h2>
      {children && <span className="text-xs ml-auto" style={{ color: '#627080' }}>{children}</span>}
    </div>
  )
}
