# Cremerías Admin

App web de consulta para la cadena de cremerías. Lee directo de Supabase, la misma base en la nube con la que se sincronizan las cajas de escritorio; no hay backend propio.

La referencia de la base es `Nueva carpeta/Guía de conexión.pdf` (la escribe y mantiene Luis Alberto). Este README resume cómo la usa la web.

## Arranque

```bash
pnpm install
cp .env.example .env.local   # y pega la publishable key
pnpm dev
```

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL de la API del proyecto. La base es provisional: puede cambiar al pasar a producción. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key (antes *anon key*). La pasa Luis por un canal privado. |
| `VITE_DOMINIO_USUARIOS` | Opcional. Dominio interno de las cuentas; por omisión `cremerias.local`. |
| `VITE_MODO_DEMO` | Opcional. `true` ofrece entrar con datos de ejemplo aunque Supabase esté configurado. |

Nunca pongas la **secret key / service_role** en estas variables: se salta la seguridad por sucursal. La app la detecta y se niega a arrancar con ella.

Sin la publishable key la app ofrece el **modo demostración**: datos de ejemplo con la misma forma que la base (`src/api/demo.js`), para poder ver las pantallas sin conexión. Una franja morada lo avisa en todo momento.

Para que funcione "¿Olvidaste?" hay que agregar la URL de la app en el panel de Supabase → Authentication → URL Configuration → Redirect URLs.

## Acceso

La app web es **solo para el administrador**: sirve para consultar lo que suben todos los puntos de venta y el almacén central. Supervisores y cajeros trabajan en las cajas de escritorio y no entran aquí.

1. La persona entra con **usuario y contraseña**. Supabase Auth solo identifica cuentas por correo, así que la app arma uno interno: `luis` entra como `luis@cremerias.local` (`aCorreo()` en `src/lib/supabase.js`). No hay registro: las cuentas las crea un administrador.
2. La web llama a `mi_perfil()` y recibe su rol y su sucursal.
3. Se muestra "Sin acceso" y se cierra la sesión si `mi_perfil()` regresa vacío, si es la cuenta de una caja (`tipo = 'CAJA'`) o si el rol no es `ADMINISTRADOR`.

Con su sesión, la base le entrega al administrador las filas de todas las sucursales; cada pantalla tiene un filtro para ver una sola.

Dar acceso a alguien: que exista en `usuarios` con rol `ADMINISTRADOR` (alta desde la caja del almacén), crear su cuenta en el panel de Supabase (Authentication → Users → Add user) con el correo `<usuario>@cremerias.local`, su contraseña y Auto Confirm User, y ligarla con `select vincular_usuario('<id del usuario>', '<usuario>@cremerias.local');` en el SQL Editor. La contraseña de la web es independiente de la de la caja.

## Reglas que respeta el código

- **Solo consulta.** La web no registra ventas, turnos ni inventario. Solo escribe con funciones que revisan que quien llama sea administrador: `vincular_usuario` y, para la venta en ruta, `ruta_guardar_camion`, `ruta_guardar_personal` y `ruta_quitar_personal`.
- **Dinero en centavos** (`*_centavos`): se divide entre 100 solo al mostrar (`pesos()` en `src/utils/fmt.js`).
- **Fechas en UTC**: se muestran en hora local, y "hoy" es de la medianoche local a la siguiente (`rangoISO()`).
- **Se filtra y ordena por `fecha`**, no por `sincronizado_en`: una caja sin internet sube después ventas con su fecha original.
- **Las ventas canceladas no suman** en ningún total.
- **Nada se borra**: en catálogos y usuarios se filtra `activo` y `eliminado_en`.
- **Máximo 1,000 filas por petición**: `traerTodo()` pagina y avisa si el periodo es demasiado grande.
- **Tiempo real** en `ventas`, `turnos_caja`, `ordenes_reabastecimiento` y `ruta_envios`: las pantallas se recargan solas.

## Estructura

```
src/
  lib/supabase.js      cliente y "mantener sesión iniciada"
  lib/navegacion.js    páginas del menú y roles de las personas
  lib/calculos.js      totales y agrupaciones (PostgREST no suma)
  lib/tiempoReal.js    un canal de Realtime por tabla
  auth/                sesión, mi_perfil() y recuperación de contraseña
  api/                 una función por consulta de la guía; demo.js las imita
  hooks/useConsulta.js carga, recarga y tiempo real de una consulta
  hooks/usePeriodo.js  rango de fechas de los filtros (con FiltroPeriodo)
  components/          piezas compartidas: KpiBar, TablaGenerica, Modal, AvisoError…
  pages/               una pantalla por archivo
  pages/reportes/      un reporte por archivo
  pages/configuracion/ las secciones de Configuración que leen de la base
tests/                 pruebas de calculos.js (también los totales de ruta) y fmt.js
```

