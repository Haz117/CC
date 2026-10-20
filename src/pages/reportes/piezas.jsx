import KpiBar from '../../components/KpiBar'

/* ── Piezas compartidas ──────────────────────────────────── */
// Indicadores del reporte con el mismo aspecto que los de las demás pantallas, ícono incluido
export function Kpis({ items }) {
  return <KpiBar items={items.map(c => ({ icon: c.icon, label: c.label, value: c.value, sub: c.nota, alert: c.mal }))} />
}

export const Parcial = ({ consulta }) => consulta?.truncado ? (
  <p className="text-xs font-semibold rounded-2xl px-4 py-3 mb-6" style={{ color: '#C2410C', background: '#FFF7ED', border: '1px solid #FDBA74' }}>
    El periodo tiene {consulta.total.toLocaleString('es-MX')} ventas y solo se sumaron las {consulta.filas.length.toLocaleString('es-MX')} más recientes: los totales son parciales. Acorta el rango o elige una sucursal.
  </p>
) : null

export const SinDatos = ({ children }) => (
  <p className="text-sm text-center py-16" style={{ color: '#627080' }}>{children}</p>
)

// Leyenda de una gráfica con varias series: muestra de color y nombre en tinta de texto
// (la leyenda de Recharts pinta el nombre del color de la serie, y en tonos claros no se lee).
export const Leyenda = ({ series }) => (
  <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2" style={{ listStyle: 'none' }}>
    {series.map(s => (
      <li key={s.nombre} className="flex items-center gap-1.5 text-xs" style={{ color: '#263442' }}>
        <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
        {s.nombre}
      </li>
    ))}
  </ul>
)
