const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js');
const now=new Date(2026,8,12,15);
test('ticket agrupado, stock, precio histórico y anulación idempotente',()=>{
 const s=C.seed(now),stock=s.products[0].stock,price=s.products[0].precio;
 const sale=C.sell(s,[{id:'p1',cant:2},{id:'p2',cant:1}],'Efectivo',now);
 assert.equal(s.products[0].stock,stock-2);assert.equal(sale.items.length,2);
 C.prices(s,['p1'],10);assert.equal(s.products[0].precio,C.money(price*1.1));assert.equal(sale.items[0].precio,price);
 C.cancel(s,sale.id,'Cliente se arrepintió',now);assert.equal(s.products[0].stock,stock);
 assert.throws(()=>C.cancel(s,sale.id,'Otra vez',now));assert.equal(s.products[0].stock,stock);
});
test('sin stock, cantidades inválidas y validación antes de descontar',()=>{
 const s=C.seed(now),stock=s.products[0].stock;
 assert.throws(()=>C.sell(s,[{id:'p1',cant:1},{id:'p9',cant:1}],'Efectivo',now));assert.equal(s.products[0].stock,stock);
 assert.throws(()=>C.sell(s,[{id:'p1',cant:-1}],'Efectivo',now));
 assert.throws(()=>C.prices(s,['p1'],NaN));
 assert.throws(()=>C.prices(s,['p1'],0,-10));
 assert.throws(()=>C.prices(s,['p1','missing'],10));assert.equal(s.products[0].precio,1450);
});
test('precios selección y todos, redondeo a centavos',()=>{
 const s=C.seed(now);C.prices(s,['p1','p2'],12.5);assert.equal(s.products[0].precio,1631.25);assert.equal(s.products[2].precio,2800);
 C.prices(s,s.products.map(p=>p.id),10);assert.equal(s.products[2].precio,3080);assert.equal(s.priceHistory.length,s.products.length+2);
});
test('períodos calendario, filtros, ranking y anulaciones excluidas',()=>{
 const s=C.seed(now);s.sales=[];
 const a=C.sell(s,[{id:'p1',cant:2},{id:'p2',cant:1}],'Efectivo',now);
 C.sell(s,[{id:'p1',cant:1}],'Tarjeta',new Date(2026,8,11,15));
 let r=C.report(s,C.range('day',now));assert.equal(r.tickets,1);assert.equal(r.units,3);assert.equal(r.total,5100);assert.equal(r.top[0].id,'p1');
 r=C.report(s,C.range('week',now));assert.equal(r.tickets,2);assert.equal(C.dateKey(C.range('week',now).start),'2026-09-07');
 assert.equal(C.dateKey(C.range('month',now).end),'2026-10-01');
 assert.equal(C.report(s,C.range('week',now),'Lácteos','Efectivo').total,2900);
 C.cancel(s,a.id,'Error',now);assert.equal(C.report(s,C.range('day',now)).total,0);
});
test('modelo P: protección T+L, seguridad, pedidos y demanda con ceros',()=>{
 const s=C.seed(now),p=s.products[0];Object.assign(p,{fuente:'manual',demanda:10,desviacion:2,revisionDias:7,entregaDias:2,z:1.65,stock:20});
 let r=C.replenishment(s,p,now);assert.equal(r.safety,10);assert.equal(r.target,100);assert.equal(r.qty,80);
 s.orders.push({productId:p.id,qty:30,status:'pending'});assert.equal(C.replenishment(s,p,now).qty,50);
 p.stock=100;assert.equal(C.replenishment(s,p,now).qty,0);
 s.sales=[];p.fuente='historial';r=C.replenishment(s,p,now);assert.equal(r.mean,0);assert.equal(r.safety,0);
 s.createdAt=now.toISOString();r=C.replenishment(s,p,now);assert.equal(r.fallback,true);assert.equal(r.mean,10);
});
test('balance de movimientos y migración sin duplicar renglones como tickets',()=>{
 const s=C.seed(now);for(const p of s.products)assert.equal(s.movements.filter(m=>m.productId===p.id).reduce((a,m)=>a+m.qty,0),p.stock);
 const m=C.migrate({products:s.products,sales:[{id:'p1',nombre:'Leche',precio:2900,cant:2,at:now.toISOString()},{id:'p2',nombre:'Pan',precio:2200,cant:1,at:now.toISOString()}]},now);
 assert.equal(m.sales.length,1);assert.equal(m.sales[0].total,5100);assert.equal(m.sales[0].items[0].precio,1450);
});

