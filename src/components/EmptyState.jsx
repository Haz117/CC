// Estado vacío como el de las apps del teléfono: un ícono grande y tranquilo, el título y una
// línea que dice qué hacer. Sin recuadros ni adornos.
export default function EmptyState({ icon: Icon, title, subtitle, children, className = '' }) {
  return (
    <div className={`empty-state${className ? ' ' + className : ''}`}>
      {Icon && <Icon className="empty-state-icono" strokeWidth={1.6} aria-hidden="true" />}
      <p className="empty-state-title">{title}</p>
      {subtitle && <p className="empty-state-sub">{subtitle}</p>}
      {children}
    </div>
  )
}
