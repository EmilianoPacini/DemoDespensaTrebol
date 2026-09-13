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
