import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import Desplegable from './Desplegable'

// Lista de opciones con el foco en la elegida; se recorre con las flechas, Inicio y Fin.
function ListaOpciones({ opciones, value, etiqueta, onElegir }) {
  const lista = useRef(null)
  useEffect(() => {
    lista.current.querySelector('[aria-selected="true"]')?.focus()
  }, [])

  const teclear = (e) => {
    const botones = [...lista.current.querySelectorAll('[role="option"]')]
    const i = botones.indexOf(document.activeElement)
    const destino = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: botones.length - 1 }[e.key]
    if (destino === undefined) return
    e.preventDefault()
    botones[Math.max(0, Math.min(destino, botones.length - 1))].focus()
  }

  return (
    <div ref={lista} role="listbox" aria-label={etiqueta} className="lista-opciones" onKeyDown={teclear}>
      {opciones.map(o => {
        const elegida = o.valor === value
        return (
          <button key={o.valor} type="button" role="option" aria-selected={elegida} onClick={() => onElegir(o.valor)} className="opcion">
            <span className="truncate">{o.texto}</span>
            {elegida && <Check className="opcion-check" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}

// Reemplazo del <select> del navegador: un botón con la opción actual que abre un menú
// (hoja desde abajo en móvil). `opciones` es [{ valor, texto }].
export default function Selector({ value, onChange, opciones, etiqueta, icono: Icono, className = '' }) {
  const [abierto, setAbierto] = useState(false)
  const boton = useRef(null)
  const actual = opciones.find(o => o.valor === value) ?? opciones[0]

  return (
    <>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(v => !v)}
        onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setAbierto(true) } }}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={`${etiqueta}: ${actual?.texto ?? ''}`}
        className={`control-nativo ${className}`}
      >
        {Icono && <Icono className="control-nativo-icono" aria-hidden="true" />}
        <span className="control-nativo-texto">{actual?.texto}</span>
        <ChevronDown className="control-nativo-flecha" aria-hidden="true" />
      </button>
      {abierto && (
        <Desplegable ancla={boton} onCerrar={() => setAbierto(false)} titulo={etiqueta} igualarAncho>
          <ListaOpciones opciones={opciones} value={value} etiqueta={etiqueta} onElegir={v => { onChange(v); setAbierto(false) }} />
        </Desplegable>
      )}
    </>
  )
}
