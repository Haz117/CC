import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { SkeletonReport } from '../../components/Skeleton'
import Pagination from '../../components/Pagination'
import ChartCard from '../../components/ChartCard'
import TableCard from '../../components/TableCard'
import AvisoError from '../../components/AvisoError'
import { downloadCSV } from '../../utils/csv'
import { useConsulta } from '../../hooks/useConsulta'
import { listarProductos, listarExistencias, listarLimites } from '../../api/inventario'
import { armarInventario, NIVEL, esBajo } from '../../lib/calculos'
import { cantidad } from '../../utils/fmt'
import { PAGE_SIZE, tooltipStyle, tick } from './constantes'
import { Kpis, SinDatos } from './piezas'
import Grafica from '../../components/Grafica'

/* ── INVENTARIO ──────────────────────────────────────────── */
export default function ReporteInventario({ filtro, nombreCorto }) {
  const [page, setPage] = useState(1)
  const q = useConsulta(async () => {
    const alcance = { sucursalId: filtro.sucursalId }
    const [productos, existencias, limites] = await Promise.all([listarProductos(), listarExistencias(alcance), listarLimites(alcance)])
    return { productos, existencias, limites }
  }, [filtro.sucursalId])

  // Primero lo más urgente: lo que está más abajo de su mínimo en alguna sucursal.
  const productos = useMemo(() => {
    const razon = (p) => (p.peor ? p.peor.existencia / p.peor.minimo : Infinity)
    return (q.datos ? armarInventario(q.datos) : []).sort((a, b) => razon(a) - razon(b))
  }, [q.datos])

  useEffect(() => { setPage(1) }, [filtro.sucursalId])

  if (q.cargando) return <SkeletonReport />
  // Sin respuesta no hay nada que resumir: solo el aviso, en vez de un reporte en ceros.
  if (q.datos === undefined) return <AvisoError error={q.error} onReintentar={q.recargar} />
  const criticos = productos.filter(p => p.nivel === NIVEL.CRITICO).length
  const bajos = productos.filter(p => p.nivel === NIVEL.BAJO).length
  const sinMinimo = productos.filter(p => p.minimo == null).length
  const grafica = productos.filter(p => p.peor).slice(0, 10).map(p => ({ id: p.id, clave: p.clave, nombre: p.nombre, ...p.peor }))

  return (
    <>
      <AvisoError error={q.error} onReintentar={q.recargar} className="mb-6" />
      <Kpis items={[
        { label: 'Productos activos', value: productos.length, nota: 'en catálogo' },
        { label: 'Críticos',          value: criticos,         nota: 'a la mitad del mínimo o menos', mal: criticos > 0 },
        { label: 'Bajo mínimo',       value: bajos,            nota: 'reabastecer pronto', mal: bajos > 0 },
        { label: 'Sin mínimo',        value: sinMinimo,        nota: 'sin límite configurado' },
      ]} />
      <ChartCard title="Existencia actual contra el mínimo" subtitle="Los 10 productos más cerca o más abajo de su mínimo, en la sucursal donde peor están">
        {grafica.length === 0 ? <SinDatos>No hay mínimos configurados</SinDatos> : (
          <Grafica titulo="Existencia contra mínimo" resumen={`Existencia contra mínimo. ${grafica.map(g => `${g.clave}: ${cantidad(g.existencia)} de ${cantidad(g.minimo)} de mínimo`).join('; ')}.`}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={grafica} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
              <XAxis dataKey="clave" tick={{ fontSize: 10, fill: '#627080' }} axisLine={false} tickLine={false} minTickGap={6} />
              <YAxis tick={tick} axisLine={false} tickLine={false} width={40} />
              <Tooltip separator=": "
                labelFormatter={(clave) => {
                  const p = grafica.find(x => x.clave === clave)
                  return p ? `${p.nombre} · ${nombreCorto(p.sucursal_id)}` : clave
                }}
                contentStyle={tooltipStyle} cursor={{ fill: '#FFF7ED' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="existencia" fill="#C2410C" name="Existencia" radius={[4, 4, 0, 0]} />
              <Bar dataKey="minimo" fill="#FDE8D0" name="Mínimo" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </Grafica>
        )}
      </ChartCard>
      <TableCard title="Detalle de inventario" exportLabel="Exportar CSV"
        onExport={() => downloadCSV(productos.map(p => ({ clave: p.clave, producto: p.nombre, categoria: p.categoria, unidad: p.unidad, existencia: p.existencia, minimo: p.minimo ?? '', maximo: p.maximo ?? '', estado: p.nivel.label })), 'reporte_inventario')}>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla del reporte">
          <table className="table-modern">
            <thead><tr>{['Producto', 'Categoría', 'Existencia', 'Mínimo', 'Máximo', 'Estado'].map(t => <th key={t}>{t}</th>)}</tr></thead>
            <tbody>
              {productos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(p => (
                <tr key={p.id}>
                  <td>
                    <p className="font-semibold" style={{ color: '#263442' }}>{p.nombre}</p>
                    <p className="text-xs font-mono" style={{ color: '#627080' }}>{p.clave}</p>
                  </td>
                  <td><span className="tag tag-gray">{p.categoria}</span></td>
                  <td className="font-bold" style={{ color: esBajo(p.nivelTotal) ? p.nivelTotal.tono : '#263442' }}>{cantidad(p.existencia, p.unidad)}</td>
                  <td style={{ color: '#627080' }}>{p.minimo == null ? '—' : cantidad(p.minimo)}</td>
                  <td style={{ color: '#627080' }}>{p.maximo == null ? '—' : cantidad(p.maximo)}</td>
                  <td>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: p.nivel.tono, background: `${p.nivel.tono}1F` }}>
                      {p.nivel.label}{p.porSucursal.length > 1 && p.bajos > 0 ? ` · ${p.bajos} suc.` : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} perPage={PAGE_SIZE} total={productos.length} onChange={setPage} />
      </TableCard>
    </>
  )
}
