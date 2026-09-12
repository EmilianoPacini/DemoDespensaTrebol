# Backlog Demo — Paso 0 · Despensa el Trébol

**Documento:** Historias de usuario **solo Demo** (Paso 0)  
**Estado global:** **Ready-for-demo-scope** (decisiones A–D **LOCKED** · Emiliano / Producto)  
**Audiencia:** Diseño ∥ Frontend · handoff Producto  
**Idioma UI:** Español rioplatense (vos) — **LOCKED** (decisión D)  
**Nombre:** **Despensa el Trébol** — **LOCKED** (decisión A supersedida por DS-DEMO-13)  
**Tech demo:** **Next + seed + localStorage** (sin BD/backend) — **LOCKED** (decisión B)  
**Multi-usuario:** fuera — un operador — **LOCKED** (decisión C)

---

## 1. Intro

### Product Goal (demo)
Que el **dueño de despensa** (persona mayor, poca afinidad tecnológica) pruebe **en minutos**, abriendo un **link por WhatsApp**, **sin hardware**: ver productos de ejemplo **ya cargados** (seed), hacer una **venta rápida** (lista + filtro por tipeo / escaneo falso), ver que el **stock baja**, y consultar **avisos de stock bajo** + un **reporte simple de hoy**. Objetivo: feedback útil por WhatsApp, no operación productiva.

### Alcance Demo vs MVP