test('disminución monetaria valida todo el lote antes de cambiar y conserva tickets',()=>{
 const s=C.seed(now),original=JSON.stringify(s.sales),p=s.products[0];
 C.prices(s,['p1'],-10);assert.equal(p.precio,1305);assert.equal(s.priceHistory.at(-1).before,1450);
 assert.equal(JSON.stringify(s.sales),original);
 s.products[1].precio=.01;const before=JSON.stringify(s);
 assert.throws(()=>C.prices(s,['p1','p2'],-99));assert.equal(JSON.stringify(s),before);
 for(const pct of [-101,-100,-Infinity,NaN])assert.throws(()=>C.prices(s,['p1'],pct));
 assert.equal(JSON.stringify(s),before);
 assert.throws(()=>C.prices(s,['p1'],-101,undefined,'costo'));
 C.prices(s,['p1'],-100,undefined,'costo');assert.equal(p.costo,0);assert.equal(p.precio,1305);
});

test('CRM 2.3: resumen comercial usa importes históricos, excluye anuladas y filtra categorías',()=>{
 const s=C.seed(now);s.sales=[];
 const first=C.sell(s,[{id:'p1',cant:2},{id:'p3',cant:1}],'Efectivo',now);
 const second=C.sell(s,[{id:'p2',cant:1}],'Tarjeta',now);C.cancel(s,second.id,'Error',now);
 C.prices(s,['p1'],50);C.prices(s,['p1'],20,undefined,'costo');
 const r=C.report(s,C.range('day',now));assert.equal(r.tickets,1);assert.equal(r.units,3);assert.equal(r.total,5700);
 assert.equal(r.cost,3990);assert.equal(r.margin,1710);assert.equal(r.top[0].id,'p1');assert.equal(r.top[0].tickets,1);
 assert.equal(C.report(s,null,'Bebidas').total,2800);assert.equal(C.report(s,null,'Lácteos','Tarjeta').units,0);
 first.items[0].costo=null;const legacy=C.report(s,null);assert.equal(legacy.cost,null);assert.equal(legacy.margin,null);assert.equal(legacy.missingCostUnits,2);
});
test('CRM 2.3: alta rápida valida códigos, importes y existencia inicial sin duplicar',()=>{
 const s=C.seed(now),values={nombre:'Agua nueva',codigo:'0012345678901',categoria:'Bebidas',tipo:'Aguas',precio:'1500',costo:'1000',stock:'6'};
 const p=C.createProduct(s,values);assert.equal(p.codigo,'0012345678901');assert.equal(p.stock,6);assert.equal(s.movements.at(-1).qty,6);
 const before=JSON.stringify(s);assert.throws(()=>C.createProduct(s,values),/ya está registrado/);assert.equal(JSON.stringify(s),before);
 for(const invalid of [{codigo:'NEW',precio:'0'},{codigo:'NEW',stock:'1.5'},{codigo:'NEW',nombre:''},{codigo:'NEW',costo:''}]){assert.throws(()=>C.createProduct(s,{...values,...invalid}));assert.equal(JSON.stringify(s),before);}
 const noCode=C.createProduct(s,{...values,codigo:'',stock:0});assert(noCode.codigo.startsWith('P-'));assert.equal(noCode.stock,0);
});

