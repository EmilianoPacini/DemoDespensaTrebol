const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function app(initial={}){
 const elements=new Map(),storage=new Map(Object.entries(initial)),handlers={};
 const node=()=>({innerHTML:'',textContent:'',hidden:false,value:'10',classList:{add(){},remove(){}},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},scrollIntoView(){},focus(){document.activeElement=this;},setSelectionRange(){}});
 const document={querySelector(s){if(!elements.has(s))elements.set(s,node());return elements.get(s);},querySelectorAll(){return [node(),node()];},addEventListener(k,fn){handlers[k]=fn;},createElement(){return {click(){}};}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem(k,v){if(localStorage.fail)throw Error('Simulated write failure');storage.set(k,v);}};
 const ctx=vm.createContext({document,localStorage,structuredClone,console,Date,Math,Number,String,JSON,Set,Map,Blob,URL,globalThis:{crypto:require('node:crypto').webcrypto},window:{addEventListener(){},scrollTo(){}},setTimeout:()=>1,clearTimeout(){},FormData:class{constructor(target){return new Map(target.fields || []);}}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../core.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../purchase-pdf.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),ctx);
 return {run:s=>vm.runInContext(s,ctx),storage,localStorage,handlers,elements};
}
test('renderiza todas las vistas y conserva textos y tablas',()=>{
 const a=app();for(const v of ['home','orders','products','prices','alerts','reports']){a.run("view='"+v+"';render()");const html=a.elements.get('#app').innerHTML;assert(html.length>1000);assert(!html.includes('undefined'));assert(!html.includes('NaN'));}assert(a.run("state.sales.length")>50);
});
test('venta con confirmación, cancelación y recarga mantienen inventario',()=>{
 const a=app();const before=a.run("get('p1').stock"),count=a.run('state.sales.length');
 a.run("cart=[{id:'p1',cant:2},{id:'p2',cant:1}];checkout()");
 assert.equal(a.run('state.sales.length'),count);assert.equal(a.run("get('p1').stock"),before);
 assert(a.run("modalAction(new Map([['payment','Efectivo']]))"));
 const sid=a.run('state.sales.at(-1).id');assert.equal(a.run("get('p1').stock"),before-2);
 const b=app(Object.fromEntries(a.storage));assert.equal(b.run("get('p1').stock"),before-2);
 b.run("cancelSale("+JSON.stringify(sid)+")");assert(b.run("modalAction(new Map([['reason','Cliente se arrepintió']]))"));
 assert.equal(b.run("get('p1').stock"),before);
 assert.equal(b.run("state.sales.at(-1).status"),'cancelled');
});
test('aumentos selección/categoría/todos y nuevo producto',()=>{
 const a=app();a.run("selected=new Set(['p1','p2']);bulk('selected')");
 assert(a.run("modalAction(new Map([['pct','10']]))"));assert.equal(a.run("get('p1').precio"),1595);assert.equal(a.run("get('p3').precio"),2800);
 a.run("category='Bebidas';bulk('category');modalAction(new Map([['pct','20']]))");
 assert.equal(a.run("get('p3').precio"),3360);assert.equal(a.run("get('p1').precio"),1595);
 a.run("bulk('all');modalAction(new Map([['pct','10']]))");assert.equal(a.run("get('p1').precio"),1754.5);
 a.run("editProduct()");
 const fields={nombre:'Producto <nuevo>',codigo:'NEW-01',categoria:'Almacén',tipo:'General',precio:'125.50',costo:'80',stock:'3',revisionDias:'7',entregaDias:'2',z:'1.65',demanda:'1',desviacion:'.7',fuente:'manual',proximaRevision:'2026-09-12'};
 assert(a.run("modalAction(new Map(Object.entries("+JSON.stringify(fields)+")))"));
 assert.equal(a.run('state.products.at(-1).stock'),3);
 a.run("view='products';category='all';render()");assert(a.elements.get('#app').innerHTML.includes('Producto &lt;nuevo&gt;'));
});
test('pedido pendiente, recepción y ajustes no duplican stock',()=>{
 const a=app(),stock=a.run("get('p1').stock");
 a.run("orderDialog('p1');modalAction(new Map([['qty','7']]))");
 assert.equal(a.run("get('p1').stock"),stock);assert.equal(a.run("Core.replenishment(state,get('p1')).pending"),7);
 a.run("receive(state.orders.at(-1).id);modalAction(new Map())");
 assert.equal(a.run("get('p1').stock"),stock+7);assert.equal(a.run("Core.replenishment(state,get('p1')).pending"),0);
 assert.equal(a.run('modalAction(new Map())'),false);assert.equal(a.run("get('p1').stock"),stock+7);
 a.run("stockDialog('p1');modalAction(new Map([['mode','adjust'],['qty','4'],['reason','Recuento']]))");
 assert.equal(a.run("get('p1').stock"),4);
});
test('fallo de guardado no registra venta; cambio de revisión evita operación obsoleta',()=>{
 const a=app(),before=a.run("get('p1').stock"),count=a.run('state.sales.length');
 a.run("cart=[{id:'p1',cant:1}];checkout()");a.localStorage.fail=true;
 assert.equal(a.run("modalAction(new Map([['payment','Efectivo']]))"),false);
 assert.equal(a.run("get('p1').stock"),before);assert.equal(a.run('state.sales.length'),count);assert.equal(a.run('cart.length'),1);
 a.localStorage.fail=false;const newer=JSON.parse(a.storage.get('trebol-demo-v3'));newer.revision++;a.storage.set('trebol-demo-v3',JSON.stringify(newer));
 assert.equal(a.run("modalAction(new Map([['payment','Efectivo']]))"),false);assert.equal(a.run('state.sales.length'),count);
});
test('datos ilegibles bloquean escrituras y migración preserva clave original',()=>{
 const broken=app({'trebol-demo-v3':'{invalid'});assert.equal(broken.run('storageFault'),true);assert.equal(broken.storage.get('trebol-demo-v3'),'{invalid');
 const old=JSON.stringify({products:[{id:'p1',nombre:'Leche',precio:100,stock:3}],sales:[]});
 const a=app({'mi-despensa-demo-v2':old});assert.equal(a.run('state.products.length'),1);assert.equal(a.storage.get('mi-despensa-demo-v2'),old);
});
test('CRM: elimina Vender y ofrece Precios y Ventas, con orden detallada visible',()=>{
 const a=app();
 assert(!a.run("navs.some(n=>n[2]==='Vender')"));
 assert(a.run("navs.some(n=>n[2]==='Precios')"));assert(a.run("navs.some(n=>n[2]==='Ventas')"));
 a.run("mutate(s=>Core.sell(s,[{id:'p3',cant:1},{id:'p13',cant:2}],'Efectivo'));render()");
 const html=a.elements.get('#app').innerHTML;
 assert(html.includes('Coca-Cola 2,25 L'));assert(html.includes('Vino tinto Malbec 750 ml'));assert(html.includes('unit-box">2×'));
 assert(html.includes('Consultar detalle'));assert(html.includes('OV-'));
 const saleId=a.run('state.sales.at(-1).id');
 a.run('detailSale('+JSON.stringify(saleId)+')');
 assert(a.elements.get('#modal').innerHTML.includes('Precio unit.'));
 assert(a.elements.get('#modal').innerHTML.includes('Actividad de la orden'));
});
test('CRM: aumento por varios tipos y categorías, sin afectar los demás',()=>{
 const a=app();
 a.run("bulk('category');bulkDraft.scope='type';bulkDraft.types=['Gaseosas','Vinos']");
 assert.equal(a.run('bulkIds().length'),2);
 a.run("modalAction(new Map([['pct','10']]))");
 assert.equal(a.run("get('p3').precio"),3080);assert.equal(a.run("get('p13').precio"),7150);assert.equal(a.run("get('p1').precio"),1450);
 a.run("bulk('category');bulkDraft.categories=['Lácteos','Panificados'];modalAction(new Map([['pct','20']]))");
 assert.equal(a.run("get('p1').precio"),1740);assert.equal(a.run("get('p2').precio"),2640);assert.equal(a.run("get('p3').precio"),3080);
 a.run("bulk('category');bulkDraft.categories=[]");
 assert.throws(()=>a.run("modalAction(new Map([['pct','10']]))"),/Seleccioná/);
});
test('CRM: filtros de órdenes por número, estado y fecha y conservación de datos',()=>{
 const a=app();const n=a.run('state.sales.length'),id=a.run('state.sales.at(-1).id');
 const price=a.run("get('p1').precio");
 a.run("ordersRange='all';ordersQuery=orderNumber(state.sales.at(-1));ordersPage=1");
 assert.equal(a.run('orderMatches().length'),1);
 a.run("mutate(s=>Core.cancel(s,s.sales.at(-1).id,'Prueba'));ordersStatus='confirmed'");
 assert.equal(a.run('orderMatches().length'),0);a.run("ordersStatus='cancelled'");assert.equal(a.run('orderMatches().length'),1);
 const b=app(Object.fromEntries(a.storage));assert.equal(b.run('state.sales.length'),n);assert.equal(b.run('state.sales.at(-1).id'),id);
 assert.equal(b.run("get('p1').precio"),price);assert.equal(b.run('state.sales.at(-1).status'),'cancelled');
});
test('CRM: Guardar de la tabla actualiza un solo precio y mantiene ventas históricas',()=>{
 const a=app();a.run("mutate(s=>Core.sell(s,[{id:'p1',cant:1}],'Tarjeta'));view='prices';render()");
 const beforeOther=a.run("get('p2').precio"),soldPrice=a.run('state.sales.at(-1).items[0].precio');
 a.handlers.submit({preventDefault(){},target:{dataset:{price:'p1'},fields:[['price','1999.50']]}});
 assert.equal(a.run("get('p1').precio"),1999.5);assert.equal(a.run("get('p2').precio"),beforeOther);
 assert.equal(a.run('state.sales.at(-1).items[0].precio'),soldPrice);assert.equal(a.run('state.priceHistory.at(-1).after'),1999.5);
 const b=app(Object.fromEntries(a.storage));assert.equal(b.run("get('p1').precio"),1999.5);
});
test('CRM 2.1: venta rápida siempre visible antes y después de confirmar',()=>{
 const a=app();
 assert(a.elements.get('#app').innerHTML.includes('id="sale-composer"'));
 assert(!a.elements.get('#app').innerHTML.includes('Ocultar venta'));
 a.run("cart=[{id:'p1',cant:1}];checkout();modalAction(new Map([['payment','Efectivo'],['customerType','Cliente habitual']]));render()");
 assert(a.elements.get('#app').innerHTML.includes('id="pos-search"'));
 assert(a.elements.get('#app').innerHTML.includes('Revisar y confirmar venta'));
 assert.equal(a.run('cart.length'),0);assert.equal(a.run('state.sales.at(-1).customerType'),'Cliente habitual');
 const b=app(Object.fromEntries(a.storage));assert(b.elements.get('#app').innerHTML.includes('id="sale-composer"'));
});
test('CRM 2.1: costo individual y masivo separados de precio y costo histórico',()=>{
 const a=app(),price=a.run("get('p1').precio");
 a.run("mutate(s=>Core.sell(s,[{id:'p1',cant:1}],'Efectivo'))");
 const oldCost=a.run("state.sales.at(-1).items[0].costo");
 a.handlers.submit({preventDefault(){},target:{dataset:{price:'p1',valueField:'costo'},fields:[['price','800']]}});
 assert.equal(a.run("get('p1').costo"),800);assert.equal(a.run("get('p1').precio"),price);
 a.run("editValue='costo';category='Lácteos';bulk('category');modalAction(new Map([['pct','10']]))");
 assert.equal(a.run("get('p1').costo"),880);assert.equal(a.run("get('p1').precio"),price);
 assert.equal(a.run("state.sales.at(-1).items[0].costo"),oldCost);
 assert.equal(a.run("state.priceHistory.at(-1).field"),'costo');
 a.handlers.submit({preventDefault(){},target:{dataset:{price:'p1',valueField:'costo'},fields:[['price','0']]}});
 assert.equal(a.run("get('p1').costo"),0);
});
test('CRM 2.1: ingreso directo conserva otras cantidades pendientes y separa categorías',()=>{
 const a=app(),stock=a.run("get('p1').stock");
 a.run("view='products';stockDrafts={p1:'6',p2:'12'};render()");
 const html=a.elements.get('#app').innerHTML;
 assert(html.includes('category-block'));assert(html.includes('<h3>Bebidas</h3>'));assert(html.includes('<h3>Lácteos</h3>'));
 assert(html.includes('data-entry="p1"'));
 a.handlers.submit({preventDefault(){},target:{dataset:{entry:'p1'},fields:[['qty','6']]}});
 assert.equal(a.run("get('p1').stock"),stock+6);assert.equal(a.run("stockDrafts.p1"),undefined);assert.equal(a.run("stockDrafts.p2"),'12');
 assert.equal(a.run("state.movements.at(-1).qty"),6);
 a.handlers.submit({preventDefault(){},target:{dataset:{entry:'p1'},fields:[['qty','-2']]}});
 assert.equal(a.run("get('p1').stock"),stock+6);
});
test('CRM 2.1: categorías, tipos, consumidor y motivos son selectores',()=>{
 const a=app();a.run('editProduct()');let html=a.elements.get('#modal').innerHTML;
 assert(html.includes('<select name="categoria"'));assert(html.includes('<select name="tipo"'));assert(!html.includes('input name="categoria"'));
 assert(html.includes('<select name="revisionDias"'));
 a.run("cart=[{id:'p1',cant:1}];checkout()");html=a.elements.get('#modal').innerHTML;assert(html.includes('<select name="customerType"'));
 a.run("stockDialog('p1')");assert(a.elements.get('#modal').innerHTML.includes('<select name="reason"'));
 a.run("cancelSale(state.sales[0].id)");assert(a.elements.get('#modal').innerHTML.includes('<select name="reason"'));
});
test('CRM 2.1: ingreso de un producto con pedido pendiente requiere distinguir la entrega',()=>{
 const a=app(),stock=a.run("get('p1').stock");
 a.run("orderDialog('p1');modalAction(new Map([['qty','5']]))");
 a.handlers.submit({preventDefault(){},target:{dataset:{entry:'p1'},fields:[['qty','5']]}});
 assert.equal(a.run("get('p1').stock"),stock);
 assert(a.elements.get('#modal').innerHTML.includes('pedidos pendientes'));
 a.run("modalAction(new Map())");assert.equal(a.run("get('p1').stock"),stock+5);
 assert.equal(a.run("Core.replenishment(state,get('p1')).pending"),5);
});