Mientras una consulta carga, o si falla, las pantallas no muestran ceros: `KpiBar` recibe `estado` (`'cargando'` o `'error'`) y pone un marcador. Un cero en pantalla siempre es un dato real.

## Pruebas

```bash
pnpm test   # node --test, sin dependencias
pnpm lint
```

Las pruebas cubren lo que no puede fallar en silencio: que las ventas canceladas no sumen, el dinero en centavos, los rangos de fecha en hora local y los niveles de inventario.

## Venta en ruta

El panel principal tiene el indicador **En ruta hoy**: lo vendido por los camiones, aparte de "Ventas hoy" (que es de las cajas) hasta que la fase 2 de la migración pase lo de ruta a `ventas`.

Los camiones venden con la app **cremeria-ruta**, que está en la carpeta de al lado. Lo que suben sus teléfonos llega a Supabase y se ve en dos pantallas:

- **Rutas › Jornadas:** cada camión del periodo en el mapa, con su recorrido y sus ventas; cuánto lleva vendido y lo que quedó a cargo del chofer al cerrar. Marca en rojo los camiones en ruta que llevan más de 15 minutos sin mandar ubicación (app cerrada, pantalla apagada o sin señal) y las jornadas abiertas hace más de 18 horas, que nadie cerró. El detalle de cada jornada trae sus ventas (con cantidades y cómo se entregó el ticket: impreso, QR, por WhatsApp o sin ticket) y su merma, que en ruta nadie autoriza: aquí se revisa. Si el almacén contó el efectivo billete por billete en el teléfono, debajo de "Entregó" dice con qué se entregó ("1 de $1,000, 3 de $200, monedas $15.50").
- **Rutas › Camiones:** alta de cada camión (es una sucursal) con su nombre, placas y prefijo de folios, y los teléfonos ligados con su terminal y la última vez que subieron algo.
- **Distribuidores:** quién entra a la app del camión (chofer, encargado o almacenista) con su PIN de 4 dígitos, y lo que vendió y quedó a cargo de cada chofer en el periodo. El PIN se guarda cifrado (bcrypt) y no se puede volver a ver: solo cambiar. Dos personas no pueden tener el mismo, y para devolverle el acceso a alguien hace falta uno nuevo. Quitar el acceso llega a los teléfonos la próxima vez que bajan al personal (al empezar el día): quien ya está en ruta termina su jornada.

Las tablas, vistas y funciones están en `cremeria-ruta/supabase/propuesta-ruta.sql`; las crea Luis como migración. Hasta entonces la base responde que no existen, y las pantallas lo dicen (código `SIN_TABLAS` en `aErrorDatos`) en lugar de mostrar ceros. Los pasos completos para ponerla a funcionar están en el README de cremeria-ruta.

## Pendiente

Cosas que la web todavía no hace porque dependen de la base:

- **Rutas y Distribuidores** ya leen de las tablas de venta en ruta, pero la base todavía no las tiene (ver "Venta en ruta"). Mientras tanto dicen que falta la migración y no muestran datos; en el modo demostración se ven con datos de ejemplo.
- **Compras** no tiene tablas: sigue fuera del menú. Lo mismo las secciones de empresa, impuestos, métodos de pago y tickets en Configuración.
- **Precio y costo de los productos** (`lotes`, `lote_precios`) y **utilidad**: la guía recomienda pedir una vista en vez de armarlo en el navegador.
- **Ventas por turno de caja**: falta saber qué columna liga `ventas` con `turnos_caja`.
- **Surtidos, bloqueos de acceso y horarios**: no están en ninguna pantalla.
- **Vistas de totales** (ventas por día y por método de pago): hoy se suman las filas en el navegador, lo que se vuelve lento con meses de muchas ventas.

Las columnas que usa la app se confirmaron contra la base real el 8 de octubre de 2026: todas las consultas están bien formadas. De ahí salieron tres ajustes: `bitacora` se ordena por `fecha` (no tiene `creado_en`), `usuarios` no guarda el correo (está en Auth; sí tiene `usuario`) y `limites_sucursal` no tiene borrado lógico. Falta revisar las pantallas con una sesión de administrador y datos reales.

Los cambios al esquema se piden a Luis y entran como migración; no se crean tablas ni vistas desde el panel.
