import { esDemo, demo } from './fuente'

export async function listarProveedores() {
  if (esDemo()) return (await demo()).listarProveedores()
  return []
}

export async function listarOrdenes() {
  if (esDemo()) return (await demo()).listarOrdenes()
  return []
}
