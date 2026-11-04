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

test('advisory monitoring must not imply autonomous production authority',()=>{
  const result=explain({...base,monitor:'advisory'});
  const monitor=result.applicable.find(s=>s.id==='monitor');
  assert.ok(monitor);
  assert.equal(monitor.authority,'Advisory');
  assert.ok(!result.authorities.includes('Production'));
  assert.doesNotMatch(monitor.concern,/unsafe remediation|cascading production/i);
});
test('autonomous remediation adds production privileges and containment evidence',()=>{
  const advisory=explain({...base,monitor:'advisory'}).applicable[0];
  const autonomous=explain({...base,monitor:'autonomous'}).applicable[0];
  assert.equal(autonomous.authority,'Production');
  assert.notEqual(autonomous.safeguard,advisory.safeguard);
  assert.match(autonomous.evidence,/privileges|permissions/i);
  assert.match(autonomous.safeguard,/bound|restrict|contain/i);
});
test('mandatory AI review gate receives incremental enforcement considerations',()=>{
  const advisory=explain({...base,review:'advisory'}).applicable[0];
  const gating=explain({...base,review:'gating'}).applicable[0];
  assert.notEqual(gating.authority,advisory.authority);
  assert.notEqual(gating.safeguard,advisory.safeguard);
  assert.match(gating.safeguard,/fail.closed|required|block/i);
  assert.match(gating.evidence,/bypass|check|ruleset/i);
});
test('advisory reviewer is not represented as required gate',()=>{
  const advisory=explain({...base,review:'advisory'}).applicable[0];
  assert.equal(advisory.authority,'Advisory');
  assert.doesNotMatch(advisory.safeguard,/required gate/i);
});

test('governance or criticality must not be silently converted into a low-risk authorization',()=>{
  const x=explain({...base,context:'critical',approve:'delegated'});
  assert.equal(x.context,'critical');
  assert.ok(x.applicable.some(s=>s.id==='approve'));
  assert.ok(!('riskScore' in x));
  assert.ok(!('authorized' in x));
});
test('all UI capability choices correspond to the operating-model definitions',()=>{
 const html=fs.readFileSync(path.join(root,'ai-sdlc-risk.html'),'utf8');
 for(const stage of stageDefinitions){
   const start=html.indexOf('name="'+stage.id+'"');
   assert.ok(start>=0,stage.id);
   const select=html.slice(start,html.indexOf('</select>',start));
   for(const [value] of stage.options)assert.ok(select.includes('value="'+value+'"'),stage.id+' / '+value);
 }
});

test('governance autonomy is separate from execution and exposes independent enforcement questions',()=>{
 const result=explain({...base,develop:'execution',governance:'self-authorize'});
 assert.ok(result.authorities.includes('Execution'));
 assert.ok(result.authorities.includes('Governance authorization'));
 const g=result.applicable.find(s=>s.id==='governance');
 assert.ok(g);
 assert.match(g.safeguard,/independently restrict|independent/i);
 assert.match(g.evidence,/administrative grants|permissions/i);
});
test('governance recommendations remain advisory, not autonomous administration',()=>{
 const x=explain({...base,governance:'advisory'});
 assert.deepEqual(x.applicable.map(s=>s.id),['governance']);
 assert.deepEqual(x.authorities,['Advisory']);
 assert.match(x.applicable[0].safeguard,/human/i);
});
test('criticality introduces contextual challenge questions without changing to a risk score',()=>{
 const unassessed=explain({...base,approve:'delegated'});
 const critical=explain({...base,approve:'delegated',context:'critical'});
 const routine=explain({...base,approve:'delegated',context:'routine'});
 assert.deepEqual(critical.applicable.map(s=>s.id),unassessed.applicable.map(s=>s.id));
 assert.ok(critical.questions.length>unassessed.questions.length);
 assert.match(critical.questions.join(' '),/dependency|critical/i);
 assert.match(routine.questions.join(' '),/reclassification/i);
 assert.ok(!('riskScore' in critical));
 assert.ok(!('authorized' in critical));
});
test('governance selector and contextual questions have matching HTML hooks',()=>{
 const html=fs.readFileSync(path.join(root,'ai-sdlc-risk.html'),'utf8');
 for(const value of ['unknown','none','advisory','execute','self-authorize'])assert.match(html,new RegExp('<option value="'+value+'">'));
 assert.match(html,/name="governance"/);
 assert.match(html,/id="operating-model-questions"/);
});

test('unspecified governance status stays unknown and receives a verification question',()=>{
 const result=explain({...base,review:'gating'});
 assert.equal(result.governance,'unknown');
 assert.ok(result.questions.some(q=>/governance rules|enforcement settings/i.test(q)));
 assert.ok(!result.authorities.includes('Governance'));
});

test('authorized governance execution differs from AI self-authorization',()=>{
 const executed=explain({...base,governance:'execute'});
 const self=explain({...base,governance:'self-authorize'});
 assert.deepEqual(executed.authorities,['Governance execution']);
 assert.deepEqual(self.authorities,['Governance authorization']);
 assert.match(executed.applicable[0].safeguard,/independently approved/i);
 assert.match(self.applicable[0].concern,/without an independent gate/i);
});
test('developer execution with declared no-governance access prompts effective policy boundary verification',()=>{
 const x=explain({...base,develop:'execution',governance:'none'});
 assert.deepEqual(x.applicable.map(s=>s.id),['develop']);
 assert.ok(!x.authorities.some(a=>a.includes('Governance')));
 assert.match(x.questions.join(' '),/CI workflows|policy-as-code/i);
});
test('advisory-only review of a critical system does not imply AI approval or production authority',()=>{
 const x=explain({...base,context:'critical',review:'advisory',governance:'none'});
 assert.deepEqual(x.applicable.map(s=>s.id),['review']);
 assert.ok(!x.questions.some(q=>/required approval\/check status|release\/remediation privileges/i.test(q)));
 assert.ok(x.questions.some(q=>/criticality classification/i.test(q)));
});
test('critical-system questions follow the selected delegated authority',()=>{
 const authorization=explain({...base,context:'critical',approve:'delegated',governance:'none'});
 const production=explain({...base,context:'critical',deploy:'ai',governance:'none'});
 assert.match(authorization.questions.join(' '),/approval\/check status/i);
 assert.doesNotMatch(authorization.questions.join(' '),/release\/remediation privileges/i);
 assert.match(production.questions.join(' '),/release\/remediation privileges/i);
 assert.doesNotMatch(production.questions.join(' '),/approval\/check status/i);
});
