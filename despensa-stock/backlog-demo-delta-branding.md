# Backlog Demo — Delta Branding · Despensa el Trébol

**Documento:** Historias de usuario **Ready** que **actualizan branding** (nombre visible · label nav **Depósito** · look sin emojis)  
**Estado global:** **Ready** (Emiliano vía Emi - PO · Producto OK)  
**Audiencia:** Diseño ∥ Frontend · handoff Producto  
**Idioma UI:** Español rioplatense (vos) — LOCKED  
**Nombre:** **Despensa el Trébol** — supersede decisión A (antes “Mi Despensa” / “Mi Despensa Demo”)  
**Tech demo:** **Next + seed + localStorage** (sin BD/backend) — LOCKED  
**Multi-usuario:** fuera — LOCKED  

**Changelog:** Delta **branding** over **01–12**. **DS-DEMO-01…12 no se invalidan**. Este delta **supersede** la decisión de nombre de producto **A** (visible UI/copy: **Despensa el Trébol** en lugar de “Mi Despensa” / “Mi Despensa Demo”); fija label de nav/pantalla de catálogo stock = **Depósito** (reemplaza “Productos” / “Stock” en copy UI; ruta técnica `/productos` puede permanecer — Por definir FE); y alinea el look a **sin emojis** / visual seria y sencilla (con **DS-DEMO-12** look serio). Clave técnica `mi-despensa-demo-v2` y paths/identifiers **no** cambian.  
**Fuente UX previa:** `UI-handoff.md` (branding strings) · `backlog-demo-paso0.md` (decisión A) · `backlog-demo-delta-home.md` (12 look serio). **AC base a extender (no contradecir):** 01–12 funcionales.

**Nota Producto (siguiente delta — no Ready en este archivo):** reportes **D/S/M** + **top productos** + precios (unitario / multi % / todos %) = **siguiente delta después** de cerrar path **Home 11/12 + Diseño GO**. No mezclar con DS-DEMO-13/14.

---

## 1. Intro

### Product Goal (delta)
Que la demo se llame y se vea como **Despensa el Trébol** en **toda** la UI y copy demo (sidebar, topbar, títulos, toasts/confirm si aplica, README/PRD references de nombre de producto); que el módulo de catálogo/stock se llame **Depósito** en nav y pantalla (Inicio · Vender · **Depósito** · Avisos · Reportes); y que el visual sea **más serio y sencillo**: **sin emojis** en chrome/nav/empty states/toasts, alineado al look serio de **DS-DEMO-12**, sin densificar — sigue elderly-friendly, listo para feedback WhatsApp.

### Relación con 01…12

| Historia | Estado | Relación con este delta |
|----------|--------|-------------------------|
| **DS-DEMO-01…04** | Válidas | Smoke Paso 0; branding visible se actualiza; no se invalidan. |
| **DS-DEMO-05…10** | Válidas | Shell CRM-light / POS; branding + label **Depósito** (nav/05 + pantalla/06) → **13**; chrome sin emoji → **14**. |
| **DS-DEMO-11…12** | Válidas | Home operativo + look serio; **14** alinea “sin emojis / serio sencillo” con **12**; **13** nombre + nav Depósito en Home/chrome. |
| **Decisión A** | **Superseded** (nombre) | Visible product name = **Despensa el Trébol**. Clave ls `mi-despensa-demo-v2` **intacta**. |

### Orden sugerido (13 → 14)
1. **DS-DEMO-13** — Nombre **Despensa el Trébol** + label nav/pantalla **Depósito**  
2. **DS-DEMO-14** — Sin emojis; visual más seria y sencilla (NFR UX, con 12)

**HOLD Alejo (Frontend):** coordinar con Diseño GO de **11/12** si aún no hay GO; branding strings (**13**) pueden ir en paralelo a tokens si no dependen de layout Home. **14** preferible junto al pass tipográfico **12**.

