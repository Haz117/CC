// Renglón de un desglose: cuántos son, su etiqueta, un dato a la derecha y la barra con su proporción.
export default function FilaDesglose({ cuenta, etiqueta, derecha, pct, color, fondo = `${color}18` }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: fondo }}>
        <span className="text-xs font-bold" style={{ color }}>{cuenta}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1 gap-2">
          <span className="text-xs font-semibold truncate" style={{ color: '#627080' }}>{etiqueta}</span>
          {derecha != null && <span className="text-xs font-bold flex-shrink-0" style={{ color }}>{derecha}</span>}
        </div>
        <div className="h-1.5 rounded-full" style={{ background: '#FDE8D0' }}>
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  )
}
