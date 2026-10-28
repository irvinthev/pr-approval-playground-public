const test=require('node:test');const assert=require('node:assert/strict');const D=require('../decision-engine.js');
test('documentation is conditionally eligible, not deployed',()=>{const x=D.evaluate({scenario:'docs'});assert.equal(x.authorization,'AUTOMATION_ELIGIBLE');assert.equal(x.deployment,'NOT_DEPLOYED');});
test('shared dependency requires human authorization despite green AI',()=>{const x=D.evaluate({scenario:'shared'});assert.equal(x.classification,'LOW_RISK');assert.equal(x.authorization,'HUMAN_REVIEW_REQUIRED');assert.equal(x.merge,'BLOCKED');});
test('policy self-change cannot enter automatic route',()=>{const x=D.evaluate({scenario:'policy'});assert.equal(x.authorization,'HUMAN_REVIEW_REQUIRED');assert.equal(x.merge,'BLOCKED');});
test('post approval commit invalidates revision-bound decision',()=>{const x=D.evaluate({scenario:'newCommit',sha:'b',reviewedSha:'a'});assert.equal(x.authorization,'INVALIDATED');assert.equal(x.merge,'BLOCKED');});
test('matching revision does not imply deployment',()=>{const x=D.evaluate({scenario:'newCommit',sha:'a',reviewedSha:'a'});assert.equal(x.deployment,'NOT_DEPLOYED');});
test('independent deployment gate prevents bypass',()=>{const x=D.evaluate({scenario:'bypass',deploymentEnforced:true});assert.equal(x.deployment,'PREVENTED');});
test('unenforced bypass is unauthorized even if detectable',()=>{const x=D.evaluate({scenario:'bypass',deploymentEnforced:false});assert.equal(x.deployment,'UNAUTHORIZED_DEPLOYMENT');assert.equal(x.authorization,'NOT_AUTHORIZED');});
test('every result has stage-linked evidence',()=>{for(const scenario of Object.keys(D.definitions)){const x=D.evaluate({scenario});assert.deepEqual(x.evidence.map(e=>e.stage),['intake','eligibility','review','authorization','merge','production']);}});
