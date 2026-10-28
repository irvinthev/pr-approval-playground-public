/* All inputs, identities, events and outputs are invented for this public demo. */
function financialRaceEvaluate(s, seen, policy) {
  const F = FinancialDemo;
  let change = F.makeChange('shared', {sha: s.sha, ci: false, reviewA: null, reviewB: null});
  let map = F.registry, assessment = null, approval = null, approvedSha = null, merged = false;
  for (const [event] of seen) {
    if (event === 'CI_PASSED') change.ci = true;
    if (event === 'REVIEW_A_LOW') change.reviewA = 'low';
    if (event === 'REVIEW_B_LOW') change.reviewB = 'low';
    if (event === 'FINANCIAL_ASSESSED') assessment = F.assessFinancialImpact(change, map);
    if (event === 'HUMAN_APPROVED' && assessment) approval = F.approve(change, assessment);
    if (event === 'COMMIT_PUSHED') {change = {...change, sha: 'demo-revision-2', ci: false, reviewA: null, reviewB: null}; assessment = approval = approvedSha = null;}
    if (event === 'MAPPING_CHANGED') {map = {...map, version: 'demo-map-2'}; assessment = approval = approvedSha = null;}
    const technical = F.assessTechnicalEligibility(change);
    const decision = assessment ? F.resolveAuthorization(technical, assessment, change, approval) : {allowed: false};
    if (event === 'APPROVAL_REQUESTED' && decision.allowed && !policy.shadowMode) approvedSha = change.sha;
    if (event === 'MERGE_REQUESTED' && decision.allowed && approvedSha === change.sha && !policy.shadowMode) merged = true;
  }
  const technical = F.assessTechnicalEligibility(change);
  const decision = assessment ? F.resolveAuthorization(technical, assessment, change, approval) : {allowed: false, route: 'PENDING', reason: 'Independent financial assessment required for this revision and mapping.'};
  const status = merged ? 'MERGED — HUMAN AUTHORIZED' : approvedSha === change.sha ? 'APPROVED — HUMAN AUTHORIZED' : decision.route.replaceAll('_', ' ');
  const stages = [['Eligibility', 'PASS'], ['Required CI', change.ci ? 'PASS' : 'PENDING'], ['Reviewer A', change.reviewA || 'PENDING'], ['Reviewer B', change.reviewB || 'PENDING'], ['Independent financial gate', assessment ? decision.allowed ? 'SATISFIED' : assessment.status : 'PENDING'], ['Approval', policy.shadowMode ? 'SHADOW ONLY' : approvedSha ? 'GRANTED' : 'NOT GRANTED'], ['Merge', merged ? 'MERGED' : 'NOT MERGED']];
  const record = {synthetic: true, scenario: s.title, commit: change.sha, policy: {...policy, requireCI: true, requireTwoReviews: true, independentFinancialGate: true}, mappingVersion: map.version, policyVersion: map.policyVersion, financialAssessment: assessment, humanApproval: approval, events: seen.map(([type, description], i) => ({step: i + 1, type, description})), stages: Object.fromEntries(stages), decision: status, reason: decision.reason, mergeAuthorized: merged};
  return {s, seen, status, reason: decision.reason, stages, record, approvedSha, merged};
}

