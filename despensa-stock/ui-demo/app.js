/**
 * Despensa el Trébol — Demo
 * Shell CRM-light + Home operativo (DS-DEMO-11) + tipografía seria (DS-DEMO-12)
 * seed + localStorage · sin BD · sin emojis
 */

const STORAGE_KEY = "mi-despensa-demo-v2";

const SEED_PRODUCTS = [
  { id: "p1", nombre: "Leche La Serenísima 1L", precio: 1450, stock: 12, umbral: 5, codigo: "7790895001234" },
  { id: "p2", nombre: "Pan lactal Bimbo", precio: 2200, stock: 8, umbral: 5, codigo: "7790895002231" },
  { id: "p3", nombre: "Coca-Cola 2,25 L", precio: 2800, stock: 4, umbral: 5, codigo: "7790895003238" },
  { id: "p4", nombre: "Yerba Mate Amanda 1 kg", precio: 4500, stock: 7, umbral: 5, codigo: "7790895004235" },
  { id: "p5", nombre: "Aceite Natura 900 ml", precio: 3200, stock: 3, umbral: 5, codigo: "7790895005232" },
  { id: "p6", nombre: "Fideos Matarazzo 500 g", precio: 980, stock: 15, umbral: 5, codigo: "7790895006239" },
  { id: "p7", nombre: "Arroz Gallo Oro 1 kg", precio: 1850, stock: 6, umbral: 5, codigo: "7790895007236" },
  { id: "p8", nombre: "Azúcar Ledesma 1 kg", precio: 1200, stock: 10, umbral: 5, codigo: "7790895008233" },
  { id: "p9", nombre: "Café La Virginia 500 g", precio: 5100, stock: 2, umbral: 5, codigo: "7790895009230" },
  { id: "p10", nombre: "Galletitas Oreo", precio: 2400, stock: 9, umbral: 5, codigo: "7790895010236" },
  { id: "p11", nombre: "Mayonesa Hellmann's 500 g", precio: 2900, stock: 5, umbral: 5, codigo: "7790895011233" },
  { id: "p12", nombre: "Agua Villa del Sur 2 L", precio: 1100, stock: 14, umbral: 5, codigo: "7790895012230" },
];

const PAGE_TITLES = {
  home: "Inicio",
  sell: "Vender",
  products: "Depósito",
  alerts: "Avisos",
  reports: "Reportes",
};

const HOME_RESTOCK_MAX = 4;

/** @type {{ products: typeof SEED_PRODUCTS, sales: Array<{id:string,nombre:string,precio:number,cant:number,at:string}> }} */
let state = loadState();
/** @type {Array<{id:string, cant:number}>} — mismo state para Home y /vender */
let cart = [];
let toastTimer = null;
let currentView = "home";

