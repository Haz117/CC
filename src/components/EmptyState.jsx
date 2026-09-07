export default function EmptyState({ icon: Icon, title, subtitle, children, className = '' }) {
  return (
    <div className={`empty-state${className ? ' ' + className : ''}`}>
      {/* Ilustración SVG de fondo */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        {/* Círculos decorativos */}
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: .06 }}>
          <circle cx="48" cy="48" r="46" stroke="#F97316" strokeWidth="2"/>
          <circle cx="48" cy="48" r="32" stroke="#F97316" strokeWidth="1.5"/>
        </svg>
        {/* Caja del ícono */}
        <div className="empty-state-icon" style={{ position: 'relative', zIndex: 1 }}>
          <Icon className="w-7 h-7" style={{ color: '#FB923C' }} />
        </div>
      </div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-sub">{subtitle}</p>
      {children}
    </div>
  )
}
