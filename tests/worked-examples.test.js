const test=require('node:test'),assert=require('node:assert/strict'),W=require('../worked-examples'),fs=require('node:fs'),path=require('node:path');
test('standard route cannot reuse stale reviews or waive failed CI',()=>{
 assert.equal(W.evaluate('standard').record.authorization.allowed,true);
 for(const condition of ['stale','failed'])assert.equal(W.evaluate('standard',condition).record.authorization.allowed,false);
});
test('a silently omitted financial dependency exposes unsafe eligibility rather than inventing a detector',()=>{
 assert.equal(W.evaluate('dependency').record.policy_authorization.allowed,false);
 assert.equal(W.evaluate('dependency','omitted').record.evaluation.unsafe_automatic_eligibility,true);
 assert.equal(W.evaluate('dependency','incomplete').record.policy_authorization.allowed,false);
});
test('policy example distinguishes simulated denial from incompatible runtime authority',()=>{
 assert.equal(W.evaluate('policy').record.attempt.allowed,false);
 assert.equal(W.evaluate('policy','weakened').record.attempt.allowed,true);
});
test('matched samples cannot establish population completeness; missing records are exposed',()=>{
 for(const c of ['baseline','missing','unverified'])assert.equal(W.evaluate('population',c).record.populationConclusion,'UNRESOLVED');
 assert.deepEqual(W.evaluate('population','missing').record.comparison.missing,['demo-independent-release-02']);
});
test('all cases preserve unassessed implementation and release, and reject untrusted selectors',()=>{
 for(const [id,d]of Object.entries(W.definitions))for(const c of Object.keys(d.conditions)){
  const x=W.evaluate(id,c);assert.equal(x.implementationStatus,'Not assessed');assert.equal(x.releaseStatus,'Not evaluated');assert.ok(x.controls.length);assert.equal(x.tests.length,3);
 }
 for(const id of ['__proto__','constructor','<img>'])assert.throws(()=>W.evaluate(id));
 assert.throws(()=>W.evaluate('standard','constructor'));
});
test('viewer and Assurance expose the examples and related RCM controls have destinations',()=>{
 const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
 assert.match(read('auditor-view.html'),/id="worked-examples"/);
 assert.match(read('independent-assurance.html'),/example=standard#worked-examples/);
 for(const d of Object.values(W.definitions))for(const id of d.controls)assert.ok(read('rcm-view.html').includes('"id":"'+id+'"'));
 assert.match(read('rcm-view.html'),/AI-12':'population'/);
});

test('revision-binding guard is explicitly scenario-adapter behavior, not an asserted shared-engine guarantee',()=>{
 const src=fs.readFileSync(path.join(__dirname,'..','worked-examples.js'),'utf8');
 assert.match(src,/Example-adapter guard only/);
 assert.equal(W.evaluate('standard','stale').record.revisionGuardSource,'worked-example adapter; not the shared eligibility evaluator');
});
test('one primary workpaper and optional legacy deep dives retain distinct links',()=>{
 const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
 const html=read('auditor-view.html'),ui=read('worked-examples-ui.js');
 assert.match(html,/id="dependency-deep-dive"/);
 assert.match(html,/id="fixed-pipeline-deep-dive"/);
 assert.match(ui,/Engineering observation/);
 assert.match(ui,/Expected control behavior/);
 assert.match(ui,/Observed simulation result/);
 assert.match(ui,/Remaining independent verification/);
 assert.match(ui,/Permissible conclusion/);
 assert.match(ui,/Supporting safeguards & dependencies/);
 assert.match(ui,/standard:'AI-07'/);
});
