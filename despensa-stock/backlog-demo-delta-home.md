# Backlog Demo — Delta Home UX · Despensa el Trébol

**Documento:** Historias de usuario **Ready** que **refinan** Home / Inicio (pantalla de trabajo + look serio)  
**Estado global:** **Ready** (Emiliano vía Emi - PO · Producto OK)  
**Audiencia:** Diseño ∥ Frontend · handoff Producto  
**Idioma UI:** Español rioplatense (vos) — LOCKED  
**Nombre:** **Despensa el Trébol** — LOCKED (supersede decisión A vía DS-DEMO-13)  
**Tech demo:** **Next + seed + localStorage** (sin BD/backend) — LOCKED  
**Multi-usuario:** fuera — LOCKED

**Changelog:** Refina **Home / Inicio**. **DS-DEMO-01…10 no se invalidan**. Este delta cambia el Inicio de “resumen + atajos” (DS-DEMO-05 AC4 / UI-handoff §4.1) a **pantalla principal de trabajo** (vender embebido + stock bajo + mini-reporte visibles de un vistazo). **DS-DEMO-05 atajos-only es insuficiente** para este delta (sigue válida como shell 5 ítems + Reiniciar; el AC de Inicio se **refina** aquí). **DS-DEMO-07** sigue válida para **`/vender` POS full**. **DS-DEMO-09 / 10** siguen válidas como pantallas propias; Home **muestra** stock bajo y mini-reporte del día **sin** exigir navegar a Avisos/Reportes para esos tres trabajos.  
**Fuente UX previa:** `UI-handoff.md` (Inicio actual = summary+shortcuts — este delta lo cambia). **AC base a extender (no contradecir):** `backlog-demo-paso0.md` (01), `backlog-demo-delta-crm-light.md` (05 Inicio / 07 / 09 / 10).

---

## 1. Intro

