// Control segmentado, como el de iOS: elegir una opción entre pocas que se ven todas a la vez.
// `opciones` es [{ valor, texto, icono?, cuenta? }]; si `value` no coincide con ninguna, no se marca nada.
export default function Segmentado({ opciones, value, onChange, etiqueta, className = '' }) {
  return (
    <div className={`segmentado ${className}`} role="group" aria-label={etiqueta}>
      {opciones.map(({ valor, texto, icono: Icono, cuenta }) => (
        <button key={valor} type="button" onClick={() => onChange(valor)} aria-pressed={valor === value} className="segmentado-opcion">
          {Icono && <Icono className="segmentado-icono" aria-hidden="true" />}
          {texto}
          {cuenta !== undefined && <span className="segmentado-cuenta">{cuenta}</span>}
        </button>
      ))}
    </div>
  )
}
