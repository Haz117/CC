import { esDemo, demo } from './fuente'

export async function listarDistribuidores() {
  if (esDemo()) return (await demo()).listarDistribuidores()
  return []
}
