/* Fictional worked examples adapt existing evaluators; no real authorization or evidence. */
(function(root){
'use strict';
const node=typeof module!=='undefined'&&module.exports;
const F=node?require('./financial-engine'):root.FinancialDemo;
const A=node?require('./auditor-challenge'):root.AuditorChallenge;
const P=node?require('./population-reconciliation'):root.PopulationDemo;
const definitions={
 standard:{title:'Standard automated approval',lesson:'Favorable reviews support eligibility; protected authorization and release enforcement still need verification.',situation:'A documentation-only change has two favorable reviews and passing CI for the current revision.',conditions:{baseline:'Current revision and passing checks',stale:'Push a new revision after review',failed:'Fail a required CI check'},controls:['AI-06','AI-07','AI-08'],tests:[['Design','Inspect the protected authorization conditions, expected check issuer, revision binding and bypass permissions.'],['Implementation','Push another revision or fail a mandatory check. Attempt merge and retain evidence that current requirements are enforced.'],['Operation over time','Establish decision and configuration populations; inspect decisions and exceptions against the rules effective at that time.']]},
 dependency:{title:'Hidden billing dependency',lesson:'A gate can apply its rules correctly and still admit the wrong change when its dependency data is incomplete.',situation:'A small shared-library change supports billing. Both fictional reviewers call it low risk.',conditions:{baseline:'Billing dependency identified',omitted:'Silently omit the billing relationship',incomplete:'Detect an incomplete mapping'},controls:['AI-01','AI-05','AI-07','AI-15'],tests:[['Design','Inspect dependency sources, ownership, refresh triggers and treatment of unknown impact.'],['Implementation','Omit a known consumer and separately create a dangling mapping. Compare the gate result with an independently established dependency.'],['Operation over time','Validate critical consumers against independent build or service relationships and inspect mapping changes and unresolved scope exceptions.']]},
 policy:{title:'Who can change the approval rules?',lesson:'Separate reviewers do not protect a boundary that a contributor or infrastructure administrator can weaken.',situation:'An infrastructure operator attempts to downgrade the financial eligibility policy.',conditions:{baseline:'Independent administration enforced',weakened:'Give the operator control of the gate environment'},controls:['AI-02','AI-03','AI-04','AI-15'],tests:[['Design','Map effective policy, runtime, credential and bypass privileges, including inherited access.'],['Implementation','Attempt a policy downgrade using an operator identity in an authorized test environment; retain both the denied attempt and its audit trail.'],['Operation over time','Reconcile privileged grants and policy/runtime changes to independent approvals; investigate changes outside the governed route.']]},
 population:{title:'Monitoring misses a deployment',lesson:'Matching records inside a feed cannot establish that every production route was captured.',situation:'The standard deployment feed appears healthy. An independent fictional source may show another release.',conditions:{baseline:'Sample records match',missing:'Reveal a deployment missing from the feed',unverified:'Remove independent source corroboration'},controls:['AI-11','AI-12'],tests:[['Design','Inventory normal, manual and emergency production routes and assess the independence and coverage of source records.'],['Implementation','Compare the feed with the independent source; retain the unmatched deployment and investigate its authorization and collection history.'],['Operation over time','Validate period boundaries, filters, pagination, deduplication and retained reconciliation exceptions. Matching samples do not establish period completeness.']]}
};
function evaluate(id,condition='baseline'){
 if(!Object.hasOwn(definitions,id))throw new TypeError('Unknown worked example');
 const d=definitions[id];if(!Object.hasOwn(d.conditions,condition))throw new TypeError('Unknown example condition');
 let record,decision,why,next,assessment,fields;
 if(id==='standard'){
  const change=F.makeChange('docs',{sha:condition==='stale'?'demo-revision-B':'demo-revision-A',ci:condition!=='failed'});
  const reviewedSha='demo-revision-A',technical=F.assessTechnicalEligibility(change),scope=F.assessFinancialImpact(change);
  // Example-adapter guard only: simulate review/SHA binding before the shared authorization resolver.\n  // This does NOT demonstrate that assessTechnicalEligibility itself enforces reviewed SHA.
  if(change.sha!==reviewedSha){technical.eligible=false;technical.reasons.push('Review evidence belongs to revision A; revision B requires fresh review.');}
  const authorization=F.resolveAuthorization(technical,scope,change,null);
  record={notice:'Fictional sample; no approval issued',revisionGuardSource:'worked-example adapter; not the shared eligibility evaluator',change,reviewedSha,technical,scope,authorization,release:'Not evaluated'};
  decision=authorization.allowed?'Automated route eligible':'Automated route blocked';why=authorization.reason;
  next=authorization.allowed?'Verify protected authorization and merge enforcement, then build and release requirements.':'Correct the failed condition and obtain current checks and authorization before merge.';
  assessment='Modeled decision only. No real approval, merge, deployment or operating effectiveness has been established.';
  fields=[['Current revision',change.sha],['Reviewed revision',reviewedSha],['Required CI',change.ci?'Passed in sample':'Failed in sample'],['Authorization route',authorization.route]];
 }else if(id==='dependency'){
  const x=A.evaluate(condition==='baseline'?'known':condition);record=x.event;
  decision=x.unsafe?'Unsafe automated eligibility':x.mappedImpact.status==='UNRESOLVED'?'Impact unresolved':'Human approval required';why=x.summary;
  next=x.unsafe?'Investigate the missing dependency and affected eligibility decisions; determine whether to suspend the affected route.':'Resolve scope and obtain qualified human authorization; mandatory checks still apply.';
  assessment=x.unsafe?'The fictional reference dependency contradicts the supplied map. This example exposes a coverage gap; it does not invent a successful detector.':'The modeled gate withholds the automated route. Real dependency completeness, enforcement and human authorization remain unverified.';
  fields=[['Revision',x.event.source_revision],['Reviewers','Low / Low (simulated)'],['Mapping version',x.event.mapping_version],['Policy route',x.authorization.route]];
 }else if(id==='policy'){
  const independent=condition!=='weakened',attempt=F.attemptPolicyChange('infrastructure-operator',independent);
  record={notice:'Fictional permission model; no policy edited',actor:'infrastructure-operator',independentAdministration:independent,attempt};
  decision=attempt.allowed?'Policy bypass possible':'Policy change denied';why=attempt.message;
  next=attempt.allowed?'Contain the incompatible privilege and assess policy integrity and affected decisions.':'Use the separately authorized policy-change process; corroborate the effective access model.';
  assessment=attempt.allowed?'The example demonstrates incompatible administrative authority, not an observed production bypass.':'A denial in this model does not prove effective permissions across the real gate, credentials and runtime.';
  fields=[['Actor',record.actor],['Administrative separation',independent?'Assumed enforced':'Weakened in sample'],['Attempted change','Financial policy downgrade'],['Real policy change','None']];
 }else{
  const x=P.simulate(null,condition==='baseline'?'matched':condition);record=x;
  decision=x.comparisonStatus==='MISSING_FEED'?'Deployment missing from feed':x.comparison?'Sample records match':'Population not assessed';
  why=x.comparisonStatus==='MISSING_FEED'?'An independent fictional release is absent from the monitoring feed. This does not by itself establish an unauthorized deployment.':x.comparison?'The supplied sample records reconcile; overall production coverage remains unresolved.':'No independent source population is available.';
  next=x.action;assessment='Population completeness remains unresolved in every condition. These invented samples cannot substantiate a real period or all production routes.';
  fields=[['Independent sample',x.comparison?String(x.comparison.sourceCount):'Not established'],['Feed sample',x.comparison?String(x.comparison.feedCount):'Not assessed'],['Comparison',x.comparisonStatus],['Population conclusion',x.populationConclusion]];
 }
 return {id,condition,...d,decision,why,next,assessment,fields,record,simulation:true,implementationStatus:'Not assessed',releaseStatus:'Not evaluated'};
}
const api={definitions,evaluate};if(node)module.exports=api;else root.WorkedExamples=api;
})(typeof globalThis!=='undefined'?globalThis:this);
