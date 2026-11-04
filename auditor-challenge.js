/* Fictional control-validation lab. Reuses the same financial-engine functions as SharedCase.
 * This models decisions only: no GitHub enforcement, evidence collection, or real authorization. */
(function(root){
'use strict';
const F=(typeof module!=='undefined'&&module.exports)?require('./financial-engine'):root.FinancialDemo;
const copy=value=>JSON.parse(JSON.stringify(value));
const keys=['known','omitted','incomplete','split'];
const scenarios={
 known:{title:'Known financial dependency',description:'Both AI reviewers say low risk. The dependency map correctly traces the shared library to billing.',change:'No mapping change; expected baseline.',expected:'Automatic approval stays blocked and a qualified human review is required.'},
 omitted:{title:'Undetected mapping omission',description:'Both AI reviewers say low risk. The supplied mapping falsely shows that the shared library has no downstream consumers.',change:'Remove the usage consumer without marking the mapping as incomplete.',expected:'The modeled gate can incorrectly admit the change. A missed dependency is a real design vulnerability in this example.'},
 incomplete:{title:'Incomplete mapping detected',description:'Both AI reviewers say low risk. A required usage dependency entry is absent, and the mapper detects it.',change:'Remove the usage node, leaving a dangling dependency reference.',expected:'Unknown impact must prevent automatic approval and require investigation.'},
 split:{title:'AI reviewer disagreement',description:'The mapping correctly identifies billing, but one reviewer reports a higher-risk verdict.',change:'Set reviewer B to HIGH_RISK while reviewer A reports LOW_RISK.',expected:'Automatic approval remains blocked; route to human review through an authorized process.'}
};
function yaml(value){return JSON.stringify(value);}
function evaluate(key){
 if(!Object.prototype.hasOwnProperty.call(scenarios,key))throw new TypeError('Unknown fictional challenge');
 const scenario=scenarios[key];
 const map=copy(F.registry);
 map.version=key==='known'||key==='split'?'demo-map-1':'demo-map-'+(key==='omitted'?'unverified-2':'missing-2');
 if(key==='omitted'){map.nodes.dedup.consumers=[];map.nodes.dedup.financial=false;} // Fictional registry falsely marks the orphan library nonfinancial.
 if(key==='incomplete')delete map.nodes.usage;
 const change=F.makeChange('shared',{sha:'fictional-revision-A',author:'fictional-contributor',repoAllowlisted:true,ci:true,reviewA:'low',reviewB:key==='split'?'high':'low'});
 // Ground truth is separate from the supplied, potentially incomplete mapping.
 const referenceImpact=F.assessFinancialImpact(change,F.registry);
 const mappedImpact=F.assessFinancialImpact(change,map);
 const technical=F.assessTechnicalEligibility(change);
 const authorization=F.resolveAuthorization(technical,mappedImpact,change,null);
 const automaticEligible=authorization.allowed&&authorization.route==='AUTOMATION_ELIGIBLE';
 const knownProtected=!!referenceImpact.requiredRole;
 const unsafe=automaticEligible&&knownProtected;
 const outcome=unsafe?'UNSAFE_AUTOMATIC_ELIGIBILITY':mappedImpact.status==='UNRESOLVED'?'UNKNOWN_IMPACT_BLOCK':key==='split'?'REVIEWER_DISAGREEMENT_BLOCK':'HUMAN_REVIEW_REQUIRED';
 const definitions={
  UNSAFE_AUTOMATIC_ELIGIBILITY:'Control gap illustrated: the omitted relationship is not detected and the common evaluator permits the automatic route.',
  UNKNOWN_IMPACT_BLOCK:'Unknown impact blocks the automatic route. A reviewer must resolve the incomplete mapping.',
  REVIEWER_DISAGREEMENT_BLOCK:'Different AI verdicts fail the modeled technical eligibility check. A qualified human route is required before approval.',
  HUMAN_REVIEW_REQUIRED:'The dependency map identifies a protected financial consumer, so the automatic route is not authorized.'
 };
 const event={
  record_type:'FICTIONAL_MODEL_EVALUATION',run_id:'LAB-'+key.toUpperCase(),reference_case:'shared-library',test_oracle:'Independent fictional reference registry (not observed production evidence)',
  source_revision:change.sha,policy_version:map.policyVersion,mapping_version:map.version,
  changed_files:change.files,reviewers:{reviewer_a:'LOW_RISK',reviewer_b:key==='split'?'HIGH_RISK':'LOW_RISK'},
  supplied_mapping:{status:mappedImpact.status,components:mappedImpact.components,unknown:mappedImpact.unknown,required_role:mappedImpact.requiredRole},
  technical_eligibility:{eligible:technical.eligible,reasons:technical.reasons},
  policy_authorization:{route:authorization.route,allowed:authorization.allowed,reason:authorization.reason},
  evaluation:{outcome,unsafe_automatic_eligibility:unsafe},
  production_deployment:'NOT_EVALUATED',
  note:'Synthesized in browser; not a CI, GitHub or model event.'
 };
 const code={
  policy:'# Illustrative policy intent (not parsed by this evaluator)\npolicy_id: fictional-auto-approval\nversion: '+map.policyVersion+'\nrepo_allowlist:\n  - demo/shared-components\nreviewers:\n  required: [quality_bot, risk_bot]\n  both_must_be: LOW_RISK\nunknown_impact: HUMAN_REVIEW\nprotected_financial_dependency: HUMAN_REVIEW\nmissing_required_check: BLOCK\nrevision_binding: required\n',
  mapping:'# Supplied illustrative mapping used by the evaluator\nversion: '+map.version+'\ncomponents:\n  dedup:\n    paths: [lib/dedup/]\n    consumers: '+yaml(map.nodes.dedup.consumers)+'\n    financial: false\n'+(map.nodes.usage?'  usage:\n    paths: [services/usage/]\n    consumers: '+yaml(map.nodes.usage.consumers)+'\n':'  # usage: MISSING\n')+'  billing:\n    paths: [services/billing/]\n    consumers: [reporting]\n    financial: true\n',
  ruleset:JSON.stringify({description:'Illustrative GitHub-like ruleset; not queried or evaluated',enforcement:'active',target:'branch',include:['refs/heads/main'],required_status_checks:['test','policy-gate'],bypass_actors:[],notes:['Must verify effective settings in GitHub','This lab does not execute or validate these GitHub settings']},null,2),
  workflow:'# Illustrative GitHub Actions scaffold; not executed\nname: PR approval (example)\non: [pull_request]\npermissions:\n  contents: read\n  pull-requests: read\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test\n  policy-gate:\n    needs: [test]\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "Placeholder: call an independently governed gate"\n# A real gate must evaluate trusted current PR inputs and fail closed.\n# GitHub branch rules must require the actual gate check; not modeled.\n',
  event:JSON.stringify(event,null,2)
 };
 const corroboration=[
 {name:'Dependency inventory completeness',source:'Service ownership and dependency inventory',reported:key==='omitted'?'Supplied map says nonfinancial; fictional oracle contradicts it':mappedImpact.status,verification:'Independently trace shared-library consumers and validate mapping versions against service owners.',status:key==='omitted'?'CONTRADICTED':'NOT_VERIFIED'},
 {name:'AI classification evidence',source:'Reviewer service outputs',reported:key==='split'?'Low / High':'Low / Low',verification:'Inspect source inputs, independent labels, prompt/model versions, and correlated failure tests.',status:'NOT_VERIFIED'},
 {name:'Effective authorization',source:'Policy engine and GitHub controls',reported:authorization.route,verification:'Corroborate current SHA, policy version, bot rights, required status checks, bypass paths and administrator independence.',status:'NOT_VERIFIED'},
 {name:'Deployment integrity',source:'Build and deployment systems',reported:'Not evaluated',verification:'Trace approved source to build digest, release authorization and production deployment population.',status:'NOT_EVALUATED'}
 ];
 const controls=key==='split'?['AI-05','AI-06','AI-07']:['AI-01','AI-03','AI-07','AI-08'];
 const unanswered=unsafe?['The map was treated as complete although its downstream consumers were omitted.','Additional evidence could identify the real dependency, but no such safeguard is modeled here.']:['The modeled outcome is not corroborated against effective GitHub or CI/CD enforcement.','One demonstration does not establish completeness or period-long operation.'];
 return {key,scenario,referenceImpact,mappedImpact,technical,authorization,automaticEligible,unsafe,outcome,summary:definitions[outcome],event,code,corroboration,controls,unanswered};
}
const api={scenarios,keys,evaluate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
else root.AuditorChallenge=api;
})(typeof globalThis!=='undefined'?globalThis:this);
