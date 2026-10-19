import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MOVIL = '(max-width: 640px)'
const SEPARACION = 6
const MARGEN = 8

// Panel que se abre desde un botón de filtro: en escritorio flota debajo del botón (o encima si
// no cabe) y en móvil sube desde abajo como hoja, igual que los menús del sistema.
// Se monta en <body> para que no lo recorte el `overflow: hidden` de la tarjeta.
export default function Desplegable({ ancla, onCerrar, titulo, igualarAncho = false, children }) {
  const panel = useRef(null)
  const [movil] = useState(() => window.matchMedia(MOVIL).matches)
  const cerrar = useRef(onCerrar)
  useLayoutEffect(() => { cerrar.current = onCerrar })

  // Escritorio: se coloca pegado al botón y lo sigue al desplazar o al cambiar de tamaño
  useLayoutEffect(() => {
    if (movil) return
    const nodo = panel.current
    const colocar = () => {
      const r = ancla.current.getBoundingClientRect()
      if (igualarAncho) nodo.style.minWidth = `${r.width}px`
      const { offsetWidth: ancho, offsetHeight: alto } = nodo
      const left = Math.min(Math.max(MARGEN, r.left), window.innerWidth - ancho - MARGEN)
      const cabeAbajo = r.bottom + SEPARACION + alto + MARGEN <= window.innerHeight
      const arriba = !cabeAbajo && r.top > window.innerHeight - r.bottom
      nodo.style.left = `${left}px`
      nodo.style.top = `${arriba ? Math.max(MARGEN, r.top - SEPARACION - alto) : r.bottom + SEPARACION}px`
      nodo.style.transformOrigin = arriba ? 'bottom left' : 'top left'
    }
    colocar()
    const observador = new ResizeObserver(colocar)
    observador.observe(nodo)
    window.addEventListener('resize', colocar)
    window.addEventListener('scroll', colocar, true)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', colocar)
      window.removeEventListener('scroll', colocar, true)
    }
  }, [movil, ancla, igualarAncho])

  // Se cierra con Escape o al tocar fuera; al cerrar, el foco vuelve al botón
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key !== 'Escape') return
      e.stopPropagation() // que no cierre también un modal de atrás
      cerrar.current()
    }
    const alTocar = (e) => {
      if (movil || panel.current.contains(e.target) || ancla.current?.contains(e.target)) return
      cerrar.current()
    }
    document.addEventListener('keydown', alTeclear)
    document.addEventListener('pointerdown', alTocar)
    const boton = ancla.current
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.removeEventListener('pointerdown', alTocar)
      if (document.activeElement === document.body) boton?.focus({ preventScroll: true })
    }
  }, [movil, ancla])

  // Tab hacia otro control de la página también lo cierra, como un menú del sistema
  const alSalirFoco = (e) => {
    const destino = e.relatedTarget
    if (destino && !panel.current.contains(destino) && !ancla.current?.contains(destino)) onCerrar()
  }

  const contenido = (
    <div
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-label={titulo}
      className={movil ? 'hoja' : 'flotante'}
      onBlur={alSalirFoco}
    >
      {movil && <div className="hoja-asa" aria-hidden="true" />}
      {movil && titulo && <p className="hoja-titulo">{titulo}</p>}
      {children}
    </div>
  )

  return createPortal(
    // En móvil el fondo se toca con `click` (no `pointerdown`) para que el toque no caiga en lo de abajo
    movil ? <div className="hoja-fondo" onClick={e => { if (e.target === e.currentTarget) onCerrar() }}>{contenido}</div> : contenido,
    document.body,
  )
}