function cloneSeed() {
  return {
    products: SEED_PRODUCTS.map((p) => ({ ...p })),
    sales: [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw);
    if (!parsed.products || !Array.isArray(parsed.products)) return cloneSeed();
    const products = parsed.products.map((p) => {
      const seed = SEED_PRODUCTS.find((s) => s.id === p.id);
      return {
        ...p,
        codigo: p.codigo || (seed && seed.codigo) || "",
        umbral: typeof p.umbral === "number" ? p.umbral : 5,
      };
    });
    return {
      products,
      sales: Array.isArray(parsed.sales) ? parsed.sales : [],
    };
  } catch {
    return cloneSeed();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatMoney(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}

function todaySales() {
  const today = new Date().toDateString();
  return state.sales.filter((s) => new Date(s.at).toDateString() === today);
}

function getProduct(id) {
  return state.products.find((p) => p.id === id);
}

function findByCodigo(code) {
  const c = String(code).trim();
  if (!c) return null;
  return state.products.find((p) => p.codigo === c);
}

function isLow(p) {
  return p.stock <= p.umbral;
}

function normalizeText(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filterProducts(query, { inStockOnly = false } = {}) {
  const q = normalizeText(query.trim());
  let list = state.products;
  if (inStockOnly) list = list.filter((p) => p.stock > 0);
  if (!q) return list;
  return list.filter(
    (p) =>
      normalizeText(p.nombre).includes(q) ||
      String(p.codigo || "").includes(query.trim())
  );
}

function cartQty(productId) {
  const line = cart.find((l) => l.id === productId);
  return line ? line.cant : 0;
}

function availableStock(p) {
  return p.stock - cartQty(p.id);
}

/* ---------- Navigation ---------- */

function showView(name) {
  currentView = name;
  document.querySelectorAll(".view").forEach((el) => {
    el.classList.remove("active");
    el.hidden = true;
  });
  const view = document.getElementById("view-" + name);
  if (!view) return;
  view.hidden = false;
  view.classList.add("active");

  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.textContent = PAGE_TITLES[name] || name;

  document.querySelectorAll(".nav-item").forEach((btn) => {
    const match = btn.getAttribute("data-nav") === name;
    btn.classList.toggle("is-active", match);
    if (match) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });

  window.scrollTo(0, 0);

  if (name === "home") renderHome();
  if (name === "products") renderProducts();
  if (name === "sell") {
    renderSell();
    renderCart();
    const scan = document.getElementById("scan-input");
    if (scan) setTimeout(() => scan.focus(), 60);
  }
  if (name === "alerts") renderAlerts();
  if (name === "reports") renderReports();
}

/* ---------- Cart / POS (shared Home + /vender) ---------- */

function addToCart(productId, silent) {
  const p = getProduct(productId);
  if (!p) return;
  if (availableStock(p) <= 0) {
    showToast("Sin stock de este producto");
    return;
  }
  const line = cart.find((l) => l.id === productId);
  if (line) line.cant += 1;
  else cart.push({ id: productId, cant: 1 });
  if (!silent) showToast("+1 " + p.nombre);
  refreshPosUI();
}

function changeQty(productId, delta) {
  const line = cart.find((l) => l.id === productId);
  if (!line) return;
  const p = getProduct(productId);
  if (!p) return;
  if (delta > 0 && availableStock(p) <= 0) {
    showToast("Sin stock de este producto");
    return;
  }
  line.cant += delta;
  if (line.cant <= 0) {
    cart = cart.filter((l) => l.id !== productId);
  }
  refreshPosUI();
}

function clearCart() {
  cart = [];
  refreshPosUI();
}

function cartTotal() {
  return cart.reduce((sum, line) => {
    const p = getProduct(line.id);
    return sum + (p ? p.precio * line.cant : 0);
  }, 0);
}

function confirmSale() {
  if (cart.length === 0) return;

  for (const line of cart) {
    const p = getProduct(line.id);
    if (!p || p.stock < line.cant) {
      showToast("Stock insuficiente");
      return;
    }
  }

  let items = 0;
  const at = new Date().toISOString();
  for (const line of cart) {
    const p = getProduct(line.id);
    p.stock -= line.cant;
    items += line.cant;
    state.sales.push({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio * line.cant,
      cant: line.cant,
      at,
    });
  }
  saveState();
  cart = [];
  showToast(
    "Listo · " +
      items +
      (items === 1 ? " ítem" : " ítems") +
      " · " +
      formatMoney(todaySales().reduce((a, s) => a + s.precio, 0))
  );

  ["sell-search", "scan-input", "home-sell-search", "home-scan-input"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  refreshPosUI();
  if (currentView === "home") renderHome();
}

function handleScanEnter(inputId) {
  const input = document.getElementById(inputId || "scan-input");
  if (!input) return;
  const code = input.value.trim();
  if (!code) return;
  const p = findByCodigo(code);
  input.value = "";
  if (!p) {
    showToast("Código no encontrado");
    return;
  }
  addToCart(p.id);
  input.focus();
}

function simulateScan(inputId) {
  const available = state.products.filter((p) => availableStock(p) > 0);
  if (available.length === 0) {
    showToast("No hay productos con stock");
    return;
  }
  const pick = available[Math.floor(Math.random() * available.length)];
  const id = inputId || "scan-input";
  const input = document.getElementById(id);
  if (input) {
    input.value = pick.codigo;
    setTimeout(() => {
      handleScanEnter(id);
    }, 120);
  } else {
    addToCart(pick.id);
  }
}

function refreshPosUI() {
  renderSell();
  renderHomeSell();
  renderCart();
  renderHomeCart();
  if (currentView === "home") {
    renderHomeMiniReport();
    renderHomeRestock();
  }
}

/* ---------- Render ---------- */

function renderHomeMiniReport() {
  const sales = todaySales();
  const total = sales.reduce((a, s) => a + s.precio, 0);
  const count = sales.reduce((a, s) => a + (s.cant || 1), 0);
  const el = document.getElementById("home-summary");
  if (!el) return;
  if (sales.length === 0) {
    el.textContent = "Sin ventas todavía";
  } else {
    el.textContent =
      count +
      (count === 1 ? " venta" : " ventas") +
      " · " +
      formatMoney(total);
  }
}

function renderHomeRestock() {
  const low = state.products.filter(isLow).sort((a, b) => a.stock - b.stock);
  const list = document.getElementById("home-restock-list");
  const more = document.getElementById("home-restock-more");
  if (!list) return;

  if (low.length === 0) {
    list.innerHTML =
      '<p class="empty-state">Todo bien, no hay que reponer</p>';
    if (more) more.hidden = true;
    return;
  }

  const shown = low.slice(0, HOME_RESTOCK_MAX);
  list.innerHTML = shown
    .map(
      (p) =>
        '<div class="restock-item">' +
        '<span class="restock-name">' +
        escapeHtml(p.nombre) +
        "</span>" +
        '<span class="restock-stock">' +
        p.stock +
        " u.</span>" +
        "</div>"
    )
    .join("");

  if (more) more.hidden = low.length <= HOME_RESTOCK_MAX;
}

function renderHome() {
  renderHomeMiniReport();
  renderHomeSell();
  renderHomeCart();
  renderHomeRestock();
}

function renderSellList(container, products, emptyMsg) {
  container.innerHTML = "";
  if (products.length === 0) {
    const p = document.createElement("p");
    p.className = "typeahead-empty";
    p.textContent = emptyMsg || "No hay coincidencias";
    container.appendChild(p);
    return;
  }

  products.forEach((p) => {
    const avail = availableStock(p);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "result-btn" + (isLow(p) ? " is-low" : "");
    btn.setAttribute("role", "option");
    btn.disabled = avail <= 0;
    btn.setAttribute(
      "aria-label",
      p.nombre + ", " + formatMoney(p.precio) + ", stock " + p.stock
    );
    btn.innerHTML =
      '<span class="r-main"><span class="r-name">' +
      escapeHtml(p.nombre) +
      "</span></span>" +
      '<span class="r-meta">' +
      '<span class="r-price">' +
      formatMoney(p.precio) +
      "</span>" +
      '<span class="r-stock">' +
      avail +
      " u.</span>" +
      "</span>";
    btn.addEventListener("click", () => addToCart(p.id));
    container.appendChild(btn);
  });
}

function renderSellFromInput(searchId, resultsId) {
  const input = document.getElementById(searchId);
  const results = document.getElementById(resultsId);
  if (!results) return;
  const query = input ? input.value : "";
  const inStock = state.products.filter((p) => p.stock > 0);
  const matched = filterProducts(query, { inStockOnly: true });

  let emptyMsg = "No hay coincidencias";
  if (inStock.length === 0) {
    emptyMsg = "No queda stock. Reiniciá la demo.";
  }

  renderSellList(results, matched, emptyMsg);
}

function renderSell() {
  renderSellFromInput("sell-search", "sell-results");
}

function renderHomeSell() {
  renderSellFromInput("home-sell-search", "home-sell-results");
}

function renderCartInto(linesId, totalId, confirmId, clearId) {
  const linesEl = document.getElementById(linesId);
  const totalEl = document.getElementById(totalId);
  const btnConfirm = document.getElementById(confirmId);
  const btnClear = document.getElementById(clearId);
  if (!linesEl) return;

  if (cart.length === 0) {
    linesEl.innerHTML = '<p class="cart-empty">Vacío · tocá un producto</p>';
  } else {
    linesEl.innerHTML = cart
      .map((line) => {
        const p = getProduct(line.id);
        if (!p) return "";
        const sub = p.precio * line.cant;
        return (
          '<div class="cart-line" data-id="' +
          escapeHtml(line.id) +
          '">' +
          '<span class="cart-line-name">' +
          escapeHtml(p.nombre) +
          "</span>" +
          '<span class="cart-line-sub">' +
          formatMoney(sub) +
          "</span>" +
          '<div class="cart-line-qty">' +
          '<button type="button" class="qty-btn" data-qty="-1" aria-label="Restar">−</button>' +
          '<span class="qty-num">' +
          line.cant +
          "</span>" +
          '<button type="button" class="qty-btn" data-qty="1" aria-label="Sumar">+</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    linesEl.querySelectorAll(".cart-line").forEach((row) => {
      const id = row.getAttribute("data-id");
      row.querySelectorAll(".qty-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          changeQty(id, Number(btn.getAttribute("data-qty")));
        });
      });
    });
  }

  if (totalEl) totalEl.textContent = formatMoney(cartTotal());
  const hasItems = cart.length > 0;
  if (btnConfirm) btnConfirm.disabled = !hasItems;
  if (btnClear) btnClear.disabled = !hasItems;
}

function renderCart() {
  renderCartInto("cart-lines", "cart-total", "btn-confirm-sale", "btn-clear-cart");
}

function renderHomeCart() {
  renderCartInto(
    "home-cart-lines",
    "home-cart-total",
    "home-btn-confirm-sale",
    "home-btn-clear-cart"
  );
}

function renderProducts() {
  const input = document.getElementById("products-search");
  const list = document.getElementById("products-list");
  if (!list) return;
  const query = input ? input.value : "";
  const matched = filterProducts(query, { inStockOnly: false });

  if (matched.length === 0) {
    list.innerHTML =
      '<p class="typeahead-empty">' +
      (query.trim() ? "No hay coincidencias" : "No hay productos") +
      "</p>";
    return;
  }

  list.innerHTML = matched
    .map((p) => {
      return (
        '<article class="product-card' +
        (isLow(p) ? " is-low" : "") +
        '" role="listitem">' +
        '<div class="product-info">' +
        '<p class="product-name">' +
        escapeHtml(p.nombre) +
        "</p>" +
        '<p class="product-price">' +
        formatMoney(p.precio) +
        "</p>" +
        '<p class="umbral-hint">Umbral ' +
        p.umbral +
        "</p>" +
        (isLow(p) ? '<span class="badge">Poco stock</span>' : "") +
        "</div>" +
        '<div class="product-meta">' +
        '<span class="stock-num">' +
        p.stock +
        "</span>" +
        '<span class="stock-label">stock</span>' +
        "</div>" +
        "</article>"
      );
    })
    .join("");
}

function renderAlerts() {
  const low = state.products.filter(isLow).sort((a, b) => a.stock - b.stock);
  const restock = document.getElementById("restock-list");
  if (low.length === 0) {
    restock.innerHTML =
      '<p class="empty-state">Todo bien, no hay que reponer</p>';
  } else {
    restock.innerHTML = low
      .map(
        (p) =>
          '<div class="restock-item">' +
          '<span class="restock-name">' +
          escapeHtml(p.nombre) +
          "</span>" +
          '<span class="restock-stock">' +
          p.stock +
          " u.</span>" +
          "</div>"
      )
      .join("");
  }
}

function renderReports() {
  const sales = todaySales();
  const total = sales.reduce((a, s) => a + s.precio, 0);
  const count = sales.reduce((a, s) => a + (s.cant || 1), 0);
  const summary = document.getElementById("report-summary");
  if (sales.length === 0) {
    summary.textContent = "Todavía no hubo ventas hoy";
  } else {
    summary.textContent =
      count +
      (count === 1 ? " venta" : " ventas") +
      " · " +
      formatMoney(total);
  }

  const salesList = document.getElementById("sales-list");
  if (sales.length === 0) {
    salesList.innerHTML =
      '<li class="sales-empty">Las ventas van a aparecer acá</li>';
  } else {
    const recent = [...sales].reverse().slice(0, 12);
    salesList.innerHTML = recent
      .map(
        (s) =>
          "<li><span>" +
          escapeHtml(s.nombre) +
          (s.cant && s.cant > 1 ? " ×" + s.cant : "") +
          "</span><span>" +
          formatMoney(s.precio) +
          "</span></li>"
      )
      .join("");
  }
}

function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  void el.offsetWidth;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => {
      el.hidden = true;
    }, 300);
  }, 2600);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resetDemo() {
  if (!confirm("¿Reiniciar la demo? Se vuelve al stock inicial.")) return;
  state = cloneSeed();
  cart = [];
  saveState();
  ["sell-search", "products-search", "scan-input", "home-sell-search", "home-scan-input"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    }
  );
  showToast("Demo reiniciada");
  showView("home");
}