test('CRM 2.4: pedido agrupado conserva lista original, suma pendientes y no cambia stock',()=>{
 const s=C.upgrade(C.seed(now)),stock=s.products[0].stock;
 const o=C.savePurchase(s,{supplier:'Proveedor A',items:[{productId:'p1',qty:3},{productId:'p1',qty:2},{productId:'p2',qty:6}]},now);
 assert.equal(o.items.length,2);assert.equal(o.items[0].qty,5);assert.equal(C.pendingUnits(s,'p1'),5);assert.equal(s.products[0].stock,stock);
 const name=o.items[0].nombre;s.products[0].nombre='Nombre nuevo';s.products[0].codigo='nuevo';assert.equal(o.items[0].nombre,name);assert.equal(o.items[0].codigo,'7790895001234');
 const b=C.upgrade(JSON.parse(JSON.stringify(s)));assert.equal(b.orders[0].items[0].nombre,name);assert.equal(C.purchaseNumber(b.orders[0]),'PC-00001');
});
test('CRM 2.4: recepción parcial y total descuentan pendientes y evitan duplicados',()=>{
 const s=C.upgrade(C.seed(now)),stock=s.products[0].stock;
 const o=C.savePurchase(s,{supplier:'A',items:[{productId:'p1',qty:5},{productId:'p2',qty:6}]},now);
 C.receivePurchase(s,o.id,[{productId:'p1',qty:2},{productId:'p2',qty:0}],now);
 assert.equal(o.status,'partial');assert.equal(s.products[0].stock,stock+2);assert.equal(C.pendingUnits(s,'p1'),3);assert.equal(C.pendingUnits(s,'p2'),6);
 assert.equal(C.replenishment(s,s.products[0],now).pending,3);
 C.receivePurchase(s,o.id,undefined,now);assert.equal(o.status,'received');assert.equal(s.products[0].stock,stock+5);assert.equal(C.pendingUnits(s,'p1'),0);
 const before=JSON.stringify(s);assert.throws(()=>C.receivePurchase(s,o.id,undefined,now));assert.equal(JSON.stringify(s),before);
});
test('CRM 2.4: recepción inválida no cambia ninguna línea y cancelación respeta lo recibido',()=>{
 const s=C.upgrade(C.seed(now)),stock=s.products[0].stock,o=C.savePurchase(s,{supplier:'A',items:[{productId:'p1',qty:5},{productId:'p2',qty:6}]},now);
 const before=JSON.stringify(s);assert.throws(()=>C.receivePurchase(s,o.id,[{productId:'p1',qty:1},{productId:'p2',qty:7}]));assert.equal(JSON.stringify(s),before);
 C.receivePurchase(s,o.id,[{productId:'p1',qty:2}],now);C.cancelPurchase(s,o.id,'Proveedor sin disponibilidad',now);
 assert.equal(o.status,'cancelled');assert.equal(C.pendingUnits(s,'p1'),0);assert.equal(s.products[0].stock,stock+2);assert.equal(o.items[0].received,2);
 assert.throws(()=>C.receivePurchase(s,o.id));
});
test('CRM 2.4: repetir crea sólo un borrador y el nuevo guardado tiene otro número',()=>{
 const s=C.upgrade(C.seed(now)),o=C.savePurchase(s,{supplier:'A',note:'Por la mañana',items:[{productId:'p1',qty:5}]},now),stock=s.products[0].stock;
 C.repeatPurchase(s,o.id);assert.equal(s.orders.length,1);assert.equal(C.pendingUnits(s,'p1'),5);assert.equal(s.purchaseDraft.items[0].qty,5);
 s.purchaseDraft.items[0].qty=8;assert.equal(o.items[0].qty,5);assert.equal(s.products[0].stock,stock);
 const copy=C.savePurchase(s,s.purchaseDraft,now);assert.notEqual(copy.id,o.id);assert.equal(copy.number,2);assert.equal(copy.copiedFrom,o.id);assert.equal(copy.items[0].qty,8);
});
test('CRM 2.4: migración de pedidos individuales conserva saldos y recepciones',()=>{
 const s=C.seed(now),stock=s.products[0].stock;s.orders=[{id:'old1',productId:'p1',qty:5,at:now.toISOString(),status:'pending'},{id:'old2',productId:'p2',qty:6,at:now.toISOString(),status:'received'}];
 C.upgrade(s);C.upgrade(s);assert.equal(s.orders.length,2);assert.equal(C.pendingUnits(s,'p1'),5);assert.equal(C.pendingUnits(s,'p2'),0);assert.equal(s.orders[1].items[0].received,6);assert.equal(s.products[0].stock,stock);
 C.receivePurchase(s,'old1');assert.equal(s.products[0].stock,stock+5);assert.equal(s.orders[0].status,'received');
});
