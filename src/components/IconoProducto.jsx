import { Droplet, Milk, Package } from 'lucide-react'

// Queso en cuña, dibujado con el mismo trazo que los íconos de Lucide (que no trae uno de queso).
export function Queso({ size = 24, color = 'currentColor', strokeWidth = 2, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 11.5 15.5 5 21 11.5" />
      <rect x="3" y="11.5" width="18" height="7.5" rx="1.5" />
      <circle cx="8" cy="15.2" r="1.3" />
      <circle cx="15" cy="14.6" r="0.9" />
    </svg>
  )
}

// El ícono sale de la categoría o del nombre del producto; si no se reconoce, un paquete.
function iconoDe(categoria = '', nombre = '') {
  const texto = `${categoria} ${nombre}`.toLowerCase()
  if (/queso|panela|oaxaca|manchego|cotija|reques/.test(texto)) return Queso
  if (/crema/.test(texto)) return Droplet
  if (/leche|yogur|jocoque|j[oó]coque/.test(texto)) return Milk
  return Package
}

export default function IconoProducto({ categoria, nombre, size = 18, color = '#627080', ...props }) {
  const Icono = iconoDe(categoria, nombre)
  return <Icono size={size} color={color} strokeWidth={1.9} aria-hidden="true" {...props} />
}
