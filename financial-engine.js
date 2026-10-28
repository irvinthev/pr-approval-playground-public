/* Fictional educational model. No company data, external requests, or real authorization. */
(function (root) {
  'use strict';
  const registry = {
    version: 'demo-map-1', policyVersion: 'demo-policy-1',
    nodes: {
      docs: {name: 'User documentation', paths: ['docs/'], consumers: [], financial: false},
      dedup: {name: 'Shared deduplication library', paths: ['lib/dedup/'], consumers: ['usage']},
      usage: {name: 'Usage aggregation', paths: ['services/usage/'], consumers: ['billing']},
      pricing: {name: 'Pricing tiers', paths: ['services/pricing/'], consumers: ['billing']},
      billing: {name: 'Invoice generation', paths: ['services/billing/'], consumers: ['reporting'], financial: true, profile: 'usage-billing'},
      reporting: {name: 'Financial reporting DAG', paths: ['workflows/financial/'], consumers: [], financial: true, profile: 'reporting'},
      policy: {name: 'Financial classification registry', paths: ['control-policy/'], consumers: [], policy: true}
    },
    profiles: {
      'usage-billing': {name: 'Usage-based billing', account: 'Receivables / revenue linkage requires validation', assertions: ['Completeness', 'Accuracy'], requiredRole: 'financial-reviewer'},
      reporting: {name: 'Financial reporting transformation', account: 'Revenue reporting', assertions: ['Accuracy', 'Cutoff'], requiredRole: 'financial-reviewer'}
    }
  };
  const assumptions = {monthly: 12000000, affected: 20, errorLow: 5, errorHigh: 15, months: 1};
  const scenarios = {
    docs: {title: 'Documentation update', files: ['docs/usage-guide.md'], description: 'A verified documentation-only change; no financial calculation applies.'},
    shared: {title: 'Two-line shared-library change', files: ['lib/dedup/key.js'], description: 'Both AI reviews say low risk. The shared library supplies usage aggregation and billing.', calculation: 'billing', assumptions},
    pricing: {title: 'Pricing-tier calculation change', files: ['services/pricing/tiers.js'], description: 'Protected pricing logic changes. A dollar model requires contract-specific tiers and minimums; this demo does not invent them.'},
    schedule: {title: 'Financial DAG schedule change', files: ['workflows/financial/close-job.js'], description: 'A scheduling change may shift reporting timing. Billing-error arithmetic is not applicable.'},
    unknown: {title: 'New component without a mapping', files: ['services/new-meter/index.js'], description: 'Missing lineage is unresolved exposure, not zero dollars.'},
    downgrade: {title: 'Financial classification downgrade', files: ['control-policy/component-map.json'], description: 'Changing the financial registry requires separate policy authorization; a contributor cannot reclassify their own work.'}
  };
  function calculateExposure(a) {
    const keys = ['monthly', 'affected', 'errorLow', 'errorHigh', 'months'];
    if (!a || keys.some(k => typeof a[k] !== 'number' || !Number.isFinite(a[k]))) return {status: 'UNKNOWN', reason: 'All scenario inputs must be finite numbers.'};
    if (a.monthly <= 0 || a.months <= 0 || a.months > 12 || a.affected <= 0 || a.affected > 100 || a.errorLow < 0 || a.errorHigh > 100 || a.errorHigh < a.errorLow) return {status: 'UNKNOWN', reason: 'Use a positive population and affected share, 0–100% ordered error bounds, and a duration above zero and at most 12 months.'};
    const base = a.monthly * a.affected / 100 * a.months;
    const low = base * a.errorLow / 100, high = base * a.errorHigh / 100;
    if (![low, high].every(Number.isFinite)) return {status: 'UNKNOWN', reason: 'Inputs exceed the supported numeric range.'};
    return {status: 'ESTIMATED', low, high, currency: 'USD', measure: 'Conditional billing error', assumptions: {...a}, reason: 'Assumes a fixed monthly population and cumulative error. Not expected loss, a worst-case bound, or a quantified financial-statement misstatement.'};
  }
  function assessTechnicalEligibility(change) {
    const reasons = [];
    if (!change.ci) reasons.push('Required CI has not passed for this revision.');
    if (change.reviewA !== 'low' || change.reviewB !== 'low') reasons.push('Both simulated review results must be low for this route.');
    return {eligible: reasons.length === 0, reasons};
  }
  function assessFinancialImpact(change, map = registry) {
    const unknown = [], reached = new Set(), edges = [], roots = [];
    const visit = id => {
      if (reached.has(id)) return;
      const node = map.nodes[id];
      if (!node) {unknown.push('Missing dependency: ' + id); return;}
      reached.add(id);
      if (node.stale) unknown.push('Stale mapping: ' + id);
      if (!Array.isArray(node.consumers)) {unknown.push('Missing consumer inventory: ' + id); return;}
      if (!node.consumers.length && node.financial !== false && !node.profile && !node.policy) unknown.push('Unclassified terminal component: ' + id);
      if (node.financial && !node.profile) unknown.push('Missing financial profile: ' + id);
      for (const consumer of node.consumers) {edges.push([id, consumer]); visit(consumer);}
    };
    if (!Array.isArray(change.files) || !change.files.length) unknown.push('No changed-file inventory.');
    for (const file of change.files || []) {
      const matches = Object.keys(map.nodes).filter(id => map.nodes[id].paths.some(prefix => file.startsWith(prefix)));
      if (!matches.length) unknown.push('Unmapped file: ' + file);
      for (const id of matches) {roots.push(id); visit(id);}
    }
    const profiles = [...new Set([...reached].map(id => map.nodes[id].profile).filter(Boolean))];
    for (const id of profiles) if (!map.profiles[id]) unknown.push('Missing financial profile: ' + id);
    const policyChange = [...reached].some(id => map.nodes[id].policy);
    const requiredRole = policyChange ? 'policy-reviewer' : profiles.length ? 'financial-reviewer' : null;
    let exposure = {status: 'NOT_APPLICABLE', reason: 'No applicable dollar model for this scenario.'};
    if (change.calculation === 'billing') exposure = calculateExposure(change.assumptions);
    if (unknown.length) exposure = {status: 'UNKNOWN', reason: 'Resolve the dependency mapping before estimating exposure.'};
    else if (profiles.length && change.calculation !== 'billing') exposure = {status: 'UNKNOWN', reason: 'No validated calculation template for this change. Mandatory review still applies.'};
    const status = unknown.length ? 'UNRESOLVED' : requiredRole ? 'REVIEW_REQUIRED' : 'ELIGIBLE';
    return {status, requiredRole, rule: policyChange ? 'DEMO-POLICY-01' : profiles.length ? 'DEMO-FIN-01' : 'DEMO-DOC-01', roots: [...new Set(roots)], components: [...reached], edges, profiles, unknown, exposure, mappingVersion: map.version, policyVersion: map.policyVersion,
      reason: unknown.length ? 'Resolve missing or stale mappings; an approval cannot substitute for financial scope.' : policyChange ? 'Registry changes require an independent policy reviewer.' : requiredRole ? 'Protected financial dependencies require qualified independent review, regardless of the dollar estimate.' : 'Verified limited financial relevance within this fictional registry.'};
  }
  function resolveAuthorization(technical, financial, change, approval) {
    if (!technical.eligible) return {allowed: false, route: 'BLOCKED', reason: technical.reasons.join(' ')};
    if (financial.status === 'UNRESOLVED') return {allowed: false, route: 'UNRESOLVED', reason: financial.reason};
    if (financial.requiredRole) {
      const valid = approval && approval.actor !== change.author && approval.role === financial.requiredRole && approval.sha === change.sha && approval.mappingVersion === financial.mappingVersion && approval.policyVersion === financial.policyVersion;
      if (!valid) return {allowed: false, route: 'HUMAN_REVIEW_REQUIRED', reason: financial.reason};
      return {allowed: true, route: 'HUMAN_AUTHORIZED', reason: 'Qualified independent approval matches this revision and the current mapping and policy versions.'};
    }
    return {allowed: true, route: 'AUTOMATION_ELIGIBLE', reason: 'All modeled requirements are satisfied; this is simulated eligibility only.'};
  }
  function makeChange(id, overrides = {}) {
    return {...scenarios[id], scenario: id, author: 'demo-contributor', sha: 'demo-revision-1', ci: true, reviewA: 'low', reviewB: 'low', ...overrides};
  }
  function approve(change, financial, actor = 'demo-independent-reviewer', role = financial.requiredRole) {
    return {actor, role, sha: change.sha, mappingVersion: financial.mappingVersion, policyVersion: financial.policyVersion};
  }
  function attemptPolicyChange(actor, independentAdministration = true) {
    if (actor === 'policy-custodian') return {allowed: false, proposed: true, message: 'Proposal recorded in this simulation. A separate policy reviewer must authorize it; no policy was changed.'};
    if (actor === 'infrastructure-operator' && !independentAdministration) return {allowed: true, message: 'Simulated bypass possible: the operator controls the gate environment. Administrative independence is not established.'};
    return {allowed: false, message: 'Denied by the simulated independent administration model. This actor cannot downgrade or override the financial policy.'};
  }
  const api = {registry, scenarios, calculateExposure, assessTechnicalEligibility, assessFinancialImpact, resolveAuthorization, makeChange, approve, attemptPolicyChange};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FinancialDemo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
