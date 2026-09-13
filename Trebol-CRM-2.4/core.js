"use strict";
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
  { id: "p13", nombre: "Vino tinto Malbec 750 ml", precio: 6500, stock: 18, umbral: 5, codigo: "7790895013237" },
];

const Core = (() => {
  const DAY = 86400000;
  const id = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
  const money = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const day = date => { const d = new Date(date); d.setHours(0,0,0,0); return d; };
  const dateKey = date => { const d = new Date(date); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-'); };
  function number(value, label, min = 0, integer = false) {
    if (String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > 1e9 || (integer && !Number.isInteger(Number(value)))) throw Error(label + ': ingresá un valor válido' + (integer ? ' entero' : '') + '.');
    return Number(value);
  }
  const DEFAULT_TYPES = {p1:'Leches',p2:'Panes',p3:'Gaseosas',p4:'Yerbas',p5:'Aceites',p6:'Pastas',p7:'Arroces',p8:'Azúcares',p9:'Cafés',p10:'Dulces',p11:'Aderezos',p12:'Aguas',p13:'Vinos'};
  function upgrade(s) {
    s.products = s.products.map((p,i)=>product(p,i));
    s.sales.forEach((sale,i)=>{sale.number ??= i+1; sale.items.forEach(l=>{l.tipo ??= s.products.find(p=>p.id===l.id)?.tipo || 'General';});});
    s.orders??=[];
    s.orders=s.orders.map((o,i)=>({...o,number:o.number||i+1,supplier:o.supplier||'Sin especificar',note:o.note||'',receipts:o.receipts||[],items:purchaseItems(o).map(l=>{const p=s.products.find(p=>p.id===l.productId);return {...l,nombre:l.nombre||p?.nombre||'Producto anterior',codigo:l.codigo||p?.codigo||'',categoria:l.categoria||p?.categoria||'Sin categoría',received:l.received??(o.status==='received'?l.qty:0),cost:l.cost??p?.costo??0};})}));
    s.suppliers=[...new Set([...(s.suppliers||[]),...s.orders.map(o=>o.supplier)])].filter(x=>x!=='Sin especificar');
    s.purchaseDraft??={supplier:'',note:'',items:[],copiedFrom:null};
    s.uiSchema = 5; return s;
  }
  function product(p, i=0, now=new Date()) {
    return {...p, tipo:p.tipo || DEFAULT_TYPES[p.id] || 'General', categoria:p.categoria || ['Lácteos','Panificados','Bebidas','Almacén'][i % 4], costo:p.costo ?? money(p.precio * .7),
      revisionDias:p.revisionDias ?? 7, entregaDias:p.entregaDias ?? 2, z:p.z ?? 1.65,
      demanda:p.demanda ?? 1, desviacion:p.desviacion ?? .7, fuente:p.fuente || 'manual',
      proximaRevision:p.proximaRevision || dateKey(now)};
  }
  function seed(now=new Date()) {
    const categories=['Lácteos','Panificados','Bebidas','Almacén','Almacén','Almacén','Almacén','Almacén','Almacén','Galletitas','Almacén','Bebidas','Bebidas'];
    const products=SEED_PRODUCTS.map((p,i)=>product({...p,categoria:categories[i],fuente:'historial',stock:i===8?0:p.stock},i,now));
    const sales=[];
    for(let days=28;days>=0;days--) for(let j=0;j<2+(days%3);j++){
      const at=day(now);at.setDate(at.getDate()-days);at.setHours(days===0?8+j:10+j,15);
      if(at>now) continue;
      const picks=days===0&&j===0?[2,12]:[(days+j)%products.length,(days*3+j+1)%products.length];
      const items=[...new Set(picks)].map((index,k)=>({id:products[index].id,nombre:products[index].nombre,categoria:products[index].categoria,tipo:products[index].tipo,cant:1+(days+j+k)%3,precio:products[index].precio,costo:products[index].costo}));
      sales.push({id:id(),number:sales.length+1,at:at.toISOString(),items,total:money(items.reduce((a,l)=>a+l.precio*l.cant,0)),payment:['Efectivo','Transferencia','Tarjeta'][j%3],status:'confirmed',example:true});
    }
    const created=day(now);created.setDate(created.getDate()-29);
    const movements=products.map(p=>({id:id(),productId:p.id,at:created.toISOString(),qty:p.stock+sales.reduce((s,v)=>s+v.items.filter(l=>l.id===p.id).reduce((a,l)=>a+l.cant,0),0),type:'Inicial',reason:'Existencias de ejemplo'}));
    for(const s of sales) for(const l of s.items) movements.push({id:id(),productId:l.id,at:s.at,qty:-l.cant,type:'Venta',saleId:s.id,reason:'Venta de ejemplo'});
    return {version:3,revision:0,products,sales,movements,orders:[],priceHistory:[],createdAt:created.toISOString(),example:true};
  }
  function migrate(old, now=new Date()) {
    const grouped=new Map();
    for(const l of old.sales || []){
      if(!grouped.has(l.at)) grouped.set(l.at,{id:id(),at:l.at,items:[],total:0,payment:'Sin registrar',status:'confirmed',legacy:true});
      const s=grouped.get(l.at);s.items.push({id:l.id,nombre:l.nombre,cant:l.cant || 1,precio:money(l.precio/(l.cant||1)),categoria:'Sin categoría',costo:null});s.total=money(s.total+l.precio);
    }
    return {version:3,revision:0,products:old.products.map((p,i)=>product(p,i,now)),sales:[...grouped.values()],movements:old.products.map(p=>({id:id(),productId:p.id,at:now.toISOString(),qty:p.stock,type:'Inicial',reason:'Saldo al migrar demo anterior'})),orders:[],priceHistory:[],createdAt:now.toISOString(),example:false};
  }
  function sell(s, cart, payment, now=new Date()){
    if(!cart.length) throw Error('Agregá al menos un producto.');
    const quantities=new Map();
    for(const l of cart) quantities.set(l.id,(quantities.get(l.id)||0)+number(l.cant,'Cantidad',1,true));
    const items=[...quantities].map(([pid,cant])=>{
      const p=s.products.find(p=>p.id===pid);
      if(!p || cant>p.stock) throw Error('Stock insuficiente. Revisá el carrito.');
      return {id:p.id,nombre:p.nombre,categoria:p.categoria,tipo:p.tipo,cant,precio:p.precio,costo:p.costo};
    });
    const sale={id:id(),number:Math.max(0,...s.sales.map(x=>x.number||0))+1,at:now.toISOString(),items,total:money(items.reduce((a,l)=>a+l.precio*l.cant,0)),payment,status:'confirmed'};
    for(const l of items){s.products.find(p=>p.id===l.id).stock-=l.cant;s.movements.push({id:id(),productId:l.id,at:sale.at,qty:-l.cant,type:'Venta',saleId:sale.id,reason:'Venta confirmada'});}
    s.sales.push(sale);return sale;
  }
  function cancel(s,saleId,reason,now=new Date()){
    const sale=s.sales.find(x=>x.id===saleId);
    if(!sale || sale.status!=='confirmed') throw Error('La venta ya fue anulada o no existe.');
    if(!reason.trim()) throw Error('Indicá un motivo.');
    for(const l of sale.items) if(!s.products.find(p=>p.id===l.id)) throw Error('No se encontró el producto para restituir el stock.');
    sale.status='cancelled';sale.cancelledAt=now.toISOString();sale.reason=reason.trim();
    for(const l of sale.items){s.products.find(p=>p.id===l.id).stock+=l.cant;s.movements.push({id:id(),productId:l.id,at:sale.cancelledAt,qty:l.cant,type:'Anulación',saleId,reason:reason.trim()});}
  }
  function prices(s, ids, pct, exact, field="precio"){
    if(!["precio","costo"].includes(field)) throw Error("Valor no permitido.");
    const min=field==="costo"?0:.01;
    if(!ids.length) throw Error('Seleccioná al menos un producto.');
    if(exact === undefined){
      number(pct,'Porcentaje',-100);
      if(pct===0 || pct>10000 || (field==='precio' && pct<=-100))throw Error('Porcentaje fuera del rango permitido.');
    }
    const changes=ids.map(pid=>{
      const p=s.products.find(x=>x.id===pid);
      if(!p) throw Error('Producto no encontrado.');
      const price=money(exact===undefined ? p[field]*(1+pct/100) : number(exact,'Importe',min));
      number(price,'Importe',min); return {p,price};
    });
    for(const {p,price} of changes){s.priceHistory.push({id:id(),productId:p.id,at:new Date().toISOString(),field,before:p[field],after:price});p[field]=price;}
  }
  function range(period,anchor=new Date()){
    const start=day(anchor),end=day(anchor);
    if(period==='week'){start.setDate(start.getDate()-((start.getDay()+6)%7));end.setTime(start.getTime());end.setDate(end.getDate()+7);}
    else if(period==='month'){start.setDate(1);end.setMonth(end.getMonth()+1,1);}
    else end.setDate(end.getDate()+1);
    return {start,end};
  }
  const within=(at,r)=>new Date(at)>=r.start && new Date(at)<r.end;
  function summarizeSales(sales){
    const top=new Map(),payments=Object.create(null);
    let total=0,units=0,cost=0,missingCostUnits=0;
    for(const sale of sales)for(const l of sale.items){
      const value=money(l.precio*l.cant),hasCost=typeof l.costo==='number'&&Number.isFinite(l.costo)&&l.costo>=0,lineCost=hasCost?money(l.costo*l.cant):0;
      total+=value;units+=l.cant;cost+=lineCost;if(!hasCost)missingCostUnits+=l.cant;
      payments[sale.payment]=(payments[sale.payment]||0)+value;
      const row=top.get(l.id)||{id:l.id,nombre:l.nombre,units:0,total:0,cost:0,missingCostUnits:0,tickets:0};
      row.units+=l.cant;row.total=money(row.total+value);row.cost=money(row.cost+lineCost);if(!hasCost)row.missingCostUnits+=l.cant;
      top.set(l.id,row);
    }
    for(const sale of sales)for(const pid of new Set(sale.items.map(l=>l.id)))top.get(pid).tickets++;
    for(const k of Object.keys(payments))payments[k]=money(payments[k]);
    return {sales,total:money(total),units,tickets:sales.length,average:sales.length?money(total/sales.length):0,cost:missingCostUnits?null:money(cost),margin:missingCostUnits?null:money(total-cost),missingCostUnits,top:[...top.values()].sort((a,b)=>b.units-a.units||b.total-a.total||a.nombre.localeCompare(b.nombre)),payments};
  }
  function report(s,r,category='all',payment='all'){
    const sales=s.sales.filter(v=>v.status==='confirmed' && (!r||within(v.at,r)) && (payment==='all'||v.payment===payment)).map(v=>({...v,items:v.items.filter(l=>category==='all'||l.categoria===category)})).filter(v=>v.items.length);
    return summarizeSales(sales);
  }
  function createProduct(s,values){
    const textFields={};
    for(const key of ['nombre','categoria','tipo']){textFields[key]=String(values[key]||'').trim();if(!textFields[key]||textFields[key].length>120)throw Error('Completá '+key+' (máximo 120 caracteres).');}
    let code=String(values.codigo||'').trim();
    if(!code){let n=s.products.length+1;do{code='P-'+String(n++).padStart(5,'0');}while(s.products.some(p=>p.codigo===code));}
    if(code.length>40||/[\x00-\x1f\x7f]/.test(code))throw Error('El código no es válido (máximo 40 caracteres).');
    if(s.products.some(p=>p.codigo===code))throw Error('Ese código ya está registrado. Cargá stock en el producto existente.');
    const precio=money(number(values.precio,'Precio de venta',.01)),costo=money(number(values.costo,'Costo',0)),stock=number(values.stock,'Stock inicial',0,true);
    const p=product({id:id(),...textFields,codigo:code,precio,costo,stock});
    s.products.push(p);s.movements.push({id:id(),productId:p.id,at:new Date().toISOString(),qty:stock,type:'Inicial',reason:'Alta de producto'});return p;
  }
  const purchaseNumber = o => 'PC-'+String(o.number||0).padStart(5,'0');
  const purchaseItems = o => Array.isArray(o.items)?o.items:[{productId:o.productId,qty:o.qty,received:o.status==='received'?o.qty:0}];
  const openPurchase = o => ['pending','partial'].includes(o.status);
  function pendingUnits(s,pid){return (s.orders||[]).filter(openPurchase).reduce((sum,o)=>sum+purchaseItems(o).filter(l=>l.productId===pid).reduce((a,l)=>a+Math.max(0,l.qty-(l.received||0)),0),0);}
  function purchaseLines(s,items){
    if(!Array.isArray(items)||!items.length)throw Error('Agregá al menos un producto al pedido.');
    const quantities=new Map();
    for(const l of items)quantities.set(l.productId,(quantities.get(l.productId)||0)+number(l.qty,'Cantidad a pedir',1,true));
    return [...quantities].map(([pid,qty])=>{const p=s.products.find(p=>p.id===pid);if(!p)throw Error('Un producto del pedido ya no existe.');
      return {productId:pid,nombre:p.nombre,codigo:p.codigo,categoria:p.categoria,qty:number(qty,'Cantidad acumulada',1,true),received:0,cost:p.costo};});
  }
  function savePurchase(s,draft,now=new Date()){
    const supplier=String(draft.supplier||'').trim();if(!supplier||supplier.length>100)throw Error('Elegí un proveedor.');
    const note=String(draft.note||'').trim();if(note.length>500)throw Error('La observación admite hasta 500 caracteres.');
    const items=purchaseLines(s,draft.items);
    const o={id:id(),number:Math.max(0,...s.orders.map((o,i)=>o.number||i+1))+1,supplier,note,items,at:now.toISOString(),status:'pending',copiedFrom:draft.copiedFrom||null,receipts:[]};
    s.orders.push(o);return o;
  }
  function receivePurchase(s,oid,receivedItems,now=new Date()){
    const order=s.orders.find(o=>o.id===oid);if(!order||!openPurchase(order))throw Error('El pedido ya fue recibido o cancelado.');
    const lines=purchaseItems(order),requests=receivedItems||lines.map(l=>({productId:l.productId,qty:l.qty-(l.received||0)}));
    const seen=new Set(),changes=[];
    for(const l of requests){
      if(seen.has(l.productId))throw Error('Producto repetido en la recepción.');seen.add(l.productId);
      const line=lines.find(x=>x.productId===l.productId),p=s.products.find(x=>x.id===l.productId);
      if(!line||!p)throw Error('No se encontró el producto de la recepción.');
      const qty=number(l.qty,'Cantidad recibida',0,true);if(qty>line.qty-(line.received||0))throw Error('La cantidad recibida supera lo pendiente de '+p.nombre+'.');
      number(p.stock+qty,'Stock resultante',0,true);if(qty)changes.push({line,p,qty});
    }
    if(!changes.length)throw Error('Indicá al menos una unidad recibida.');
    const at=now.toISOString(),receipt={id:id(),at,items:changes.map(c=>({productId:c.p.id,qty:c.qty}))};
    for(const {line,p,qty} of changes){line.received=(line.received||0)+qty;p.stock+=qty;s.movements.push({id:id(),productId:p.id,qty,at,type:'Ingreso',orderId:order.id,reason:'Recepción de '+purchaseNumber(order)});}
    order.items=lines;order.receipts??=[];order.receipts.push(receipt);
    order.status=lines.every(l=>l.received===l.qty)?'received':'partial';if(order.status==='received')order.receivedAt=at;
    return order;
  }
  function cancelPurchase(s,oid,reason,now=new Date()){
    const order=s.orders.find(o=>o.id===oid);if(!order||!openPurchase(order))throw Error('El pedido no tiene cantidades pendientes.');
    if(!String(reason||'').trim())throw Error('Elegí un motivo.');
    order.status='cancelled';order.cancelledAt=now.toISOString();order.reason=String(reason).trim();return order;
  }
  function repeatPurchase(s,oid){
    const order=s.orders.find(o=>o.id===oid);if(!order)throw Error('No se encontró el pedido.');
    const items=purchaseLines(s,purchaseItems(order));
    s.purchaseDraft={supplier:order.supplier||'Sin especificar',note:order.note||'',items:items.map(l=>({productId:l.productId,qty:l.qty})),copiedFrom:order.id};return s.purchaseDraft;
  }
  function replenishment(s,p,now=new Date()){
    const start=day(now);start.setDate(start.getDate()-28);
    const created=day(s.createdAt);if(created>start) start.setTime(created.getTime());
    const counts=[];for(let d=new Date(start);d<day(now);d.setDate(d.getDate()+1)) counts.push({key:dateKey(d),qty:0});
    for(const sale of s.sales.filter(v=>v.status==='confirmed')){const c=counts.find(c=>c.key===dateKey(sale.at));if(c)c.qty+=sale.items.filter(l=>l.id===p.id).reduce((a,l)=>a+l.cant,0);}
    const enough=counts.length>=7;
    const hist=p.fuente==='historial'&&enough;
    const mean=hist?counts.reduce((a,c)=>a+c.qty,0)/counts.length:p.demanda;
    const sigma=hist?Math.sqrt(counts.reduce((a,c)=>a+(c.qty-mean)**2,0)/(counts.length-1)):p.desviacion;
    const safety=Math.ceil(p.z*sigma*Math.sqrt(p.revisionDias+p.entregaDias));
    const target=Math.ceil(mean*(p.revisionDias+p.entregaDias)+safety);
    const pending=pendingUnits(s,p.id);
    return {mean,sigma,safety,target,pending,qty:Math.max(0,target-p.stock-pending),due:p.proximaRevision<=dateKey(now),source:hist?'Historial: '+counts.length+' días completos':'Estimación configurada',fallback:p.fuente==='historial'&&!enough,critical:p.stock<=safety};
  }
  return {DAY,id,money,day,dateKey,number,product,upgrade,seed,migrate,sell,cancel,prices,range,within,report,summarizeSales,createProduct,replenishment,purchaseNumber,purchaseItems,openPurchase,pendingUnits,savePurchase,receivePurchase,cancelPurchase,repeatPurchase};
})();
if(typeof module!=='undefined') module.exports=Core;
