/* Presentation guidance for one fictional design, not a second decision engine. */
(function (root) {
  'use strict';
  const stages = [
    {
      question: 'What exactly are we asking the workflow to decide?',
      consider: 'Would you delegate assessment, approval, merge, deployment—or only some of them? What needs its own authority?',
      routes: 'In this example AI supplies review evidence, a policy determines the permitted authorization route, and build and release checks remain separate.',
      evidence: 'A trusted diff, full changed-file inventory, contributor identity and exact revision. A PR title or low-risk label does not establish the full scope.'
    },
    {
      question: 'What could this change affect beyond its own file?',
      consider: 'Would you permit automation based on the changed path? What downstream knowledge would change your judgment?',
      routes: 'A different design might automate verified eligible scope. This fixture has a billing dependency requiring independent review. Missing mapping requires investigation before that route can be decided.',
      evidence: 'A maintained dependency inventory, its owner and version, scope validation, and applicable CI results for this revision.'
    },
    {
      question: 'What do favorable AI findings actually establish?',
      consider: 'If two reviewers agree, what remains uncertain about impact, quality and authority?',
      routes: 'Two LOW findings meet this example’s AI-review condition. Other architectures may use different review arrangements; favorable findings do not waive the protected dependency rule.',
      evidence: 'Revision-bound outputs, model and prompt versions, quality evaluations including unsafe cases, and evidence about shared failure modes. Two model names alone do not establish independence.'
    },
    {
      question: 'Who can authorize this change, under which conditions?',
      consider: 'What separates a qualified decision from an approval label? What happens if code or policy changes afterward?',
      routes: 'This example requires a qualified independent reviewer for protected financial scope. A new revision or policy / mapping version needs matching authorization; accepting residual risk does not replace mandatory requirements.',
      evidence: 'Reviewer authority and independence, review rationale, exact revision and applicable versions, plus effective permissions over policy and enforcement. The invented identity here is not proof of real independence.'
    },
    {
      question: 'How would authorized source become a trusted artifact?',
      consider: 'Could an approval be valid while the build is wrong? What could bypass the protected merge or build path?',
      routes: 'Both authorization routes would converge on protected merge and trusted build. This fixture records a synthetic build; a real design must establish its source and artifact linkage.',
      evidence: 'Effective branch protections, bypass permissions, trusted build records and an artifact digest linked to authorized source. A matching label is not enough.'
    },
    {
      question: 'What else must hold before release?',
      consider: 'Would you release because approval is valid? Which artifact and environment checks still apply?',
      routes: 'Passing approval requirements does not waive release checks. Correct failed or stale release evidence, then validate the current source, artifact and applicable versions.',
      evidence: 'Artifact-bound release results, effective environment protections and the source / build / authorization chain. Passing a synthetic check is not operating evidence.'
    },
    {
      question: 'What would tell us what reached production?',
      consider: 'Does a complete-looking feed include every production route? Would a missing link establish unauthorized change, or a need to investigate?',
      routes: 'Separate observation from authorization. Investigate uncovered routes and unresolved linkage before deciding what happened; define who contains exposure or suspends automation when needed.',
      evidence: 'Independently corroborated deployment populations, actual artifact identity, historical authorization linkage, business and technical outcomes, and retained response records. A demonstration does not establish effectiveness over time.'
    }
  ];
  function explain(evaluation, stage) {
    if (!Number.isInteger(stage) || stage < 0 || stage >= stages.length) throw new RangeError('Unknown guide stage');
    const x = evaluation, guide = stages[stage];
    const predicate = id => x.predicates.find(p => p.id === id);
    const next = x.nextValidActions[0];
    const facts = [
      'The fictional change is evaluated at ' + x.evaluatedRevision + '. The example separates technical evidence, authorization, release eligibility and evidence completeness.',
      x.dependencyAssessment.status === 'UNRESOLVED' ? 'The dependency assessment is unresolved. The model cannot establish eligible scope from the available mapping.' : 'The recorded path reaches ' + x.dependencyAssessment.components.join(' → ') + '. This example’s financial-review rule applies.',
      ['ci', 'reviewA', 'reviewB'].map(id => id + ': ' + predicate(id).status).join(' · ') + '. These are simulated records for the evaluated revision.',
      'Authorization: ' + x.authorizationStatus + '. Applicable policy: ' + x.policyVersion + '; mapping: ' + x.mappingVersion + '.',
      'Artifact lineage: ' + x.releasePredicates.find(p => p.id === 'artifact-lineage').status + '. Authorization alone does not establish a trusted build.',
      'Release checks: ' + x.releasePredicates.find(p => p.id === 'release-checks').status + '. Release eligibility: ' + x.releaseEligibility + '.',
      'Evidence: ' + x.evidenceCompleteness + '. The model reports ' + x.monitoringFindings.length + ' monitoring finding(s); that count does not establish complete coverage.'
    ];
    let why = 'Inspect the current facts and required conditions before continuing.';
    if (x.dependencyAssessment.status === 'UNRESOLVED') why = 'Resolve missing mapping evidence first. Human approval or risk acceptance cannot substitute for establishing scope.';
    else if (x.authorizationStatus === 'STALE') why = 'Prior authorization covers different code or applicable versions. Renew the required evidence and review; do not reuse that approval.';
    else if (next === 'CHECKS') why = 'Current technical evidence is pending or stale. Record fresh checks; the protected financial dependency will still require independent review.';
    else if (next === 'APPROVE') why = 'The technical conditions hold, but this example’s protected dependency rule still requires independent authorization.';
    else if (next === 'BUILD' || next === 'RELEASE_CHECKS') why = 'Authorization is valid, but current build or release conditions remain unmet. Complete those conditions before deployment.';
    else if (x.releaseEligibility === 'ELIGIBLE') why = 'The modeled release conditions hold. This is conditional simulation eligibility; it does not validate real deployment enforcement or evidence reliability.';
    return { ...guide, facts: facts[stage], why };
  }
  const api = { explain };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CaseGuide = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
