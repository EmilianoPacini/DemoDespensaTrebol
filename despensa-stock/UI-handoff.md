# UI Handoff — Despensa el Trébol (Demo)

**Para:** Alejo (Frontend) · **De:** Diseño (UX/UI) · dirección Emiliano vía Emi - PO  
**Stack propuesto:** Next.js App Router + seed + `localStorage` · **sin BD / sin backend**  
**Prototipo clickeable:** `/workspace/despensa-stock/ui-demo/` (`index.html`)  
**Nota:** Alejo itera sobre este handoff + prototipo HTML.

**Diseño GO (DS-DEMO-11 + DS-DEMO-12):** layout Home operativo + tokens tipográficos publicados abajo. Branding visible: **Despensa el Trébol**. Nav: Inicio · Vender · **Depósito** · Avisos · Reportes. **Cero emojis** en UI.

---

## 0. Decisiones PO + dirección Emiliano

| ID | Decisión | Detalle |
|----|----------|---------|
| **A** | Nombre UI | **Despensa el Trébol** (branding visible en toda la app; reemplaza “Mi Despensa”) |
| **B** | Demo técnica | **Next.js + seed + localStorage** · **sin base de datos** · sin API |
| **C** | Multi-usuario | **Fuera de alcance** |
| **D** | Idioma / tono | **ES-AR** · trato de **vos** · copy mínimo · **sin emojis** |
| **E** | Look | **CRM-light** sobrio + POS · tipografía un escalón ↓ (DS-DEMO-12) · simple para usuario mayor · **sin densificar** · **sin comic/oversize** |
| **F** | Foco | Shell 5 ítems + **Home operativo** (vender + stock bajo + mini-reporte) + `/vender` POS full. Depósito = lista/cards RO. Avisos y Reportes = vistas simples. |

Persistencia: clave `mi-despensa-demo-v2` (interna; no cambia branding UI).

**MVP / post-demo (no implementar ahora):** CRM pleno, edición de productos, dashboards, reportes 7d, módulos densos.

---

## 1. Shell CRM-light

### Desktop / tablet (≥768px)
- **Sidebar fija izquierda** con mark **DT** + nombre **Despensa el Trébol**.
- Ítems (misma IA en todos los breakpoints):
  1. **Inicio**
  2. **Vender**
  3. **Depósito**
  4. **Avisos**
  5. **Reportes**
- Iconos nav: **letras tipográficas** (I · V · D · A · R) — **cero emojis**.

### Mobile (<768px)
- **Bottom nav** con los mismos 5 ítems · targets **≥56px** · labels ~11–12px.
- Branding en topbar (eyebrow + título de pantalla).

### Principios
- Pocos ítems · tipografía legible (base 16px) · contraste alto · look serio.
- Tokens color: verde `#1F7A4C`, bg `#F7F5F2`, texto `#1A1A1A`.

---

## 2. Journey demo (WhatsApp → feedback)

```
Cliente recibe link
  → Abre (móvil o tablet)
  → Inicio = pantalla de trabajo:
       mini-reporte hoy · venta embebida · a reponer
  → Vende desde Home (typeahead / código+Enter / Simular · carrito · Confirmar)
       sin navegar a otra sección
  → Stock bajo y #/$ del día visibles en Home
  → Opcional: /vender full POS · Depósito · Avisos · Reportes (deep-links)
  → Feedback por WhatsApp
```

**Éxito:** en Inicio sin navegar se vende, se ve stock bajo y mini-reporte · nav 5 · `/vender` intacto · cero emojis · branding Despensa el Trébol.

---

## 3. Design tokens

### Colores

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg` | `#F7F5F2` | Fondo app |
| `--surface` | `#FFFFFF` | Cards, sidebar, inputs |
| `--text` | `#1A1A1A` | Texto principal |
| `--text-muted` | `#5C5C5C` | Subtítulos, placeholders |
| `--primary` | `#1F7A4C` | CTA · nav activo · toast |
| `--primary-pressed` | `#165A38` | Pressed |
| `--primary-soft` | `#E8F5EE` | Nav activo bg · empty OK |
| `--alert` | `#C45C26` | Poco stock |
| `--alert-bg` | `#FFF3E8` | Badge |
| `--border` | `#E5E1DB` | Bordes |

