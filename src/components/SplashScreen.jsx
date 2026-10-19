import { Milk } from 'lucide-react'

// Pantalla de arranque: solo aparece mientras la app de verdad está cargando (revisando la sesión),
// sin esperas inventadas ni barra de avance falsa. Color sólido y la marca, como la de una app del
// teléfono, igual a la que trae index.html mientras baja el código: no se nota el cambio entre las dos.
// Entra con un pequeño retraso, así que si la sesión carga al instante ni se alcanza a ver.
export default function SplashScreen() {
  return (
    <div className="splash-screen" role="status" aria-label="Cargando Cremerías Admin">
      <div className="splash-logo"><Milk aria-hidden="true" strokeWidth={1.9} /></div>
      <p className="splash-nombre">Cremerías</p>
    </div>
  )
}
