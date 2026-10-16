---
name: Despensa el Trébol
description: Interfaz de gestión clara y profesional para el mostrador.
colors:
  primary: "#216747"
  navigation: "#184d3c"
  background: "#f3f6f4"
  surface: "#ffffff"
  text: "#23392f"
  muted: "#627169"
  border: "#dce4de"
  selection: "#eaf3ed"
  danger: "#a33332"
  warning: "#825419"
typography:
  headline:
    fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
    fontSize: "26px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.6px"
  title:
    fontSize: "20px"
    fontWeight: 650
    letterSpacing: "-0.35px"
  body:
    fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
    fontSize: "15px"
    lineHeight: 1.5
  label:
    fontSize: "13px"
    fontWeight: 500
rounded:
  control: "6px"
  panel: "9px"
  dialog: "12px"
spacing:
  small: "8px"
  medium: "16px"
  panel: "22px"
  workspace: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
    height: "40px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "22px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    height: "44px"
---

# Design System: Despensa el Trébol

## Overview

Interfaz sobria, luminosa y funcional, según la dirección aprobada. La identidad acompaña una operación repetitiva de mostrador: textos claros, controles familiares y separación visible entre tareas.

**Key Characteristics:**
- Navegación verde profundo y superficies claras.
- Densidad cómoda, con acciones secundarias a demanda.
- Importes alineados y estados identificados con palabras.

## Colors

### Primary
El verde de acción identifica confirmaciones y selección. El verde profundo de navegación delimita el espacio de trabajo; el tono claro acompaña lecturas, vistas previas y selección.

### Neutral
Fondo gris verdoso, superficies blancas, bordes suaves y texto oscuro. Los colores secundarios mantienen legibilidad sin competir con el contenido principal.

### Estados
Rojo para errores, anulaciones y falta de stock; ámbar para advertencias y pendientes. Los estados siempre llevan texto.

## Typography

Una familia sans del sistema para títulos, controles y datos. Encabezado principal de 26px, títulos de 20px y subtítulos de 17px. Cuerpo de 15px, tablas de 14px, etiquetas de 13px e información secundaria de 12px. Los importes principales llegan a 30px. Numerales tabulares para comparación de importes.

## Layout

Navegación lateral de 216px y área flexible con margen interior de 32px. Contenedor máximo de 1700px. Venta y preparación de pedidos usan dos columnas en escritorio; a 950px se apilan. A 1180px la navegación reduce su ancho a 184px; a 650px se sustituye por navegación inferior. Las tablas conservan desplazamiento horizontal interno cuando lo necesitan. El historial expandido de Reportes pasa de dos columnas a una a 1100px.

## Elevation & Depth

Superficies planas separadas por bordes y tonos. La sombra se reserva para diálogos y notificaciones: diálogo `0 24px 70px #16302633`; notificación `0 8px 26px #16302626`. Las transiciones de botones son de 150ms y se desactivan con movimiento reducido.

## Shapes

Controles ligeramente redondeados, paneles de esquinas suaves y líneas divisorias finas. Estados con radio de 4px; controles de 6px; paneles de 9px; diálogos de 12px. El detalle lateral utiliza esquinas rectas.

## Components

### Buttons
Primario verde con texto blanco; secundario blanco con borde; destructivo rojo. Tamaño base de 14px y altura mínima de 40px. Estados hover y active tonales; foco de 3px con separación de 3px. Deshabilitados con opacidad de 0.5.

### Inputs / Fields
Etiqueta visible, borde definido y altura mínima de 44px. Campo de escaneo de 48px, texto de 17px y respuesta inmediata junto a la lectura. Los errores describen el problema y mantienen el contexto.

### Navigation
Texto e iconos SVG consistentes. La sección activa utiliza una superficie verde clara; las pestañas internas emplean subrayado y texto verde. Navegación móvil inferior con etiquetas.

### Chips / States
Filtros con selección tonal y atributo aria-pressed. Etiquetas de estado acompañadas por texto, independientes de los filtros.

### Containers / Tables
Paneles blancos, borde fino y padding de 22px; tablas alineadas con encabezados discretos, numerales a la derecha y acciones asociadas a cada fila. Detalles secundarios plegables para reducir la carga inicial.

## Do's and Don'ts

