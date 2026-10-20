import { fmtDec } from '../utils/fmt'

const FORMATOS = {
  pesos: (v) => fmtDec(v ?? 0),
  cantidad: (v) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 3 }).format(v ?? 0),
  porcentaje: (v) => `${Math.round(v ?? 0)}%`,
}

// Una gráfica con su versión en palabras. Las barras no se pueden leer con lector de pantalla, así que
// junto a la gráfica va un texto oculto que dice lo mismo ("Centro: $146,031.00; Norte: …").
// `resumen` reemplaza al texto armado cuando la gráfica tiene más de un dato por barra.
export default function Grafica({ titulo, datos = [], etiqueta, valor, unidad = 'pesos', resumen, children }) {
  const formato = FORMATOS[unidad] ?? String
  const texto = resumen ?? (datos.length
    ? `${titulo}. ${datos.map(d => `${d[etiqueta]}: ${formato(d[valor])}`).join('; ')}.`
    : `${titulo}: sin datos.`)
  return (
    <>
      <p className="sr-only">{texto}</p>
      {children}
    </>
  )
}