### Tipografía — DS-DEMO-12 (LOCKED · Diseño GO)

**Handoff previo (superseded):** base ≥18px · títulos 28–32 / 800.  
**Delta:** un escalón ↓ · look serio · sin comic/oversize.

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-base` | **16px** | Cuerpo / app |
| `--font-sm` | 13px | Eyebrows, hints |
| `--font-md` / `--font-subtitle` | **15–16px** | Subtítulos muted |
| `--font-lg` | 16px | Labels body |
| `--font-title` | **24px** | Títulos pantalla (mobile) |
| `--font-title-lg` | **26px** | Títulos ≥768px |
| `--weight-title` | **700** | Títulos (evitar 800) |
| `--weight-strong` | 600 | Nav / énfasis |
| `--lh` | 1.45 | Cuerpo |
| `--lh-tight` | 1.25 | Títulos |
| Font stack | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | |

**Nav labels:** sidebar **~16px**; bottom **11–12px**.  
**Inputs:** 16px · min-height **56px**.  
**CTA body buttons:** ≥56px · Confirmar hero **~72px** (NO reducir).

Aplicar la misma escala a **toda** la demo (coherencia).

### Spacing & radii
- Padding contenido ~18–24px · `--radius` 16px · `--radius-sm` 12px  
- Sombra: `0 2px 12px rgba(26,26,26,0.08)`  
- Sidebar ~232–248px · bottom nav min-height ~72px + safe-area

### Targets

| Tipo | min-height | Notas |
|------|------------|-------|
| Nav item (sidebar / bottom) | **≥56px** | Touch friendly |
| CTA Confirmar / hero venta | **72px** | Home + /vender — no reducir |
| Resultado lista / qty ± | **48–56px** | |
| Input buscar / código | **56px** | |

---

## 4. Pantallas / módulos

### 4.1 Inicio — Home operativo (DS-DEMO-11) — SUPERSEDE summary+shortcuts

**Refina DS-DEMO-05 AC4** (atajos-only insuficiente). Tres zonas **visibles sin clicks** a otras secciones:

1. **Venta embebida** — patrón POS DS-DEMO-07: typeahead · código+Enter · Simular · carrito ± · Confirmar/Vaciar.  
   - Carrito Home = **mismo state** `cart` que `/vender`.  
   - No obliga ir a `/vender` para completar una venta.
2. **Stock bajo / A reponer** — lista nombre+stock; empty `Todo bien, no hay que reponer`.  
   - Máx **4** ítems ordenados por stock; si hay más → link `Ver todos` → view alerts.
3. **Mini-reporte hoy** — # ventas · $ o `Sin ventas todavía`.  
   - **NO** botón cuyo único fin sea abrir Reportes.

**Layout (Diseño GO):**
- **Desktop ≥768:** grid — zona venta (~2/3 izq.) · columna der.: mini-reporte (card) + a reponer (card).
- **Mobile:** stack — mini-reporte compacto arriba · venta · a reponer.

**Reiniciar demo** discreto se mantiene.  
Nav 5 intacta. Deep-links opcionales a Avisos/Reportes OK; no requeridos para los 3 jobs.  
`/vender` full POS sigue existiendo (DS-DEMO-07 válida).

### 4.2 Vender (POS) — DS-DEMO-07 · ruta full

**Izquierda:** escáner (código + Enter) · Simular escaneo · typeahead.  
**Derecha:** carrito · +/− · total · Confirmar · Vaciar.  
**Mobile:** stack + sticky Confirmar sobre bottom nav.  
Mismo `cart` que Home.

### 4.3 Depósito (ex-Productos)

- Cards/filas: **nombre**, **precio**, **stock**, **umbral**, badge **Poco stock** si `stock <= umbral`.
- Typeahead: `Buscar en depósito…`
- **Sin edición** en demo (RO). Edición = MVP.
- Nav label y título de pantalla: **Depósito**.

### 4.4 Avisos
- Lista **A reponer** · prioridad por stock más bajo.
- Empty: `Todo bien, no hay que reponer`.

### 4.5 Reportes
- Solo **hoy**: # ventas · $ · lista corta.
- Sin gráficos · sin 7d (MVP).

---

## 5. Copy (ES-AR · vos · mínimo · sin emojis)

### Branding
- Nombre visible: `Despensa el Trébol`
- Mark sidebar: `DT`

### Nav (5)
- `Inicio` · `Vender` · `Depósito` · `Avisos` · `Reportes`

### Inicio (Home operativo)
- Mini-reporte vacío: `Sin ventas todavía`
- Mini-reporte: `3 ventas · $4.850`
- Zona venta: mismos copy que Vender
- A reponer empty: `Todo bien, no hay que reponer`
- Link: `Ver todos`
- `Reiniciar demo` · confirm: `¿Reiniciar la demo? Se vuelve al stock inicial.`

### Vender / venta Home
- Placeholder buscar: `Buscar producto…`
- Placeholder código: `Código o Enter…`
- `Simular escaneo`
- Carrito vacío: `Vacío · tocá un producto`
- `Confirmar venta` · `Vaciar`
- Toast +1: `+1 [nombre]` (texto; sin emoji)
- Toast OK: `Listo · N ítems · $…`
- `Código no encontrado` · `Sin stock de este producto` · `Stock insuficiente`
- Empty filtro: `No hay coincidencias`
- Sin stock global: `No queda stock. Reiniciá la demo.`

### Depósito
- `Buscar en depósito…` · `Poco stock` · `Umbral N` · `No hay coincidencias`

### Avisos / Reportes
- `A reponer` · empty: `Todo bien, no hay que reponer` · `N u.`
- `Hoy` · empty: `Todavía no hubo ventas hoy` · `Las ventas van a aparecer acá`

---

## 6. Spec escáner (wedge)

| Spec | Valor |
|------|-------|
| Hardware | Lector USB wedge (teclado) |
| UI | Input dedicado; foco al entrar a `/vender` |
| Flujo | Código + **Enter** → lookup `codigo` → `addToCart(1)` |
| Demo | **Simular escaneo** = random con stock disponible |
| Error | Toast `Código no encontrado` |
| Home | Mismo flujo en zona venta embebida |

---

## 7. Persistencia & seed

- Clave: **`mi-despensa-demo-v2`**
- Shape: `{ products, sales }`
- Producto: `{ id, nombre, precio, stock, umbral, codigo }`
- Sale: `{ id, nombre, precio, cant, at }`
- Umbral demo: **5**
- **Sin BD.**

Low stock seed: Coca-Cola (4), Aceite (3), Café (2), Mayonesa (5).  
Carrito: **solo en memoria** · compartido Home ↔ `/vender`.

---

## 8. Estados

| Estado | Comportamiento |
|--------|----------------|
| Empty typeahead | `No hay coincidencias` |
| Empty avisos / Home a reponer | `Todo bien, no hay que reponer` |
| Empty ventas | Home / Reportes: `Sin ventas todavía` / equivalente |
| Add al carrito | +1 si stock − cant_en_carrito > 0 |
| Confirmar | Stock −cant · sales · toast · carrito vacío · refresca Home |
| Código inválido | Toast `Código no encontrado` |
| Home a reponer >4 | Link `Ver todos` → Avisos |
| Reinicio | Seed + limpia ventas + carrito |

---

## 9. Notas para Alejo (Next App Router) — GO Diseño

**GO Alejo — implementar DS-DEMO-11 + DS-DEMO-12:**

1. Branding UI **Despensa el Trébol** (title, sidebar, topbar). Cero “Mi Despensa” visible.
2. Nav 5: Inicio · Vender · **Depósito** · Avisos · Reportes. Iconos = letras I/V/D/A/R (sin emojis).
3. **Home operativo:** 3 zonas visibles (venta embebida + a reponer máx 4 + mini-reporte). Layout grid ≥768 / stack mobile.
4. Carrito **mismo state** Home y `/vender`.
5. Tipografía tokens §3 aplicados a toda la demo. Targets nav/CTA ≥56px; Confirmar **72px**.
6. `/vender` POS full **sigue** (07 válida). Depósito RO. Sin CRM/CRUD/7d/AFIP/BD.
7. Paridad con `ui-demo/` (fuente de verdad).
8. Persistencia `mi-despensa-demo-v2` · ES-AR vos · toast `aria-live`.
9. **Refina 05** Inicio (atajos-only superseded); **no invalida** 01…10; 07 válida para `/vender`.

Rutas sugeridas: `/` · `/vender` · `/deposito` · `/avisos` · `/reportes`.

---

## 10. Fuera de alcance

- Edición / CRUD productos → **MVP**
- CRM pleno / módulos densos → **MVP**
- Reportes 7d / gráficos → **MVP**
- Auth / multi-usuario · AFIP · BD/backend · app nativa
- Emojis en UI · comic/oversize fonts · dark mode
- Exigir navegar a `/vender`/`/avisos`/`/reportes` para los 3 jobs del Home

---

## 11. Checklist aceptación

### Base (01…10)
- [x] Shell 5 módulos (sidebar + bottom) · branding Despensa el Trébol · sin emojis
- [x] Depósito: cards + typeahead RO
- [x] Vender split full · escáner · Simular
- [x] Avisos / Reportes simples · persistencia v2

### DS-DEMO-11 — Home operativo
- [x] Tres zonas visibles en Inicio sin navegar
- [x] Vender desde Home (typeahead · código · Simular · carrito · Confirmar)
- [x] Stock 0/insuficiente bloquea
- [x] A reponer visible (máx 4 + Ver todos) · empty amable
- [x] Mini-reporte #/$ o `Sin ventas todavía` visible sin botón “abrir Reportes”
- [x] Carrito compartido con `/vender`
- [x] Reiniciar demo · nav 5 intacta · `/vender` existe
- [x] Sin CRM/CRUD/7d

### DS-DEMO-12 — Tipografía / look serio
- [x] Base **16px** · títulos **24–26 / 700** · subtítulos ~15–16 muted
- [x] Nav sidebar ~16px · bottom ~11–12px
- [x] Targets ≥56px · Confirmar hero ~72px sin reducir
- [x] Escala aplicada a toda la demo · look CRM-light sobrio

### DS-DEMO-13 — Branding Despensa el Trébol + Depósito
- [x] Nombre visible **Despensa el Trébol** (sidebar · topbar · title)
- [x] Nav/pantalla catálogo = **Depósito** (no Productos/Stock)
- [x] Nav 5: Inicio · Vender · Depósito · Avisos · Reportes
- [x] Clave `mi-despensa-demo-v2` intacta · ruta técnica `/productos` OK
- [x] Sin precios/reportes D/S/M en este handoff

### DS-DEMO-14 — Sin emojis · visual seria
- [x] Cero emojis en chrome/nav/empty/toasts
- [x] Iconos nav = letras tipográficas I/V/D/A/R (sobrios)
- [x] Alineado a look serio **12** · targets ≥56px

---

## 12. Relación backlog

| Historia | Estado en handoff |
|----------|-------------------|
| **DS-DEMO-05** | Válida · **refinada**: nav 5 + Reiniciar OK; Inicio atajos-only **superseded** por §4.1 |
| **DS-DEMO-07** | **Válida** — `/vender` POS full |
| **DS-DEMO-09 / 10** | Válidas — pantallas propias; Home las superficie |
| **DS-DEMO-11** | **GO** — Home trabajo implementado en `ui-demo` |
| **DS-DEMO-12** | **GO** — tokens §3 publicados y aplicados |
| **DS-DEMO-13** | **GO** — Despensa el Trébol + Depósito (supersede nombre A) |
| **DS-DEMO-14** | **GO** — cero emojis · chrome sobrio (alinea 12) |

---

*Diseño GO — DS-DEMO-11…14 · Despensa el Trébol · Depósito · cero emojis · tipografía seria · Home operativo · listo para Alejo (Frontend).*
