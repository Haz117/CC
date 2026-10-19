const palette = {
  orange: { bg: '#FFF1E3',               text: '#C2410C', dot: '#C2410C' },
  blue:   { bg: '#FFF1E3',               text: '#C2410C', dot: '#C2410C' },
  green:  { bg: 'rgba(5,150,105,.1)',    text: '#047857', dot: '#047857' },
  red:    { bg: 'rgba(201,122,109,.13)', text: '#8A4A42', dot: '#8A4A42' },
  amber:  { bg: 'rgba(217,119,6,.11)',   text: '#92400E', dot: '#92400E' },
  gray:   { bg: '#EEF0F3',               text: '#4A5664', dot: '#627080' },
  purple: { bg: 'rgba(124,58,237,.1)',   text: '#6D28D9', dot: '#7c3aed' },
  teal:   { bg: 'rgba(13,148,136,.1)',   text: '#0F766E', dot: '#0d9488' },
}

// Etiqueta de estado: texto normal (sin mayúsculas forzadas) sobre un tinte suave, como las
// etiquetas de una app de sistema. El punto de color queda solo para quien lo pida con `dot`.
export default function Badge({ label, color = 'orange', dot = false }) {
  const p = palette[color] || palette.orange
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 8px',
        fontSize: '.75rem',
        fontWeight: 600,
        lineHeight: 1.5,
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        background: p.bg,
        color: p.text,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.dot, flexShrink: 0 }} />}
      {label}
    </span>
  )
}
