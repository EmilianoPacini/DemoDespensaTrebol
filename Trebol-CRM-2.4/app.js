"use strict";
const KEY='trebol-demo-v3', OLD_KEY='mi-despensa-demo-v2';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cash=n=>Number(n).toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2});
const fmtDate=at=>new Date(at).toLocaleString('es-AR',{dateStyle:'short',timeStyle:'short'});
const btn=(label,action,extra='',primary=false)=>'<button type="button" class="button '+(primary?'primary':'')+'" data-action="'+action+'" '+extra+'>'+label+'</button>';
let storageFault=false, state;
try {const raw=localStorage.getItem(KEY);state=raw?JSON.parse(raw):localStorage.getItem(OLD_KEY)?Core.migrate(JSON.parse(localStorage.getItem(OLD_KEY))):Core.seed();if(state.version!==3||!Array.isArray(state.products)||!Array.isArray(state.sales))throw Error(); state=Core.upgrade(state);localStorage.setItem(KEY,JSON.stringify(state));}
catch {storageFault=true;state=Core.upgrade(Core.seed());}
let view='home',cart=[],query='',category='all',stockFilter='all',selected=new Set(),period='day',anchor=Core.dateKey(new Date()),reportCategory='all',paymentFilter='all',historyFilter='all',historyAll=false,historyQuery='',alertFilter='due',timer,modalAction,modalAfterSuccess=null;
const navs=[['home','I','Inicio'],['orders','O','Ventas'],['products','D','Depósito'],['prices','P','Precios'],['alerts','A','Pedidos'],['reports','R','Reportes']];
function notify(message){const t=$('#toast');clearTimeout(timer);t.textContent=message;t.hidden=false;t.classList.add('show');timer=setTimeout(()=>{t.hidden=true;t.classList.remove('show');},4200);}
function mutate(fn){
  if(storageFault){notify('No se pudo abrir el guardado local. No se registraron cambios. Revisá el almacenamiento del navegador.');return false;}
  try{
    const raw=localStorage.getItem(KEY),latest=raw?JSON.parse(raw):null;
    if(latest && latest.revision!==state.revision){state=Core.upgrade(latest);cart=[];selected.clear();$('#modal').close();render();throw Error('Los datos cambiaron en otra pestaña. Revisá la operación y volvé a intentar.');}
    const next=structuredClone(state);fn(next);next.revision=state.revision+1;
    localStorage.setItem(KEY,JSON.stringify(next));state=next;return true;
  }catch(e){notify(e.name==='QuotaExceededError'?'No se pudo guardar: almacenamiento lleno. No se registró la operación.':e.message);return false;}
}
function modal(title,body,confirm,action,danger=false){
  $('#modal').close();$('#modal').classList.remove('drawer');modalAction=action;modalAfterSuccess=null;scanBurst='';
  $('#modal').innerHTML='<form id="dialog-form"><header class="modal-heading"><h2 id="modal-title">'+title+'</h2><button type="button" class="text-btn" data-action="close" aria-label="Cerrar">Cerrar</button></header>'+body+'<p id="modal-error" role="alert"></p><div class="modal-actions">'+btn('Volver','close')+'<button class="button '+(danger?'danger':'primary')+'" id="modal-submit" type="submit">'+confirm+'</button></div></form>';
  $('#modal').showModal();
}
function field(label,name,value,type='number',extra=''){return '<label class="field">'+label+'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+extra+' required></label>';}
function chip(label,key,value,current){return '<button class="chip '+(value===current?'active':'')+'" data-filter="'+key+'" data-value="'+esc(value)+'" aria-pressed="'+(value===current)+'">'+esc(label)+'</button>';}
function categories(){return [...new Set(state.products.map(p=>p.categoria))].sort();}
function options(list,value,all='Todas las categorías'){return '<option value="all">'+all+'</option>'+list.map(x=>'<option '+(x===value?'selected':'')+'>'+esc(x)+'</option>').join('');}
function select(label,id,list,value,all){return '<label class="field compact">'+label+'<select id="'+id+'">'+options(list,value,all)+'</select></label>';}
const get=id=>state.products.find(p=>p.id===id);
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function matches(p,q){return norm(p.nombre+' '+p.codigo).includes(norm(q));}
function total(){return Core.money(cart.reduce((a,l)=>a+get(l.id).precio*l.cant,0));}
function stats(cards){return '<div class="stats">'+cards.map(([label,value,note])=>'<article class="stat"><span>'+label+'</span><strong>'+value+'</strong>'+(note?'<small>'+note+'</small>':'')+'</article>').join('')+'</div>';}
function cartLines(){return cart.map(l=>'<div class="basket-line"><div><strong>'+esc(get(l.id).nombre)+'</strong><small>'+cash(get(l.id).precio)+' por unidad</small></div><strong>'+cash(get(l.id).precio*l.cant)+'</strong><div class="quantity">'+btn('−','qty','data-id="'+l.id+'" data-delta="-1" aria-label="Quitar una unidad de '+esc(get(l.id).nombre)+'"')+'<span>'+l.cant+'</span>'+btn('+','qty','data-id="'+l.id+'" data-delta="1" aria-label="Agregar una unidad de '+esc(get(l.id).nombre)+'"')+'</div></div>').join('')||'<div class="empty cart-placeholder"><span class="empty-mark">V</span><strong>Empezá una venta</strong><p>Buscá un producto y tocá para agregarlo.</p></div>';}
function reports(){
 const r=Core.range(period,new Date(anchor+'T12:00:00')),data=Core.report(state,r,reportCategory,paymentFilter);
 const ps=state.products.filter(p=>reportCategory==='all'||p.categoria===reportCategory);
 const end=new Date(r.end);end.setDate(end.getDate()-1);
 const histories=state.sales.filter(s=>(historyAll||Core.within(s.at,r))&&(historyFilter==='all'||s.status===historyFilter)&&(paymentFilter==='all'||s.payment===paymentFilter)&&(reportCategory==='all'||s.items.some(l=>l.categoria===reportCategory))&&norm(orderNumber(s)+' '+s.id+' '+s.items.map(l=>l.nombre).join(' ')).includes(norm(historyQuery))).reverse();
 const moves=state.movements.filter(m=>Core.within(m.at,r)&&ps.some(p=>p.id===m.productId));
 return '<section class="panel"><div class="section-head"><div class="chips">'+chip('Diario','period','day',period)+chip('Semanal','period','week',period)+chip('Mensual','period','month',period)+'</div>'+btn('Exportar reporte CSV','export')+'</div><div class="toolbar"><label class="field compact">Fecha de referencia<input type="date" id="report-date" value="'+anchor+'"></label>'+select('Categoría','report-category',categories(),reportCategory)+select('Medio de pago','report-payment',['Efectivo','Transferencia','Tarjeta','Sin registrar'],paymentFilter,'Todos los medios')+'</div><p class="muted">Del '+r.start.toLocaleDateString('es-AR')+' al '+end.toLocaleDateString('es-AR')+' · Semana de lunes a domingo.</p></section>'+stats([['Ventas netas',cash(data.total),'Anulaciones excluidas'],['Tickets',data.tickets,'Con productos del filtro'],['Unidades vendidas',data.units,'Ventas confirmadas'],['Ticket promedio',cash(data.average),'Importe dentro del filtro']])+'<div class="report-grid"><section class="panel"><h2>Productos más vendidos</h2><p class="muted">Ordenados por unidades del período.</p>'+ranking(data.top)+'</section><section class="panel"><h2>Ventas por medio de pago</h2>'+Object.entries(data.payments).map(([k,v])=>'<div class="simple-row"><span>'+esc(k)+'</span><strong>'+cash(v)+'</strong></div>').join('')+(!data.tickets?'<p class="empty">Sin ventas en este período.</p>':'')+'</section></div><section class="panel spaced"><h2>Stock actual y movimientos del período</h2><p class="muted">El stock es actual; los movimientos corresponden al período y tipo de producto. No se filtran por medio de pago.</p>'+stats([['Existencias actuales',ps.reduce((a,p)=>a+p.stock,0)+' u.','Todos los productos del tipo'],['Valor a costo',cash(ps.reduce((a,p)=>a+p.stock*p.costo,0)),'Costos actuales'],['Valor a precio de venta',cash(ps.reduce((a,p)=>a+p.stock*p.precio,0)),'No equivale a ganancia'],['Sin stock',ps.filter(p=>p.stock===0).length,'Productos agotados']])+'<div class="chips"><span class="pill green">Ingresos: '+moves.filter(m=>m.qty>0&&m.type!=='Inicial').reduce((a,m)=>a+m.qty,0)+' u.</span><span class="pill amber">Salidas: '+moves.filter(m=>m.qty<0).reduce((a,m)=>a-m.qty,0)+' u.</span></div>'+movementsTable(moves.slice().reverse())+'</section><section class="panel spaced" id="history"><h2>Historial de ventas</h2><div class="chips">'+chip('Período del reporte','history-scope','period',historyAll?'all':'period')+chip('Todas las fechas','history-scope','all',historyAll?'all':'period')+'</div><p class="muted">Los tickets conservan sus precios originales. Anular excluye la venta del período original y registra la devolución de stock en la fecha de anulación.</p><div class="toolbar"><div class="chips">'+chip('Todas','history','all',historyFilter)+chip('Confirmadas','history','confirmed',historyFilter)+chip('Anuladas','history','cancelled',historyFilter)+'</div><label class="field grow">Buscar ticket o producto<input id="history-search" value="'+esc(historyQuery)+'" type="search"></label></div><div id="history-list">'+saleHistory(histories)+'</div></section>';
}
function ranking(rows){const max=rows[0]?.units||1;return rows.map((r,i)=>'<div class="ranking-row"><span class="rank">'+(i+1)+'</span><div class="grow"><div class="simple-row"><strong>'+esc(r.nombre)+'</strong><span>'+r.units+' u. · '+cash(r.total)+'</span></div><div class="bar"><span style="width:'+r.units/max*100+'%"></span></div></div></div>').join('')||'<p class="empty">Todavía no hay ventas para este período.</p>';}
function movementsTable(moves){return '<div class="table-wrap movement-table"><table><thead><tr><th>Fecha</th><th>Producto</th><th>Movimiento</th><th>Unidades</th><th>Motivo</th></tr></thead><tbody>'+moves.map(m=>'<tr><td>'+fmtDate(m.at)+'</td><td>'+esc(get(m.productId)?.nombre)+'</td><td>'+esc(m.type)+'</td><td class="'+(m.qty<0?'danger-text':'')+'">'+(m.qty>0?'+':'')+m.qty+'</td><td>'+esc(m.reason)+'</td></tr>').join('')+'</tbody></table></div>'+(!moves.length?'<p class="empty">Sin movimientos registrados.</p>':'');}
const purchaseStatus=o=>({pending:'Pendiente',partial:'Recibido parcialmente',received:'Recibido',cancelled:'Cancelado'}[o.status]||o.status);
const purchasePill=o=>'<span class="pill '+(o.status==='received'?'green':o.status==='cancelled'?'red':'amber')+'">'+purchaseStatus(o)+'</span>';
function purchaseDraft(){return state.purchaseDraft;}
function draftUnits(){return purchaseDraft().items.reduce((a,l)=>a+l.qty,0);}
function updatePurchaseDraft(fn){return mutate(s=>fn(s.purchaseDraft,s));}
function purchaseQty(pid,qty,add=false){
 try{qty=Core.number(qty,'Cantidad',0,true);if(!get(pid))throw Error('Producto no encontrado.');
 const ok=updatePurchaseDraft(d=>{const line=d.items.find(l=>l.productId===pid),next=Core.number((add?(line?.qty||0):0)+qty,'Cantidad a pedir',0,true);
 if(line)line.qty=next;else if(next)d.items.push({productId:pid,qty:next});d.items=d.items.filter(l=>l.qty>0);});
 if(ok){delete purchaseQtyDrafts[pid];render();}return ok;
 }catch(err){notify(err.message);render();return false;}
}
function purchaseCatalog(){
 const rows=state.products.filter(p=>matches(p,purchaseQuery)&&(purchaseCategory==='all'||p.categoria===purchaseCategory)).map(p=>({p,r:Core.replenishment(state,p)})).filter(({p,r})=>purchaseFilter==='all'||(purchaseFilter==='zero'?p.stock===0:r.qty>0));
 return rows.map(({p,r})=>'<article class="purchase-product"><div class="purchase-product-title"><button class="product-link" data-action="product-detail" data-id="'+esc(p.id)+'">'+esc(p.nombre)+'</button><small>'+esc(p.categoria)+' · '+esc(p.codigo)+'</small></div><div class="purchase-facts"><span>Stock <strong>'+p.stock+' u.</strong></span><span>En pedido <strong>'+r.pending+' u.</strong></span><span>Sugerido <strong>'+r.qty+' u.</strong></span></div><form class="purchase-add" data-purchase-add="'+esc(p.id)+'"><label class="field">Cantidad<input name="qty" type="number" min="1" max="1000000000" step="1" value="'+esc(purchaseQtyDrafts[p.id]||1)+'" aria-label="Cantidad a pedir de '+esc(p.nombre)+'" required></label><button class="button primary" type="submit">Agregar</button>'+(r.qty?btn('Usar sugerido','purchase-suggest','data-id="'+esc(p.id)+'"'):'')+'</form></article>').join('')||'<p class="empty">No hay productos para este filtro.</p>';
}
function purchaseBasket(){
 const d=purchaseDraft();
 return '<section class="panel purchase-basket"><div class="block-heading"><div><h3>Tu pedido <span class="count">'+d.items.length+'</span></h3><p>Se guarda como borrador mientras lo armás.</p></div></div><div class="supplier-choice">'+formSelect('Proveedor','supplier',[['','Elegir proveedor'],['Sin especificar','Sin especificar'],...state.suppliers],d.supplier,'id="purchase-supplier"')+btn('Agregar proveedor','supplier-add')+'</div><div class="purchase-lines">'+d.items.map(l=>{const p=get(l.productId);return '<div class="purchase-line"><div><strong>'+esc(p?.nombre||'Producto no disponible')+'</strong><small>'+esc(p?.codigo||'')+'</small></div><div class="purchase-line-controls">'+btn('−','purchase-minus','data-id="'+esc(l.productId)+'" aria-label="Restar una unidad a '+esc(p?.nombre)+'"')+'<input data-purchase-line="'+esc(l.productId)+'" type="number" min="1" max="1000000000" step="1" value="'+l.qty+'" aria-label="Cantidad solicitada de '+esc(p?.nombre)+'">'+btn('+','purchase-plus','data-id="'+esc(l.productId)+'" aria-label="Sumar una unidad a '+esc(p?.nombre)+'"')+btn('Quitar','purchase-remove','data-id="'+esc(l.productId)+'"')+'</div></div>';}).join('')+(!d.items.length?'<div class="empty"><strong>Agregá productos al pedido</strong><p>Indicá las cantidades desde el catálogo.</p></div>':'')+'</div><details class="optional-field" '+(d.note?'open':'')+'><summary>Observaciones para el proveedor</summary><label class="field">Mensaje opcional<textarea id="purchase-note" maxlength="500" rows="3" placeholder="Ej.: entregar por la mañana">'+esc(d.note)+'</textarea></label></details><div class="basket-total"><span>'+d.items.length+' productos</span><strong id="purchase-draft-total">'+draftUnits()+' u.</strong></div><p class="muted">El PDF incluye productos, códigos y cantidades. No incluye precios ni costos.</p>'+btn('Revisar, guardar y generar PDF','purchase-save',d.items.length?'':'disabled',true)+btn('Vaciar borrador','purchase-clear',d.items.length||d.note?'':'disabled')+'</section>';
}
function purchaseHistoryRows(){
 const list=state.orders.filter(o=>(purchaseHistoryStatus==='all'||o.status===purchaseHistoryStatus)&&norm(Core.purchaseNumber(o)+' '+o.supplier+' '+Core.purchaseItems(o).map(l=>l.nombre).join(' ')).includes(norm(purchaseHistoryQuery))).slice().reverse();
 return list.map(o=>{const lines=Core.purchaseItems(o);return '<article class="panel purchase-history-card"><header><div><span class="eyebrow">PEDIDO AL PROVEEDOR</span><h3>'+Core.purchaseNumber(o)+'</h3></div>'+purchasePill(o)+'</header><strong>'+esc(o.supplier)+'</strong><p class="muted">'+fmtDate(o.at)+' · '+lines.length+' productos · '+lines.reduce((a,l)=>a+l.qty,0)+' unidades solicitadas</p><div class="purchase-history-lines">'+lines.slice(0,3).map(l=>'<div class="simple-row"><span>'+esc(l.nombre)+'</span><strong>'+l.qty+' u.</strong></div>').join('')+(lines.length>3?'<p class="muted">Y '+(lines.length-3)+' productos más. Consultá el detalle.</p>':'')+'</div><div class="row-actions">'+btn('Ver detalle','purchase-detail','data-id="'+o.id+'"')+btn('Descargar PDF','purchase-pdf','data-id="'+o.id+'"')+btn('Repetir pedido','purchase-repeat','data-id="'+o.id+'"')+'</div></article>';}).join('')||'<p class="empty panel">No hay pedidos guardados para estos filtros.</p>';
}
function purchases(){
 const count=state.orders.filter(Core.openPurchase).length;
 return '<div class="workspace-heading"><div><h2>Pedidos a proveedores</h2><p>Armá la lista, guardala y descargá el PDF para compartir.</p></div></div><div class="section-tabs">'+chip('Armar pedido','purchase-tab','compose',purchaseTab)+chip('Historial ('+state.orders.length+')','purchase-tab','history',purchaseTab)+'</div>'+
 (purchaseTab==='history'?'<section class="panel"><div class="toolbar"><label class="field grow">Buscar pedido, proveedor o producto<input id="purchase-history-query" type="search" value="'+esc(purchaseHistoryQuery)+'" placeholder="PC-00001 o nombre del proveedor"></label></div><div class="chips">'+[['all','Todos'],['pending','Pendientes'],['partial','Parciales'],['received','Recibidos'],['cancelled','Cancelados']].map(([v,l])=>chip(l,'purchase-status',v,purchaseHistoryStatus)).join('')+'</div><p class="muted">'+count+' pedidos pendientes de recepción. Repetir crea un nuevo borrador editable.</p></section><div id="purchase-history" class="purchase-history-grid">'+purchaseHistoryRows()+'</div>':
 '<div class="purchase-layout"><section class="panel purchase-catalog"><h3>Elegí productos y cantidades</h3><div class="toolbar"><label class="field grow">Buscar producto<input id="purchase-search" type="search" value="'+esc(purchaseQuery)+'" placeholder="Nombre o código"></label>'+select('Categoría','purchase-category',categories(),purchaseCategory)+'</div><div class="chips">'+chip('Todos','purchase-filter','all',purchaseFilter)+chip('Con sugerencia','purchase-filter','suggested',purchaseFilter)+chip('Sin stock','purchase-filter','zero',purchaseFilter)+'</div><details class="model-help"><summary>Cómo se calcula la sugerencia</summary><p>Modelo P: demanda durante la revisión y la entrega, más stock de seguridad, menos existencias y cantidades pendientes de recibir. La sugerencia es orientativa; vos elegís cuánto pedir.</p><p>Stock de seguridad = z × desviación diaria × raíz(días de revisión + entrega). Los parámetros se consultan y ajustan desde la ficha del producto. La demanda observada puede subestimar las necesidades si hubo faltantes.</p></details><div id="purchase-catalog">'+purchaseCatalog()+'</div></section>'+purchaseBasket()+'</div>');
}
function supplierDialog(){
 modal('Agregar proveedor',field('Nombre del proveedor','name','','text','maxlength="100" placeholder="Ej.: Distribuidora del Centro"'),'Guardar proveedor',fd=>{
 const name=String(fd.get('name')||'').trim();if(!name||name.length>100)throw Error('Completá el nombre (hasta 100 caracteres).');
 return mutate(s=>{const existing=s.suppliers.find(x=>norm(x)===norm(name));if(!existing&&name!=='Sin especificar')s.suppliers.push(name);s.purchaseDraft.supplier=existing||name;});});
}
function savePurchaseDialog(){
 const d=structuredClone(purchaseDraft());if(!d.items.length)return;
 if(!d.supplier){notify('Elegí un proveedor o Sin especificar antes de guardar.');$('#purchase-supplier').focus();return;}
 const lines=d.items;
 modal('Revisar pedido al proveedor','<p>Proveedor: <strong>'+esc(d.supplier)+'</strong></p><div class="preview">'+lines.map(l=>'<div class="simple-row"><span>'+esc(get(l.productId)?.nombre)+'</span><strong>'+l.qty+' u.</strong></div>').join('')+'</div><p><strong>'+draftUnits()+' unidades solicitadas</strong></p>'+(d.note?'<p class="notice">'+esc(d.note)+'</p>':'')+'<p class="notice">El pedido quedará guardado y se descargará su PDF. El stock se incorpora cuando registrás la recepción.</p>','Guardar y descargar PDF',()=>{
 let saved;const ok=mutate(s=>{saved=Core.savePurchase(s,d);s.purchaseDraft={supplier:d.supplier,note:'',items:[],copiedFrom:null};});
 if(ok){purchaseQtyDrafts={};modalAfterSuccess=()=>{downloadPurchase(saved.id);purchaseDetail(saved.id);};}return ok;
 });
}
function downloadPurchase(oid){
 try{const order=state.orders.find(o=>o.id===oid);if(!order)throw Error('No se encontró el pedido.');
 const bytes=PurchasePDF.build(order),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');
 a.href=url;a.download='Trebol-'+Core.purchaseNumber(order)+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
 }catch(err){notify('El pedido sigue guardado. No se pudo descargar el PDF: '+err.message);}
}
function purchaseDetail(oid){
 const o=state.orders.find(o=>o.id===oid);if(!o)return;
 $('#modal').close();$('#modal').classList.add('drawer');
 $('#modal').innerHTML='<div class="detail-sheet"><header class="modal-heading"><div><span class="eyebrow">PEDIDO AL PROVEEDOR</span><h2 id="modal-title">'+Core.purchaseNumber(o)+'</h2></div>'+btn('Cerrar','close')+'</header>'+purchasePill(o)+'<div class="detail-grid"><div><small>Proveedor</small><strong>'+esc(o.supplier)+'</strong></div><div><small>Fecha</small><strong>'+fmtDate(o.at)+'</strong></div></div><div class="table-wrap"><table><thead><tr><th>Producto / código</th><th>Pedido</th><th>Recibido</th><th>'+(o.status==='cancelled'?'Cancelado':'Pendiente')+'</th></tr></thead><tbody>'+Core.purchaseItems(o).map(l=>'<tr><td>'+esc(l.nombre)+'<small>'+esc(l.codigo)+'</small></td><td>'+l.qty+' u.</td><td>'+(l.received||0)+' u.</td><td>'+(l.qty-(l.received||0))+' u.</td></tr>').join('')+'</tbody></table></div>'+(o.note?'<p class="notice">'+esc(o.note)+'</p>':'')+'<div class="row-actions">'+btn('Descargar PDF','purchase-pdf','data-id="'+o.id+'"',true)+btn('Repetir pedido','purchase-repeat','data-id="'+o.id+'"')+(Core.openPurchase(o)?btn('Registrar recepción','receive','data-id="'+o.id+'"')+btn('Cancelar pendiente','purchase-cancel','data-id="'+o.id+'"'):'')+'</div><h3 class="spaced">Actividad del pedido</h3><div class="timeline"><div><strong>Pedido guardado</strong><small>'+fmtDate(o.at)+'</small></div>'+(o.copiedFrom?'<div><strong>Creado repitiendo '+esc(Core.purchaseNumber(state.orders.find(x=>x.id===o.copiedFrom)||{}))+'</strong></div>':'')+(o.receipts||[]).map(r=>'<div><strong>Recibidas '+r.items.reduce((a,l)=>a+l.qty,0)+' unidades</strong><small>'+fmtDate(r.at)+'</small></div>').join('')+(o.status==='received'&&!o.receipts?.length?'<div><strong>Recepción registrada en la versión anterior</strong><small>'+fmtDate(o.receivedAt||o.at)+'</small></div>':'')+(o.status==='cancelled'?'<div><strong>Pendiente cancelado</strong><small>'+fmtDate(o.cancelledAt)+'</small><p>'+esc(o.reason)+'</p></div>':'')+'</div><p class="muted">El PDF conserva los productos y cantidades del pedido original. Se envía al proveedor por el medio que prefieras.</p></div>';
 $('#modal').showModal();
}
function repeatPurchaseDialog(oid){
 const copy=()=>{const ok=mutate(s=>Core.repeatPurchase(s,oid));if(ok){purchaseTab='compose';purchaseQuery='';purchaseCategory=purchaseFilter='all';purchaseQtyDrafts={};modalAfterSuccess=()=>go('alerts');}return ok;};
 if(purchaseDraft().items.length||purchaseDraft().note)modal('Reemplazar el borrador actual','<p>Tenés un pedido en preparación. Al repetir este pedido se reemplazará ese borrador por una copia editable. Los pedidos guardados se conservan.</p>','Reemplazar y repetir',copy);
 else if(copy()){$('#modal').close();modalAfterSuccess=null;go('alerts');notify('Pedido copiado al borrador. Revisá las cantidades antes de guardarlo.');}
}
function receive(oid){
 const o=state.orders.find(x=>x.id===oid);if(!o||!Core.openPurchase(o)){notify('El pedido ya fue recibido o cancelado.');return;}
 const lines=Core.purchaseItems(o).filter(l=>l.qty>(l.received||0));
 modal('Recibir '+Core.purchaseNumber(o),'<p>Proveedor: <strong>'+esc(o.supplier||'Sin especificar')+'</strong></p><p>Indicá lo que llegó. Dejá cero en los productos que todavía no recibiste.</p><div class="receipt-lines">'+lines.map(l=>'<div><strong>'+esc(l.nombre)+'</strong><small>Pendiente: '+(l.qty-(l.received||0))+' u.</small>'+field('Unidades recibidas','received-'+l.productId,l.qty-(l.received||0),'number','min="0" max="'+(l.qty-(l.received||0))+'" step="1"')+'</div>').join('')+'</div><p class="notice">Sólo estas cantidades se sumarán al stock. Lo que falte seguirá pendiente.</p>','Confirmar recepción',fd=>mutate(s=>Core.receivePurchase(s,oid,lines.map(l=>({productId:l.productId,qty:fd.get('received-'+l.productId)??(l.qty-(l.received||0))})))));
}
function cancelPurchaseDialog(oid){
 modal('Cancelar lo pendiente','<p>Se cancelarán las cantidades que faltan recibir. La mercadería ya recibida se conserva en el stock y el pedido permanece en el historial.</p>'+formSelect('Motivo','reason',['Pedido duplicado','Proveedor sin disponibilidad','Cambio de pedido','Ya no se necesita'],'Ya no se necesita'),'Confirmar cancelación',fd=>mutate(s=>Core.cancelPurchase(s,oid,fd.get('reason'))),true);
}
function cancelSale(sid){
 const s=state.sales.find(x=>x.id===sid);
 modal('Anular '+esc(orderNumber(s)),'<p>Total: <strong>'+cash(s.total)+'</strong> · '+fmtDate(s.at)+'</p><p>Se restituirán '+s.items.reduce((a,l)=>a+l.cant,0)+' unidades y la venta quedará anulada en el historial.</p>'+formSelect('Motivo de anulación','reason',['Cliente se arrepintió','Error de carga','Venta duplicada','Cambio de productos','Otro motivo'],'Cliente se arrepintió')+'<label class="check-label"><input type="checkbox" name="returned" required> Confirmo que toda la mercadería está disponible para volver al stock.</label><p class="muted">Si hubo un cobro, la devolución del dinero se realiza por fuera de esta demo.</p>','Confirmar anulación',fd=>mutate(next=>Core.cancel(next,sid,fd.get('reason'))),true);
}
function orderDialog(pid){
 const p=get(pid),r=Core.replenishment(state,p);
 modal(r.qty?'Revisar pedido de reposición':'Registrar revisión','<p><strong>'+esc(p.nombre)+'</strong></p><p>Disponible: '+p.stock+' · En pedido: '+r.pending+' · Objetivo: '+r.target+' u.</p>'+field('Cantidad a pedir','qty',r.qty,'number','min="0" step="1"')+'<p class="notice">'+(r.due?'La revisión quedará registrada y se programará la siguiente.':'Revisión anticipada: es una reposición excepcional. Se conserva la próxima fecha programada.')+'</p><p class="muted">Registrar el pedido es una simulación; no envía mensajes al proveedor.</p>','Confirmar revisión y pedido',fd=>{
 const qty=Core.number(fd.get('qty'),'Cantidad',0,true);
 return mutate(s=>{const item=s.products.find(x=>x.id===pid),now=new Date(),expected=new Date(now);expected.setDate(expected.getDate()+p.entregaDias);
 if(qty){const o=Core.savePurchase(s,{supplier:'Sin especificar',items:[{productId:pid,qty}]},now);o.expected=Core.dateKey(expected);}
 if(r.due){const next=Core.day(now);next.setDate(next.getDate()+item.revisionDias);item.proximaRevision=Core.dateKey(next);}item.ultimaRevision=now.toISOString();});
 });
}
function exportReport(){
 const r=Core.range(period,new Date(anchor+'T12:00:00')),data=Core.report(state,r,reportCategory,paymentFilter),ps=state.products.filter(p=>reportCategory==='all'||p.categoria===reportCategory);
 const rows=[['Despensa el Trébol - Demo'],['Desde',Core.dateKey(r.start),'Hasta (exclusivo)',Core.dateKey(r.end)],['Categoría',reportCategory,'Pago',paymentFilter],['Ventas netas',data.total],['Tickets',data.tickets],['Unidades vendidas',data.units],['Ticket promedio',data.average],[],['Producto','Unidades vendidas','Importe'],...data.top.map(p=>[p.nombre,p.units,p.total]),[],['Medio de pago','Importe'],...Object.entries(data.payments),[],['Stock actual (no histórico; sin filtro por pago)'],['Producto','Stock','Valor a costo','Valor a precio de venta'],...ps.map(p=>[p.nombre,p.stock,Core.money(p.stock*p.costo),Core.money(p.stock*p.precio)]),[],['Movimientos del período (sin filtro por pago)'],['Fecha','Producto','Tipo','Unidades','Motivo'],...state.movements.filter(m=>Core.within(m.at,r)&&ps.some(p=>p.id===m.productId)).map(m=>[fmtDate(m.at),get(m.productId).nombre,m.type,m.qty,m.reason]),[],['Tickets confirmados del período'],['ID','Fecha','Medio','Producto','Unidades','Precio unitario','Importe'],...data.sales.flatMap(s=>s.items.map(l=>[s.id,fmtDate(s.at),s.payment,l.nombre,l.cant,l.precio,Core.money(l.precio*l.cant)]))];
 const csv='\uFEFF'+rows.map(row=>row.map(cell=>{let str=String(cell??'');if(typeof cell==='string'&&/^[=+\-@\t\r]/.test(str))str="'"+str;return '"'+str.replace(/"/g,'""')+'"';}).join(';')).join('\r\n');
 const a=document.createElement('a'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.href=url;a.download='Trebol-reporte-'+period+'-'+anchor+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const icon = name => {
 const paths={home:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',orders:'<path d="M7 3h10v3h3v15H4V6h3z"/><path d="M8 11h8M8 15h5"/>',products:'<path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5M12 13v9M7 5.8l9 5"/>',prices:'<path d="M20 13 11 22 2 13V3h10z"/><circle cx="7" cy="8" r="1.5"/>',alerts:'<path d="M4 4h16v17H4zM8 2v4M16 2v4M8 10h8M8 14h8M8 18h4"/>',reports:'<path d="M4 3v18h17M9 17v-6M14 17V7M19 17V4"/>',plus:'<path d="M12 5v14M5 12h14"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>'};
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.home)+'</svg>';
};
let productType='all',homeStatus='all',ordersRange='today',ordersDate=Core.dateKey(new Date()),ordersStatus='all',ordersPayment='all',ordersQuery='',ordersPage=1,bulkDraft=null;
let ordersCategory='all',ordersSort='units',ordersShowAll=false;
let scanFeedback='',unknownScan='',scanBurst='',scanLastKey=0,scanBlockedUntil=0,quickDefaults={categoria:'Almacén',tipo:'General'};
let purchaseTab='compose',purchaseQuery='',purchaseCategory='all',purchaseFilter='all',purchaseHistoryStatus='all',purchaseHistoryQuery='',purchaseQtyDrafts={};
const orderNumber = s => 'OV-'+String(s.number||state.sales.indexOf(s)+1).padStart(5,'0');
function types(cat=category){return [...new Set(state.products.filter(p=>cat==='all'||p.categoria===cat).map(p=>p.tipo))].sort();}
function go(name){view=name;query='';render();window.scrollTo(0,0);}
function render(){
 if(view==='sell')view='home';
 document.querySelectorAll('nav').forEach(el=>el.innerHTML=navs.map(([key,unused,label])=>'<button class="nav-item '+(view===key?'is-active':'')+'" data-nav="'+key+'" '+(view===key?'aria-current="page"':'')+'><span class="nav-icon">'+icon(key)+'</span><span class="nav-label">'+label+'</span></button>').join(''));
 $('#page-title').textContent=navs.find(n=>n[0]===view)[2];
 $('#page-subtitle').textContent={home:'Operación diaria y seguimiento de cada venta.',orders:'Resultados, productos vendidos y detalle de cada compra.',products:'Catálogo, existencias y movimientos de mercadería.',prices:'Venta y costo: edición rápida por producto o por grupo.',alerts:'Armá pedidos, descargá la lista y registrá la recepción.',reports:'Resultados comerciales e inventario por período.'}[view];
 $('#app').innerHTML=(storageFault?'<p class="notice danger-text">No se pudo leer el almacenamiento. Las operaciones están bloqueadas para proteger los datos.</p>':'')+({home,orders:ordersView,products:depot,prices:pricesView,alerts:purchases,reports}[view])();
 focusScanner();
}
function statLink(label,value,note,action){return '<button class="stat stat-link" data-action="'+action+'"><span>'+label+'</span><strong>'+value+'</strong><small>'+note+' '+icon('arrow')+'</small></button>';}
function orderCards(sales){
 return sales.map(s=>'<article class="order-card '+(s.status==='cancelled'?'is-cancelled':'')+'"><header class="order-card-head"><div><span class="order-caption">ORDEN DE VENTA</span><h3>'+esc(orderNumber(s))+'</h3></div><span class="pill '+(s.status==='confirmed'?'green':'red')+'">'+(s.status==='confirmed'?'Confirmada':'Anulada')+'</span></header><div class="order-meta"><span>'+fmtDate(s.at)+'</span><span>'+esc(s.payment)+'</span></div><p class="order-customer">'+esc(s.customer||'Consumidor final')+'</p><div class="order-items">'+s.items.map(l=>'<div class="order-item"><span class="unit-box">'+l.cant+'×</span><div><strong>'+esc(l.nombre)+'</strong><small>'+cash(l.precio)+' por unidad</small></div><span>'+cash(l.precio*l.cant)+'</span></div>').join('')+'</div><div class="order-total"><small>'+s.items.reduce((a,l)=>a+l.cant,0)+' unidades · '+s.items.length+' productos</small><div><small>Total de la orden</small><strong>'+cash(s.total)+'</strong></div></div><footer>'+btn('Consultar detalle '+icon('arrow'),'sale-detail','data-id="'+s.id+'"')+(s.status==='confirmed'?btn('Anular','cancel-sale','data-id="'+s.id+'"'):'<small>Anulación registrada</small>')+'</footer></article>').join('')||'<div class="empty orders-empty">'+icon('orders')+'<strong>No hay órdenes para mostrar</strong><p>Las ventas confirmadas aparecerán con sus productos, cantidades y total.</p></div>';
}
function saleHistory(sales){return '<div class="order-grid">'+orderCards(sales)+'</div>';}
function ordersPeriod(){
 return ordersRange==='all'?null:Core.range(ordersRange==='week'?'week':ordersRange==='month'?'month':'day',new Date((ordersRange==='date'?ordersDate:Core.dateKey(new Date()))+'T12:00:00'));
}
function ordersPeriodLabel(){
 const r=ordersPeriod();if(!r)return 'Todo el historial';
 const end=new Date(r.end);end.setDate(end.getDate()-1);
 return r.start.toLocaleDateString('es-AR')+(Core.dateKey(r.start)===Core.dateKey(end)?'':' al '+end.toLocaleDateString('es-AR'));
}
function orderMatches(){
 const r=ordersPeriod();
 return state.sales.filter(s=>(!r||Core.within(s.at,r))&&(ordersStatus==='all'||s.status===ordersStatus)&&(ordersPayment==='all'||s.payment===ordersPayment)&&(ordersCategory==='all'||s.items.some(l=>l.categoria===ordersCategory))&&norm(orderNumber(s)+' '+(s.customer||'')+' '+s.items.map(l=>l.nombre).join(' ')).includes(norm(ordersQuery))).slice().reverse();
}
function ordersResults(){
 const all=orderMatches(),pages=Math.max(1,Math.ceil(all.length/12));ordersPage=Math.min(ordersPage,pages);
 return '<div class="list-summary"><span>'+all.length+' órdenes encontradas</span><span>Total de órdenes confirmadas: <strong>'+cash(all.filter(s=>s.status==='confirmed').reduce((a,s)=>a+s.total,0))+'</strong></span></div><div class="order-grid">'+orderCards(all.slice((ordersPage-1)*12,ordersPage*12))+'</div><div class="pagination">'+btn('Anterior','orders-prev',ordersPage===1?'disabled':'')+'<span>Página '+ordersPage+' de '+pages+'</span>'+btn('Siguiente','orders-next',ordersPage>=pages?'disabled':'')+'</div>';
}
function ordersAnalytics(){
 const data=Core.report(state,ordersPeriod(),ordersCategory,ordersPayment),rows=data.top.slice().sort((a,b)=>b[ordersSort]-a[ordersSort]||b.units-a.units||a.nombre.localeCompare(b.nombre));
 const ps=state.products.filter(p=>ordersCategory==='all'||p.categoria===ordersCategory);
 const byCategory=new Map();for(const sale of data.sales)for(const l of sale.items){const row=byCategory.get(l.categoria)||{units:0,total:0};row.units+=l.cant;row.total=Core.money(row.total+l.cant*l.precio);byCategory.set(l.categoria,row);}
 const visible=ordersShowAll?rows:rows.slice(0,5);
 return '<section class="sales-block"><div class="block-heading"><div><h2>Resultados del período</h2><p>'+ordersPeriodLabel()+' · Ventas confirmadas; anulaciones excluidas.</p></div></div>'+stats([['Total vendido',cash(data.total),'Importes al momento de la venta'],['Unidades vendidas',data.units+' u.',data.top.length+' productos distintos'],['Órdenes confirmadas',data.tickets,'Compras con productos del filtro'],['Ticket promedio',cash(data.average),'Promedio de los importes filtrados']])+ '<details class="panel sales-costs"><summary>Costos vendidos y margen bruto</summary><div class="detail-grid"><div><small>Costo de la mercadería vendida</small><strong>'+(data.cost===null?'Sin datos completos':cash(data.cost))+'</strong></div><div><small>Margen bruto estimado</small><strong>'+(data.margin===null?'Sin datos completos':cash(data.margin))+'</strong></div></div><p class="muted">'+(data.missingCostUnits?data.missingCostUnits+' unidades sin costo histórico. No se calcula un margen incompleto.':'Se usan los costos registrados al vender. El margen es ventas menos costo de mercadería; no descuenta gastos, comisiones ni impuestos.')+'</p></details></section>'+
 '<section class="panel sales-block"><div class="block-heading"><div><h2>Productos más vendidos</h2><p>Unidades e importes del período. El stock es el disponible ahora.</p></div><div class="chips">'+chip('Más unidades','orders-sort','units',ordersSort)+chip('Más dinero','orders-sort','total',ordersSort)+'</div></div>'+(rows.length?'<div class="table-wrap"><table class="sales-ranking"><thead><tr><th>Puesto / producto</th><th>Unidades vendidas</th><th>Importe vendido</th><th>% del importe</th><th>Stock actual</th></tr></thead><tbody>'+visible.map((r,i)=>'<tr><td><span class="rank">'+(i+1)+'</span>'+ (get(r.id)?'<button class="product-link" data-action="product-detail" data-id="'+esc(r.id)+'">'+esc(r.nombre)+'</button>':esc(r.nombre))+'</td><td><strong>'+r.units+' u.</strong></td><td><strong>'+cash(r.total)+'</strong></td><td>'+ (data.total?r.total/data.total*100:0).toLocaleString('es-AR',{maximumFractionDigits:1})+'%</td><td><span class="'+(get(r.id)?.stock===0?'danger-text':'')+'">'+(get(r.id)?get(r.id).stock+' u.':'No disponible')+'</span></td></tr>').join('')+'</tbody></table></div>'+(rows.length>5?'<div class="ranking-footer">'+btn(ordersShowAll?'Mostrar los primeros 5':'Ver los '+rows.length+' productos','ranking-toggle')+'</div>':''):'<p class="empty">No hay ventas confirmadas para estos filtros.</p>')+'</section>'+
 '<div class="report-grid sales-block"><section class="panel"><h3>Ventas por categoría</h3>'+[...byCategory].sort((a,b)=>b[1].total-a[1].total).map(([cat,r])=>'<div class="simple-row"><span>'+esc(cat)+'<small>'+r.units+' unidades vendidas</small></span><strong>'+cash(r.total)+'</strong></div>').join('')+(!data.tickets?'<p class="empty">Sin ventas para este período.</p>':'')+'</section><section class="panel"><h3>Inventario disponible hoy</h3><div class="simple-row"><span>Unidades disponibles</span><strong>'+ps.reduce((a,p)=>a+p.stock,0)+' u.</strong></div><div class="simple-row"><span>Valor a costo actual</span><strong>'+cash(ps.reduce((a,p)=>a+p.stock*p.costo,0))+'</strong></div><div class="simple-row"><span>Productos sin stock</span><strong>'+ps.filter(p=>p.stock===0).length+'</strong></div><p class="muted">Inventario actual de la categoría. No depende de la fecha ni del medio de pago elegidos.</p></section></div>';
}
function ordersView(){
 const cats=[...new Set([...categories(),...state.sales.flatMap(s=>s.items.map(l=>l.categoria))])].sort();
 return '<section class="panel orders-filters sales-block"><div class="section-head"><div><span class="eyebrow">VENTAS Y RESULTADOS</span><h2>Tu actividad comercial</h2></div>'+btn(icon('plus')+' Nueva venta','new-sale','',true)+'</div><div class="chips">'+chip('Hoy','orders-range','today',ordersRange)+chip('Esta semana','orders-range','week',ordersRange)+chip('Este mes','orders-range','month',ordersRange)+chip('Elegir fecha','orders-range','date',ordersRange)+chip('Todo el historial','orders-range','all',ordersRange)+'</div><div class="toolbar">'+(ordersRange==='date'?'<label class="field compact">Fecha<input id="orders-date" type="date" value="'+ordersDate+'"></label>':'')+select('Categoría','orders-category',cats,ordersCategory)+select('Medio de pago','orders-payment',['Efectivo','Transferencia','Tarjeta','Sin registrar'],ordersPayment,'Todos los medios')+'</div>'+(ordersCategory!=='all'?'<p class="notice">El resumen incluye sólo los productos de '+esc(ordersCategory)+'. Abajo se muestran completas las órdenes que los contienen.</p>':'')+'</section>'+ordersAnalytics()+'<section class="sales-block"><div class="block-heading"><div><h2>Órdenes de venta</h2><p>Buscá una compra y consultá todos sus productos.</p></div></div><div class="panel orders-filters"><div class="toolbar"><label class="field grow">Buscar orden, producto o cliente<input id="orders-search" type="search" value="'+esc(ordersQuery)+'" placeholder="Ej.: OV-00012, Coca-Cola…"></label>'+select('Estado de la orden','orders-status',['Confirmadas','Anuladas'],ordersStatus==='confirmed'?'Confirmadas':ordersStatus==='cancelled'?'Anuladas':'all','Todos los estados')+'</div><p class="muted">La búsqueda y el estado filtran las órdenes. El resumen superior mantiene el período, la categoría y el medio de pago.</p></div><div id="orders-results">'+ordersResults()+'</div></section>';
}
function detailSale(sid){
 const s=state.sales.find(s=>s.id===sid);if(!s)return;
 $('#modal').classList.add('drawer');
 $('#modal').innerHTML='<div class="detail-sheet"><header class="modal-heading"><div><span class="eyebrow">FICHA DE LA ORDEN</span><h2 id="modal-title">'+esc(orderNumber(s))+'</h2></div>'+btn('Cerrar','close')+'</header><span class="pill '+(s.status==='confirmed'?'green':'red')+'">'+(s.status==='confirmed'?'Confirmada':'Anulada')+'</span><div class="detail-grid"><div><small>Fecha y hora</small><strong>'+fmtDate(s.at)+'</strong></div><div><small>Medio de pago</small><strong>'+esc(s.payment)+'</strong></div><div><small>Cliente / referencia</small><strong>'+esc(s.customer||'Consumidor final')+'</strong><small>'+esc(s.customerType||'Sin tipo registrado')+'</small></div><div><small>Unidades</small><strong>'+s.items.reduce((a,l)=>a+l.cant,0)+'</strong></div></div><h3>Productos de la compra</h3><div class="table-wrap"><table><thead><tr><th>Producto</th><th>Cant.</th><th>Precio unit.</th><th>Subtotal</th></tr></thead><tbody>'+s.items.map(l=>'<tr><td>'+esc(l.nombre)+'<small>'+esc(l.categoria)+' / '+esc(l.tipo||'General')+'</small></td><td>'+l.cant+'</td><td>'+cash(l.precio)+'</td><td>'+cash(l.precio*l.cant)+'</td></tr>').join('')+'</tbody></table></div><div class="basket-total"><span>Total de la orden</span><strong>'+cash(s.total)+'</strong></div>'+(s.note?'<div class="notice"><strong>Observaciones</strong><p>'+esc(s.note)+'</p></div>':'')+'<h3 class="spaced">Actividad de la orden</h3><div class="timeline"><div><strong>Venta confirmada</strong><small>'+fmtDate(s.at)+' · '+s.items.reduce((a,l)=>a+l.cant,0)+' unidades descontadas del stock</small></div>'+(s.status==='cancelled'?'<div><strong>Venta anulada</strong><small>'+fmtDate(s.cancelledAt)+' · Stock restituido</small><p>'+esc(s.reason)+'</p></div>':'')+'</div><p class="muted">Los precios corresponden al momento de la venta. No cambian al actualizar el catálogo.</p><div class="modal-actions">'+btn('Imprimir detalle','print-sale','data-id="'+s.id+'"')+(s.status==='confirmed'?btn('Anular esta venta','cancel-sale','data-id="'+s.id+'"'):'')+'</div></div>';
 $('#modal').showModal();
}
function filteredProducts(){return state.products.filter(p=>matches(p,query)&&(category==='all'||p.categoria===category)&&(productType==='all'||p.tipo===productType)&&(stockFilter==='all'||(stockFilter==='zero'?p.stock===0:Core.replenishment(state,p).critical)));}
function catalogToolbar(){return '<div class="toolbar"><label class="field grow">Buscar producto<input id="depot-search" type="search" placeholder="Nombre o código" value="'+esc(query)+'"></label>'+select('Categoría','category',categories(),category)+select('Tipo de producto','product-type',types(),productType,'Todos los tipos')+'</div>';}
function detailProduct(pid){
 const p=get(pid),r=Core.replenishment(state,p),sales=state.sales.filter(s=>s.status==='confirmed').flatMap(s=>s.items.filter(l=>l.id===pid)),hist=state.priceHistory.filter(h=>h.productId===pid).slice(-8).reverse();
 $('#modal').classList.add('drawer');$('#modal').innerHTML='<div class="detail-sheet"><header class="modal-heading"><div><span class="eyebrow">FICHA DEL PRODUCTO</span><h2 id="modal-title">'+esc(p.nombre)+'</h2></div>'+btn('Cerrar','close')+'</header><p class="muted">'+esc(p.codigo)+' · '+esc(p.categoria)+' / '+esc(p.tipo)+'</p>'+stats([['Precio actual',cash(p.precio),'Precio de venta'],['Existencias',p.stock+' u.','Disponibles para vender'],['Costo unitario',cash(p.costo),'Costo configurado']])+'<div class="row-actions">'+btn('Editar producto','edit-product','data-id="'+pid+'"',true)+btn('Cargar / ajustar stock','stock','data-id="'+pid+'"')+btn('Crear uno similar','duplicate-product','data-id="'+pid+'"')+'</div><h3 class="spaced">Información de reposición</h3><div class="detail-grid"><div><small>Stock de seguridad</small><strong>'+r.safety+' u.</strong></div><div><small>Cantidad sugerida</small><strong>'+r.qty+' u.</strong></div><div><small>Próxima revisión</small><strong>'+esc(p.proximaRevision)+'</strong></div><div><small>Pendiente de recibir</small><strong>'+r.pending+' u.</strong></div></div><h3>Historial de precios y costos</h3>'+hist.map(h=>'<div class="simple-row"><small>'+(h.field==='costo'?'Costo':'Precio')+' · '+fmtDate(h.at)+'</small><span>'+cash(h.before)+' → <strong>'+cash(h.after)+'</strong></span></div>').join('')+(!hist.length?'<p class="empty">Todavía no hubo cambios de precio.</p>':'')+'<h3 class="spaced">Últimos movimientos</h3>'+movementsTable(state.movements.filter(m=>m.productId===pid).slice(-12).reverse())+'<p class="notice">Unidades vendidas en el historial: '+sales.reduce((a,l)=>a+l.cant,0)+'. Se excluyen ventas anuladas.</p></div>';$('#modal').showModal();
}
function bulkIds(){
 return state.products.filter(p=>bulkDraft.scope==='all'||(bulkDraft.scope==='selected'?selected.has(p.id):bulkDraft.scope==='category'?bulkDraft.categories.includes(p.categoria):bulkDraft.types.includes(p.tipo))).map(p=>p.id);
}
function renderBulkGroups(){
 const scope=bulkDraft.scope;
 $('#bulk-groups').innerHTML=(scope==='category'||scope==='type')?'<div class="group-picker"><strong>'+ (scope==='category'?'Seleccioná una o varias categorías':'Seleccioná uno o varios tipos')+'</strong><div class="group-checks">'+(scope==='category'?categories():types('all')).map(value=>'<label><input type="checkbox" data-bulk-group="'+esc(value)+'" '+(bulkDraft[scope==='category'?'categories':'types'].includes(value)?'checked':'')+'>'+esc(value)+' <small>'+state.products.filter(p=>(scope==='category'?p.categoria:p.tipo)===value).length+' productos</small></label>').join('')+'</div></div>':'<p class="notice">'+(scope==='all'?'El ajuste se aplicará a todo el catálogo.':'Se usan los productos marcados en la tabla: '+selected.size+'.')+'</p>';
}
const TAXONOMY={
 'Almacén':['General','Yerbas','Aceites','Pastas','Arroces','Azúcares','Cafés','Aderezos','Conservas','Harinas'],
 'Bebidas':['General','Gaseosas','Aguas','Jugos','Vinos','Cervezas'],
 'Lácteos':['General','Leches','Yogures','Quesos','Mantecas'],
 'Panificados':['General','Panes','Facturas','Tostadas'],
 'Galletitas':['General','Dulces','Saladas'],
 'Limpieza':['General','Detergentes','Desinfectantes','Lavandinas','Papeles'],
 'Higiene personal':['General','Jabones','Champús','Cuidado personal'],
 'Congelados':['General','Helados','Comidas congeladas'],
 'Fiambres':['General','Jamones','Embutidos'],
 'Golosinas':['General','Chocolates','Caramelos']
};
const CONSUMERS=['Consumidor final','Cliente habitual','Comercio / empresa'];
let editValue='precio',saleCategory='all',depotTab='stock',stockEditing=null;
let stockDrafts={},moneyDrafts={};
const valueLabel=()=>editValue==='costo'?'Costos':'Precios de venta';
function categoryChoices(){return [...new Set([...Object.keys(TAXONOMY),...categories()])].sort();}
function typeChoices(cat){return [...new Set([...(TAXONOMY[cat]||['General']),...state.products.filter(p=>p.categoria===cat).map(p=>p.tipo)])].sort();}
function formSelect(label,name,items,value,extra=''){
 return '<label class="field">'+label+'<select name="'+name+'" '+extra+'>'+items.map(item=>{const [v,l]=Array.isArray(item)?item:[item,item];return '<option value="'+esc(v)+'" '+(String(v)===String(value)?'selected':'')+'>'+esc(l)+'</option>';}).join('')+'</select></label>';
}
function dayOptions(values,current){return [...new Set([...values,Number(current)])].sort((a,b)=>a-b).map(n=>[n,n===0?'En el día':n+' días']);}
function shortcuts(target,values,mode='add'){
 return '<div class="quick-picks">'+values.map(n=>btn((mode==='add'?'+':'')+n+(target==='bulk-pct'?'%':''),'quick-pick','data-target="'+target+'" data-value="'+n+'" data-mode="'+mode+'"')).join('')+'</div>';
}
function home(){
 const today=Core.range('day'),r=Core.report(state,today),all=state.sales.filter(s=>Core.within(s.at,today)),visible=all.filter(s=>homeStatus==='all'||s.status===homeStatus).slice().reverse();
 return '<section id="sale-composer" class="home-block"><div class="block-heading"><div><h2>Venta rápida</h2><p>Elegí productos y confirmá la compra.</p></div></div>'+pos()+'</section><section class="home-block"><div class="block-heading"><div><h2>Resumen de hoy</h2><p>'+new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})+'</p></div>'+btn('Ver reportes','open-reports')+'</div><div class="stats home-stats">'+statLink('Total vendido',cash(r.total),'Ver órdenes de hoy','today-orders')+statLink('Ventas confirmadas',r.tickets,all.filter(s=>s.status==='cancelled').length+' anuladas','today-orders')+statLink('Unidades vendidas',r.units,'Ver productos vendidos','today-orders')+'</div></section><section class="home-block"><div class="block-heading"><div><h2>Ventas de hoy <span class="count">'+all.length+'</span></h2><p>Cada compra con su detalle y total.</p></div>'+btn('Ver historial completo','history')+'</div><div class="chips">'+chip('Todas','home-status','all',homeStatus)+chip('Confirmadas','home-status','confirmed',homeStatus)+chip('Anuladas','home-status','cancelled',homeStatus)+'</div><div class="order-grid home-orders">'+orderCards(visible)+'</div></section>';
}
function focusScanner(){
 if(view==='home'&&!$('#modal').open)$('#pos-code')?.focus({preventScroll:true});
}
function changeCart(pid,delta=1){
 const p=get(pid),line=cart.find(l=>l.id===pid);
 if(!p){notify('No se encontró el producto.');return false;}
 if(delta>0&&(line?.cant||0)+delta>p.stock){notify(p.stock===0?'Sin stock: no se puede vender este producto.':'Stock insuficiente: ya agregaste todas las unidades disponibles.');return false;}
 if(line)line.cant+=delta;else if(delta>0)cart.push({id:pid,cant:delta});
 cart=cart.filter(l=>l.cant>0);return true;
}
function scanSale(raw){
 if(view!=='home'||$('#modal').open)return false;
 const code=String(raw||'').trim();if(!code){focusScanner();return false;}
 const matches=state.products.filter(p=>String(p.codigo)===code);
 $('#pos-code').value='';query='';
 if(matches.length!==1){
  unknownScan=matches.length===0&&code.length<=40?code:'';
  scanFeedback=matches.length?'Código duplicado: revisá el catálogo.':'Código no registrado: '+code;
  render();notify(scanFeedback);return false;
 }
 unknownScan='';const p=matches[0],ok=changeCart(p.id);
 scanFeedback=ok?p.nombre+' · '+cart.find(l=>l.id===p.id).cant+' en la orden':p.nombre+' · No quedan unidades disponibles para agregar.';
 render();return ok;
}
function pos(){
 return '<div class="pos-layout"><section class="panel"><h3>1. Agregá productos</h3><div class="scanner-box"><form id="scanner-form"><label class="field">Escanear código de barras<input id="pos-code" name="code" type="text" autocomplete="off" spellcheck="false" maxlength="40" placeholder="Listo para escanear…" aria-describedby="scanner-help scan-feedback"></label><button class="button" type="submit">Agregar código</button></form><p id="scanner-help">Cada lectura agrega 1 unidad a la orden. También podés escribir el código y presionar Enter.</p><details class="scanner-instructions"><summary>Preparar el lector</summary><p>Usá el lector en modo teclado, con Enter al final de cada lectura. El código debe estar cargado en el catálogo. Al volver a Inicio, el campo queda listo para escanear.</p></details><p id="scan-feedback" role="status" aria-live="polite">'+esc(scanFeedback||'Escaneá el primer producto para comenzar.')+'</p>'+(unknownScan?btn('Dar de alta este producto','create-scanned'):'')+'</div><div class="toolbar"><label class="field grow">O buscar por nombre<input id="pos-search" type="search" placeholder="Nombre o código…" value="'+esc(query)+'" autocomplete="off"></label>'+select('Categoría','sale-category',categories(),saleCategory,'Todas')+'</div><div id="pos-results">'+productResults()+'</div></section><section class="panel basket"><h3>2. Revisá la compra <span class="count">'+cart.reduce((a,l)=>a+l.cant,0)+'</span></h3><div id="cart-lines">'+cartLines()+'</div><div class="basket-total"><span>Total</span><strong>'+cash(total())+'</strong></div>'+btn('Revisar y confirmar venta','checkout',cart.length?'':'disabled',true)+btn('Vaciar carrito','clear',cart.length?'':'disabled')+'</section></div>';
}
function scannerKeydown(e){
 if(e.isComposing||e.ctrlKey||e.metaKey||e.altKey)return;
 const target=e.target,now=e.timeStamp||Date.now();
 // Scanner bursts must never submit an open confirmation or product form.
 if($('#modal').open){
  if(e.key.length===1){scanBurst=now-scanLastKey<80?scanBurst+e.key:e.key;scanLastKey=now;}
  if(e.key==='Enter'){
   const burst=scanBurst.length>=4&&now-scanLastKey<120;scanBurst='';
   if(now<scanBlockedUntil){e.preventDefault();return;}
   if(target.id==='quick-code'){e.preventDefault();scanBlockedUntil=now+500;lookupQuickCode();return;}
   if(target.name==='codigo'||burst){e.preventDefault();scanBlockedUntil=now+500;notify('Lectura recibida. Revisá el formulario antes de guardar.');}
  }
  return;
 }
 scanBurst='';
 if(view!=='home')return;
 if((e.key==='Enter'||e.key==='Tab')&&['pos-code','pos-search'].includes(target.id)){
  // Tab is accepted only on the scanner field when it contains a code.
  if(e.key==='Tab'&&(target.id!=='pos-code'||!target.value.trim()))return;
  e.preventDefault();scanSale(target.value);return;
 }
 // Resume scanning after clicking a non-editable control without stealing text input.
 const editable=target.matches?.('input,select,textarea,[contenteditable="true"]');
 if(/^[a-zA-Z0-9]$/.test(e.key)&&!editable){e.preventDefault();const input=$('#pos-code');input.value=e.key;input.focus({preventScroll:true});}
}
function productResults(){
 const list=state.products.filter(p=>matches(p,query)&&(saleCategory==='all'||p.categoria===saleCategory));
 return '<div class="sale-products">'+(list.map(p=>{const left=p.stock-(cart.find(l=>l.id===p.id)?.cant||0);
 return '<button class="sale-product" data-action="add" data-id="'+p.id+'" aria-label="Agregar '+esc(p.nombre)+'"><span><strong>'+esc(p.nombre)+'</strong><small>'+esc(p.categoria)+'</small></span><span class="align-right"><strong>'+cash(p.precio)+'</strong><small class="'+(left<=0?'danger-text':'')+'">'+(p.stock===0?'Sin stock':left===0?'Todo en carrito':left+' disponibles')+'</small></span></button>';}).join('')||'<p class="empty">No hay productos en esta selección.</p>')+'</div>';
}
function quickCreate(code='',templateId=null,message=''){
 const base=templateId?get(templateId):null;
 const cat=base?.categoria||quickDefaults.categoria,kind=base?.tipo||quickDefaults.tipo;
 modal('Alta rápida de productos',
 '<p class="notice">'+esc(message||'Guardá un producto y seguí con el próximo. La categoría y el tipo se mantienen; los importes y el stock se completan para cada alta.')+'</p>'+
 '<section class="form-section"><div class="code-lookup"><label class="field grow">Código de barras<input id="quick-code" name="codigo" type="text" value="'+esc(code)+'" maxlength="40" autocomplete="off" placeholder="Escaneá o dejá vacío para generar un código"></label>'+btn('Buscar código','lookup-code')+'</div><div id="quick-code-result" role="status"></div>'+field('Nombre del producto','nombre',base?.nombre||'','text','id="quick-name" maxlength="120" placeholder="Ej.: Leche entera 1 litro"')+'<div class="form-grid">'+formSelect('Categoría','categoria',categoryChoices(),cat,'id="product-category"')+formSelect('Tipo de producto','tipo',typeChoices(cat),kind,'id="product-kind"')+'</div></section>'+
 '<section class="form-section"><h3>Importes y cantidad inicial</h3><div class="form-grid">'+field('Precio de venta ($)','precio',base?.precio??'','number','min=".01" step=".01"')+field('Costo unitario ($)','costo',base?.costo??'','number','min="0" step=".01"')+'</div>'+field('Stock inicial (unidades)','stock',0,'number','min="0" step="1" id="initial-stock"')+shortcuts('initial-stock',[1,6,12,24])+'</section>'+
 (base?'<p class="notice">Se copiaron nombre, categoría, tipo e importes de '+esc(base.nombre)+'. Revisá la presentación y los importes. El código y el stock son nuevos.</p>':'')+
 '<label class="check-label"><input type="checkbox" name="continue" checked> Seguir cargando productos después de guardar</label><p class="muted">La reposición tiene valores iniciales que podés ajustar después desde la ficha.</p>',
 'Guardar producto',fd=>{
 const values=Object.fromEntries(fd);
 if(!categoryChoices().includes(values.categoria)||!typeChoices(values.categoria).includes(values.tipo))throw Error('Elegí una categoría y un tipo de la lista.');
 let created;const ok=mutate(s=>{created=Core.createProduct(s,values);});
 if(ok){
  quickDefaults={categoria:created.categoria,tipo:created.tipo};
  if(unknownScan===created.codigo)unknownScan='';
  modalAfterSuccess=fd.get('continue')?()=>quickCreate('',null,'Guardado: '+created.nombre+'. Escaneá o cargá el siguiente producto.'):null;
 }
 return ok;
 });
 $('#quick-code').value=code;$('#quick-code').focus();if(code)lookupQuickCode();
}
function lookupQuickCode(){
 const code=$('#quick-code').value.trim(),items=state.products.filter(p=>p.codigo===code);
 $('#modal-submit').disabled=items.length>0;
 if(items.length){const p=items[0];$('#quick-code-result').innerHTML='<div class="notice"><strong>Este código ya está registrado</strong><p>'+esc(p.nombre)+' · '+p.stock+' unidades disponibles</p>'+btn('Cargar stock a este producto','quick-existing-stock','data-id="'+esc(p.id)+'"')+'</div>';}
 else{$('#quick-code-result').innerHTML='<p class="muted">'+(code?'Código nuevo. Completá el nombre y los importes.':'Se generará un código interno al guardar.')+'</p>';$('#quick-name').focus();}
}
function editProduct(pid){
 let code='P-'+String(state.products.length+1).padStart(5,'0');while(state.products.some(p=>p.codigo===code))code='P-'+Core.id().slice(-6).toUpperCase();
 const p=pid?get(pid):Core.product({id:Core.id(),nombre:'',codigo:code,categoria:'Almacén',tipo:'General',precio:0,costo:0,stock:0});
 modal(pid?'Editar producto':'Nuevo producto',
 '<section class="form-section"><h3>Datos del producto</h3>'+field('Nombre del producto','nombre',p.nombre,'text','maxlength="120" placeholder="Ej.: Leche entera 1 litro"')+'<div class="form-grid">'+formSelect('Categoría','categoria',categoryChoices(),p.categoria,'id="product-category"')+formSelect('Tipo de producto','tipo',typeChoices(p.categoria),p.tipo,'id="product-kind"')+'</div><details class="optional-field"><summary>Código interno o de barras</summary>'+field('Código generado automáticamente; podés reemplazarlo','codigo',p.codigo,'text','maxlength="40"')+'</details></section>'+
 '<section class="form-section"><h3>Precio y costo</h3><div class="form-grid">'+field('Precio de venta ($)','precio',p.precio||'','number','min=".01" step=".01" placeholder="0,00"')+field('Costo unitario ($)','costo',p.costo??0,'number','min="0" step=".01" placeholder="0,00"')+'</div></section>'+
 (!pid?'<section class="form-section"><h3>Stock inicial</h3>'+field('¿Cuántas unidades tenés?','stock',p.stock,'number','min="0" step="1" id="initial-stock"')+shortcuts('initial-stock',[1,6,12,24])+'</section>':'')+
 '<details class="model-help"><summary>Reposición automática (opcional)</summary><p>Ya tiene valores iniciales. Ajustalos solo si lo necesitás.</p><div class="form-grid">'+formSelect('Revisar cada','revisionDias',dayOptions([1,3,7,14,30],p.revisionDias),p.revisionDias)+formSelect('El proveedor entrega en','entregaDias',dayOptions([0,1,2,3,5,7,15],p.entregaDias),p.entregaDias)+field('Próxima revisión','proximaRevision',p.proximaRevision,'date')+formSelect('Nivel de servicio','z',[[1.28,'90%'],[1.65,'95%'],[2.33,'99%']],p.z)+formSelect('Demanda para el cálculo','fuente',[['historial','Usar historial'],['manual','Usar estimación']],p.fuente)+field('Demanda estimada (u./día)','demanda',p.demanda,'number','min="0" step=".01"')+field('Variación estimada (u./día)','desviacion',p.desviacion,'number','min="0" step=".01"')+'</div></details>',
 'Guardar producto',fd=>{
 const values=Object.fromEntries(fd);
 for(const k of ['nombre','codigo','categoria','tipo']){values[k]=String(values[k]||'').trim();if(!values[k])throw Error('Completá '+k+'.');}
 if(!categoryChoices().includes(values.categoria)||!typeChoices(values.categoria).includes(values.tipo))throw Error('Elegí una categoría y un tipo de la lista.');
 if(state.products.some(x=>x.id!==p.id&&x.codigo===values.codigo))throw Error('Ese código ya pertenece a otro producto.');
 for(const k of ['precio','costo','revisionDias','entregaDias','z','demanda','desviacion'])values[k]=Core.number(values[k],k,k==='precio'?.01:k==='revisionDias'?1:0,['revisionDias','entregaDias'].includes(k));
 if(!pid)values.stock=Core.number(values.stock,'Stock',0,true);
 return mutate(s=>{if(pid){const item=s.products.find(x=>x.id===pid);for(const key of ['precio','costo'])if(item[key]!==values[key])Core.prices(s,[pid],0,values[key],key);Object.assign(item,values);}else{s.products.push({...p,...values});s.movements.push({id:Core.id(),productId:p.id,at:new Date().toISOString(),qty:values.stock,type:'Inicial',reason:'Alta de producto'});}});
 });
}
function checkout(){
 if(!cart.length)return;
 modal('Confirmar venta','<section class="form-section"><h3>Detalle de la compra</h3><div class="preview">'+cart.map(l=>'<div class="simple-row"><span>'+esc(get(l.id).nombre)+' × '+l.cant+'</span><strong>'+cash(get(l.id).precio*l.cant)+'</strong></div>').join('')+'</div><div class="basket-total"><span>Total a cobrar</span><strong>'+cash(total())+'</strong></div></section><section class="form-section"><h3>Datos de la venta</h3><div class="form-grid">'+formSelect('Tipo de consumidor','customerType',CONSUMERS,'Consumidor final')+formSelect('Medio de pago','payment',['Efectivo','Transferencia','Tarjeta'],'Efectivo')+'</div><details class="optional-field"><summary>Agregar nombre o una observación (opcional)</summary><label class="field">Nombre / referencia<input name="customer" maxlength="100"></label><label class="field">Observación<input name="note" maxlength="240"></label></details></section><p class="notice">Confirmá cuando el cobro esté realizado. Se descontará el stock. El escaneo se retoma al cerrar esta ventana.</p>','Confirmar y registrar venta',fd=>{
 const customerType=fd.get('customerType')||'Consumidor final',payment=fd.get('payment');
 if(!CONSUMERS.includes(customerType)||!['Efectivo','Transferencia','Tarjeta'].includes(payment))throw Error('Elegí las opciones de venta.');
 const ok=mutate(s=>{const sale=Core.sell(s,cart,payment);sale.customerType=customerType;sale.customer=String(fd.get('customer')||'').trim()||customerType;sale.note=String(fd.get('note')||'').trim();});
 if(ok){cart=[];query='';unknownScan='';scanFeedback='Venta guardada. Escaneá para comenzar una nueva orden.';homeStatus='all';}return ok;
 });
}
function depot(){
 return '<div class="workspace-heading"><div><h2>Depósito</h2><p>Productos organizados por categoría.</p></div>'+'<div class="row-actions">'+btn('Alta rápida / consecutiva','quick-create','',true)+btn(icon('plus')+' Nuevo producto','new-product')+'</div>'+'</div><div class="section-tabs">'+chip('Stock por categoría','depot-tab','stock',depotTab)+chip('Movimientos','depot-tab','movements',depotTab)+'</div>'+
 (depotTab==='movements'?'<section class="panel"><h2>Últimos movimientos</h2>'+movementsTable(state.movements.slice(-60).reverse())+'</section>':
 '<section class="panel catalog-controls">'+catalogToolbar()+'<div class="chips">'+chip('Todos','stock','all',stockFilter)+chip('Stock bajo','stock','low',stockFilter)+chip('Sin stock','stock','zero',stockFilter)+'</div><p class="muted">Indicá la cantidad y elegí Sumar o Restar. Las salidas requieren motivo y confirmación.</p></section><div id="depot-table">'+depotTable()+'</div>');
}
function moneyEditor(p,key){
 return '<form class="inline-price" data-price="'+p.id+'" data-value-field="'+key+'"><span>$</span><input aria-label="'+(key==='costo'?'Costo':'Precio')+' de '+esc(p.nombre)+'" id="'+key+'-'+p.id+'" name="price" type="number" min="'+(key==='costo'?'0':'.01')+'" max="1000000000" step=".01" value="'+esc(moneyDrafts[p.id+':'+key]??p[key])+'" required><button class="button save-price" type="submit">Guardar</button></form>';
}
function depotTable(){
 const list=filteredProducts(),pricing=view==='prices';
 if(!list.length)return '<p class="empty panel spaced">No hay productos para estos filtros.</p>';
 const groups=[...new Set(list.map(p=>p.categoria))].sort();
 return groups.map(cat=>{
 const rows=list.filter(p=>p.categoria===cat),ids=rows.map(p=>p.id);
 return '<section class="category-block"><header><div><h3>'+esc(cat)+'</h3><span>'+rows.length+' productos · '+rows.reduce((a,p)=>a+p.stock,0)+' unidades disponibles</span></div>'+(pricing?'<label class="check-label"><input type="checkbox" data-select-category="'+esc(cat)+'" aria-label="Seleccionar categoría '+esc(cat)+'" '+(ids.every(id=>selected.has(id))?'checked':'')+'> Seleccionar categoría</label>':'')+'</header><div class="table-wrap"><table><thead><tr>'+(pricing?'<th>Elegir</th>':'')+'<th>Producto</th><th>'+(pricing?'Stock':'Tipo')+'</th><th>'+(pricing?(editValue==='costo'?'Costo unitario ($)':'Precio de venta ($)'):'Stock actual')+'</th><th>'+(pricing?(editValue==='costo'?'Precio de venta':'Costo unitario'):'Sumar / restar unidades')+'</th><th>Detalle</th></tr></thead><tbody>'+rows.map(p=>'<tr>'+(pricing?'<td><input type="checkbox" data-select="'+p.id+'" aria-label="Seleccionar '+esc(p.nombre)+'" '+(selected.has(p.id)?'checked':'')+'></td>':'')+'<td><button class="product-link" data-action="product-detail" data-id="'+p.id+'">'+esc(p.nombre)+'</button><small>'+esc(p.codigo)+(pricing?' · '+esc(p.tipo):'')+'</small></td><td>'+(pricing?p.stock+' u.':esc(p.tipo))+'</td><td>'+(pricing?moneyEditor(p,editValue):'<span class="stock-available '+(p.stock===0?'danger-text':'')+'">'+p.stock+' u.</span>')+'</td><td>'+(pricing?cash(p[editValue==='costo'?'precio':'costo']):'<form class="stock-entry" data-entry="'+p.id+'"><input name="qty" type="number" min="1" step="1" placeholder="Unidades" value="'+esc(stockDrafts[p.id]||'')+'" aria-label="Unidades a sumar o restar de '+esc(p.nombre)+'" required><button class="button primary" type="submit">Sumar</button>'+btn('Restar','stock-remove','data-id="'+p.id+'"')+'</form>')+'</td><td>'+btn(pricing?'Ver ficha':'Ver / ajustar','product-detail','data-id="'+p.id+'"')+'</td></tr>').join('')+'</tbody></table></div></section>';
 }).join('');
}
function pricesView(){
 return '<div class="workspace-heading"><div><h2>Precios y costos</h2><p>Elegí qué querés actualizar. Los cambios se guardan por separado.</p></div></div><div class="section-tabs value-tabs">'+chip('Precios de venta','edit-value','precio',editValue)+chip('Costos de compra','edit-value','costo',editValue)+'</div><section class="panel"><div class="block-heading"><div><h3>'+valueLabel()+' por producto</h3><p>Escribí un importe mayor o menor y tocá Guardar.</p></div>'+btn('Aumentar o disminuir %','bulk-all','',true)+'</div>'+catalogToolbar()+'<div class="selection-strip"><strong>'+selected.size+' seleccionados</strong>'+btn('Limpiar selección','clear-selection',selected.size?'':'disabled')+btn('Ajustar seleccionados %','bulk-selected',selected.size?'':'disabled')+btn('Elegir categorías o tipos','bulk-category')+'</div></section><div id="depot-table">'+depotTable()+'</div><details class="panel spaced audit-panel"><summary>Historial de precios y costos</summary>'+priceHistory()+'</details>';
}
function priceHistory(){
 return state.priceHistory.slice(-16).reverse().map(h=>'<div class="simple-row"><div><strong>'+esc(get(h.productId)?.nombre||'Producto')+'</strong><small>'+(h.field==='costo'?'Costo':'Precio de venta')+' · '+fmtDate(h.at)+'</small></div><span>'+cash(h.before)+' → <strong>'+cash(h.after)+'</strong></span></div>').join('')||'<p class="empty">Todavía no hubo cambios.</p>';
}

function bulk(scope){
 bulkDraft={scope,categories:category==='all'?[]:[category],types:productType==='all'?[]:[productType],field:editValue,direction:'increase'};
 modal('Ajustar '+valueLabel().toLowerCase(),
 formSelect('Qué querés hacer','direction',[['increase','Aumentar por porcentaje'],['decrease','Disminuir por porcentaje']],'increase','id="bulk-direction"')+
 '<div class="scope-options">'+[['selected','Selección actual'],['category','Categorías'],['type','Tipos de producto'],['all','Todo el catálogo']].map(([k,label])=>'<label class="scope-choice"><input name="scope" type="radio" value="'+k+'" '+(bulkDraft.scope===k?'checked':'')+'> '+label+'</label>').join('')+'</div><div id="bulk-groups"></div>'+
 field('Porcentaje a aplicar','pct',10,'number','min=".01" max="10000" step=".01" id="bulk-pct"')+shortcuts('bulk-pct',[5,10,15,20],'set')+
 '<div class="bulk-summary" id="bulk-summary"></div><p class="muted" id="bulk-limit"></p><div id="price-preview" class="preview"></div><p class="muted">Los cambios afectan el alcance elegido. Las ventas anteriores conservan sus importes.</p>',
 'Confirmar ajuste',fd=>{
 const ids=bulkIds(),pct=Core.number(fd.get('pct'),'Porcentaje',.01),direction=fd.get('direction')||bulkDraft.direction;
 if(!['increase','decrease'].includes(direction))throw Error('Elegí aumentar o disminuir.');
 const max=direction==='increase'?10000:bulkDraft.field==='costo'?100:99.99;
 if(pct>max)throw Error('El porcentaje máximo para esta operación es '+max+'%.');
 if(!ids.length)throw Error('Seleccioná productos, categorías o tipos.');
 const ok=mutate(s=>Core.prices(s,ids,direction==='decrease'?-pct:pct,undefined,bulkDraft.field));
 if(ok)ids.forEach(id=>delete moneyDrafts[id+':'+bulkDraft.field]);return ok;
 });
 renderBulkGroups();previewBulk();
}
function previewBulk(){
 const pct=Number($('#bulk-pct').value),ids=bulkIds(),decrease=bulkDraft.direction==='decrease',max=decrease?(bulkDraft.field==='costo'?100:99.99):10000,min=bulkDraft.field==='costo'?0:.01;
 $('#bulk-pct').max=String(max);
 const validPct=Number.isFinite(pct)&&pct>0&&pct<=max;
 const rows=ids.map(id=>{const p=get(id),current=p[bulkDraft.field],next=Core.money(current*(1+(validPct?(decrease?-pct:pct):0)/100));return {p,current,next};});
 const validValues=rows.every(r=>Number.isFinite(r.next)&&r.next>=min&&r.next<=1e9);
 $('#modal-submit').disabled=!validPct||!validValues||!ids.length;
 $('#bulk-summary').innerHTML='<strong>'+ids.length+' productos afectados</strong><span>'+(validPct?(decrease?'Disminución: −':'Aumento: +')+pct+'%':'Ingresá un porcentaje válido')+'</span>';
 $('#bulk-limit').textContent=!validValues?'El ajuste dejaría algún importe fuera del rango permitido. Elegí un porcentaje menor.':decrease?(bulkDraft.field==='costo'?'Podés reducir costos hasta 100% (costo cero).':'El precio de venta debe quedar en $0,01 o más. Máximo: 99,99%.'):'Los importes se redondean a centavos.';
 $('#price-preview').innerHTML='<table><thead><tr><th>Producto</th><th>Actual</th><th>Nuevo</th><th>Diferencia</th></tr></thead><tbody>'+rows.map(({p,current,next})=>{const delta=Core.money(next-current);return '<tr><td>'+esc(p.nombre)+'</td><td>'+cash(current)+'</td><td class="price-new">'+cash(next)+'</td><td>'+(delta>0?'+':'')+cash(delta)+'</td></tr>';}).join('')+'</tbody></table>'+(!ids.length?'<p class="empty">Elegí el grupo que querés actualizar.</p>':'');
}
function recordStock(s,pid,mode,n,reason){
 const p=s.products.find(x=>x.id===pid);if(!p)throw Error('Producto no encontrado.');
 if(!['entry','exit','adjust'].includes(mode))throw Error('Operación inválida.');
 n=Core.number(n,'Unidades',mode==='adjust'?0:1,true);
 if(!String(reason||'').trim())throw Error('Elegí un motivo.');
 if(mode==='exit'&&n>p.stock)throw Error('No podés restar más de las '+p.stock+' unidades disponibles.');
 const qty=mode==='entry'?n:mode==='exit'?-n:n-p.stock;
 if(!qty)throw Error('El stock contado ya coincide.');
 Core.number(p.stock+qty,'Stock resultante',0,true);
 p.stock+=qty;s.movements.push({id:Core.id(),productId:pid,at:new Date().toISOString(),qty,type:mode==='entry'?'Ingreso':mode==='exit'?'Salida manual':'Ajuste',reason:String(reason).trim()});
}
function stockReasons(mode){
 return mode==='exit'?['Rotura o pérdida','Producto vencido','Consumo interno','Devolución a proveedor','Corrección de carga']:mode==='adjust'?['Recuento físico','Corrección de carga']:['Compra a proveedor','Reposición interna'];
}
function stockDialog(pid,initialMode='entry',initialQty=1){
 const p=get(pid);stockEditing=pid;
 modal('Modificar stock','<p class="product-focus">'+esc(p.nombre)+'</p>'+
 formSelect('Qué querés hacer','mode',[['entry','Sumar unidades'],['exit','Restar unidades'],['adjust','Fijar stock según recuento']],initialMode,'id="stock-mode"')+
 '<div id="stock-qty-field">'+field('Cantidad de unidades','qty',initialQty,'number','min="1" step="1" id="stock-qty"')+'</div>'+shortcuts('stock-qty',[1,6,12,24])+
 formSelect('Motivo','reason',stockReasons(initialMode),stockReasons(initialMode)[0],'id="stock-reason"')+
 '<div id="stock-preview" class="stock-preview"></div><p class="muted" id="stock-help"></p>',
 'Confirmar movimiento',fd=>{
 const mode=fd.get('mode'),n=Core.number(fd.get('qty'),'Unidades',mode==='adjust'?0:1,true),reason=String(fd.get('reason')||'').trim();
 const ok=mutate(s=>recordStock(s,pid,mode,n,reason));if(ok)delete stockDrafts[pid];return ok;
 });
 $('#stock-mode').value=initialMode;$('#stock-qty').value=String(initialQty);previewStock();
}
function previewStock(){
 const p=get(stockEditing),input=$('#stock-qty'),n=Number(input.value),mode=$('#stock-mode').value;
 input.min=mode==='adjust'?'0':'1';
 const next=mode==='adjust'?n:mode==='exit'?p.stock-n:p.stock+n;
 const valid=String(input.value).trim()!==''&&Number.isInteger(n)&&n>=(mode==='adjust'?0:1)&&n<=1e9&&next>=0&&next<=1e9&&(mode!=='adjust'||next!==p.stock);
 $('#modal-submit').disabled=!valid;
 $('#modal-submit').textContent=mode==='exit'?'Confirmar salida de stock':mode==='adjust'?'Confirmar recuento':'Confirmar ingreso';
 $('#stock-help').textContent=mode==='exit'?(n>p.stock?'No podés restar más unidades que el stock disponible.':'Esta salida queda registrada con su motivo. No genera una venta ni un cobro.'):mode==='adjust'?'Indicá el total que contaste; puede ser mayor o menor que el stock actual.':'Si esta mercadería tiene un pedido pendiente, recibila desde Pedidos.';
 $('#stock-preview').innerHTML='<div><small>Stock actual</small><strong>'+p.stock+' u.</strong></div><span>→</span><div><small>Stock después de guardar</small><strong class="'+(next<0?'danger-text':'')+'">'+(Number.isFinite(next)?next:'—')+' u.</strong></div>';
}

document.addEventListener('submit',e=>{
 e.preventDefault();
 if(e.target.dataset?.purchaseAdd){try{const qty=Core.number(new FormData(e.target).get('qty'),'Cantidad',1,true);purchaseQty(e.target.dataset.purchaseAdd,qty,true);}catch(err){notify(err.message);}return;}
 if(e.target.id==='scanner-form'){scanSale(new FormData(e.target).get('code'));return;}
 if(e.target.id==='dialog-form'){
   try{if(modalAction(new FormData(e.target))){const next=modalAfterSuccess;modalAfterSuccess=null;$('#modal').close();render();notify('Operación guardada.');if(next)next();}}
   catch(err){$('#modal-error').textContent=err.message;}
 }else if(e.target.dataset.entry){
   try{const pid=e.target.dataset.entry,n=Core.number(new FormData(e.target).get('qty'),'Unidades',1,true);
   const pending=Core.pendingUnits(state,pid);
   if(pending){modal('Este producto tiene pedidos pendientes','<p>Hay '+pending+' unidades pendientes de recibir de '+esc(get(pid).nombre)+'.</p><p>Para recibir ese pedido, volvé y entrá a Pedidos. Si estas '+n+' unidades son una entrega adicional, confirmá el ingreso.</p>','Es una entrega adicional',()=>{const ok=mutate(s=>recordStock(s,pid,'entry',n,'Ingreso adicional a pedidos pendientes'));if(ok)delete stockDrafts[pid];return ok;});}
   else if(mutate(s=>recordStock(s,pid,'entry',n,'Compra a proveedor'))){delete stockDrafts[pid];render();notify('Se sumaron '+n+' unidades. Stock actual: '+get(pid).stock+'.');}}
   catch(err){notify(err.message);}
 }else if(e.target.dataset.price){
   try{const id=e.target.dataset.price,key=e.target.dataset.valueField||'precio',price=Core.number(new FormData(e.target).get('price'),'Importe',key==='costo'?0:.01);if(mutate(s=>Core.prices(s,[id],0,price,key))){delete moneyDrafts[id+':'+key];render();notify(key==='costo'?'Costo actualizado.':'Precio de venta actualizado.');}}
   catch(err){notify(err.message);}
 }
});
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-nav]');if(nav){view=nav.dataset.nav;query='';render();window.scrollTo(0,0);return;}
 const filter=e.target.closest('[data-filter]');
 if(filter){const {filter:key,value}=filter.dataset;if(key==='purchase-tab')purchaseTab=value;if(key==='purchase-filter')purchaseFilter=value;if(key==='purchase-status')purchaseHistoryStatus=value;if(key==='depot-tab')depotTab=value;if(key==='edit-value')editValue=value;if(key==='home-status')homeStatus=value;if(key==='orders-range'){ordersRange=value;ordersPage=1;}if(key==='orders-sort')ordersSort=value;if(key==='period')period=value;if(key==='history')historyFilter=value;if(key==='history-scope')historyAll=value==='all';if(key==='stock')stockFilter=value;if(key==='alerts')alertFilter=value;render();return;}
 const el=e.target.closest('[data-action]');if(!el)return;const id=el.dataset.id;
 switch(el.dataset.action){
 case 'supplier-add':supplierDialog();break;
 case 'purchase-save':savePurchaseDialog();break;
 case 'purchase-detail':purchaseDetail(id);break;
 case 'purchase-pdf':downloadPurchase(id);break;
 case 'purchase-repeat':repeatPurchaseDialog(id);break;
 case 'purchase-cancel':cancelPurchaseDialog(id);break;
 case 'purchase-suggest':purchaseQty(id,Core.replenishment(state,get(id)).qty);break;
 case 'purchase-plus':purchaseQty(id,1,true);break;
 case 'purchase-minus':purchaseQty(id,Math.max(0,(purchaseDraft().items.find(l=>l.productId===id)?.qty||0)-1));break;
 case 'purchase-remove':purchaseQty(id,0);break;
 case 'purchase-clear':modal('Vaciar borrador','<p>Se quitarán los productos y observaciones de este borrador. Los pedidos guardados se conservan.</p>','Vaciar borrador',()=>updatePurchaseDraft(d=>{d.items=[];d.note='';d.copiedFrom=null;}));break;
 case 'quick-pick':{const input=$('#'+el.dataset.target),value=Number(el.dataset.value);input.value=String(el.dataset.mode==='set'?value:(Number(input.value)||0)+value);if(el.dataset.target==='stock-qty')previewStock();if(el.dataset.target==='bulk-pct')previewBulk();break;}

 case 'new-sale':view='home';render();$('#sale-composer').scrollIntoView({behavior:'smooth'});focusScanner();break;
 case 'open-prices':go('prices');break;
 case 'open-alerts':go('alerts');break;
 case 'open-reports':go('reports');break;
 case 'today-orders':ordersRange='today';ordersQuery='';ordersStatus=ordersPayment=ordersCategory='all';ordersPage=1;go('orders');break;
 case 'sale-detail':detailSale(id);break;
 case 'product-detail':detailProduct(id);break;
 case 'clear-selection':selected.clear();render();break;
 case 'focus-prices':$('#price-list').scrollIntoView({behavior:'smooth'});$('#depot-search').focus();break;
 case 'ranking-toggle':ordersShowAll=!ordersShowAll;render();break;
 case 'orders-prev':ordersPage=Math.max(1,ordersPage-1);render();break;
 case 'orders-next':ordersPage++;render();break;
 case 'print-sale':window.print();break;
 case 'close':$('#modal').close();focusScanner();break;
 case 'add':case 'qty':if(changeCart(id,Number(el.dataset.delta||1)))render();else focusScanner();break;
 case 'clear':cart=[];query='';scanFeedback='Carrito vacío. Listo para una nueva orden.';unknownScan='';render();break;
 case 'checkout':checkout();break;
 case 'quick-create':quickCreate();break;
 case 'create-scanned':quickCreate(unknownScan);break;
 case 'lookup-code':lookupQuickCode();break;
 case 'quick-existing-stock':stockDialog(id);break;
 case 'duplicate-product':quickCreate('',id);break;
 case 'new-product':editProduct();break;
 case 'edit-product':editProduct(id);break;
 case 'stock':stockDialog(id);break;
 case 'stock-remove':stockDialog(id,'exit',stockDrafts[id]||1);break;
 case 'bulk-all':bulk('all');break;
 case 'bulk-category':bulk('category');break;
 case 'bulk-selected':bulk('selected');break;
 case 'cancel-sale':cancelSale(id);break;
 case 'order':orderDialog(id);break;
 case 'receive':receive(id);break;
 case 'export':exportReport();break;
 case 'history':ordersRange='all';ordersQuery='';ordersStatus=ordersPayment=ordersCategory='all';ordersPage=1;go('orders');break;
 case 'reset':modal('Reiniciar demo','<p>Se reemplazarán productos, precios, ventas y pedidos por los datos de ejemplo iniciales. Esta acción no se puede deshacer.</p>','Reiniciar datos',()=>{const ok=mutate(s=>Object.assign(s,Core.upgrade(Core.seed())));if(ok){cart=[];selected.clear();stockDrafts={};moneyDrafts={};purchaseQtyDrafts={};purchaseTab='compose';query='';view='home';}return ok;},true);break;
 }
});
document.addEventListener('input',e=>{
 const form=e.target.closest?.('form');
 if(form?.dataset.purchaseAdd)purchaseQtyDrafts[form.dataset.purchaseAdd]=e.target.value;
 if(e.target.id==='purchase-note')updatePurchaseDraft(d=>{d.note=e.target.value;});
 if(e.target.id==='purchase-search'){purchaseQuery=e.target.value;$('#purchase-catalog').innerHTML=purchaseCatalog();}
 if(e.target.id==='purchase-history-query'){purchaseHistoryQuery=e.target.value;$('#purchase-history').innerHTML=purchaseHistoryRows();}
 if(form?.dataset.entry)stockDrafts[form.dataset.entry]=e.target.value;
 if(form?.dataset.price)moneyDrafts[form.dataset.price+':'+(form.dataset.valueField||'precio')]=e.target.value;
 if(e.target.id==='quick-code'){$('#quick-code-result').innerHTML='';$('#modal-submit').disabled=false;}
 if(e.target.id==='orders-search'){ordersQuery=e.target.value;ordersPage=1;$('#orders-results').innerHTML=ordersResults();}
 if(e.target.id==='bulk-pct')previewBulk();
 if(e.target.id==='stock-qty')previewStock();
 if(e.target.id==='pos-search'){query=e.target.value;$('#pos-results').innerHTML=productResults();}
 if(e.target.id==='depot-search'){query=e.target.value;$('#depot-table').innerHTML=depotTable();}
 if(e.target.id==='history-search'){historyQuery=e.target.value;const pos=e.target.selectionStart;render();$('#history-search').focus();$('#history-search').setSelectionRange(pos,pos);}
});
document.addEventListener('change',e=>{
 const el=e.target;
 if(el.id==='purchase-category'){purchaseCategory=el.value;$('#purchase-catalog').innerHTML=purchaseCatalog();}
 if(el.id==='purchase-supplier'){if(!updatePurchaseDraft(d=>{d.supplier=el.value;}))el.value=purchaseDraft().supplier;}
 if(el.dataset.purchaseLine){
  const pid=el.dataset.purchaseLine;
  try{const qty=Core.number(el.value,'Cantidad a pedir',1,true);if(updatePurchaseDraft(d=>{const line=d.items.find(l=>l.productId===pid);if(!line)throw Error('El producto ya no está en el borrador.');line.qty=qty;}))$('#purchase-draft-total').textContent=draftUnits()+' u.';else el.value=purchaseDraft().items.find(l=>l.productId===pid)?.qty||1;}
  catch(err){el.value=purchaseDraft().items.find(l=>l.productId===pid)?.qty||1;notify(err.message);}
 }
 if(el.id==='sale-category'){saleCategory=el.value;$('#pos-results').innerHTML=productResults();focusScanner();}
 if(el.id==='product-category'){$('#product-kind').innerHTML=typeChoices(el.value).map(t=>'<option value="'+esc(t)+'">'+esc(t)+'</option>').join('');$('#product-kind').value='General';}
 if(el.id==='stock-mode'){$('#stock-reason').innerHTML=stockReasons(el.value).map(r=>'<option>'+esc(r)+'</option>').join('');previewStock();}
 if(el.id==='bulk-direction'){bulkDraft.direction=el.value;previewBulk();}
 if(el.dataset.selectCategory){filteredProducts().filter(p=>p.categoria===el.dataset.selectCategory).forEach(p=>el.checked?selected.add(p.id):selected.delete(p.id));render();}
 if(el.name==='scope'){bulkDraft.scope=el.value;renderBulkGroups();previewBulk();}
 if(el.dataset.bulkGroup){const key=bulkDraft.scope==='category'?'categories':'types';bulkDraft[key]=el.checked?[...bulkDraft[key],el.dataset.bulkGroup]:bulkDraft[key].filter(v=>v!==el.dataset.bulkGroup);previewBulk();}
 if(el.id==='product-type'){productType=el.value;render();}
 if(el.id==='orders-status'){ordersStatus=el.value==='Confirmadas'?'confirmed':el.value==='Anuladas'?'cancelled':'all';ordersPage=1;render();}
 if(el.id==='orders-category'){ordersCategory=el.value;ordersPage=1;render();}
 if(el.id==='orders-payment'){ordersPayment=el.value;ordersPage=1;render();}
 if(el.id==='orders-date'&&el.value){ordersDate=el.value;ordersPage=1;render();}
 if(el.dataset.select){if(el.checked)selected.add(el.dataset.select);else selected.delete(el.dataset.select);render();}
 if(el.id==='select-visible'){filteredProducts().forEach(p=>el.checked?selected.add(p.id):selected.delete(p.id));render();}
 if(el.id==='category'){category=el.value;productType='all';render();}
 if(el.id==='report-category'){reportCategory=el.value;render();}
 if(el.id==='report-payment'){paymentFilter=el.value;render();}
 if(el.id==='report-date'&&el.value){anchor=el.value;render();}
});
document.addEventListener('keydown',scannerKeydown);
$('#modal').addEventListener('close',focusScanner);
window.addEventListener('storage',e=>{
 if(e.key===KEY){try{state=e.newValue?Core.upgrade(JSON.parse(e.newValue)):state;cart=[];selected.clear();$('#modal').close();stockDrafts={};moneyDrafts={};render();notify('Datos actualizados desde otra pestaña. Revisá el carrito.');}catch{notify('No se pudieron actualizar los datos. Recargá la página.');}}
});
render();
