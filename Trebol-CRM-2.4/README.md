# Despensa el Trébol — CRM 2.4

## Puesto de venta: lector y teclado

La compra ocupa el área principal de **Vender**, con letras y controles grandes: productos de 18–19 px, cantidades de 22 px y total de revisión de 44–56 px. **F2 / Buscar** abre el catálogo sin abandonar la compra; flechas y Enter eligen y agregan. En móvil, total y revisión permanecen sobre la navegación inferior.

La búsqueda filtra en vivo por nombre, marca, presentación, categoría, tipo, código o PLU; admite varias palabras en cualquier orden y no distingue mayúsculas ni acentos. Cada resultado muestra nombre, marca y presentación cuando están cargadas, categoría/tipo, venta por unidad/peso, precio y cantidad disponible. Marca y contenido del envase se completan en **Productos → Editar → Marca y presentación**, sin cambiar el stock ni los bultos de compra. Los datos existentes se conservan y no se inventan marcas o pesos faltantes.

- Escanear selecciona el producto agregado. El mismo código vuelve a sumar una unidad.
- **6 * y escanear:** agrega seis unidades en una lectura. El multiplicador es visible y de un solo uso; Esc lo cancela. No se aplica a peso y se cancela también al fallar una lectura. Un código registrado con asterisco conserva su significado.
- **+ / −:** sumar / restar una unidad de la línea seleccionada, con el campo del lector vacío. También sirven F6/F7 y los operadores numéricos. No actúan al escribir en búsqueda o editar cantidades; se respetan los prefijos de códigos registrados con signos.
- **F3:** editar la cantidad total en la propia línea, sin diálogo. Enter guarda y Esc cancela. Ejemplo: escanear una leche, F3, 6, Enter deja seis leches, no siete. Para peso, abre el ingreso enfocado en gramos.
- **↑ / ↓:** seleccionar otra línea sin Alt. **Supr** quita la línea y **Ctrl+Z** deshace la última acción, solo antes de confirmar y si los datos no cambiaron de revisión.
- **Peso:** ingresar gramos o elegir explícitamente kg (admite coma/punto); cambiar unidad vacía el campo para evitar reinterpretar un número. Una nueva porción suma; F3 reemplaza el peso total. Se conservan lotes, vencimientos y etiquetas configurables.
- **F8 → F8:** primera pulsación revisa total; soltar y pulsar nuevamente confirma. Mantener la tecla apretada no registra. Enter del lector y Ctrl+Enter no confirman. Esc conserva la compra. El cierre no pide cliente, tipo de consumidor, observaciones ni pago: las ventas nuevas usan consumidor final y medio **Sin registrar**, sin modificar datos históricos.
- **Opciones de este puesto → Abrir impresión al confirmar:** desactivado inicialmente; se recuerda por navegador y no se pregunta en cada cierre. Primero guarda y descuenta stock una vez, después abre el diálogo de impresión. Cancelarlo o reimprimir no registra otra venta. No se confirma la salida física del papel.
- **Error de lectura:** sonido diferenciado cuando el navegador lo permite y aviso persistente. F2 busca un reemplazo y Esc omite expresamente. No permite cerrar ni incorporar lecturas posteriores hasta resolverlo; no abre alta de productos en medio de la fila.
- **Códigos cortos:** buscar por código de producto o identificador de balanza (PLU). Una etiqueta de peso configurada agrega directamente y mantiene la asignación de lotes por vencimiento; el lote físico puede revisarse desde la línea.

Configurar el lector como **teclado USB con una única terminación CR/Enter**, no doble Enter. La demo no procesa pagos ni emite comprobantes fiscales. Integración física de balanza e impresión sin diálogo: pendientes del hardware real.

**Archivos:** servir también `sales-ui.js`, cargado después de las reglas de stock y antes de `app.js`. Es la única implementación del compositor, búsqueda, líneas y cierre; `stock-ui.js` conserva los demás circuitos.

**Validación de esta mejora:** 66 pruebas automatizadas aprobadas y circuito real en Chrome con los scripts de producción: multiplicador, cantidad inline, Esc, flechas, Supr/deshacer, búsqueda y PLU, gramos/kg, F8 repetido, error pendiente, fallo de guardado, registro único, apertura de impresión simulada y PDF. Escritorio 1366 × 768 y móvil 390 × 844, con carrito largo y sin desbordamiento horizontal ni errores JavaScript. La prueba con lector e impresora físicos sigue pendiente.

La prueba DOM reproducible es `tests/cashier.browser.cjs`. Con el servidor estático activo, ejecutar `node tests/cashier.browser.cjs` con `playwright-core` disponible. Admite `PLAYWRIGHT_MODULE` (ruta de instalación externa), `BASE_URL`, `CHROME_PATH` y `SCREENSHOT_DIR`. No agrega dependencias al frontend.

