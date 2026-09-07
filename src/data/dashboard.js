import { Package, Monitor } from 'lucide-react'
import { createElement } from 'react'

export const perfData = [
  { name: 'Centro',   pct: 85.3 },
  { name: 'Norte',    pct: 64.7 },
  { name: 'Sur',      pct: 84.2 },
  { name: 'Oriente',  pct: 45.6 },
  { name: 'Poniente', pct: 43.5 },
  { name: 'Online',   pct: 74.4 },
]

export const donutData = [
  { label: 'Meta diaria',   pct: 92 },
  { label: 'Meta semanal',  pct: 83 },
  { label: 'Inventario',    pct: 78 },
  { label: 'Rutas OK',      pct: 97 },
  { label: 'Cajas activas', pct: 96 },
  { label: 'Cobranza',      pct: 89 },
]

export const distribuidores = [
  { nombre: 'Carlos Mendoza',    rol: 'Distribuidor · Ruta Norte', bg: 'rgba(249,115,22,.1)',  color: '#F97316' },
  { nombre: 'Roberto Sánchez',   rol: 'Distribuidor · Ruta Sur',   bg: 'rgba(124,58,237,.12)', color: '#7c3aed' },
  { nombre: 'Miguel Ángel Cruz', rol: 'Distribuidor · Ruta Centro',bg: 'rgba(5,150,105,.1)',   color: '#059669' },
]

export const timeline = [
  { type: 'event',   time: '10:00', title: 'Ruta Norte — En proceso', sub: '9:45 - 10:30 · 12 clientes', active: true },
  { type: 'divider' },
  { type: 'empty',   time: '11:00' },
  { type: 'event',   time: '11:30', title: 'Ruta Sur',      sub: '11:00 - 11:40 · 15 clientes' },
  { type: 'empty',   time: '12:00' },
  { type: 'event',   time: '12:30', title: 'Corte de caja', sub: '12:00 - 12:45 · Suc. Centro' },
  { type: 'empty',   time: '13:00' },
  { type: 'event',   time: '13:30', title: 'Ruta Oriente',  sub: '13:45 - 14:30 · 9 clientes' },
  { type: 'empty',   time: '14:00' },
  { type: 'empty',   time: '14:30' },
]

export const eventosProximos = [
  {
    title: 'Cierre mensual de inventario "Agosto Fest"',
    date:  '14 agosto 2026', time: '12:00 pm',
    bg:    '#FFF7ED',
    icon:  createElement(Package, { size: 18, color: '#F97316' }),
  },
  {
    title: 'Webinar de nuevas herramientas en logística',
    date:  '21 agosto 2026', time: '11:00 pm',
    bg:    'rgba(5,150,105,.1)',
    icon:  createElement(Monitor, { size: 18, color: '#059669' }),
  },
]
