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

- **Solo consulta.** La web no registra ventas, turnos ni inventario. La única escritura es `vincular_usuario`.
- **Dinero en centavos** (`*_centavos`): se divide entre 100 solo al mostrar (`pesos()` en `src/utils/fmt.js`).
- **Fechas en UTC**: se muestran en hora local, y "hoy" es de la medianoche local a la siguiente (`rangoISO()`).
- **Se filtra y ordena por `fecha`**, no por `sincronizado_en`: una caja sin internet sube después ventas con su fecha original.
- **Las ventas canceladas no suman** en ningún total.
- **Nada se borra**: en catálogos y usuarios se filtra `activo` y `eliminado_en`.
- **Máximo 1,000 filas por petición**: `traerTodo()` pagina y avisa si el periodo es demasiado grande.
- **Tiempo real** en `ventas`, `turnos_caja` y `ordenes_reabastecimiento`: las pantallas se recargan solas.

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
tests/                 pruebas de calculos.js y fmt.js
```

Mientras una consulta carga, o si falla, las pantallas no muestran ceros: `KpiBar` recibe `estado` (`'cargando'` o `'error'`) y pone un marcador. Un cero en pantalla siempre es un dato real.

## Pruebas

```bash
pnpm test   # node --test, sin dependencias
pnpm lint
```

Las pruebas cubren lo que no puede fallar en silencio: que las ventas canceladas no sumen, el dinero en centavos, los rangos de fecha en hora local y los niveles de inventario.

## Pendiente

Cosas que la web todavía no hace porque dependen de la base:

- **Distribuidores, Rutas y Compras** no tienen tablas: siguen con datos de ejemplo y un aviso que lo dice. Lo mismo las secciones de empresa, impuestos, métodos de pago y tickets en Configuración.
- **Precio y costo de los productos** (`lotes`, `lote_precios`) y **utilidad**: la guía recomienda pedir una vista en vez de armarlo en el navegador.
- **Ventas por turno de caja**: falta saber qué columna liga `ventas` con `turnos_caja`.
- **Surtidos, bloqueos de acceso y horarios**: no están en ninguna pantalla.
- **Vistas de totales** (ventas por día y por método de pago): hoy se suman las filas en el navegador, lo que se vuelve lento con meses de muchas ventas.

Las columnas que usa la app se confirmaron contra la base real el 8 de octubre de 2026: todas las consultas están bien formadas. De ahí salieron tres ajustes: `bitacora` se ordena por `fecha` (no tiene `creado_en`), `usuarios` no guarda el correo (está en Auth; sí tiene `usuario`) y `limites_sucursal` no tiene borrado lógico. Falta revisar las pantallas con una sesión de administrador y datos reales.

Los cambios al esquema se piden a Luis y entran como migración; no se crean tablas ni vistas desde el panel.
