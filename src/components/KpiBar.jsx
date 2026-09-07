export default function KpiBar({ items = [] }) {
  return (
    <div
      className="grid gap-3 animate-fade-in kpi-bar"
      style={{ marginBottom: '1.25rem' }}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className="card p-4 flex flex-col gap-1 animate-fade-in-up kpi-cell"
          style={{
            animationDelay: `${Math.min(i * 55, 200)}ms`,
            borderTop: item.alert
              ? '3px solid #C97A6D'
              : item.good
              ? '3px solid #059669'
              : '3px solid #F97316',
          }}
        >
          <p style={{
            fontSize: '.67rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.09em',
            color: '#8FA1B2',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {item.label}
          </p>
          <p
            className="leading-none tracking-tight font-black"
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.65rem)',
              color: item.alert ? '#C97A6D' : item.good ? '#059669' : '#263442',
              letterSpacing: '-.04em',
            }}
          >
            {item.value}
          </p>
          {item.sub && (
            <p style={{ fontSize: '.62rem', fontWeight: 600, color: '#8FA1B2', whiteSpace: 'nowrap' }}>
              {item.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
