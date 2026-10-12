import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonReport } from '../../components/Skeleton'
import ChartCard from '../../components/ChartCard'
import TableCard from '../../components/TableCard'
import AvisoError from '../../components/AvisoError'
import { downloadCSV } from '../../utils/csv'
import { useConsulta } from '../../hooks/useConsulta'
import { listarSaldosCredito } from '../../api/organizacion'
import { pesos, fmtDec } from '../../utils/fmt'
import { tooltipStyle, ejeMiles, tick, totalRow, celdaTotal } from './constantes'
import { Kpis, SinDatos } from './piezas'

/* ── CRÉDITO CON EL ALMACÉN ──────────────────────────────── */
export default function ReporteCredito({ filtro, nombreSucursal, nombreCorto }) {
  const q = useConsulta(listarSaldosCredito)
  const saldos = useMemo(() => (q.datos ?? [])
    .filter(s => !filtro.sucursalId || s.sucursal_id === filtro.sucursalId)
    .sort((a, b) => b.saldo_centavos - a.saldo_centavos), [q.datos, filtro.sucursalId])

  if (q.cargando) return <SkeletonReport />
  // Sin respuesta no hay nada que resumir: solo el aviso, en vez de un reporte en ceros.
  if (q.datos === undefined) return <AvisoError error={q.error} onReintentar={q.recargar} />
  const total = saldos.reduce((s, x) => s + Math.max(0, x.saldo_centavos), 0)
  const conAdeudo = saldos.filter(s => s.saldo_centavos > 0)

  return (
    <>
      <AvisoError error={q.error} onReintentar={q.recargar} className="mb-6" />
      <Kpis items={[
        { label: 'Saldo total',           value: pesos(total),                                      nota: 'lo que se debe al almacén', mal: total > 0 },
        { label: 'Sucursales con adeudo', value: conAdeudo.length,                                  nota: `de ${saldos.length} con crédito`, mal: conAdeudo.length > 0 },
        { label: 'Mayor adeudo',          value: conAdeudo[0] ? pesos(conAdeudo[0].saldo_centavos) : '—', nota: conAdeudo[0] ? nombreCorto(conAdeudo[0].sucursal_id) : 'sin adeudos' },
        { label: 'Al corriente',          value: saldos.length - conAdeudo.length,                  nota: 'sin saldo pendiente' },
      ]} />
      <ChartCard title="Saldo de crédito por sucursal" subtitle="Cargos menos abonos de los surtidos a crédito">
        {saldos.length === 0 ? <SinDatos>Sin movimientos de crédito</SinDatos> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={saldos.map(s => ({ id: s.sucursal_id, name: nombreCorto(s.sucursal_id), saldo: s.saldo_centavos / 100 }))} barCategoryGap="35%" maxBarSize={56}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
              <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
              <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={ejeMiles} width={52} />
              <Tooltip formatter={v => [fmtDec(v), 'Saldo']} contentStyle={tooltipStyle} cursor={{ fill: '#FFF7ED' }} />
              <Bar dataKey="saldo" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      <TableCard title="Saldo por sucursal" exportLabel="Exportar CSV"
        onExport={() => downloadCSV(saldos.map(s => ({ sucursal: nombreSucursal(s.sucursal_id), saldo: (s.saldo_centavos / 100).toFixed(2) })), 'reporte_credito')}>
        <table className="table-modern">
          <thead><tr>{['Sucursal', 'Saldo con el almacén', 'Estado'].map(t => <th key={t}>{t}</th>)}</tr></thead>
          <tbody>
            {saldos.map(s => (
              <tr key={s.sucursal_id}>
                <td className="font-semibold" style={{ color: '#263442' }}>{nombreSucursal(s.sucursal_id)}</td>
                <td className="font-bold" style={{ color: s.saldo_centavos > 0 ? '#d97706' : '#627080' }}>{pesos(s.saldo_centavos)}</td>
                <td>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={s.saldo_centavos > 0 ? { color: '#d97706', background: 'rgba(217,119,6,.1)' } : { color: '#059669', background: 'rgba(5,150,105,.1)' }}>
                    {s.saldo_centavos > 0 ? 'Con adeudo' : 'Al corriente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={totalRow}>
              <td className={celdaTotal} style={{ color: '#263442' }}>Total por pagar</td>
              <td className={celdaTotal} style={{ color: '#F97316' }}>{pesos(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
        {saldos.length === 0 && <SinDatos>Sin movimientos de crédito</SinDatos>}
      </TableCard>
    </>
  )
}
