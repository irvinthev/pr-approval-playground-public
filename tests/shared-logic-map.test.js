const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const C=require('../case-model');
const F=require('../financial-engine');
const Story=require('../story-model');
const Decision=require('../decision-engine');
const Rules=require('../rule-engine');
const Guide=require('../case-guide');
const X=require('../control-crosswalk');

const read=p=>fs.readFileSync(p,'utf8');

test('connected journey, monitoring and assurance load the same evaluator in correct order',()=>{
 for(const page of ['experience.html','continuous-monitoring.html','independent-assurance.html']){
  const src=read(page),deps=['financial-engine.js','case-model.js','case-ui.js'];
  const offsets=deps.map(d=>src.indexOf('src="./'+d));
  assert.ok(offsets.every(i=>i>=0),page+' missing connected case component');
  assert.ok(offsets[0]<offsets[1]&&offsets[1]<offsets[2],page+' must load financial helper before case evaluator and UI');
  assert.match(src,/id="shared-case-root"/,page);
 }
});
test('guide explains supplied connected evaluation without mutating state or authorizing anything',()=>{
 const caseRecord=C.replay(['CHECKS','APPROVE']);
 const beforeCase=JSON.stringify(caseRecord),evaluation=C.evaluateCase(caseRecord),beforeEvaluation=JSON.stringify(evaluation);
 for(let i=0;i<7;i++){const guidance=Guide.explain(evaluation,i);assert.ok(guidance.question);assert.ok(guidance.why);}
 assert.equal(JSON.stringify(caseRecord),beforeCase);
 assert.equal(JSON.stringify(evaluation),beforeEvaluation);
 assert.equal(C.evaluateCase(caseRecord).authorizationStatus,'VALID');
});
test('revision and mapping change are shared-case decisions, not rewritable display labels',()=>{
 const authorized=C.replay(['CHECKS','APPROVE']);
 for(const event of ['PUSH','MAP_CHANGE','POLICY_CHANGE']){
  const revised=C.transition(authorized,event);
  assert.equal(C.evaluateCase(revised).authorizationStatus,'STALE',event);
  assert.equal(C.evaluateCase(revised).policyStatus,'FAIL',event);
  assert.equal(C.evaluateCase(authorized).authorizationStatus,'VALID');
 }
});
test('other exported engines remain distinct public interfaces, not aliases of connected evaluator',()=>{
 assert.equal(typeof F.assessFinancialImpact,'function');
 assert.equal(typeof F.resolveAuthorization,'function');
 assert.equal(typeof Story.evaluate,'function');
 assert.equal(typeof Decision.evaluate,'function');
 assert.equal(typeof Rules.evaluateApproval,'function');
 assert.notStrictEqual(C.evaluateCase,Story.evaluate);
 assert.notStrictEqual(C.evaluateCase,Decision.evaluate);
 assert.notStrictEqual(C.evaluateCase,Rules.evaluateApproval);
});
test('control inventory and its test/evidence vocabulary retain namespaces and source distinction',()=>{
 assert.equal(X.objectives.length,14);
 assert.equal(X.webSafeguards.length,15);
 assert.equal(X.workbookControls.length,16);
 assert.equal(X.webSafeguards.find(x=>x.id==='WEB15:AI-03').title,'Approval Authority & SoD');
 assert.equal(X.workbookControls.find(x=>x.id==='WB16:AI-03').title,'AI evaluation');
 const doc=read('docs/SHARED-LOGIC-AND-TERMINOLOGY.md');
 for(const label of ['Control objective','Proposed web safeguard','Workbook control','Test','Evidence','Crosswalk relationship','not established algorithmic equivalence']){
  assert.ok(doc.toLowerCase().includes(label.toLowerCase()),'Missing term: '+label);
 }
});
test('DP-11 is linked for humans and does not add any new approval behavior',()=>{
 const readme=read('README.md'),doc=read('docs/SHARED-LOGIC-AND-TERMINOLOGY.md');
 assert.match(readme,/docs\/SHARED-LOGIC-AND-TERMINOLOGY\.md/);
 assert.match(doc,/SharedCase\.evaluateCase/);
 assert.match(doc,/not a refactor/i);
 assert.match(doc,/no removal in DP-11/i);
});
