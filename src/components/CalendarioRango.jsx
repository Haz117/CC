import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { diaLocal, inicioDelDia, sumarDias, rangoCorto } from '../utils/fmt'

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const fMes = new Intl.DateTimeFormat('es-MX', { month: 'long' })
const fDiaLargo = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const MOVER = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

// El mismo día en otro mes; si ese mes es más corto, el último día del mes.
const otroMes = (dia, n) => {
  const d = inicioDelDia(dia)
  const ultimo = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()
  return diaLocal(new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), ultimo)))
}

// Calendario para elegir un rango 'yyyy-mm-dd': el primer toque marca el inicio y el segundo el
// final (el mismo día dos veces = un solo día). Se mueve con las flechas y Re Pág / Av Pág.
export default function CalendarioRango({ desde, hasta, max = diaLocal(), onElegir }) {
  const [inicio, setInicio] = useState(null) // primer día ya tocado, en espera del último
  const [sobre, setSobre] = useState(null)   // día bajo el puntero, para mostrar el rango antes de soltarlo
  const [foco, setFoco] = useState(hasta)    // el mes visible es siempre el del día con foco
  const enfocar = useRef(true)
  const rejilla = useRef(null)

  useEffect(() => {
    if (!enfocar.current) return
    enfocar.current = false
    rejilla.current?.querySelector(`[data-dia="${foco}"]`)?.focus({ preventScroll: true })
  }, [foco])

  const base = inicioDelDia(foco)
  const anio = base.getFullYear()
  const mes = base.getMonth()
  const vacios = (new Date(anio, mes, 1).getDay() + 6) % 7 // la semana empieza en lunes
  const dias = Array.from({ length: new Date(anio, mes + 1, 0).getDate() }, (_, i) => diaLocal(new Date(anio, mes, i + 1)))
  const hoy = diaLocal()

  const extremo = inicio ? (sobre ?? inicio) : null
  const [a, b] = inicio ? [inicio, extremo].sort() : [desde, hasta]
  const hayMesSiguiente = diaLocal(new Date(anio, mes + 1, 1)) <= max

  const cambiarMes = (n) => { setFoco(f => { const d = otroMes(f, n); return d > max ? max : d }) }
  const tocar = (dia) => {
    setFoco(dia)
    if (!inicio) { setInicio(dia); setSobre(dia); return }
    const [x, y] = [inicio, dia].sort()
    onElegir(x, y)
  }
  const teclear = (e) => {
    let destino
    if (e.key in MOVER) destino = diaLocal(sumarDias(base, MOVER[e.key]))
    else if (e.key === 'PageUp' || e.key === 'PageDown') destino = otroMes(foco, e.key === 'PageUp' ? -1 : 1)
    else return
    e.preventDefault()
    if (destino > max) destino = max
    enfocar.current = true
    setFoco(destino)
    if (inicio) setSobre(destino)
  }

  return (
    <div className="calendario">
      <div className="calendario-cabeza">
        <button type="button" className="calendario-flecha" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="calendario-mes" aria-live="polite">
          {fMes.format(base).replace(/^./, l => l.toUpperCase())} <span>{anio}</span>
        </p>
        <button type="button" className="calendario-flecha" onClick={() => cambiarMes(1)} disabled={!hayMesSiguiente} aria-label="Mes siguiente">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="calendario-semana" aria-hidden="true">
        {DIAS.map((d, i) => <span key={i}>{d}</span>)}
      </div>

      <div ref={rejilla} className="calendario-dias" role="group" aria-label="Días del mes" onKeyDown={teclear} onPointerLeave={() => inicio && setSobre(inicio)}>
        {Array.from({ length: vacios }, (_, i) => <span key={`v${i}`} />)}
        {dias.map(dia => {
          const futuro = dia > max
          const enRango = dia >= a && dia <= b
          const clase = [
            'calendario-celda',
            enRango && a !== b && 'en-rango',
            enRango && dia === a && 'inicio-rango',
            enRango && dia === b && 'fin-rango',
          ].filter(Boolean).join(' ')
          return (
            <span key={dia} className={clase}>
              <button
                type="button"
                data-dia={dia}
                tabIndex={dia === foco ? 0 : -1}
                disabled={futuro}
                onClick={() => tocar(dia)}
                onPointerEnter={() => inicio && setSobre(dia)}
                aria-label={fDiaLargo.format(inicioDelDia(dia))}
                aria-pressed={enRango && (dia === a || dia === b)}
                aria-current={dia === hoy ? 'date' : undefined}
                className={`calendario-dia${dia === hoy ? ' hoy' : ''}`}
              >
                {Number(dia.slice(8))}
              </button>
            </span>
          )
        })}
      </div>

      <p className="calendario-ayuda" aria-live="polite">
        {inicio
          ? <>Desde <strong>{rangoCorto(inicio)}</strong>: ahora toca el último día</>
          : 'Toca el primer día del periodo'}
      </p>
    </div>
  )
}
