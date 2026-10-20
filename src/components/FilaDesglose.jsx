// Renglón de un desglose: la etiqueta con su cuenta ("Efectivo · 8 pagos"), un dato a la derecha
// y abajo la barra con su proporción. Sin recuadro con el número: la cuenta se lee junto a la etiqueta.
// El color va en la barra; el texto se queda en tinta de texto, salvo `tonoDerecha` cuando avisa algo.
export default function FilaDesglose({ etiqueta, cuenta, derecha, tonoDerecha = '#263442', pct, color }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-[0.8125rem] truncate" style={{ color: '#263442' }}>
          <span className="font-semibold">{etiqueta}</span>
          {cuenta != null && <span style={{ color: '#627080' }}> · {cuenta}</span>}
        </span>
        {derecha != null && (
          <span className="text-[0.8125rem] font-semibold flex-shrink-0" style={{ color: tonoDerecha, fontVariantNumeric: 'tabular-nums' }}>{derecha}</span>
        )}
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#FDE8D0' }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