## Circuitos esenciales de despensa — frontend

La demo incorpora venta por unidad/peso, ingreso en gramos, presentaciones de compra, último costo real de recepción, lotes/vencimientos, mermas, recuentos por sesión, devolución parcial, reposición sugerida editable y pedidos PDF/imprimibles. Se conservan los datos anteriores; los productos anteriores siguen siendo por unidad.

### Uso rápido

- **Productos → Agregar/Editar:** elegir Unidad o Peso; precio/costo por u. o kg; caja/pack en productos unitarios; proveedor habitual y vencimientos opcionales. La medida queda fija una vez que existen movimientos.
- **Vender:** escanear productos unitarios suma una unidad. Elegir un producto por peso abre ingreso de gramos; muestra kg y subtotal. Una venta puede combinar ambos. El carrito permite editar peso y elegir el lote físico retirado; por defecto propone primero el que vence antes.
- **Productos → Gestionar stock:** recibir por unidad, bulto o kg, con costo por unidad/bulto/kg, proveedor y documento opcional. Convertir bultos no requiere cuentas manuales. Pedidos abiertos deben recibirse desde su detalle; una entrada adicional requiere distinguirla.
- **Pedidos → Registrar recepción:** admite cantidades parciales, costo efectivo y vencimiento/lote por producto. Usar cero para lo no entregado. La recepción actualiza el último costo; no altera ventas anteriores.
- **Vencimientos:** filtros para próximos siete días y vencidos. Vencido significa fecha anterior al día actual; la fecha indicada sigue siendo vendible ese día. La ficha permite revisar/corregir el vencimiento. Stock físico incluye vencidos; disponible los excluye. Registrar baja por vencimiento/rotura/consumo o devolución a proveedor en unidades o kg.
- **Productos → Hacer recuento:** catálogo/categoría, búsqueda por nombre/código, cantidades por producto/lote, borrador persistente y cierre con diferencias. Un campo vacío es pendiente; cero significa contado en cero. Pausar ventas y recepciones. Si hubo movimientos, “Revisar cambios durante el conteo” actualiza referencias y exige volver a contar los productos afectados.
- **Pedidos → Preparar reposición sugerida:** elegir proveedor, seleccionar productos y ajustar cantidades. Se descuentan pendientes y se excluyen vencidos; se redondea a bultos completos o 50 g. El borrador admite cantidades por unidad, bulto o kg. Guardar no aumenta stock; genera un PDF descargable. El detalle permite impresión, descarga posterior, recepción y repetición.
- **Ventas → Ver venta → Devolución parcial:** elegir producto, cantidad/peso y destino vendible/no vendible. Nunca permite superar el saldo vendido. La anulación completa queda disponible sólo antes de registrar devoluciones. Reintegros monetarios se realizan fuera de la demo.
- **Reportes:** ventas originales y devoluciones del período separadas; ventas netas, unidades y kg sin sumarlos; stock físico/disponible, mermas y CSV. El margen es estimado; valoración a último costo, no valuación contable por capas. Movimientos antiguos sin costo histórico utilizan el costo actual como aproximación para reportar pérdidas.
- **Opciones:** copia JSON descargable y restauración validada con resumen antes de reemplazar. No es sincronización entre equipos.

### Etiquetas de balanza

En **Opciones → Configurar formato de etiqueta**, definir prefijo, longitud, posiciones de producto/valor (desde 1), escala de peso o decimales del importe y verificación EAN opcional. Asignar identificador al producto por peso. Un código habitual sólo identifica el producto y pide gramos; una etiqueta con peso carga la cantidad (si hay lotes, permite revisar el lote). Si sólo tiene importe, pide el peso impreso y muestra la diferencia; usar el importe de etiqueta requiere selección explícita. Códigos desconocidos o mal formados no descuentan stock.

El formato mostrado como ejemplo es de prueba: no corresponde a una balanza confirmada. La compatibilidad física queda pendiente de una etiqueta real. La carga manual está siempre disponible.

Las demos nuevas incluyen jamón y pan por peso. Un catálogo anterior se conserva sin agregar productos de ejemplo automáticamente; se pueden dar de alta desde Productos.

### Archivos y comprobación

Servir todos los archivos de esta carpeta: se agregaron **stock-core.js** (reglas y migración) y **stock-ui.js** (flujos de interfaz). Se cargan antes y después de app.js, respectivamente. La lógica sigue siendo local, sin backend.

Verificación acotada: **54 pruebas automatizadas aprobadas** (incluidas cuatro nuevas de circuitos esenciales) y una pasada en Chrome de venta mixta, ticket, pedido PDF, recepción parcial, devolución, recuento y alta por peso; navegación en escritorio y móvil sin errores JavaScript ni desbordamiento de página.

