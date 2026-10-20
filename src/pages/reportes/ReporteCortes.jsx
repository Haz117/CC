import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Scissors, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react'
import { SkeletonReport } from '../../components/Skeleton'
import Estado from '../../components/Estado'
import Pagination from '../../components/Pagination'
import ChartCard from '../../components/ChartCard'
import TableCard from '../../components/TableCard'
import AvisoError from '../../components/AvisoError'
import { downloadCSV } from '../../utils/csv'
import { useConsulta } from '../../hooks/useConsulta'
import { listarCortes } from '../../api/cajas'
import { pesos, fecha, hora, diaCorto, fmtDec, diaLocal, plural } from '../../utils/fmt'
import { PAGE_SIZE, tooltipStyle, ejeMiles, tick } from './constantes'
import { Kpis, SinDatos } from './piezas'
import Grafica from '../../components/Grafica'

/* ── CORTES DE CAJA ──────────────────────────────────────── */
export default function ReporteCortes({ filtro, nombreCorto }) {
  const [page, setPage] = useState(1)
  const q = useConsulta(
    () => listarCortes({ ...filtro, porPagina: 500 }),
    [filtro.desde, filtro.hasta, filtro.sucursalId],
  )
  const cortes = q.datos?.filas
  const r = useMemo(() => {
    const filas = cortes ?? []
    let faltante = 0, sobrante = 0, cuadrados = 0
    const porDia = new Map()
    for (const c of filas) {
      const d = c.diferencia_centavos ?? 0
      if (d < 0) faltante += d
      else if (d > 0) sobrante += d
      else cuadrados++
      const dia = diaLocal(c.cerrado_en)
      const g = porDia.get(dia) ?? { dia, etiqueta: diaCorto(c.cerrado_en), centavos: 0 }
      g.centavos += d
      porDia.set(dia, g)
    }
    const dias = [...porDia.values()].sort((a, b) => a.dia.localeCompare(b.dia)).map(g => ({ ...g, diferencia: g.centavos / 100 }))
    return { filas, faltante, sobrante, cuadrados, dias }
  }, [cortes])

  useEffect(() => { setPage(1) }, [filtro.desde, filtro.hasta, filtro.sucursalId])

  if (q.cargando) return <SkeletonReport />
  // Sin respuesta no hay nada que resumir: solo el aviso, en vez de un reporte en ceros.
  if (q.datos === undefined) return <AvisoError error={q.error} onReintentar={q.recargar} />
  const { filas, faltante, sobrante, cuadrados, dias } = r
  const exportar = () => downloadCSV(filas.map(c => ({
    caja: c.caja?.nombre ?? '', sucursal: nombreCorto(c.sucursal_id), cajero: c.cajero?.nombre_completo ?? '',
    apertura: `${fecha(c.abierto_en)} ${hora(c.abierto_en)}`, cierre: `${fecha(c.cerrado_en)} ${hora(c.cerrado_en)}`,
    esperado: (c.efectivo_esperado_centavos / 100).toFixed(2), contado: (c.efectivo_contado_centavos / 100).toFixed(2),
    diferencia: ((c.diferencia_centavos ?? 0) / 100).toFixed(2), notas: c.notas_cierre ?? '',
  })), 'reporte_cortes')

  return (
    <>
      <AvisoError error={q.error} onReintentar={q.recargar} className="mb-6" />
      <Kpis items={[
        { icon: Scissors,     label: 'Cortes del periodo', value: filas.length, nota: filas.length ? `de ${plural(new Set(filas.map(c => `${c.sucursal_id}|${c.caja?.nombre}`)).size, 'caja')}` : 'ninguno en el periodo' },
        { icon: CheckCircle2, label: 'Sin diferencia',    value: cuadrados,          nota: filas.length ? `${Math.round(cuadrados / filas.length * 100)}% de los cortes` : 'sin cortes' },
        { icon: TrendingDown, label: 'Faltantes',         value: pesos(-faltante),   nota: 'contado menor al esperado', mal: faltante < 0 },
        { icon: TrendingUp,   label: 'Sobrantes',         value: pesos(sobrante),    nota: 'contado mayor al esperado', mal: sobrante > 0 },
      ]} />
      <ChartCard title="Diferencia de los cortes por día" subtitle={`Neto del periodo: ${faltante + sobrante < 0 ? '−' : ''}${pesos(Math.abs(faltante + sobrante))}`}>
        {dias.length === 0 ? <SinDatos>Sin cortes en este periodo</SinDatos> : (
          <Grafica titulo="Diferencia de los cortes por día" datos={dias} etiqueta="etiqueta" valor="diferencia">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dias} barCategoryGap="35%" maxBarSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
              <XAxis dataKey="etiqueta" tick={tick} axisLine={false} tickLine={false} minTickGap={10} />
              <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={ejeMiles} width={52} />
              {/* El eje siempre incluye el cero (sin él, una barra de −$12.50 parecía enorme) y conserva marcas redondas */}
              <ReferenceLine y={0} stroke="#D4DDE6" ifOverflow="extendDomain" />
              <Tooltip separator=": " formatter={v => [fmtDec(v), 'Diferencia']} contentStyle={tooltipStyle} cursor={{ fill: '#FFF7ED' }} />
              <Bar dataKey="diferencia" radius={[4, 4, 4, 4]} minPointSize={3}>
                {dias.map(d => <Cell key={d.dia} fill={d.diferencia < 0 ? '#8A4A42' : d.diferencia > 0 ? '#92400E' : '#047857'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </Grafica>
        )}
      </ChartCard>
      <TableCard title="Detalle de cortes" exportLabel="Exportar CSV" onExport={exportar}>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla del reporte">
          <table className="table-modern">
            <thead><tr>{['Caja', 'Sucursal', 'Cajero', 'Cierre', 'Esperado', 'Contado', 'Diferencia'].map(t => <th key={t}>{t}</th>)}</tr></thead>
            <tbody>
              {filas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(c => {
                const d = c.diferencia_centavos ?? 0
                return (
                  <tr key={c.id}>
                    <td className="font-semibold" style={{ color: '#263442' }}>{c.caja?.nombre ?? 'Caja'}</td>
                    <td style={{ color: '#627080' }}>{nombreCorto(c.sucursal_id)}</td>
                    <td style={{ color: '#627080' }}>{c.cajero?.nombre_completo ?? '—'}</td>
                    <td className="text-xs" style={{ color: '#627080' }}>{fecha(c.cerrado_en)} · {hora(c.cerrado_en)}</td>
                    <td style={{ color: '#627080' }}>{pesos(c.efectivo_esperado_centavos)}</td>
                    <td className="font-semibold" style={{ color: '#263442' }}>{pesos(c.efectivo_contado_centavos)}</td>
                    <td>
                      <Estado label={d === 0 ? 'Sin diferencia' : `${d < 0 ? 'Faltante' : 'Sobrante'} ${pesos(Math.abs(d))}`} color={d < 0 ? 'red' : 'amber'} normal={d === 0} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filas.length === 0 && <SinDatos>Sin cortes en este periodo</SinDatos>}
        <Pagination page={page} perPage={PAGE_SIZE} total={filas.length} onChange={setPage} />
      </TableCard>
    </>
  )
}
