// Regression tests for fictional deployment telemetry coverage.
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../case-model');

function deployed() {
  return C.replay(['CHECKS', 'APPROVE', 'BUILD', 'RELEASE_CHECKS', 'DEPLOY']);
}

test('healthy canary on a covered, observed standard route remains eligible', () => {
  const x = C.evaluateCase(C.transition(deployed(), 'CANARY_PASS'));
  assert.equal(x.deploymentIntegrity, 'PASS');
  assert.equal(x.rolloutStatus, 'CANARY_PASSED');
  assert.equal(x.promotionEligibility, 'ELIGIBLE');
});

test('healthy canary cannot clear missing deployment feed telemetry', () => {
  const c = C.transition(deployed(), 'CANARY_PASS');
  c.deployments[0].inFeed = false;
  const x = C.evaluateCase(c);
  assert.equal(x.deploymentIntegrity, 'UNKNOWN');
  assert.equal(x.rolloutStatus, 'EVIDENCE_UNRESOLVED');
  assert.equal(x.promotionEligibility, 'BLOCKED');
  assert.ok(x.monitoringFindings.some(f => f.id === 'uncovered-route' && f.status === 'EVIDENCE_GAP'));
  assert.ok(!x.monitoringFindings.some(f => f.status === 'EXCEPTION' && f.id === 'deployment-mismatch'));
});

test('healthy canary cannot clear missing route coverage', () => {
  const c = C.transition(deployed(), 'CANARY_PASS');
  c.evidence.coveredRoutes = [];
  const x = C.evaluateCase(c);
  assert.equal(x.deploymentIntegrity, 'UNKNOWN');
  assert.equal(x.rolloutStatus, 'EVIDENCE_UNRESOLVED');
  assert.equal(x.promotionEligibility, 'BLOCKED');
});

test('a failed canary still requires human containment, regardless of coverage', () => {
  const c = C.transition(deployed(), 'CANARY_FAIL');
  c.deployments[0].inFeed = false;
  const x = C.evaluateCase(c);
  assert.equal(x.humanResponse, 'REQUIRED');
  assert.equal(x.promotionEligibility, 'BLOCKED');
  assert.equal(x.authorizationStatus, 'VALID');
  assert.ok(x.nextValidActions.includes('HUMAN_CONTAIN'));
});
