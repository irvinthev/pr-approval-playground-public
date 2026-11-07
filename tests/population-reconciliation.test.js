const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const P=require('../population-reconciliation');
const C=require('../case-model');
const deployed=()=>C.replay(['CHECKS','APPROVE','BUILD','RELEASE_CHECKS','DEPLOY']);

test('matching records do not imply complete production population',()=>{
 const r=P.simulate(deployed(),'matched');
 assert.equal(r.comparisonStatus,'MATCHED_SAMPLE');
 assert.equal(r.populationConclusion,'UNRESOLVED');
 assert.match(r.limitation,/cannot verify a complete/i);
});
test('missing independent deployment is not declared unauthorized',()=>{
 const r=P.simulate(deployed(),'missing');
 assert.equal(r.comparisonStatus,'MISSING_FEED');
 assert.equal(r.comparison.missing[0],'demo-independent-release-02');
 assert.equal(r.populationConclusion,'UNRESOLVED');
 assert.match(r.action,/investigate/i);
});
test('unmatched feed event, duplicate record and known artifact mismatch are distinct',()=>{
 for(const [scenario,status,key] of [['extra','UNMATCHED_FEED','unmatched'],['duplicate','DUPLICATE','duplicates'],['mismatch','MISMATCH','mismatches']]){
  const r=P.simulate(deployed(),scenario);
  assert.equal(r.comparisonStatus,status);
  assert.equal(r.comparison[key].length,1);
  assert.equal(r.populationConclusion,'UNRESOLVED');
 }
});
test('source population unverified is not a clean comparison',()=>{
 const r=P.simulate(deployed(),'unverified');
 assert.equal(r.comparison,null);
 assert.equal(r.comparisonStatus,'NOT_ASSESSED');
 assert.equal(r.populationConclusion,'UNRESOLVED');
});
test('reconciliation is pure and does not grant authorization or change case history',()=>{
 const c=deployed(),before=JSON.stringify(c),beforeEvaluation=JSON.stringify(C.evaluateCase(c));
 for(const id of Object.keys(P.SCENARIOS))P.simulate(c,id);
 assert.equal(JSON.stringify(c),before);
 assert.equal(JSON.stringify(C.evaluateCase(c)),beforeEvaluation);
});
test('input validation rejects malformed populations and empty record identity',()=>{
 assert.throws(()=>P.compare(null,[]),TypeError);
 assert.throws(()=>P.compare([{id:'',digest:'valid'}],[]),TypeError);
 assert.throws(()=>P.simulate(C.initial(),'unknown-scenario'),TypeError);
});
test('Monitoring loads helper before UI and does not change connected evaluator imports elsewhere',()=>{
 const html=fs.readFileSync('continuous-monitoring.html','utf8'),ui=fs.readFileSync('case-ui.js','utf8');
 assert.ok(html.indexOf('population-reconciliation.js?v=dp08-1')>=0);
 assert.ok(html.indexOf('population-reconciliation.js?v=dp08-1')<html.indexOf('case-ui.js?v=case-ux-1'));
 assert.match(ui,/window\.PopulationDemo\.simulate\(current,select\.value\)/);
 for(const file of ['experience.html','independent-assurance.html']){
  assert.ok(!fs.readFileSync(file,'utf8').includes('population-reconciliation.js'));
 }
});
