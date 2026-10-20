import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Wallet, Banknote, CreditCard, Smartphone } from 'lucide-react'
import { SkeletonReport } from '../../components/Skeleton'
import TableCard from '../../components/TableCard'
import AvisoError from '../../components/AvisoError'
import { downloadCSV } from '../../utils/csv'
import { useConsulta } from '../../hooks/useConsulta'
import { listarVentas } from '../../api/ventas'
import { pagosPorMetodo, pagosEnElTiempo, etiquetaMetodo, colorMetodo } from '../../lib/calculos'
import { pesos, fmtDec, plural } from '../../utils/fmt'
import { tooltipStyle, ejeMiles, tick, totalRow, celdaTotal } from './constantes'
import { Kpis, Parcial, SinDatos, Leyenda } from './piezas'
import Grafica from '../../components/Grafica'

/* ── MÉTODOS DE PAGO ─────────────────────────────────────── */
export default function ReportePagos({ filtro }) {
  const q = useConsulta(() => listarVentas(filtro), [filtro.desde, filtro.hasta, filtro.sucursalId])
  const ventas = q.datos?.filas
  const metodos = useMemo(() => pagosPorMetodo(ventas ?? []), [ventas])
  // En lugar de la dona (repetía los porcentajes de las tarjetas): cómo se reparte lo cobrado en el tiempo
  const tiempo = useMemo(() => pagosEnElTiempo(ventas ?? [], filtro.primerDia, filtro.ultimoDia), [ventas, filtro.primerDia, filtro.ultimoDia])

  if (q.cargando) return <SkeletonReport />
  // Sin respuesta no hay nada que resumir: solo el aviso, en vez de un reporte en ceros.
  if (q.datos === undefined) return <AvisoError error={q.error} onReintentar={q.recargar} />
  const total = metodos.reduce((s, m) => s + m.centavos, 0)
  const de = (metodo) => metodos.find(m => m.metodo === metodo)
  const pct = (centavos) => (total ? Math.round(centavos / total * 100) : 0)
  const nota = (metodo) => (de(metodo) ? `${pct(de(metodo).centavos)}% · ${plural(de(metodo).pagos, 'pago')}` : 'sin pagos')
  const pagos = metodos.reduce((s, m) => s + m.pagos, 0)

  return (
    <>
      <AvisoError error={q.error} onReintentar={q.recargar} className="mb-6" />
      <Parcial consulta={q.datos} />
      <Kpis items={[
        { icon: Wallet,     label: 'Total cobrado', value: pesos(total),                         nota: plural(pagos, 'pago') },
        { icon: Banknote,   label: 'Efectivo',      value: pesos(de('EFECTIVO')?.centavos),      nota: nota('EFECTIVO') },
        { icon: CreditCard, label: 'Tarjeta',       value: pesos(de('TARJETA')?.centavos),       nota: nota('TARJETA') },
        { icon: Smartphone, label: 'Transferencia', value: pesos(de('TRANSFERENCIA')?.centavos), nota: nota('TRANSFERENCIA') },
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="card p-5 lg:col-span-3">
          <div className="mb-4">
            <h2 className="font-bold tracking-tight" style={{ color: '#263442' }}>Cobrado por {tiempo.porHora ? 'hora' : 'día'}</h2>
            <p className="text-xs" style={{ color: '#627080' }}>Cada barra se reparte por método de pago</p>
          </div>
          {tiempo.filas.every(f => tiempo.metodos.every(m => !f[m])) ? <SinDatos>Sin pagos en este periodo</SinDatos> : (
            <Grafica titulo={`Cobrado por ${tiempo.porHora ? 'hora' : 'día'}`}
              resumen={`Cobrado por ${tiempo.porHora ? 'hora' : 'día'}. ${tiempo.filas.map(f => `${f.etiqueta}: ${tiempo.metodos.map(m => `${etiquetaMetodo(m)} ${fmtDec(f[m])}`).join(', ')}`).join('; ')}.`}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tiempo.filas} barCategoryGap="30%" maxBarSize={44}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
                <XAxis dataKey="etiqueta" tick={tick} axisLine={false} tickLine={false} minTickGap={10} />
                <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={ejeMiles} width={52} />
                <Tooltip separator=": " formatter={(v, m) => [fmtDec(v), etiquetaMetodo(m)]} contentStyle={tooltipStyle} cursor={{ fill: '#FFF7ED' }} />
                {/* El borde blanco separa los tramos de cada barra */}
                {tiempo.metodos.map(m => <Bar key={m} dataKey={m} stackId="cobrado" fill={colorMetodo(m)} stroke="#fff" strokeWidth={1} />)}
              </BarChart>
            </ResponsiveContainer>
            <Leyenda series={tiempo.metodos.map(m => ({ nombre: etiquetaMetodo(m), color: colorMetodo(m) }))} />
            </Grafica>
          )}
        </div>
        <TableCard title="Detalle por método" exportLabel="Exportar CSV" className="lg:col-span-2"
          onExport={() => downloadCSV(metodos.map(m => ({ metodo: etiquetaMetodo(m.metodo), pagos: m.pagos, monto: (m.centavos / 100).toFixed(2), porcentaje: pct(m.centavos) })), 'reporte_pagos')}>
          <table className="table-modern">
            <thead><tr>{['Método', 'Pagos', 'Monto', '%'].map(t => <th key={t}>{t}</th>)}</tr></thead>
            <tbody>
              {metodos.map(m => (
                <tr key={m.metodo}>
                  <td>
                    <span className="inline-block w-2.5 h-2.5 rounded-sm mr-2" style={{ background: colorMetodo(m.metodo) }} aria-hidden="true" />
                    <span className="font-semibold" style={{ color: '#263442' }}>{etiquetaMetodo(m.metodo)}</span>
                  </td>
                  <td style={{ color: '#263442' }}>{m.pagos}</td>
                  <td className="font-bold" style={{ color: '#263442' }}>{pesos(m.centavos)}</td>
                  <td style={{ color: '#263442' }}>{pct(m.centavos)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={totalRow}>
                <td className={celdaTotal} style={{ color: '#263442' }} colSpan={2}>Total cobrado</td>
                <td className={celdaTotal} style={{ color: '#263442' }}>{pesos(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
          {metodos.length === 0 && <SinDatos>Sin pagos en este periodo</SinDatos>}
        </TableCard>
      </div>
    </>
  )
}
