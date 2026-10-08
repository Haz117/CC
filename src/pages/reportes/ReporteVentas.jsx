import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SkeletonReport } from '../../components/Skeleton'
import ChartCard from '../../components/ChartCard'
import TableCard from '../../components/TableCard'
import AvisoError from '../../components/AvisoError'
import { downloadCSV } from '../../utils/csv'
import { useConsulta } from '../../hooks/useConsulta'
import { listarVentasResumen } from '../../api/ventas'
import { resumenVentas, ventasPorDia, ventasPorSucursal } from '../../lib/calculos'
import { pesos, diaCorto, fmtDec, mesLargo, diaLocal, inicioDelDia, sumarDias } from '../../utils/fmt'
import { COLORS, tooltipStyle, ejeMiles, tick, totalRow, celdaTotal } from './constantes'
import { Kpis, Parcial, SinDatos } from './piezas'

// Junta los días en semanas (de lunes a domingo) o meses.
function agrupar(dias, groupBy) {
  if (groupBy === 'Día') return dias
  const grupos = new Map()
  for (const d of dias) {
    const f = inicioDelDia(d.dia)
    const lunes = sumarDias(f, -((f.getDay() + 6) % 7))
    const clave = groupBy === 'Mes' ? d.dia.slice(0, 7) : diaLocal(lunes)
    const g = grupos.get(clave) ?? { dia: clave, etiqueta: groupBy === 'Mes' ? mesLargo(f) : `Sem. ${diaCorto(lunes)}`, centavos: 0, tickets: 0 }
    g.centavos += d.centavos
    g.tickets += d.tickets
    grupos.set(clave, g)
  }
  return [...grupos.values()].map(g => ({ ...g, total: g.centavos / 100 }))
}

/* ── VENTAS ──────────────────────────────────────────────── */
export default function ReporteVentas({ filtro, groupBy, nombreCorto }) {
  const q = useConsulta(() => listarVentasResumen(filtro), [filtro.desde, filtro.hasta, filtro.sucursalId])
  const ventas = q.datos?.filas
  const r = useMemo(() => {
    const filas = ventas ?? []
    const porSucursal = [...ventasPorSucursal(filas).values()]
      .map(s => ({ ...s, nombre: nombreCorto(s.sucursal_id) }))
      .sort((a, b) => b.centavos - a.centavos)
    return { resumen: resumenVentas(filas), porSucursal, dias: ventasPorDia(filas, filtro.primerDia, filtro.ultimoDia) }
  }, [ventas, nombreCorto, filtro.primerDia, filtro.ultimoDia])

  if (q.cargando) return <SkeletonReport />
  // Sin respuesta no hay nada que resumir: solo el aviso, en vez de un reporte en ceros.
  if (q.datos === undefined) return <AvisoError error={q.error} onReintentar={q.recargar} />
  const { resumen, porSucursal } = r
  const serie = groupBy === 'Sucursal'
    ? porSucursal.map(s => ({ dia: s.sucursal_id, etiqueta: s.nombre, total: s.centavos / 100 }))
    : agrupar(r.dias, groupBy)

  return (
    <>
      <AvisoError error={q.error} onReintentar={q.recargar} className="mb-6" />
      <Parcial consulta={q.datos} />
      <Kpis items={[
        { label: 'Ventas del periodo', value: pesos(resumen.vendido),        nota: 'solo completadas' },
        { label: 'Tickets',            value: resumen.completadas,           nota: 'ventas completadas' },
        { label: 'Ticket promedio',    value: pesos(resumen.ticketPromedio), nota: 'por venta' },
        { label: 'Canceladas',         value: resumen.canceladas,            nota: resumen.canceladas ? pesos(resumen.cancelado) : 'sin cancelaciones', mal: resumen.canceladas > 0 },
      ]} />
      <ChartCard title={`Ventas por ${groupBy.toLowerCase()}`} subtitle={`Total: ${pesos(resumen.vendido)}`}>
        {serie.every(s => !s.total) ? <SinDatos>Sin ventas en este periodo</SinDatos> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={serie} barCategoryGap="30%" maxBarSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
              <XAxis dataKey="etiqueta" tick={tick} axisLine={false} tickLine={false} minTickGap={10} />
              <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={ejeMiles} width={52} />
              <Tooltip formatter={v => [fmtDec(v), 'Ventas']} contentStyle={tooltipStyle} cursor={{ fill: '#FFF7ED' }} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {serie.map((s, i) => <Cell key={s.dia} fill={groupBy === 'Sucursal' ? COLORS[i % COLORS.length] : '#F97316'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      <TableCard title="Detalle por sucursal" exportLabel="Exportar CSV"
        onExport={() => downloadCSV(porSucursal.map(s => ({ sucursal: s.nombre, ventas: (s.centavos / 100).toFixed(2), tickets: s.tickets, ticket_promedio: s.tickets ? (s.centavos / s.tickets / 100).toFixed(2) : '0.00', canceladas: s.canceladas })), 'reporte_ventas')}>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead><tr>{['Sucursal', 'Ventas', 'Tickets', 'Ticket prom.', 'Canceladas', 'Participación'].map(t => <th key={t}>{t}</th>)}</tr></thead>
            <tbody>
              {porSucursal.map(s => (
                <tr key={s.sucursal_id}>
                  <td className="font-semibold" style={{ color: '#263442' }}>{s.nombre}</td>
                  <td className="font-bold" style={{ color: '#059669' }}>{pesos(s.centavos)}</td>
                  <td style={{ color: '#263442' }}>{s.tickets}</td>
                  <td style={{ color: '#263442' }}>{pesos(s.tickets ? s.centavos / s.tickets : 0)}</td>
                  <td className="font-medium" style={{ color: s.canceladas ? '#C97A6D' : '#627080' }}>{s.canceladas}</td>
                  <td className="font-bold" style={{ color: '#F97316' }}>{resumen.vendido ? Math.round(s.centavos / resumen.vendido * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
            {porSucursal.length > 0 && <tfoot>
              <tr style={totalRow}>
                <td className={celdaTotal} style={{ color: '#263442' }}>Total</td>
                <td className={celdaTotal} style={{ color: '#059669' }}>{pesos(resumen.vendido)}</td>
                <td className={celdaTotal} style={{ color: '#263442' }}>{resumen.completadas}</td>
                <td className={celdaTotal} style={{ color: '#263442' }}>{pesos(resumen.ticketPromedio)}</td>
                <td className={celdaTotal} style={{ color: '#C97A6D' }}>{resumen.canceladas}</td>
                <td />
              </tr>
            </tfoot>}
          </table>
        </div>
        {porSucursal.length === 0 && <SinDatos>Sin ventas en este periodo</SinDatos>}
      </TableCard>
    </>
  )
}