test('CRM 2.2: salida manual confirmada, auditada y persistente sin generar una venta',()=>{
 const a=app(),before=a.run("get('p1').stock"),sales=a.run('state.sales.length');
 a.run("stockDrafts={p1:'3',p2:'12'};stockDialog('p1','exit',3)");
 assert.equal(a.run("get('p1').stock"),before);
 assert(a.elements.get('#modal').innerHTML.includes('Producto vencido'));
 assert.equal(a.elements.get('#modal-submit').textContent,'Confirmar salida de stock');
 assert(a.run("modalAction(new Map([['mode','exit'],['qty','3'],['reason','Producto vencido']]))"));
 assert.equal(a.run("get('p1').stock"),before-3);assert.equal(a.run('state.sales.length'),sales);
 assert.equal(a.run('state.movements.at(-1).qty'),-3);
 assert.equal(a.run('state.movements.at(-1).type'),'Salida manual');
 assert.equal(a.run('state.movements.at(-1).reason'),'Producto vencido');
 assert.equal(a.run('stockDrafts.p1'),undefined);assert.equal(a.run('stockDrafts.p2'),'12');
 const b=app(Object.fromEntries(a.storage));assert.equal(b.run("get('p1').stock"),before-3);
});
test('CRM 2.2: baja inválida bloqueada, recuento a cero y vista previa',()=>{
 const a=app(),before=a.run("get('p1').stock");
 for(const qty of [-1,0,1.5,before+1]){
  assert.throws(()=>a.run("recordStock(state,'p1','exit',"+qty+",'Rotura o pérdida')"));
  assert.equal(a.run("get('p1').stock"),before);
 }
 a.run("stockDialog('p1','exit',"+(before+1)+")");
 assert.equal(a.elements.get('#modal-submit').disabled,true);
 assert(a.elements.get('#stock-help').textContent.includes('No podés restar'));
 a.run("$('#stock-qty').value='1';previewStock()");assert.equal(a.elements.get('#modal-submit').disabled,false);
 a.run("stockDialog('p1','adjust',0);modalAction(new Map([['mode','adjust'],['qty','0'],['reason','Recuento físico']]))");
 assert.equal(a.run("get('p1').stock"),0);assert.equal(a.run('state.movements.at(-1).qty'),-before);
});
test('CRM 2.2: disminuciones por selección, categoría, tipo y todos',()=>{
 for(const scope of ['selected','category','type','all']){
  const a=app();
  a.run("selected=new Set(['p1']);category='Lácteos';productType='Leches';bulk('"+scope+"')");
  const ids=Array.from(a.run('bulkIds()'));
  const prices=JSON.parse(a.run('JSON.stringify(state.products.map(p=>({id:p.id,precio:p.precio,costo:p.costo})))'));
  assert(a.run("modalAction(new Map([['direction','decrease'],['pct','10']]))"));
  for(const p of prices){
   assert.equal(a.run("get('"+p.id+"').precio"),ids.includes(p.id)?Math.round(p.precio*90)/100:p.precio);
   assert.equal(a.run("get('"+p.id+"').costo"),p.costo);
  }
 }
});
test('CRM 2.2: reducción de costos hasta cero conserva precios y rechaza porcentajes excesivos',()=>{
 const a=app(),price=a.run("get('p1').precio");
 a.run("editValue='costo';bulk('all');bulkDraft.direction='decrease';$('#bulk-pct').value='100';previewBulk()");
 assert.equal(a.elements.get('#modal-submit').disabled,false);
 assert(a.run("modalAction(new Map([['direction','decrease'],['pct','100']]))"));
 assert(a.run('state.products.every(p=>p.costo===0)'));assert.equal(a.run("get('p1').precio"),price);
 a.run("editValue='precio';bulk('all');bulkDraft.direction='decrease';$('#bulk-pct').value='100';previewBulk()");
 assert.equal(a.elements.get('#modal-submit').disabled,true);
 assert.throws(()=>a.run("modalAction(new Map([['direction','decrease'],['pct','100']]))"));
 assert.equal(a.run("get('p1').precio"),price);
});

