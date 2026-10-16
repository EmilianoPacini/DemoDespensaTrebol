const {test}=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../stock-core.js')(require('../core.js'));
const PDF=require('../purchase-pdf.js');
const fresh=()=>Core.upgrade(Core.seed());
const create=(s,extra={})=>Core.saveProduct(s,{nombre:'Jamón',categoria:'Fiambres',tipo:'Cocidos',measure:'weight',precio:12000,costo:8000,stock:'5,350',...extra});

test('venta mixta, peso escaneado y devolución parcial conservan medidas y stock',()=>{
  const s=fresh(),p=create(s),before=s.products[0].stock;
  s.scaleConfig={enabled:true,prefix:'20',length:13,productStart:2,productLength:5,valueStart:7,valueLength:5,mode:'weight',gramsPerDigit:1,checksum:false};p.scaleCode='00001';
  const scanned=Core.parseScale(s,'2000001002500');assert.equal(scanned.grams,250);
  const sale=Core.sell(s,[{id:p.id,cant:scanned.grams},{id:s.products[0].id,cant:2}],'Efectivo');
  assert.equal(p.stock,5100);assert.equal(s.products[0].stock,before-2);assert.equal(sale.total,5900);
  const r=Core.returnSale(s,sale.id,p.id,100,true,'Cliente devuelve porción');assert.equal(r.amount,1200);assert.equal(p.stock,5200);
  Core.returnSale(s,sale.id,p.id,150,false,'No vendible');assert.equal(p.stock,5200);
  assert.throws(()=>Core.returnSale(s,sale.id,p.id,1,true,'Otro'),/supera/);
  assert.throws(()=>Core.cancel(s,sale.id,'Anular'),/devoluciones/);
  assert.equal(Core.report(s,null).returnTotal,3000);
  assert(PDF.ticket(sale).length>1000);
});

test('bultos, recepción parcial con costo, lotes y vencidos disponibles',()=>{
  const s=fresh(),p=Core.saveProduct(s,{nombre:'Leche lotes',categoria:'Lácteos',tipo:'Leche',precio:1500,costo:900,stock:0,measure:'unit',packSize:12,trackExpiry:true});
  const order=Core.savePurchase(s,{supplier:'Distribuidora',items:[{productId:p.id,qty:24,packSize:12}]});assert.equal(p.stock,0);
  Core.receivePurchase(s,order.id,[{productId:p.id,qty:12,cost:1000,expiry:'2020-01-01'}]);
  assert.equal(p.stock,12);assert.equal(Core.available(s,p),0);assert.equal(p.costo,1000);assert.equal(order.status,'partial');
  Core.receivePurchase(s,order.id,[{productId:p.id,qty:12,cost:1100,expiry:'2099-01-01'}]);assert.equal(Core.available(s,p),12);assert.equal(order.status,'received');
  const sale=Core.sell(s,[{id:p.id,cant:2}],'Efectivo');assert.equal(p.stock,22);assert.equal(sale.items[0].costo,1100);
  const expired=s.lots.find(l=>l.expiry==='2020-01-01');Core.adjustStock(s,p.id,'exit',12,'Producto vencido',{lotId:expired.id});assert.equal(p.stock,10);
  assert.equal(PDF.build(order).slice(0,4).toString(),'37,80,68,70');
  assert.throws(()=>Core.receivePurchase(s,order.id,[{productId:p.id,qty:1}]),/cerrado/);
});

test('inventario guarda cero, detecta movimiento posterior y cierra una vez',()=>{
  const s=fresh(),p=create(s,{categoria:'Prueba'}),d=Core.startInventory(s,'Prueba');d.items[0].counted=0;
  Core.sell(s,[{id:p.id,cant:100}],'Efectivo');assert.throws(()=>Core.closeInventory(s),/movimientos/);
  d.items[0].expected=p.stock;d.movementCount=s.movements.length;Core.closeInventory(s);assert.equal(p.stock,0);assert.equal(s.inventoryDraft,null);assert.equal(s.inventorySessions.length,1);
  assert.throws(()=>Core.closeInventory(s),/No hay/);
  const empty=Core.saveProduct(s,{nombre:'Perecedero sin stock',categoria:'Vacíos',tipo:'General',precio:100,costo:50,stock:0,trackExpiry:true});
  const found=Core.startInventory(s,'Vacíos');assert.equal(found.items.length,1);found.items[0].counted=2;
  assert.throws(()=>Core.closeInventory(s),/vencimiento/);found.items[0].expiry='2099-01-01';Core.closeInventory(s);assert.equal(empty.stock,2);assert.equal(Core.available(s,empty),2);
});

test('migración y copia validada preservan registros y rechazan lotes inconsistentes',()=>{
  const s=fresh(),count=s.sales.length,stock=s.products[0].stock;
  Core.upgrade(s);assert.equal(s.sales.length,count);assert.equal(s.products[0].stock,stock);
  create(s,{trackExpiry:true,expiry:'2099-01-01'});
  const restored=Core.validateBackup({data:JSON.parse(JSON.stringify(s))});assert.equal(restored.lots.length,s.lots.length);assert.equal(restored.products.at(-1).stock,5350);
  restored.lots[0].qty++;assert.throws(()=>Core.validateBackup(restored),/no coincide/);
  assert.throws(()=>Core.quantity({measure:'unit'},'1,5'),/entera/);
  assert.equal(Core.quantity({measure:'weight'},'0,250','kg'),250);
});
