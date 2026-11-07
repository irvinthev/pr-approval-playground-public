const test=require('node:test'),assert=require('node:assert/strict'),C=require('../case-model');
const ready=()=>C.replay(['CHECKS','APPROVE','BUILD','RELEASE_CHECKS']);
const deployed=()=>C.transition(ready(),'DEPLOY');
const copy=x=>JSON.parse(JSON.stringify(x));
test('wrong release candidate blocks deployment without changing valid authorization history',()=>{
 const c=ready(),before=copy(c.authorizations),n=C.transition(c,'SUBSTITUTE_ARTIFACT'),e=C.evaluateCase(n);
 assert.equal(e.authorizationStatus,'VALID');assert.equal(e.policyStatus,'PASS');assert.equal(e.releaseEligibility,'BLOCKED');assert.equal(e.artifactIntegrity,'FAIL');assert.deepEqual(n.authorizations,before);assert.throws(()=>C.transition(n,'DEPLOY'));assert.deepEqual(e.nextValidActions,['RESTORE_ARTIFACT']);
 const restored=C.transition(n,'RESTORE_ARTIFACT');assert.equal(C.evaluateCase(restored).releaseEligibility,'PENDING');assert.equal(C.evaluateCase(C.transition(restored,'RELEASE_CHECKS')).releaseEligibility,'ELIGIBLE');
});
test('failed canary halts promotion and requires a distinct human response',()=>{
 const c=deployed(),history=copy(c.authorizations),n=C.transition(c,'CANARY_FAIL'),e=C.evaluateCase(n);
 assert.equal(e.authorizationStatus,'VALID');assert.equal(e.releaseEligibility,'ELIGIBLE');assert.equal(e.rolloutStatus,'HALTED_HUMAN_REQUIRED');assert.equal(e.promotionEligibility,'BLOCKED');assert.equal(e.humanResponse,'REQUIRED');assert.deepEqual(n.authorizations,history);assert.deepEqual(e.nextValidActions,['HUMAN_CONTAIN']);
 assert.throws(()=>C.transition(n,'CANARY_PASS'));assert.throws(()=>C.transition(n,'DEPLOY'));
 const accepted=C.transition(n,'ACCEPT_RISK');assert.equal(C.evaluateCase(accepted).promotionEligibility,'BLOCKED');assert.equal(C.evaluateCase(accepted).humanResponse,'REQUIRED');
 const contained=C.transition(n,'HUMAN_CONTAIN'),x=C.evaluateCase(contained);assert.equal(x.rolloutStatus,'CONTAINMENT_RECORDED');assert.equal(x.humanResponse,'RECORDED');assert.equal(x.promotionEligibility,'BLOCKED');assert.deepEqual(contained.authorizations,history);assert.throws(()=>C.transition(contained,'CANARY_PASS'));
});
test('healthy canary permits modeled promotion only for the linked deployment',()=>{
 const c=C.transition(deployed(),'CANARY_PASS'),e=C.evaluateCase(c);assert.equal(e.rolloutStatus,'CANARY_PASSED');assert.equal(e.promotionEligibility,'ELIGIBLE');assert.equal(e.humanResponse,'NOT_REQUIRED');
 c.rollouts[0].digest='other';assert.equal(C.evaluateCase(c).promotionEligibility,'BLOCKED');
});
test('lost deployment linkage stays unresolved even after population corroboration',()=>{
 const c=C.transition(C.transition(deployed(),'CORROBORATE'),'LOSE_DEPLOYMENT_LINK'),e=C.evaluateCase(c);
 assert.equal(e.authorizationStatus,'VALID');assert.equal(e.deploymentIntegrity,'UNKNOWN');assert.equal(e.evidenceCompleteness,'INCOMPLETE');assert.ok(e.monitoringFindings.some(x=>x.id==='approval-link'&&x.status==='UNRESOLVED'));assert.ok(!e.monitoringFindings.some(x=>x.id==='deployment-mismatch'));assert.equal(e.promotionEligibility,'BLOCKED');assert.equal(e.rolloutStatus,'EVIDENCE_UNRESOLVED');
});
test('deployment integrity uses retained historical builds rather than a later revision',()=>{
 const c=deployed();let n=C.transition(c,'PUSH');n=C.transition(n,'CHECKS');n=C.transition(n,'APPROVE');n=C.transition(n,'BUILD');
 assert.equal(C.evaluateCase(n).deploymentIntegrity,'PASS');assert.equal(n.builds.length,2);
 const bad=copy(n);bad.deployments[0].digest='known-wrong';assert.equal(C.evaluateCase(bad).deploymentIntegrity,'FAIL');assert.ok(C.evaluateCase(bad).monitoringFindings.some(x=>x.id==='deployment-artifact'&&x.status==='EXCEPTION'));
 const missing=copy(n);delete missing.deployments[0].digest;assert.equal(C.evaluateCase(missing).deploymentIntegrity,'UNKNOWN');
});
test('incorrect human response identity or deployment binding cannot clear canary failure',()=>{
 const c=C.transition(C.transition(deployed(),'CANARY_FAIL'),'HUMAN_CONTAIN');for(const patch of [{actor:'demo-contributor'},{role:'developer'},{digest:'other'},{deploymentId:'other'},{rationale:''}]){const n=copy(c);Object.assign(n.rollouts[0].response,patch);const e=C.evaluateCase(n);assert.notEqual(e.humanResponse,'RECORDED');assert.equal(e.rolloutStatus,'HALTED_HUMAN_REQUIRED');assert.equal(e.promotionEligibility,'BLOCKED');}
});
test('new challenges reject impossible sequences and replay deterministically',()=>{
 for(const action of ['SUBSTITUTE_ARTIFACT','RESTORE_ARTIFACT','CANARY_FAIL','CANARY_PASS','HUMAN_CONTAIN','LOSE_DEPLOYMENT_LINK'])assert.throws(()=>C.transition(C.initial(),action),action);
 for(const actions of [['CHECKS','APPROVE','BUILD','RELEASE_CHECKS','SUBSTITUTE_ARTIFACT'],['CHECKS','APPROVE','BUILD','RELEASE_CHECKS','DEPLOY','CANARY_FAIL','HUMAN_CONTAIN'],['CHECKS','APPROVE','BUILD','RELEASE_CHECKS','DEPLOY','LOSE_DEPLOYMENT_LINK']]){const c=C.replay(actions),before=JSON.stringify(c);assert.deepEqual(C.decode(C.encode(c)),c);assert.deepEqual(C.evaluateCase(C.decode(C.encode(c))),C.evaluateCase(c));assert.equal(JSON.stringify(c),before);}
});
test('containment does not silently authorize a new rollout or restart',()=>{
 let c=C.replay(['CHECKS','APPROVE','BUILD','RELEASE_CHECKS','DEPLOY','CANARY_FAIL','HUMAN_CONTAIN','PUSH','CHECKS','APPROVE','BUILD','RELEASE_CHECKS']);
 assert.equal(C.evaluateCase(c).releaseEligibility,'ELIGIBLE');assert.equal(C.evaluateCase(c).promotionEligibility,'BLOCKED');assert.throws(()=>C.transition(c,'DEPLOY'));
});
test('canary observation remains bound to its deployment when a later PR revision exists',()=>{
 const c=C.transition(deployed(),'PUSH'),n=C.transition(c,'CANARY_FAIL'),e=C.evaluateCase(n);
 assert.equal(n.rollouts[0].revision,'case-revision-A');assert.equal(e.evaluatedRevision,'case-revision-B');assert.equal(e.humanResponse,'REQUIRED');assert.equal(e.promotionEligibility,'BLOCKED');
});
test('passing canary cannot repair missing authorization or deployment identity',()=>{
 const c=C.transition(deployed(),'LOSE_DEPLOYMENT_LINK'),n=C.transition(c,'CANARY_PASS'),e=C.evaluateCase(n);assert.equal(e.rolloutStatus,'EVIDENCE_UNRESOLVED');assert.equal(e.promotionEligibility,'BLOCKED');
 const missing=deployed();delete missing.deployments[0].recordId;assert.equal(C.evaluateCase(missing).deploymentIntegrity,'UNKNOWN');assert.equal(C.evaluateCase(missing).promotionEligibility,'BLOCKED');
});
test('case guidance explains failure response without changing evaluator conclusions',()=>{
 const G=require('../case-guide'),c=C.transition(deployed(),'CANARY_FAIL'),before=JSON.stringify(c),x=C.evaluateCase(c);
 assert.match(G.explain(x,6).why,/human containment/);assert.match(G.explain(x,6).facts,/HALTED_HUMAN_REQUIRED/);assert.equal(JSON.stringify(c),before);
});
