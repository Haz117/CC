export const notify = {
  async requestPermission() {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    const result = await Notification.requestPermission()
    return result === 'granted'
  },

  async send(title, options = {}) {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') {
      const granted = await notify.requestPermission()
      if (!granted) return
    }
    const sw = await navigator.serviceWorker?.ready
    const opts = {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      ...options,
    }
    if (sw?.showNotification) {
      sw.showNotification(title, opts)
    } else {
      new Notification(title, opts)
    }
  },

  stockBajo(producto, sucursal, stock) {
    notify.send('⚠️ Inventario bajo — Cremerías Admin', {
      body: `${producto} en ${sucursal}: solo ${stock} unidades`,
      tag: `stock-${producto}`,
      data: { url: '/inventario' },
    })
  },

  ventaCompletada(folio, total) {
    notify.send('✅ Venta completada', {
      body: `${folio} por $${total.toLocaleString('es-MX')}`,
      tag: folio,
      data: { url: '/ventas' },
    })
  },

  rutaFinalizada(ruta, distribuidor) {
    notify.send('🚛 Ruta finalizada', {
      body: `${ruta} completada por ${distribuidor}`,
      tag: `ruta-${ruta}`,
      data: { url: '/rutas' },
    })
  },
}

export default notify
