// Optional production-DOM check. Requires playwright-core and a running static server.
// PLAYWRIGHT_MODULE can point to an externally installed package; no runtime dependency is added.
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:5173');
  const before=await page.evaluate(()=>({sales:state.sales.length,stock:get('p1').stock,oldPayment:state.sales[0].payment}));
  const scan=async code=>{await page.locator('#pos-code').fill(code);await page.keyboard.press('Enter');};
  await page.locator('#pos-code').fill('6');await page.keyboard.press('NumpadMultiply');
  assert.equal(await page.evaluate(()=>saleMultiplier),6);
  await scan('7790895001234');assert.equal(await page.evaluate(()=>cart[0].cant),6);
  await scan('7790895001234');assert.equal(await page.evaluate(()=>cart[0].cant),7);
  await page.keyboard.press('NumpadSubtract');assert.equal(await page.evaluate(()=>cart[0].cant),6);
  await page.keyboard.press('F3');assert.equal(await page.locator('#modal').evaluate(el=>el.open),false);
  await page.locator('#sale-quantity').fill('8');await page.keyboard.press('Enter');
  await page.keyboard.press('F3');await page.locator('#sale-quantity').fill('10');await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>cart[0].cant),8);
  await scan('7790895002231');await page.keyboard.press('ArrowUp');assert.equal(await page.evaluate(()=>saleSelected),'p1');
  await page.keyboard.press('Delete');assert.equal(await page.evaluate(()=>cart.length),1);
  await page.keyboard.press('Control+z');assert.equal(await page.evaluate(()=>cart[0].cant),8);
  await scan('P-JAMON');await page.locator('#weight-grams').pressSequentially('1250',{delay:5});await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>cart.at(-1).cant),1250);
  await scan('NO-REGISTRADO');const count=await page.evaluate(()=>cart.length);
  await scan('7790895001234');assert.equal(await page.evaluate(()=>cart.length),count);assert.equal(await page.evaluate(()=>cart[0].cant),8);
  await page.keyboard.press('F8');assert.equal(await page.locator('#modal').evaluate(el=>el.open),false);
  await page.keyboard.press('Escape');await page.keyboard.press('F2');await page.locator('#pos-search').fill('Pan lactal');await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>cart.find(l=>l.id==='p2').cant),2);
  await page.keyboard.press('F2');await page.locator('#pos-search').fill('00001');await page.keyboard.press('Enter');
  await page.locator('#weight-grams').fill('250');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>cart.at(-1).cant),1500);
  assert.equal(await page.locator('#sale-search-panel').isVisible(),false);assert(await page.evaluate(()=>document.querySelector('#cart-lines').getBoundingClientRect().top<window.innerHeight));
  await page.locator('.sale-options summary').click();await page.locator('#sale-print-setting').check();await page.locator('.sale-options summary').click();
  if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'cashier-desktop.png'),fullPage:true});
  await page.keyboard.down('F8');await page.keyboard.down('F8');
  assert.equal(await page.evaluate(()=>state.sales.length),before.sales);await page.keyboard.up('F8');
  assert.equal(await page.locator('#modal input,#modal select,#modal textarea').count(),0);
  await page.keyboard.press('Enter');await page.keyboard.press('Control+Enter');
  await page.keyboard.type('7790895001234');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>state.sales.length),before.sales);
  await page.locator('.sale-review-detail summary').click();assert(await page.getByText('Leche La Serenísima 1L',{exact:true}).last().isVisible());
  await page.locator('.sale-review-detail summary').click();
  if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'review-desktop.png'),fullPage:true});
  await page.evaluate(()=>{window.printCalls=0;window.print=()=>window.printCalls++;window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='trebol-demo-v3')throw Error('Simulated storage failure');return window.originalSetItem.call(this,k,v);};});
  await page.keyboard.press('F8');assert.equal(await page.evaluate(()=>state.sales.length),before.sales);assert.equal(await page.evaluate(()=>window.printCalls),0);assert.equal(await page.evaluate(()=>cart.length),count);
  await page.evaluate(()=>Storage.prototype.setItem=window.originalSetItem);await page.keyboard.press('F8');
  assert.equal(await page.evaluate(()=>state.sales.length),before.sales+1);assert.equal(await page.evaluate(()=>get('p1').stock),before.stock-8);
  assert.equal(await page.evaluate(()=>state.sales.at(-1).payment),'Sin registrar');assert.equal(await page.evaluate(()=>state.sales[0].payment),before.oldPayment);
  assert.equal(await page.evaluate(()=>window.printCalls),1);assert.equal(await page.evaluate(()=>document.activeElement.id),'pos-code');
  await page.evaluate(()=>printTicket(lastSaleId));assert.equal(await page.evaluate(()=>window.printCalls),2);assert.equal(await page.evaluate(()=>get('p1').stock),before.stock-8);
  const download=page.waitForEvent('download');await page.locator('.sale-success [data-action=ticket-pdf]').click();assert((await download).suggestedFilename().endsWith('.pdf'));
  for(const view of ['orders','products','reports','alerts','home'])await page.evaluate(v=>go(v),view);
  assert.deepEqual(errors,[]);console.log('PASS escritorio: operación sin mouse, multiplicador, edición inline, errores, peso/PLU, F8 seguro, guardado, impresión y PDF');

  const mobile=await browser.newPage({viewport:{width:390,height:844}});mobile.on('pageerror',error=>errors.push(error.message));
  await mobile.goto(process.env.BASE_URL||'http://127.0.0.1:5173');
  await mobile.evaluate(()=>{for(const p of state.products.filter(p=>!Core.weight(p)&&Core.available(state,p)>0).slice(0,12))changeCart(p.id);render();});
  const layout=await mobile.evaluate(()=>{const row=document.querySelector('.sale-line-selected'),name=row.querySelector('.product-link'),summary=document.querySelector('.sale-summary').getBoundingClientRect();return {width:document.documentElement.scrollWidth,summaryBottom:summary.bottom,navTop:document.querySelector('.bottom-nav').getBoundingClientRect().top,nameTop:name.getBoundingClientRect().top,nameBottom:name.getBoundingClientRect().bottom,summaryTop:summary.top,font:parseFloat(getComputedStyle(name).fontSize)};});
  assert.equal(layout.width,390);assert(layout.summaryBottom<=layout.navTop+1);assert(layout.nameBottom<=layout.summaryTop);assert(layout.nameTop>=0);assert(layout.font>=18);
  if(process.env.SCREENSHOT_DIR)await mobile.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'cashier-mobile.png'),fullPage:true});
  await mobile.locator('[data-action=checkout]').click();assert(await mobile.locator('#modal-submit').isVisible());
  assert.equal(await mobile.locator('#modal input,#modal select').count(),0);
  if(process.env.SCREENSHOT_DIR)await mobile.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'review-mobile.png'),fullPage:true});
  await mobile.keyboard.press('Escape');assert.equal(await mobile.evaluate(()=>cart.length),12);
  assert.deepEqual(errors,[]);console.log('PASS móvil: carrito largo, nombre seleccionado visible, texto grande, total y cierre accesibles, sin errores ni desbordamiento');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
