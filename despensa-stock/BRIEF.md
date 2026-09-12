# Brief — Despensa el Trébol

**Cliente:** dueño de despensa pequeña (persona mayor, poca afinidad tecnológica)  
**Canal demo:** WhatsApp → link desplegable para feedback  
**Prioridad ahora:** Paso 0 = demo interactiva (sin lector físico)  
**Foco activo:** este producto | Montironi en pausa

## Problema
No tiene control de stock: no sabe cuánto queda de cada producto ni cuándo reponer. Ventas y existencias no están sincronizadas.

## Visión del producto
Sistema simple de stock + venta para despensa:
- Alta/edición de productos **muy configurable por él** (sin depender del desarrollador): producto, marca, tamaño/peso, precio, stock, umbrales de aviso, etc.
- Entrada de stock y salida por venta.
- Venta por **escáner de código de barras** (PC + lector) y, obligatorio, **venta rápida manual** (por si se rompe el escáner): flujo ultra corto e intuitivo.
- Reportes de ventas/stock por día / semana / mes.
- Avisos configurables: “te estás por quedar sin mayonesa”.
- Stock siempre consistente: lo que entra y lo que sale cuadra.

## Principio UX (no negociable)
Curva de aprendizaje mínima. Botones grandes, pocos pasos, copy claro, bonito pero simple. Pensado para usuario mayor.

## Paso 0 — Demo desplegable (ahora)
Sin hardware de escáner. El cliente abre un link y puede:
- Ver/cargar productos de ejemplo
- Simular venta (toques / “escaneo” simulado)
- Ver stock bajar
- Ver un pantallazo de avisos / reporte simple  
Objetivo: feedback rápido por WhatsApp mientras se define el build real.

## MVP v1 (después del feedback)
- CRUD productos + atributos configurables
- Stock (ajustes / ingresos)
- Venta rápida + preparación para lector (campo código de barras)
- Decremento atómico de stock en venta
- Avisos por umbral configurable
- Reportes básicos día/semana/mes
- Multi-usuario/caja: fuera o mínimo (decidir)

## Fuera de alcance (inicial, salvo que diga lo contrario)
- Facturación fiscal / AFIP
- E-commerce / delivery
- App móvil nativa del lector (usar teclado-wedge del lector USB en PC)
- Contabilidad completa
- Multi-sucursal

## Éxito
Él opera solo: carga productos, vende, ve qué reponer, sin llamar al desarrollador para cada producto nuevo.

## Decisiones confirmadas (Emiliano 2026-09-12)
- Nombre: **Despensa el Trébol** (decisión A; UI branding DS-DEMO-13)
- Demo tech: Next + seed + localStorage (sin BD)
- Multi-usuario: fuera MVP
- Idioma: ES-AR
- UX venta: poco tipeo; selectores/taps; filtro typeahead al elegir producto (escáner trae el ítem); demo con productos precargados + venta rápida

## Dirección UX (Emiliano 2026-09-12)
- Look **CRM de stock** (módulos claros) + **caja/POS con escáner**, sin complejidad.
- Shell: sidebar Inicio / Vender / Depósito / Avisos / Reportes (botones grandes).
- Vender: split lista+filtro+scan | carrito+confirmar. Escáner USB tipo teclado.
- Depósito/Avisos estilo CRM simple (stock visible, alerts).
- Prohibido: dashboards densos, muchos filtros, tipografía chica.

## Delta Home (Emiliano 2026-09-12)
- Look más serio; letra un poco más chica (sigue legible).
- Home = hub de trabajo: vender sin abrir otra pantalla; stock bajo visible; mini-reporte del día visible; info clara y detallada de un vistazo.

## Branding (Emiliano 2026-09-12)
- Nombre UI: **Despensa el Trébol** (no Mi Despensa)
- Nav/pantalla catálogo: **Depósito** (no Productos/Stock; ruta `/productos` Por definir)
- Sin emojis; visual seria + sencilla
- Precios + reportes D/S/M + top: delta demo **después** de Home 11/12

## Delta ventas (Emiliano 2026-09-12) — post Home
- Deshacer venta desde Home (restaura stock), con confirmación
- Historial de ventas
- Confirmación al vender y al deshacer
