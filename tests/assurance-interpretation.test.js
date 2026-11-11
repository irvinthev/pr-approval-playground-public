const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const W=require('../worked-examples'),I=require('../assurance-interpretation');
const root=path.join(__dirname,'..');
test('all four fictional examples and their conditions have bounded three-part assurance interpretation',()=>{
 for(const [id,definition] of Object.entries(W.definitions)){
  for(const condition of Object.keys(definition.conditions)){
   const x=I.interpret(id,condition);
   for(const key of ['ai','enforcement','reliance','evidence'])assert.ok(x[key].length>35,id+' / '+condition+' / '+key);
   assert.match(x.reliance,/Not established/);
   assert.equal(x.fictional,true);
   assert.ok(x.controls.length>0);
   for(const control of x.controls)assert.ok(definition.controls.includes(control)||id==='standard'&&['AI-01','AI-03','AI-15'].includes(control),id+' '+control);
  }
 }
});
test('assurance interpretation preserves the key separation between AI failure and enforcement',()=>{
 const safe=I.interpret('dependency','baseline'),unsafe=I.interpret('dependency','omitted');
 assert.match(safe.ai,/low risk/);
 assert.match(safe.enforcement,/routes to human/);
 assert.match(unsafe.enforcement,/unsafe eligibility/);
 assert.match(unsafe.reliance,/Not established/);
 const stale=I.interpret('standard','stale');
 assert.match(stale.enforcement,/adapter/);
 assert.match(I.interpret('population','baseline').reliance,/matching sample/i);
 assert.throws(()=>I.interpret('__proto__','baseline'));
 assert.throws(()=>I.interpret('standard','constructor'));
});
test('viewer loads interpretation before UI and retains existing evaluator and controls',()=>{
 const html=fs.readFileSync(path.join(root,'auditor-view.html'),'utf8');
 const ui=fs.readFileSync(path.join(root,'worked-examples-ui.js'),'utf8');
 assert.ok(html.indexOf('assurance-interpretation.js')<html.indexOf('worked-examples-ui.js'));
 for(const key of ['AI assessment','Independent enforcement','Assurance conclusion','Evidence to inspect','Relevant RCM objectives'])assert.ok(ui.includes(key),key);
 assert.ok(ui.includes('W.evaluate(id,condition)'));
 assert.ok(ui.includes('./rcm-view.html#control-'));
});
