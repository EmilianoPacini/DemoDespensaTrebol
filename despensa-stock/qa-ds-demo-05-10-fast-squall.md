# QA DS-DEMO-05…10 — preview fast-squall

**Verdict: FAIL** (3 gaps vs AC Ready)  
**URL:** https://temporary-fast-squall-blvsbzo.vercel.app  
**Date:** 2026-09-12  
**Fuente AC:** `backlog-demo-delta-crm-light.md` (01…04 siguen válidos)

## Resumen

Nav 5, Productos RO, POS split, ls `mi-despensa-demo-v2` + `codigo`, Avisos y persist/reset **andan**. No-go por **Reportes sin #+$**, copy empty del carrito, y topbar mobile incompleta.

## Matriz

| Historia | Resultado | Notas |
|---|---|---|
| DS-DEMO-05 | FAIL AC2 | AC1/3–6 PASS. Mobile: bottom nav 5 OK; branding "MI DESPENSA" existe chico bajo el título, no topbar dedicada. |
| DS-DEMO-06 | PASS | 12 cards RO, typeahead, "Poco stock", stock post-venta. |
| DS-DEMO-07 | FAIL AC5 | Split/código/simular/confirmar PASS. Empty carrito: `Todavía no agregaste productos` ≠ `Vacío · tocá un producto`. |
| DS-DEMO-08 | PASS | clave v2, 12 con codigo, persist + Reiniciar. |
| DS-DEMO-09 | PASS | Pantalla propia, lista a reponer, empty, update post-venta. |
| DS-DEMO-10 | FAIL AC2 | Pantalla propia, empty, sin 7d. Con ventas: lista de líneas **sin** resumen prominente `N ventas · $X`. |
| DS-DEMO-01…04 | valor OK / 04 gap | Avisos+reporte existen; 04 pide #+$ hoy — mismo gap que 10 AC2. |

## Gaps (arreglar)

1. **P1 Reportes** — DS-DEMO-10 AC2 / DS-DEMO-04: agregar `# ventas` y `total $` es-AR grandes (además de la lista). Empty: falta helper `Las ventas van a aparecer acá` (solo `Todavía no hubo ventas hoy`).
2. **P2 Carrito empty** — DS-DEMO-07 AC5: copy `Vacío · tocá un producto`.
3. **P3 Mobile topbar** — DS-DEMO-05 AC2: topbar con branding + título (hoy título + kicker chico).

## Residual (no FAIL)

- Inicio empty: `Hoy: sin ventas todavía` vs handoff `Sin ventas todavía` (misma intención).
- AC mobile 07 stack+sticky: PASS en el click-through.
- Sin CRM/CRUD/AFIP/7d — OK.