test('CRM 2.3: escaneos consecutivos agregan unidades por código exacto y recuperan el foco',()=>{
 const a=app(),before=a.run("get('p1').stock");a.run("saleCategory='Bebidas';render()");
 for(let i=0;i<2;i++){
  let prevented=false;a.handlers.keydown({key:'Enter',target:{id:'pos-code',value:'7790895001234'},preventDefault(){prevented=true;}});
  assert(prevented);assert.equal(a.run('cart[0].cant'),i+1);assert.equal(a.run("get('p1').stock"),before);
  assert.equal(a.elements.get('#pos-code').value,'');assert(a.run("document.activeElement===$('#pos-code')"));
 }
 assert(a.run("scanSale('7790895003238')"));assert.equal(a.run('cart.length'),2);
 assert.equal(a.run("scanSale('7790895009')"),false);assert.equal(a.run('cart.length'),2);
 assert(a.elements.get('#app').innerHTML.includes('Dar de alta este producto'));
 assert.equal(a.run("scanSale('7790895009230')"),false);assert.equal(a.run('cart.length'),2);
 a.run("scanSale('7790895003238');scanSale('7790895003238');scanSale('7790895003238')");
 assert.equal(a.run("scanSale('7790895003238')"),false);assert.equal(a.run("cart.find(l=>l.id==='p3').cant"),4);
});
test('CRM 2.3: confirmar limpia carrito y deja listo el siguiente escaneo, volver no borra',()=>{
 const a=app(),before=a.run("get('p1').stock");a.run("scanSale('7790895001234');checkout()");
 assert.equal(a.run("scanSale('7790895001234')"),false);assert.equal(a.run('cart[0].cant'),1);
 a.run("$('#modal').close();focusScanner()");assert.equal(a.run('cart[0].cant'),1);
 a.run('checkout()');
 a.handlers.submit({preventDefault(){},target:{id:'dialog-form',fields:[['payment','Efectivo'],['customerType','Consumidor final']]}});
 assert.equal(a.run('cart.length'),0);assert.equal(a.run("get('p1').stock"),before-1);assert(a.run("document.activeElement===$('#pos-code')"));
 assert(a.run("scanSale('7790895001234')"));assert.equal(a.run('cart[0].cant'),1);
 assert.equal(a.run("get('p1').stock"),before-1);
});
test('CRM 2.3: un escaneo rápido y su doble Enter no confirman un diálogo',()=>{
 const a=app();a.run("cart=[{id:'p1',cant:1}];checkout()");
 const target={id:'modal-submit',name:'',matches:()=>false};let t=1000;
 for(const key of '7790895001234')a.handlers.keydown({key,target,timeStamp:t+=10,preventDefault(){}});
 for(const key of ['Enter','Enter']){let blocked=false;a.handlers.keydown({key,target,timeStamp:t+=10,preventDefault(){blocked=true;}});assert(blocked);}
 assert.equal(a.run('cart.length'),1);assert.equal(a.run("$('#modal').open"),true);
});
test('CRM 2.3: filtros del resumen y ranking son independientes de buscar o anular órdenes',()=>{
 const a=app();a.run("ordersRange='all';ordersCategory='Bebidas';ordersPayment='Efectivo';view='orders';render()");
 const before=a.run('ordersAnalytics()');
 assert(before.includes('Unidades vendidas'));assert(before.includes('Inventario disponible hoy'));assert(before.includes('Productos más vendidos'));
 a.run("ordersQuery='NO EXISTE';ordersStatus='cancelled'");assert.equal(a.run('orderMatches().length'),0);assert.equal(a.run('ordersAnalytics()'),before);
 a.run("ordersShowAll=true;ordersSort='total'");
 const rows=Array.from(a.run("Core.report(state,ordersPeriod(),ordersCategory,ordersPayment).top.slice().sort((a,b)=>b.total-a.total)"));
 const html=a.run('ordersAnalytics()');if(rows.length>1)assert(html.indexOf('data-id="'+rows[0].id+'"')<html.indexOf('data-id="'+rows[1].id+'"'));
 a.run("ordersRange='date';ordersDate='2000-01-01'");assert(a.run('ordersAnalytics()').includes('No hay ventas confirmadas'));
});
test('CRM 2.3: alta consecutiva conserva clasificación, limpia importes y vuelve al código',()=>{
 const a=app(),count=a.run('state.products.length');a.run('quickCreate()');
 const fields=[['codigo','0001234567890'],['nombre','Agua nueva'],['categoria','Bebidas'],['tipo','Aguas'],['precio','1000'],['costo','700'],['stock','6'],['continue','on']];
 a.handlers.submit({preventDefault(){},target:{id:'dialog-form',fields}});
 assert.equal(a.run('state.products.length'),count+1);assert.equal(a.run('state.products.at(-1).codigo'),'0001234567890');
 assert(a.run("$('#modal').open"));assert.equal(a.run('quickDefaults.categoria'),'Bebidas');assert.equal(a.run('quickDefaults.tipo'),'Aguas');
 assert(a.elements.get('#modal').innerHTML.includes('name="precio" type="number" value=""'));
 assert.equal(a.elements.get('#quick-code').value,'');assert(a.run("document.activeElement===$('#quick-code')"));
 const b=app(Object.fromEntries(a.storage));assert.equal(b.run('state.products.length'),count+1);
 a.run("$('#quick-code').value='0001234567890';lookupQuickCode()");assert.equal(a.elements.get('#modal-submit').disabled,true);assert(a.elements.get('#quick-code-result').innerHTML.includes('Cargar stock a este producto'));
});
test('CRM 2.3: fallo de almacenamiento al dar alta conserva el formulario y no continúa',()=>{
 const a=app(),count=a.run('state.products.length');a.run('quickCreate()');a.localStorage.fail=true;
 a.handlers.submit({preventDefault(){},target:{id:'dialog-form',fields:[['nombre','Agua nueva'],['categoria','Bebidas'],['tipo','Aguas'],['precio','1000'],['costo','700'],['stock','6'],['continue','on']]}});
 assert.equal(a.run('state.products.length'),count);assert.equal(a.run('modalAfterSuccess'),null);assert(a.run("$('#modal').open"));
});

