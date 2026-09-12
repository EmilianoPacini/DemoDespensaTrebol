# Backlog Demo — Delta CRM-light / POS · Despensa el Trébol

**Documento:** Historias de usuario **Ready** que **amplían** Paso 0 (CRM-light shell + POS split + pantallas separadas)  
**Estado global:** **Ready** (Emiliano OK · Producto)  
**Audiencia:** Diseño ∥ Frontend · handoff Producto  
**Idioma UI:** Español rioplatense (vos) — LOCKED  
**Nombre:** **Despensa el Trébol** — LOCKED (supersede decisión A vía DS-DEMO-13)  
**Tech demo:** **Next + seed + localStorage** (sin BD/backend) — LOCKED  
**Multi-usuario:** fuera — LOCKED  

**Changelog:** Amplía Paso 0 con delta CRM-light / POS. **DS-DEMO-01…04 no se invalidan** (siguen válidos como smoke PASS). Este backlog **refina y extiende** (nav 5 ítems, POS split, Depósito (ex Productos) read-only explícito, Avisos|Reportes en pantallas propias, persistencia `mi-despensa-demo-v2` + `codigo`).  
**Fuente UX:** `UI-handoff.md`. **AC base a extender (no contradecir):** `backlog-demo-paso0.md`.

---

## 1. Intro

### Product Goal (delta)
Que la demo **Despensa el Trébol** se sienta como un **CRM-light de stock + caja/POS**, sin densificar: shell con **5 módulos**, **Vender** en layout split (buscar/código/simular | carrito), **Depósito** solo lectura, **Avisos** y **Reportes hoy** en pantallas propias, seed v2 con **código de barras**, todo con **poco tipeo**, tipografía grande y targets ≥56px — listo para feedback WhatsApp.

### Relación con Paso 0 (01…04)

| Historia Paso 0 | Estado | Relación con este delta |
|-----------------|--------|-------------------------|
| **DS-DEMO-01** | Smoke PASS · **válida** | Shell mínima + catálogo seed. **05** y **06** refinan nav 5 ítems e Inicio/Depósito sin contradecir AC de 01. |
| **DS-DEMO-02** | Smoke PASS · **válida** | Venta rápida lista+filtro+simular. **07** amplía a POS split (typeahead \| código+Enter \| carrito ±). |
| **DS-DEMO-03** | Smoke PASS · **válida** | Stock baja / stock 0 bloquea. **07** **depende** de ese comportamiento al confirmar. |
| **DS-DEMO-04** | Smoke PASS · **válida** | Avisos + reporte hoy (pueden ser una pantalla). **09** y **10** **refinan DS-DEMO-04 en pantallas separadas**; el valor de 04 (avisos + reporte existen) se mantiene. |

### Orden sugerido (5 → 10)
1. **DS-DEMO-05** — Shell nav CRM-light (5 ítems) + Inicio atajos  
2. **DS-DEMO-08** — Persistencia ls v2 + seed con `codigo` *(puede ir en paralelo / temprano)*  
3. **DS-DEMO-06** — Depósito read-only + typeahead *(label UI; ruta `/productos` Por definir FE)*  
4. **DS-DEMO-07** — Vender POS split  
5. **DS-DEMO-09** — Avisos pantalla propia (refina 04)  
6. **DS-DEMO-10** — Reportes hoy pantalla propia (refina 04)

### Product rules LOCKED (aplicar a todas)
Despensa el Trébol · Next+seed+localStorage **sin BD** · ES-AR **vos** · usuario mayor · **poco tipeo** · **stock 0 = bloquear** · reporte **hoy** · **7d = MVP** · **Reiniciar demo** · **sin** multi-usuario · **sin** AFIP / CRUD denso / CRM pleno / hardware real (código + simular OK).

### Fuera de alcance global (DEMO) — todas las historias
- CRM completo / módulos densos / dashboards  
- Edición densa de productos (forms/steppers) → MVP  
- Reportes 7d / gráficos densos → MVP  
- AFIP / facturación · multi-usuario · hardware real (cámara/WebUSB)  
- BD/backend · auth · CRUD productivo  

### Sizing
**Pendiente de Developers** en todas las historias.

