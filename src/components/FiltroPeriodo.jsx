const PRESETS = [['hoy', 'Hoy'], ['ayer', 'Ayer'], ['semana', 'Semana'], ['mes', 'Mes']]

// Rango de fechas con atajos. Recibe lo que regresa `usePeriodo`.
// En móvil las fechas y los atajos ocupan cada uno su renglón completo.
export default function FiltroPeriodo({ periodo, presets = PRESETS }) {
  const { dateFrom, dateTo, preset, elegirPreset, cambiarFecha } = periodo
  return (
    <div className="filtro-periodo">
      <div className="filtro-periodo-fechas">
        <input type="date" value={dateFrom} max={dateTo} onChange={e => cambiarFecha(e.target.value, dateTo)} className="filter-input" aria-label="Desde" />
        <span className="date-range-sep">—</span>
        <input type="date" value={dateTo} min={dateFrom} onChange={e => cambiarFecha(dateFrom, e.target.value)} className="filter-input" aria-label="Hasta" />
      </div>
      <div className="filtro-periodo-atajos" role="group" aria-label="Periodos rápidos">
        {presets.map(([k, l]) => (
          <button key={k} type="button" onClick={() => elegirPreset(k)} aria-pressed={preset === k} className={`preset-chip ${preset === k ? 'active' : 'idle'}`}>{l}</button>
        ))}
      </div>
    </div>
  )
}
