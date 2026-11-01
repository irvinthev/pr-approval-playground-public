/* Fictional, deterministic client-side rule evaluation; never authorizes real changes. */
(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PlaygroundRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  function evaluate(rules, stopOnBlock) {
    if (!Array.isArray(rules)) throw new TypeError('rules must be an array');
    let stopped = false;
    const steps = rules.map((rule) => {
      if (!rule || typeof rule.name !== 'string' || typeof rule.enabled !== 'boolean') {
        throw new TypeError('each rule requires name and enabled');
      }
      let state;
      if (stopped) state = 'SKIP';
      else if (!rule.enabled) state = 'DISABLED';
      else if (rule.violation) {
        state = 'BLOCK';
        if (stopOnBlock) stopped = true;
      } else if (rule.pending) state = 'PENDING';
      else state = 'PASS';
      return { name: rule.name, state, reason: rule.reason || '' };
    });
    const firstBlocked = steps.find((step) => step.state === 'BLOCK') || null;
    return {
      steps,
      approved: steps.every((step) => step.state === 'PASS' || step.state === 'DISABLED'),
      firstBlocked,
      hasPending: steps.some((step) => step.state === 'PENDING')
    };
  }
  function approvalRules(input) {
    const s = input || {};
    const p = s.policy || {};
    const sha = s.headSha;
    return [
      { name: 'Eligibility', enabled: p.protectInstructions !== false, violation: !!s.restricted },
      { name: 'Revision identity', enabled: true, pending: typeof sha!=='string'||!sha.trim(), reason:'A nonempty current revision is required.' },
      { name: 'Required CI', enabled: p.requireCI !== false, pending: s.ciSha !== sha },
      { name: 'Reviewer A', enabled: true, pending: !s.reviewerA || s.reviewerA.sha !== sha, violation: !!s.reviewerA && s.reviewerA.sha === sha && s.reviewerA.level !== 'LOW' },
      { name: 'Reviewer B', enabled: p.requireTwoReviews !== false, pending: !s.reviewerB || s.reviewerB.sha !== sha, violation: !!s.reviewerB && s.reviewerB.sha === sha && s.reviewerB.level !== 'LOW' }
    ];
  }
  function evaluateApproval(input) {
    const s = input || {};
    const assessment = evaluate(approvalRules(s), false);
    const hasIdentity = typeof s.headSha==='string' && !!s.headSha.trim();
    const currentApproval = hasIdentity && typeof s.approvedSha==='string' && s.approvedSha === s.headSha;
    return {
      ...assessment,
      canApprove: hasIdentity && assessment.approved && !(s.policy && s.policy.shadowMode),
      validApproval: currentApproval && assessment.approved,
      canMerge: currentApproval && assessment.approved && !(s.policy && s.policy.shadowMode)
    };
  }
  return Object.freeze({ evaluate, approvalRules, evaluateApproval });
});
