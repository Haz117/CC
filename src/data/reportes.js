import { BarChart3, DollarSign, FileText, Package, RotateCcw, TrendingUp } from 'lucide-react'

export const ventasDiarias = [
  { dia: '23 Jul', centro: 18000, norte: 12000, sur: 8000,  oriente: 6000 },
  { dia: '24 Jul', centro: 21000, norte: 14000, sur: 9500,  oriente: 7000 },
  { dia: '25 Jul', centro: 19500, norte: 11000, sur: 8200,  oriente: 5800 },
  { dia: '26 Jul', centro: 24000, norte: 16000, sur: 10800, oriente: 8200 },
  { dia: '27 Jul', centro: 28000, norte: 18000, sur: 12000, oriente: 9000 },
  { dia: '28 Jul', centro: 26000, norte: 15500, sur: 11200, oriente: 8800 },
  { dia: '29 Jul', centro: 14000, norte: 8000,  sur: 5000,  oriente: 4200 },
]

export const inventarioChart = [
  { name: 'Q. Oaxaca',   stock: 8,  minimo: 20 },
  { name: 'Q. Manchego', stock: 32, minimo: 15 },
  { name: 'Crema Ácida', stock: 15, minimo: 25 },
  { name: 'Mantequilla', stock: 6,  minimo: 30 },
  { name: 'Requesón',    stock: 22, minimo: 10 },
  { name: 'Crema batir', stock: 18, minimo: 20 },
  { name: 'Q. Panela',   stock: 45, minimo: 20 },
  { name: 'Mant. s/sal', stock: 12, minimo: 25 },
]

export const inventarioTable = [
  { producto: 'Queso Oaxaca',        categoria: 'Quesos',       stock: 8,  minimo: 20, precio: 185, status: 'Crítico' },
  { producto: 'Queso Manchego',      categoria: 'Quesos',       stock: 32, minimo: 15, precio: 145, status: 'Normal'  },
  { producto: 'Crema Ácida',         categoria: 'Cremas',       stock: 15, minimo: 25, precio: 45,  status: 'Bajo'    },
  { producto: 'Mantequilla',         categoria: 'Mantequillas', stock: 6,  minimo: 30, precio: 95,  status: 'Crítico' },
  { producto: 'Requesón',            categoria: 'Quesos',       stock: 22, minimo: 10, precio: 75,  status: 'Normal'  },
  { producto: 'Crema para batir',    categoria: 'Cremas',       stock: 18, minimo: 20, precio: 65,  status: 'Bajo'    },
  { producto: 'Queso Panela',        categoria: 'Quesos',       stock: 45, minimo: 20, precio: 120, status: 'Normal'  },
  { producto: 'Mantequilla sin sal', categoria: 'Mantequillas', stock: 12, minimo: 25, precio: 110, status: 'Bajo'    },
]

export const distChart = [
  { name: 'C. Mendoza', ventas: 45800, cobros: 38200 },
  { name: 'R. Sánchez', ventas: 38500, cobros: 35000 },
  { name: 'A. Torres',  ventas: 29200, cobros: 29200 },
  { name: 'M. Cruz',    ventas: 62000, cobros: 55000 },
  { name: 'L. Jiménez', ventas: 21500, cobros: 21500 },
]

export const distTable = [
  { nombre: 'Carlos Mendoza',    ruta: 'Ruta Norte',    clientes: 28, ventas: 45800, cobros: 38200, devol: 1200, saldo: 8800 },
  { nombre: 'Roberto Sánchez',   ruta: 'Ruta Sur',      clientes: 22, ventas: 38500, cobros: 35000, devol: 800,  saldo: 4300 },
  { nombre: 'Ana Torres',        ruta: 'Ruta Oriente',  clientes: 18, ventas: 29200, cobros: 29200, devol: 0,    saldo: 0    },
  { nombre: 'Miguel Ángel Cruz', ruta: 'Ruta Centro',   clientes: 35, ventas: 62000, cobros: 55000, devol: 2200, saldo: 9200 },
  { nombre: 'Laura Jiménez',     ruta: 'Ruta Poniente', clientes: 15, ventas: 21500, cobros: 21500, devol: 500,  saldo: 0    },
]

export const ganChart = [
  { dia: '23 Jul', ingresos: 64000, cogs: 38400, ganancia: 17600 },
  { dia: '24 Jul', ingresos: 71500, cogs: 42900, ganancia: 20600 },
  { dia: '25 Jul', ingresos: 64500, cogs: 38700, ganancia: 17800 },
  { dia: '26 Jul', ingresos: 79000, cogs: 47400, ganancia: 23600 },
  { dia: '27 Jul', ingresos: 87000, cogs: 52200, ganancia: 26800 },
  { dia: '28 Jul', ingresos: 82500, cogs: 49500, ganancia: 25000 },
  { dia: '29 Jul', ingresos: 41200, cogs: 24720, ganancia: 12480 },
]

export const ganTable = [
  { suc: 'Centro',  ingresos: 150500, cogs: 90300,  gastos: 18060, ganancia: 42140, margen: 28 },
  { suc: 'Norte',   ingresos: 94500,  cogs: 56700,  gastos: 11340, ganancia: 26460, margen: 28 },
  { suc: 'Sur',     ingresos: 64700,  cogs: 38820,  gastos: 7764,  ganancia: 18116, margen: 28 },
  { suc: 'Oriente', ingresos: 49000,  cogs: 29400,  gastos: 5880,  ganancia: 13720, margen: 28 },
]