## Rediseño del frontend

Navegación: **Vender**, **Productos**, **Pedidos**, **Ventas** y **Reportes**. Productos reúne Stock, Precios y costos, y Movimientos. La venta tiene cantidades editables y total visible; el historial permite recuperar el ticket imprimible o descargar su PDF. Pedidos abre con los pendientes de recibir y conserva el borrador de preparación.

### Ver la aplicación localmente

Desde esta carpeta:

```bash
python3 -m http.server 5173 --bind 0.0.0.0
```

Abrir http://localhost:5173. No requiere instalación de dependencias.

### Validación del rediseño

50 pruebas automatizadas aprobadas. Verificación adicional en Chrome: escaneo simulado, cantidad editable, confirmación de venta, descarga PDF del ticket, recepción parcial y navegación en 1366 × 768 y 390 × 844, sin errores JavaScript ni desbordamiento horizontal de página. Ticket PDF revisado visualmente. Revisión independiente: corrección del historial de Reportes confirmada como resuelta.

El ticket físico se imprime mediante el diálogo del navegador. El modelo de impresora, ancho final de papel y prueba con lector USB físico siguen pendientes. Los detalles siguientes documentan también el funcionamiento de versiones previas.

Demo de stock, ventas y pedidos a proveedores. HTML, CSS y JavaScript; datos guardados en el navegador.

## Actualizar

1. Descomprimir Trebol-CRM-2.4.zip.
2. En GitHub, entrar a **despensa-stock/ui-demo**.
3. Subir el contenido del ZIP a esa carpeta, reemplazando los archivos anteriores.
4. Esta versión requiere **index.html, app.js, core.js, styles.css y purchase-pdf.js**. Subir también LICENSE-PDF-FONTS.txt junto al código.
5. Confirmar el commit y esperar el despliegue de Vercel.
6. La aplicación debe mostrar **CRM 2.4 · Demo** y el menú **Pedidos** en lugar de Avisos.

El vercel.json de la raíz no cambia. La carpeta de salida continúa siendo despensa-stock/ui-demo. No se hizo push ni despliegue desde esta sesión.

## Pedidos a proveedores

### Armar el pedido

- Catálogo y pedido en preparación visibles juntos en escritorio.
- En pantallas pequeñas se apilan; el catálogo tiene desplazamiento propio para llegar fácilmente al pedido.
- Búsqueda por nombre/código y filtros por categoría, sugerencia de reposición o sin stock.
- Cada producto muestra stock actual, unidades ya pedidas y cantidad sugerida.
- Escribir una cantidad y Agregar. Agregar nuevamente el mismo producto acumula sus unidades en una sola línea.
- El pedido permite cambiar cantidades con botones, escribir la cantidad o quitar un producto.
- Elegir un proveedor del desplegable. Agregar proveedor guarda su nombre para reutilizarlo. Puede elegirse Sin especificar si todavía no se conoce.
- Observaciones opcionales para incluir en el PDF.
- El borrador guarda productos agregados, cantidades confirmadas, proveedor y observaciones; se conserva al cambiar de sección o recargar.
- Los campos de cantidad del catálogo no incorporados con Agregar son valores en preparación y no se guardan al recargar.
- Vaciar o reemplazar un borrador con productos requiere confirmación.

### Guardar y descargar

- Revisar el pedido y confirmar **Guardar y descargar PDF**.
- Genera un número PC-00001, fecha, proveedor, productos y cantidades solicitadas.
- Conserva una copia de nombres y códigos: editar el catálogo después no altera el pedido original.
- El pedido queda pendiente de recepción y disponible en el historial.
- El borrador se limpia para armar otro, conservando el proveedor seleccionado.
- Si falla el almacenamiento, conserva el borrador y no registra el pedido.
- Si falla la descarga, el pedido sigue guardado y puede volver a descargarse desde su detalle.

### Historial y repetir

- Buscar por número, proveedor o producto.
- Filtrar pendientes, parcialmente recibidos, recibidos o cancelados.
- Consultar el detalle completo y su actividad.
- Descargar el PDF nuevamente.
- Repetir cualquier pedido crea un **nuevo borrador editable** con proveedor y cantidades originales. No registra otro pedido automáticamente y no modifica stock.
- Si ya hay un borrador, se pide confirmar su reemplazo.
- El siguiente guardado genera otro número y referencia el pedido utilizado como base.

### Recepción y stock

