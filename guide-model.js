/* One replayable fictional case per scenario. Navigation is not an evaluator input. */
(function(root){
'use strict';
const F=typeof module!=='undefined'&&module.exports?require('./financial-engine'):root.FinancialDemo;
const scenarios={
  "happy": {
    "label": "Happy path",
    "source": "docs",
    "reviewB": "low",
    "summary": "A documentation correction has no protected dependencies in the example registry."
  },
  "protected": {
    "label": "Protected dependency",
    "source": "shared",
    "reviewB": "low",
    "summary": "Both AI reviews say LOW, but the shared library supports billing. Protected scope takes priority."
  },
  "review": {
    "label": "AI review doesn’t qualify",
    "source": "docs",
    "reviewB": "high",
    "summary": "The second AI review does not meet policy. Auto-approval is unavailable; human review is required."
  }
};
const stages=[
  {
    "title": "Intake",
    "requirement": "Capture the current revision, author and repository; reconcile intake against the source.",
    "monitor": "Find missing or stale intake revisions.",
    "owner": "Workflow operations",
    "response": "Reconcile source and intake records; rerun checks for the current revision.",
    "evidence": "Source head SHA, intake record, timestamps and reconciliation result.",
    "test": "Compare source PRs with intake records and challenge a missing or stale revision.",
    "control": "Every change entering the workflow is identified and accounted for.",
    "rcmIds": [
      "AI-05",
      "AI-12",
      "AI-13"
    ],
    "libraryIds": [
      "D01",
      "X01"
    ]
  },
  {
    "title": "Protected scope",
    "requirement": "Resolve downstream dependencies and enforce protected-scope rules before auto-approval. Unknown scope cannot qualify.",
    "monitor": "Flag protected changes receiving automatic authorization.",
    "owner": "Policy owner",
    "response": "Suspend the affected automatic route, investigate the mapping and assess any releases.",
    "evidence": "Changed files, versioned dependency mapping, protected-scope rule and routing decision.",
    "test": "Use a protected downstream dependency and verify human approval is required even with two LOW reviews.",
    "control": "Protected changes require authorized human approval.",
    "rcmIds": [
      "AI-01",
      "AI-02"
    ],
    "libraryIds": [
      "G01",
      "D02"
    ]
  },
  {
    "title": "AI reviews",
    "requirement": "Retain both results for the exact revision, with model, prompt and policy identities. Neither reviewer grants release authority. Independently validate eligible classes, compare individual and combined misses, and reassess after model or prompt changes.",
    "monitor": "Find invalid review-backed automatic approvals; track severe false approvals, shared misses and model/configuration changes.",
    "owner": "AI review operations",
    "response": "Suspend affected automation when severe false approvals, shared-miss or version-change triggers are met; investigate and revalidate before restart.",
    "evidence": "Two revision-bound review records, model/prompt versions and required test results.",
    "test": "Challenge one nonqualifying review and verify that agreement, identity and revision checks cannot be skipped.",
    "control": "Auto-approval requires both AI reviews to satisfy the approved policy.",
    "rcmIds": [
      "AI-03",
      "AI-04",
      "AI-11",
      "AI-14"
    ],
    "libraryIds": [
      "A01",
      "A03",
      "A04",
      "X02"
    ]
  },
  {
    "title": "Policy decision",
    "requirement": "Separate reviewer recommendations from approval authority. Protect policy administration and bind authorization to source and applicable versions.",
    "monitor": "Find unauthorized policy changes or approvals outside eligibility rules.",
    "owner": "Independent policy administrator",
    "response": "Revoke invalid authorization, contain the affected route and investigate privileged changes.",
    "evidence": "Authorization issuer, source revision, policy/mapping versions, administrative changes and human approval where required.",
    "test": "Inspect effective permissions and verify protected scope cannot be overridden by two LOW ratings.",
    "control": "Only authorized identities and approved policy can authorize a change.",
    "rcmIds": [
      "AI-05",
      "AI-06",
      "AI-07",
      "AI-16"
    ],
    "libraryIds": [
      "G01",
      "G02",
      "A02"
    ]
  },
  {
    "title": "Merge & build",
    "requirement": "Enforce current authorization and mandatory checks at merge; generate an identified artifact from the authorized source.",
    "monitor": "Reconcile merges and build provenance against current authorization.",
    "owner": "Build platform operations",
    "response": "Stop promotion of unmatched builds and investigate bypass paths.",
    "evidence": "Merge checks, authorization linkage, source SHA, trusted build identity and artifact digest.",
    "test": "Challenge stale authorization and a build from a different revision; verify the gate rejects each.",
    "control": "Builds trace to an authorized source revision.",
    "rcmIds": [
      "AI-08",
      "AI-09"
    ],
    "libraryIds": [
      "D03",
      "P01"
    ]
  },
  {
    "title": "Release gate",
    "requirement": "Verify the authorized source, trusted build, artifact digest and applicable release checks before promotion.",
    "monitor": "Find release attempts with missing or mismatched provenance.",
    "owner": "Release operations",
    "response": "Block promotion and investigate the mismatch; retain the rejection record.",
    "evidence": "Artifact digest, build provenance, release checks and deployment manifest.",
    "test": "Substitute an artifact or remove required provenance in a test environment and verify release is blocked.",
    "control": "Only the validated artifact can pass the release gate.",
    "rcmIds": [
      "AI-09",
      "AI-10"
    ],
    "libraryIds": [
      "P01",
      "P02"
    ]
  },
  {
    "title": "Production",
    "requirement": "Reconcile deployed artifacts across covered production routes. Define rollout thresholds and recovery ownership.",
    "monitor": "Find deployment mismatches, uncovered routes and rollout threshold breaches.",
    "owner": "Service owner / release operations",
    "response": "Contain the release, stop promotion or roll back as appropriate; verify recovery and retain incident records.",
    "evidence": "Deployment population, artifact identities, rollout metrics, alerts, responses and recovery records.",
    "test": "Corroborate the production population and test mismatch detection and response. Detection alone does not prove prevention.",
    "control": "Production changes are traceable and exceptions receive a documented response.",
    "rcmIds": [
      "AI-10",
      "AI-13",
      "AI-14",
      "AI-15"
    ],
    "libraryIds": [
      "P02",
      "P03",
      "X01",
      "X02"
    ]
  }
];
const ACTIONS=['REVIEW','AUTHORIZE','BUILD','RELEASE','DEPLOY','MONITOR'];
const MAX_FRAGMENT=12000;
const labels={REVIEW:'Run example reviews',AUTHORIZE:'Record policy authorization',BUILD:'Build authorized revision',RELEASE:'Pass release checks',DEPLOY:'Deploy example artifact',MONITOR:'Reconcile production evidence'};
function initial(scenario='happy'){if(!Object.hasOwn(scenarios,scenario))throw new TypeError('Unknown scenario. Choose one of the three examples.');return {schemaVersion:2,scenario,events:[]};}
function validate(c){
 if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).sort().join(',')!=='events,scenario,schemaVersion'||c.schemaVersion!==2||!Object.hasOwn(scenarios,c.scenario)||!Array.isArray(c.events)||c.events.length>ACTIONS.length||c.events.some((a,i)=>a!==ACTIONS[i]))throw new TypeError('Unsupported case or action sequence. No imported conclusion was accepted.');
 return c;
}
function transition(c,action){validate(c);if(ACTIONS[c.events.length]!==action)throw new Error('Complete the required preceding step first.');return {...c,events:[...c.events,action]};}
function evaluate(input){
 const c=validate(typeof input==='string'?initial(input):input),s=scenarios[c.scenario],count=c.events.length;
 const revision='demo-'+c.scenario+'-revision-A',change=F.makeChange(s.source,{sha:revision,reviewB:s.reviewB});
 const scope=F.assessFinancialImpact(change),automatic=scope.status==='ELIGIBLE'&&F.assessTechnicalEligibility(change).eligible;
 const policy=scope.policyVersion,mapping=scope.mappingVersion,author=change.author;
 const checks=count>=1?{recordId:'checks:'+revision,revision,ci:'PASS',reviewA:'LOW',reviewB:s.reviewB.toUpperCase(),modelA:'demo-model-A-1',modelB:'demo-model-B-1',promptVersion:'demo-prompt-1',configVersion:'demo-review-config-1'}:null;
 const route=count<1?'Awaiting review evidence':automatic?'Auto-approval eligible':'Human approval required';
 // All authorizations require identified, current checks. A HIGH AI result cannot be policy approval,
 // but a designated independent human can authorize after assessment; mandatory CI remains separate.
 const authorization=count>=2?{recordId:'authorization:'+revision,kind:automatic?'POLICY':'HUMAN',actor:automatic?'demo-policy-service':'demo-independent-reviewer',role:automatic?'policy-approver':scope.requiredRole||'change-reviewer',author,revision,policy,mapping,rationale:automatic?'Eligible example class and current qualifying checks.':'Independent assessment of scope and nonqualifying AI findings; mandatory tests passed.'}:null;
 if(authorization&&(!checks||checks.ci!=='PASS'||checks.revision!==revision||![revision,policy,mapping,author,authorization.actor,authorization.role].every(v=>typeof v==='string'&&v.trim())||authorization.actor===author))throw new Error('Invalid authorization evidence.');
 const build=count>=3?{recordId:'build:'+revision,revision,policy,mapping,authorizationId:authorization.recordId,digest:'demo-sha256:'+c.scenario+'-artifact-A',builder:'demo-trusted-builder'}:null;
 const releaseRecord=count>=4?{recordId:'release:'+revision,revision,digest:build.digest,buildId:build.recordId,authorizationId:authorization.recordId,policy,mapping,checks:'PASS'}:null;
 const deploymentRecord=count>=5?{recordId:'deployment:'+revision,revision,digest:build.digest,authorizationId:authorization.recordId,releaseId:releaseRecord.recordId,route:'standard',environment:'example-production'}:null;
 const reconciliation=count>=6?{recordId:'reconciliation:'+revision,deploymentId:deploymentRecord.recordId,revision,digest:build.digest,expectedCount:1,observedCount:1,unmatched:0,coverage:'One invented standard route only'}:null;
 const validation=checks?{recordId:'synthetic-validation:1',configVersion:checks.configVersion,eligibleCases:12,prohibitedCases:8,severeFalseApprovals:0,sharedMisses:0,notice:'Invented validation results for teaching; not real model-performance evidence.'}:null;
 const authorizationStatus=authorization?automatic?'Policy authorization recorded':'Human authorization recorded':count>=1?'Not yet authorized':'Awaiting checks';
 const release=count>=4?'Eligible within example':count>=3?'Awaiting release checks':count>=2?'Awaiting trusted build':count>=1?automatic?'Awaiting policy authorization':'Awaiting human approval':'Awaiting review evidence';
 return {id:c.scenario,label:s.label,summary:count>=1?s.summary:c.scenario==='protected'?'A shared library supports billing. Run the example reviews to inspect the decision.':c.scenario==='review'?'A documentation change enters review. One AI review will not meet the example policy.':'A documentation correction enters the example workflow.',revision,author,policy,mapping,scope:scope.status,automatic,route,checks,validation,authorization,authorizationStatus,build,releaseRecord,deploymentRecord,reconciliation,reviewA:checks?.reviewA||'Not run',reviewB:checks?.reviewB||'Not run',release,deployment:deploymentRecord?'Simulated deployment recorded':'Not deployed',monitoring:reconciliation?'Reconciled within example':deploymentRecord?'Reconciliation pending':'No deployment to reconcile',eventCount:count,nextAction:ACTIONS[count]||null,nextLabel:count===1&&!automatic?'Record independent human approval':labels[ACTIONS[count]]||null};
}
function monitor(stage,x,overrides={}){
 if(!Number.isInteger(stage)||stage<0||stage>=stages.length)throw new TypeError('Unknown monitoring stage');
 const s=stages[stage],data={sourceRevision:x.revision,intakeRevision:x.revision,automaticIssued:x.authorization?.kind==='POLICY',observedDigest:x.deploymentRecord?.digest||x.releaseRecord?.digest||x.build?.digest||null,severeFalseApprovals:x.validation?.severeFalseApprovals||0,sharedMisses:x.validation?.sharedMisses||0,configVersion:x.checks?.configVersion,validatedConfig:x.validation?.configVersion,...overrides};
 let rows=[],rule='',sources='',cadence='',pending=false,fail=false;
 const row=(field,value)=>rows.push([field,String(value??'Not recorded')]);
 if(stage===0){rule='Source and intake revisions must match; reconcile source population to intake.';sources='Source PR event and intake record';cadence='On each source update; periodic reconciliation';row('Source revision',data.sourceRevision);row('Intake revision',data.intakeRevision);fail=!data.sourceRevision||data.sourceRevision!==data.intakeRevision;}
 if(stage===1){rule='A protected dependency must never receive automatic authorization.';sources='Changed-file manifest, dependency mapping and authorization record';cadence='On each decision and mapping change';row('Protected dependency',x.scope==='REVIEW_REQUIRED');row('Automatic authorization issued',data.automaticIssued);row('Authorization',x.authorizationStatus);pending=!x.checks;fail=x.scope!=='ELIGIBLE'&&data.automaticIssued;}
 if(stage===2){rule='Automatic approvals require two current LOW reviews and the validated configuration. Illustrative suspension trigger: more than zero severe false approvals or shared misses, or a configuration mismatch. Revalidate before restart.';sources='Review records, authorization log and independently adjudicated validation set';cadence='Each decision; after reviewer changes; scheduled reassessment';row('Review A',x.reviewA);row('Review B',x.reviewB);row('Automatic authorization issued',data.automaticIssued);row('Current / validated config',`${data.configVersion||'Not run'} / ${data.validatedConfig||'Not supplied'}`);row('Severe false approvals / shared misses',`${data.severeFalseApprovals} / ${data.sharedMisses}`);row('Validation dataset',x.validation?'12 eligible + 8 prohibited invented cases':'Not supplied');pending=!x.checks;fail=!!x.checks&&((data.automaticIssued&&(x.reviewA!=='LOW'||x.reviewB!=='LOW'))||data.configVersion!==data.validatedConfig||data.severeFalseApprovals>0||data.sharedMisses>0);}
 if(stage===3){rule='Authorization must identify the issuer, current revision and applicable versions; human reviewer must be independent of the author.';sources='Authorization record, role model and administrative audit trail';cadence='Each authorization; each administrative change';row('Author',x.author);row('Issuer',x.authorization?.actor);row('Approval kind',x.authorization?.kind);row('Bound revision',x.authorization?.revision);row('Policy / mapping',x.policy+' / '+x.mapping);pending=!x.authorization;fail=!!x.authorization&&(x.authorization.actor===x.author||x.authorization.revision!==x.revision);}
 if(stage===4){rule='Trusted build must identify the currently authorized source and artifact.';sources='Merge authorization and build provenance';cadence='Each merge and build';row('Authorized revision',x.authorization?.revision);row('Build revision',x.build?.revision);row('Build record',x.build?.recordId);row('Artifact',x.build?.digest);pending=!x.build;fail=!!x.build&&(x.build.revision!==x.authorization?.revision||!x.build.digest);}
 if(stage===5){rule='Release manifest must match the authorized build digest and passing release checks.';sources='Trusted build, release-check record and release manifest';cadence='Each promotion attempt';row('Trusted build digest',x.build?.digest);row('Observed artifact digest',data.observedDigest);row('Release checks',x.releaseRecord?.checks);row('Release record',x.releaseRecord?.recordId);pending=!x.releaseRecord;fail=!!x.releaseRecord&&(data.observedDigest!==x.build?.digest||x.releaseRecord.checks!=='PASS');}
 if(stage===6){rule='Reconcile production deployments to authorized release records and investigate unmatched items.';sources='Independent production observation, release manifest and authorization log';cadence='Each deployment; reporting-period reconciliation';row('Deployed revision',x.deploymentRecord?.revision);row('Deployed artifact',data.observedDigest);row('Expected artifact',x.build?.digest);row('Reconciled population',x.reconciliation?'1 expected / 1 observed / 0 unmatched':'Not reconciled');row('Coverage','One invented standard route only');pending=!x.reconciliation;fail=!!x.deploymentRecord&&data.observedDigest!==x.build?.digest;}
 const status=fail?'EXCEPTION':pending?'PENDING':'MATCHED';
 return {status,rule,sources,cadence,rows,owner:s.owner,response:s.response,evidence:s.evidence,limitation:'A matched fictional sample does not prove prevention, actual model reliability, complete route coverage or operating effectiveness.',result:fail?'Investigate the mismatch and retain the disposition.':pending?'Required records are not available yet. Advance the example to produce them.':stage===2?'Example rule matched. The tiny invented validation set establishes no real reviewer reliability.':'Example records match the rule within the stated scope.'};
}
function encode(c){validate(c);return '#guide='+encodeURIComponent(JSON.stringify(c));}
function decode(hash){
 if(typeof hash!=='string'||hash.length>MAX_FRAGMENT||!hash.startsWith('#guide='))throw new TypeError('Invalid case link');
 let c;try{c=JSON.parse(decodeURIComponent(hash.slice(7)));}catch{throw new TypeError('Malformed case link. No imported conclusion was accepted.');}
 validate(c);return {schemaVersion:2,scenario:c.scenario,events:[...c.events]};
}
function selection(search){const p=new URLSearchParams(search),scenario=p.get('scenario')||'happy';initial(scenario);const raw=p.get('step')??p.get('stage')??'0';if(!/^[0-6]$/.test(raw))throw new TypeError('Invalid pipeline stage.');return {scenario,stage:Number(raw)};}
const api={scenarios,stages,ACTIONS,initial,transition,evaluate,monitor,encode,decode,selection,MAX_FRAGMENT};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GuideModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