/* ---------- Events ---------- */

document.querySelectorAll("[data-nav]").forEach((el) => {
  el.addEventListener("click", () => {
    showView(el.getAttribute("data-nav"));
  });
});

document.getElementById("btn-scan").addEventListener("click", () => simulateScan("scan-input"));
document.getElementById("home-btn-scan").addEventListener("click", () =>
  simulateScan("home-scan-input")
);

document.getElementById("btn-confirm-sale").addEventListener("click", confirmSale);
document.getElementById("home-btn-confirm-sale").addEventListener("click", confirmSale);

document.getElementById("btn-clear-cart").addEventListener("click", () => {
  clearCart();
  showToast("Carrito vacío");
});
document.getElementById("home-btn-clear-cart").addEventListener("click", () => {
  clearCart();
  showToast("Carrito vacío");
});

document.getElementById("btn-reset").addEventListener("click", resetDemo);

document.getElementById("sell-search").addEventListener("input", () => {
  renderSell();
});
document.getElementById("home-sell-search").addEventListener("input", () => {
  renderHomeSell();
});

document.getElementById("products-search").addEventListener("input", () => {
  renderProducts();
});

document.getElementById("scan-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleScanEnter("scan-input");
  }
});
document.getElementById("home-scan-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleScanEnter("home-scan-input");
  }
});

/* Init */
showView("home");
