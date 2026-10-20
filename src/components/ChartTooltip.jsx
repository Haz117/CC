export default function ChartTooltip({ active, payload, label, format = v => v }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E8EBEF', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(249,115,22,.12)' }}>
      <p style={{ fontSize: 11, color: '#627080', fontWeight: 700 }}>{label}</p>
      <p style={{ fontSize: 13, color: '#C2410C', fontWeight: 800 }}>{format(payload[0].value)}</p>
    </div>
  )
}
