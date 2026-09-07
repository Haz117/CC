export default function EmptyState({ icon: Icon, title, subtitle, children, className = '' }) {
  return (
    <div className={`empty-state${className ? ' ' + className : ''}`}>
      <div className="empty-state-icon"><Icon className="w-7 h-7" style={{ color: '#FED7AA' }} /></div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-sub">{subtitle}</p>
      {children}
    </div>
  )
}