### Product rules LOCKED (aplicar a todas)
**Despensa el Trébol** · nav **Inicio · Vender · Depósito · Avisos · Reportes** · Next+seed+localStorage **sin BD** · ES-AR **vos** · usuario mayor · **poco tipeo** · **stock 0 = bloquear** · reporte **hoy** · **7d = MVP** · **Reiniciar demo** · **sin** multi-usuario · **sin** AFIP / CRUD denso / CRM pleno / hardware real (código + simular OK) · **sin emojis** en UI chrome (14).

### Fuera de alcance global (DEMO) — todas las historias
- Cambiar clave `mi-despensa-demo-v2` / renombrar identifiers técnicos (ruta `/productos` puede quedarse)  
- Reportes D/S/M · top productos · precios (unitario / multi % / todos %) → **siguiente delta** post Home 11/12 + Diseño GO  
- CRM completo / módulos densos / dashboards  
- Edición densa de productos · AFIP · BD/backend · multi-usuario · hardware real  
- Rediseño total de IA de módulos (solo branding + sobriedad visual)

### Sizing
**Pendiente de Developers** en todas las historias.

---

## 2. Historias

---

### DS-DEMO-13 — Nombre Despensa el Trébol + label nav/pantalla Depósito

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-13 |
| **Épica** | Demo delta — Branding nombre + nav |
| **Orden** | 1 de 2 (delta Branding) |
| **Estado** | **Ready** |
| **Prioridad** | Alta (nombre de producto + label Depósito en feedback WhatsApp) |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | **Supersede** decisión A (nombre). Refina labels de nav **DS-DEMO-05** y pantalla **DS-DEMO-06** (copy UI “Productos”/“Stock” → **Depósito**). Aplica a shell **05**, Home **11**, pantallas 06–10, toasts/confirm si muestran nombre, docs de producto. **No** cambia `mi-despensa-demo-v2`. Ruta técnica `/productos` **puede** permanecer (Por definir FE). **No invalida 01–12**. |

#### Como / Quiero / Para
**Como** dueño de despensa (y como Producto en feedback WhatsApp),  
**quiero** ver el nombre **Despensa el Trébol** en toda la UI/copy demo y el módulo de catálogo/stock como **Depósito** (no “Productos” / “Stock” en nav),  
**para** reconocer la despensa real del cliente y encontrar el depósito con un label claro y serio.

#### Descripción
**Branding de nombre + label de módulo** (copy-facing):

1. **UI chrome marca** — sidebar, topbar, títulos de app / eyebrow donde hoy diga “Mi Despensa” o “Mi Despensa Demo” → **Despensa el Trébol**.  
2. **Nav 5 + pantalla** — ítems: **Inicio · Vender · Depósito · Avisos · Reportes**. Label y título de pantalla del catálogo/stock = **Depósito** (reemplaza “Productos” / “Stock” en UI copy de 05–12 y deltas).  
3. **Ruta técnica** — puede seguir **`/productos`** si hace falta; **Por definir con FE**. Lo locked es el **texto visible** = Depósito.  
4. **Copy / feedback** — toasts, confirmaciones, empty states **si** mencionan el nombre del producto o el módulo.  
5. **Docs de producto** — README / PRD / handoff / backlogs: nombre de producto + label nav **Depósito** (no paths, no claves técnicas).  
6. **Técnico intacto** — `localStorage` key **`mi-despensa-demo-v2`**, identifiers de código; ruta `/productos` opcional intacta.

No invalida funcionalidad 01–12; solo branding + labels visibles. **DS-DEMO-06** sigue válida (RO + typeahead); su label visible pasa a Depósito vía este PBI.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Strings sobre shell/pantallas existentes |
| Negotiable | Sí | Mark/logo; path `/productos` vs rename |
| Valuable | Sí | Branding cliente + nav clara |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Pass de strings + docs |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Sidebar / desktop branding**  
- **Given** viewport **≥768px** con shell cargada,  
- **When** miro el branding de la sidebar,  
- **Then** el nombre visible es **Despensa el Trébol** (no “Mi Despensa” ni “Mi Despensa Demo”).

**AC2 — Topbar / mobile branding**  
- **Given** viewport **&lt;768px**,  
- **When** miro topbar / eyebrow de marca,  
- **Then** el nombre visible es **Despensa el Trébol**.

