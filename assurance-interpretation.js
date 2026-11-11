/* Presentation-only interpretation of the four fictional worked examples.
 * Never changes approval, review, release, or evidence evaluation logic. */
(function(root){
'use strict';
const cases={
 standard:{
  baseline:{ai:'Two favorable reviews for the current revision (fictional).',enforcement:'The simulated authorization route is eligible; actual independent enforcement is not tested.',reliance:'Not established. Test effective policy, reviewer identities, GitHub protection, build and deployment routes.',controls:['AI-06','AI-07','AI-08'],evidence:'Exact reviewed SHA, required checks, effective ruleset, approval issuer, bypass audit trail and downstream deployment record.'},
  stale:{ai:'Favorable review belongs to revision A, not the subsequent revision B.',enforcement:'The worked-example adapter blocks the modeled route; this is not proof of engine-wide invalidation.',reliance:'Not established. Reperform new-commit invalidation and privileged bypass in the actual environment.',controls:['AI-06','AI-07','AI-08'],evidence:'PR revision history, reviewer check SHAs, invalidation events and actual merge-gate decision.'},
  failed:{ai:'Favorable AI review does not cure a failed required CI check.',enforcement:'The fictional authorization route is blocked by the failed check.',reliance:'Not established. Inspect check issuer, rule configuration and every alternate merge path.',controls:['AI-07','AI-08'],evidence:'Check-suite event, required-check configuration, approval policy version and attempted merge result.'}
 },
 dependency:{
  baseline:{ai:'Both reviewers label the change low risk; that does not establish approval eligibility.',enforcement:'The fictional dependency screen identifies billing relevance and routes to human authorization.',reliance:'Not established. One modeled exclusion does not prove dependency-map completeness or period operation.',controls:['AI-01','AI-05','AI-07'],evidence:'Independent service dependency inventory, mapping version, PR diff, gate decision and human approval.'},
  omitted:{ai:'Both low-risk verdicts fail to surface the omitted billing relationship.',enforcement:'The supplied dependency map silently omits a critical consumer, exposing unsafe eligibility; no successful safeguard is invented.',reliance:'Not established. Investigate false-low-risk exposure and validate mapping completeness independently.',controls:['AI-01','AI-05','AI-15'],evidence:'Source-of-truth dependency lineage, mapping provenance, excluded consumer, eligibility decisions and related change history.'},
  incomplete:{ai:'The AI verdicts do not resolve uncertain financial dependency impact.',enforcement:'The fictional gate treats incomplete mapping as unresolved and withholds automated authorization.',reliance:'Not established. Verify unknown-impact behavior and independent mapping completeness.',controls:['AI-01','AI-07','AI-15'],evidence:'Unresolved dependency records, effective exclusion policy, human escalation and negative-test traces.'}
 },
 policy:{
  baseline:{ai:'Review scores are not at issue; this challenge tests who controls approval rules.',enforcement:'The fictional independent-admin boundary denies the operator’s downgrade attempt.',reliance:'Not established. Inspect real inherited privileges, runtime access and configuration-change records.',controls:['AI-02','AI-03','AI-15'],evidence:'Effective permission graph, policy ownership, attempted-change log and independent change authorization.'},
  weakened:{ai:'Separate AI reviewers cannot offset an administrator who can weaken their enforcement policy.',enforcement:'The fictional permission model permits a policy downgrade, exposing a possible bypass.',reliance:'Not established. Determine whether actual privileges permit unilateral changes or bypass.',controls:['AI-03','AI-04','AI-15'],evidence:'Administrator entitlements, service identities, policy deployment path, version history and bypass records.'}
 },
 population:{
  baseline:{ai:'Reviewer classification is not the subject of this release-monitoring test.',enforcement:'Fictional source and monitoring samples match; complete deployment coverage is still unknown.',reliance:'Not established. A matching sample is not an independently complete population.',controls:['AI-11','AI-12'],evidence:'Independent release inventory, monitoring feed extraction, source-to-feed reconciliation and completeness criteria.'},
  missing:{ai:'AI output is not the issue; the challenge concerns post-merge release visibility.',enforcement:'One independent fictional deployment is absent from the feed. Its authorization is not determined.',reliance:'Not established. Investigate missing coverage before relying on monitoring or approval populations.',controls:['AI-11','AI-12'],evidence:'Independent release event, omitted feed record, collection rules, investigation and exception resolution.'},
  unverified:{ai:'AI review behavior is not assessed by this monitoring scenario.',enforcement:'The simulated feed has no independent source corroboration; completeness remains unresolved.',reliance:'Not established. Establish independent source population and period coverage.',controls:['AI-11','AI-12'],evidence:'Deployment pathways, source population definition, extraction filters, timestamps, reconciliation and retention.'}
 }
};
function interpret(id,condition='baseline'){
 if(!Object.hasOwn(cases,id)||!Object.hasOwn(cases[id],condition))throw new TypeError('Unknown fictional assurance scenario');
 return {...cases[id][condition],id,condition,fictional:true};
}
const api={interpret};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AssuranceInterpretation=api;
})(typeof globalThis!=='undefined'?globalThis:this);
