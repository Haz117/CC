import { useRef, useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import Desplegable from './Desplegable'
import CalendarioRango from './CalendarioRango'
import Segmentado from './Segmentado'
import { rangoCorto } from '../utils/fmt'

const PRESETS = [['hoy', 'Hoy'], ['ayer', 'Ayer'], ['semana', 'Semana'], ['mes', 'Mes']]

// Rango de fechas con atajos. Recibe lo que regresa `usePeriodo`.
// El rango se elige en un calendario propio y los atajos van en un control segmentado;
// en móvil cada uno ocupa su renglón completo.
export default function FiltroPeriodo({ periodo, presets = PRESETS }) {
  const { dateFrom, dateTo, preset, elegirPreset, cambiarFecha } = periodo
  const [abierto, setAbierto] = useState(false)
  const boton = useRef(null)
  const texto = rangoCorto(dateFrom, dateTo)

  return (
    <div className="filtro-periodo">
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(v => !v)}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label={`Periodo: ${texto}`}
        className="control-nativo"
      >
        <CalendarDays className="control-nativo-icono" aria-hidden="true" />
        <span className="control-nativo-texto">{texto}</span>
        <ChevronDown className="control-nativo-flecha" aria-hidden="true" />
      </button>
      {abierto && (
        <Desplegable ancla={boton} onCerrar={() => setAbierto(false)} titulo="Elegir periodo">
          <CalendarioRango desde={dateFrom} hasta={dateTo} onElegir={(d, h) => { cambiarFecha(d, h); setAbierto(false) }} />
        </Desplegable>
      )}

      <Segmentado
        opciones={presets.map(([valor, texto]) => ({ valor, texto }))}
        value={preset}
        onChange={elegirPreset}
        etiqueta="Periodos rápidos"
      />
    </div>
  )
}