### Product Goal (delta)
Que **Inicio** sea la **pantalla principal de trabajo** de la demo **Despensa el Trébol**: de un vistazo (y **sin** abrir otra sección para los tres trabajos) el dueño pueda **vender**, ver **stock bajo / a reponer**, y ver el **mini-reporte del día** (# ventas + $ / vacío). Look más **serio**, tipografía un poco **más chica** (sigue legible para mayor; sin comic/oversize), sin densificar ni CRM pleno — listo para feedback WhatsApp.

### Relación con 01…10

| Historia | Estado | Relación con este delta |
|----------|--------|-------------------------|
| **DS-DEMO-01** | Válida | Shell + seed. Home de 01 se **refina** como pantalla de trabajo (11); tipografía shell (12). |
| **DS-DEMO-02…04** | Válidas | Comportamiento venta/stock/avisos+reporte se mantiene; Home reusa patrones, no los reemplaza. |
| **DS-DEMO-05** | Válida · **refinada** | Shell nav 5 ítems + Reiniciar **siguen**. AC4 Inicio “resumen + atajos” es **insuficiente** para este delta → **11** redefine Inicio como trabajo; atajos a `/vender` · `/avisos` · `/reportes` quedan **opcionales** (deep-links), no obligatorios para vender / ver stock bajo / ver mini-reporte. |
| **DS-DEMO-06** | Válida | Depósito RO intacta (label UI vía DS-DEMO-13). |
| **DS-DEMO-07** | Válida | POS split en **`/vender`** intacto. Home puede **reusar** patrón 07 (embebido o zona venta mínima); no invalida 07. |
| **DS-DEMO-08** | Válida | Fuente de verdad `mi-despensa-demo-v2` (`products`, `sales`). |
| **DS-DEMO-09** | Válida | Pantalla **Avisos** propia. Home muestra lista/alertas stock bajo **visible**; 09 sigue como deep-link / detalle. |
| **DS-DEMO-10** | Válida | Pantalla **Reportes hoy** propia. Home muestra **mini-reporte** visible **sin** botón “abrir reporte” para ver #/$ del día; 10 sigue como deep-link / detalle. |

### Orden sugerido (11 → 12)
1. **DS-DEMO-11** — Home como pantalla de trabajo (vender embebido + stock bajo + mini-reporte visibles) — FE + Diseño layout  
2. **DS-DEMO-12** — Look serio + tipografía demo (NFR UX) — **Diseño owns tokens**; FE aplica; shell/Home

**HOLD Alejo (Frontend):** no implementar este delta hasta **Diseño GO** (tokens tipográficos + layout Home operativo).

### Product rules LOCKED (aplicar a todas)
Despensa el Trébol · Next+seed+localStorage **sin BD** · ES-AR **vos** · usuario mayor · **poco tipeo** · **stock 0 = bloquear** · reporte **hoy** · **7d = MVP** · **Reiniciar demo** · **sin** multi-usuario · **sin** AFIP / CRUD denso / CRM pleno / hardware real (código + simular OK).

### Fuera de alcance global (DEMO) — todas las historias
- CRM completo / módulos densos / dashboards  
- Edición densa de productos (forms/steppers) → MVP  
- Reportes 7d / gráficos densos → MVP  
- AFIP / facturación · multi-usuario · hardware real (cámara/WebUSB)  
- BD/backend · auth · CRUD productivo  
- Rediseño total de módulos Vender/Depósito/Avisos/Reportes (solo Home + tokens shell)  
- Exigir navegar a `/vender` · `/avisos` · `/reportes` para los **tres trabajos** del Home

### Sizing
**Pendiente de Developers** en todas las historias.

---

## 2. Historias

---

### DS-DEMO-11 — Home como pantalla de trabajo (vender + stock bajo + mini-reporte)

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-11 |
| **Épica** | Demo delta — Home operativo |
| **Orden** | 1 de 2 (delta Home) |
| **Estado** | **Ready** |
| **Prioridad** | Alta (cambia el job-to-be-done de Inicio) |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | **Refina DS-DEMO-05** Inicio (AC4 atajos-only insuficiente). Extiende intención de **DS-DEMO-01** (home clara). Reusa comportamiento de **DS-DEMO-02/03/07** para venta (stock on confirm). Datos: **DS-DEMO-08**. Toca qué de **09/10** se ve en Home (lista a reponer + mini-reporte) **sin invalidar** 09/10. Diseño: layout Home operativo (GO antes de FE). |

#### Como / Quiero / Para
**Como** dueño de despensa (persona mayor),  
**quiero** que **Inicio** sea mi **pantalla principal de trabajo**: poder **vender desde el Home**, ver **stock bajo** y el **mini-reporte del día** **sin** abrir otra sección,  
**para** operar de un vistazo con info clara y detallada, sin menú vacío de solo atajos.

#### Descripción
**Home operativo** (refina Inicio de DS-DEMO-05 / UI-handoff §4.1):

1. **Vender desde el Home** — zona de venta visible / POS embebida (puede reusar patrón **DS-DEMO-07**: typeahead · código+Enter · simular · carrito ± · Confirmar) **o** zona venta mínima equivalente (typeahead/código/carrito). **Sin** obligación de ir a `/vender` para completar una venta. `/vender` (07) permanece como ruta full POS opcional.  
2. **Stock bajo visible** — lista/alertas **a reponer** (`stock <= umbral`) **en el Home**, sin tocar botón para “abrir Avisos”. Deep-link a **09** opcional.  
3. **Mini-reporte del día visible** — **# ventas + $** (o empty amable tipo `Sin ventas todavía`) **en el Home**, **sin** botón cuyo único propósito sea “abrir reporte” para ver esos números. Deep-link a **10** opcional.  

Info **clara y detallada** de un vistazo (jerarquía visual: venta + alertas + resumen del día). **Reiniciar demo** discreto se mantiene (05 AC5). Nav 5 ítems (05) se mantiene; rutas Vender/Depósito/Avisos/Reportes = **deep-links opcionales**, no prerequisito de los tres jobs.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Refina 05; reusa 07/08/09/10 |
| Negotiable | Sí | Embebido full vs zona mínima; layout con Diseño |
| Valuable | Sí | Home deja de ser menú vacío |
| Estimable | Sí | Pendiente Developers |
| Small | Parcial | Un Home con 3 zonas; aceptable demo |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Home = pantalla de trabajo (no menú vacío)**  
- **Given** que abro la demo y estoy en **Inicio**,  
- **When** miro la pantalla sin navegar a otro módulo,  
- **Then** veo de un vistazo (visibles en viewport principal / scroll corto razonable): **zona de venta**, **stock bajo / a reponer**, y **mini-reporte del día** — no solo resumen + atajos grandes.

**AC2 — Vender desde Home sin abrir otra sección**  
- **Given** que estoy en **Inicio** con seed cargado y productos con stock > 0,  
- **When** agrego producto(s) desde la zona de venta del Home (typeahead y/o código+Enter y/o simular, según patrón acordado con Diseño) y confirmo la venta,  
- **Then** la venta se registra, el stock baja (reglas **DS-DEMO-03** / **07**), recibo feedback claro (toast), y **no** fue necesario abrir `/vender` ni otro ítem de nav para completar el flujo.

**AC3 — Stock 0 / insuficiente bloquea (deps 03/07)**  
- **Given** un producto con stock 0 o insuficiente respecto al carrito del Home,  
- **When** intento agregarlo o confirmar,  
- **Then** la UI **bloquea** con mensaje claro (vos); **no** hay stock negativo.

**AC4 — Stock bajo visible sin botón**  
- **Given** uno o más productos con `stock <= umbral` (seed low-stock o post-venta),  
- **When** estoy en **Inicio**,  
- **Then** veo lista/alertas de **a reponer** (nombre + stock; umbral visible o simple) **sin** tener que tocar un botón “Avisos” / “Ver avisos” para descubrirlos. Empty amable si no hay bajo umbral (alineado a 09: p. ej. `Todo bien, no hay que reponer`).

**AC5 — Mini-reporte del día visible sin abrir Reportes**  
- **Given** cero o más ventas confirmadas **hoy**,  
- **When** estoy en **Inicio**,  
- **Then** veo **# ventas** y **total $** (formato es-AR) **o** empty `Sin ventas todavía` / equivalente, **visibles** en el Home — **sin** un botón cuyo fin sea abrir Reportes solo para ver ese mini-resumen. (Deep-link opcional a **10** no reemplaza la visibilidad en Home.)

**AC6 — Info clara y detallada de un vistazo**  
- **Given** Inicio con datos de sesión,  
- **When** miro la pantalla,  
- **Then** la jerarquía permite entender: qué puedo vender ahora, qué hay que reponer, y cómo va el día — tipografía legible (targets táctiles de nav/CTA **≥56px** se mantienen vía shell / **12**), contraste alto, sin densificar tipo CRM pleno.

**AC7 — Deep-links opcionales; nav 5 intacta**  
- **Given** shell **DS-DEMO-05**,  
- **When** uso nav o atajos opcionales a Vender / Depósito / Avisos / Reportes,  
- **Then** esas rutas siguen disponibles; **pero** los tres jobs (vender, ver stock bajo, ver mini-reporte) **no** las requieren. **Reiniciar demo** sigue disponible desde Inicio (05 AC5 / 08).

**AC8 — Relación con 05 / 07 / 09 / 10 (no invalidar)**  
- **Given** el backlog previo,  
- **When** se implementa esta historia,  
- **Then**:  
  - **05** permanece válida (nav 5 + Reiniciar); su Inicio atajos-only se **refina** por estos AC.  
  - **07** permanece válida para `/vender` full POS.  
  - **09** y **10** permanecen válidas como pantallas propias; Home **superficie** lista a reponer + mini-reporte.  
  - **01…10** **no** se marcan inválidas.

**AC9 — Sin CRM pleno / CRUD / AFIP / BD / 7d**  
- **Given** el Home operativo,  
- **When** busco CRM denso, edición de productos, AFIP, backend o reportes 7d,  
- **Then** **no** existen en este delta.

#### Fuera de alcance
CRM pleno · CRUD · AFIP · BD/backend · reportes 7d/gráficos · rediseño total de módulos · exigir `/vender`/`/avisos`/`/reportes` para los tres jobs · hardware real.

#### Definition of Done (DoD)
- AC1–AC9 verificados en preview/demo.  
- Comportamiento stock **03/07** respetado en venta desde Home.  
- Copy ES-AR (vos); empty states amables.  
- Nota en ticket/PR: “refina 05 Inicio; no invalida 01…10; 07 sigue para /vender”.  
- **HOLD:** FE no arranca hasta Diseño GO (layout + paridad con **12**).  
- Sizing Developers pendiente documentado.

#### Checklist usabilidad UI (usuario mayor)
- [ ] Tres zonas (venta · stock bajo · mini-reporte) comprensibles sin ayuda  
- [ ] Vender desde Home con poco tipeo  
- [ ] Stock bajo visible sin cazar un botón  
- [ ] Mini-reporte #/$ (o vacío) visible sin abrir Reportes  
- [ ] Targets nav/CTA ≥56px  
- [ ] Contraste alto; sin densificar  
- [ ] Reiniciar demo discreto pero alcanzable  
- [ ] Sin jerga CRM  

#### Por definir
- Layout exacto de las 3 zonas (stack mobile vs paneles desktop) — **Diseño**.  
- POS embebido full (patrón 07) vs zona venta mínima — **Diseño + Producto**; ambos OK si cumplen AC2–AC3.  
- Cuántas filas de “a reponer” en Home antes de “ver más” opcional (deep-link 09) — **Diseño**.  
- Si el carrito del Home es el mismo state que `/vender` o independiente (demo: preferible coherencia de sesión; **Por definir** FE).

#### Notas
- Emiliano: vender **sin** tener que abrir otra sección — LOCKED en AC2.  
- UI-handoff §4.1 (summary+shortcuts) queda **superseded en intención** por este delta para Inicio; handoff tokens/colores siguen hasta **12**.  
- Seed low-stock (Coca-Cola, Aceite, Café, Mayonesa) facilita demo de AC4 sin ventas previas.

---

### DS-DEMO-12 — Look serio + tipografía demo (NFR UX)

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-12 |
| **Épica** | Demo delta — NFR tipografía / look |
| **Orden** | 2 de 2 (delta Home) |
| **Estado** | **Ready** |
| **Prioridad** | Alta (NFR; Diseño owns) |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | Aplica a **shell + Home** (y de preferencia resto de demo para coherencia). Intención tipográfica locked; **tokens exactos = Por definir con Diseño**. Coordina con layout **DS-DEMO-11**. No invalida handoff de color/targets; **ajusta tipografía** un escalón vs UI-handoff actual. |

#### Como / Quiero / Para
**Como** dueño de despensa (y como Producto en feedback WhatsApp),  
**quiero** que la demo se vea más **seria** y con tipografía un poco **más chica** (sin perder legibilidad para mayor),  
**para** que no parezca UI “comic / oversize” y siga siendo fácil de usar.

#### Descripción
**NFR de usabilidad / look** sobre shell y Home (extensible al resto de pantallas demo):

- **Look más serio** — CRM-light sobrio; menos “juguete”; sin comic, sin oversize ornamental.  
- **Tipografía un escalón abajo** vs handoff actual (**UI-handoff §3**: base **≥18px**, títulos **28–32** / 700–800) → sugerir bajar **un escalón** (p. ej. base ~16–17px; títulos ~24–28) **sin** perder:  
  - legibilidad para usuario mayor,  
  - targets táctiles **≥56px** en nav / CTA,  
  - CTA Confirmar hero ~72px (handoff) salvo que Diseño proponga equivalente medible.  
- **Tokens exactos (px/rem, weights, line-height):** **Por definir con Diseño** — la **intención** está locked en estos AC.  
- **Diseño owns** la escala; Frontend **aplica** tras GO. No densificar UI ni rediseñar módulos enteros.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Aplica sobre shell/Home; ideal junto a 11 |
| Negotiable | Sí | Escala exacta con Diseño |
| Valuable | Sí | Percepción seriedad + legibilidad |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Tokens + pass tipográfico |
| Testable | Sí | AC G/W/T + rangos |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Intención look serio (LOCKED)**  
- **Given** la demo en Inicio / shell,  
- **When** se compara visualmente con el handoff/prototipo “oversize”,  
- **Then** el look es más **serio / sobrio** (CRM-light), sin tipografía comic ni títulos ornamentalmente enormes; sigue simple para mayor.

**AC2 — Tipografía un escalón menor (intención locked; px Por definir)**  
- **Given** tokens actuales del handoff (base ≥18px; títulos 28–32),  
- **When** Diseño publica la escala demo de este delta,  
- **Then** la base y títulos bajan **un escalón** respecto a ese handoff, documentados como tokens (exactos **Por definir con Diseño**), y el texto de cuerpo/labels permanece **legible** para usuario mayor a distancia de uso típica (móvil/tablet).

**AC3 — Targets táctiles no se sacrifican**  
- **Given** nav (sidebar / bottom) y CTAs primarios,  
- **When** mido hit areas,  
- **Then** nav/CTA cumplen **≥56px** min-height (handoff); Confirmar venta / CTA hero de venta en Home mantienen área generosa (~72px o equivalente Diseño). Bajar tipografía **no** reduce el target táctil por debajo de esos mínimos.

**AC4 — Medible vs handoff (NFR)**  
- **Given** checklist QA,  
- **When** reviso tipografía,  
- **Then** existe referencia documentada:  
  - Handoff previo: base ≥18 · títulos 28–32.  
  - Delta: “un escalón abajo” + tabla de tokens Diseño (placeholder hasta GO).  
  - Rangos sugeridos de trabajo (no locked px): base **~16–17px**; títulos **~24–28px**; line-height cómodo; weights 600–700 en títulos (evitar 800 si aporta look “grueso/comic”).  
  - Exactos: **Por definir con Diseño**.

**AC5 — Alcance shell / Home; coherencia**  
- **Given** **DS-DEMO-11** Home operativo + shell **05**,  
- **When** aplico este NFR,  
- **Then** Inicio y shell reflejan la nueva escala; se recomienda aplicar la misma escala al resto de rutas demo para no romper coherencia (no exige rediseño de IA de módulos).

**AC6 — Sin densificar / sin rediseño total**  
- **Given** el pass tipográfico,  
- **When** busco CRM pleno, tablas densas o rediseño completo de Depósito/Avisos/Reportes,  
- **Then** están **fuera**; solo look + tipo (+ layout Home en **11**).

**AC7 — HOLD FE hasta Diseño GO**  
- **Given** este NFR Ready,  
- **When** Alejo planifica implementación,  
- **Then** **HOLD** hasta que Diseño marque **GO** (tokens + maqueta Home). Implementar tipografía inventada sin GO = fuera de DoD.

#### Fuera de alcance
Rediseño total de módulos · CRM pleno · cambiar colores locked sin Diseño · bajar targets &lt;56px · comic/display fonts · dark mode.

#### Definition of Done (DoD)
- AC1–AC7 verificados tras Diseño GO.  
- Tabla de tokens tipográficos publicada (Diseño) y aplicada (FE).  
- Checklist UX mayores OK (legible + serio + targets).  
- No invalida 01…11 funcionales.  
- Sizing Developers pendiente.

#### Checklist usabilidad UI (usuario mayor)
- [ ] Texto cuerpo legible (no “chiquito de app densa”)  
- [ ] Títulos serios, no oversize comic  
- [ ] Nav labels legibles con target ≥56px  
- [ ] Contraste alto mantenido  
- [ ] Home (11) no se siente apretada tras bajar tipo  
- [ ] Diseño GO documentado antes de merge FE  

#### Por definir (Diseño owns)
- px/rem exactos: base, sm, md, lg, title, display (si aplica).  
- Weight / line-height / letter-spacing.  
- Si bottom-nav labels bajan de ~12px handoff o se compensan solo con icono.  
- Pass de color: **sin cambio** salvo que Diseño proponga ajuste menor de contraste (no bloquea Ready).

#### Notas
- Split FE/Diseño: **12 = Diseño tokens + GO**; FE aplica. **11 = layout/comportamiento Home** con dependencia de GO visual.  
- Intención Producto/Emiliano locked; números exactos no se inventan en backlog.

---

## 3. Cierre — Dependencias, handoff y éxito

### Mapa de dependencias (delta Home → previo)

```
DS-DEMO-01 (shell+seed) ──refina home──► DS-DEMO-11 (Home trabajo)
DS-DEMO-05 (nav 5 + Inicio atajos) ──refina Inicio──► DS-DEMO-11
                 │
DS-DEMO-07 (/vender POS) ──patrón reuso──► zona venta Home (11)
DS-DEMO-08 (ls v2) ──datos──► 11
DS-DEMO-09 (Avisos) ──superficie en Home──► lista stock bajo (11); 09 válida
DS-DEMO-10 (Reportes) ──superficie en Home──► mini-reporte (11); 10 válida
                 │
UI-handoff tipo ──escalón abajo──► DS-DEMO-12 (NFR) ──GO──► FE aplica + 11 layout
```

| Delta | Depende de / relación |
|-------|------------------------|
| **11** | Refina **05** Inicio; extiende **01**; reusa **02/03/07**; datos **08**; superficie de **09/10** en Home |
| **12** | Tokens Diseño (GO); aplica shell/Home (+ coherencia resto); coordina con **11** |

**Confirmación:** DS-DEMO-01…10 **permanecen válidos**. Este documento **refina Home**; no los reemplaza ni los marca Done/Obsolete. **05** atajos-only **insuficiente** para el job de este delta (AC Inicio superseded en intención por **11**). **07** sigue para `/vender` full.

### Handoff Diseño ∥ Frontend

| Quién | Pedido |
|-------|--------|
| **Diseño** | **GO** requerido: layout Home operativo (3 zonas) + escala tipográfica seria (un escalón vs handoff). Owns tokens exactos (**12**). |
| **Frontend (Alejo)** | **HOLD** hasta Diseño GO. Luego: **11** Home trabajo + aplicar tokens **12**. No invalidar 01…10. `/vender` 07 intacto. |
| **Producto / PO (Emi)** | Delta Home **Emiliano OK**; tres jobs en Home sin navegar de más; look serio. |
| **Developers** | Sizing DS-DEMO-11…12. |

### Métrica de éxito (delta)
Inicio = **pantalla de trabajo** · vender **desde Home** · stock bajo **visible** · mini-reporte **#/$ visible** · look **serio** + tipo **un escalón menor** · sin CRM/CRUD/AFIP/BD/7d · **01…10 no invalidados** · feedback WhatsApp.

### Fuera de alcance (recordatorio)
**CRM pleno · CRUD · AFIP · backend/BD · 7d/gráficos · rediseño total módulos · multi-usuario · hardware real · app nativa.**

### Preguntas abiertas (no bloquean Ready)
1. POS embebido full vs zona venta mínima en Home.  
2. Carrito Home compartido con `/vender` vs state separado.  
3. Tokens tipográficos exactos (Diseño).  
4. Sizing Developers 11…12.  
5. Cuántas filas “a reponer” en Home antes de deep-link a 09.

---

*Backlog Demo Delta Home UX — DS-DEMO-11…12 · Estado: **Ready** · Refina Home / 05 Inicio · **01…10 no se invalidan** · 07 válida para /vender · Alejo **HOLD** hasta Diseño GO · Sizing: pendiente Developers · Alineado a UI-handoff.md + backlog-demo-paso0.md + backlog-demo-delta-crm-light.md · Emiliano vía Emi - PO.*
