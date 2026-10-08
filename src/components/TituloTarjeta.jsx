// Encabezado de una tarjeta de resumen: ícono, título y, como hijo, una nota opcional a la derecha.
export default function TituloTarjeta({ icon: Icon, titulo, children, className = 'mb-4' }) {
  return (
    <div className={`flex items-center flex-wrap gap-x-2 gap-y-1 ${className}`}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
      <span className="text-sm font-bold" style={{ color: '#263442' }}>{titulo}</span>
      {children && <span className="text-xs ml-auto" style={{ color: '#627080' }}>{children}</span>}
    </div>
  )
}
