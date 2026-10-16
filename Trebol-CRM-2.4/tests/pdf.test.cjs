const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../core.js'),PDF=require('../purchase-pdf.js');
test('PDF: genera un archivo real con fuentes embebidas y lista sin importes',()=>{
 const s=C.upgrade(C.seed()),o=C.savePurchase(s,{supplier:'Distribuidora Ñandú',items:[{productId:'p1',qty:12}]});
 o.items[0].cost=876543.21;const bytes=PDF.build(o),raw=Buffer.from(bytes).toString('latin1');
 assert(raw.startsWith('%PDF-1.4'));assert(raw.includes('/FontFile2'));assert(raw.includes('PC-00001'));assert(!raw.includes('876543.21'));assert(raw.includes('(12 u.)'));
 const offset=Number(raw.match(/startxref\n(\d+)/)[1]);assert.equal(raw.slice(offset,offset+4),'xref');
});
test('PDF: lista larga crea páginas y no pierde el último producto',()=>{
 const o={number:9,at:new Date().toISOString(),supplier:'A',status:'pending',items:Array.from({length:50},(_,i)=>({nombre:'Producto '+i,codigo:'CODE'+i,qty:3}))};
 const raw=Buffer.from(PDF.build(o)).toString('latin1');assert(Number(raw.match(/\/Type \/Pages \/Count (\d+)/)[1])>1);assert(raw.includes('(Producto 49)'));assert(raw.includes('(150 unidades)'));
});
test('Ticket PDF: precios históricos, anulación, caracteres latinos y múltiples páginas',()=>{
 const sale={number:17,at:'2026-10-10T12:00:00Z',status:'cancelled',payment:'Efectivo',customer:'José',total:3000,items:Array.from({length:65},(_,i)=>({nombre:'Yerba con presentación larga número '+i,cant:2,precio:1500}))};
 const data=PDF.ticket(sale),text=Buffer.from(data).toString('latin1');
 assert(text.startsWith('%PDF-1.4'));assert(text.includes('VENTA ANULADA'));assert(text.includes('OV-00017'));
 assert(text.includes('64'));assert(text.includes('/MediaBox [0 0 300 720]'));
 assert(Number(text.match(/\/Type \/Pages \/Count (\d+)/)[1])>1);
 assert.throws(()=>PDF.ticket({...sale,items:[{nombre:'Producto 😀',cant:1,precio:10}]}),/no admite/);
});
