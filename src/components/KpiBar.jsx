export default function KpiBar({ items = [] }) {
  return (
    <div className="grid gap-3 animate-fade-in kpi-bar" style={{ marginBottom: '1.5rem' }}>
      {items.map((item, i) => {
        const accentColor = item.alert ? '#C97A6D' : item.good ? '#059669' : '#F97316'
        const valueColor  = item.alert ? '#C97A6D' : item.good ? '#059669' : '#1A2738'
        return (
          <div
            key={item.label}
            className="card animate-fade-in-up kpi-cell"
            style={{
              animationDelay: `${Math.min(i * 55, 200)}ms`,
              padding: '14px 16px',
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
              letterSpacing: '.09em', color: '#8FA1B2',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {item.label}
            </p>
            <p
              className="leading-none tracking-tight font-black"
              style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.65rem)', color: valueColor, letterSpacing: '-.04em' }}
            >
              {item.value}
            </p>
            {item.sub && (
              <p style={{ fontSize: '.62rem', fontWeight: 600, color: '#8FA1B2', whiteSpace: 'nowrap' }}>
                {item.sub}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
