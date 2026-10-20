import { useSyncExternalStore } from 'react'

// Hora de la última consulta que llegó bien de la base y si el navegador tiene red.
// La alimenta useConsulta; la leen el indicador de las pantallas y la tarjeta del menú.
let ultima = null
const oyentes = new Set()

export function marcarSincronizado() {
  ultima = Date.now()
  oyentes.forEach(avisar => avisar())
}

function suscribir(avisar) {
  oyentes.add(avisar)
  window.addEventListener('online', avisar)
  window.addEventListener('offline', avisar)
  return () => {
    oyentes.delete(avisar)
    window.removeEventListener('online', avisar)
    window.removeEventListener('offline', avisar)
  }
}

export function useSincronizacion() {
  const desde = useSyncExternalStore(suscribir, () => ultima)
  const enLinea = useSyncExternalStore(suscribir, () => navigator.onLine)
  return { desde, enLinea }
}
