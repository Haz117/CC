const palette = {
  orange: { bg: '#EBF5FF',              iconColor: '#2F8CEB', accent: 'accent-blue',   line: '#2F8CEB' },
  blue:   { bg: '#EBF5FF',              iconColor: '#2F8CEB', accent: 'accent-blue',   line: '#2F8CEB' },
  green:  { bg: 'rgba(5,150,105,.1)',   iconColor: '#059669', accent: 'accent-green',  line: '#059669' },
  red:    { bg: 'rgba(201,122,109,.1)', iconColor: '#C97A6D', accent: 'accent-red',    line: '#C97A6D' },
  purple: { bg: 'rgba(124,58,237,.1)',   iconColor: '#7c3aed', accent: 'accent-purple', line: '#7c3aed' },
  amber:  { bg: 'rgba(217,119,6,.1)',   iconColor: '#d97706', accent: 'accent-amber',  line: '#d97706' },
  teal:   { bg: 'rgba(13,148,136,.1)',  iconColor: '#0d9488', accent: 'accent-teal',   line: '#0d9488' },
}

function Sparkline({ seed, color, width = 80, height = 32 }) {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const v = (((seed * 9301 + i * 49297 + 233) % 233280) / 233280)
    return v
  })
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const norm = pts.map(v => (v - min) / (max - min || 1))
  const coords = norm.map((v, i) => {
    const x = (i / (norm.length - 1)) * width
    const y = height - 4 - v * (height - 8)
    return [x, y]
  })
  const d = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const fill = `${d} L${width},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} className="sparkline-svg" style={{ opacity: .75 }}>
      <defs>
        <linearGradient id={`sg${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg${seed})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={coords[coords.length - 1][0].toFixed(1)}
        cy={coords[coords.length - 1][1].toFixed(1)}
        r="2.5" fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  )
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'orange', trend, sparkSeed }) {
  const p = palette[color] || palette.orange

  return (
    <div
      className={`card p-5 cursor-default animate-card-reveal stat-card-premium ${p.accent}`}
      style={{ position: 'relative' }}
    >
      <div className="flex items-start justify-between mb-3">
        {/* Icon — flat light background */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: p.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: p.iconColor }} />
        </div>

        {/* Trend pill */}
        {trend !== undefined && (
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              padding: '4px 10px', borderRadius: '99px',
              fontSize: '.7rem', fontWeight: 800, lineHeight: 1,
              ...(trend >= 0
                ? { color: '#059669', background: 'rgba(5,150,105,.1)', border: '1px solid rgba(5,150,105,.18)' }
                : { color: '#A05A52', background: 'rgba(201,122,109,.1)', border: '1px solid rgba(201,122,109,.18)' }
              ),
            }}
          >
            <span style={{ fontSize: '.75rem' }}>{trend >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <p
        className="animate-number-in"
        style={{ fontSize: '1.625rem', fontWeight: 900, letterSpacing: '-.04em', color: '#263442', lineHeight: 1, marginBottom: '3px' }}
      >
        {value}
      </p>
      <p style={{ fontSize: '.8rem', fontWeight: 700, color: '#627080' }}>{title}</p>
      {subtitle && <p style={{ fontSize: '.72rem', color: '#8FA1B2', marginTop: '2px', fontWeight: 500 }}>{subtitle}</p>}

      {/* Sparkline */}
      {sparkSeed !== undefined && (
        <div style={{ marginTop: '10px', marginLeft: '-4px' }}>
          <Sparkline seed={sparkSeed} color={p.line} />
        </div>
      )}
    </div>
  )
}
