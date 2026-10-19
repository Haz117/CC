import KpiBar from '../../components/KpiBar'

/* ── Piezas compartidas ──────────────────────────────────── */
// Indicadores del reporte con el mismo aspecto que los de las demás pantallas
export function Kpis({ items }) {
  return <KpiBar items={items.map(c => ({ label: c.label, value: c.value, sub: c.nota, alert: c.mal }))} />
}

export const Parcial = ({ consulta }) => consulta?.truncado ? (
  <p className="text-xs font-semibold rounded-2xl px-4 py-3 mb-6" style={{ color: '#C2410C', background: '#FFF7ED', border: '1px solid #FDBA74' }}>
    El periodo tiene {consulta.total.toLocaleString('es-MX')} ventas y solo se sumaron las {consulta.filas.length.toLocaleString('es-MX')} más recientes: los totales son parciales. Acorta el rango o elige una sucursal.
  </p>
) : null

export const SinDatos = ({ children }) => (
  <p className="text-sm text-center py-16" style={{ color: '#627080' }}>{children}</p>
)
