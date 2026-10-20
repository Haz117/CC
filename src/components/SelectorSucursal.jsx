import { Store } from 'lucide-react'
import Selector from './Selector'

// Filtro por sucursal: sin elegir una, se ven todas juntas. El valor viaja como texto,
// igual que con el <select> de antes.
export default function SelectorSucursal({ value, onChange, sucursales, soloTiendas = false, className = '' }) {
  const lista = soloTiendas ? sucursales.filter(s => !s.es_almacen) : sucursales
  const opciones = [
    { valor: '', texto: 'Todas las sucursales' },
    ...lista.map(s => ({ valor: String(s.id), texto: s.nombre })),
  ]
  return <Selector value={String(value ?? '')} onChange={onChange} opciones={opciones} etiqueta="Sucursal" icono={Store} className={className} />
}
