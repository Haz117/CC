import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

/* ── Piezas compartidas ──────────────────────────────────── */
export function Kpis({ items }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((c, i) => (
        <div key={c.label} className="card card-glow p-4 animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 60, 200)}ms` }}>
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium leading-tight" style={{ color: '#627080' }}>{c.label}</p>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: c.mal ? 'rgba(201,122,109,.1)' : 'rgba(5,150,105,.1)' }}>
              {c.mal
                ? <ArrowDownRight className="w-3.5 h-3.5" style={{ color: '#8A4A42' }} />
                : <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#047857' }} />
              }
            </div>
          </div>
          <p className="text-xl font-bold mb-2" style={{ color: '#263442' }}>{c.value}</p>
          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={c.mal
              ? { color: '#8A4A42', background: 'rgba(201,122,109,.1)' }
              : { color: '#047857', background: 'rgba(5,150,105,.1)' }
            }
          >{c.nota}</span>
        </div>
      ))}
    </div>
  )
}

export const Parcial = ({ consulta }) => consulta?.truncado ? (
  <p className="text-xs font-semibold rounded-2xl px-4 py-3 mb-6" style={{ color: '#C2410C', background: '#FFF7ED', border: '1px solid #FDBA74' }}>
    El periodo tiene {consulta.total.toLocaleString('es-MX')} ventas y solo se sumaron las {consulta.filas.length.toLocaleString('es-MX')} más recientes: los totales son parciales. Acorta el rango o elige una sucursal.
  </p>
) : null

export const SinDatos = ({ children }) => (
  <p className="text-sm text-center py-16" style={{ color: '#627080' }}>{children}</p>
)
