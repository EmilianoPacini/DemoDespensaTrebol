# Despensa el Trébol

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El dueño y los empleados de una despensa. El usuario confirmó ambos perfiles como usuarios habituales.

## Product Purpose

Demo frontend de un sistema de control de stock entrante y saliente, ventas con lectura de códigos de barras y tickets. El rediseño debe priorizar intuición, simplicidad, orden, legibilidad y textos claros y profesionales.

## Operating Context

- Lector de códigos de barras conectado por USB, confirmado por el usuario.
- Tickets de venta impresos y digitales; ventas guardadas para consulta posterior, confirmado por el usuario.
- La implementación espera un lector en modo teclado (HID) con Enter. Admite productos por unidad y por peso, ingreso manual de gramos y etiquetas de balanza configurables. Modelo/formato de balanza pendientes.
- Equipo principal confirmado: notebook conectada al lector USB, utilizada por el dueño y sus empleados. Resolución, modelo de impresora y ancho de papel: pendientes. Validación inicial en 1366 × 768.

## Capabilities and Constraints

- HTML, CSS y JavaScript sin framework. La demo conserva datos en localStorage del navegador.
- Etapa actual: el usuario aprobó ejecutar el rediseño y levantar el frontend. Prioridad explícita: diseño profesional sin pantallas cargadas ni confusas. Sin backend ni base de datos.
- Capacidades observadas: venta, control de existencias, anulación con restitución, historial, alta consecutiva, duplicación de productos, movimientos manuales y recuento, precios y costos individuales y por grupo, pedidos a proveedores con PDF, borrador persistente, recepción parcial, sugerencias de reposición y reportes CSV.
- Las ventas confirmadas conservan nombres, precios y costos históricos. Crear un pedido no aumenta el stock; recibirlo sí.
- El rediseño incorpora ticket dedicado, impresión mediante el navegador y descarga PDF local con importes históricos. El ancho de papel físico y la prueba con impresora siguen pendientes.
- La demo no procesa pagos ni emite comprobantes fiscales. El guardado local no equivale a sincronización entre dispositivos ni a operación multiusuario.
- Puesto de caja simplificado: F8 revisa y una segunda pulsación separada confirma; el cierre no solicita cliente ni medio de pago. Las ventas nuevas quedan como consumidor final y medio sin registrar; los datos históricos se conservan. Cantidad inline, multiplicador de un solo uso, corrección con flechas/signos/Supr/deshacer y tipografía de mostrador ampliada.
- Códigos de los productos iniciales: ejemplos; deben sustituirse por los reales para pruebas físicas.
- Frontend esencial incorporado: compra por bulto/unidad/kg, costo real de recepción con último costo, lotes/vencimientos, merma, recuento por sesión, devoluciones parciales, reposición agrupada y respaldo/restauración local.
- Roles y permisos efectivos, importación masiva, integración física de balanzas/impresoras y entrega digital por correo/mensajería: pendientes o fuera de esta etapa frontend.

## Brand Commitments

Nombre existente: Despensa el Trébol. El usuario concede libertad para proponer el rediseño visual. No hay una identidad visual obligatoria confirmada.

## Evidence on Hand

- Implementación: `Trebol-CRM-2.4/index.html`, `app.js`, `core.js`, `styles.css`, `purchase-pdf.js`.
- Contexto funcional: `Trebol-CRM-2.4/README.md` y `ALTA-PRODUCTOS.md`.
- Pruebas existentes: `Trebol-CRM-2.4/tests/`.
- Catálogo y ventas de ejemplo en `core.js`; no son datos reales del cliente.

## Product Principles

1. Priorizar las tareas cotidianas de venta y control de mercadería.
2. Hacer explícito el efecto de cada operación sobre el stock.
3. Facilitar aprendizaje y lectura para dueño y empleados.
4. Conservar el registro de ventas independientemente de la entrega del ticket.
5. Distinguir capacidades reales de la demo, propuestas y decisiones pendientes.
