import { useEffect, useState } from 'react'

// Como useState, pero se acuerda mientras dure la sesión del navegador (sessionStorage): al ir a otra
// pantalla y regresar, el filtro sigue como lo dejó la persona. Al cerrar la pestaña se olvida.
// Sin `clave` se comporta como un useState normal.
export function useEstadoSesion(clave, inicial) {
  const [valor, setValor] = useState(() => {
    if (!clave) return inicial
    try {
      const guardado = sessionStorage.getItem(clave)
      return guardado !== null ? JSON.parse(guardado) : inicial
    } catch {
      return inicial
    }
  })

  useEffect(() => {
    if (!clave) return
    try { sessionStorage.setItem(clave, JSON.stringify(valor)) } catch { /* modo privado: no pasa nada */ }
  }, [clave, valor])

  return [valor, setValor]
}
