// Filtro por sucursal: sin elegir una, se ven todas juntas.
export default function SelectorSucursal({ value, onChange, sucursales, soloTiendas = false, className = 'filter-input' }) {
  const opciones = soloTiendas ? sucursales.filter(s => !s.es_almacen) : sucursales
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={className} aria-label="Sucursal">
      <option value="">Todas las sucursales</option>
      {opciones.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
    </select>
  )
}
