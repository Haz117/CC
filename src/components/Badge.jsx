const palette = {
  orange: { bg: '#EBF4FC',                   text: '#0F4FA3', border: '#C8DCE9',                   dot: '#2F8CEB' },
  blue:   { bg: '#EBF4FC',                   text: '#0F4FA3', border: '#C8DCE9',                   dot: '#2F8CEB' },
  green:  { bg: 'rgba(5,150,105,.09)',        text: '#059669', border: 'rgba(5,150,105,.22)',        dot: '#059669' },
  red:    { bg: 'rgba(201,122,109,.1)',       text: '#A05A52', border: 'rgba(201,122,109,.28)',      dot: '#C97A6D' },
  amber:  { bg: 'rgba(217,119,6,.09)',        text: '#d97706', border: 'rgba(217,119,6,.22)',        dot: '#d97706' },
  gray:   { bg: '#F2F3F5',                   text: '#627080', border: '#D4DDE6',                   dot: '#8FA1B2' },
  purple: { bg: 'rgba(124,58,237,.09)',        text: '#7c3aed', border: 'rgba(124,58,237,.22)',        dot: '#7c3aed' },
  teal:   { bg: 'rgba(13,148,136,.09)',       text: '#0d9488', border: 'rgba(13,148,136,.22)',       dot: '#0d9488' },
}

export default function Badge({ label, color = 'orange', dot = true }) {
  const p = palette[color] || palette.orange
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        fontSize: '.68rem',
        fontWeight: 700,
        borderRadius: '99px',
        letterSpacing: '.03em',
        textTransform: 'uppercase',
        background: p.bg,
        color: p.text,
        border: `1px solid ${p.border}`,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: p.dot,
            flexShrink: 0,
            display: 'inline-block',
          }}
        />
      )}
      {label}
    </span>
  )
}