**AC3 — Nav 5 con label Depósito**  
- **Given** shell **DS-DEMO-05** (sidebar o bottom nav),  
- **When** miro los 5 ítems,  
- **Then** veo exactamente: **Inicio · Vender · Depósito · Avisos · Reportes** — **no** “Productos” ni “Stock” como label de nav.

**AC4 — Pantalla Depósito (ex Productos / 06)**  
- **Given** que navego al módulo de catálogo/stock (historia **DS-DEMO-06**),  
- **When** miro el título de pantalla / chrome de esa vista,  
- **Then** el texto visible es **Depósito** (no “Productos” / “Stock”). Comportamiento RO + typeahead de **06** se mantiene.

**AC5 — Títulos / chrome de marca en pantallas**  
- **Given** Inicio · Vender · Depósito · Avisos · Reportes (y Home operativo si **11**),  
- **When** hay título o label de producto/app,  
- **Then** usa **Despensa el Trébol** donde antes era el brand “Mi Despensa”.

**AC6 — Toasts / confirm si aplica**  
- **Given** flujos con toast o confirmación que mencionen el nombre del producto,  
- **When** se disparan,  
- **Then** el copy usa **Despensa el Trébol** (si el nombre aparece); copy genérico sin nombre no obliga a insertarlo.

**AC7 — Docs de producto (nombre + Depósito)**  
- **Given** README / PRD / UI-handoff / backlogs demo,  
- **When** se habla del **nombre de producto** / branding UI / nav 5,  
- **Then** figura **Despensa el Trébol** y nav **Depósito**; paths y clave `mi-despensa-demo-v2` **permanecen**.

**AC8 — Técnico: ls key + ruta**  
- **Given** persistencia y routing,  
- **When** busco la clave ls e identifiers,  
- **Then** `mi-despensa-demo-v2` **no** se cambia. Ruta **`/productos`** puede permanecer (Por definir FE); lo verificado en UI es el label **Depósito**.

**AC9 — No invalida 01–12; supersede A + labels 05/06**  
- **Given** backlogs 01–12 y decisión A histórica,  
- **When** se implementa esta historia,  
- **Then** 01–12 **siguen válidas**; nombre visible A queda **superseded** por **Despensa el Trébol**; copy UI “Productos”/“Stock” de nav/pantalla queda **superseded** por **Depósito** (05/06 no se marcan inválidas).

**AC10 — Sin CRM/CRUD/AFIP/BD / siguiente delta precios-reportes**  
- **Given** este delta de branding,  
- **When** busco reportes D/S/M, top productos o precios multi-%,  
- **Then** **no** están en este PBI (siguiente delta post Home GO).

#### Fuera de alcance
Renombrar ls key · obligar rename de ruta `/productos` · logo final de marca (mark puede ser placeholder Diseño) · precios/reportes D/S/M/top · rediseño de módulos · cambiar comportamiento RO de 06.

#### Definition of Done (DoD)
- AC1–AC10 verificados en preview/demo + docs listados.  
- Grep UI: sin “Mi Despensa” / “Mi Despensa Demo” en copy de marca; nav sin label “Productos”/“Stock” (usar **Depósito**).  
- `mi-despensa-demo-v2` intacta; `/productos` OK si FE lo deja.  
- Nota PR: “supersede decisión A + label Depósito; no invalida 01–12”.  
- Sizing Developers pendiente documentado.

#### Checklist usabilidad UI (usuario mayor)
- [ ] Nombre legible en sidebar y topbar  
- [ ] Nav: Depósito comprensible (catálogo/stock)  
- [ ] Título de pantalla Depósito alineado al nav  
- [ ] Contraste alto en branding  
- [ ] Confirm/toasts claros si mencionan marca  
- [ ] Sin jerga técnica en UI  

#### Por definir
- Mark / isotipo exacto (trébol) — **Diseño**.  
- Title tag / favicon text — alineado a **Despensa el Trébol**.  
- Ruta Next: mantener `/productos` vs `/deposito` — **FE** (label visible locked = Depósito).

