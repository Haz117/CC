export default function AlertBanner({ icon: Icon, title, subtitle, className = '' }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl px-4 py-3.5${className ? ' ' + className : ''}`}
      style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.25)' }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C97A6D' }} />
      <div>
        <p className="text-sm font-bold" style={{ color: '#A05A52' }}>{title}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#C97A6D' }}>{subtitle}</p>}
      </div>
    </div>
  )
}
