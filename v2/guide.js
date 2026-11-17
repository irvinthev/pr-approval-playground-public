
(function(){
'use strict';
const cases={
 overview:{
   labels:['Decision authority','Action recorded','Evidence gap'],
   choices:[
    {key:'human',name:'Human decides',title:'Human review and approval',status:'Direct human judgment',summary:'A reviewer examines the relevant changes, decides whether to approve, and records the decision in GitHub.',points:['The human is the decision maker.','The human also performs the approval action.','The GitHub event does not, by itself, prove the quality of their judgment.'],next:'Question to pursue: Was the exact revision reviewed meaningfully?'},
    {key:'executed',name:'Agent executes',title:'Human-directed agent submission',status:'Human decision, agent action',summary:'An engineer makes an explicit decision on the current PR; an agent invokes GitHub tooling to submit it.',points:['The engineer retains decision authority.','The agent executes through a constrained identity or tool.','Reconstruct the human instruction, specific revision, invocation and GitHub event.'],next:'Question to pursue: Can the agent act outside that explicit instruction?'},
    {key:'autonomous',name:'AI decides',title:'Bounded autonomous approval',status:'Delegated policy decision',summary:'Management may authorize an automated decision within a precise and independently enforced eligibility boundary.',points:['A controlled policy—not model confidence alone—establishes the delegation.','An authorized automation identity submits only qualifying decisions.','Prove the applied policy, complete scope, revision binding and bypass restrictions.'],next:'Question to pursue: What happens when scope or evidence is unknown?'}
   ]
 },
 risk:{
  labels:['Failure condition','Plausible impact','Management decision'],
  choices:[
   {key:'dependency',name:'Missed dependency',title:'Two LOWs miss downstream scope',status:'Potential policy-coverage gap',summary:'A fictional PR changes lib/dedup/key.js. Two AI reviewers call it LOW; the dependency map may connect it to usage, billing and reporting.',points:['A shared-library dependency is omitted or stale.','A protected function could change without its required review.','Decide how unknown or indirect impact is classified and routed.'],next:'Unknown: Has management defined the critical-function policy and is the map complete?'},
   {key:'authority',name:'False authorization',title:'Advisory output becomes approval',status:'Decision-authority mismatch',summary:'A favorable AI review is treated as if it independently authorizes a protected change.',points:['The workflow conflates recommendation and approval authority.','An actor or tool may execute an approval without valid delegation.','Define who may decide, execute and change the policy of record.'],next:'Unknown: Which GitHub rulesets and identities independently stop the action?'},
   {key:'evasion',name:'Policy drift',title:'An approval policy changes with the code',status:'Possible bypass exposure',summary:'A PR or administrator alters the eligibility rules, agent prompts, or exception route that judges changes.',points:['The effective scope expands without an approved policy change.','Two reviewers may agree while the independent gate is weakened.','Establish policy ownership, version control and safe failure on change.'],next:'Unknown: Who can modify approval policy and enforcement configuration?'}
  ]
 },
 engineering:{
  labels:['Who decides / who acts','Independent restriction','Engineering tradeoff'],
  choices:[
   {key:'assist',name:'AI assisted',title:'AI review, human authorization',status:'Lowest delegated authority',summary:'AI reduces review effort by identifying defects and organizing context; the human still decides.',points:['AI recommends; an eligible reviewer approves.','Review and branch protections must work independently of the recommendation.','Can the reviewer use AI to make judgment better rather than simply faster?'],next:'A simpler first move: reduce noisy reviews and improve deterministic code ownership.'},
   {key:'execute',name:'Agent executes',title:'Explicit human approval, automated action',status:'Separate human decision from tool execution',summary:'An engineer authorizes the exact revision; an agent submits the decision under restricted permissions.',points:['Human instruction must be specific and retrievable.','Bound credentials, MCP/CLI/API paths, target repository and revision.','Stacked PRs save clicks but increase context and stale-instruction risk.'],next:'Negative test: Attempt submission after a push or rebase.'},
   {key:'fast',name:'Fast Track',title:'Simplified human approval',status:'Process redesign before autonomous AI',summary:'Use approved, deterministic eligibility criteria to reduce friction while preserving meaningful human authorization.',points:['Management defines eligible changes and exclusions.','The branch gate enforces scope without trusting an LLM classification.','Lower review cost but still requires human capacity and accountability.'],next:'Alternative to test: Does this solve the actual queue better than automation?'},
   {key:'auto',name:'Autonomous',title:'Conditional low-risk automation',status:'Highest delegated decision authority',summary:'Automation authorizes only current, in-scope revisions under an approved policy and independently enforced rules.',points:['Deterministic exclusions, model results and unknown-state fallback are distinct.','Limit bot credentials, override paths, stale approvals and merge/release bypass.','Potential throughput gain carries mapping, false-low and operational complexity costs.'],next:'Negative test: Two LOWs on a shared dependency must not expand eligibility.'}
  ]
 },
 monitoring:{
  labels:['What the event means','What to reconcile','Action before safe resumption'],
  choices:[
   {key:'observe',name:'01 · Observe',title:'Revision A receives approval',status:'Signal, not proof',summary:'In the fictional case, a decision record is associated with source revision A and policy version P1.',points:['The event describes an action; it does not prove judgment.','Link the decision, actor, approved content and effective policy.','Do not report a “healthy” system from one complete-looking record.'],next:'Next: Watch for revision, policy and merge-path changes.'},
   {key:'reconcile',name:'02 · Reconcile',title:'New commit changes A to B',status:'Prior authorization may be stale',summary:'A later push changes the PR. The earlier approval remains historical evidence but may no longer authorize the current content.',points:['Compare the reviewed content to the source represented at merge.','Account for legitimate merge-queue and squash commit mappings.','Revalidate or require fresh approval under the applicable policy.'],next:'Next: Compare every relevant merge to its policy decision, not just logged approvals.'},
   {key:'investigate',name:'03 · Investigate',title:'A merge record appears without a match',status:'Unresolved exception',summary:'A missing join between approval, merge and artifact records requires investigation; it is not automatically evidence of an unauthorized deployment.',points:['Corroborate complete change and deployment populations.','Inspect bypass identities, missing feeds, emergency routes and timing gaps.','Determine whether this is a true policy violation or an evidence problem.'],next:'Next: Escalate only the consequence supported by the facts.'},
   {key:'recover',name:'04 · Recover',title:'Containment and verified resumption',status:'Human operational decision',summary:'If an unsafe path is confirmed or cannot be bounded, designated responders constrain the automation and verify the release state.',points:['Pause the affected route and establish who has shutdown authority.','Reconcile in-flight changes and identify affected artifacts.','Verify remediation and safe restart; a click on “resume” is not recovery proof.'],next:'Next: Retain the incident, decision, evidence and post-recovery validation.'}
  ]
 },
 assurance:{
  labels:['What this can support','What it cannot prove alone','Evidence needed next'],
  choices:[
   {key:'configuration',name:'Configuration',title:'Examine effective boundaries and privileges',status:'Design and configured-state evidence',summary:'Inspect versioned rulesets, agent identity permissions, tool interfaces, privileged overrides, release gates, and actual allow/deny behavior.',points:['How the examined configurations and tested gates constrain actions at the evaluated point in time.','That every event passed through those gates or they stayed unchanged throughout the reliance period.','Effective configuration exports, actor/exception inventory, safe allow/deny tests, and change history.'],next:'Ask: Who can bypass or modify the enforcement that was inspected?'},
   {key:'population',name:'Full population',title:'Reconcile authorization to production',status:'Completeness claim only if sources are validated',summary:'Start with independently scoped production events. Join each applicable deployment to source, build, required authorization, and exceptions.',points:['Whether the defined and validated event population meets the stated authorization-to-release relationship.','The completeness of an unvalidated source feed or the quality of all human/model decisions.','Alternate-path inventory, event field validation, independent joins, missing-record treatment, and observed exceptions.'],next:'Ask: What production events could be absent from the population?'},
   {key:'negative',name:'Negative tests',title:'Challenge expected failures and bypass routes',status:'Behavior under specific test conditions',summary:'Attempt stale-commit approval, missing model evidence, identity overreach, policy manipulation, alternate API/CLI/MCP paths, and unauthorized release in a safe test environment.',points:['Whether defined protections blocked or exposed the specific attempted violations.','That all possible evasions are covered or that AI decisions will always be correct.','Expected-versus-observed cases, test environment, versions, severity, and known untested paths.'],next:'Ask: Which material failure mode has not been deliberately exercised?'},
   {key:'judgment',name:'Judgment samples',title:'Inspect the substance of selected decisions',status:'Case-level assurance; sampling design matters',summary:'Evaluate review quality, domain context, human intent, risk classification, emergency rationale, and exception decisions in selected changes.',points:['Decision substance for selected cases; population inference only when representative sampling is properly designed.','Unknown bypasses or population rates from a targeted nonrepresentative selection.','Defined sampling objective, selection rationale, primary decision evidence, and documented deviations.'],next:'Ask: Does this sample support inference or only illuminate specific cases?'},
   {key:'period',name:'Period of reliance',title:'Verify that the tested baseline remained valid',status:'Time-bounded reliability claim',summary:'Examine changes to rules, models, policy versions, permissions, repositories, pipelines, and collection health across the period of reliance.',points:['Whether identified design and evidence conditions remained in place or were appropriately revalidated in the period examined.','That a single point-in-time walkthrough or build screenshot establishes continuous operation.','Configuration history, coverage changes, incident records, source availability, and re-baselining triggers.'],next:'Ask: When did a model, policy, identity, or pipeline change invalidate the baseline?'}
  ]
 }
};
function init(){
 const chapter=document.body.dataset.chapter,model=cases[chapter];
 const root=document.querySelector('[data-scenario-root]');
 if(!model||!root)return;
 const picker=root.querySelector('[data-picker]');
 const title=root.querySelector('[data-insight-title]');
 const summary=root.querySelector('[data-insight-summary]');
 const status=root.querySelector('[data-insight-status]');
 const next=root.querySelector('[data-insight-next]');
 const fields=[...root.querySelectorAll('[data-insight-point]')];
 const labels=[...root.querySelectorAll('[data-insight-label]')];
 const buttons=[];
 function select(key){
  const scene=model.choices.find(x=>x.key===key)||model.choices[0];
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.choice===scene.key)));
  title.textContent=scene.title;summary.textContent=scene.summary;
  status.textContent=scene.status;next.textContent=scene.next;
  fields.forEach((field,i)=>{field.textContent=scene.points[i]||''});
  labels.forEach((label,i)=>{label.textContent=model.labels[i]||''});
 }
 model.choices.forEach(scene=>{
  const b=document.createElement('button');b.type='button';
  b.dataset.choice=scene.key;b.textContent=scene.name;
  b.setAttribute('aria-pressed','false');
  b.addEventListener('click',()=>select(scene.key));
  picker.appendChild(b);buttons.push(b);
 });
 select(model.choices[0].key);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
