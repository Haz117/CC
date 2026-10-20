import { useEffect, useRef } from 'react'
import { marcarTituloVisible } from '../lib/tituloEnPantalla'

const ALTO_BARRA = 64 // lo que tapa la barra de arriba

// El título grande de cada pantalla:
// - al entrar, recibe el foco para que el lector de pantalla anuncie a dónde se llegó (en una app de una
//   sola página eso no pasa solo). Solo si el foco estaba en el menú o en ningún lado: si la persona
//   está escribiendo en el buscador, no se le mueve;
// - avisa si se ve o no, para que la barra de arriba muestre el nombre de la página solo al desplazarse.
export function useEnfocarTitulo() {
  const titulo = useRef(null)

  useEffect(() => {
    const actual = document.activeElement
    const libre = !actual || actual === document.body || actual.closest('nav, aside')
    if (!libre || !titulo.current) return
    titulo.current.tabIndex = -1
    titulo.current.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const el = titulo.current
    if (!el || !('IntersectionObserver' in window)) return
    const observador = new IntersectionObserver(
      ([entrada]) => marcarTituloVisible(entrada.isIntersecting),
      { rootMargin: `-${ALTO_BARRA}px 0px 0px 0px` },
    )
    observador.observe(el)
    return () => { observador.disconnect(); marcarTituloVisible(false) }
  }, [])

  return titulo
}
