import { esDemo, demo } from './fuente'

export async function listarRutas() {
  if (esDemo()) return (await demo()).listarRutas()
  return []
}