| | **Paso 0 — Demo (este backlog)** | **MVP v1 (fuera de este backlog)** |
|--|----------------------------------|-------------------------------------|
| Productos | Catálogo **seed ya cargado** (12 ítems); ver / **Reiniciar demo** (= reset a seed) | CRUD real mega-configurable |
| Venta | Venta rápida: **lista grande + filtro por tipeo**; escaneo falso resuelve producto; poco tipeo | Venta rápida + campo código (lector USB wedge) |
| Stock | Baja al confirmar venta; **stock 0 = bloquear venta** | Ingresos/ajustes + decremento atómico |
| Avisos | Lista bajo umbral (defaults del seed) | Umbrales configurables por producto |
| Reportes | **Solo hoy** (# ventas + total $) | Día / semana / mes (últimos 7 días = MVP) |
| Datos | Next + seed + localStorage (sin BD/backend) | Persistencia real |
| Hardware | **Ninguno** (escaneo falso en UI) | Lector USB teclado-wedge |

### Orden de las historias (1 → 4)
1. **DS-DEMO-01** — Ver productos de ejemplo (shell mínima + catálogo seed ya cargado)  
2. **DS-DEMO-02** — Venta rápida (lista + filtro por tipeo / escaneo falso)  
3. **DS-DEMO-03** — Stock baja al vender (stock 0 bloquea)  
4. **DS-DEMO-04** — Avisos stock bajo + reporte de hoy  

*(Shell UX no va como historia separada: se pliega en DS-DEMO-01.)*

### Decisiones PO (A–D) — **LOCKED**
| # | Tema | Estado | Decisión |
|---|------|--------|----------|
| A | Nombre del producto | **LOCKED** (supersedida DS-DEMO-13) | **Despensa el Trébol** |
| B | Tech demo | **LOCKED** | **Next + seed + localStorage** (sin BD/backend en demo); deploy Vercel |
| C | Multi-usuario / caja MVP | **LOCKED** (fuera) | Un operador |
| D | Idioma UI | **LOCKED** | ES-AR, vos |

**Reglas demo alineadas (LOCKED):** seed **12** ítems · reset CTA **“Reiniciar demo”** · stock 0 = **bloquear venta** · reporte demo = **hoy** (# ventas + total $) · últimos 7 días = **MVP / fuera demo** · poco tipeo · venta = lista + filtro por tipeo · escáner (falso) resuelve producto solo.

**Todas las historias:** Estado **Ready** (Ready-for-demo-scope).

### Fuera de alcance global (DEMO) — aplicar a **todas** las historias
- Lector físico / barcode wedge real / hardware de escáner  
- AFIP / facturación fiscal  
- CRUD real de productos (alta/edición/baja productiva)  
- Multi-sucursal  
- E-commerce / delivery  
- Contabilidad  
- Multi-usuario / roles / PIN  
- App nativa  
- Features exclusivas de MVP (persistencia crítica, umbrales configurables por UI, reportes D/S/M / últimos 7 días, ingresos/ajustes de stock, etc.)

### Sizing
**Pendiente de Developers** en todas las historias.

---

## 2. Historias

---

### DS-DEMO-01 — Ver productos de ejemplo (shell + catálogo seed ya cargado)

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-01 |
| **Épica** | Demo Paso 0 — Shell + catálogo |
| **Orden** | 1 de 4 |
| **Estado** | **Ready** (Ready-for-demo-scope) |
| **Prioridad** | Alta (bloquea el resto del flujo demo) |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | Ninguna (historia de entrada). Diseño: wire home + lista (UI-handoff). |

#### Como / Quiero / Para
**Como** dueño de una despensa pequeña (persona mayor, poca tech),  
**quiero** abrir el link y ver de inmediato una pantalla simple con un **catálogo de 12 productos de ejemplo ya cargados** (y poder **Reiniciar demo** al seed si apliqué ventas),  
**para** entender qué vende el sistema **sin cargar nada a mano** y sin hardware.

#### Descripción
Incluye la **shell UX mínima** de la demo (home / navegación a 3–4 pantallas) y la **lista del catálogo seed** con **12** productos realistas de kiosco/despensa argentina (alineado a UI-handoff: yerba, aceite, mayonesa, gaseosa, pan lactal, leche, fideos, arroz, galletitas, azúcar, café, agua — marcas/presentaciones típicas AR).  

**Demo con seed ya cargado:** al abrir, el catálogo está disponible; **no** se le pide al usuario cargar el catálogo manualmente.  
**“Reiniciar demo”** = resetear al seed inicial (no es CRUD). No hay alta/edición/baja real de productos. Label del CTA: **“Reiniciar demo”** (no “Volver a empezar”).

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Independiente de venta/stock; base para 02–04 |
| Negotiable | Sí | Copy fino y layout con Diseño; contenido seed = 12 ítems UI-handoff |
| Valuable | Sí | Primera impresión + feedback “esto es mi despensa” |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Un flujo: abrir → ver lista / Reiniciar demo |
| Testable | Sí | AC Given/When/Then |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Home / shell mínima**  
- **Given** que abro el link de la demo en el navegador (sin instalar nada),  
- **When** carga la aplicación,  
- **Then** veo una pantalla de inicio clara con nombre **Despensa el Trébol**, **botones grandes** y navegación a las pantallas demo (productos / vender / avisos-reporte), en **máximo ~3 pasos** para llegar a cada flujo, con copy corto en ES-AR (vos) y buen contraste.

**AC2 — Lista de catálogo seed visible (ya cargado)**  
- **Given** que abro la demo por primera vez (o tras Reiniciar demo),  
- **When** entro a la vista de productos / catálogo (o veo el seed desde home),  
- **Then** veo **12** productos de ejemplo realistas de despensa AR (nombre, y al menos stock y precio visibles de forma legible), **sin** haber cargado datos manualmente ni pedido de “cargar catálogo”.

**AC3 — Reiniciar demo (reset a seed)**  
- **Given** que el estado local de la demo pudo haberse modificado en la sesión (p. ej. ventas previas),  
- **When** elijo la acción **“Reiniciar demo”** (copy claro; CTA discreto según UI-handoff),  
- **Then** el catálogo vuelve al **seed inicial de 12 ítems** y se confirma visualmente que los productos de ejemplo están disponibles (p. ej. confirmación “¿Reiniciar la demo? Se vuelve al stock inicial.”).

**AC4 — Sin CRUD**  
- **Given** que estoy en la demo,  
- **When** busco crear, editar o eliminar un producto de forma productiva,  
- **Then** **no** existe flujo de CRUD real (fuera de alcance DEMO); solo seed / Reiniciar demo.

#### Fuera de alcance (esta historia + global DEMO)
Lector físico / barcode wedge real; AFIP/facturación; **CRUD real de productos**; multi-sucursal; e-commerce; contabilidad; multi-usuario; app nativa; features MVP; edición de umbrales; importación masiva real; pedir al usuario cargar catálogo a mano.

#### Definition of Done (DoD) — distinguir de AC
- AC1–AC4 verificados en el entorno de demo desplegable (o preview).  
- Copy ES-AR revisado (vos); tipografía/botones según checklist UX mayores.  
- Seed con **12** productos realistas AR (UI-handoff).  
- CTA de reset labelado **“Reiniciar demo”**.  
- Fuera de alcance hardware/CRUD documentado en la UI o en notas de release demo si hace falta clarificar.  
- Code review / deploy según acuerdo del equipo (Next + seed + localStorage).  

#### Checklist usabilidad UI (usuario mayor) — obligatorio
- [ ] Botones grandes, fácil de tocar (área generosa)  
- [ ] Pocos pasos (máx. ~3) desde home hasta ver productos  
- [ ] Copy claro ES-AR (vos), sin jerga técnica  
- [ ] Alto contraste texto/fondo  
- [ ] Tipografía legible (tamaño generoso)  
- [ ] Una acción primaria obvia por pantalla  
- [ ] Sin modales densos ni formularios largos  
- [ ] Feedback visual inmediato al Reiniciar demo  
- [ ] No depende de hardware ni de gestos complejos  
- [ ] Seed ya cargado: cero fricción de “setup” de catálogo  

#### Por definir (no inventar reglas de negocio)
- Confirmación exacta de reset (copy fino ya en UI-handoff; validar en implementación).  
- Detalle visual de lista (Diseño / UI-handoff como fuente).  

#### Notas
- Preferir pliegue de shell en esta historia (no crear DS-DEMO-00).  
- Mitigar riesgo “demo juguete”: datos realistas de despensa (12 ítems).  
- Tech: Next + seed + localStorage (LOCKED B).

---

### DS-DEMO-02 — Venta rápida (lista + filtro por tipeo / escaneo falso)

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-02 |
| **Épica** | Demo Paso 0 — Venta rápida |
| **Orden** | 2 de 4 |
| **Estado** | **Ready** (Ready-for-demo-scope) |
| **Prioridad** | Alta |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | DS-DEMO-01 (catálogo seed / shell). Diseño: venta lista + filtro + UI “escaneo” falso (UI-handoff). |

#### Como / Quiero / Para
**Como** dueño de despensa (mayor, poca tech),  
**quiero** hacer una **venta rápida** eligiendo de una **lista grande**, **filtrando por tipeo** si hace falta, o con un **escaneo falso** en pantalla (sin lector),  
**para** sentir el flujo de caja en minutos — **con pocos toques y poco tipeo** — y dar feedback por WhatsApp.

#### Descripción
Flujo de **venta rápida** alineado a PRD/UI-handoff:  
- **Lista grande** de productos del seed para elegir por toque.  
- **Filtro por tipeo** (escribir solo para filtrar la lista si no hay escáner).  
- **Escaneo falso** (UI): resuelve el producto solo (demo: escaneo simulado, p. ej. elige un producto con stock > 0).  
Principio UX: **poco tipeo** — selectores / taps; no formularios largos. Carrito **mínimo** o **venta de 1 ítem** (UI-handoff: 1 ítem por transacción). Máximo ~3 pasos; ideal **1–2 taps** hasta confirmar. Copy claro (vos). **Sin** hardware, **sin** AFIP, **sin** cobro real.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Requiere seed (01); no requiere avisos (04) |
| Negotiable | Sí | Detalle visual escaneo / filtro con Diseño |
| Valuable | Sí | Corazón del feedback demo |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Un flujo corto de venta |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Iniciar venta en pocos pasos**  
- **Given** que estoy en la home de la demo con seed ya cargado,  
- **When** elijo la acción principal de **vender** (botón grande),  
- **Then** llego al flujo de venta en **≤ 3 pasos** desde home, con UI simple, contraste alto y **poco tipeo**.

**AC2 — Venta por lista + filtro por tipeo**  
- **Given** que estoy en el flujo de venta,  
- **When** veo la **lista grande** de productos y, si quiero, **escribo para filtrar** la lista,  
- **Then** puedo elegir un producto por toque (pocos taps); el tipeo es **solo** para filtrar, no para cargar datos de producto ni formularios largos.

**AC3 — Escaneo falso (UI) resuelve producto solo**  
- **Given** que estoy en el flujo de venta,  
- **When** uso la acción de **simular escaneo** / escaneo falso,  
- **Then** veo feedback claro de “escaneado” (sin hardware) y el **producto queda resuelto solo** (listo para confirmar la venta), sin que yo tenga que buscarlo a mano.  
- **Detalle visual:** según UI-handoff (p. ej. “📷 Simular escaneo”).

**AC4 — Confirmar venta (demo)**  
- **Given** que tengo un ítem seleccionado (por lista/filtro o escaneo falso),  
- **When** confirmo la venta con un botón primario grande (copy UI-handoff: “Sí, vender” / equivalente),  
- **Then** la venta queda registrada en el estado de la sesión demo (localStorage) y recibo confirmación visible (mensaje/toast simple).

**AC5 — Sin cobro fiscal ni hardware**  
- **Given** el flujo de venta demo,  
- **When** completo una venta,  
- **Then** **no** se exige lector físico, **no** hay integración AFIP/facturación, y queda claro que es simulación (copy o etiqueta demo si Diseño lo define).

#### Fuera de alcance (esta historia + global DEMO)
Lector físico / barcode wedge real; AFIP/facturación; CRUD real; multi-sucursal; e-commerce; contabilidad; multi-usuario; app nativa; medios de pago reales; ticket fiscal; descuentos complejos (**fuera** de demo; MVP Por definir si aplica).

#### Definition of Done (DoD)
- AC1–AC5 verificados en demo desplegable/preview.  
- Flujo ≤ ~3 pasos; checklist UX mayores cumplida; **poco tipeo** respetado.  
- Lista + filtro por tipeo + escaneo falso operativos.  
- Sin dependencias de hardware en instrucciones al usuario.  
- Integración con stock (efecto en cantidades) cubierta en **DS-DEMO-03** (esta historia puede emitir el evento de venta; DoD de stock vive en 03).  
- Sizing/estimación Developers completada cuando el equipo lo haga.  

#### Checklist usabilidad UI (usuario mayor)
- [ ] Botones grandes; target fácil; lista grande legible  
- [ ] Ideal 1–2 taps; máx. ~3 pasos al confirmar  
- [ ] Copy ES-AR (vos), corto (“Elegí un producto”, “Simular escaneo”, “Sí, vender”)  
- [ ] Contraste alto; tipografía grande  
- [ ] Feedback inmediato al tocar / filtrar / simular escaneo / confirmar  
- [ ] Tipeo solo para filtrar (no formularios)  
- [ ] Error states simples y legibles (si aplica)  
- [ ] No parece “app de desarrollador”: tono amable y claro  

#### Por definir
- Copy exacto fino si diverge del UI-handoff en implementación.  
- Comportamiento si el usuario cancela a mitad de flujo (esperado: volver sin vender).  

#### Notas
- Fake scan es **UI**, no emulación de HID/wedge; resuelve producto solo.  
- Alineado a principio UX LOCKED: venta rápida = lista + filtro por tipeo; escáner resuelve solo.

---

### DS-DEMO-03 — Stock baja al vender

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-03 |
| **Épica** | Demo Paso 0 — Stock live |
| **Orden** | 3 de 4 |
| **Estado** | **Ready** (Ready-for-demo-scope) |
| **Prioridad** | Alta |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | DS-DEMO-01, DS-DEMO-02. |

#### Como / Quiero / Para
**Como** dueño de despensa,  
**quiero** que, al confirmar una venta simulada, la **cantidad en stock baje** y yo lo **vea** enseguida,  
**para** creer que el sistema “lleva el control” y dar feedback sobre ese valor.

#### Descripción
Tras **confirmar** la venta (DS-DEMO-02), el stock del/los producto(s) vendidos **decrementa** y el nuevo valor es **visible** en catálogo y/o resumen de venta.  

**Regla stock 0 (LOCKED):** **bloquear venta** — no permitir confirmar si stock = 0; mensaje claro y legible (UI-handoff: p. ej. “Sin stock de este producto”). **No** stock negativo.

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Acoplada a confirmación de venta |
| Negotiable | Parcial | Stock 0 = bloquear está LOCKED |
| Valuable | Sí | Demuestra sincronía venta↔stock |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Un efecto observable post-venta |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Decremento visible post-venta**  
- **Given** un producto del seed con stock visible **S** (S > 0) y una venta confirmada de cantidad **Q** (Q ≥ 1) de ese producto,  
- **When** termina la confirmación de la venta,  
- **Then** el stock mostrado pasa a **S − Q** y puedo verlo sin ayuda en la UI (lista de productos y/o detalle / confirmación / toast).

**AC2 — Consistencia en la sesión demo**  
- **Given** que realicé una o más ventas en la sesión,  
- **When** navego entre pantallas de la demo (productos / venta / avisos),  
- **Then** el stock reflejado es coherente con las ventas confirmadas de esa sesión (localStorage / estado demo — tech B LOCKED).

**AC3 — Stock cero bloquea la venta (LOCKED)**  
- **Given** un producto con stock **0**,  
- **When** intento venderlo (desde lista, filtro o escaneo falso),  
- **Then** **no** puedo confirmar la venta: la UI **bloquea** la venta e informa con mensaje claro y legible (vos), p. ej. “Sin stock de este producto” / “No queda stock…”. **No** se permite stock negativo.

**AC4 — Reiniciar demo restaura cantidades**  
- **Given** que el stock cambió por ventas y existe acción **“Reiniciar demo”** (DS-DEMO-01),  
- **When** restablezco con Reiniciar demo,  
- **Then** las cantidades vuelven a los valores iniciales del seed de 12 ítems.

#### Fuera de alcance (esta historia + global DEMO)
Lector físico; AFIP; CRUD real; multi-sucursal; e-commerce; contabilidad; multi-usuario; app nativa; **ingresos/ajustes de stock** (MVP); decremento atómico con backend real (MVP); inventario ciego / conteo físico.

#### Definition of Done (DoD)
- AC1–AC4 verificados; AC3 implementado como **bloquear venta** (LOCKED).  
- AC4 alineado con Reiniciar demo de 01.  
- No hay camino UI que implique hardware o facturación.  
- Checklist UX en mensajes de stock 0: legible, no técnico.  

#### Checklist usabilidad UI (usuario mayor)
- [ ] El número de stock es **grande y obvio** antes y después de vender  
- [ ] Cambio de stock perceptible (no hay que “buscarlo”)  
- [ ] Mensaje de stock insuficiente claro (vos), sin códigos de error  
- [ ] Contraste alto en cantidades y alertas  
- [ ] Sin tablas densas; lista simple  
- [ ] Máx. ~3 pasos para volver a ver el stock actualizado  

#### Por definir (no bloqueantes)
- Si Q puede ser > 1 en demo (UI-handoff: venta de 1 ítem por transacción — seguir handoff salvo cambio Producto).  
- Redondeos / unidades (unidad vs pack): seed define presentación; no inventar conversiones.

#### Notas
- Esta historia **no** abre CRUD ni “reposicioná stock” productiva (MVP).  
- Stock 0 = bloquear: LOCKED Emiliano/Producto.

---

### DS-DEMO-04 — Pantalla avisos stock bajo + reporte simple (hoy)

| Campo | Valor |
|-------|--------|
| **ID** | DS-DEMO-04 |
| **Épica** | Demo Paso 0 — Avisos + reporte |
| **Orden** | 4 de 4 |
| **Estado** | **Ready** (Ready-for-demo-scope) |
| **Prioridad** | Alta (cierra el arco de feedback demo) |
| **Sizing** | Pendiente de Developers |
| **Dependencias** | DS-DEMO-01; idealmente 02–03 para ver avisos/reporte con datos vivos. |

#### Como / Quiero / Para
**Como** dueño de despensa,  
**quiero** ver una pantalla simple con **avisos de productos bajo umbral** y un **reporte corto de ventas de hoy** (# ventas + total $),  
**para** entender qué repondría y qué se vendió hoy, y comentar eso por WhatsApp.

#### Descripción
Vista de **avisos**: lista de productos del seed cuyo stock actual está **por debajo del umbral** definido en el seed (defaults).  
Vista o sección de **reporte simple**: resumen de ventas de **hoy** — **# ventas + total $** (LOCKED).  

**Últimos 7 días / reportes D/S/M = MVP / fuera de demo.**  
**Umbrales configurables por UI = fuera de alcance DEMO (MVP).**

#### INVEST
| Criterio | Cumple | Nota |
|----------|--------|------|
| Independent | Parcial | Puede mostrarse con seed solo; más valiosa post-ventas |
| Negotiable | Sí | Layout avisos vs reporte en una o dos pantallas |
| Valuable | Sí | Cierra métrica de éxito demo (ver aviso/reporte) |
| Estimable | Sí | Pendiente Developers |
| Small | Sí | Lectura + listas simples, sin config |
| Testable | Sí | AC G/W/T |

#### Criterios de aceptación (AC) — Given / When / Then

**AC1 — Lista de avisos bajo umbral**  
- **Given** seed con umbrales por defecto y al menos un producto con stock ≤ umbral (por seed inicial o tras ventas),  
- **When** abro la pantalla/sección de **avisos**,  
- **Then** veo una lista clara de esos productos (nombre + stock actual; umbral visible o explicado de forma simple), con botones/tipografía grandes.

**AC2 — Sin productos bajo umbral**  
- **Given** que ningún producto está bajo umbral,  
- **When** abro avisos,  
- **Then** veo un estado vacío amigable (copy claro, vos) — no un error técnico (UI-handoff: p. ej. “Todo bien, no hay que reponer”).

**AC3 — Reporte simple solo hoy (LOCKED)**  
- **Given** cero o más ventas confirmadas **hoy** en la sesión demo,  
- **When** consulto el **reporte**,  
- **Then** veo un resumen simple de ventas de **hoy** con **# ventas** y **total $** (formato es-AR). No se exige reporte de últimos 7 días en demo.

**AC4 — Últimos 7 días fuera de demo**  
- **Given** que estoy en la demo,  
- **When** busco un reporte de últimos 7 días / semana / mes,  
- **Then** **no** hay UI de ese período en Paso 0 (**MVP / fuera demo**).

**AC5 — Umbrales no configurables en demo**  
- **Given** que estoy en la demo,  
- **When** busco cambiar umbrales por producto,  
- **Then** **no** hay UI de configuración de umbrales (MVP); solo defaults del seed.

**AC6 — Navegación desde shell**  
- **Given** la home/shell de DS-DEMO-01,  
- **When** elijo avisos o reporte (pueden ser una sola pantalla con dos bloques),  
- **Then** llego en ≤ ~3 pasos, sin hardware ni login multi-usuario.

#### Fuera de alcance (esta historia + global DEMO)
Lector físico; AFIP; CRUD real; multi-sucursal; e-commerce; contabilidad; multi-usuario; app nativa; **umbrales configurables**; **reportes últimos 7 días / D/S/M** (MVP); exportar Excel/PDF (MVP; fuera demo); notificaciones push/WhatsApp automáticas (el canal WhatsApp es solo para **compartir el link** y feedback humano).

#### Definition of Done (DoD)
- AC1–AC6 verificados en demo.  
- Reporte demo = hoy (# ventas + total $) únicamente.  
- Umbrales solo vía seed documentados para QA.  
- Checklist UX mayores en listas y vacíos.  
- Métrica de éxito demo alcanzable: usuario ve aviso y/o reporte tras ≥1 venta sin ayuda.  
- Sin scope creep fiscal/delivery.  

#### Checklist usabilidad UI (usuario mayor)
- [ ] Lista de avisos escaneable: poco texto, mucho aire  
- [ ] Alertas con contraste (evitar solo color; complementar texto)  
- [ ] Reporte en lenguaje simple (“Hoy: N ventas · $X”) — vos  
- [ ] Botones grandes para volver / ir a vender  
- [ ] No gráficos complejos; números grandes preferibles a charts densos  
- [ ] Máx. ~3 pasos desde home  
- [ ] Estado vacío amable, no técnico  

#### Por definir
- Una pantalla vs dos (avisos | reporte) — UI-handoff usa una sola; seguir handoff salvo cambio.  
- Si avisos se actualizan en vivo al volver de una venta en la misma sesión (esperado sí).  

#### Notas
- Defaults de umbral viven en seed (UI-handoff: umbral 5) — no inventar reglas de negocio de reposición.  
- Últimos 7 días = MVP note explícita.

---

## 3. Cierre — Handoff y éxito

### Handoff Diseño ∥ Frontend
| Quién | Pedido |
|-------|--------|
| **Diseño** | Wire/UI ultra simple mayores: home + productos + venta rápida (lista + filtro / escaneo falso) + avisos/reporte hoy; botones grandes; contraste; copy corto ES-AR (vos); máx. ~3 pasos; poco tipeo. Nombre en UI: **Despensa el Trébol**. Ver `UI-handoff.md`. |
| **Frontend** | Demo desplegable (link); seed 12 ítems AR ya cargado; venta rápida (lista + filtro + escaneo falso); stock que baja (0 bloquea); avisos + reporte hoy; **Reiniciar demo**; Next + seed + localStorage / Vercel — **LOCKED B**. |
| **Producto / PO (Emi)** | A–D y reglas demo **LOCKED**; backlog en Ready-for-demo-scope. |
| **Developers** | Sizing de DS-DEMO-01..04. |

Orden sugerido de construcción: **01 → 02 → 03 → 04** (se puede diseñar en paralelo 01+02).

### Métrica de éxito (demo)
El dueño **abre el link**, ve **seed ya cargado**, completa **≥ 1 venta rápida**, **ve stock actualizado** y **avisos/reporte de hoy**, **sin ayuda** y **sin hardware**; da **feedback por WhatsApp**.

### Fuera de alcance (recordatorio final)
**Hardware / lector físico · AFIP/facturación · CRUD real · multi-sucursal · e-commerce · contabilidad · multi-usuario · app nativa · reportes 7d/D/S/M · features MVP.**

### Preguntas abiertas (restantes — no bloquean Ready-for-demo-scope)
1. **Copy fino** de confirmaciones / toasts si la implementación diverge del UI-handoff (validar en QA).  
2. **Cancelar a mitad de venta:** comportamiento exacto de “No, volver” (esperado: sin venta; handoff ya lo sugiere).  
3. **Layout avisos|reporte:** una pantalla vs dos — handoff = una; confirmar en implementación.  
4. **Sizing** Developers de DS-DEMO-01..04.  
5. **Lista final de precios/umbrales del seed** — UI-handoff trae JSON de 12 ítems; Producto/Diseño pueden ajustar valores sin cambiar la regla “12 ítems”.

*(Resueltas y quitadas: PO A–D; stock 0 = bloquear; reporte = hoy # + $; 7d = MVP; reset = “Reiniciar demo”; seed = 12; tech Next+seed+localStorage; sin multi-usuario; ES-AR vos; seed ya cargado; venta lista+filtro+escaneo falso.)*

---

*Backlog Demo Paso 0 — DS-DEMO-01..04 · Producto: **Despensa el Trébol** · Estado global: **Ready-for-demo-scope** · A–D LOCKED · Sizing: pendiente Developers · Alineado a PRD-kickoff.md + UI-handoff.md + BRIEF.md.*