---

## 2. Historias

---

### DS-DEMO-05 — Shell nav CRM-light (5 ítems) + Inicio atajos

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-05 |
| **Épica** | Demo delta — Shell CRM-light |
| **Orden** | 1 de 6 (delta) |
| **Estado** | **Ready** |
| **Prioridad** | Alta (estructura de navegación) |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | Extiende shell de **DS-DEMO-01** (no la invalida). Diseño: UI-handoff §1 Shell + §4.1 Inicio. |

#### Como / Quiero / Para
**Como** dueño de despensa (persona mayor),  
**quiero** una navegación clara con **cinco módulos** (Inicio · Vender · Depósito · Avisos · Reportes) y una **Inicio** con resumen del día + atajos grandes,  
**para** llegar en pocos toques a vender o ver avisos, sin un CRM complicado.

#### Descripción
Shell **CRM-light mínima** (no CRM completo ni edición densa):

- **≥768px:** sidebar fija izquierda · icono + texto grande · branding **Despensa el Trébol**.  
- **&lt;768px:** bottom nav con los mismos 5 ítems · **targets ≥56px** · branding en topbar.  
- Ítems fijos: **Inicio · Vender · Depósito · Avisos · Reportes**.  
- **Inicio:** resumen del día (# ventas · $ o “Sin ventas todavía”) · atajos grandes **Vender** / **Avisos** · CTA discreto **Reiniciar demo** (confirmación UI-handoff).

Amplía la shell “3–4 pantallas” de DS-DEMO-01 a la IA de 5 módulos del handoff, sin contradecir AC1 de 01.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Base de nav para 06–10; extiende 01 |
| Negotiable | Sí | Iconos/labels finos con Diseño |
| Valuable | Sí | Orientación del usuario mayor |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Shell + Inicio |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Sidebar desktop/tablet**  
- **Given** viewport **≥768px**,  
- **When** abro la demo,  
- **Then** veo sidebar izquierda con branding **Despensa el Trébol** y los 5 ítems (Inicio · Vender · Depósito · Avisos · Reportes), labels grandes, targets **≥56px**, ítem activo visible.

**AC2 — Bottom nav mobile**  
- **Given** viewport **&lt;768px**,  
- **When** uso la demo,  
- **Then** veo **bottom nav** (no sidebar apretada) con los mismos 5 ítems, targets **≥56px**, y topbar con branding + título de pantalla.

**AC3 — Navegación entre módulos**  
- **Given** la shell cargada,  
- **When** toco cada ítem de nav,  
- **Then** llego a la pantalla correspondiente en **≤ ~3 pasos** desde Inicio, sin login ni multi-usuario.

**AC4 — Inicio: resumen + atajos**  
- **Given** que estoy en **Inicio**,  
- **When** miro la pantalla,  
- **Then** veo resumen del día (`N ventas · $X` o `Sin ventas todavía`) y atajos grandes a **Vender** y **Avisos** (copy ES-AR vos).

**AC5 — Reiniciar demo desde Inicio**  
- **Given** que el estado local pudo cambiar,  
- **When** elijo **Reiniciar demo** y confirmo (`¿Reiniciar la demo? Se vuelve al stock inicial.`),  
- **Then** se restaura el seed (alineado a DS-DEMO-01 AC3 / DS-DEMO-08).

**AC6 — Sin CRM completo**  
- **Given** la shell,  
- **When** busco módulos densos (CRM pleno, edición, dashboards),  
- **Then** **no** existen: solo los 5 ítems demo.

#### Fuera de alcance
CRM pleno · edición densa · dashboards · multi-usuario · más de 5 ítems de nav · sidebar en mobile.

#### Definition of Done (DoD)
- AC1–AC6 verificados en preview/demo.  
- Tokens/targets según UI-handoff (≥56px nav).  
- Copy ES-AR (vos).  
- No invalida DS-DEMO-01 smoke.  
- Sizing Developers pendiente documentado.

#### Checklist usabilidad UI (usuario mayor)
- [ ] Targets nav ≥56px  
- [ ] Tipografía grande; contraste alto  
- [ ] Pocos ítems (exactamente 5)  
- [ ] Atajos Inicio obvios  
- [ ] Reiniciar demo discreto pero alcanzable  
- [ ] Sin jerga CRM  

#### Por definir
- Icon set exacto (Diseño).  
- Rutas Next vs SPA de vistas (UI-handoff sugiere ambas OK).

#### Notas
- Refina shell de 01; **01 permanece válida**.  
- Avisos y Reportes como destinos de nav se materializan en **09** y **10**.

---

### DS-DEMO-06 — Depósito read-only + typeahead

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-06 |
| **Épica** | Demo delta — Catálogo read-only |
| **Orden** | 3 de 6 (delta) |
| **Estado** | **Ready** |
| **Prioridad** | Alta |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | **DS-DEMO-01** (catálogo seed visible). Ideal **DS-DEMO-08** (shape con `codigo` / ls v2). Nav: **DS-DEMO-05**. Diseño: UI-handoff §4.3. |

#### Como / Quiero / Para
**Como** dueño de despensa,  
**quiero** una pantalla **Depósito** con cards claras (nombre, precio, stock, umbral, badge) y un **buscador typeahead**, **sin poder editar**,  
**para** consultar el stock de un vistazo sin confusión de formularios.

#### Descripción
Pantalla **Depósito** (ex Productos) read-only: cards/filas grandes con **nombre · precio · stock · umbral · badge “Poco stock”** si `stock <= umbral`. Typeahead arriba (`Buscar producto…`). **Sin edición** de producto en Paso 0 (MVP). Si DS-DEMO-01 ya mostraba lista seed, esta historia **hace explícita** la pantalla propia + typeahead + badges alineados al handoff.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Extiende 01; no requiere venta |
| Negotiable | Sí | Card vs fila con Diseño |
| Valuable | Sí | Consulta stock sin CRUD |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Lista + filtro |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Lista cards read-only**  
- **Given** seed cargado (12 ítems),  
- **When** abro **Depósito**,  
- **Then** veo cards/filas con **nombre, precio, stock, umbral** legibles; **no** hay controles de edición/alta/baja.

**AC2 — Badge poco stock**  
- **Given** productos con `stock <= umbral`,  
- **When** miro la lista,  
- **Then** esos ítems muestran badge **Poco stock** (contraste + texto, no solo color).

**AC3 — Typeahead**  
- **Given** que estoy en Depósito,  
- **When** escribo en el buscador para filtrar,  
- **Then** la lista se reduce a coincidencias; si no hay, veo `No hay coincidencias`. El tipeo es **solo filtro** (poco tipeo).

**AC4 — Sin CRUD / sin edición densa**  
- **Given** Depósito,  
- **When** busco editar precio/stock/umbral o crear producto,  
- **Then** **no** existe ese flujo (fuera DEMO; MVP).

**AC5 — Consistencia post-venta**  
- **Given** ventas confirmadas en la sesión (DS-DEMO-03 / 07),  
- **When** vuelvo a Depósito,  
- **Then** stock y badges reflejan el estado actual (localStorage).

#### Fuera de alcance
Edición / steppers / forms · importación · umbrales configurables · CRUD.

#### Definition of Done (DoD)
- AC1–AC5 verificados.  
- Alineado a UI-handoff §4.3 + copy §5 Depósito (ex Productos).  
- No contradice DS-DEMO-01 AC2/AC4.  
- Checklist UX mayores.

#### Checklist usabilidad UI (usuario mayor)
- [ ] Cards grandes; stock obvio  
- [ ] Input buscar ≥56px  
- [ ] Badge legible  
- [ ] Empty filtro amable  
- [ ] Sin formularios  

#### Por definir
- Si typeahead también matchea fragmento de `codigo` (handoff §6 lo sugiere en Vender; opcional aquí).

#### Notas
- Explícita para cerrar gap de Alejo si 01 no cubría typeahead/badges de pantalla propia.

---

### DS-DEMO-07 — Vender POS split (typeahead | código+Enter | simular | carrito)

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-07 |
| **Épica** | Demo delta — POS / caja |
| **Orden** | 4 de 6 (delta) |
| **Estado** | **Ready** |
| **Prioridad** | Alta (foco principal del delta) |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | **DS-DEMO-02** (venta rápida) y **DS-DEMO-03** (stock baja / stock 0 bloquea) — **mantiene ese comportamiento al confirmar**. Ideal **DS-DEMO-08** (`codigo` en seed). Nav: **DS-DEMO-05**. Diseño: UI-handoff §4.2 + §6. |

#### Como / Quiero / Para
**Como** dueño de despensa,  
**quiero** una pantalla **Vender** tipo caja: a un lado buscar/código/simular escaneo y al otro el **carrito** con ±, Vaciar y Confirmar,  
**para** armar una venta con pocos toques (y código+Enter si hay lector wedge o simulación) y ver que el stock baja al confirmar.

#### Descripción
**Vender ampliado POS split** (amplía DS-DEMO-02, no lo invalida):

**Izquierda**  
- Typeahead filtro + lista seleccionable (nombre · precio · u. disponibles restando carrito).  
- Input **código** + **Enter** → lookup por `producto.codigo` → agrega 1 si stock alcanza.  
- **Simular escaneo**: elige producto con stock disponible (restando carrito), rellena código y dispara mismo flujo Enter.

**Derecha**  
- Carrito: líneas nombre · cant · subtotal · botones **+ / −** · **Total** · **Confirmar venta** · **Vaciar**.

**Confirmar** (depende DS-DEMO-02/03): baja stock de todos los ítems · registra `sales[]` · toast · carrito vacío. Stock 0 / insuficiente = bloquear + toast claro.

**Mobile (&lt;768px):** stack vertical (buscar/lista arriba · carrito abajo) · Total + Confirmar **sticky** sobre bottom nav.

Carrito **solo en memoria** (no persiste al refresh) — OK demo.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Requiere 02/03 + seed con codigo (08) |
| Negotiable | Sí | Detalle visual split con Diseño |
| Valuable | Sí | Corazón demo CRM-light+POS |
| Estimable | Sí | Pendiente Developers |
| Small | Parcial | Un flujo POS completo; aceptable para demo |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Layout split desktop**  
- **Given** viewport ≥768px en **Vender**,  
- **When** miro la pantalla,  
- **Then** veo panel izquierdo (buscar/código/simular/lista) y panel derecho (carrito · total · Confirmar · Vaciar).

**AC2 — Typeahead / tap agrega al carrito**  
- **Given** productos con stock disponible,  
- **When** filtro y toco un producto (o agrego desde lista),  
- **Then** se agrega **1** al carrito si `stock - cant_en_carrito > 0`; toast `+1 [nombre]`; si no alcanza, toast `Stock insuficiente` / `Sin stock de este producto` y **no** agrega.

**AC3 — Código + Enter (wedge)**  
- **Given** foco en input código,  
- **When** ingreso un `codigo` válido del seed y pulso **Enter**,  
- **Then** se resuelve el producto y se agrega 1 al carrito (mismas reglas de stock). Si el código no existe: toast `Código no encontrado`.

**AC4 — Simular escaneo**  
- **Given** hay al menos un producto con stock disponible (restando carrito),  
- **When** toco **Simular escaneo**,  
- **Then** se elige un producto elegible, se rellena el código y se dispara el mismo flujo que Enter (agrega 1). Si no queda stock global: mensaje `No queda stock. Reiniciá la demo.`

**AC5 — Carrito ± · Vaciar**  
- **Given** líneas en el carrito,  
- **When** uso **+** / **−** o **Vaciar**,  
- **Then** las cantidades/subtotales/total se actualizan; **−** a 0 quita la línea; Vaciar deja el carrito en empty (`Vacío · tocá un producto`); **+** respeta stock disponible.

**AC6 — Confirmar venta (stock on confirm — deps 02/03)**  
- **Given** carrito con uno o más ítems y stock suficiente,  
- **When** confirmo **Confirmar venta**,  
- **Then** se decrementa stock de cada ítem, se registran ventas del día en `sales[]` (`cant`, `precio` = subtotal línea, `at`), toast `Listo · N ítems · $…`, carrito vacío; stock coherente al navegar (DS-DEMO-03).

**AC7 — Mobile stack + sticky**  
- **Given** viewport &lt;768px,  
- **When** estoy en Vender,  
- **Then** el layout es stack (buscar/lista arriba · carrito abajo) y Total + Confirmar quedan **sticky** por encima del bottom nav.

**AC8 — Sin hardware real / sin AFIP**  
- **Given** el flujo POS,  
- **When** completo una venta,  
- **Then** no se exige lector físico ni AFIP; simulación/código por input es suficiente.

#### Fuera de alcance
Hardware cámara/WebUSB · AFIP · descuentos complejos · persistir carrito · multi-caja · ticket fiscal.

#### Definition of Done (DoD)
- AC1–AC8 verificados.  
- Comportamiento stock de **DS-DEMO-03** respetado (0 bloquea; no negativo).  
- Copy UI-handoff §5 Vender.  
- No invalida smoke de 02/03.  
- Checklist UX mayores.

#### Checklist usabilidad UI (usuario mayor)
- [ ] CTA Confirmar ~72px  
- [ ] Inputs ≥56px; ± grandes  
- [ ] Poco tipeo (filtro / Enter / simular)  
- [ ] Toasts claros (vos)  
- [ ] Empty carrito amable  
- [ ] Sticky usable sobre bottom nav  

#### Por definir
- Foco automático al input código al entrar a Vender (handoff lo sugiere — implementar salvo bloqueo a11y).

#### Notas
- Amplía 02 a carrito multi-línea + código+Enter; **02/03 siguen válidos** como base de comportamiento.

---

### DS-DEMO-08 — Persistencia localStorage v2 + seed con codigo

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-08 |
| **Épica** | Demo delta — Datos / seed |
| **Orden** | 2 de 6 (delta) — temprano / paralelo |
| **Estado** | **Ready** |
| **Prioridad** | Alta (habilita código + POS) |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | Compatible con seed/reset de **DS-DEMO-01** y **DS-DEMO-03** AC4. Diseño/datos: UI-handoff §7. |

#### Como / Quiero / Para
**Como** equipo de demo (y en la práctica el dueño al reabrir el link),  
**quiero** que el estado viva en `localStorage` clave **`mi-despensa-demo-v2`** con productos que incluyen **`codigo`** y ventas del día,  
**para** que el escaneo/simulación resuelva productos y **Reiniciar demo** vuelva al seed de 12 ítems.

#### Descripción
- Clave: **`mi-despensa-demo-v2`**.  
- Shape: `{ products, sales }`.  
- Producto: `{ id, nombre, precio, stock, umbral, codigo }`.  
- Sale: `{ id, nombre, precio, cant, at }` (`precio` = subtotal línea).  
- **12** productos seed del UI-handoff (umbrales 5; códigos EAN demo).  
- Lookup por `codigo` resuelve producto (usado por DS-DEMO-07).  
- **Reiniciar demo** = reescribe seed + limpia `sales[]` (+ carrito en memoria).  
- **Sin BD.** Migración: si existe clave vieja de Paso 0, preferir bump limpio a v2 (no inventar merge complejo; Reiniciar demo alcanza).

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Infra para 06/07/09/10 |
| Negotiable | Parcial | Shape LOCKED por handoff |
| Valuable | Sí | Persistencia demo + barcode |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Seed + ls + reset |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Clave y shape v2**  
- **Given** primera carga (o post-reset),  
- **When** inspecciono el estado persistido,  
- **Then** existe `localStorage['mi-despensa-demo-v2']` con `{ products, sales }` y cada product incluye `codigo`.

**AC2 — Seed 12 con codigo**  
- **Given** estado inicial,  
- **When** listo productos,  
- **Then** hay **12** ítems alineados al JSON del UI-handoff (nombres/precios/stock/umbral/codigo); umbral demo **5**.

**AC3 — Código resuelve producto**  
- **Given** seed v2,  
- **When** busco un producto por su `codigo` (API interna / flujo Vender),  
- **Then** obtengo el producto correcto; códigos inexistentes no resuelven.

**AC4 — Persistencia de ventas y stock**  
- **Given** ventas confirmadas,  
- **When** recargo la página,  
- **Then** `products.stock` y `sales[]` se mantienen desde ls v2 (carrito **no** persiste).

**AC5 — Reiniciar demo**  
- **Given** stock/ventas modificados,  
- **When** confirmo **Reiniciar demo**,  
- **Then** products vuelven al seed inicial, `sales` queda vacío, y la UI refleja el reset (toast/confirm según handoff).

**AC6 — Sin BD / sin backend**  
- **Given** la demo,  
- **When** opero ventas y reset,  
- **Then** no hay llamadas a BD/API de persistencia; solo seed + localStorage.

#### Fuera de alcance
Backend · sync cloud · multi-dispositivo · migración elaborada entre versiones · editar seed desde UI.

#### Definition of Done (DoD)
- AC1–AC6 verificados.  
- JSON seed = UI-handoff §7.  
- Reiniciar demo alineado a 01/03.  
- Documentar clave `mi-despensa-demo-v2` para QA.

#### Checklist usabilidad UI (usuario mayor)
- [ ] Reset comprensible (no habla de localStorage al usuario)  
- [ ] Confirmación clara antes de borrar sesión demo  

#### Por definir
- Comportamiento exacto si el usuario aún tiene clave v1 en el browser (recomendado: ignorar v1 y usar v2 / ofrecer Reiniciar).

#### Notas
- Bump de clave por carrito + campo `codigo` (handoff).  
- No invalida 01…04; endurece el contrato de datos del delta.

---

### DS-DEMO-09 — Avisos pantalla propia (refina DS-DEMO-04)

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-09 |
| **Épica** | Demo delta — Avisos |
| **Orden** | 5 de 6 (delta) |
| **Estado** | **Ready** |
| **Prioridad** | Alta |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | **Refina DS-DEMO-04 en pantallas separadas** (esta = Avisos). Valor de 04 (avisos existen) se **mantiene**; 04 **no se invalida**. Ideal post-ventas 03/07. Nav: **DS-DEMO-05**. Diseño: UI-handoff §4.4. |

#### Como / Quiero / Para
**Como** dueño de despensa,  
**quiero** una pantalla **Avisos** solo con lo **a reponer** (stock ≤ umbral), ordenada y simple,  
**para** ver qué falta sin mezclarlo con el reporte de ventas.

#### Descripción
Pantalla propia **Avisos**: lista estilo alertas CRM-light **A reponer**, prioridad por stock más bajo. Empty: `Todo bien, no hay que reponer`. Umbrales solo del seed (no configurables). Separa el bloque combinado permitido en DS-DEMO-04 AC6 (“pueden ser una sola pantalla”) hacia **dos pantallas**, sin quitar el valor de avisos de 04.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Refina 04; datos de 01/08 |
| Negotiable | Sí | Estilo lista con Diseño |
| Valuable | Sí | Claridad vs reporte |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Una lista + empty |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Pantalla Avisos en nav**  
- **Given** shell DS-DEMO-05,  
- **When** toco **Avisos** (nav o atajo Inicio),  
- **Then** abro una **pantalla propia** (no solo un bloque dentro de Reportes).

**AC2 — Lista a reponer**  
- **Given** uno o más productos con `stock <= umbral`,  
- **When** estoy en Avisos,  
- **Then** veo lista clara (nombre + stock; umbral visible o simple), priorizada por stock más bajo, tipografía grande.

**AC3 — Empty**  
- **Given** ningún producto bajo umbral,  
- **When** abro Avisos,  
- **Then** veo `Todo bien, no hay que reponer` (no error técnico).

**AC4 — Actualización post-venta**  
- **Given** una venta que cruza umbral (o deja stock bajo),  
- **When** vuelvo a Avisos,  
- **Then** la lista refleja el stock actual de la sesión.

**AC5 — Sin config de umbrales / sin 7d**  
- **Given** Avisos,  
- **When** busco editar umbrales o ver períodos,  
- **Then** no hay UI de config ni reportes aquí (MVP / fuera).

**AC6 — Relación con DS-DEMO-04**  
- **Given** el backlog Paso 0,  
- **When** se implementa esta historia,  
- **Then** el valor de **DS-DEMO-04** (existen avisos bajo umbral) sigue cumpliéndose; esta historia **refina** la UI a pantalla separada. **04 no se marca inválida.**

#### Fuera de alcance
Umbrales configurables · push/WhatsApp automático · CRUD reposición · mezclar reporte de ventas en esta pantalla.

#### Definition of Done (DoD)
- AC1–AC6 verificados.  
- Copy UI-handoff §5 Avisos.  
- Nota de dependencia “refina 04” visible en ticket/PR.  
- Checklist UX.

#### Checklist usabilidad UI (usuario mayor)
- [ ] Lista escaneable; poco texto  
- [ ] Contraste en alertas (+ texto)  
- [ ] Empty amable  
- [ ] ≤ ~3 pasos desde Inicio  

#### Por definir
- Deep-link desde badge en Depósito (nice-to-have; no bloquea Ready).

#### Notas
- Pareja con **DS-DEMO-10**.  
- Seed low-stock inicial (Coca-Cola, Aceite, Café, Mayonesa) facilita demo sin ventas.

---

### DS-DEMO-10 — Reportes hoy pantalla propia (refina DS-DEMO-04)

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-10 |
| **Épica** | Demo delta — Reportes |
| **Orden** | 6 de 6 (delta) |
| **Estado** | **Ready** |
| **Prioridad** | Alta (cierra arco feedback) |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | **Refina DS-DEMO-04 en pantallas separadas** (esta = Reportes hoy). Valor de 04 (reporte hoy existe) se **mantiene**; 04 **no se invalida**. Datos de ventas: **02/03/07** + **08**. Nav: **DS-DEMO-05**. Diseño: UI-handoff §4.5. |

#### Como / Quiero / Para
**Como** dueño de despensa,  
**quiero** una pantalla **Reportes** solo de **hoy** (# ventas · $ · lista corta),  
**para** comentar por WhatsApp qué se vendió sin gráficos ni semana.

#### Descripción
Pantalla propia **Reportes**: resumen **Hoy** — cantidad de ventas, total $, lista corta de ventas del día. Sin gráficos densos. **Últimos 7 días = MVP / fuera.** Empty: `Todavía no hubo ventas hoy` / `Las ventas van a aparecer acá`. Separa el reporte del bloque combinado de DS-DEMO-04.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Refina 04; brilla post-ventas |
| Negotiable | Sí | Lista corta vs solo totales |
| Valuable | Sí | Métrica éxito demo |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Resumen + lista |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Pantalla Reportes en nav**  
- **Given** shell DS-DEMO-05,  
- **When** toco **Reportes**,  
- **Then** abro una **pantalla propia** distinta de Avisos.

**AC2 — Resumen solo hoy (LOCKED)**  
- **Given** cero o más ventas confirmadas **hoy** en la sesión,  
- **When** consulto Reportes,  
- **Then** veo **# ventas** y **total $** en formato es-AR (números grandes; copy tipo `Hoy`).

**AC3 — Lista corta**  
- **Given** ventas de hoy,  
- **When** miro debajo del resumen,  
- **Then** veo una lista corta simple (sin tablas densas ni charts).

**AC4 — Empty**  
- **Given** sin ventas hoy,  
- **When** abro Reportes,  
- **Then** veo empty amable (`Todavía no hubo ventas hoy` · `Las ventas van a aparecer acá`).

**AC5 — Sin 7d / D/S/M**  
- **Given** Reportes,  
- **When** busco semana/mes/últimos 7 días,  
- **Then** **no** hay UI de esos períodos (**MVP / fuera demo**).

**AC6 — Relación con DS-DEMO-04**  
- **Given** el backlog Paso 0,  
- **When** se implementa esta historia,  
- **Then** el valor de **DS-DEMO-04** (reporte hoy # + $) sigue cumpliéndose; esta historia **refina** a pantalla separada. **04 no se marca inválida.**

**AC7 — Coherencia post-venta y post-reset**  
- **Given** confirmo ventas o **Reiniciar demo**,  
- **When** abro Reportes,  
- **Then** los totales/lista reflejan `sales[]` actual (vacío tras reset).

#### Fuera de alcance
Reportes 7d · gráficos · export Excel/PDF · filtros por producto · comparación de períodos.

#### Definition of Done (DoD)
- AC1–AC7 verificados.  
- Reporte = **hoy** únicamente.  
- Copy UI-handoff §5 Reportes.  
- Nota “refina 04” en ticket/PR.  
- Checklist UX.

#### Checklist usabilidad UI (usuario mayor)
- [ ] Números grandes preferibles a charts  
- [ ] Lenguaje simple (“Hoy: N ventas · $X”)  
- [ ] Empty amable  
- [ ] ≤ ~3 pasos desde Inicio  

#### Por definir
- Criterio exacto de “hoy” en zona horaria local del browser (esperado: fecha local del dispositivo).

#### Notas
- Pareja con **DS-DEMO-09**.  
- Inicio puede mostrar el mismo resumen condensado (05); fuente de verdad = `sales[]` (08).

---

## 3. Cierre — Dependencias, handoff y éxito

### Mapa de dependencias (delta → Paso 0)

```
DS-DEMO-01 (shell+seed) ──extends──► DS-DEMO-05 (nav 5 + Inicio)
                 │                      │
                 │                      ├────────► DS-DEMO-06 (Depósito RO)
                 │                      │
DS-DEMO-02 (venta) ──amplía──► DS-DEMO-07 (POS split)
DS-DEMO-03 (stock) ──behavior──┘         ▲
                                         │
DS-DEMO-08 (ls v2 + codigo) ─────────────┘
                 │
DS-DEMO-04 (avisos+reporte) ──refina──► DS-DEMO-09 (Avisos)
                         └──refina──► DS-DEMO-10 (Reportes hoy)
```

| Delta | Depende de / relación |
|-------|------------------------|
| **05** | Extiende **01** |
| **06** | **01** (+ **08**, **05**) |
| **07** | **02**, **03** (stock on confirm); **08** (`codigo`); **05** |
| **08** | Compatible **01**, **03** (reset) |
| **09** | **Refina 04** (pantalla Avisos); **05**; datos **01/08** |
| **10** | **Refina 04** (pantalla Reportes hoy); **05**; ventas **02/03/07** + **08** |

**Confirmación:** DS-DEMO-01…04 **permanecen válidos** (smoke PASS). Este documento **amplía** Paso 0; no los reemplaza ni los marca Done/Obsolete.

### Handoff Diseño ∥ Frontend
| Quién | Pedido |
|-------|--------|
| **Diseño** | Paridad con `UI-handoff.md` + `ui-demo/`: shell 5 ítems, POS split, Depósito RO, Avisos\|Reportes separados, tokens/targets. |
| **Frontend** | Next App Router + `"use client"` + ls `mi-despensa-demo-v2`; implementar DS-DEMO-05…10 en estado **Ready**; respetar AC de 01…04. |
| **Producto / PO (Emi)** | Delta **Emiliano OK**; reglas LOCKED. |
| **Developers** | Sizing DS-DEMO-05…10. |

### Métrica de éxito (delta)
Nav **5 módulos** · **Vender** split (typeahead \| código+Enter \| simular \| carrito → confirmar → stock baja) · Depósito RO · **Avisos** y **Reportes hoy** separados · persistencia v2 con `codigo` · Reiniciar demo · sin BD/CRM pleno/AFIP/hardware real · feedback WhatsApp.

### Fuera de alcance (recordatorio)
**CRM pleno · edición densa · 7d/gráficos · AFIP · multi-usuario · hardware real · BD · app nativa.**

### Preguntas abiertas (no bloquean Ready)
1. Migración exacta desde posible clave ls v1 → v2.  
2. Foco auto en input código al entrar a Vender.  
3. Typeahead de Depósito: ¿match por fragmento de `codigo`?  
4. Sizing Developers 05…10.

---

*Backlog Demo Delta CRM-light / POS — DS-DEMO-05…10 · Estado: **Ready** · Amplía Paso 0 · **01…04 no se invalidan** · Sizing: pendiente Developers · Alineado a UI-handoff.md + backlog-demo-paso0.md · Emiliano OK.*