test('CRM 2.4: catálogo y pedido simultáneos con borrador persistente',()=>{
 const a=app(),stock=a.run("get('p1').stock");a.run("view='alerts';render()");
 assert(a.run("navs.some(n=>n[2]==='Pedidos')"));assert(!a.run("navs.some(n=>n[2]==='Avisos')"));
 const html=a.elements.get('#app').innerHTML;assert(html.includes('purchase-catalog'));assert(html.includes('purchase-basket'));
 a.run("purchaseQty('p1',3,true);purchaseQty('p1',2,true);purchaseQty('p2',6,true)");assert.equal(a.run('draftUnits()'),11);assert.equal(a.run('purchaseDraft().items.length'),2);
 assert.equal(a.run("get('p1').stock"),stock);assert.equal(a.run('state.orders.length'),0);
 const b=app(Object.fromEntries(a.storage));assert.equal(b.run('draftUnits()'),11);
});
test('CRM 2.4: proveedor guardado, confirmación de pedido y PDF descargable sin datos monetarios',()=>{
 const a=app();a.run("supplierDialog();modalAction(new Map([['name','Proveedor Ñandú']]))");
 assert.equal(a.run('purchaseDraft().supplier'),'Proveedor Ñandú');assert.equal(a.run('state.suppliers.length'),1);
 a.run("purchaseQty('p1',4);savePurchaseDialog()");assert.equal(a.run('state.orders.length'),0);assert(a.run('modalAction(new Map())'));
 assert.equal(a.run('state.orders.length'),1);assert.equal(a.run('draftUnits()'),0);assert.equal(a.run('state.orders[0].supplier'),'Proveedor Ñandú');
 assert(a.run('PurchasePDF.build(state.orders[0]).length')>1000);
 a.run('purchaseDetail(state.orders[0].id)');assert(a.elements.get('#modal').innerHTML.includes('Descargar PDF'));assert(a.elements.get('#modal').innerHTML.includes('Repetir pedido'));
 const pdf=a.run("String.fromCharCode(...PurchasePDF.build(state.orders[0]).slice(0,20))");assert(pdf.startsWith('%PDF-1.4'));
});
test('CRM 2.4: repetir requiere confirmar reemplazo del borrador y conserva originales',()=>{
 const a=app();a.run("mutate(s=>Core.savePurchase(s,{supplier:'A',items:[{productId:'p1',qty:5}]}));purchaseQty('p2',3);repeatPurchaseDialog(state.orders[0].id)");
 assert.equal(a.run('purchaseDraft().items[0].productId'),'p2');assert(a.elements.get('#modal').innerHTML.includes('Reemplazar el borrador'));
 assert(a.run('modalAction(new Map())'));assert.equal(a.run('purchaseDraft().items[0].productId'),'p1');assert.equal(a.run('state.orders.length'),1);
});
test('CRM 2.4: error de guardado conserva borrador y no programa PDF',()=>{
 const a=app();a.run("purchaseQty('p1',3);updatePurchaseDraft(d=>{d.supplier='A'});savePurchaseDialog()");a.localStorage.fail=true;
 assert.equal(a.run('modalAction(new Map())'),false);assert.equal(a.run('state.orders.length'),0);assert.equal(a.run('draftUnits()'),3);assert.equal(a.run('modalAfterSuccess'),null);
});
test('CRM 2.4: recepción parcial mantiene alerta al intentar sumar stock por otra vía',()=>{
 const a=app(),stock=a.run("get('p1').stock");
 a.run("mutate(s=>Core.savePurchase(s,{supplier:'A',items:[{productId:'p1',qty:5},{productId:'p2',qty:6}]}));receive(state.orders[0].id);modalAction(new Map([['received-p1','2'],['received-p2','0']]))");
 assert.equal(a.run("get('p1').stock"),stock+2);assert.equal(a.run("Core.pendingUnits(state,'p1')"),3);
 a.handlers.submit({preventDefault(){},target:{dataset:{entry:'p1'},fields:[['qty','3']]}});
 assert.equal(a.run("get('p1').stock"),stock+2);assert(a.elements.get('#modal').innerHTML.includes('3 unidades pendientes'));
});
