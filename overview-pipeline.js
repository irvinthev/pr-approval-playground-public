/* Seven-stage overview, using the canonical reference-stage IDs and links.
   Navigation is descriptive only; no approval, release, or risk decision is executed. */
(function(root){
'use strict';
const M=root.SharedPipelineContext,doc=root.document;
if(!M||!doc)return;
const host=doc.getElementById('overview-pipeline');if(!host)return;
const examples=[
 {action:'A contributor opens or updates a PR. GitHub supplies the head SHA, changed files and author identity.',route:'Every new revision must be screened. The previous review or approval cannot silently carry forward.',risk:'An update escapes intake or inherits review evidence for an earlier SHA.',evidence:'PR events, author, repository, file diff, head SHA, event delivery and retry history.',verify:'Compare independent PR and commit activity to received screening events; push revision B and confirm reevaluation.',control:['AI-06','AI-12']},
 {action:'Repository/path allowlists, dependency mappings and required CI establish scope before AI review.',route:'Protected billing dependency or unknown impact → human review; failed mandatory checks → blocked; eligible changes can continue.',risk:'An omitted downstream financial consumer makes an unsafe shared-library change appear eligible.',evidence:'Effective eligibility rules, dependency-map version and provenance, exclusion reason, PR SHA and required CI checks.',verify:'Inject known billing, unmapped and protected paths; verify exclusions and independently examine map completeness.',control:['AI-01','AI-08','AI-15']},
 {action:'Two AI reviewers independently return structured assessments for the same exact SHA under recorded configurations.',route:'Both valid LOW outcomes may continue; split, invalid, missing or uncertain results → human route.',risk:'Correlated false-low classification or stale/malformed reviewer output appears reliable because two bots agree.',evidence:'Reviewer identities, response schemas, verdicts, model/prompt versions, SHA binding and validation results.',verify:'Challenge adversarial and indirect-dependency cases; compare false-low misses and stale-output behavior.',control:['AI-05','AI-06','AI-14']},
 {action:'A company-governed decision evaluates scope, SHA, reviewer results, required checks, effective policy and authorized issuer.',route:'Only a policy-authorized eligible revision continues automatically. Human authorization is a separate qualified route; failed mandatory gates remain blocked.',risk:'AI agreement is mistaken for authorization, or an old approval is reused on a new commit.',evidence:'Decision ID, policy/version, review and current SHAs, checks, issuer permissions, bypass and exception events.',verify:'Approve revision A, push B and attempt reuse; test unauthorized issuer and failed checks against actual enforcement.',control:['AI-03','AI-07','AI-09']},
 {action:'Protected-branch rules enforce checks/approvals for the current SHA; a trusted build produces an identifiable artifact.',route:'Merge proceeds only with enforced requirements; a modified revision or missing check cannot borrow prior approval.',risk:'Required checks are bypassed, or a build artifact cannot be traced to the approved source.',evidence:'Rulesets, required-check issuers, merge/queue event, source SHA, build provenance and artifact digest.',verify:'Attempt failed or impersonated checks; reconcile source approval and actual build provenance.',control:['AI-08','AI-10']},
 {action:'The release process validates artifact identity, required environment checks and deploy authority before promotion.',route:'Release eligibility is a separate decision from PR approval; failed gates or unknown artifacts stop promotion.',risk:'An approved source revision is replaced by a different artifact or skips pre-production validation.',evidence:'Release gate results, approved artifact digest, trusted provenance, promotion request and deploy permissions.',verify:'Attempt digest substitution and unauthorized promotion, including emergency or alternate paths.',control:['AI-10','AI-11']},
 {action:'An authorized promotion reaches production; telemetry tracks actual artifact/version, canary performance and recovery.',route:'A passing canary may continue rollout; a threshold breach stops or rolls back. Independent deployment coverage remains necessary.',risk:'The running artifact differs from the authorized change, or an unmonitored deployment/failed canary escapes detection.',evidence:'Production deployment population, runtime version/digest, actor/job, canary signals, incident and rollback records.',verify:'Reconcile production deployments to artifact digests and authorized SHAs; test an alternate route and canary failure.',control:['AI-11','AI-12','AI-13']}
];
let selected=M.stageFromLocation(root.location.search);if(selected===null)selected=0;
function make(tag,content,parent,cls){
 const el=doc.createElement(tag);if(content!==null)el.textContent=content;if(cls)el.className=cls;parent.appendChild(el);return el;
}
const stages=doc.getElementById('overview-stage-choices'),detail=doc.getElementById('overview-stage-detail');
const title=doc.getElementById('overview-stage-title'),counter=doc.getElementById('overview-stage-counter');
const progress=doc.getElementById('overview-stage-progress');
const labels=[['action','What happens'],['route','What determines the route'],['risk','What could go wrong'],['evidence','Management evidence expected'],['verify','How IA would challenge it']];
const slots=Object.fromEntries(labels.map(([key])=>[key,doc.getElementById('overview-'+key)]));
const links=doc.getElementById('overview-stage-links');
const prev=doc.getElementById('overview-prev'),next=doc.getElementById('overview-next');
function draw(){
 const stage=M.stages[selected],data=examples[selected];if(!stage||!data)return;
 title.textContent=stage.title;counter.textContent=String(selected+1).padStart(2,'0')+' / 07';progress.textContent='Stage '+(selected+1)+' of 7';
 for(const [key] of labels)slots[key].textContent=data[key];
 links.replaceChildren();
 for(const [lens,label] of [['risk','Risk assessment'],['engineering','Engineering'],['monitoring','Monitoring'],['assurance','Independent assurance']]){
  const a=make('a',label+' ↗',links);a.href=M.href(lens,selected);
 }
 const rcm=doc.getElementById('overview-rcm-links');rcm.replaceChildren();
 for(const id of data.control){const a=make('a',id,rcm);a.href='./rcm-view.html#control-'+id}
 [...stages.querySelectorAll('button')].forEach((b,i)=>{b.setAttribute('aria-current',i===selected?'step':'false');b.setAttribute('aria-pressed',String(i===selected))});
 prev.disabled=selected===0;next.disabled=selected===6;
}
function choose(i){
 if(!Number.isInteger(i)||i<0||i>=M.stages.length)return;
 selected=i;const u=new URL(root.location.href);u.searchParams.set('stage',String(i));root.history.replaceState(null,'',u);draw();
}
M.stages.forEach((stage,i)=>{
 const button=make('button',null,stages,'overview-stage-button');button.type='button';
 make('span',String(i+1).padStart(2,'0'),button,'overview-stage-number');
 make('span',stage.title,button,'overview-stage-name');
 button.addEventListener('click',()=>choose(i));
});
prev.addEventListener('click',()=>choose(selected-1));next.addEventListener('click',()=>choose(selected+1));
root.addEventListener('popstate',()=>{const stage=M.stageFromLocation(root.location.search);if(stage!==null)selected=stage;draw()});
root.addEventListener('hashchange',()=>{if(root.location.hash==='#overview-pipeline')draw()});
draw();
})(typeof window!=='undefined'?window:globalThis);
