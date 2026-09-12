# PRD corto — Despensa el Trébol

**Estado:** Demo Paso 0 en curso · Decisiones A–D **LOCKED** · Dirección UX **CRM-light + POS** (iteración shell) · Montironi en pausa  
**Cliente:** dueño de despensa pequeña, persona mayor, poca tech  
**Canal demo:** link por WhatsApp para feedback  

**Goal (1 frase):** Que el dueño pruebe en minutos (sin hardware) vender y ver stock/avisos, y después opere solo alta de productos, venta y reposición sin llamar al desarrollador.

---

## 1. Problema
No hay control de stock: no sabe cuánto queda ni cuándo reponer. Ventas y existencias no están sincronizadas.

## 2. Usuarios
- **Primario:** dueño/operador de despensa (mayor, UX ultra simple).
- **MVP:** un solo operador (sin multi-usuario).

## 3. Dirección de producto — CRM-light + POS (nota UX)

Emiliano pide sentir **caja/POS + escáner** y un **CRM liviano**, **sin perder simpleza**.

| Capa | Qué significa | Demo Paso 0 | MVP |
|------|---------------|-------------|-----|
| **POS / escáner** | Shell de venta rápida: lista, filtro, escaneo (simulado → wedge) | **Sí** — foco actual; Diseño/Alejo iteran shell | Sí + lector USB |
| **Stock** | Entrada/salida coherente con la venta | Baja al vender + avisos hoy | CRUD stock + umbrales + reportes |
| **CRM-light** | Datos mínimos de “quién compra” / historial liviano — **no** CRM enterprise | **Fuera o stub visual** si no suma a feedback stock/venta | **Por definir** alcance exacto (ver abiertas) |

**Regla de oro:** cada pantalla nueva del shell POS/CRM debe pasar el test del dueño mayor (botones grandes, ≤3 pasos, poco tipeo). Si compite con la simpleza, se corta o se posterga.

Diseño + Alejo iteran la **shell** bajo esta dirección; el backlog Ready (DS-DEMO-01…04) sigue siendo el piso funcional de la demo.

## 4. Objetivos: Demo (Paso 0) vs MVP

| | **Paso 0 — Demo** (ahora) | **MVP v1** (post-feedback) |
|--|---------------------------|----------------------------|
| **Objetivo** | Feedback rápido por link WhatsApp | Operación diaria real |
| **Shell** | POS-like simple (venta + productos + avisos) | POS + CRM-light (alcance TBD) |
| **Depósito** (catálogo) | Seed ya cargado (12 ítems AR) | CRUD mega-configurable |
| **Venta** | Lista + **filtro por tipeo** + escaneo simulado | Venta rápida + lector USB wedge |
| **Stock** | Baja al vender; stock 0 = no vende | Ingresos/ajustes + decremento atómico |
| **Avisos / reportes** | Avisos + **reporte hoy** (# ventas + $) | Umbrales config + D/S/M |
| **Datos** | Solo frontend: seed + localStorage | Persistencia real |
| **Éxito** | Entiende el flujo y da feedback | Opera solo sin llamar al dev |

## 5. Alcance / fuera de alcance

**Demo incluye:** shell POS simple, productos seed, venta rápida, stock que baja, avisos + reporte de hoy, reiniciar demo.

**MVP incluye:** CRUD + attrs, stock in/out, venta + barcode, sync stock, avisos, reportes D/S/M, **CRM-light** (detalle TBD).

**Fuera (inicial):** AFIP, e-commerce/delivery, app nativa del lector, contabilidad full, multi-sucursal, multi-usuario, CRM pesado (campañas, pipeline, scoring).

## 6. Principio UX (no negociable) — LOCKED

- Curva mínima: botones grandes, pocos pasos, copy ES-AR (vos), usuario mayor.
- **Poco tipeo:** selectores / taps; escribir **solo para filtrar**; no formularios largos.
- **Venta rápida (demo y MVP):** lista + filtro; el escáner resuelve el producto solo.
- Demo: seed precargado; interactiva; sin backend/BD.

## 7. Decisiones PO — LOCKED

| # | Tema | Decisión |
|---|------|----------|
| A | Nombre | **Despensa el Trébol** |
| B | Tech demo | **Next + seed + localStorage** (sin BD / sin backend) |
| C | Multi-usuario MVP | **Fuera** — un operador |
| D | Idioma | **ES-AR** (vos) |

### Reglas demo
- Stock 0 → **bloquear** · Reporte → **hoy** · Reset → **Reiniciar demo** · Seed → **12** AR

## 8. Abiertas (CRM-light — no inventar)

1. ¿CRM-light en MVP = solo ficha cliente (nombre + tel) atada a venta opcional, o también historial de compras por cliente?  
2. ¿En la demo hace falta **alguna** pantalla CRM, o solo reforzar look&feel POS en la shell actual?  
3. ¿Cliente “mostrador / sin registrar” es el default de cada venta?

**Propuesta Producto (pendiente OK):** demo = **solo shell POS** (sin CRM); MVP = cliente opcional en venta (nombre/tel) + historial simple — nada de campañas.

## 9. Épicas / artefactos
- Demo: shell + seed · venta rápida · stock · avisos/reporte hoy  
- MVP: datos · CRUD · stock · venta+wedge · avisos · reportes · **CRM-light**  
- `BRIEF.md` · `backlog-demo-paso0.md` (Ready) · `UI-handoff.md` + `ui-demo/` · PRD este archivo  

---
*PRD — A–D + venta rápida LOCKED · nota CRM-light + POS agregada (Emiliano vía Emi - PO).*


## 10. Delta demo CRM-light (LOCKED — Emiliano vía Emi - PO)
Emiliano OK: ampliar Paso 0 con CRM-light/POS. **Proceso:** Tomi Ready → Diseño confirma handoff≡historias → Alejo port. Sin skip.
Alcance tentativo a narrar en PBIs: nav ~5 ítems; Vender split (buscar/código/carrito); Reportes; seed v2+barcode. Sin CRM pleno ni CRUD denso. DS-DEMO-01…04 siguen siendo el piso ya smokeado.


## 11. Delta Home operativo (LOCKED — Emiliano vía Emi - PO)
Home con vender + stock bajo + mini-reporte del día visibles; tipografía más seria/menor (sigue legible). Proceso: Tomi Ready → Diseño → Alejo. FE HOLD hasta Ready. Demo temp actual queda hasta este delta.


## 12. Branding + precios/reportes (LOCKED — Emiliano vía Emi - PO)
- **Nombre:** Despensa el Trébol · nav/pantalla **Depósito** (ex Productos) · sin emojis · serio+simple.
- Nav 5: Inicio · Vender · **Depósito** · Avisos · Reportes (ruta `/productos` Por definir FE).
- **Precios + reportes D/S/M + top productos:** delta demo **post-Home** (localStorage). No mezclar con DS-DEMO-11/12 hasta Home GO.
- Home 11/12 sigue primero (Tomi Ready → Diseño → FE).


## 13. Cola deltas (LOCKED)
1. Cerrar Home+branding 11–14 + gaps Yanko
2. Deshacer venta + historial + confirmaciones
3. Precios rápidos + reportes: dimensiones **stock (u) y $**; filtros **botón** día/semana/mes + top; UX mayor simple
