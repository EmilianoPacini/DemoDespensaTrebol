# Despensa el Trébol — CRM 2.4

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
