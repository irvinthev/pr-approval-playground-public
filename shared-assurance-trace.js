/* Risk-first, one-change assurance walk-through. View-only projection of SharedCase.
   The ONLY authorization/release decisions come from case-model.js evaluateCase().
   Fictional and editable: never evidence of a deployed control. */
(function(root){
'use strict';
const definitions=[
 {id:'eligibility',title:'Change Eligibility & Impact',kind:'Preventive + human judgment',
  risk:'A change to the shared deduplication library may affect usage aggregation, invoices and reporting even when the diff looks small.',
  safeguard:'Use a versioned downstream dependency map and deterministic eligibility exclusions; unknown impact must not be treated as low risk.',
  evidence:'Authoritative service ownership and dependency lineage; representative wrong-map and missing-map negative tests; policy and mapping versions.',
  conclusion:'Mapped financial impact establishes a human-review requirement in this fictional registry; it does not verify mapping completeness.'},
 {id:'classification',title:'AI Classification & Validation',kind:'Preventive support + independent validation',
  risk:'Both AI reviewers can return LOW while overlooking the same consequential downstream behavior.',
  safeguard:'Validate false-low-risk decisions against independently labeled unsafe and safe cases before delegating approval authority.',
  evidence:'Independently adjudicated PR sample, false-low-risk analysis by impact, hard counterexamples, and revalidation after model/input changes.',
  conclusion:'A simulated LOW verdict is only a test input, not evidence of model accuracy or authority to approve.'},
 {id:'authority',title:'Approval Authority & Independence',kind:'Preventive + qualified human judgment',
  risk:'Two LOW model verdicts may be mistaken for authorization and replace a required independent domain review.',
  safeguard:'Keep scope-based human authorization separate from classification; bind qualified approval to revision and applicable versions.',
  evidence:'Effective GitHub rulesets/CODEOWNERS, actor permissions, independent approval record and failed bypass tests.',
  conclusion:'Only a current qualified reviewer authorization can satisfy the modeled financial-review predicate.'},
 {id:'policy',title:'Policy & Configuration Governance',kind:'Preventive change governance + detective monitoring',
  risk:'A policy, prompt, mapping or required-check change can enlarge the set of PRs that bots may authorize.',
  safeguard:'Protect effective policy versions from self-relaxation; authorize configuration changes independently and re-evaluate stale approvals.',
  evidence:'Base-policy enforcement, administrative separation, version/change event history and self-downgrade tests.',
  conclusion:'The evaluator detects a stale approval when policy/mapping identity changes; it does NOT test administrator protection or self-relaxation.'},
 {id:'security',title:'Security & Agent Trust Boundaries',kind:'Preventive security controls',
  risk:'Untrusted PR text or excessive bot permissions could influence the AI or invoke a privileged GitHub operation.',
  safeguard:'Treat PR content as untrusted, minimize token scope, separate model judgment from privileged actions and test attack paths.',
  evidence:'Security threat model, prompt-injection tests, effective token/GitHub App scopes, secret handling and independent bypass prevention.',
  conclusion:'NOT MODELED: no LLM inference, prompt-injection defense, live identities, privilege enforcement or vendor data processing occurs.'},
 {id:'testing',title:'Testing & Deployment Integrity',kind:'Preventive + release verification',
  risk:'A revision could merge with incomplete mandatory tests or deploy a different artifact from the one reviewed.',
  safeguard:'Use required CI on exact revision, approved independent authorization, build provenance and same-artifact release validation.',
  evidence:'Approved test baseline, required GitHub checks, failed/skipped-case runs, immutable artifact provenance and deployed digest trace.',
  conclusion:'The simulator checks modeled CI/build/release identifiers; it does NOT verify real Buildkite, GitHub or production enforcement.'},
 {id:'monitoring',title:'Monitoring, Response & Accountability',kind:'Detective + management response',
  risk:'A bypass or deployment outside the monitored population can escape detection; missing logs can be mistaken for compliant changes.',
  safeguard:'Reconcile an independently sourced merged/deployed population to authorizations, detect uncovered routes, and assign stop/recovery ownership.',
  evidence:'Independent merge/deployment inventory, near-real-time exception alerts, log-integrity checks, shutdown drill and accountable owner.',
  conclusion:'The demo can expose a known uncovered route or mark simulated corroboration; it cannot prove a complete real-world population.'}
];
const presets=[
 {id:'baseline',label:'Start · shared-library change',events:[]},
 {id:'low',label:'Two AI LOW verdicts',events:['CHECKS']},
 {id:'approved',label:'Human-approved release',events:['CHECKS','APPROVE','BUILD','RELEASE_CHECKS','DEPLOY']},
 {id:'exception',label:'Missing dependency map',events:['MAP_MISSING']}
];
const disturbances=[
 {id:'map',label:'Lose dependency evidence',action:'MAP_MISSING'},
 {id:'policy',label:'Change policy version',action:'POLICY_CHANGE'},
 {id:'revision',label:'Push an unreviewed revision',action:'PUSH'},
 {id:'route',label:'Observe an uncovered deployment',action:'UNCOVERED_ROUTE'}
];
function predicate(x,id){return x.predicates.find(p=>p.id===id)||null;}
function releasePredicate(x,id){return x.releasePredicates.find(p=>p.id===id)||null;}
function observation(id,c,x){
 const p=predicate(x,'mapping'),auth=x.authorizationStatus,ci=predicate(x,'ci'),a=predicate(x,'reviewA'),b=predicate(x,'reviewB');
 switch(id){
  case 'eligibility':return {
    state:x.dependencyAssessment.status==='UNRESOLVED'?'UNRESOLVED':'HUMAN REVIEW REQUIRED',
    detail:x.dependencyAssessment.status==='UNRESOLVED'?'Dependency mapping is unresolved; the change cannot qualify for automated approval.':'The modeled path reaches '+x.dependencyAssessment.components.join(' → ')+'. The financial reviewer requirement is '+x.dependencyAssessment.requiredRole+'.',
    records:['Mapping '+x.mappingVersion,p&&p.reason]};
  case 'classification':return {
    state:a.status==='PASS'&&b.status==='PASS'?'TWO LOW · NOT VALIDATED':'NOT YET MEASURED',
    detail:'Review A: '+a.status+'; Review B: '+b.status+'. Neither a PASS nor model agreement measures the false-low-risk rate.',
    records:['Model review records: '+(c.technical.reviewA?.recordId||'missing')+', '+(c.technical.reviewB?.recordId||'missing')]};
  case 'authority':return {
    state:auth==='VALID'?'HUMAN AUTHORIZED':auth==='REQUIRED'?'HUMAN APPROVAL REQUIRED':auth,
    detail:'Authorization: '+auth+'. '+(c.authorizations.length?'Last recorded approver: '+String(c.authorizations.at(-1).actor)+'.':'No qualified approval record yet.'),
    records:['Authorization record '+(c.authorizations.at(-1)?.recordId||'missing'), 'Policy '+x.policyVersion+'; mapping '+x.mappingVersion]};
  case 'policy':{
    const stale=auth==='STALE';
    return {state:stale?'STALE · REVALIDATE':'GOVERNANCE UNVERIFIED',
      detail:stale?'A prior human approval is invalid for the current revision/policy/mapping version.':'Applicable policy '+x.policyVersion+' and map '+x.mappingVersion+' are identified, but enforcement and independent administration are not demonstrated.',
      records:['Policy '+x.policyVersion,'Mapping '+x.mappingVersion,'Self-policy-change protection NOT MODELED']};}
  case 'security':return {
    state:'NOT MODELED',detail:'The case engine does not parse untrusted PR instructions, call an LLM or execute privileged GitHub actions.',
    records:['Security threat-model evidence not simulated','GitHub App/token permissions not simulated']};
  case 'testing':return {
    state:x.releaseEligibility==='ELIGIBLE'?'ELIGIBLE IN SIMULATION':x.releaseEligibility==='BLOCKED'?'BLOCKED':'PENDING',
    detail:'CI: '+ci.status+'; source→artifact: '+releasePredicate(x,'artifact-lineage').status+'; release checks: '+releasePredicate(x,'release-checks').status+'. Modeled release eligibility: '+x.releaseEligibility+'.',
    records:['CI '+(c.technical.ci?.recordId||'missing'),'Build '+(c.build?.recordId||'missing'),'Release '+(c.release?.recordId||'missing')]};
  case 'monitoring':return {
    state:x.monitoringFindings.length?'EXCEPTION / EVIDENCE GAP':x.evidenceCompleteness==='COMPLETE_IN_MODELED_SCOPE'?'COMPLETE ONLY IN SIMULATION':'EVIDENCE INCOMPLETE',
    detail:'Monitoring findings: '+x.monitoringFindings.length+'. Evidence gaps: '+x.evidenceGaps.length+'. Corroborated (simulated): '+String(c.evidence.populationCorroborated)+'.',
    records:[...x.monitoringFindings.map(f=>f.detail).slice(0,3),...x.evidenceGaps.slice(0,2)]};
 }
 throw new TypeError('Unknown risk domain');
}
function project(c,C){
 const x=C.evaluateCase(c);
 return {evaluation:x,steps:definitions.map(d=>({...d,...observation(d.id,c,x)})),summary:{
   route:x.dependencyAssessment.status==='UNRESOLVED'?'DEPENDENCY UNRESOLVED':x.authorizationStatus==='VALID'?'QUALIFIED HUMAN AUTHORIZATION':x.authorizationStatus==='STALE'?'STALE HUMAN APPROVAL':'HUMAN APPROVAL REQUIRED',
   authorization:x.authorizationStatus,release:x.releaseEligibility,evidence:x.evidenceCompleteness,
   caveat:'For this shared-library change, LOW AI scores never substitute for qualified independent authorization.'
 }};
}
const api={definitions,presets,disturbances,project};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
else root.SharedAssuranceTrace=api;
if(typeof document==='undefined'||!root.SharedCase)return;
const C=root.SharedCase;
const host=document.getElementById('shared-change-trace');
if(!host)return;
const $=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;};
let current=C.initial(),error='';
function readHash(){
 if(location.hash.startsWith('#case=')){try{current=C.decode(location.hash);error='';}catch(e){error='Invalid case link: '+e.message;}}
 else {current=C.initial();error='';}
 draw();
}
function publish(next){
 current=next;error='';
 const u=new URL(location.href);u.hash=C.encode(next);
 history.replaceState(null,'',u);
 // case-ui.js uses hashchange to hydrate the SAME editable case on this chapter.
 root.dispatchEvent(new Event('hashchange'));
 draw();
}
function applyPreset(p){
 try{publish(C.replay(p.events));}catch(e){error=e.message;draw();}
}
function applyAction(action){
 try{publish(C.transition(current,action));}catch(e){error=e.message;draw();}
}
const actionsText={CHECKS:'Run CI + two LOW reviews',APPROVE:'Record qualified independent review',BUILD:'Build current artifact',RELEASE_CHECKS:'Validate artifact for release',DEPLOY:'Deploy validated artifact',MAP_RESTORE:'Restore dependency map'};
function draw(){
 host.replaceChildren();
 host.append($('p','trace-kicker','ONE FICTIONAL CHANGE · SHARED LIBRARY → USAGE → BILLING → REPORTING'));
 const h=$('h2',null,'Follow the change through seven risk domains');h.id='shared-trace-heading';host.append(h);
 host.append($('p','trace-intro','Select a checkpoint or inject a failure. All results are recomputed from the existing shared-case evaluator; this view adds no alternative authorization logic. Stage statuses are demonstrations, not assertions that real controls work.'));
 if(error){host.append($('p','trace-error',error));const b=$('button','trace-button','Reset invalid case');b.type='button';b.addEventListener('click',()=>applyPreset(presets[0]));host.append(b);return;}
 const p=project(current,C);
 const selectors=$('div','trace-presets');selectors.setAttribute('role','group');selectors.setAttribute('aria-label','Case checkpoints');
 for(const preset of presets){const b=$('button','trace-button',preset.label);b.type='button';b.setAttribute('aria-pressed',String(JSON.stringify(current.events)===JSON.stringify(preset.events)));b.addEventListener('click',()=>applyPreset(preset));selectors.append(b);}host.append(selectors);
 const meta=$('div','trace-meta');
 for(const [label,val] of [['Revision',p.evaluation.evaluatedRevision],['Mapping version',p.evaluation.mappingVersion],['Policy version',p.evaluation.policyVersion],['Route',p.summary.route],['Release',p.summary.release],['Evidence',p.summary.evidence]]){const card=$('div');card.append($('span',null,label),$('strong',null,val));meta.append(card);}host.append(meta);
 host.append($('p','trace-core','DECISION BOUNDARY · '+p.summary.caveat));
 const next=$('div','trace-controls');next.append($('h3',null,'Advance this same change'));
 const advance=$('div','trace-actions');for(const action of p.evaluation.nextValidActions){const b=$('button','trace-button',actionsText[action]||action);b.type='button';b.addEventListener('click',()=>applyAction(action));advance.append(b);}
 if(!p.evaluation.nextValidActions.length)advance.append($('p','trace-small','No additional authorized next action is modeled. Inspect failures or reset to another checkpoint.'));
 next.append(advance);
 const injections=$('details','trace-inject');injections.append($('summary',null,'Challenge this change · introduce a failure'));
 const injectionActions=$('div','trace-actions');
 for(const d of disturbances){const b=$('button','trace-button trace-failure',d.label);b.type='button';b.addEventListener('click',()=>applyAction(d.action));injectionActions.append(b);}
 injections.append(injectionActions,$('p','trace-small','A failure is recorded against the current case; it is not a fabricated live attack. Missing or false-omitted dependencies are different: this trace models detected incompleteness, not false completeness.'));
 next.append(injections);host.append(next);
 const grid=$('div','trace-grid');
 for(const [i,d]of p.steps.entries()){
   const card=$('article','trace-domain');card.id='trace-domain-'+(i+1);
   const top=$('div','trace-domain-top');top.append($('span','trace-step',String(i+1).padStart(2,'0')),$('h3',null,d.title));
   card.append(top,$('p','trace-status',d.state),$('p','trace-kind',d.kind));
   const content=$('dl','trace-fields');
   for(const [label,value]of [['Underlying risk',d.risk],['Expected safeguard',d.safeguard],['Modeled observation',d.detail],['Evidence a real reviewer would need',d.evidence],['Assurance conclusion',d.conclusion]]){const item=$('div');item.append($('dt',null,label),$('dd',null,value));content.append(item);}
   const notes=$('details','trace-records');notes.append($('summary',null,'Inspect simulated record references'));
   const list=$('ul');for(const r of d.records)if(r)list.append($('li',null,r));notes.append(list);
   card.append(content,notes);grid.append(card);
 }
 host.append(grid);
 const caution=$('div','trace-boundary');caution.append($('strong',null,'What the demonstration can and cannot conclude'),$('p',null,'It can reproduce deterministic expected outcomes for the modeled SHA, mapping, policy, approval and release records. It cannot establish input-map completeness, model accuracy, prompt-injection resistance, GitHub enforcement, live evidence authenticity or actual control operation. A known uncovered route is an evidence exception, not automatic proof of an unauthorized change.'));
 const labLink=$('a',null,'Try the separate false-omission challenge in Auditor View →');labLink.href='./auditor-view.html#billing-challenge-lab';caution.append(labLink);host.append(caution);
 const links=$('nav','trace-links');links.setAttribute('aria-label','Use this same editable case across chapters');
 for(const [p,label]of [['experience.html','Pipeline'],['continuous-monitoring.html','Monitoring'],['independent-assurance.html','Assurance']]){
   const a=$('a',null,label+' ↗');a.href='./'+p+C.encode(current);links.append(a);
 }host.append(links);
}
root.addEventListener('hashchange',readHash);
readHash();
})(typeof globalThis!=='undefined'?globalThis:this);