document.addEventListener('DOMContentLoaded', () => {
  const F = FinancialDemo, $f = id => document.getElementById(id);
  const money = value => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(value);
  let revision = 1, approval = null, lastRecord = null;
  const ids = {monthly: 'fin-monthly', affected: 'fin-affected', errorLow: 'fin-error-low', errorHigh: 'fin-error-high', months: 'fin-months'};
  const scenarioSelect = $f('fin-scenario');
  Object.entries(F.scenarios).forEach(([id, s]) => {const option = document.createElement('option'); option.value = id; option.textContent = s.title; scenarioSelect.appendChild(option);});
  scenarioSelect.value = 'shared';
  function getState() {
    const values = Object.fromEntries(Object.entries(ids).map(([key, id]) => [key, $f(id).value.trim() === '' ? NaN : Number($f(id).value)]));
    const change = F.makeChange(scenarioSelect.value, {sha: 'demo-revision-' + revision, assumptions: values, ci: $f('fin-ci').checked, reviewB: $f('fin-ai').value});
    const map = $f('fin-mapping').value === 'stale' ? {...F.registry, nodes: Object.fromEntries(Object.entries(F.registry.nodes).map(([id, node]) => [id, {...node, stale: true}]))} : F.registry;
    const technical = F.assessTechnicalEligibility(change), financial = F.assessFinancialImpact(change, map);
    return {change, technical, financial, decision: F.resolveAuthorization(technical, financial, change, approval)};
  }
  function render() {
    const {change, technical, financial, decision} = getState();
    $f('fin-description').textContent = change.description;
    $f('fin-files').textContent = change.files.join(', ') + ' · ' + change.sha;
    $f('fin-inputs').hidden = change.calculation !== 'billing';
    $f('fin-trace').replaceChildren();
    financial.components.forEach(id => {const node = F.registry.nodes[id], card = document.createElement('div'); card.className = 'trace-item'; const title = document.createElement('b'); title.textContent = node.name; const text = document.createElement('small'); text.textContent = node.consumers.length ? 'Supplies: ' + node.consumers.map(k => F.registry.nodes[k]?.name || k).join(', ') : node.policy ? 'Separately governed policy' : node.financial ? 'Financial output' : 'Verified limited financial relevance'; card.append(title, text); $f('fin-trace').appendChild(card);});
    $f('fin-linkage').textContent = financial.profiles.length ? financial.profiles.map(id => {const p = F.registry.profiles[id]; return p.name + ' — ' + p.account + '; assertions: ' + p.assertions.join(', ');}).join(' | ') : financial.status === 'UNRESOLVED' ? 'Financial relevance is unresolved.' : 'No financial process identified within the verified demo scope.';
    $f('fin-unknown').textContent = financial.unknown.join(' ');
    const exposure = financial.exposure;
    $f('fin-exposure').textContent = exposure.status === 'ESTIMATED' ? money(exposure.low) + '–' + money(exposure.high) : exposure.status === 'NOT_APPLICABLE' ? 'Not applicable' : 'Unknown — not zero';
    $f('fin-exposure-note').textContent = exposure.reason;
    $f('fin-technical').textContent = technical.eligible ? 'Technical eligibility: PASS · both AI reviews LOW' : 'Technical eligibility: BLOCK · ' + technical.reasons.join(' ');
    $f('fin-gate').textContent = 'Independent financial gate: ' + financial.status.replaceAll('_', ' ') + ' · ' + financial.rule;
    $f('fin-decision').textContent = decision.route.replaceAll('_', ' ');
    $f('fin-reason').textContent = decision.reason;
    $f('fin-decision-box').className = 'callout ' + (decision.allowed ? 'good' : 'bad');
    $f('fin-approve').disabled = financial.status !== 'REVIEW_REQUIRED' || !technical.eligible;
    $f('fin-approve').textContent = financial.requiredRole === 'policy-reviewer' ? 'Simulate independent policy approval' : 'Simulate qualified independent approval';
    lastRecord = {synthetic: true, notice: 'Fictional editable browser simulation; no real authorization, proprietary data, or audit evidence.', change, technical, financial, approval, decision};
    $f('fin-record').textContent = JSON.stringify(lastRecord, null, 2);
  }
  function reset() {revision = 1; approval = null; Object.entries(ids).forEach(([k, id]) => $f(id).value = F.scenarios.shared.assumptions[k]); $f('fin-ci').checked = true; $f('fin-ai').value = 'low'; $f('fin-mapping').value = 'verified'; render();}
  scenarioSelect.addEventListener('change', reset);
  Object.values(ids).forEach(id => $f(id).addEventListener('input', () => {approval = null; render();}));
  ['fin-ci', 'fin-ai', 'fin-mapping'].forEach(id => $f(id).addEventListener('change', () => {approval = null; render();}));
  $f('fin-approve').addEventListener('click', () => {const x = getState(); approval = F.approve(x.change, x.financial); render();});
  $f('fin-push').addEventListener('click', () => {revision++; $f('fin-ci').checked = false; render();});
  $f('fin-reset').addEventListener('click', reset);
  $f('fin-attempt').addEventListener('click', () => {const x = F.attemptPolicyChange($f('fin-actor').value, $f('fin-independent').checked); $f('fin-attempt-result').className = 'callout ' + (x.allowed ? 'bad' : 'good'); $f('fin-attempt-result').textContent = x.message;});
  ['fin-actor', 'fin-independent'].forEach(id => $f(id).addEventListener('change', () => {$f('fin-attempt-result').textContent = 'Run the attempt with these permissions.'; $f('fin-attempt-result').className = 'callout';}));
  $f('fin-export').addEventListener('click', () => {const url = URL.createObjectURL(new Blob([JSON.stringify(lastRecord, null, 2)], {type: 'application/json'})); const link = document.createElement('a'); link.href = url; link.download = 'fictional-financial-impact.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);});
  $f('fin-race').addEventListener('click', () => {activateSection('design', 'approval-race'); $f('race-scenario').value = 'financial'; $f('race-scenario').dispatchEvent(new Event('change'));});
  const events = [['PR_OPENED', 'Two-line shared-library PR opened'], ['CI_PASSED', 'Required CI passed for this revision'], ['REVIEW_A_LOW', 'Reviewer A reports low risk'], ['REVIEW_B_LOW', 'Reviewer B reports low risk'], ['FINANCIAL_ASSESSED', 'Independent map identifies billing and reporting dependencies'], ['APPROVAL_REQUESTED', 'Automation attempts approval without financial authorization'], ['MERGE_REQUESTED', 'Merge attempt blocked by independent financial gate'], ['HUMAN_APPROVED', 'Qualified independent reviewer approves the exact revision and policy versions'], ['APPROVAL_REQUESTED', 'Authorization service validates all requirements'], ['MERGE_REQUESTED', 'Human-authorized route reaches simulated merge']];
  const raceDefinitions = {
    financial: {title: 'Low AI risk, protected financial dependency', events},
    financialPush: {title: 'New commit invalidates financial approval', events: [...events.slice(0, 9), ['COMMIT_PUSHED', 'New revision invalidates technical and financial authorization'], ['CI_PASSED', 'CI passes for new revision'], ['REVIEW_A_LOW', 'Reviewer A again reports low risk'], ['REVIEW_B_LOW', 'Reviewer B again reports low risk'], ['FINANCIAL_ASSESSED', 'New revision still requires independent review'], ['MERGE_REQUESTED', 'Old human approval cannot authorize the new revision']]},
    financialMapping: {title: 'Mapping update invalidates authorization', events: [...events.slice(0, 9), ['MAPPING_CHANGED', 'Financial mapping version changes; prior authorization invalidated'], ['FINANCIAL_ASSESSED', 'Reassessed under new mapping version'], ['MERGE_REQUESTED', 'Old approval cannot authorize the revised mapping']]}
  };
  Object.entries(raceDefinitions).forEach(([id, value]) => {raceScenarios[id] = {...value, financial: true, sha: 'demo-revision-1', description: 'Fictional independent financial gate. CI and two low reviews remain mandatory in these scenarios. Only shadow mode is adjustable.'}; const option = document.createElement('option'); option.value = id; option.textContent = value.title; $f('race-scenario').appendChild(option);});
  $f('race-scenario').addEventListener('change', () => {const financial = !!raceScenarios[$f('race-scenario').value].financial; ['race-policy-guard', 'race-policy-two', 'race-policy-ci'].forEach(id => $f(id).disabled = financial);});
  reset();
});
