import { useSyncExternalStore } from 'react'

// Si el título grande de la pantalla se ve o ya se desplazó hacia arriba. La barra de arriba muestra el
// nombre de la página solo cuando el título grande ya no se ve, como los títulos que se pliegan en el
// teléfono: así no sale repetido dos veces.
let visible = false
const oyentes = new Set()

export function marcarTituloVisible(valor) {
  if (valor === visible) return
  visible = valor
  oyentes.forEach(avisar => avisar())
}

function suscribir(avisar) {
  oyentes.add(avisar)
  return () => oyentes.delete(avisar)
}

export const useTituloVisible = () => useSyncExternalStore(suscribir, () => visible)