#### Notas
- Emiliano: nombre UI **Despensa el Trébol** (no Mi Despensa) — LOCKED.  
- Emiliano: label nav/pantalla **Depósito** (no Productos/Stock) — LOCKED.  
- “Mi Despensa Demo” también se reemplaza donde sea copy de producto.  
- Sustantivo “productos” en copy de dominio (p. ej. “Buscar producto…”, seed de productos) puede permanecer; el **módulo** se llama Depósito.

---

### DS-DEMO-14 — Sin emojis; visual más seria y sencilla

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-14 |
| **Épica** | Demo delta — Branding NFR visual |
| **Orden** | 2 de 2 (delta Branding) |
| **Estado** | **Ready** |
| **Prioridad** | Alta (NFR; alinea con DS-DEMO-12) |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | Alinea con **DS-DEMO-12** (look serio). Aplica a UI chrome, nav, empty states, toasts; iconografía/ilustración si existe. Coordina con Diseño GO **12**. **No invalida 01–13**. |

#### Como / Quiero / Para
**Como** dueño de despensa (y como Producto en feedback WhatsApp),  
**quiero** una UI **sin emojis**, más **seria y sencilla**,  
**para** que la demo se sienta profesional y sobria, sin perder claridad ni facilidad para usuario mayor.

#### Descripción
**NFR visual / copy chrome** (con **12**):

- **Sin emojis** en: UI chrome, nav (sidebar/bottom), empty states, toasts, confirmaciones, badges ornamentales de “juguete”.  
- **Ilustración / icon style** — si hay iconos o ilustraciones, estilo **sobrio** (line/filled simple; no comic stickers).  
- **Sigue elderly-friendly** — targets ≥56px, contraste alto, poco tipeo, **no** densificar ni achicar hit areas.  
- No es rediseño de IA; es sobriedad de cromo + ausencia de emoji.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Ideal con pass **12** |
| Negotiable | Sí | Set de iconos con Diseño |
| Valuable | Sí | Seriedad percibida |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Pass visual + strings |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Sin emoji en UI chrome / nav**  
- **Given** shell (sidebar / bottom nav / topbar),  
- **When** reviso labels e iconos de navegación,  
- **Then** **no** hay emojis; iconos (si hay) son sobrios.

**AC2 — Sin emoji en empty states**  
- **Given** estados vacíos (sin ventas, sin avisos a reponer, etc.),  
- **When** se muestran,  
- **Then** copy ES-AR (vos) **sin** emoji; tono amable pero serio.

**AC3 — Sin emoji en toasts / confirms**  
- **Given** toast de venta OK, confirm Reiniciar demo, errores de stock,  
- **When** se disparan,  
- **Then** mensajes **sin** emoji.

**AC4 — Ilustración / icon style sober**  
- **Given** cualquier ilustración o set de iconos en la demo,  
- **When** Diseño/FE los aplican,  
- **Then** el estilo es **sobrio** (no stickers/comic); coherente con look serio **12**.

**AC5 — Elderly-friendly, no dense**  
- **Given** el pass “sin emoji / serio”,  
- **When** uso la demo,  
- **Then** sigue fácil para mayor: targets **≥56px**, contraste alto, sin densificar CRM, tipografía legible (escala **12** si GO).

**AC6 — Alineación con DS-DEMO-12**  
- **Given** NFR look serio **12**,  
- **When** se implementa **14**,  
- **Then** no contradice **12**; refuerza sobriedad (emoji off + iconos serios).

**AC7 — Sin rediseño total / sin siguiente delta**  
- **Given** este PBI,  
- **When** busco rediseño de módulos, precios multi-% o reportes D/S/M,  
- **Then** **fuera** de este delta.

#### Fuera de alcance
Rediseño total · dark mode · mascotas/ilustraciones ornamentales · reportes D/S/M/top/precios · cambiar tokens de color locked sin Diseño.

#### Definition of Done (DoD)
- AC1–AC7 verificados en preview/demo.  
- Checklist: cero emoji en chrome/nav/empty/toasts.  
- Coherente con **12** (Diseño GO tipográfico si aplica).  
- No invalida 01–13.  
- Sizing Developers pendiente.

