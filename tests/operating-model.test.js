'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const {stageDefinitions,explain}=require('../operating-model.js');
const base={develop:'human',review:'human',approve:'human',deploy:'deterministic',monitor:'conventional',context:'unassessed'};
test('non-AI baseline has no invented AI risk classification',()=>{
  const x=explain(base);
  assert.equal(x.applicable.length,0);
  assert.deepEqual(x.authorities,[]);
  assert.equal(x.context,'unassessed');
});
test('AI development and delegated approval remain distinct authority dimensions',()=>{
  const x=explain({...base,develop:'execution',approve:'delegated'});
  assert.deepEqual(x.applicable.map(s=>s.id),['develop','approve']);
  assert.ok(x.authorities.includes('Execution'));
  assert.ok(x.authorities.includes('Delegated decision'));
  assert.ok(!x.authorities.includes('Production'));
});
test('AI-directed deployment and remediation each receive production-related safeguards',()=>{
  const x=explain({...base,deploy:'ai',monitor:'autonomous'});
  assert.deepEqual(x.applicable.map(s=>s.id),['deploy','monitor']);
  assert.ok(x.applicable.every(s=>s.safeguard&&s.evidence&&s.concern));
  assert.ok(x.applicable.some(s=>s.rcm==='AI-11'));
  assert.ok(x.applicable.some(s=>s.rcm==='AI-13'));
});
test('advisory AI can be assessed without granting authorization',()=>{
  const x=explain({...base,review:'advisory'});
  assert.deepEqual(x.applicable.map(s=>s.id),['review']);
  assert.ok(!x.authorities.includes('Delegated decision'));
});
test('each mapped objective has a local control anchor; every stage offers meaningful options',()=>{
  const library=fs.readFileSync(path.join(root,'control-matrix.html'),'utf8');
  for(const stage of stageDefinitions){
    assert.ok(stage.options.length>=2,stage.id);
    assert.ok(library.includes('id="control-'+stage.control+'"'),stage.control);
    assert.ok(stage.evidence&&stage.safeguard&&stage.concern,stage.id);
  }
});
test('assessment page exposes accessible selections with bounded neutral disclaimers',()=>{
 const html=fs.readFileSync(path.join(root,'ai-sdlc-risk.html'),'utf8');
 for(const s of stageDefinitions)assert.match(html,new RegExp('name="'+s.id+'"'),s.id);
 assert.match(html,/id="operating-model-results"/);
 assert.match(html,/src="\.\/operating-model\.js"/);
 assert.match(html,/Not an authorization decision/);
 assert.doesNotMatch(html,/risk score:\s*[0-9]/i);
});
