# QA static inspect — despensa demo 11–14

- **URL:** https://temporary-brisk-magenta-27khba6.vercel.app
- **Method:** curl HTML + JS/CSS chunks only (no GUI browser)
- **Date:** 2026-09-12
- **Routes fetched:** `/`, `/vender`, `/productos`, `/avisos`, `/reportes`
- **Assets searched:** SSR HTML for those routes + Next/Turbopack chunks  
  `35oxum1x2pycw.js`, `1aos3ldqxqapi.js`, `0lc08leg_1z3x.js`, `3iqfl_7n2703k.js`, `3gikvtaj1xalv.js`, `42b2wb22p9ln7.js`, shared runtime/framework chunks, `2b00cea5zsyhe.css`

## String hit matrix

| Search chunk | Hit? | Where / notes |
|---|---|---|
| `Despensa el Trébol` | **HIT** | `<title>`, brand in sidebar/mobile topbar on all routes; JS const in route chunks (`35oxum1x2pycw.js`, `1aos3ldqxqapi.js`, `0lc08leg_1z3x.js`, `3iqfl_7n2703k.js`, `3gikvtaj1xalv.js`) |
| `Mi Despensa` | **GAP** | No occurrences in HTML or any downloaded JS/CSS |
| `Depósito` | **HIT** | Nav label for `/productos` (sidebar + bottom nav); page title on `/productos`; JS nav config `label:"Depósito"`; `AppLayout` title `"Depósito"` in `0lc08leg_1z3x.js` |
| `Productos` as nav | **GAP** | Literal `Productos` never appears. Route path remains `/productos`, but visible nav/page label is **Depósito** |
| `Vacío · tocá un producto` | **HIT** | POS empty cart copy in `35oxum1x2pycw.js` (home) and `1aos3ldqxqapi.js` (`/vender`): `className:"pos-cart__empty"` |
| `N ventas` | **PARTIAL / pattern gap** | Exact string `N ventas` **not** present. Dynamic templates use `` `${count} ventas` `` — e.g. home `Hoy: ${s.count} ventas · …` / `Hoy: sin ventas todavía` (`35oxum1x2pycw.js`); reportes `0 ventas · $0` / `` `${s.count} ventas · …` `` (`3gikvtaj1xalv.js`) |
| `mi-despensa-demo-v2` | **HIT** | Storage key in `42b2wb22p9ln7.js` (`s="mi-despensa-demo-v2"`, legacy `d="mi-despensa-demo-v1"`, `localStorage`) |
| emoji in nav labels | **GAP** | Nav labels are plain text: Inicio, Vender, Depósito, Avisos, Reportes. Icons are letter badges (`I`/`V`/`D`/`A`/`R`), not emoji. No emoji codepoints or `\uD83…` escapes found in assets |
| `Simular escaneo` | **HIT** | Button label in POS (`35oxum1x2pycw.js`, `1aos3ldqxqapi.js`); calls `getRandomInStockProduct` |

## Nav snapshot (static HTML + JS)

```
Inicio (/) · Vender (/vender) · Depósito (/productos) · Avisos (/avisos) · Reportes (/reportes)
letters: I V D A R — no emoji
brand / title: Despensa el Trébol
```

JS source of truth (shared across route chunks):

```js
[{href:"/",label:"Inicio",letter:"I"},
 {href:"/vender",label:"Vender",letter:"V"},
 {href:"/productos",label:"Depósito",letter:"D"},
 {href:"/avisos",label:"Avisos",letter:"A"},
 {href:"/reportes",label:"Reportes",letter:"R"}]
```

## Hits (detail)

1. **Branding `Despensa el Trébol`** — consistent in document title, CRM brand chrome, and JS string constant.
2. **Nav uses `Depósito`** for the stock/catalog section (href still `/productos`).
3. **POS empty state** — exact `Vacío · tocá un producto` in cart empty UI.
4. **Demo persistence** — `mi-despensa-demo-v2` (+ `mi-despensa-demo-v1` migrate/legacy) in shared data chunk.
5. **Scanner demo control** — `Simular escaneo` button present in POS workspace chunks.

## Gaps / mismatches vs search list

1. **`Mi Despensa`** — absent; app branded **Despensa el Trébol** instead.
2. **`Productos` as nav label** — absent; replaced by **Depósito** (path `/productos` only).
3. **Exact `N ventas`** — absent as a static literal; UI uses interpolated `` `${n} ventas` `` / empty-state Spanish copy.
4. **Emoji in nav labels** — absent; letter avatars only.

## Limits of this inspect

- Client-only runtime UI (after hydration / localStorage sales counts) not exercised.
- No GUI browser, screenshots, or interaction.
- Only public static HTML/JS/CSS from the listed routes + linked chunks.

## Verdict (static)

Demo build matches the **Despensa el Trébol / Depósito / POS empty + Simular escaneo / mi-despensa-demo-v2** set. Gaps vs older or alternate copy: **Mi Despensa**, **Productos** nav wording, **emoji nav**, and exact literal **N ventas**.
