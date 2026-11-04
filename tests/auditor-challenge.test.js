'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const lab=require('../auditor-challenge');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
test('Known billing dependency requires qualified human review despite two low AI verdicts',()=>{
 const x=lab.evaluate('known');
 assert.equal(x.referenceImpact.status,'REVIEW_REQUIRED');
 assert.equal(x.mappedImpact.status,'REVIEW_REQUIRED');
 assert.equal(x.authorization.route,'HUMAN_REVIEW_REQUIRED');
 assert.equal(x.automaticEligible,false);assert.equal(x.unsafe,false);
 assert.equal(x.outcome,'HUMAN_REVIEW_REQUIRED');
});
test('Undetected omission demonstrates an unsafe auto-approval candidate',()=>{
 const x=lab.evaluate('omitted');
 assert.equal(x.referenceImpact.status,'REVIEW_REQUIRED');
 assert.equal(x.mappedImpact.status,'ELIGIBLE');
 assert.equal(x.technical.eligible,true);
 assert.equal(x.authorization.route,'AUTOMATION_ELIGIBLE');
 assert.equal(x.automaticEligible,true);assert.equal(x.unsafe,true);
 assert.equal(x.outcome,'UNSAFE_AUTOMATIC_ELIGIBILITY');
 assert.equal(x.event.production_deployment,'NOT_EVALUATED');
 assert.equal(x.corroboration[0].status,'CONTRADICTED');
});
test('Detected mapping omission fails closed',()=>{
 const x=lab.evaluate('incomplete');
 assert.equal(x.mappedImpact.status,'UNRESOLVED');
 assert.equal(x.automaticEligible,false);assert.equal(x.unsafe,false);
 assert.equal(x.outcome,'UNKNOWN_IMPACT_BLOCK');
});
test('Split AI decisions do not become automated approval',()=>{
 const x=lab.evaluate('split');
 assert.equal(x.mappedImpact.status,'REVIEW_REQUIRED');
 assert.equal(x.technical.eligible,false);
 assert.equal(x.automaticEligible,false);
 assert.equal(x.outcome,'REVIEWER_DISAGREEMENT_BLOCK');
 assert.equal(x.event.reviewers.reviewer_b,'HIGH_RISK');
});
test('Example configuration, fake JSON and assurance are derived from the selected case',()=>{
 for(const key of lab.keys){
  const result=lab.evaluate(key);
  assert.deepEqual(JSON.parse(result.code.event),result.event);
  assert.ok(result.code.mapping.includes(result.event.mapping_version));
  assert.ok(result.code.policy.includes(result.event.policy_version));
  for(const id of result.controls)assert.match(id,/^AI-\d{2}$/);
  assert.ok(result.unanswered.length>0);
  assert.equal(result.event.record_type,'FICTIONAL_MODEL_EVALUATION');
 }
 assert.throws(()=>lab.evaluate('__proto__'),/Unknown fictional challenge/);
});
test('Auditor View has a separate model-based case without replacing four presets',()=>{
 const html=read('auditor-view.html');
 for(const token of ['id="billing-challenge-lab"','id="billing-challenge-presets"','id="billing-challenge-tabs"','id="billing-evidence-body"','src="./financial-engine.js','src="./auditor-challenge.js','src="./auditor-challenge-ui.js'])assert.ok(html.includes(token),token);
 for(const id of ['pass','split','scope','canary'])assert.ok(html.includes('data-scenario="'+id+'"'));
 assert.match(html,/Illustrative Control Mapping/);
 assert.doesNotMatch(html,/COSO Control Reference ID/);
 assert.doesNotMatch(html,/Braze|Appboy|braze\.com/i);
 assert.match(html,/id="control-id"/);
 assert.match(html,/id="json-log"/);
});
test('New lab scripts parse',()=>{
 for(const name of ['auditor-challenge.js','auditor-challenge-ui.js'])new vm.Script(read(name),{filename:name});
});