export const devDias = [
  { dia: '23 Jul', cantidad: 2, monto: 420 },
  { dia: '24 Jul', cantidad: 1, monto: 189 },
  { dia: '25 Jul', cantidad: 3, monto: 654 },
  { dia: '26 Jul', cantidad: 1, monto: 210 },
  { dia: '27 Jul', cantidad: 4, monto: 890 },
  { dia: '28 Jul', cantidad: 2, monto: 320 },
  { dia: '29 Jul', cantidad: 1, monto: 160 },
]

export const devTable = [
  { folio: 'DEV-0089', fecha: '2026-07-29', producto: 'Queso Oaxaca 500g',    motivo: 'Producto en mal estado',      monto: 160, sucursal: 'Norte',    status: 'Procesada' },
  { folio: 'DEV-0088', fecha: '2026-07-28', producto: 'Crema Ácida 1L',       motivo: 'Error en pedido',             monto: 95,  sucursal: 'Centro',   status: 'Procesada' },
  { folio: 'DEV-0087', fecha: '2026-07-28', producto: 'Mantequilla 250g',     motivo: 'Fecha próxima de caducidad',  monto: 225, sucursal: 'Sur',      status: 'Procesada' },
  { folio: 'DEV-0086', fecha: '2026-07-27', producto: 'Queso Manchego',       motivo: 'Producto en mal estado',      monto: 145, sucursal: 'Centro',   status: 'Procesada' },
  { folio: 'DEV-0085', fecha: '2026-07-27', producto: 'Crema para batir',     motivo: 'Error en pedido',             monto: 385, sucursal: 'Oriente',  status: 'Pendiente' },
  { folio: 'DEV-0084', fecha: '2026-07-27', producto: 'Requesón 1kg',         motivo: 'Cobro incorrecto',            monto: 360, sucursal: 'Norte',    status: 'Procesada' },
  { folio: 'DEV-0083', fecha: '2026-07-25', producto: 'Queso Oaxaca 1kg',     motivo: 'Producto en mal estado',      monto: 320, sucursal: 'Sur',      status: 'Procesada' },
  { folio: 'DEV-0082', fecha: '2026-07-25', producto: 'Mantequilla sin sal',  motivo: 'Error en pedido',             monto: 110, sucursal: 'Centro',   status: 'Procesada' },
  { folio: 'DEV-0081', fecha: '2026-07-25', producto: 'Crema Ácida 500ml',    motivo: 'Cobro incorrecto',            monto: 224, sucursal: 'Poniente', status: 'Procesada' },
  { folio: 'DEV-0080', fecha: '2026-07-23', producto: 'Queso Panela 400g',    motivo: 'Fecha próxima de caducidad',  monto: 420, sucursal: 'Centro',   status: 'Procesada' },
]

export const cxcDonut = [
  { name: '0-30 días',  value: 22300, color: '#059669' },
  { name: '31-60 días', value: 15600, color: '#d97706' },
  { name: '61-90 días', value: 8200,  color: '#C97A6D' },
  { name: '+90 días',   value: 3200,  color: '#7c3aed' },
]

export const cxcTable = [
  { nombre: 'Carlos Mendoza',      tipo: 'Distribuidor', rfc: 'MECC800101XXX', folio: 'F-2890', importe: 8800,  vencimiento: '2026-08-15', dias: 16,  status: 'Al corriente' },
  { nombre: 'Roberto Sánchez',     tipo: 'Distribuidor', rfc: 'SARR850201YYY', folio: 'F-2887', importe: 4300,  vencimiento: '2026-08-10', dias: 11,  status: 'Al corriente' },
  { nombre: 'Miguel Ángel Cruz',   tipo: 'Distribuidor', rfc: 'CUCM901215ZZZ', folio: 'F-2894', importe: 9200,  vencimiento: '2026-07-31', dias: 1,   status: 'Por vencer'   },
  { nombre: 'Tiendas Morelos',     tipo: 'Cliente',      rfc: 'TMO760612ABC',  folio: 'F-2875', importe: 15600, vencimiento: '2026-07-25', dias: -5,  status: 'Vencida'      },
  { nombre: 'Cremería García',     tipo: 'Cliente',      rfc: 'GAC850320DEF',  folio: 'F-2869', importe: 8200,  vencimiento: '2026-07-20', dias: -10, status: 'Vencida'      },
  { nombre: 'Minisuper Los Pinos', tipo: 'Cliente',      rfc: 'PIM920705GHI',  folio: 'F-2882', importe: 4500,  vencimiento: '2026-08-05', dias: 6,   status: 'Por vencer'   },
]

export const reportTypes = [
  { id: 'ventas',         label: 'Ventas por periodo',  icon: TrendingUp, desc: 'Detalle por fecha, sucursal y cajero'     },
  { id: 'inventario',    label: 'Inventario actual',   icon: Package,    desc: 'Existencias, entradas y salidas'          },
  { id: 'distribuidores',label: 'Distribuidores',      icon: BarChart3,  desc: 'Ventas, cobros y saldos por distribuidor' },
  { id: 'ganancias',     label: 'Ganancias',           icon: DollarSign, desc: 'Utilidad neta por periodo y sucursal'     },
  { id: 'devoluciones',  label: 'Devoluciones',        icon: RotateCcw,  desc: 'Historial, motivos y montos'             },
  { id: 'cxc',           label: 'Cuentas por cobrar',  icon: FileText,   desc: 'Créditos pendientes y vencimientos'      },
]
