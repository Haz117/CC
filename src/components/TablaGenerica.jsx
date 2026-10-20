import Badge from './Badge'
import { etiquetaEstado, colorEstado } from '../lib/calculos'
import { pesos, fechaHora } from '../utils/fmt'

const TECNICAS = new Set(['id', 'creado_en', 'actualizado_en', 'eliminado_en', 'sincronizado_en', 'activo'])

// "cantidad_sugerida" → "Cantidad sugerida" (antes la mayúscula la ponía el CSS en toda la palabra)
const titulo = (columna) => {
  const t = columna.replace(/_centavos$|_id$/, '').replace(/_/g, ' ')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function texto(columna, valor) {
  if (valor == null || valor === '') return '—'
  if (/_centavos$/.test(columna)) return pesos(valor)
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  if (columna === 'estado' && typeof valor === 'string') return <Badge label={etiquetaEstado(valor)} color={colorEstado(valor)} />
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(valor)) return fechaHora(valor)
  if (typeof valor === 'object') return JSON.stringify(valor)
  return String(valor)
}

/* Muestra filas tal como llegan de la base, sin depender de sus columnas exactas:
   toma las columnas de los datos, oculta las técnicas y da formato por el nombre
   (*_centavos → pesos, fechas ISO → hora local, estado → etiqueta). Las llaves *_id solo
   se muestran si `resolver` trae cómo convertirlas a un nombre; `resolver` también puede
   dar formato a cualquier otra columna y recibe (valor, fila). `primero` fija columnas al
   inicio y `titulos` cambia el encabezado de las que lo necesiten. `ocultar` quita columnas que
   valen lo mismo en todas las filas (p. ej. el estado de una lista que ya viene filtrada por estado).
   En móvil cada fila se vuelve una tarjeta con la etiqueta de cada columna. */
export default function TablaGenerica({ filas, resolver = {}, primero = [], titulos = {}, ocultar = [] }) {
  const presentes = [...new Set(filas.flatMap(f => Object.keys(f)))]
  const resto = presentes.filter(c =>
    !primero.includes(c) && !TECNICAS.has(c) && !ocultar.includes(c) && (!/_id$/.test(c) || resolver[c]),
  )
  const columnas = [...primero.filter(c => presentes.includes(c)), ...resto]
  const encabezado = (c) => titulos[c] ?? titulo(c)

  return (
    <div className="overflow-x-auto table-card sin-acciones" tabIndex={0} role="region" aria-label="Tabla del reporte">
      <table className="table-modern">
        <thead>
          <tr>{columnas.map(c => <th key={c}>{encabezado(c)}</th>)}</tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={fila.id ?? fila.folio ?? fila.clave ?? i}>
              {columnas.map(c => (
                <td key={c} data-label={encabezado(c)} className="text-sm" style={{ color: '#627080' }}>
                  {resolver[c] && fila[c] != null ? resolver[c](fila[c], fila) : texto(c, fila[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
