import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonReport } from '../../components/Skeleton'
import Pagination from '../../components/Pagination'
import ChartCard from '../../components/ChartCard'
import TableCard from '../../components/TableCard'
import AvisoError from '../../components/AvisoError'
import { downloadCSV } from '../../utils/csv'
import { useConsulta } from '../../hooks/useConsulta'
import { listarMermas } from '../../api/inventario'
import { pesos, cantidad, fecha, hora, fmtDec } from '../../utils/fmt'
import { PAGE_SIZE, tooltipStyle, ejeMiles, tick, celdaTotal } from './constantes'
import { Kpis, SinDatos } from './piezas'
import Grafica from '../../components/Grafica'

/* ── MERMAS ──────────────────────────────────────────────── */
export default function ReporteMermas({ filtro, nombreCorto }) {
  const [page, setPage] = useState(1)
  const q = useConsulta(
    () => listarMermas({ ...filtro, porPagina: 500 }),
    [filtro.desde, filtro.hasta, filtro.sucursalId],
  )
  const mermas = q.datos?.filas
  const r = useMemo(() => {
    const filas = mermas ?? []
    const porMotivo = new Map()
    for (const m of filas) {
      const motivo = m.motivo || 'Sin motivo'
      const g = porMotivo.get(motivo) ?? { motivo, centavos: 0, casos: 0 }
      g.centavos += m.costo_centavos ?? 0
      g.casos++
      porMotivo.set(motivo, g)
    }
    const motivos = [...porMotivo.values()].sort((a, b) => b.centavos - a.centavos).map(g => ({ ...g, costo: g.centavos / 100 }))
    return { filas, motivos, costo: filas.reduce((s, m) => s + (m.costo_centavos ?? 0), 0) }
  }, [mermas])

  useEffect(() => { setPage(1) }, [filtro.desde, filtro.hasta, filtro.sucursalId])

  if (q.cargando) return <SkeletonReport />
  // Sin respuesta no hay nada que resumir: solo el aviso, en vez de un reporte en ceros.
  if (q.datos === undefined) return <AvisoError error={q.error} onReintentar={q.recargar} />
  const { filas, motivos, costo } = r

  return (
    <>
      <AvisoError error={q.error} onReintentar={q.recargar} className="mb-6" />
      <Kpis items={[
        { label: 'Mermas registradas', value: filas.length,                 nota: 'en el periodo', mal: filas.length > 0 },
        { label: 'Costo total',        value: pesos(costo),                 nota: 'producto perdido o dañado', mal: costo > 0 },
        { label: 'Costo promedio',     value: pesos(filas.length ? costo / filas.length : 0), nota: 'por merma' },
        { label: 'Principal motivo',   value: motivos[0]?.motivo ?? '—',    nota: motivos[0] ? `${motivos[0].casos} de ${filas.length} casos` : 'sin mermas' },
      ]} />
      <ChartCard title="Costo de las mermas por motivo" subtitle={`Total: ${pesos(costo)} · ${filas.length} merma${filas.length !== 1 ? 's' : ''}`}>
        {motivos.length === 0 ? <SinDatos>Sin mermas en este periodo</SinDatos> : (
          <Grafica titulo="Costo de la merma por motivo" datos={motivos} etiqueta="motivo" valor="costo">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={motivos} barCategoryGap="35%" maxBarSize={56}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
              <XAxis dataKey="motivo" tick={tick} axisLine={false} tickLine={false} />
              <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={ejeMiles} width={52} />
              <Tooltip separator=": " formatter={v => [fmtDec(v), 'Costo']} contentStyle={tooltipStyle} cursor={{ fill: '#FFF7ED' }} />
              <Bar dataKey="costo" fill="#8A4A42" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </Grafica>
        )}
      </ChartCard>
      <TableCard title="Historial de mermas" exportLabel="Exportar CSV"
        onExport={() => downloadCSV(filas.map(m => ({ folio: m.folio, fecha: `${fecha(m.fecha)} ${hora(m.fecha)}`, producto: m.productos?.nombre ?? '', cantidad: m.cantidad, unidad: m.productos?.unidad ?? '', motivo: m.motivo ?? '', sucursal: nombreCorto(m.sucursal_id), costo: ((m.costo_centavos ?? 0) / 100).toFixed(2) })), 'reporte_mermas')}>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla del reporte">
          <table className="table-modern">
            <thead><tr>{['Folio', 'Fecha', 'Producto', 'Cantidad', 'Motivo', 'Sucursal', 'Costo'].map(t => <th key={t}>{t}</th>)}</tr></thead>
            <tbody>
              {filas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(m => (
                <tr key={m.folio}>
                  <td><span className="folio">{m.folio}</span></td>
                  <td className="text-xs" style={{ color: '#627080' }}>{fecha(m.fecha)}</td>
                  <td className="font-medium" style={{ color: '#263442' }}>{m.productos?.nombre ?? '—'}</td>
                  <td style={{ color: '#627080' }}>{cantidad(m.cantidad, m.productos?.unidad)}</td>
                  <td className="text-xs" style={{ color: '#627080' }}>{m.motivo ?? '—'}</td>
                  <td><span className="tag tag-gray">{nombreCorto(m.sucursal_id)}</span></td>
                  <td className="font-bold" style={{ color: '#8A4A42' }}>{pesos(m.costo_centavos)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'rgba(201,122,109,.06)', borderTop: '1px solid rgba(201,122,109,.2)' }}>
                <td className={celdaTotal} style={{ color: '#263442' }} colSpan={6}>Costo total de mermas</td>
                <td className={celdaTotal} style={{ color: '#8A4A42' }}>{pesos(costo)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {filas.length === 0 && <SinDatos>Sin mermas en este periodo</SinDatos>}
        <Pagination page={page} perPage={PAGE_SIZE} total={filas.length} onChange={setPage} />
      </TableCard>
    </>
  )
}
