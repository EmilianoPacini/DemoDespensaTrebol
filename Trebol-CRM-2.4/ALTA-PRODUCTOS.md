# Alta de productos sin carga repetitiva

Propuesta para Despensa el Trébol. Investigación consultada el 12 de septiembre de 2026.

## Recomendación

Un producto se da de alta una sola vez. Cuando vuelve a llegar mercadería del mismo producto, se registra una entrada de stock. Separar esas dos tareas evita volver a escribir nombre, categoría, tipo, precio y costo en cada recepción.

| Situación | Flujo propuesto | Estado en CRM 2.3 |
| --- | --- | --- |
| Producto nuevo | Escanear código, completar nombre, elegir categoría/tipo, indicar precio/costo/stock y guardar | Implementado en Alta rápida |
| Varios productos nuevos seguidos | Guardar y continuar, manteniendo categoría/tipo y volviendo al campo de código | Implementado |
| Otra presentación de un producto parecido | Ficha → Crear uno similar; revisar nombre/importes, indicar nuevo código y stock | Implementado |
| Código ya registrado durante el alta | Mostrar el producto existente y ofrecer cargar stock, evitando el duplicado | Implementado |
| Catálogo inicial o lista extensa del proveedor | Importar CSV/Excel, mapear columnas una vez, revisar duplicados por código y confirmar | Próxima mejora propuesta; no implementada |
| Producto desconocido con código | Consultar una base externa para sugerir nombre/marca/presentación; revisar antes de guardar | Investigado; sin conexión externa en esta demo |

## Qué hace el alta rápida actual

1. Depósito → Alta rápida / consecutiva.
2. Escanear el código y presionar Enter (el lector normalmente lo envía). También se puede escribir.
3. Si existe, el sistema muestra el producto y el acceso a su entrada de stock. No crea un duplicado.
4. Si no existe, completar nombre; categoría y tipo son desplegables.
5. Indicar precio de venta, costo unitario y cantidad inicial. La cantidad inicial puede ser cero.
6. Guardar. Con “Seguir cargando productos” marcado, se abre la siguiente alta con la misma categoría y tipo.
7. Nombre, código, precio y costo quedan vacíos; el stock vuelve a cero. No se copian importes accidentalmente al siguiente producto.

Sin código de barras se genera un código interno. Las categorías y tipos se conservan durante la sesión; los productos guardados persisten en el navegador. Crear uno similar copia expresamente los datos comerciales y permite revisarlos antes de guardar; el código y el stock no se copian.

## Próximo paso que recomiendo: lista del proveedor

Para una carga inicial extensa, propongo importar la lista del proveedor con columnas código, nombre, categoría, tipo, costo, precio y cantidad. La pantalla debe permitir:

- Recordar la correspondencia de columnas para ese proveedor.
- Separar productos nuevos, códigos ya existentes y filas con errores.
- No convertir códigos a números: se deben conservar ceros iniciales.
- Elegir la operación sobre existentes: cambiar costo, cambiar precio o ingresar unidades.
- Mostrar una vista previa antes de aplicar; nunca interpretar silenciosamente una cantidad como reemplazo de stock.
- Detectar cargas repetidas de una misma recepción para evitar duplicar existencias.

Es una propuesta de diseño, no una integración incluida en esta entrega. Para definirla con precisión, el insumo útil es una lista real de proveedor, con sus columnas habituales.

## Consulta por código: qué se puede automatizar

El código comercial común identifica al producto. Normalmente no incluye su nombre ni el precio de ese comercio. Esos datos se obtienen de una base asociada al código. Fuente: [GS1 — Descripción y precio en el código de barras](https://support.gs1.org/support/solutions/articles/43000734158-are-the-description-and-price-of-the-item-included-in-the-barcode-).

[Open Food Facts](https://openfoodfacts.github.io/openfoodfacts-server/api/) permite consultar información de productos alimenticios por API. Es una opción para sugerir datos descriptivos cuando se incorpora un código desconocido. Su documentación advierte que los datos son colaborativos y no garantiza exactitud ni completitud; también establece límites de consultas y condiciones de uso. No se verificó cobertura para los productos concretos de esta despensa.

Mi propuesta sería una sugerencia opcional, revisable y almacenada localmente: completar nombre y presentación si se encuentran, pero seguir permitiendo el alta manual si no hay resultado o conexión. Costo de compra y precio de venta deben ser los del negocio. Esta demo no consulta servicios externos ni simula que encontró productos en una base externa.

## Escáner en ventas

La implementación está pensada para lectores USB/Bluetooth que envían caracteres como un teclado (HID), configurados con Enter al final de la lectura. [Zebra documenta ese modo y la configuración del sufijo Enter](https://support.zebra.com/article/Adding-a-ENTER-key-after-scanning-a-barcode-scanner-expansion-back-zback).

En Inicio, el campo de código recibe las lecturas. Cada lectura de un código existente suma una unidad, incluso si el filtro visual está en otra categoría. Lecturas repetidas incrementan la misma línea. No se necesita hacer clic en el resultado de búsqueda. Se conserva el límite de stock.

Al confirmar la venta se descuenta el stock, se vacía el carrito y se recupera el foco para otra orden. Durante una ventana de revisión no se agregan productos a la venta. Para productos vendidos por peso o etiquetas con precio/peso embebido haría falta una regla específica: esta demo opera por unidades y coincidencia exacta del código.

Los códigos de los productos iniciales son ejemplos: para escanear un paquete real se debe registrar su código real en el catálogo.
