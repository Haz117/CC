export default function ChartTooltip({ active, payload, label, format = v => v }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E2EAF2', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(47,140,235,.12)' }}>
      <p style={{ fontSize: 10, color: '#8FA1B2', fontWeight: 700 }}>{label}</p>
      <p style={{ fontSize: 13, color: '#2F8CEB', fontWeight: 800 }}>{format(payload[0].value)}</p>
    </div>
  )
}
