import { Download } from 'lucide-react'

export default function ChartCard({ title, subtitle, onExport, exportLabel = 'Exportar', className = '', style = {}, children }) {
  return (
    <div className={`card p-5 mb-6 ${className}`} style={style}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold tracking-tight" style={{ color: '#263442' }}>{title}</h2>
          {subtitle && <p className="text-xs" style={{ color: '#8FA1B2' }}>{subtitle}</p>}
        </div>
        {onExport && (
          <button
            aria-label={exportLabel}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors"
            style={{ color: '#F97316', background: '#FFF7ED' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,.15)'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFF7ED'}
            onClick={onExport}
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" /> {exportLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}
