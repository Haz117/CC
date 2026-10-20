import { useId } from 'react'

const CUERPO = 'M222 130h68v34c0 18 12 30 26 44c22 22 34 44 34 74v128c0 22-18 40-40 40H202c-22 0-40-18-40-40V282c0-30 12-52 34-74c14-14 26-26 26-44z'

// Logo de Cremerías: el mismo dibujo que el ícono de la app (public/icon-*.png), para que la marca
// se vea igual en el menú, la entrada, el arranque y el ticket. Como siempre va junto al nombre
// escrito, es decorativo para el lector de pantalla.
export default function Logo({ size = 48, redondeo = 22, className, style }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className} style={style} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FB8A3C" /><stop offset="1" stopColor="#E2560E" /></linearGradient>
        <linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#FFF4EA" /></linearGradient>
        <clipPath id={`${id}c`}><path d={CUERPO} /></clipPath>
      </defs>
      <rect width="512" height="512" rx={512 * redondeo / 100} fill={`url(#${id}f)`} />
      <g transform="translate(256 262) scale(.95) translate(-256 -273)">
        <ellipse cx="256" cy="458" rx="104" ry="14" fill="#7C2D12" opacity=".22" />
        <rect x="208" y="92" width="96" height="38" rx="13" fill="#FFF7ED" />
        <path d={CUERPO} fill={`url(#${id}v)`} />
        <g clipPath={`url(#${id}c)`}>
          <path d="M150 304c30-16 70-16 106 0s76 16 106 0v170H150z" fill="#FED7AA" />
          <path d="M150 304c30-16 70-16 106 0s76 16 106 0" fill="none" stroke="#FDBA74" strokeWidth="6" />
          <rect x="184" y="238" width="16" height="150" rx="8" fill="#FFFFFF" opacity=".75" />
        </g>
      </g>
    </svg>
  )
}
