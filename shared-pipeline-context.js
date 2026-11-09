/* Shared reference-only pipeline context. No authorization or simulation behavior. */
(function(root){
'use strict';
const stages=[
 {id:0,title:'Pull request',slug:'pull-request',summary:'Identify the proposed change and exact source revision.'},
 {id:1,title:'Eligibility & CI',slug:'eligibility',summary:'Apply deterministic scope and required-check gates before AI review.'},
 {id:2,title:'AI reviews',slug:'ai-reviews',summary:'Obtain structured, revision-bound assessments; uncertainty routes to humans.'},
 {id:3,title:'Authorization',slug:'authorization',summary:'Evaluate approval authority separately from AI classifications.'},
 {id:4,title:'Merge + build',slug:'merge-build',summary:'Enforce current merge requirements and build artifact provenance.'},
 {id:5,title:'Pre-production',slug:'preproduction',summary:'Verify release conditions and artifact identity before promotion.'},
 {id:6,title:'Production rollout',slug:'production',summary:'Account for actual deployments and enforce rollout/containment safeguards.'}
];
const trace={
 1:{
  question:'Could a financially relevant shared-library change be incorrectly admitted to automated approval?',
  risk:'A dependency map omits a billing consumer, so a shared-library change appears eligible even if two AI reviewers later agree it is low risk.',
  engineering:'A deterministic gate evaluates effective protected paths, repository scope, required checks and dependency-map completeness before any AI recommendation is considered. Unknown dependencies require a human route.',
  monitoring:'Observe eligibility decisions by policy/map version, unknown dependencies, map updates, overrides and changes to exclusion rules; investigate missing decisions against independent PR events.',
  evidence:'Effective eligibility rule and protected-scope configuration; map version, owner and source; screened PR and exact SHA; evaluation outcome with reason; check issuer and run; map-change and exception history.',
  assurance:'Independently validate map coverage against known consuming services; inject a protected or unmapped dependency and verify automation is excluded; sample eligible decisions against effective mapping and rules.',
  limitation:'A passing gate record does not establish that the dependency inventory includes every financially relevant consumer.',
  controls:['AI-01','AI-05','AI-15']
 },
 3:{
  question:'Was the exact revision independently authorized, or was a low-risk AI verdict mistaken for authority?',
  risk:'Two AI reviewers return LOW, but stale review evidence, an unauthorized issuer or weakened policy permits an approval that should not qualify.',
  engineering:'A separately governed policy decision verifies eligible scope, current SHA, required CI, valid current reviewer outputs and effective authorization policy. AI reviewers must not grant merge permission themselves.',
  monitoring:'Investigate SHA mismatches, rejected authorization attempts, unusual decision issuers, policy/bypass changes, missing decision events and unauthorized rule modification.',
  evidence:'Decision/run ID and timestamp; head and reviewed SHAs; policy and scope-map version; AI reviewer identity and output; required check names, issuers and results; authorization issuer, effective access and bypass history.',
  assurance:'Approve revision A and push revision B; attempt to reuse prior approval and verify source-system enforcement rejects it. Challenge invalid reviewer output, missing checks and unauthorized issuer. Reconcile decision events to independent merge records.',
  limitation:'A simulated approval JSON or sample of approved tickets cannot establish completeness, effective enforcement or operating effectiveness over the period.',
  controls:['AI-03','AI-06','AI-07','AI-08','AI-15']
 },
 6:{
  question:'Did the authorized source and artifact actually reach production through a controlled route?',
  risk:'A production deployment contains a different commit or artifact from the authorized change, or an alternate release path avoids expected gates.',
  engineering:'Bind build provenance to authorized source and an immutable artifact digest; validate preproduction gates and deploy permissions at promotion, including emergency and direct routes.',
  monitoring:'Reconcile independent production deployments to authorization, build and artifact events. Alert on digest/SHA mismatches, missing provenance, bypass routes and canary failure; retain investigation and rollback evidence.',
  evidence:'Authorized PR, SHA and approval decision; trusted build provenance, artifact digest and promotion record; deployment job/actor; runtime version and production deployment events; canary thresholds and incident response history.',
  assurance:'Start with the independently complete production deployment population; trace selected deployments to actual artifact digests, trusted builds and authorized source revisions. Test artifact substitution and alternative deployment paths.',
  limitation:'An approval log and a green CI status do not prove what binary ran in production, nor that all deployments were represented in the approval population.',
  controls:['AI-10','AI-11','AI-12','AI-13']
 }
};
// Concrete, proposed audit procedures. A test-environment rejection is not operating-period evidence.
const assuranceTests={
 0:{
  preparation:'Obtain authoritative GitHub PR, commit and branch activity for the period, event-ingestion records, and the documented scope of repositories and actors.',
  execution:'Select a PR, capture its original SHA, push revision B in an authorized test repository, then compare raw source-control events with screening events and any existing approval for revision A.',
  expected:'Revision B is screened against its own SHA; stale approval or test results are invalidated. Missing or delayed events are detected and resolved before approval.',
  operation:'Reconcile the full source-control PR/update population to screening/decision events; investigate unmatched SHAs, retries, bypasses and omitted repositories.',
  retain:'Source-system PR and commit export, delivery events, screened-decision records, event IDs, timestamped effective configuration, exceptions and reconciliation.'
 },
 1:{
  preparation:'Obtain approved repository/path exclusions, effective eligibility policy and historical dependency-map snapshots; identify known billing consumers independently from service ownership/build manifests.',
  execution:'In an authorized test repo, submit three PRs: (a) a shared-library change with a known billing consumer, (b) a deliberately unmapped/unknown consumer, and (c) a protected path; capture policy inputs, map version, evaluated SHA and gate outcomes.',
  expected:'Each protected or unresolved case is excluded from automated approval and routed to an authorized human path. A failed mandatory CI check cannot pass through human fallback.',
  operation:'Independently compare sampled eligible decisions with the policy and dependency map effective at each decision; test completeness by reconciling mapped consumers against independently sourced inventories and ownership data.',
  retain:'Baseline and historical policy/map versions, reference consumer inventory, test PRs and SHAs, decision logs, CI checks, source-enforcement responses and exceptions.'
 },
 2:{
  preparation:'Obtain the adjudicated reviewer-validation corpus, expected outcomes, reviewer identities, effective model/prompt/tool versions and acceptance criteria.',
  execution:'Submit known safe, unsafe, indirect financial-dependency and adversarial input cases to each reviewer; separately force a split verdict, malformed output, timeout and review for stale SHA.',
  expected:'Unsafe false-low classifications are identified in validation; split, invalid, missing or stale assessments cannot satisfy the automated authorization route.',
  operation:'Reperform selected validation cases and trace sampled approval decisions to complete reviewer outputs and then-effective configurations; review paired reviewer misses and material changes.',
  retain:'Test inputs and adjudication, reviewer outputs, metrics and thresholds, model/prompt versions, SHA bindings, policy response and human escalations.'
 },
 3:{
  preparation:'Obtain the effective authorization decision policy, protected GitHub ruleset, authorized issuer grants, required check issuers, bypass actors and version history.',
  execution:'Authorize revision A in an authorized test environment, push revision B, attempt reuse of A approval; repeat with a missing required check, malformed reviewer output and unauthorized issuer; inspect actual merge enforcement.',
  expected:'Each stale, missing or unauthorized condition denies automated authorization/merge. Both AI LOW verdicts alone never grant approval authority; a human route cannot override nonwaivable gates.',
  operation:'Establish an independently sourced merge population and reconcile approved automated decisions by SHA, issuer and effective policy version; investigate missing decisions and bypass events.',
  retain:'Test PR/SHAs, check issuer and status, reviewer payloads, decision and denial events, effective ruleset/policy history, actor privileges, merge attempts and reconciliations.'
 },
 4:{
  preparation:'Obtain effective branch/ruleset and merge-queue protections, CI issuer restrictions, build workflow configuration and trusted provenance requirements.',
  execution:'Attempt merge with a failed check and then a check from an untrusted issuer; push a new commit after qualifying review; attempt to substitute a build artifact or provenance reference.',
  expected:'Enforcement prevents an invalid merge and rejects substituted or untraceable artifacts; successful build provenance identifies the authorized SHA and exact artifact digest.',
  operation:'Select from independent merged-PR and build populations; trace required checks, issuer, effective rules, authorized revision, trusted build ID and digest including exception routes.',
  retain:'Ruleset snapshots, merge and check events, trusted build logs, source SHA, provenance attestation, artifact digest and bypass investigations.'
 },
 5:{
  preparation:'Obtain production promotion policy, environment restrictions, preproduction test gates, artifact-digest verification rules and permitted deploy identities.',
  execution:'Attempt preproduction promotion using a mismatched digest, failed environment check and unauthorized deploy identity; examine standard, manual and emergency entry points.',
  expected:'Each invalid artifact, failed mandatory gate and unauthorized identity is blocked rather than silently promoted.',
  operation:'For selected releases, trace effective gates, immutable artifacts, environment-check outcomes and authorized promotion actors, including exceptions and alternative routes.',
  retain:'Promotion configuration and history, preproduction test results, artifact identifiers and digest comparisons, permitted actor grants, denials and releases.'
 },
 6:{
  preparation:'Obtain the independently sourced inventory of actual production deploys, runtime version/digest records, artifact provenance, release policy and canary thresholds.',
  execution:'In an authorized controlled test, attempt an alternate release route or artifact-digest substitution, then trigger a canary threshold breach; inspect production gate and rollback responses.',
  expected:'Unapproved artifacts/paths are blocked or flagged; a specified canary breach halts or rolls back rollout under the documented rule. A dashboard status alone is not proof of the deployed artifact.',
  operation:'Reconcile the entire actual production deployment population to artifact digest, trusted build, authorized source SHA and release approval; investigate unmatched deployments, false-negative alerts and recovery exceptions.',
  retain:'Source deployment inventory and runtime digests, provenance, approval and promotion events, alert/canary measurements, incident tickets, stop/rollback evidence and reconciliation.'
 }
};
const urls={risk:'ai-sdlc-risk.html',engineering:'engineering-blueprint.html',monitoring:'continuous-monitoring.html',assurance:'independent-assurance.html'};
function validStage(v){return typeof v==='string'&&/^[0-6]$/.test(v)?Number(v):null}
function stageFromLocation(search){return validStage(new URLSearchParams(search||'').get('stage'))}
function href(lens,stage){if(!Object.prototype.hasOwnProperty.call(urls,lens)||!Number.isInteger(stage)||stage<0||stage>6)throw new TypeError('Unknown perspective or stage');return './'+urls[lens]+'?stage='+stage+(lens==='engineering'?'#technical-requirements':lens==='monitoring'?'#technical-requirements':'#shared-pipeline-context')}
const api=Object.freeze({stages:Object.freeze(stages),trace:Object.freeze(trace),assuranceTests:Object.freeze(assuranceTests),urls:Object.freeze(urls),validStage,stageFromLocation,href});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SharedPipelineContext=api;
})(typeof globalThis!=='undefined'?globalThis:this);
