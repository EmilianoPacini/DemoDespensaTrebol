# QA static notes — DS-DEMO-05…10

**Date:** 2026-09-12  
**Sources:** `/workspace/despensa-stock/ui-demo` (+ UI-handoff) · deploy `https://temporary-fast-squall-blvsbzo.vercel.app` (curl + JS chunks; no browser)  
**Discarded:** `temporary-nimble-tungsten-c2wi9vb.vercel.app` (superseded)

---

## 1) Local source (`ui-demo/`)

| Item | Value |
|------|--------|
| **localStorage key** | `mi-despensa-demo-v2` (`STORAGE_KEY` in `app.js`) |
| **Seed count** | **12** products |
| **Shape** | `{ id, nombre, precio, stock, umbral, codigo }` — all `umbral: 5`, all have `codigo` |
| **Sample** | `p1` · Leche La Serenísima 1L · `codigo: "7790895001234"` · stock 12 · umbral 5 |
| **Nav (5)** | Inicio · Vender · Depósito · Avisos · Reportes |
| **“Routes”** | SPA views via `data-nav` / `showView`: `home`, `sell`, `products`, `alerts`, `reports` (no URL paths) |
| **v1 key in source** | Not used |

AC copy present in source: `Reiniciar demo`, `Simular escaneo`, `Código no encontrado`, `Todo bien, no hay que reponer`, `Todavía no hubo ventas hoy`, `Las ventas van a aparecer acá`, `Sin ventas todavía`.

---

## 2) Deployed Next app (fast-squall)

**Nav / routes (HTML + chunks):** exactly 5 — no extras  

| Label | Route |
|-------|--------|
| Inicio | `/` |
| Vender | `/vender` |
| Productos | `/productos` |
| Avisos | `/avisos` |
| Reportes | `/reportes` |

**Persistencia (chunk `42b2wb22p9ln7.js`):**

- Write/read key: **`mi-despensa-demo-v2`**
- `mi-despensa-demo-v1` appears only as **`localStorage.removeItem(d)`** on empty v2 load / reset — migration cleanup, not active storage
- Seed embedded: **12** products, all `umbral:5`, 12 barcode strings `77908950…` matching handoff/`ui-demo` (e.g. p1 `7790895001234`)

### AC string scan (downloaded HTML/JS)

| String | In deploy JS? | Notes |
|--------|---------------|--------|
| `mi-despensa-demo-v2` | **Yes** | Active key |
| `Reiniciar demo` | **Yes** | Home chunk; confirm modal title `¿Reiniciar la demo?` + message `Se vuelve al stock inicial.` |
| `Simular escaneo` | **Yes** | Label rendered as `📷 Simular escaneo` |
| `Código no encontrado` | **Yes** | Toast on scan miss |
| `Todo bien, no hay que reponer` | **Yes** | Avisos empty |
| `Todavía no hubo ventas` / `…hoy` | **Yes** | Reportes empty: `Todavía no hubo ventas hoy` |
| Nav labels (5) | **Yes** | Sidebar + bottom nav |

---

## 3) Gaps / diffs vs AC · handoff · ui-demo

1. **Old v1 key:** referenced in deploy for cleanup only — **not a functional gap**; document so QA doesn’t flag the string as “still on v1”.
2. **Missing vs ui-demo / handoff Reportes empty helper:** `Las ventas van a aparecer acá` — **not found** in deploy chunks (Reportes only shows `Todavía no hubo ventas hoy`).
3. **Home empty wording variant:** deploy uses **`Hoy: sin ventas todavía`** (lowercase “sin”); handoff/ui-demo use standalone **`Sin ventas todavía`**. Same intent; exact-string AC may fail.
4. **No extra nav** — aligned to 5 modules.
5. **Seed codes** on this deploy **aligned to handoff** (12 × `77908950…`); use this URL, not nimble-tungsten.

---

## 4) Quick QA pointers (DS-DEMO-05…10)

- **05 nav:** 5 items / routes above.  
- **06 Inicio:** resumen + Reiniciar + confirm modal.  
- **07–08:** POS / Depósito / Avisos / Reportes copy mostly present; watch Reportes secondary empty line.  
- **08 persist:** assert `localStorage['mi-despensa-demo-v2']` with `products[].codigo`; v1 may be absent after first load.  
- **09–10:** Simular escaneo + `Código no encontrado` in bundle; seed barcodes usable for wedge tests.