#### Checklist usabilidad UI (usuario mayor)
- [ ] Nav comprensible sin emoji  
- [ ] Empty states claros en texto  
- [ ] Toasts legibles sin “ruido” visual  
- [ ] Iconos sobrios reconocibles  
- [ ] Targets ≥56px mantenidos  
- [ ] No se siente app densa  

#### Por definir (Diseño owns)
- Icon set exacto (line vs filled).  
- Si algún empty state usa ilustración mínima o solo tipografía.

#### Notas
- Emiliano: sin emojis; visual seria + sencilla — LOCKED.  
- Complementa **12**; no lo reemplaza.

---

## 3. Cierre — Dependencias, handoff y éxito

### Mapa de dependencias (delta Branding → previo)

```
Decisión A (nombre) ──supersede──► DS-DEMO-13 (Despensa el Trébol)
DS-DEMO-05 (nav Productos) ──label──► Depósito (13)
DS-DEMO-06 (pantalla Productos) ──label──► Depósito (13); 06 RO válida
DS-DEMO-05 (shell branding) ──strings──► 13
DS-DEMO-01…12 (válidas) ──copy/chrome──► 13 + 14
DS-DEMO-12 (look serio) ──alinea──► DS-DEMO-14 (sin emoji / sobrio)
UI-handoff branding/nav strings ──update──► 13 (+ nota handoff)
```

| Delta | Depende de / relación |
|-------|------------------------|
| **13** | Supersede A; label **Depósito** (05/06); strings shell/pantallas/docs; ls key intacta; `/productos` Por definir FE; no invalida 01–12 |
| **14** | Alinea **12**; chrome/nav/empty/toasts sin emoji; elderly-friendly |

**Confirmación:** DS-DEMO-01…12 **permanecen válidos**. Este documento es **delta branding**; no los marca Done/Obsolete.

### Handoff Diseño ∥ Frontend

| Quién | Pedido |
|-------|--------|
| **Diseño** | Branding **Despensa el Trébol** (mark si aplica) + nav/pantalla **Depósito** + pass sin emoji / iconos sobrios; alinear con GO **12**. Actualizar handoff strings. |
| **Frontend (Alejo)** | Aplicar strings **13** (marca + **Depósito**) + quitar emojis **14**; **no** tocar `mi-despensa-demo-v2`; ruta `/productos` OK si se decide. Coordinar con HOLD **11/12** si layout aún no GO. |
| **Producto / PO (Emi)** | Delta branding **Emiliano OK**; siguiente delta = precios + reportes D/S/M + top **después** Home 11/12 + Diseño GO. |
| **Developers** | Sizing DS-DEMO-13…14. |

### Métrica de éxito (delta)
Nombre visible **Despensa el Trébol** · nav **Depósito** · docs alineados · **sin emojis** en chrome/nav/empty/toasts · look **serio/sencillo** · `mi-despensa-demo-v2` intacta · **01…12 no invalidados** · feedback WhatsApp.

### Fuera de alcance (recordatorio)
**Renombrar ls key · forzar rename `/productos` · CRM pleno · CRUD · AFIP · BD · D/S/M + top + precios (siguiente delta) · multi-usuario · hardware real · app nativa.**

### Preguntas abiertas (no bloquean Ready)
1. Mark/isotipo trébol exacto (Diseño).  
2. Title/favicon copy.  
3. Ruta `/productos` vs `/deposito` (FE; label = Depósito).  
4. Sizing Developers 13…14.  
5. Timing FE de **13** vs HOLD **11/12** (strings pueden adelantarse).

---

*Backlog Demo Delta Branding — DS-DEMO-13…14 · Estado: **Ready** · Supersede nombre A → **Despensa el Trébol** · nav/pantalla **Depósito** · sin emojis · **01…12 no se invalidan** · Siguiente delta: reportes D/S/M + top + precios post Home GO · Sizing: pendiente Developers · Alineado a UI-handoff.md + backlog-demo-paso0.md + deltas CRM-light/Home · Emiliano vía Emi - PO.*
