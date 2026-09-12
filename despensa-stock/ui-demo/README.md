# Despensa el Trébol — Demo UI

Prototipo HTML estático. **Shell CRM-light + Home operativo** (DS-DEMO-11) + tipografía seria (DS-DEMO-12) · seed + `localStorage` · **sin BD**. Sin build. **Cero emojis**.

## Cómo abrir

```bash
cd /workspace/despensa-stock/ui-demo
python3 -m http.server 8080
```

Abrí `http://localhost:8080` (o `index.html` directo).

## Archivos

| Archivo | Rol |
|---------|-----|
| `index.html` | Shell · Home 3 zonas · 5 vistas |
| `styles.css` | Tokens DS-DEMO-12 · layout Home |
| `app.js` | Seed v2 · carrito compartido Home↔Vender · localStorage |

## Qué probar

1. **Inicio** — vender embebido · a reponer (máx 4) · mini-reporte hoy · Reiniciar demo
2. **Nav** — Inicio · Vender · **Depósito** · Avisos · Reportes (letras I/V/D/A/R)
3. **Vender** — POS full (mismo carrito que Home)
4. **Depósito** — cards RO + buscar

Handoff: `../UI-handoff.md`