### Do:
- Mantener texto e icono en la navegación.
- Mostrar el efecto sobre stock antes de confirmar un movimiento.
- Conservar total y acción principal accesibles durante la venta.
- Presentar estados con palabras además de color.

### Don't:
- No agregar métricas ni análisis a la pantalla de venta.
- No mostrar todas las herramientas avanzadas simultáneamente.
- No introducir animaciones decorativas en tareas repetitivas.

Fuente: `Trebol-CRM-2.4/styles.css`, `index.html` y `app.js`. Impresora y ancho de papel definitivos pendientes.

## Circuitos esenciales de stock

### Puesto de venta: compra protagonista

`Trebol-CRM-2.4/sales-ui.js` concentra el compositor de ventas, antes duplicado entre app.js y stock-ui.js. Escaneo arriba; compra dominante y resumen compacto a la derecha. Búsqueda inline a demanda con exploración completa opcional. Última línea seleccionada y desplazamiento interno para mantenerla visible; unidades y kg se presentan por separado.

Búsqueda incremental por palabras sobre nombre, marca, presentación, categoría/tipo y códigos, sin requerir Enter. Los resultados detallan esos atributos, unidad de venta, precio y disponible; marca/presentación son opcionales y editables en Productos. En móvil, abrir la búsqueda desplaza su panel al inicio visible sin ocultar el cierre fijo.

En móvil, filas adaptadas y total/revisión persistentes sobre la navegación. Las notificaciones se desplazan por encima del resumen y no se muestran avisos flotantes en cada alta normal. F2 busca, F3 edita cantidad inline o ingresa peso, +/− (también F6/F7) ajustan unidades, flechas solas seleccionan, Supr quita y Ctrl+Z deshace. `6*` prepara un multiplicador visible de un solo uso. Primera F8 revisa; después de soltar, segunda F8 registra. Enter del lector y Ctrl+Enter no confirman. El cierre no solicita cliente ni pago; la impresión se configura fuera de él y ocurre solo después de guardar.

Legibilidad de mostrador: nombres de 18 px (19 px en móvil), cantidades de 22 px, subtotales de 20 px, total lateral de 38 px y revisión de 56 px (44 px móvil). Encabezados de 25–28 px, etiquetas de 16–17 px y botones habituales de al menos 44 px. Guía de atajos compacta de 16 px, con cada combinación sobre blanco y borde suave, siguiendo el estilo de Buscar F2; sin franja verde. Teclas de 16 px y ayudas de cierre de 17 px, con texto oscuro. Cada tecla y su acción permanecen juntas al ajustar líneas. Las ayudas de edición y búsqueda usan 18 px. El historial y los detalles de ventas también aumentan su lectura a 16–18 px; no se aplica zoom global a otras tareas ni al ticket impreso. Errores de lectura persistentes y con resolución explícita.

Validación: 66 pruebas automatizadas y circuito en Chrome a 1366 × 768 y 390 × 844 (`tests/cashier.browser.cjs`); venta mixta, carrito largo, correcciones sin mouse, PLU, fallo de guardado, reimpresión simulada y PDF. Hardware físico pendiente. Se conserva la identidad, tipografía del sistema y paleta existentes.

Se conserva la identidad y navegación del espacio de trabajo. `stock-ui.js` incorpora los flujos específicos sobre las vistas existentes; `stock-core.js` concentra medidas, conversiones y reglas de stock.

- Venta por peso: diálogo enfocado en gramos, equivalencia y subtotal; edición de peso desde carrito. Lotes y revisión de etiqueta sólo aparecen cuando corresponden.
- Productos: distingue stock físico/disponible, con filtros de vencimientos y acciones de recepción/recuento. Campos de proveedor/reposición permanecen plegados.
- Recepciones: cantidad y costo por presentación con equivalencia visible; vencimiento condicional. Recuento muestra pendientes sin precargar cero y diferencias antes de cierre.
- Pedidos: reposición seleccionable y editable; cantidades con medidas/presentaciones en pantalla, PDF e impresión.
- Opciones: configuración de etiquetas y copia/restauración, accesibles también en móvil desde la cabecera.

Revisión acotada en Chrome a 1366 × 768 y 390 × 844: navegación y circuito mixto completados, sin errores JavaScript ni desbordamiento horizontal de página. Las tablas mantienen desplazamiento interno. La verificación física de balanza, lector e impresora continúa pendiente.
