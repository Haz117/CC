import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Package, AlertTriangle, AlertCircle, CircleSlash } from 'lucide-react'
import { SkeletonReport } from '../../components/Skeleton'
import Estado from '../../components/Estado'
import Pagination from '../../components/Pagination'
import ChartCard from '../../components/ChartCard'
import TableCard from '../../components/TableCard'
import AvisoError from '../../components/AvisoError'
import { downloadCSV } from '../../utils/csv'
import { useConsulta } from '../../hooks/useConsulta'
import { listarProductos, listarExistencias, listarLimites } from '../../api/inventario'
import { armarInventario, NIVEL, esBajo } from '../../lib/calculos'
import { cantidad, plural } from '../../utils/fmt'
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
  // Igual que en la pantalla de Inventario: "bajo mínimo" incluye a los críticos
  const criticos = productos.filter(p => p.nivel === NIVEL.CRITICO).length
  const bajos = productos.filter(p => esBajo(p.nivel)).length
  const sinMinimo = productos.filter(p => p.minimo == null).length
  const categorias = new Set(productos.map(p => p.categoria)).size
  // En % de su mínimo: kilos y piezas no se pueden comparar en el mismo eje
  const grafica = productos.filter(p => p.peor).slice(0, 10).map(p => ({
    id: p.id, clave: p.clave, nombre: p.nombre, unidad: p.unidad, ...p.peor,
    pct: Math.round(p.peor.existencia / p.peor.minimo * 100),
  }))
  // Marcas redondas (0, 50, 100… o de 100 en 100) hasta un techo de 300 %; el mínimo (100 %) siempre se ve
  const tope = Math.min(300, Math.max(0, ...grafica.map(g => g.pct)))
  const paso = tope > 200 ? 100 : 50
  const techo = Math.max(100, Math.ceil(tope / paso) * paso)
  const marcas = Array.from({ length: Math.floor(techo / paso) + 1 }, (_, i) => i * paso)

  return (
    <>
      <AvisoError error={q.error} onReintentar={q.recargar} className="mb-6" />
      <Kpis items={[
        { icon: Package,       label: 'Productos activos', value: productos.length, nota: `en ${plural(categorias, 'categoría')}` },
        { icon: AlertTriangle, label: 'Bajo mínimo',       value: bajos,            nota: bajos ? `${criticos} de ellos críticos` : 'todo arriba del mínimo', mal: bajos > 0 },
        { icon: AlertCircle,   label: 'Críticos',          value: criticos,         nota: 'a la mitad del mínimo o menos', mal: criticos > 0 },
        { icon: CircleSlash,   label: 'Sin mínimo',        value: sinMinimo,        nota: 'sin límite configurado' },
      ]} />
      <ChartCard title="Existencia contra el mínimo" subtitle="Los 10 más cerca de su mínimo (% en la sucursal donde peor están)">
        {grafica.length === 0 ? <SinDatos>No hay mínimos configurados</SinDatos> : (
          <Grafica titulo="Existencia contra mínimo" resumen={`Existencia contra mínimo. ${grafica.map(g => `${g.clave}: ${cantidad(g.existencia, g.unidad)} de ${cantidad(g.minimo, g.unidad)} de mínimo (${g.pct}%)`).join('; ')}.`}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={grafica.map(g => ({ ...g, barra: Math.min(g.pct, 300) }))} barCategoryGap="30%" maxBarSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
              <XAxis dataKey="clave" tick={{ fontSize: 10, fill: '#627080' }} axisLine={false} tickLine={false} minTickGap={6} />
              <YAxis tick={tick} axisLine={false} tickLine={false} width={44} tickFormatter={v => `${v}%`} domain={[0, techo]} ticks={marcas} />
              <ReferenceLine y={100} stroke="#047857" strokeDasharray="5 3" label={{ value: 'Mínimo', position: 'insideTopLeft', fontSize: 11, fill: '#047857', fontWeight: 600 }} />
              <Tooltip separator=": "
                labelFormatter={(clave) => {
                  const p = grafica.find(x => x.clave === clave)
                  return p ? `${p.nombre} · ${nombreCorto(p.sucursal_id)}` : clave
                }}
                formatter={(_, __, item) => [`${cantidad(item.payload.existencia, item.payload.unidad)} de ${cantidad(item.payload.minimo, item.payload.unidad)} (${item.payload.pct}%)`, 'Existencia']}
                contentStyle={tooltipStyle} cursor={{ fill: '#FFF7ED' }}
              />
              <Bar dataKey="barra" radius={[4, 4, 0, 0]} minPointSize={3}>
                {grafica.map(g => <Cell key={g.id} fill={esBajo(g.nivel) ? g.nivel.tono : '#C2410C'} />)}
              </Bar>
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
                  <td style={{ color: '#627080' }}>{p.categoria}</td>
                  <td className="font-bold" style={{ color: esBajo(p.nivelTotal) ? p.nivelTotal.tono : '#263442' }}>{cantidad(p.existencia, p.unidad)}</td>
                  <td style={{ color: '#627080' }}>{p.minimo == null ? '—' : cantidad(p.minimo)}</td>
                  <td style={{ color: '#627080' }}>{p.maximo == null ? '—' : cantidad(p.maximo)}</td>
                  <td>
                    <Estado label={p.nivel.label} color={p.nivel.color} normal={!esBajo(p.nivel) && p.nivel !== NIVEL.SIN} />
                    {p.porSucursal.length > 1 && p.bajos > 0 && (
                      <p className="text-xs mt-1" style={{ color: '#8A4A42' }}>en {plural(p.bajos, 'sucursal', 'sucursales')}</p>
                    )}
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
