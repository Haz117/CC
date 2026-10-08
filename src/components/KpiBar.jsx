import { SkeletonLine } from './Skeleton'

// `estado`: 'cargando' mientras llega la primera respuesta y 'error' si nunca llegó. En los dos casos
// no hay cifra que mostrar, así que va un marcador en su lugar en vez de un cero.
export default function KpiBar({ items = [], estado = null }) {
  return (
    <div className="grid animate-fade-in kpi-bar" style={{ marginBottom: '1.5rem' }}>
      {items.map((item, i) => {
        const accentColor = estado ? '#D4DDE6' : item.alert ? '#C97A6D' : item.good ? '#059669' : '#F97316'
        const valueColor  = estado ? '#627080' : item.alert ? '#C97A6D' : item.good ? '#059669' : '#263442'
        return (
          <div
            key={item.label}
            className="card animate-fade-in-up kpi-cell"
            style={{
              animationDelay: `${Math.min(i * 55, 200)}ms`,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              borderLeft: `4px solid ${accentColor}`,
              borderTop: 'none',
              borderRight: 'none',
              borderBottom: 'none',
            }}
          >
            <p style={{
              fontSize: '.67rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.09em', color: '#627080',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {item.label}
            </p>
            {estado === 'cargando' ? <SkeletonLine w="w-2/3" h="h-6" /> : (
              <p
                className="leading-none tracking-tight font-black"
                style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.65rem)', color: valueColor, letterSpacing: '-.04em' }}
              >
                {estado === 'error' ? '—' : item.value}
              </p>
            )}
            {item.sub && (
              <p style={{ fontSize: '.62rem', fontWeight: 600, color: '#627080', whiteSpace: 'nowrap' }}>
                {/* El renglón se conserva (con un espacio) para que la tarjeta no brinque al llegar los datos */}
                {estado ? ' ' : item.sub}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
