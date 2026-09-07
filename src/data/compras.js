export const INIT_PROVEEDORES = [
  { id: 1, nombre: 'Lácteos del Norte S.A.',     rfc: 'LNO820415GH3', contacto: 'Ing. Pedro Soto',    telefono: '442-800-1234', email: 'ventas@lacteosdelNorte.mx',    categoria: 'Lácteos'   },
  { id: 2, nombre: 'Cremería Industrial CDMX',   rfc: 'CIC940230JK7', contacto: 'Lic. Sofía Ávila',   telefono: '55-1234-5678', email: 'pedidos@cremeriaindustrial.mx', categoria: 'Derivados' },
  { id: 3, nombre: 'Distribuidora Láctea Bajío', rfc: 'DLB761005PQ2', contacto: 'Sr. Armando Cruz',   telefono: '476-200-9900', email: 'a.cruz@lacteabajio.com',        categoria: 'Lácteos'   },
]

export const INIT_ORDENES = [
  { id: 'OC-0234', proveedor: 'Lácteos del Norte S.A.',     fecha: '2026-07-28', items: 8,  total: 24500, status: 'Recibida',    pago: 'Pagado'      },
  { id: 'OC-0233', proveedor: 'Cremería Industrial CDMX',   fecha: '2026-07-27', items: 5,  total: 18900, status: 'En tránsito', pago: 'Pendiente'   },
  { id: 'OC-0232', proveedor: 'Distribuidora Láctea Bajío', fecha: '2026-07-25', items: 12, total: 32400, status: 'Recibida',    pago: 'Pagado'      },
  { id: 'OC-0231', proveedor: 'Lácteos del Norte S.A.',     fecha: '2026-07-22', items: 6,  total: 15800, status: 'Recibida',    pago: 'Pagado'      },
  { id: 'OC-0230', proveedor: 'Cremería Industrial CDMX',   fecha: '2026-07-20', items: 9,  total: 27100, status: 'Recibida',    pago: 'Crédito 30d' },
]
