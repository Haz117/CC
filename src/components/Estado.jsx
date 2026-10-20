import Badge from './Badge'

// Estado dentro de una tabla o tarjeta: lo normal va como texto gris y solo la excepción lleva
// etiqueta de color. Veinte "Completada" verdes seguidas no dicen nada y esconden la única "Cancelada".
export default function Estado({ label, color, normal }) {
  return normal
    ? <span className="text-sm" style={{ color: '#627080' }}>{label}</span>
    : <Badge label={label} color={color} />
}
