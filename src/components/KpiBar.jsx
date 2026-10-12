import { SkeletonLine } from './Skeleton'

// Tarjetas de indicadores de una pantalla. Cada `item` lleva { label, value, sub, icon, good, alert }.
// El ícono va en un recuadro con el color del indicador (naranja normal, verde bien, rojo alerta),
// igual que las tarjetas del panel, para que todas las pantallas se vean parejas.
// `estado`: 'cargando' pinta un marcador mientras llega la primera respuesta; 'error' pone un guion.
export default function KpiBar({ items = [], estado = null }) {
  return (
    <div className="grid animate-fade-in kpi-bar" style={{ marginBottom: '1.5rem' }}>
      {items.map((item, i) => {
        const color = estado ? '#8FA1B2' : item.alert ? '#C97A6D' : item.good ? '#059669' : '#F97316'
        const valueColor = estado ? '#627080' : item.alert ? '#C97A6D' : item.good ? '#059669' : '#263442'
        const tint = estado ? '#F2F3F5' : item.alert ? 'rgba(201,122,109,.12)' : item.good ? 'rgba(5,150,105,.1)' : '#FFF7ED'
        const Icon = item.icon
        return (
          <div key={item.label} className="card animate-fade-in-up kpi-cell" style={{ animationDelay: `${Math.min(i * 55, 200)}ms` }}>
            {Icon && (
              <span className="kpi-cell-icon" style={{ background: tint }}>
                <Icon size={18} style={{ color }} />
              </span>
            )}
            {estado === 'cargando'
              ? <SkeletonLine w="w-2/3" h="h-6" />
              : <p className="kpi-cell-value" style={{ color: valueColor }}>{estado === 'error' ? '—' : item.value}</p>}
            <p className="kpi-cell-label">{item.label}</p>
            {item.sub && <p className="kpi-cell-sub">{estado ? ' ' : item.sub}</p>}
          </div>
        )
      })}
    </div>
  )
}
