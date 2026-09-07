export default function InfoCell({ label, value, color = '#627080', bold = false, center = false, bg, className = '' }) {
  return (
    <div
      className={`rounded-xl p-3${center ? ' text-center' : ''}${className ? ' ' + className : ''}`}
      style={{ background: bg || '#F2F3F5' }}
    >
      <p className="text-xs mb-0.5" style={{ color: '#8FA1B2' }}>{label}</p>
      <p className={`text-sm ${bold ? 'font-bold' : 'font-semibold'}`} style={{ color }}>{value}</p>
    </div>
  )
}
