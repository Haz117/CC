import { useMemo } from 'react'
import { Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { SkeletonReport } from '../../components/Skeleton'
import TableCard from '../../components/TableCard'
import AvisoError from '../../components/AvisoError'
import { downloadCSV } from '../../utils/csv'
import { useConsulta } from '../../hooks/useConsulta'
import { listarVentas } from '../../api/ventas'
import { pagosPorMetodo, etiquetaMetodo, colorMetodo } from '../../lib/calculos'
import { pesos, fmtDec } from '../../utils/fmt'
import { tooltipStyle, totalRow, celdaTotal } from './constantes'
import { Kpis, Parcial, SinDatos } from './piezas'
import Grafica from '../../components/Grafica'

/* ── MÉTODOS DE PAGO ─────────────────────────────────────── */
export default function ReportePagos({ filtro }) {
  const q = useConsulta(() => listarVentas(filtro), [filtro.desde, filtro.hasta, filtro.sucursalId])
  const ventas = q.datos?.filas
  const metodos = useMemo(() => pagosPorMetodo(ventas ?? []), [ventas])

  if (q.cargando) return <SkeletonReport />
  // Sin respuesta no hay nada que resumir: solo el aviso, en vez de un reporte en ceros.
  if (q.datos === undefined) return <AvisoError error={q.error} onReintentar={q.recargar} />
  const total = metodos.reduce((s, m) => s + m.centavos, 0)
  const de = (metodo) => metodos.find(m => m.metodo === metodo)?.centavos ?? 0
  const pct = (centavos) => (total ? Math.round(centavos / total * 100) : 0)

  return (
    <>
      <AvisoError error={q.error} onReintentar={q.recargar} className="mb-6" />
      <Parcial consulta={q.datos} />
      <Kpis items={[
        { label: 'Total cobrado', value: pesos(total),               nota: 'ventas completadas' },
        { label: 'Efectivo',      value: pesos(de('EFECTIVO')),      nota: `${pct(de('EFECTIVO'))}% del total` },
        { label: 'Tarjeta',       value: pesos(de('TARJETA')),       nota: `${pct(de('TARJETA'))}% del total` },
        { label: 'Transferencia', value: pesos(de('TRANSFERENCIA')), nota: `${pct(de('TRANSFERENCIA'))}% del total` },
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="font-bold tracking-tight" style={{ color: '#263442' }}>Cobrado por método de pago</h2>
            <p className="text-xs" style={{ color: '#627080' }}>Total: {pesos(total)}</p>
          </div>
          {metodos.length === 0 ? <SinDatos>Sin pagos en este periodo</SinDatos> : (
            <Grafica titulo="Cobrado por forma de pago" datos={metodos.map(m => ({ n: etiquetaMetodo(m.metodo), v: m.centavos / 100 }))} etiqueta="n" valor="v">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={metodos.map(m => ({ name: etiquetaMetodo(m.metodo), value: m.centavos / 100 }))} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value" paddingAngle={3}>
                  {metodos.map(m => <Cell key={m.metodo} fill={colorMetodo(m.metodo)} />)}
                </Pie>
                <Tooltip formatter={v => [fmtDec(v)]} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            </Grafica>
          )}
        </div>
        <TableCard title="Detalle por método" exportLabel="Exportar CSV"
          onExport={() => downloadCSV(metodos.map(m => ({ metodo: etiquetaMetodo(m.metodo), pagos: m.pagos, monto: (m.centavos / 100).toFixed(2), porcentaje: pct(m.centavos) })), 'reporte_pagos')}>
          <table className="table-modern">
            <thead><tr>{['Método', 'Pagos', 'Monto', '%'].map(t => <th key={t}>{t}</th>)}</tr></thead>
            <tbody>
              {metodos.map(m => (
                <tr key={m.metodo}>
                  <td>
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: colorMetodo(m.metodo) }} />
                    <span className="font-semibold" style={{ color: '#263442' }}>{etiquetaMetodo(m.metodo)}</span>
                  </td>
                  <td style={{ color: '#263442' }}>{m.pagos}</td>
                  <td className="font-bold" style={{ color: '#047857' }}>{pesos(m.centavos)}</td>
                  <td className="font-bold" style={{ color: '#C2410C' }}>{pct(m.centavos)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={totalRow}>
                <td className={celdaTotal} style={{ color: '#263442' }} colSpan={2}>Total cobrado</td>
                <td className={celdaTotal} style={{ color: '#047857' }}>{pesos(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </TableCard>
      </div>
    </>
  )
}
