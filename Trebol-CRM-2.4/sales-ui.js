"use strict";
// One sale composer: scanner, keyboard and pointer use the same validated operations.
let saleSelected=null,saleSearchOpen=false,saleBrowse=false,saleSearchIndex=0,saleUndo=null;
let saleDialog='',saleSubmitting=false,salePrinting=false,saleEditing=null;
let saleMultiplier=1,saleError='',saleF8Down=false,salePrintEnabled=false;
try{salePrintEnabled=localStorage.getItem('trebol-print-on-sale')==='true';}catch{}
const saleAmount=(p,n,price=p.precio)=>Core.money(n/Core.factor(p)*price);
function total(){return Core.money(cart.reduce((sum,l)=>sum+saleAmount(get(l.id),l.cant,l.precio??get(l.id).precio),0));}
function saleRemember(){saleUndo={cart:structuredClone(cart),selected:saleSelected,revision:state.revision};}
function saleResetEntry(){saleMultiplier=1;saleError='';unknownScan='';saleEditing=null;}
function saleResolveRead(){saleError='';unknownScan='';clearTimeout(timer);$('#toast').hidden=true;$('#toast').classList.remove('show');}
function saleBeep(){
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;const audio=new Audio(),osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.value=220;gain.gain.value=.08;osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.18);osc.onended=()=>audio.close();}catch{}
}
function saleReadError(message){saleMultiplier=1;saleError=message;scanFeedback=message;saleBeep();render();notify(message);return false;}
function addQuantity(pid,n,price,lotId,replace=false){
 const p=get(pid),line=cart.find(l=>l.id===pid);if(!p)throw Error('Producto no encontrado.');
 const qty=replace?n:(line?.cant||0)+n;Core.number(qty,'Cantidad',1,true);
 if(qty>Core.available(state,p))throw Error('Disponible: '+Core.qtyText(p,Core.available(state,p))+'. Revisá la cantidad.');
 const selectedLot=lotId===undefined?line?.lotId:lotId;
 if(selectedLot){const lot=state.lots.find(l=>l.id===selectedLot&&l.productId===pid);if(!lot||Core.expired(lot)||qty>lot.qty)throw Error('El lote elegido no tiene esa cantidad disponible.');}
 if(line&&price!==undefined&&Math.abs((line.precio??p.precio)-price)>.001&&!replace)throw Error('Hay otra porción con distinto precio. Revisá la línea antes de agregarla.');
 if(!line||qty!==line.cant||(price!==undefined&&price!==line.precio)||selectedLot!==line.lotId)saleRemember();
 if(line){line.cant=qty;if(price!==undefined)line.precio=price;line.lotId=selectedLot||null;}
 else cart.push({id:pid,cant:qty,precio:price??p.precio,lotId:selectedLot||null});
 saleSelected=pid;scanFeedback=p.nombre+' · '+Core.qtyText(p,qty)+' en la venta';return true;
}
function saleRemove(pid){
 const line=cart.find(l=>l.id===pid);if(!line)return;
 saleRemember();cart=cart.filter(l=>l.id!==pid);saleSelected=cart.at(-1)?.id||null;saleEditing=null;
 scanFeedback=get(pid).nombre+' · Quitado. Ctrl+Z para deshacer.';render();
}
function changeCart(pid,delta=1){
 const p=get(pid);if(!p)return false;
 if(Core.weight(p)){weightDialog(pid);return false;}
 try{const line=cart.find(l=>l.id===pid);if(delta<0){if(!line)return false;const n=line.cant+delta;if(n<=0){saleRemove(pid);return true;}addQuantity(pid,n,line.precio,line.lotId,true);}else addQuantity(pid,delta);return true;}catch(error){scanFeedback=error.message;notify(error.message);return false;}
}
function weightDialog(pid,{grams,tagAmount,edit=false}={}){
 const p=get(pid),line=cart.find(l=>l.id===pid);if(Core.available(state,p)<1){notify('Este producto no tiene stock disponible.');return;}
 saleMultiplier=1;const qty=grams??(edit?line?.cant:'');
 modal(edit?'Editar peso total':'Ingresar peso','<div class="sale-weight-body"><p class="product-focus">'+esc(p.nombre)+'</p><p>'+cash(p.precio)+' por kg · Disponible '+Core.qtyText(p,Core.available(state,p))+'</p><div class="form-grid">'+field('Peso','grams',qty,'text','id="weight-grams" inputmode="decimal" autocomplete="off"')+formSelect('Unidad','weightUnit',[['g','Gramos'],['kg','Kilogramos']],'g','id="weight-unit"')+'</div>'+
 (p.trackExpiry?'<details class="optional-field"><summary>Revisar lote · primero el que vence antes</summary>'+formSelect('Lote retirado','lotId',[['','Primero el que vence antes'],...Core.lots(state,p.id).filter(l=>l.qty>0&&!Core.expired(l)).map(l=>[l.id,l.expiry+' · '+l.label+' · '+Core.qtyText(p,l.qty)])],edit?line?.lotId||'':'')+'</details>':'')+
 (tagAmount!==undefined?'<p class="notice">Etiqueta: '+cash(tagAmount)+'. Ingresá el peso impreso para controlar el stock.</p><label class="check-label"><input name="tag-price" type="checkbox"> Usar el importe de la etiqueta (revisado)</label>':'')+'<div id="weight-preview" class="stock-preview" aria-live="polite"></div><p class="muted">Enter para guardar · Esc para volver al lector.</p></div>',edit?'Guardar peso total':'Agregar a la venta',fd=>{
  const kg=fd.get('weightUnit')==='kg',n=Core.quantity(p,fd.get('grams'),kg?'kg':'base',kg?.001:1);
  const price=fd.get('tag-price')?tagAmount/(n/1000):edit?(line?.precio??p.precio):p.precio;
  addQuantity(pid,n,price,fd.get('lotId'),edit);query='';saleSearchOpen=false;saleBrowse=false;saleResolveRead();return true;
 });saleDialog='weight';
 const preview=()=>{try{const kg=$('#weight-unit').value==='kg',n=Core.quantity(p,$('#weight-grams').value,kg?'kg':'base',kg?.001:1),price=edit?(line?.precio??p.precio):p.precio;
  const useTag=tagAmount!==undefined&&$('#modal [name="tag-price"]')?.checked;
  $('#weight-preview').textContent=n.toLocaleString('es-AR')+' g = '+Core.qtyText(p,n)+' · '+cash(useTag?tagAmount:saleAmount(p,n,price))+(tagAmount!==undefined?' · Diferencia con precio del catálogo: '+cash(saleAmount(p,n,price)-tagAmount):'');$('#modal-submit').disabled=n>Core.available(state,p);
 }catch{$('#weight-preview').textContent='Ingresá el peso indicado por la balanza.';$('#modal-submit').disabled=true;}};
 $('#weight-grams').addEventListener('input',preview);$('#modal [name="tag-price"]')?.addEventListener('change',preview);
 $('#weight-unit').addEventListener('change',()=>{$('#weight-grams').value='';preview();$('#weight-grams').focus();});preview();$('#weight-grams').focus();$('#weight-grams').select?.();
}
function saleEditQuantity(){
 const line=cart.find(l=>l.id===saleSelected)||cart.at(-1);if(!line){notify('Agregá un producto primero.');return;}
 saleMultiplier=1;saleSelected=line.id;const p=get(line.id);if(Core.weight(p)){weightDialog(p.id,{edit:true});return;}
 saleEditing=line.id;render();const input=$('[data-cart-quantity="'+line.id+'"]');input.focus();input.select?.();
}
function saleCommitQuantity(target){
 const line=cart.find(l=>l.id===target.dataset.cartQuantity);if(!line)return false;
 try{const n=Core.number(target.value,'Cantidad',1,true);addQuantity(line.id,n,line.precio,line.lotId,true);saleEditing=null;render();return true;}
 catch(error){target.value=line.cant;notify(error.message);return false;}
}
function scanSale(raw){
 if(view!=='home'||$('#modal').open||salePrinting)return false;
 if(saleError){notify('Resolvé la lectura pendiente: F2 para buscar o Esc para omitir.');return false;}
 let code=String(raw||'').trim();if(!code){focusScanner();return false;}
 let count=saleMultiplier;saleMultiplier=1;
 const multiplied=code.match(/^([1-9]\d{0,5})\*(.+)$/);if(multiplied&&!state.products.some(p=>p.codigo===code)){count=Number(multiplied[1]);code=multiplied[2];}
 $('#pos-code').value='';query='';saleSearchOpen=false;saleBrowse=false;
 try{
  const matches=state.products.filter(p=>p.codigo===code);if(matches.length>1)throw Error('Código duplicado: revisá el catálogo.');
  const p=matches[0]||state.products.find(p=>p.scaleCode&&p.scaleCode===code);
  if(p){if(Core.weight(p)){if(count!==1)throw Error('Para productos por peso, ingresá gramos; no uses el multiplicador.');weightDialog(p.id);return true;}addQuantity(p.id,count);saleResolveRead();render();return true;}
  const parsed=Core.parseScale(state,code);
  if(parsed){if(count!==1)throw Error('Las etiquetas de balanza ya incluyen la cantidad.');if(parsed.grams){addQuantity(parsed.product.id,parsed.grams);saleResolveRead();render();return true;}weightDialog(parsed.product.id,{tagAmount:parsed.amount});return true;}
  unknownScan=code.length<=40?code:'';return saleReadError('Código no registrado: '+code);
 }catch(error){unknownScan='';return saleReadError(error.message);}
}
function saleMatches(){
 const text=norm(query).trim(),words=text.split(/\s+/).filter(Boolean);
 if(!text&&!saleBrowse)return [];
 return state.products.filter(p=>{
  const searchable=norm([p.nombre,p.marca,p.presentacion,p.categoria,p.tipo,p.codigo,p.scaleCode,Core.weight(p)?'peso kg':'unidad'].filter(Boolean).join(' '));
  return words.every(word=>searchable.includes(word))&&(saleCategory==='all'||p.categoria===saleCategory);
 }).sort((a,b)=>Number(norm(b.codigo)===text||!!b.scaleCode&&norm(b.scaleCode)===text)-Number(norm(a.codigo)===text||!!a.scaleCode&&norm(a.scaleCode)===text));
}
function productResults(){
 const list=saleMatches();saleSearchIndex=Math.max(0,Math.min(saleSearchIndex,list.length-1));
 return '<p class="sale-search-count" role="status" aria-live="polite">'+list.length+' '+(list.length===1?'producto encontrado':'productos encontrados')+'</p><div class="sale-products" role="group" aria-label="Resultados de productos">'+(list.map((p,i)=>{const line=cart.find(l=>l.id===p.id),left=Core.available(state,p)-(line?.cant||0);return '<button type="button" class="sale-product '+(i===saleSearchIndex?'search-selected':'')+'" data-action="add" data-id="'+p.id+'" '+(left<=0?'disabled':'')+'><span class="sale-product-main"><strong>'+esc(p.nombre)+'</strong><span class="sale-product-meta">'+(p.marca?'<small>Marca: '+esc(p.marca)+'</small>':'')+(p.presentacion?'<small>Presentación: '+esc(p.presentacion)+'</small>':'')+'<small>'+esc(p.categoria)+' · '+esc(p.tipo||'General')+'</small><small>'+ (Core.weight(p)?'Venta por peso':'Venta por unidad')+'</small></span><small class="sale-product-code">Código: '+esc(p.codigo)+(p.scaleCode?' · PLU: '+esc(p.scaleCode):'')+'</small></span><span class="align-right"><strong>'+cash(p.precio)+'/'+(Core.weight(p)?'kg':'u.')+'</strong><small>'+Core.qtyText(p,Math.max(0,left))+' disponibles</small>'+(line?'<small>En compra: '+Core.qtyText(p,line.cant)+'</small>':'')+'</span></button>';}).join('')||'<p class="empty">'+(query.trim()?'No hay productos para esta búsqueda.':'Escribí nombre, marca, presentación o código.')+'</p>')+'</div>';
}
function saleLine(l){
 const p=get(l.id),chosen=l.id===saleSelected;
 const quantity=Core.weight(p)?'<button type="button" class="button" data-x="weight-edit" data-id="'+p.id+'">'+Core.qtyText(p,l.cant)+' · Editar</button>':
  btn('−','qty','data-id="'+p.id+'" data-delta="-1" aria-label="Restar una unidad de '+esc(p.nombre)+'"')+'<input '+(chosen?'id="sale-quantity" ':'')+'type="number" min="1" step="1" value="'+l.cant+'" data-cart-quantity="'+p.id+'" aria-label="Cantidad total de '+esc(p.nombre)+'">'+btn('+','qty','data-id="'+p.id+'" aria-label="Sumar una unidad de '+esc(p.nombre)+'"');
 const lots=p.trackExpiry?'<details class="sale-lot"><summary>Lote: '+esc(l.lotId?state.lots.find(x=>x.id===l.lotId)?.label||'Seleccionado':'primero el que vence antes')+'</summary><label class="field">Lote retirado<select data-cart-lot="'+p.id+'"><option value="">Primero el que vence antes</option>'+Core.lots(state,p.id).filter(lot=>lot.qty>0&&!Core.expired(lot)).map(lot=>'<option value="'+esc(lot.id)+'" '+(l.lotId===lot.id?'selected':'')+'>'+esc(lot.expiry+' · '+lot.label)+'</option>').join('')+'</select></label></details>':'';
 return '<article class="basket-line '+(chosen?'sale-line-selected':'')+' '+(saleEditing===p.id?'sale-line-editing':'')+'" data-sale-line="'+p.id+'"><div class="sale-line-name"><button type="button" class="product-link" data-sale-select="'+p.id+'" aria-pressed="'+chosen+'">'+esc(p.nombre)+'</button><small>'+esc(p.codigo)+(chosen?' · Seleccionado':'')+'</small></div><div class="quantity">'+quantity+'</div><span class="sale-line-price">'+cash(l.precio??p.precio)+'/'+(Core.weight(p)?'kg':'u.')+'</span><strong class="line-total">'+cash(saleAmount(p,l.cant,l.precio??p.precio))+'</strong>'+btn('Quitar','remove-cart','data-id="'+p.id+'" aria-label="Quitar '+esc(p.nombre)+'"')+lots+(saleEditing===p.id?'<p class="sale-edit-help">Cantidad total · Enter guarda · Esc cancela</p>':'')+'</article>';
}
function cartLines(){return cart.map(saleLine).join('')||'<div class="empty cart-placeholder"><strong>Listo para una nueva venta</strong><p>Escaneá un producto o buscá con F2.</p></div>';}
function saleMeasureText(){const units=cart.filter(l=>!Core.weight(get(l.id))).reduce((sum,l)=>sum+l.cant,0),grams=cart.filter(l=>Core.weight(get(l.id))).reduce((sum,l)=>sum+l.cant,0);return [units?units+' unidades':'',grams?Core.qtyText({measure:'weight'},grams):''].filter(Boolean).join(' · ')||'Sin productos';}
function pos(){
 if(!cart.some(l=>l.id===saleSelected)){saleSelected=cart.at(-1)?.id||null;saleEditing=null;}
 return '<div class="sale-station"><section class="scanner-box"><form id="scanner-form"><label class="field">Escanear o ingresar código<input id="pos-code" name="code" type="text" autocomplete="off" spellcheck="false" maxlength="60" aria-describedby="scanner-help scan-feedback" placeholder="Escaneá un producto…"></label><button class="button" type="submit">Agregar</button></form><p id="scanner-help">6 * y escaneá para agregar 6 unidades.</p><p id="scan-feedback" role="status" aria-live="polite">'+esc(scanFeedback||'Listo para recibir una lectura.')+'</p>'+
 (saleMultiplier!==1?'<p class="sale-multiplier" role="status">Próxima lectura: <strong>×'+saleMultiplier+'</strong> <span>· Esc cancela</span></p>':'')+
 (saleError?'<div class="sale-read-error" role="alert"><strong>No se agregó el producto</strong><p>'+esc(saleError)+'</p><button type="button" class="button" data-sale-command="search">Buscar producto · F2</button><button type="button" class="button" data-sale-command="dismiss">Omitir lectura · Esc</button></div>':'')+
 (saleUndo?'<button type="button" class="text-btn" data-sale-command="undo">Deshacer última acción · Ctrl+Z</button>':'')+'</section>'+
 '<div class="sale-workspace"><section class="sale-main"><div class="sale-tools"><h2>Venta en curso <small>'+cart.length+' productos</small></h2><button type="button" class="button" data-sale-command="search" aria-expanded="'+saleSearchOpen+'">Buscar <kbd>F2</kbd></button></div>'+
 '<section id="sale-search-panel" '+(saleSearchOpen?'':'hidden')+'><div class="toolbar"><label class="field grow">Buscar por nombre, marca, presentación o código<input id="pos-search" type="search" autocomplete="off" value="'+esc(query)+'" placeholder="Ej.: leche, Serenísima, 1 L…" aria-describedby="sale-search-help"></label>'+select('Categoría','sale-category',categories(),saleCategory,'Todas')+'</div><p class="muted" id="sale-search-help">Filtra mientras escribís · ↑ ↓ elige · Enter agrega · Esc vuelve al lector</p><button type="button" class="text-btn" data-sale-command="browse">Ver '+(saleBrowse?'solo búsqueda':'todos los productos')+'</button><div id="pos-results">'+(saleSearchOpen?productResults():'')+'</div></section>'+
 '<div class="sale-column-head" aria-hidden="true"><span>Producto</span><span>Cantidad / peso</span><span>Precio</span><span>Subtotal</span><span></span></div><div id="cart-lines">'+cartLines()+'</div><p class="sale-shortcuts" aria-label="Atajos de venta"><span><kbd>↑ ↓</kbd> Seleccionar</span><span><kbd>+ −</kbd> Unidades</span><span><kbd>F3</kbd> Cantidad / peso</span><span><kbd>Supr</kbd> Quitar</span><span><kbd>F8</kbd> Revisar</span></p></section>'+
 '<aside class="panel sale-summary"><h2>Resumen</h2><p class="muted sale-measures">'+saleMeasureText()+'</p><div class="basket-total"><span>Total a cobrar</span><strong>'+cash(total())+'</strong></div>'+btn('Revisar venta <kbd>F8</kbd>','checkout',cart.length?'':'disabled',true)+'<p class="muted sale-stock-help">Confirmá después de cobrar.</p><details class="sale-options"><summary>Opciones de este puesto</summary><label class="check-label"><input id="sale-print-setting" type="checkbox" '+(salePrintEnabled?'checked':'')+'> Abrir impresión al confirmar</label><p class="muted">Se recuerda en este navegador. Abre el diálogo de impresión.</p>'+btn('Vaciar toda la compra','clear',cart.length?'':'disabled')+'</details></aside></div></div>';
}
function checkout(){
 if(!cart.length||salePrinting)return;
 if(saleError||saleMultiplier!==1||$('#pos-code').value.trim()){notify('Terminá o cancelá la entrada pendiente antes de revisar.');return;}
 modal('Revisar venta','<section class="sale-review-body"><div class="sale-review-total"><span>Total a cobrar</span><strong>'+cash(total())+'</strong><p>'+cart.length+' productos · '+saleMeasureText()+'</p></div><p class="sale-payment-reminder">Confirmá solo después de cobrar.</p><details class="sale-review-detail"><summary>Revisar productos de la compra</summary><div class="preview">'+cart.map(l=>'<div class="simple-row"><span>'+esc(get(l.id).nombre)+'<small>'+Core.qtyText(get(l.id),l.cant)+'</small></span><strong>'+cash(saleAmount(get(l.id),l.cant,l.precio))+'</strong></div>').join('')+'</div></details><p class="sale-close-help"><kbd>F8</kbd> confirma la venta · <kbd>Esc</kbd> vuelve a la compra</p><p class="muted">'+(salePrintEnabled?'Después de guardar se abrirá la impresión.':'La venta queda guardada; el ticket se puede recuperar después.')+'</p></section>','Confirmar venta · F8',()=>{
  if(saleSubmitting||saleDialog!=='checkout')return false;
  saleSubmitting=true;let saleId;
  const ok=mutate(s=>{const sale=Core.sell(s,cart,'Sin registrar');sale.customer='Consumidor final';sale.customerType='Consumidor final';sale.note='';saleId=sale.id;});
  if(!ok){saleSubmitting=false;return false;}
  lastSaleId=saleId;cart=[];query='';saleSelected=null;saleUndo=null;saleSearchOpen=false;saleBrowse=false;saleResetEntry();saleDialog='';scanFeedback='Venta registrada. Escaneá la siguiente compra.';
  modalAfterSuccess=()=>{saleSubmitting=false;if(salePrintEnabled){try{printTicket(saleId);}catch{salePrinting=false;notify('Venta guardada. No se pudo abrir la impresión; reintentá desde Ventas.');}}};return true;
 });saleDialog='checkout';saleSubmitting=false;
}
function saleKeyboard(e){
 const target=e.target,open=$('#modal').open;
 if(view!=='home'||e.isComposing||salePrinting)return false;
 if(e.key==='F8'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
  e.preventDefault();if(e.repeat||saleF8Down)return true;saleF8Down=true;
  if(open){if(saleDialog==='checkout'&&!saleSubmitting)$('#dialog-form').requestSubmit();return true;}
  if(target.dataset?.cartQuantity&&!saleCommitQuantity(target))return true;
  checkout();return true;
 }
 if(open&&saleDialog==='checkout'){
  // There are no text fields here: scanner data and all variants of Enter are inert.
  if(e.key==='Enter'||e.key.length===1){e.preventDefault();return true;}return false;
 }
 if(open)return false;
 const editable=target.matches?.('input,select,textarea,[contenteditable="true"]');
 const entry=target.id==='pos-code',idle=entry&&!target.value||!editable;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&idle){e.preventDefault();if(!e.repeat)saleCommand('undo');return true;}
 if(e.ctrlKey||e.metaKey||e.altKey)return false;
 if(e.key==='Escape'){
  e.preventDefault();if(target.dataset?.cartQuantity)target.value=cart.find(l=>l.id===target.dataset.cartQuantity)?.cant||1;
  saleResetEntry();saleResolveRead();saleSearchOpen=false;saleBrowse=false;query='';scanFeedback='Listo para escanear.';render();return true;
 }
 if(e.key==='F2'){e.preventDefault();if(!e.repeat)saleOpenSearch();return true;}
 if(e.key==='F3'){e.preventDefault();if(!e.repeat)saleEditQuantity();return true;}
 if(target.dataset?.cartQuantity&&e.key==='Enter'){e.preventDefault();saleCommitQuantity(target);return true;}
 if(target.id==='pos-search'&&['ArrowUp','ArrowDown','Enter'].includes(e.key)){
  e.preventDefault();const list=saleMatches();
  if(e.key==='Enter'){const p=list[saleSearchIndex];if(p){if(Core.weight(p))weightDialog(p.id);else if(changeCart(p.id)){saleResolveRead();saleSearchOpen=false;query='';render();}}}
  else{saleSearchIndex=Math.max(0,Math.min(list.length-1,saleSearchIndex+(e.key==='ArrowDown'?1:-1)));$('#pos-results').innerHTML=productResults();document.querySelector('.search-selected')?.scrollIntoView({block:'nearest'});}return true;
 }
 if(entry&&e.key==='*'&&!state.products.some(p=>p.codigo.startsWith(target.value+'*'))&&/^[1-9]\d{0,5}$/.test(target.value)){
  e.preventDefault();saleMultiplier=Number(target.value);target.value='';render();return true;
 }
 if(idle&&['ArrowUp','ArrowDown'].includes(e.key)){
  e.preventDefault();if(cart.length){let i=cart.findIndex(l=>l.id===saleSelected);i=Math.max(0,Math.min(cart.length-1,i+(e.key==='ArrowUp'?-1:1)));saleSelected=cart[i].id;saleEditing=null;render();}return true;
 }
 if(idle&&e.key==='Delete'){e.preventDefault();if(!e.repeat)saleRemove(saleSelected);return true;}
 if(idle&&(['+','-','−','F6','F7'].includes(e.key))){
  if(entry&&['+','-'].includes(e.key)&&!e.code?.startsWith('Numpad')&&state.products.some(p=>p.codigo.startsWith(e.key)))return false;
  e.preventDefault();if(!e.repeat&&saleSelected){if(Core.weight(get(saleSelected)))saleEditQuantity();else{changeCart(saleSelected,['+','F6'].includes(e.key)?1:-1);render();}}return true;
 }
 return false;
}
function saleKeyup(e){if(e.key==='F8')saleF8Down=false;}
function saleOpenSearch(){saleMultiplier=1;saleSearchOpen=true;saleSearchIndex=0;render();$('#pos-search').focus();if(window.innerWidth<=650)$('#sale-search-panel').scrollIntoView({block:'start'});}
function saleAfterRender(){
 const container=$('#cart-lines'),line=document.querySelector('[data-sale-line="'+saleSelected+'"]');
 if(container.style&&window.innerHeight){const top=container.getBoundingClientRect().top,help=document.querySelector('.sale-shortcuts'),bottom=window.innerWidth<=950?document.querySelector('.sale-summary').getBoundingClientRect().top-16:window.innerHeight-(help?.getBoundingClientRect().height||80)-32;container.style.maxHeight=Math.max(160,bottom-top)+'px';}
 if(!line?.getBoundingClientRect)return;
 const box=container.getBoundingClientRect(),item=line.getBoundingClientRect();
 if(item.height>box.height||item.top<box.top)container.scrollTop+=item.top-box.top;else if(item.bottom>box.bottom)container.scrollTop+=item.bottom-box.bottom;
}
function saleCommand(command,id){
 if(command==='select'){saleSelected=id;saleEditing=null;render();return;}
 if(command==='dismiss'){saleResetEntry();saleResolveRead();scanFeedback='Lectura omitida. Listo para escanear.';render();return;}
 if(command==='search'){if(!saleSearchOpen)saleOpenSearch();else{saleSearchOpen=false;render();}return;}
 if(command==='browse'){saleBrowse=!saleBrowse;saleSearchIndex=0;$('#pos-results').innerHTML=productResults();$('[data-sale-command="browse"]').textContent=saleBrowse?'Ver solo búsqueda':'Ver todos los productos';return;}
 if(command==='undo'&&saleUndo){
  try{if(saleUndo.revision!==state.revision)throw Error('Los datos cambiaron. No se puede deshacer esta acción.');if(saleUndo.cart.length)Core.sell(structuredClone(state),saleUndo.cart,'Sin registrar');cart=structuredClone(saleUndo.cart);saleSelected=saleUndo.selected;saleUndo=null;saleEditing=null;scanFeedback='Última acción deshecha.';render();}catch(error){notify(error.message);}
 }
}
function saleSetPrint(enabled){try{localStorage.setItem('trebol-print-on-sale',String(enabled));salePrintEnabled=enabled;}catch{notify('No se pudo guardar la preferencia de impresión.');}return salePrintEnabled;}
