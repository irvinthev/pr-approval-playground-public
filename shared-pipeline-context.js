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
const urls={risk:'ai-sdlc-risk.html',engineering:'engineering-blueprint.html',monitoring:'continuous-monitoring.html',assurance:'independent-assurance.html'};
function validStage(v){return typeof v==='string'&&/^[0-6]$/.test(v)?Number(v):null}
function stageFromLocation(search){return validStage(new URLSearchParams(search||'').get('stage'))}
function href(lens,stage){if(!Object.prototype.hasOwnProperty.call(urls,lens)||!Number.isInteger(stage)||stage<0||stage>6)throw new TypeError('Unknown perspective or stage');return './'+urls[lens]+'?stage='+stage+(lens==='engineering'?'#technical-requirements':lens==='monitoring'?'#technical-requirements':'#shared-pipeline-context')}
const api=Object.freeze({stages:Object.freeze(stages),trace:Object.freeze(trace),urls:Object.freeze(urls),validStage,stageFromLocation,href});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SharedPipelineContext=api;
})(typeof globalThis!=='undefined'?globalThis:this);