- Desde el detalle: Registrar recepción.
- Se proponen las cantidades pendientes. Se pueden editar y poner cero donde no llegó mercadería.
- Confirmar suma únicamente lo recibido al stock y registra movimientos.
- Lo que falta continúa pendiente; una recepción completa cierra el pedido.
- Impide recibir más que lo solicitado y recibir nuevamente un pedido cerrado.
- Cancelar pendiente libera las cantidades todavía no recibidas. Conserva la mercadería ya recibida y todo el historial.
- Dar de alta o repetir un pedido nunca aumenta existencias.
- Las entradas manuales desde Depósito avisan cuando hay pedidos pendientes para evitar confundirlas con una recepción registrada.

### Reposición

Se conserva el modelo P como ayuda para preparar pedidos:

Cantidad sugerida = máximo(0, demanda × (revisión + entrega) + stock de seguridad − stock − cantidades pendientes de recibir).

Stock de seguridad = techo(z × desviación diaria × raíz(revisión + entrega)).

Las recepciones parciales reducen las cantidades pendientes; los pedidos cancelados dejan de contarse. Los parámetros se ajustan desde la ficha del producto. Las sugerencias no envían pedidos ni sustituyen la decisión del usuario.

## PDF

- Descarga un archivo PDF real desde el navegador; no depende de un servicio externo.
- A4 con marca, número de pedido, fecha, proveedor, estado, productos, códigos, cantidades, total de unidades y observaciones.
- No incluye precios de venta, costos ni márgenes.
- Pedidos largos continúan en nuevas páginas con numeración y encabezados.
- Fuentes DejaVu Sans embebidas para mantener el diseño; licencia en LICENSE-PDF-FONTS.txt.
- Admite caracteres latinos y acentos españoles. Si aparece un carácter fuera de la codificación admitida, avisa en lugar de omitirlo silenciosamente; el pedido continúa guardado.
- Descargar un PDF no envía mensajes. El usuario comparte el archivo con el proveedor.
- El PDF conserva las cantidades originales solicitadas; el detalle del sistema muestra también las cantidades recibidas y pendientes.

## Funciones que se conservan

- Inicio con venta rápida permanente y escaneo continuo.
- El mismo código escaneado varias veces suma unidades en una sola línea.
- Lector configurado como teclado (HID) con Enter; los códigos iniciales son ejemplos y deben reemplazarse por los códigos reales de los envases para probar paquetes físicos.
- Confirmación de venta, bloqueo sin stock, anulación con restitución y órdenes detalladas.
- Ventas con resumen comercial, ranking por unidades/dinero y filtros de período, categoría y medio de pago.
- Depósito por categorías, entradas y bajas manuales con historial.
- Alta rápida consecutiva, clasificación por desplegables y Crear uno similar.
- Edición individual de precios/costos y aumentos/disminuciones por selección, categorías, tipos o catálogo completo.
- Reportes diarios, semanales y mensuales, stock actual y exportación CSV.

## Datos de versiones anteriores

Se conserva **trebol-demo-v3**. Los pedidos individuales anteriores se transforman en pedidos de una línea, manteniendo su estado y sus cantidades. No se duplican recepciones ni se reinician ventas, productos o precios. La conversión puede ejecutarse nuevamente sin duplicar pedidos.

Los datos pertenecen al navegador y dominio actuales, no se sincronizan entre dispositivos. La demo no emite facturas ni procesa pagos. Usar una sola pestaña operativa; la comprobación de revisión no equivale a transacciones multiusuario. Reiniciar demo borra los datos de prueba con confirmación.

## Validación

```bash
node --test tests/*.test.cjs
```

**46 pruebas aprobadas**: migración, pedidos agrupados, recepción parcial, duplicados, cancelación, repetición, guardado de borrador, PDF y regresiones de ventas/precios/stock.

PDF de ejemplo revisado visualmente. También se revisó un pedido de prueba de 60 líneas con nombres/códigos largos y cantidades grandes (13 páginas), verificando que no se pierdan productos ni haya texto fuera de página.

Las pruebas de interfaz usan un DOM simulado. La revisión visual de la aplicación en navegador y la prueba con un escáner físico siguen pendientes; el navegador remoto disponible bloquea archivos locales y localhost.

## Prueba sugerida

1. Pedidos → agregar proveedor y tres productos con cantidades distintas.
2. Agregar otra vez un producto: debe aumentar su cantidad en la misma línea.
3. Cambiar de sección y recargar: debe continuar el borrador.
4. Guardar y descargar PDF: verificar número, proveedor, productos y cantidades; el stock debe seguir igual.
5. Historial → Ver detalle → Registrar recepción; recibir sólo parte y revisar el stock y lo pendiente.
6. Repetir pedido: modificar una cantidad, guardar y comprobar un nuevo número.
7. Crear un borrador y repetir otro pedido: debe pedir confirmación para reemplazarlo.
8. Cancelar un pedido parcialmente recibido y comprobar que no quite las unidades ya ingresadas.
