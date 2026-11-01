const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../case-model');
const G = require('../case-guide');

test('inspecting every guide stage cannot alter case facts or evaluation', () => {
  const c = C.replay(['CHECKS', 'APPROVE']);
  const x = C.evaluateCase(c), beforeCase = C.encode(c), beforeEvaluation = JSON.stringify(x);
  for (let stage = 0; stage < 7; stage++) {
    const guide = G.explain(x, stage);
    assert.ok(guide.question && guide.consider && guide.facts && guide.routes && guide.why && guide.evidence);
  }
  assert.equal(C.encode(c), beforeCase);
  assert.equal(JSON.stringify(x), beforeEvaluation);
});

test('unknown mapping is explained as investigation even after residual-risk acceptance', () => {
  const x = C.evaluateCase(C.replay(['CHECKS', 'MAP_MISSING', 'ACCEPT_RISK']));
  const guide = G.explain(x, 1);
  assert.equal(x.dependencyAssessment.status, 'UNRESOLVED');
  assert.match(guide.facts, /unresolved/);
  assert.match(guide.why, /cannot substitute/);
  assert.match(guide.why, /mapping/);
});

test('a new revision changes the explanation from build preparation to renewed authorization', () => {
  const approved = C.replay(['CHECKS', 'APPROVE']);
  const a = G.explain(C.evaluateCase(approved), 3);
  const b = G.explain(C.evaluateCase(C.transition(approved, 'PUSH')), 3);
  assert.match(a.facts, /Authorization: VALID/);
  assert.match(a.why, /build or release/);
  assert.match(b.facts, /Authorization: STALE/);
  assert.match(b.why, /do not reuse/);
});

test('release eligibility guidance does not present the simulation as real enforcement', () => {
  const x = C.evaluateCase(C.replay(['CHECKS', 'APPROVE', 'BUILD', 'RELEASE_CHECKS']));
  const guide = G.explain(x, 5);
  assert.equal(x.releaseEligibility, 'ELIGIBLE');
  assert.match(guide.why, /does not validate real deployment enforcement/);
  assert.match(guide.evidence, /not operating evidence/);
});

test('guide rejects out-of-range stages rather than showing an unrelated explanation', () => {
  const x = C.evaluateCase(C.initial());
  for (const stage of [-1, 7, '3', NaN]) assert.throws(() => G.explain(x, stage));
});
