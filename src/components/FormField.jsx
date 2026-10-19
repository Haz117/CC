export default function FormField({ label, required, error, children, className = '' }) {
  return (
    <div className={className || undefined}>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#627080' }}>
        {label}{required && <span style={{ color: '#8A4A42' }}> *</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: '#8A4A42' }}>{error}</p>}
    </div>
  )
}
