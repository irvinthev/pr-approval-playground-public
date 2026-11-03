const test = require('node:test');
const assert = require('node:assert/strict');
const Pipeline = require('../product-pipeline');
const Case = require('../case-model');
const Financial = require('../financial-engine');

test('canonical stages are stable, ordered and unique', () => {
  assert.equal(Pipeline.stages.length,8);
  assert.deepEqual(Pipeline.stages.map(x=>x.id),[
    'pr','eligibility','ci','ai','authorization','merge','release','monitor'
  ]);
  assert.equal(new Set(Pipeline.stages.map(x=>x.id)).size,8);
  assert.ok(Pipeline.stages.every(x=>x.description && x.label && x.phase));
  assert.deepEqual(Pipeline.stages.map(x=>x.engineeringStage),[1,2,2,3,4,5,6,7]);
});

test('scenario catalogue defines four distinct product outcomes, not independent approvals', () => {
  assert.deepEqual(Pipeline.scenarios.map(x=>x.id),['pass','split','excluded','canary']);
  assert.equal(new Set(Pipeline.scenarios.map(x=>x.id)).size,4);
  assert.match(Pipeline.routes.BLOCKED,/does not waive/);
  assert.match(Pipeline.routes.HUMAN_REVIEW_REQUIRED,/human code review/);
});

const fixture = actions=>Case.evaluateCase(Case.replay(actions));

test('protected shared-library impact is established before AI verdicts',()=>{
  const v=fixture([]);
  assert.equal(v.dependencyAssessment.status,'REVIEW_REQUIRED');
  assert.equal(v.dependencyAssessment.requiredRole,'financial-reviewer');
  assert.ok(v.dependencyAssessment.components.includes('billing'));
  assert.equal(v.authorizationStatus,'REQUIRED');
});

test('two successful reviewers do not independently authorize a protected change',()=>{
  const v=fixture(['CHECKS']);
  assert.equal(v.technical.eligible,true);
  assert.equal(v.policyStatus,'PENDING');
  assert.equal(v.authorizationStatus,'REQUIRED');
  assert.deepEqual(v.nextValidActions,['APPROVE']);
});

test('qualified human authorization remains separate from release eligibility',()=>{
  const v=fixture(['CHECKS','APPROVE']);
  assert.equal(v.authorizationStatus,'VALID');
  assert.equal(v.policyStatus,'PASS');
  assert.equal(v.releaseEligibility,'PENDING');
});

test('required release validation and artifact identity follow authorization',()=>{
  const v=fixture(['CHECKS','APPROVE','BUILD','RELEASE_CHECKS']);
  assert.equal(v.authorizationStatus,'VALID');
  assert.equal(v.releaseEligibility,'ELIGIBLE');
  assert.deepEqual(v.nextValidActions,['DEPLOY']);
});

test('post-approval revision invalidates prior authorization',()=>{
  const v=fixture(['CHECKS','APPROVE','PUSH']);
  assert.equal(v.authorizationStatus,'STALE');
  assert.equal(v.policyStatus,'FAIL');
  assert.equal(v.releaseEligibility,'BLOCKED');
  assert.ok(v.monitoringFindings.some(x=>x.id==='stale-approval'));
});

test('policy version change invalidates authorization',()=>{
  const v=fixture(['CHECKS','APPROVE','POLICY_CHANGE']);
  assert.equal(v.authorizationStatus,'STALE');
  assert.equal(v.releaseEligibility,'BLOCKED');
});

test('mapping changes require fresh authorization and do not erase the old record',()=>{
  const c=Case.replay(['CHECKS','APPROVE','MAP_CHANGE']);
  const v=Case.evaluateCase(c);
  assert.equal(c.authorizations.length,1);
  assert.equal(v.authorizationStatus,'STALE');
});

test('unknown dependency mapping is not automatically eligible',()=>{
  const v=fixture(['CHECKS','MAP_MISSING']);
  assert.equal(v.dependencyAssessment.status,'UNRESOLVED');
  assert.equal(v.policyStatus,'UNKNOWN');
  assert.notEqual(v.releaseEligibility,'ELIGIBLE');
});

test('risk acceptance never substitutes for mandatory authorization or mapping evidence',()=>{
  const v=fixture(['CHECKS','MAP_MISSING','ACCEPT_RISK']);
  assert.equal(v.riskAcceptance,'RECORDED_NOT_AUTHORIZATION');
  assert.notEqual(v.policyStatus,'PASS');
});

test('a simulated uncovered manual deployment is an evidence gap, not proof of unauthorized change',()=>{
  const v=fixture(['CHECKS','APPROVE','BUILD','RELEASE_CHECKS','DEPLOY','UNCOVERED_ROUTE']);
  assert.ok(v.monitoringFindings.some(x=>x.id==='uncovered-route'));
  assert.ok(v.monitoringFindings.some(x=>x.id==='approval-link'));
  assert.notEqual(v.evidenceCompleteness,'COMPLETE_IN_MODELED_SCOPE');
});

test('documentation example is automation eligible, not a protected financial review',()=>{
  const c=Financial.makeChange('docs');
  const v=Financial.assessFinancialImpact(c);
  const a=Financial.resolveAuthorization(Financial.assessTechnicalEligibility(c),v,c);
  assert.equal(v.status,'ELIGIBLE');
  assert.equal(a.route,'AUTOMATION_ELIGIBLE');
});

test('current financial engine treats conflicting reviewers as technical BLOCKED; route split requires contract refactor',()=>{
  const c=Financial.makeChange('docs',{reviewB:'high'});
  const v=Financial.resolveAuthorization(
    Financial.assessTechnicalEligibility(c),Financial.assessFinancialImpact(c),c
  );
  // Observed behavior, intentionally documented as a product gap, not an endorsement.
  assert.equal(v.route,'BLOCKED');
});

test('evaluating a case cannot mutate its evidence or depend on UI role',()=>{
  const c=Case.replay(['CHECKS','APPROVE']);
  const before=JSON.stringify(c);
  const a=Case.evaluateCase(c),b=Case.evaluateCase({...c,events:[...c.events]});
  assert.equal(JSON.stringify(c),before);
  assert.deepEqual(a,b);
});

test('case URL actions can be replayed into identical evaluated state',()=>{
  const c=Case.replay(['CHECKS','APPROVE','PUSH','CHECKS','APPROVE']);
  const restored=Case.decode(Case.encode(c));
  assert.deepEqual(Case.evaluateCase(restored),Case.evaluateCase(c));
});

test('Overview reads stage metadata from canonical contract',()=>{
  const fs=require('node:fs');
  const path=require('node:path');
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  assert.match(html,/product-pipeline\\.js\\?v=foundation-1/);
  assert.match(html,/pipelineContract\\.stages\\[i\\]/);
  assert.match(html,/node\\.dataset\\.pipelineStage = stage\\.id/);
});
