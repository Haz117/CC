export default function ChartTooltip({ active, payload, label, format = v => v }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #FDE8D0', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(249,115,22,.12)' }}>
      <p style={{ fontSize: 10, color: '#8FA1B2', fontWeight: 700 }}>{label}</p>
      <p style={{ fontSize: 13, color: '#F97316', fontWeight: 800 }}>{format(payload[0].value)}</p>
    </div>
  )
}
