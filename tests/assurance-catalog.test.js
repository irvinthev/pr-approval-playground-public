'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function read(name){return fs.readFileSync(path.join(root,name),'utf8')}
function catalog(){const context={window:{}};vm.runInNewContext(read('assurance-catalog.js'),context);return context.window.AssuranceCatalog}
test('replacement catalog has unique scoped IDs, exactly seven domains and complete evidence contracts',()=>{
 const {controls,methods}=catalog();
 assert.equal(controls.length,10);
 assert.equal(new Set(controls.map(c=>c.id)).size,controls.length);
 assert.equal(new Set(controls.map(c=>c.domain)).size,7);
 assert.equal(methods.length,3);
 for(const c of controls){
  assert.match(c.id,/^AC-\d\d$/);
  for(const k of ['name','domain','objective','transition','invariant','enforcement','evidence','test','method','trigger','sources','status'])
   assert.ok(typeof c[k]==='string'&&c[k].trim(),c.id+' missing '+k);
  assert.equal(c.status,'Proposed');
  assert.doesNotMatch(c.sources,/certified|compliant|validated by/i);
 }
});
test('only supported demonstrations are linked and limitations are explicit',()=>{
 const {controls}=catalog(),page=read('rcm-view.html');
 for(const c of controls){
  if(c.demoUrl){assert.ok(c.demoLabel&&c.demoLimit,c.id+' missing demo qualification');assert.match(c.demoUrl,/^\.\/(experience|auditor-view|continuous-monitoring)\.html/)}
 }
 assert.match(page,/No directly connected demonstration yet/);
 assert.match(page,/does not yet implement bitemporal retrospective impact|not ten implemented controls/);
});
test('catalog, Assurance landing and RCM distinguish proposed guidance from SOX and operating evidence',()=>{
 const landing=read('independent-assurance.html'),rcm=read('rcm-view.html');
 assert.match(landing,/not a compliance certification/i);
 assert.match(rcm,/verified SOX criteria/i);
 assert.match(rcm,/source references are thematic/i);
 assert.match(landing,/not operating evidence/i);
});
test('current case logic is not overwritten by framework or view code',()=>{
 const landing=read('independent-assurance.html'),rcm=read('rcm-view.html');
 assert.match(landing,/src="\.\/financial-engine\.js[^"]*"/);
 assert.match(landing,/src="\.\/case-model\.js[^"]*"/);
 assert.match(landing,/src="\.\/case-ui\.js[^"]*"/);
 assert.doesNotMatch(rcm,/function evaluateCase|function approve|function deploy/);
});
