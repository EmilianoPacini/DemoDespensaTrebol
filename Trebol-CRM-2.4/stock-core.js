"use strict";
// Quantities are integers: pieces for unit products, grams for weight products.
// Purchase lines retain their presentation; sale lines retain their price and measure.
function installStockCore(C) {
  const legacyUpgrade = C.upgrade, legacySeed=C.seed;
  const weight = p => p?.measure === 'weight';
  const factor = p => weight(p) ? 1000 : 1;
  const qtyText = (p, qty) => (qty / factor(p)).toLocaleString('es-AR', {maximumFractionDigits:weight(p)?3:0}) + (weight(p)?' kg':' u.');
  function decimal(value, label, min=0) {
    const text=String(value??'').trim().replace(',', '.');
    return C.number(text,label,min);
  }
  function quantity(p,value,unit='base',min=0) {
    const n=decimal(value,'Cantidad',min), scale=unit==='kg'?1000:unit==='pack'?(p.packSize||1):1;
    const result=n*scale;
    if(!Number.isSafeInteger(Math.round(result)) || Math.abs(result-Math.round(result))>.000001 || result>1e9 || (!weight(p)&&!Number.isInteger(n)))throw Error('La cantidad debe ser entera en unidades o gramos.');
    return Math.round(result);
  }
  const lineValue = (l,qty=l.cant) => C.money((qty/factor(l))*l.precio);
  const costValue = (p,qty,cost=p.costo) => C.money(qty/factor(p)*cost);
  const today = now => C.dateKey(now||new Date());
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value)&&C.dateKey(new Date(value+'T12:00:00'))===value;
  const lots = (s,pid) => s.lots.filter(l=>l.productId===pid);
  const expired = (l,now) => !!l.expiry&&l.expiry<today(now);
  function available(s,p,now) {
    return p.trackExpiry?lots(s,p.id).filter(l=>!expired(l,now)).reduce((a,l)=>a+l.qty,0):p.stock;
  }
  function addMovement(s,p,qty,type,reason,extra={},now=new Date()) {
    const before=p.stock;p.stock+=qty;
    if(p.stock<0||p.stock>1e9)throw Error('Stock resultante fuera de rango.');
    const m={id:C.id(),productId:p.id,measure:p.measure,qty,before,after:p.stock,cost:p.costo,at:now.toISOString(),type,reason,...extra};
    s.movements.push(m);return m;
  }
  function addLot(s,p,qty,expiry='',label='',extra={}) {
    if(!qty)return null;
    const l={id:C.id(),productId:p.id,qty,expiry,label:label||'Lote interno',at:new Date().toISOString(),...extra};s.lots.push(l);return l;
  }
  function allocate(s,p,qty,{lotId,allowExpired=false,now=new Date()}={}) {
    if(!p.trackExpiry)return [];
    const candidates=lots(s,p.id).filter(l=>l.qty>0&&(!lotId||l.id===lotId)&&(allowExpired||!expired(l,now)))
      .sort((a,b)=>(a.expiry||'9999').localeCompare(b.expiry||'9999')||a.at.localeCompare(b.at));
    if(candidates.reduce((a,l)=>a+l.qty,0)<qty)throw Error('El lote o stock disponible no alcanza para '+p.nombre+'.');
    const allocation=[];let left=qty;
    for(const l of candidates){const take=Math.min(left,l.qty);if(take){l.qty-=take;allocation.push({lotId:l.id,qty:take});left-=take;}if(!left)break;}
    return allocation;
  }
  function upgrade(s) {
    legacyUpgrade(s);
    s.lots??=[];s.returns??=[];s.inventoryDraft??=null;s.inventorySessions??=[];s.supplierContacts??={};s.scaleConfig??={enabled:false};
    for(const p of s.products){p.measure??='unit';p.packSize??=1;p.supplier??='';p.trackExpiry??=false;p.scaleCode??='';}
    for(const sale of s.sales)for(const l of sale.items){l.measure??='unit';l.returned??=0;l.allocations??=[];}
    for(const o of s.orders)for(const l of o.items){l.measure??='unit';l.packSize??=1;}
    for(const l of s.purchaseDraft.items){l.measure??=s.products.find(p=>p.id===l.productId)?.measure||'unit';l.packSize??=1;}
    for(const p of s.products)if(p.trackExpiry&&!lots(s,p.id).length&&p.stock)addLot(s,p,p.stock,'','Saldo anterior · completar vencimiento');
    // Reconstruct balances once for migrated movements, in insertion order.
    const balance=new Map();
    for(const m of s.movements){m.measure??=s.products.find(p=>p.id===m.productId)?.measure||'unit';m.before??=balance.get(m.productId)||0;m.after??=m.before+m.qty;balance.set(m.productId,m.after);}
    s.uiSchema=6;return s;
  }
  function saveProduct(s,values,pid) {
    const old=s.products.find(p=>p.id===pid), measure=values.measure||'unit';
    if(!['unit','weight'].includes(measure))throw Error('Elegí unidad o peso.');
    const text={};for(const k of ['nombre','categoria','tipo']){text[k]=String(values[k]||'').trim();if(!text[k]||text[k].length>120)throw Error('Completá '+k+' (hasta 120 caracteres).');}
    for(const [key,max] of [['marca',80],['presentacion',100]]){text[key]=String(values[key]??old?.[key]??'').trim();if(text[key].length>max||/[\x00-\x1f\x7f]/.test(text[key]))throw Error('Revisá '+key+' (hasta '+max+' caracteres).');}
    let codigo=String(values.codigo||'').trim();if(!codigo){let n=s.products.length+1;do{codigo='P-'+String(n++).padStart(5,'0');}while(s.products.some(p=>p.codigo===codigo));}
    if(codigo.length>40||/[\x00-\x1f\x7f]/.test(codigo)||s.products.some(p=>p.id!==pid&&p.codigo===codigo))throw Error('Código inválido o ya registrado.');
    if(old&&old.measure!==measure&&s.movements.some(m=>m.productId===pid))throw Error('La medida no se puede cambiar con movimientos. Creá otro producto.');
    const p=old||C.product({id:C.id(),...text,codigo,measure,stock:0,precio:0,costo:0});
    const trackExpiry=!!values.trackExpiry,packSize=measure==='weight'?1:C.number(values.packSize||1,'Unidades por bulto',1,true);
    const precio=C.money(decimal(values.precio,'Precio',.01)),costo=C.money(decimal(values.costo,'Costo'));
    if(old)for(const key of ['precio','costo'])if(p[key]!==({precio,costo})[key])C.prices(s,[pid],0,({precio,costo})[key],key);
    const scaleCode=String(values.scaleCode||'').trim();if(scaleCode&&!/^\d{1,12}$/.test(scaleCode))throw Error('El identificador de balanza debe ser numérico.');
    if(scaleCode&&s.products.some(x=>x.id!==pid&&x.scaleCode===scaleCode))throw Error('Identificador de balanza ya registrado.');
    const beforeTrack=p.trackExpiry;
    if(old&&beforeTrack&&!trackExpiry&&lots(s,p.id).some(l=>l.qty))throw Error('Mantené el control de vencimientos mientras existan lotes con stock.');
    Object.assign(p,text,{codigo,measure,packSize,precio,costo,trackExpiry,supplier:String(values.supplier||'').trim().slice(0,100),scaleCode});
    for(const k of ['revisionDias','entregaDias','z'])if(values[k]!==undefined)p[k]=decimal(values[k],k,k==='revisionDias'?1:0);
    for(const k of ['demanda','desviacion'])if(values[k]!==undefined)p[k]=decimal(values[k],k)*factor(p);
    if(values.fuente)p.fuente=values.fuente;
    if(values.proximaRevision){if(!validDate(values.proximaRevision))throw Error('Fecha de revisión inválida.');p.proximaRevision=values.proximaRevision;}
    if(!old){if(weight(p)){if(values.demanda===undefined)p.demanda=1000;if(values.desviacion===undefined)p.desviacion=700;}s.products.push(p);const initial=quantity(p,values.stock||0,weight(p)?'kg':'base');if(trackExpiry&&initial&&!validDate(values.expiry))throw Error('Indicá el vencimiento del stock inicial.');addMovement(s,p,initial,'Inicial','Alta de producto');if(trackExpiry)addLot(s,p,initial,values.expiry,'Stock inicial');}
    else if(trackExpiry&&!beforeTrack&&p.stock){if(!validDate(values.expiry))throw Error('Indicá el vencimiento del saldo actual.');addLot(s,p,p.stock,values.expiry,'Saldo al activar vencimientos');}
    return p;
  }
  function sell(s,cart,payment,now=new Date()) {
    if(!cart.length)throw Error('Agregá al menos un producto.');
    const items=[],group=new Map();for(const l of cart){if(group.has(l.id))throw Error('Producto repetido en la venta.');group.set(l.id,l);}
    for(const l of group.values()){
      const p=s.products.find(p=>p.id===l.id),cant=C.number(l.cant,'Cantidad',1,true);
      if(!p||cant>available(s,p,now))throw Error('Stock disponible insuficiente. Revisá '+(p?.nombre||'el carrito')+'.');
      const precio=l.precio===undefined?p.precio:C.number(l.precio,'Precio',.01);
      items.push({id:p.id,nombre:p.nombre,categoria:p.categoria,tipo:p.tipo,measure:p.measure,cant,precio,costo:p.costo,returned:0,allocations:allocate(s,p,cant,{lotId:l.lotId,now})});
    }
    const sale={id:C.id(),number:Math.max(0,...s.sales.map(x=>x.number||0))+1,at:now.toISOString(),items,total:C.money(items.reduce((a,l)=>a+lineValue(l),0)),payment,status:'confirmed'};
    for(const l of items)addMovement(s,s.products.find(p=>p.id===l.id),-l.cant,'Venta','Venta confirmada',{saleId:sale.id,allocations:l.allocations},now);
    s.sales.push(sale);return sale;
  }
  function restoreAllocation(s,p,allocations,qty) {
    if(!p.trackExpiry)return;
    let left=qty;
    for(const a of allocations||[]){const lot=s.lots.find(l=>l.id===a.lotId);const take=Math.min(left,a.qty);if(lot&&take){lot.qty+=take;left-=take;}if(!left)break;}
    if(left)addLot(s,p,left,'','Devolución sin vencimiento · revisar');
  }
  function cancel(s,sid,reason,now=new Date()) {
    const sale=s.sales.find(v=>v.id===sid);if(!sale||sale.status!=='confirmed')throw Error('La venta ya fue anulada.');
    if(s.returns.some(r=>r.saleId===sid))throw Error('Esta venta tiene devoluciones. Usá devolución parcial para el saldo.');
    if(!String(reason).trim())throw Error('Indicá un motivo.');
    for(const l of sale.items){const p=s.products.find(p=>p.id===l.id);if(!p)throw Error('Producto no encontrado.');restoreAllocation(s,p,l.allocations,l.cant);addMovement(s,p,l.cant,'Anulación',reason,{saleId:sid},now);}
    sale.status='cancelled';sale.cancelledAt=now.toISOString();sale.reason=reason;
  }
  function returnSale(s,sid,pid,qty,sellable,reason,now=new Date()) {
    const sale=s.sales.find(v=>v.id===sid),l=sale?.items.find(l=>l.id===pid),p=s.products.find(p=>p.id===pid);
    qty=C.number(qty,'Cantidad devuelta',1,true);
    if(!sale||sale.status!=='confirmed'||!l||!p||qty>l.cant-(l.returned||0))throw Error('La devolución supera lo vendido pendiente de devolver.');
    if(!String(reason).trim())throw Error('Indicá el motivo.');
    // Consume the remaining original lot allocations, including non-sellable returns.
    let skip=l.returned||0,left=qty;const allocation=[];
    for(const a of l.allocations||[]){const ignored=Math.min(skip,a.qty);skip-=ignored;const take=Math.min(left,a.qty-ignored);if(take){allocation.push({lotId:a.lotId,qty:take});left-=take;}}
    const r={id:C.id(),saleId:sid,productId:pid,measure:l.measure,qty,amount:lineValue(l,qty),cost:costValue(l,qty,l.costo||0),sellable,reason,at:now.toISOString()};
    if(sellable){restoreAllocation(s,p,allocation,qty);addMovement(s,p,qty,'Devolución cliente',reason,{saleId:sid,returnId:r.id},now);}
    else addMovement(s,p,0,'Devolución no vendible',reason,{saleId:sid,returnId:r.id,discardQty:qty,cost:l.costo},now);
    l.returned=(l.returned||0)+qty;s.returns.push(r);return r;
  }
  function purchaseLines(s,items) {
    if(!items?.length)throw Error('Agregá productos al pedido.');const seen=new Set();
    return items.map(l=>{const p=s.products.find(p=>p.id===l.productId);if(!p||seen.has(p.id))throw Error('Producto inexistente o repetido.');seen.add(p.id);
      const packSize=weight(p)?1:C.number(l.packSize||1,'Presentación',1,true),qty=C.number(l.qty,'Cantidad',1,true);
      if(!weight(p)&&qty%packSize)throw Error('La cantidad debe corresponder a bultos completos.');
      return {productId:p.id,nombre:p.nombre,codigo:p.codigo,categoria:p.categoria,measure:p.measure,packSize,qty,received:0,cost:p.costo};});
  }
  function savePurchase(s,d,now=new Date()) {
    const supplier=String(d.supplier||'').trim(),note=String(d.note||'').trim();if(!supplier||supplier.length>100)throw Error('Elegí un proveedor.');if(note.length>500)throw Error('Observación demasiado larga.');
    const o={id:C.id(),number:Math.max(0,...s.orders.map(o=>o.number||0))+1,supplier,note,items:purchaseLines(s,d.items),status:'pending',at:now.toISOString(),receipts:[],copiedFrom:d.copiedFrom||null};s.orders.push(o);return o;
  }
  function receiveEntry(s,pid,qty,details={},now=new Date()) {
    const p=s.products.find(p=>p.id===pid);if(!p)throw Error('Producto no encontrado.');qty=C.number(qty,'Cantidad recibida',1,true);
    const cost=details.cost===undefined?p.costo:C.money(decimal(details.cost,'Costo'));
    if(p.trackExpiry&&!validDate(details.expiry))throw Error('Indicá el vencimiento de '+p.nombre+'.');
    if(cost!==p.costo)C.prices(s,[pid],0,cost,'costo');
    const lot=p.trackExpiry?addLot(s,p,qty,details.expiry,details.lotLabel,{orderId:details.orderId,receiptId:details.receiptId,cost}):null;
    const m=addMovement(s,p,qty,'Ingreso','Recepción de mercadería',{supplier:String(details.supplier||'Sin especificar'),document:String(details.document||'').slice(0,100),orderId:details.orderId,receiptId:details.receiptId,lotId:lot?.id,cost},now);
    return {productId:pid,qty,cost,measure:p.measure,lotId:lot?.id,movementId:m.id};
  }
  function receivePurchase(s,oid,requests,now=new Date(),details={}) {
    const o=s.orders.find(o=>o.id===oid);if(!o||!C.openPurchase(o))throw Error('Pedido cerrado o cancelado.');
    requests??=o.items.map(l=>({productId:l.productId,qty:l.qty-l.received}));
    const seen=new Set(),receipt={id:C.id(),at:now.toISOString(),document:String(details.document||'').slice(0,100),items:[]};
    for(const req of requests){if(seen.has(req.productId))throw Error('Producto repetido.');seen.add(req.productId);const l=o.items.find(l=>l.productId===req.productId);const qty=C.number(req.qty,'Cantidad recibida',0,true);if(!l||qty>l.qty-l.received)throw Error('La recepción supera lo pendiente.');if(!qty)continue;
      receipt.items.push(receiveEntry(s,l.productId,qty,{...req,...details,supplier:o.supplier,orderId:oid,receiptId:receipt.id},now));l.received+=qty;}
    if(!receipt.items.length)throw Error('Indicá al menos una cantidad recibida.');o.receipts.push(receipt);o.status=o.items.every(l=>l.received===l.qty)?'received':'partial';if(o.status==='received')o.receivedAt=now.toISOString();return o;
  }
  function repeatPurchase(s,oid){const o=s.orders.find(o=>o.id===oid);if(!o)throw Error('Pedido no encontrado.');s.purchaseDraft={supplier:o.supplier,note:o.note,items:o.items.map(l=>({productId:l.productId,qty:l.qty,measure:l.measure,packSize:l.packSize})),copiedFrom:oid};return s.purchaseDraft;}
  function adjustStock(s,pid,mode,n,reason,details={},now=new Date()) {
    const p=s.products.find(p=>p.id===pid);if(!p)throw Error('Producto no encontrado.');n=C.number(n,'Cantidad',mode==='adjust'?0:1,true);if(!String(reason).trim())throw Error('Elegí motivo.');
    if(mode==='entry')return receiveEntry(s,pid,n,details,now);
    if(!['exit','adjust'].includes(mode))throw Error('Operación inválida.');
    const lot=details.lotId?s.lots.find(l=>l.id===details.lotId&&l.productId===pid):null;
    if(details.lotId&&!lot)throw Error('Lote no encontrado.');
    if(p.trackExpiry&&mode==='adjust'&&!lot)throw Error('Elegí el lote que contaste.');
    const delta=mode==='exit'?-n:n-(lot?lot.qty:p.stock);if(!delta)throw Error('El recuento ya coincide.');if(-delta>p.stock)throw Error('Stock insuficiente.');
    if(details.receiptId){const receiptMoves=s.movements.filter(m=>m.productId===pid&&m.receiptId===details.receiptId&&m.qty>0),previous=s.movements.filter(m=>m.type==='Devolución proveedor'&&m.receiptId===details.receiptId&&m.productId===pid).reduce((a,m)=>a-m.qty,0);if(n>receiptMoves.reduce((a,m)=>a+m.qty,0)-previous)throw Error('La devolución supera lo recibido pendiente de devolver.');}
    const allocations=delta<0?allocate(s,p,-delta,{lotId:lot?.id,allowExpired:true,now}):[];
    if(delta>0&&p.trackExpiry){if(lot)lot.qty+=delta;else addLot(s,p,delta,details.expiry);}
    return addMovement(s,p,delta,reason==='Devolución a proveedor'?'Devolución proveedor':mode==='exit'?'Salida manual':'Ajuste',reason,{...details,allocations},now);
  }
  function replenishment(s,p,now=new Date()) {
    const start=C.day(now);start.setDate(start.getDate()-28);const created=C.day(s.createdAt);if(created>start)start.setTime(created.getTime());
    const counts=[];for(let d=new Date(start);d<C.day(now);d.setDate(d.getDate()+1))counts.push({key:C.dateKey(d),qty:0});
    for(const v of s.sales.filter(v=>v.status==='confirmed')){const c=counts.find(c=>c.key===C.dateKey(v.at));if(c)c.qty+=v.items.filter(l=>l.id===p.id).reduce((a,l)=>a+l.cant-(l.returned||0),0);}
    const hist=p.fuente==='historial'&&counts.length>=7,mean=hist?counts.reduce((a,c)=>a+c.qty,0)/counts.length:p.demanda,sigma=hist?Math.sqrt(counts.reduce((a,c)=>a+(c.qty-mean)**2,0)/(counts.length-1)):p.desviacion;
    const safety=Math.ceil(p.z*sigma*Math.sqrt(p.revisionDias+p.entregaDias)),target=Math.ceil(mean*(p.revisionDias+p.entregaDias)+safety),pending=C.pendingUnits(s,p.id),stock=available(s,p,now);
    const qty=Math.max(0,target-stock-pending),orderQty=weight(p)?Math.ceil(qty/50)*50:Math.ceil(qty/(p.packSize||1))*(p.packSize||1);
    return {mean,sigma,safety,target,pending,qty,orderQty,due:p.proximaRevision<=today(now),critical:stock<=safety,source:hist?'Historial':'Estimación configurada',fallback:p.fuente==='historial'&&!hist};
  }
  function summarizeSales(sales) {
    const top=new Map(),payments=Object.create(null);let total=0,units=0,grams=0,cost=0,missingCostUnits=0;
    for(const sale of sales)for(const l of sale.items){const qty=l.cant,amount=lineValue(l),hasCost=typeof l.costo==='number'&&Number.isFinite(l.costo),lineCost=hasCost?costValue(l,qty,l.costo):0;
      total+=amount;if(weight(l))grams+=qty;else units+=qty;cost+=lineCost;if(!hasCost)missingCostUnits+=qty;payments[sale.payment]=(payments[sale.payment]||0)+amount;
      const row=top.get(l.id)||{id:l.id,nombre:l.nombre,measure:l.measure||'unit',units:0,total:0,cost:0,tickets:0};row.units+=qty;row.total=C.money(row.total+amount);row.cost=C.money(row.cost+lineCost);top.set(l.id,row);}
    for(const v of sales)for(const pid of new Set(v.items.map(l=>l.id)))top.get(pid).tickets++;
    for(const k of Object.keys(payments))payments[k]=C.money(payments[k]);return {sales,total:C.money(total),units,grams,tickets:sales.length,average:sales.length?C.money(total/sales.length):0,cost:missingCostUnits?null:C.money(cost),margin:missingCostUnits?null:C.money(total-cost),missingCostUnits,top:[...top.values()].sort((a,b)=>b.total-a.total),payments};
  }
  function report(s,r,category='all',payment='all') {
    const match=v=>(!r||C.within(v.at,r))&&(payment==='all'||v.payment===payment);
    const sales=s.sales.filter(v=>v.status==='confirmed'&&match(v)).map(v=>({...v,items:v.items.filter(l=>category==='all'||l.categoria===category)})).filter(v=>v.items.length);
    const data=summarizeSales(sales),returns=s.returns.filter(x=>{const sale=s.sales.find(v=>v.id===x.saleId),line=sale?.items.find(l=>l.id===x.productId);return (!r||C.within(x.at,r))&&(payment==='all'||sale?.payment===payment)&&(category==='all'||line?.categoria===category);});
    data.grossTotal=data.total;data.returnTotal=C.money(returns.reduce((a,x)=>a+x.amount,0));data.total=C.money(data.total-data.returnTotal);data.returns=returns;
    for(const x of returns){const sale=s.sales.find(v=>v.id===x.saleId);data.payments[sale.payment]=C.money((data.payments[sale.payment]||0)-x.amount);}
    const returnedCost=returns.filter(x=>x.sellable).reduce((a,x)=>a+x.cost,0);if(data.cost!==null){data.cost=C.money(data.cost-returnedCost);data.margin=C.money(data.total-data.cost);}data.average=data.tickets?C.money(data.total/data.tickets):0;return data;
  }
  function startInventory(s,category='all') {
    if(s.inventoryDraft)throw Error('Ya hay un recuento en preparación.');
    const items=s.products.filter(p=>category==='all'||p.categoria===category).flatMap(p=>{
      if(!p.trackExpiry)return [{productId:p.id,expected:p.stock,counted:null}];
      let countedLots=lots(s,p.id).filter(l=>l.qty>0);
      if(!countedLots.length){const lot={id:C.id(),productId:p.id,qty:0,expiry:'',label:'Sin stock registrado · recuento',at:new Date().toISOString()};s.lots.push(lot);countedLots=[lot];}
      return countedLots.map(l=>({productId:p.id,lotId:l.id,expected:l.qty,counted:null}));
    });
    s.inventoryDraft={id:C.id(),at:new Date().toISOString(),category,items,movementCount:s.movements.length};
    if(!s.inventoryDraft.items.length)throw Error('No hay productos para contar.');return s.inventoryDraft;
  }
  function closeInventory(s) {
    const d=s.inventoryDraft;if(!d)throw Error('No hay recuento.');if(d.items.some(l=>l.counted===null))throw Error('Completá todas las cantidades contadas.');
    const stale=d.items.filter(l=>s.movements.slice(d.movementCount).some(m=>m.productId===l.productId));if(stale.length)throw Error('Hubo movimientos durante el conteo. Actualizá la referencia y volvé a contar los productos afectados.');
    for(const l of d.items){const lot=s.lots.find(x=>x.id===l.lotId);if(lot&&!lot.expiry&&l.counted>0){if(!validDate(l.expiry))throw Error('Indicá el vencimiento de la mercadería encontrada en '+s.products.find(p=>p.id===l.productId).nombre+'.');lot.expiry=l.expiry;}}
    const changes=d.items.filter(l=>l.counted!==l.expected);for(const l of changes)adjustStock(s,l.productId,'adjust',l.counted,'Recuento físico',{lotId:l.lotId,inventoryId:d.id});
    s.inventorySessions.push({...d,closedAt:new Date().toISOString(),changes:changes.length});s.inventoryDraft=null;
  }
  function parseScale(s,code) {
    const c=s.scaleConfig;if(!c.enabled||!code.startsWith(c.prefix))return null;
    if(!/^\d+$/.test(code)||code.length!==c.length)throw Error('Etiqueta de balanza inválida: longitud o caracteres.');
    if(c.checksum){const digits=code.split('').map(Number),check=digits.pop(),sum=digits.reduce((a,n,i)=>a+n*((digits.length-1-i)%2===0?3:1),0);if((10-sum%10)%10!==check)throw Error('Etiqueta de balanza con dígito verificador incorrecto.');}
    const identifier=code.slice(c.productStart,c.productStart+c.productLength),p=s.products.find(p=>p.scaleCode&&p.scaleCode.padStart(c.productLength,'0')===identifier);
    if(!p||!weight(p))throw Error('Identificador de balanza no registrado en un producto por peso.');
    const value=Number(code.slice(c.valueStart,c.valueStart+c.valueLength));if(!value)throw Error('La etiqueta indica una cantidad o importe cero.');
    if(c.mode==='weight'){const grams=value*c.gramsPerDigit;if(!Number.isSafeInteger(grams)||grams<1)throw Error('Peso de etiqueta inválido.');return {product:p,grams};}
    return {product:p,amount:C.money(value/Math.pow(10,c.decimals))};
  }
  function validateBackup(input) {
    const s=structuredClone(input?.data||input);
    if(s?.version!==3||!Number.isInteger(s.revision)||!Array.isArray(s.products)||!Array.isArray(s.sales)||!Array.isArray(s.movements)||!Array.isArray(s.orders))throw Error('La copia no corresponde a una demo Trébol.');
    const seen=new Set(),codes=new Set();for(const p of s.products){if(!p.id||seen.has(p.id)||!p.codigo||codes.has(p.codigo)||!p.nombre||!['unit','weight',undefined].includes(p.measure))throw Error('Catálogo inválido en la copia.');seen.add(p.id);codes.add(p.codigo);C.number(p.stock,'Stock',0,true);C.number(p.precio,'Precio',.01);C.number(p.costo,'Costo');}
    upgrade(s);
    for(const l of s.lots){if(!seen.has(l.productId)||!l.id)throw Error('Lote inválido.');C.number(l.qty,'Cantidad de lote',0,true);if(l.expiry&&!validDate(l.expiry))throw Error('Vencimiento inválido.');}
    for(const p of s.products)if(p.trackExpiry&&lots(s,p.id).reduce((a,l)=>a+l.qty,0)!==p.stock)throw Error('El stock de lotes no coincide en '+p.nombre+'.');
    for(const sale of s.sales){if(!Array.isArray(sale.items)||!['confirmed','cancelled'].includes(sale.status))throw Error('Venta inválida.');C.number(sale.total,'Total');for(const l of sale.items){if(!seen.has(l.id))throw Error('Producto de venta no encontrado.');C.number(l.cant,'Cantidad',1,true);C.number(l.precio,'Precio',.01);}}
    for(const o of s.orders)for(const l of o.items){if(!seen.has(l.productId))throw Error('Producto de pedido no encontrado.');C.number(l.qty,'Cantidad pedida',1,true);C.number(l.received,'Cantidad recibida',0,true);if(l.received>l.qty)throw Error('Recepción inválida.');}
    for(const m of s.movements){if(!seen.has(m.productId)||!Number.isInteger(m.qty)||!Number.isFinite(new Date(m.at).getTime()))throw Error('Movimiento inválido en la copia.');}
    for(const r of s.returns){const sale=s.sales.find(v=>v.id===r.saleId),line=sale?.items.find(l=>l.id===r.productId);if(!line)throw Error('Devolución sin venta en la copia.');C.number(r.qty,'Cantidad devuelta',1,true);C.number(r.amount,'Importe devuelto');}
    for(const v of s.sales)for(const l of v.items){const returned=s.returns.filter(r=>r.saleId===v.id&&r.productId===l.id).reduce((a,r)=>a+r.qty,0);if(returned!==l.returned||returned>l.cant)throw Error('Cantidades devueltas inconsistentes.');}
    if(s.inventoryDraft&&(!Array.isArray(s.inventoryDraft.items)||!Number.isInteger(s.inventoryDraft.movementCount)||s.inventoryDraft.items.some(l=>!seen.has(l.productId)||!Number.isInteger(l.expected)||l.expected<0||l.counted!==null&&(!Number.isInteger(l.counted)||l.counted<0))))throw Error('Recuento inválido en la copia.');
    return s;
  }
  function seed(now=new Date()) {
    const s=upgrade(legacySeed(now)),expiry=new Date(now);expiry.setDate(expiry.getDate()+3);
    s.suppliers=['Distribuidora del Centro','Panadería del barrio'];
    saveProduct(s,{nombre:'Jamón cocido · ejemplo',codigo:'P-JAMON',categoria:'Fiambres',tipo:'Cocidos',measure:'weight',precio:12000,costo:8000,stock:'5,350',trackExpiry:true,expiry:C.dateKey(expiry),supplier:s.suppliers[0],scaleCode:'00001',demanda:1,desviacion:.7});
    saveProduct(s,{nombre:'Pan por kg · ejemplo',codigo:'P-PAN',categoria:'Panificados',tipo:'Pan',measure:'weight',precio:3000,costo:1800,stock:8,supplier:s.suppliers[1],demanda:3,desviacion:1});
    return s;
  }
  Object.assign(C,{weight,factor,qtyText,decimal,quantity,lineValue,costValue,available,lots,expired,upgrade,seed,saveProduct,createProduct:(s,v)=>saveProduct(s,v),sell,cancel,returnSale,savePurchase,receiveEntry,receivePurchase,repeatPurchase,adjustStock,replenishment,summarizeSales,report,startInventory,closeInventory,parseScale,validateBackup});
  return C;
}
if(typeof module!=='undefined')module.exports=installStockCore;
else installStockCore(Core);
