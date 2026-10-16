# Despensa el Trébol: funcionalidades esenciales de stock

## Conclusión

La demo cubre el circuito básico **alta → ingreso/recepción → venta → ajuste → reposición**. Las brechas principales están en el control de perecederos, las presentaciones de compra, los costos de recepción, el inventario físico organizado y la trazabilidad de excepciones. Para operar con dueño y empleados necesita, además, persistencia recuperable, usuarios y control de operaciones simultáneas.

La prioridad propuesta supone una despensa minorista de un local, con alimentos envasados, lector USB y dueño/empleados. Peso, fiado y separación depósito/salón requieren confirmar la operatoria. Las prioridades son recomendaciones para este negocio; no implican que deba copiar todas las funciones de un ERP.

## Método y fuentes

Se revisaron el código actual de `Trebol-CRM-2.4/core.js` y `app.js`, el README y PRODUCT.md, y documentación/páginas oficiales de cuatro sistemas. El contraste se basa en capacidades documentadas, sin probar instalaciones comerciales ni comparar precios o planes. Algunas capacidades comerciales dependen de edición, módulo o configuración.

- **[Odoo Inventory 19](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/inventory.html):** unidades y embalajes; lotes y vencimientos; inventarios y conteos cíclicos; descarte; reposición; movimientos; ubicaciones y valuación. Su documentación enlaza también FEFO: retirar primero lo que vence antes.
- **[Zoho Inventory](https://www.zoho.com/inventory/features/):** pedidos y recepciones, pagos a proveedores, lotes y vencimientos, ajustes, códigos de barras, devoluciones, listas de precios, depósitos y reportes.
- **[Tango Punto de Venta — Stock](https://www.axoft.com/tango/software-para-punto-venta/soluciones/stock.php):** doble unidad de medida, inventarios por ingreso manual/Excel/colectoras, mermas, precio promedio ponderado, última compra, valorización, etiquetas, stock inmovilizado y ficha kardex. Publica capacidades por edición.
- **[Alegra POS Argentina](https://www.alegra.com/argentina/punto-venta/):** depósitos, aperturas/cierres de turno, ingresos/salidas de dinero, ventas por vendedor, dispositivos y facturación electrónica. Se usa como referencia del circuito de caja complementario al stock.

## Lo que ya está cubierto

- Catálogo con nombre, código único, categoría, tipo, precio, costo y stock inicial; alta consecutiva y creación de productos similares.
- Venta por código exacto o búsqueda; cantidades editables; escaneos repetidos acumulan unidades; validación de existencias y descuento al confirmar.
- Ventas históricas con nombre, precio y costo al momento de vender; ticket imprimible/PDF; medio de pago y referencia de cliente.
- Anulación completa con motivo y restitución de toda la mercadería.
- Ingresos, salidas manuales y ajuste al stock contado. Motivos de rotura/pérdida, vencido, consumo interno y devolución a proveedor.
- Pedidos con múltiples productos, proveedor, observaciones, PDF, borrador persistente, repetición y cancelación de pendiente.
- Recepciones parciales, historial de recepciones y prevención de cantidades superiores a lo pedido. Crear el pedido no suma stock; recibirlo sí.
- Reposición basada en historial o estimación, plazo de entrega, revisión y stock de seguridad, descontando unidades pendientes de recibir.
- Precios/costos individuales y por grupos; historial de cambios.
- Reportes de ventas, ranking, medios de pago, margen bruto estimado, stock actual valorizado y exportación CSV.

**Evidencia:** `core.js:68–103` (venta/anulación/precios), `132–187` (alta/pedidos/recepción), `189–201` (reposición); `app.js:328–351` (edición/confirmación), `412–450` (movimientos/recuento), `131–134` (CSV), `579–606` (reportes/tickets).

## Brechas esenciales de stock

### 1. Lotes y vencimientos — prioridad alta para perecederos

**Hoy:** una única cantidad por producto. Se puede bajar mercadería vencida manualmente, pero no registrar su vencimiento ni anticiparlo. El nombre del motivo no constituye gestión de vencimientos.

**Falta:** registrar lote, cantidad y vencimiento al recibir; listar próximos a vencer; separar vencido/no vendible; orientar salida FEFO y mantener trazabilidad. No alcanza una fecha por producto: dos entregas de la misma leche pueden vencer en fechas diferentes.

**Ejemplo:** 8 leches vencen esta semana y 12 el mes próximo. Hoy sólo se ven 20 unidades.

**Mínimo verificable:** recibir dos lotes del mismo producto, alertar sólo las unidades del lote próximo a vencer y registrar su baja sin alterar el otro lote. Definir cómo el operador identifica el lote realmente vendido para no confundir la asignación teórica con la mercadería física.

**Referencias:** Odoo y Zoho.

### 2. Unidades de compra y conversión de bultos — prioridad alta

**Hoy:** ventas, altas, pedidos y recepciones exigen cantidades enteras de unidades. Los botones 6/12/24 sólo cargan números; no son presentaciones configuradas.

**Falta:** unidad base de stock, presentación de compra y factor por producto: caja de 12, pack de 6, etc.; expresar costo por bulto y convertirlo a costo unitario. Si un pack también se vende, debe descontar las unidades correspondientes.

**Ejemplo:** recibir 3 cajas de 12 leches debe ingresar 36 unidades y convertir el costo de cada caja a costo por leche.

**Mínimo verificable:** compra por caja y venta por unidad coherentes, con factor histórico en la recepción. Cambiar la presentación futura no altera movimientos anteriores.

**Referencias:** unidades/embalajes de Odoo; doble unidad de Tango.

### 3. Recepción con costo real y documento de compra — prioridad alta

**Hoy:** el pedido conserva `cost` desde la ficha del producto, pero `receivePurchase` sólo recibe cantidades. El costo de la ficha se cambia por separado; no hay factura/remito de compra ni costo efectivo por entrega.

**Falta:** documento y proveedor de la entrada, fecha, costo unitario real, descuentos y gastos cuando correspondan; actualizar costo según una política explícita y conservar el histórico. Para este tamaño, último costo o promedio ponderado son opciones a decidir, no dos funciones obligatorias.

**Ejemplo:** quedan 10 unidades a $700 y entran 10 a $900. Con promedio ponderado el costo sería $800; con último costo, $900. El método debe estar identificado. El margen actual usa el costo de ficha copiado al vender, no capas reales de compra.

**Mínimo verificable:** una recepción cambia stock y registra su costo/documento en una sola operación; las ventas previas conservan sus importes históricos. Una compra sin pedido previo también debe poder documentarse.

**Referencias:** compras/pagos de Zoho; valuación de Odoo; promedio ponderado y última compra de Tango.

### 4. Inventario físico por sesión — prioridad alta

**Hoy:** existe recuento individual que fija el stock y registra la diferencia. No falta el ajuste básico.

**Falta:** sesión de inventario general o por categoría, carga por escáner/planilla, borrador, teórico versus contado, diferencias en unidades/dinero y cierre conjunto con responsable. Definir qué sucede si se vende durante el conteo: pausar la operación o conciliar los movimientos posteriores al inicio.

**Ejemplo:** contar toda la góndola de bebidas y revisar faltantes/sobrantes antes de aplicar ajustes, en lugar de modificar productos uno por uno.

**Mínimo verificable:** contar varias referencias, retomar el borrador y cerrar una sola vez con diferencias trazables.

**Referencias:** inventarios/conteos cíclicos de Odoo; toma de inventario de Tango.

### 5. Devoluciones parciales y destino de la mercadería — prioridad alta

**Hoy:** anula toda una venta y devuelve todo al stock. La devolución a proveedor es una salida manual con motivo; no enlaza compra, cantidades devueltas o crédito.

**Falta:** devolver líneas/cantidades específicas contra una venta; registrar reintegro o saldo; distinguir mercadería vendible de dañada. Para proveedores, enlazar devolución a recepción y registrar reposición/crédito pendiente.

**Ejemplo:** de una venta de cinco productos el cliente devuelve un yogur en mal estado. No se debe anular el ticket completo ni volver a poner ese yogur a la venta.

**Mínimo verificable:** impedir devolver más de lo vendido/recibido, descontar devoluciones previas y restituir stock sólo cuando corresponde.

**Referencias:** devoluciones de Zoho y Odoo.

### 6. Importación masiva de catálogo y stock inicial — prioridad alta para puesta en marcha

**Hoy:** alta manual consecutiva y exportación CSV de reportes. Exportar un reporte no permite importar catálogo ni restaurar el sistema.

**Falta:** plantilla CSV/Excel, vista previa, validación de códigos repetidos e importes, informe de errores, política de crear/actualizar y carga inicial trazada. Una lista del proveedor puede ser una ampliación posterior.

**Mínimo verificable:** importar un catálogo real sin duplicar referencias al reintentar y sin sobrescribir stock existente accidentalmente.

**Referencias:** importación de Odoo; actualización masiva/inventarios con Excel de Tango; actualización masiva de Alegra.

### 7. Kardex consultable y reportes de pérdidas — prioridad media-alta

**Hoy:** los movimientos están registrados y se exportan por período. La vista general muestra los últimos 60; la ficha del producto, los últimos 12. La valoración de stock usa costos actuales. Las mermas tienen motivo pero no reporte económico dedicado.

**Falta:** historial completo filtrable por producto, fecha, operación y documento; saldo antes/después; responsable; entradas/salidas valorizadas; merma por causa y período; productos sin rotación/cobertura. Evitar presentar la valorización actual como valuación contable histórica.

**Mínimo verificable:** explicar el saldo de un producto desde sus movimientos y responder cuánto se perdió por vencimiento/rotura en un período con costos históricos identificados.

**Referencias:** ficha kardex/stock inmovilizado de Tango; reportes de stock/movimientos de Odoo; reportes de Zoho.

## Base necesaria para operación real

### Datos recuperables y operaciones compartidas — prioridad previa al uso diario

**Hoy:** `localStorage` por navegador/origen. `mutate` copia el estado y verifica revisión de otra pestaña, pero no ofrece transacciones multiusuario ni sincronización entre dispositivos (`app.js:2–20`).

**Falta:** fuente de datos persistente compartida, copias de seguridad y restauración comprobada. Guardar la venta/recepción y sus movimientos de manera atómica; ante reintentos, evitar duplicados. Dos vendedores deben competir correctamente por la última unidad. La arquitectura puede ser local o alojada según necesidades; una base de datos por sí sola no resuelve la concurrencia.

**Mínimo verificable:** recuperar catálogo, ventas, compras y movimientos desde una copia; dos ventas simultáneas de la última unidad no producen stock negativo ni pérdida de registros.

**Referencias:** resguardo en nube de Alegra y Tango Backup; límite actual confirmado por código/README.

### Usuarios, permisos y responsable — prioridad alta con dueño y empleados

**Hoy:** no hay identidad de operador ni restricciones efectivas. Motivo y fecha no identifican quién hizo una operación.

**Falta:** dueño/administrador y vendedor; permisos efectivos para costos, precios, anulaciones y ajustes; autor de ventas, recepciones y cambios. La bitácora debe conservar valores anteriores/nuevos y documento relacionado. Los controles deben aplicarse en la capa que guarda los datos, además de la interfaz.

**Mínimo verificable:** vendedor registra una venta pero no cambia costos ni aplica ajustes restringidos; el dueño puede identificar y revisar las acciones.

**Referencias:** controles/permisos publicados por Tango PDV y seguimiento de vendedores de Alegra. Necesidad contextual confirmada en PRODUCT.md.

## Funciones esenciales sólo si la operatoria las necesita

- **Venta por peso:** hoy las cantidades deben ser enteras. Si vende fiambre, queso o granel, permitir kg/g, fracciones, precio por medida y redondeo; integración de balanza/códigos de peso variable según hardware. Prioridad alta en ese caso, prescindible para venta exclusivamente envasada. Referencia: unidades de Odoo y doble unidad de Tango.
- **Depósito versus salón:** hoy hay un saldo único; la sección Productos no representa ubicaciones separadas. Agregar stock por ubicación y transferencias si reponer góndola desde depósito es una tarea habitual. Multisucursal queda para cuando exista más de un local. Referencias: Odoo, Zoho, Tango, Alegra.
- **Caja y turnos:** si la demo será también el punto de venta diario, agregar apertura, fondo inicial, movimientos de efectivo, monto recibido/vuelto, pagos combinados, cierre y diferencias por operador. Registrar medio de pago y sumar ventas no constituye arqueo. Referencia: Alegra POS.
- **Facturación fiscal:** el ticket actual es interno. Si se pretende emitir comprobantes fiscales desde el sistema en Argentina, definir integración ARCA y notas de crédito; es un alcance comercial complementario al stock. Referencias: Alegra Argentina y Tango. No se investigó el encuadre tributario particular del comercio.
- **Fiado/cuenta corriente:** si ofrece crédito, falta cliente persistente, deuda, pagos y saldo. El nombre de cliente en una venta es sólo una referencia. No priorizarlo sin confirmar que se usa.

## Mejoras posteriores

Ficha completa de proveedor y asociación producto-proveedor; listas/códigos de proveedor; fecha esperada y avisos de atraso para pedidos agrupados; stock mínimo/máximo simple como alternativa a configurar demanda; etiquetas de precio/código; varios códigos para un producto; archivar productos discontinuados conservando historial; promociones y descuentos; pedidos de clientes y reservas si comienza a vender por encargo.

La demo ya tiene reposición sugerida. El campo legado `umbral` de los productos iniciales no define el filtro actual de stock bajo: éste usa `Core.replenishment(...).critical`, calculado con stock de seguridad. Por eso mínimo/máximo sería una simplificación de configuración, no la primera implementación de alertas.

## Orden recomendado

1. **Base operativa:** persistencia/transacciones, respaldo/restauración, usuarios y responsable.
2. **Entrada correcta de mercadería:** importación inicial, unidades/bultos, recepción con costos/documentos y lotes/vencimientos para perecederos.
3. **Conciliación y excepciones:** inventarios por sesión, devoluciones parciales, bajas valorizadas y kardex completo.
4. **Venta diaria y expansión:** caja si actúa como POS; peso si hay granel; facturación si se integra; ubicaciones/fiado según operatoria.

Para avanzar sólo con la demo frontend, las funciones más demostrativas son **lotes/vencimientos, conversión de bultos y sesión de inventario**. Para ponerla en uso real, la base operativa va primero. No se asignan plazos ni costos sin definir alcance y arquitectura.

## Preguntas que cambian la prioridad

1. ¿Se vende exclusivamente por unidad o también por peso?
2. ¿Los proveedores entregan por caja/pack? ¿Qué presentaciones se usan?
3. ¿Cuántos empleados/equipos operan al mismo tiempo?
4. ¿Se quiere administrar sólo stock o también caja/facturación?
5. ¿Hay depósito separado, fiado o devoluciones frecuentes a proveedores?

**Alcance de la verificación:** análisis estático del sistema y consulta de fuentes oficiales; no se ejecutaron operaciones de prueba sobre los datos del navegador ni validaciones físicas de escáner, impresora o balanza.
