import { Download } from 'lucide-react'

export default function TableCard({ title, onExport, exportLabel = 'Exportar PDF', className = '', children }) {
  return (
    <div className={`card overflow-hidden tabla-fija ${className}`}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E8EBEF' }}>
        <h2 className="font-bold tracking-tight" style={{ color: '#263442' }}>{title}</h2>
        {onExport && (
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors no-imprimir"
            style={{ color: '#C2410C', background: '#FFF7ED' }}
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
