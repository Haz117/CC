import { SkeletonLine } from './Skeleton'

// Tarjetas de indicadores de una pantalla. Cada `item` lleva { label, value, sub, icon, good, alert }.
// Arriba la etiqueta con su ícono chico, abajo la cifra: se lee primero qué es y luego cuánto.
// La cifra cambia de color solo cuando dice algo (verde bien, rojo alerta).
// `estado`: 'cargando' pinta un marcador mientras llega la primera respuesta; 'error' pone un guion.
export default function KpiBar({ items = [], estado = null }) {
  return (
    <div className="grid animate-fade-in kpi-bar" style={{ marginBottom: '1.5rem' }}>
      {items.map((item, i) => {
        const color = estado ? '#627080' : item.alert ? '#8A4A42' : item.good ? '#047857' : '#627080'
        const valueColor = estado ? '#627080' : item.alert ? '#8A4A42' : item.good ? '#047857' : '#263442'
        const Icon = item.icon
        return (
          <div key={item.label} className="card animate-fade-in-up kpi-cell" style={{ animationDelay: `${Math.min(i * 55, 200)}ms` }}>
            <p className="kpi-cell-label">
              {Icon && <Icon size={15} style={{ color, flexShrink: 0 }} aria-hidden="true" />}
              {item.label}
            </p>
            {estado === 'cargando'
              ? <SkeletonLine w="w-2/3" h="h-6" />
              : <p className="kpi-cell-value" style={{ color: valueColor }}>{estado === 'error' ? '—' : item.value}</p>}
            {item.sub && <p className="kpi-cell-sub">{estado ? ' ' : item.sub}</p>}
          </div>
        )
      })}
    </div>
  )
}
