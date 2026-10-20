import { useEffect, useRef } from 'react'

// Menú que se abre desde un botón (avisos, perfil). Al abrir, el foco pasa a la primera opción;
// las flechas, Inicio y Fin recorren las opciones; Escape o Tab lo cierran y el foco regresa al botón.
// Antes Escape no hacía nada y la capa invisible de atrás seguía tapando la pantalla.
export function useMenuDesplegable(abierto, cerrar) {
  const boton = useRef(null)
  const menu = useRef(null)
  // `cerrar` cambia en cada render del encabezado; con la referencia el efecto no vuelve a mover el foco
  const alCerrar = useRef(cerrar)
  alCerrar.current = cerrar

  useEffect(() => {
    if (!abierto) return
    const opciones = () => [...(menu.current?.querySelectorAll('[role="menuitem"]') ?? [])]
    opciones()[0]?.focus()

    const alTeclear = (e) => {
      const lista = opciones()
      const i = lista.indexOf(document.activeElement)
      const ir = (j) => { e.preventDefault(); lista[(j + lista.length) % lista.length]?.focus() }
      if (e.key === 'Escape' || e.key === 'Tab') {
        e.preventDefault()
        alCerrar.current()
        boton.current?.focus()
      }
      else if (!lista.length) return
      else if (e.key === 'ArrowDown') ir(i + 1)
      else if (e.key === 'ArrowUp') ir(i < 0 ? -1 : i - 1)
      else if (e.key === 'Home') ir(0)
      else if (e.key === 'End') ir(-1)
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto])

  return { boton, menu }
}
