/* Deterministic, illustrative triage rules. Not a probability, severity score or management risk decision.
   Rules surface 3–6 consequential questions only when scenario-specific authority and capability signals exist. */
(function(root){
'use strict';
const rulebook=[
 {id:'R13',order:1,check:p=>p.authority!=='advisory'&&has(p,'tools')&&inAny(p,['coding','review','testing','release','ops']),
  trigger:p=>'Agent execution is delegated and tool/API access is selected.',
  change:'Demonstrate task-scoped effective credentials and independent denial of actions outside that scope.',impact:'An overprivileged action can cross the intended task boundary.'},
 {id:'R12',order:2,check:p=>p.authority!=='advisory'&&has(p,'tools')&&has(p,'untrusted'),
  trigger:p=>'The agent can act through tools and consumes lower-trust content.',
  change:'Show that untrusted content cannot expand tool authority; test malicious issue, repository and tool-response instructions.',impact:'Untrusted instructions may redirect consequential actions.'},
 {id:'R02',order:3,check:p=>p.authority==='autonomous'&&inAny(p,['review']),
  trigger:p=>'Autonomous decision authority is selected for a review workflow.',
  change:'Confirm whether independent policy or native platform restrictions block an ineligible PR even when reviewers agree.',impact:'An incorrect model judgment may become an authorization decision.'},
 {id:'R03',order:4,check:p=>p.authority==='autonomous'&&inAny(p,['review'])&&has(p,'tools'),
  trigger:p=>'Autonomous review and agent tool execution are both selected; privileged bypass remains unverified.',
  change:'Confirm the bot’s effective GitHub permissions and whether any exemption bypasses required approval or merge enforcement.',impact:'An exempt identity could defeat intended authorization rules.'},
 {id:'R06',order:5,check:p=>has(p,'external')&&inAny(p,['coding','testing','review']),
  trigger:p=>'The profile explicitly identifies possible transmission to an external AI service.',
  change:'Inspect actual payloads, secret filtering, retention terms and permitted repository scope; verified no-egress design may exclude it.',impact:'Sensitive source or context may leave the intended trust boundary.'},
 {id:'R14',order:6,check:p=>inAny(p,['coding']),
  trigger:p=>'AI code generation is within the selected development workflow.',
  change:'Demonstrate independent security-relevant acceptance tests and review for generated code, including seeded authorization defects.',impact:'Correct-looking generated code can contain exploitable behavior.'},
 {id:'R04',order:7,check:p=>inAny(p,['review'])&&p.authority!=='advisory',
  trigger:p=>'An agent can execute or independently decide approval in the review workflow.',
  change:'Verify approval invalidation on new commits, rebases or changed dependency context.',impact:'An authorization may no longer refer to the code that merges.'},
 {id:'R16',order:8,check:p=>p.authority==='autonomous'&&inAny(p,['review']),
  trigger:p=>'AI review decisions can influence automatic approval.',
  change:'Test severe false negatives and correlated reviewer errors, beyond model agreement or average pass rates.',impact:'Misleading reviewer-quality evidence can justify unsafe delegation.'},
 {id:'R21',order:9,check:p=>p.authority!=='advisory'&&has(p,'tools')&&inAny(p,['review','release','ops']),
  trigger:p=>'Consequential agent execution is possible in review, release or operations.',
  change:'Demonstrate independent credential/tool shutdown and complete reconstruction of failed and retried actions.',impact:'Unsafe autonomous actions may continue or remain invisible.'},
 {id:'R20',order:10,check:p=>inAny(p,['ops'])&&p.authority!=='advisory'&&has(p,'tools'),
  trigger:p=>'An operations agent can execute tool actions rather than only recommend them.',
  change:'Confirm a bounded runbook, command restrictions, escalation criteria and a tested rollback/stop path.',impact:'Incorrect remediation may worsen a live incident.'},
 {id:'R19',order:11,check:p=>inAny(p,['release'])&&p.authority!=='advisory'&&has(p,'tools'),
  trigger:p=>'An agent can act in the build or release workflow.',
  change:'Verify independently restricted target environment, approved artifact identity and deploy authorization.',impact:'An agent could deploy beyond its approved release scope.'},
 {id:'R18',order:12,check:p=>inAny(p,['release','coding'])&&has(p,'tools')&&has(p,'release'),
  trigger:p=>'Agent tool execution and ability to affect CI, merge or release are selected.',
  change:'Verify restrictions on workflow files, dependency promotion, artifact signing and bypass routes.',impact:'An agent may weaken the pipeline that is supposed to validate its work.'},
 {id:'R15',order:13,check:p=>has(p,'sameAuthor')&&inAny(p,['coding','testing']),
  trigger:p=>'The same AI workflow generates implementation and corresponding tests.',
  change:'Use independently derived acceptance criteria or seeded defects to test the test oracle.',impact:'Generated tests may repeat the implementation’s incorrect assumption.'},
 {id:'R01',order:14,check:p=>p.authority==='execution'&&inAny(p,['review']),
  trigger:p=>'A review agent executes human instructions using tools.',
  change:'Bind each approved operation to the exact human decision, PR and revision.',impact:'The agent could act beyond the human’s specific approval.'},
 {id:'R17',order:15,check:p=>p.activities.length>0,
  trigger:p=>'An AI-enabled SDLC workflow is selected; effective behavior may depend on non-code configuration.',
  change:'Identify consequential prompt/model/tool/permission changes and evaluation or rollback triggers.',impact:'Agent behavior may drift outside ordinary code-change review.'},
 {id:'R10',order:16,check:p=>inAny(p,['design']),
  trigger:p=>'AI participates in requirements or planning.',
  change:'Compare generated requirements against independently owned security, privacy and availability constraints.',impact:'Missing constraints can propagate into implementation.'},
 {id:'R11',order:17,check:p=>inAny(p,['design']),
  trigger:p=>'AI participates in architectural design or recommendations.',
  change:'Challenge alternatives, hidden assumptions and design constraints with a domain expert.',impact:'A plausible recommendation may conceal material engineering tradeoffs.'},
 {id:'R09',order:18,check:p=>p.authority==='autonomous'&&inAny(p,['review','release','ops']),
  trigger:p=>'Autonomous decisions or actions require reliable records.',
  change:'Reconcile agent outcomes against independent PR, deployment or infrastructure populations.',impact:'Incomplete records can hide unsuccessful or bypassed actions.'}
];
function has(p,key){return (p.capabilities||[]).includes(key)}
function inAny(p,ids){return ids.some(id=>(p.activities||[]).includes(id))}
function select(profile,matched){
 const byId=new Map(matched.map(x=>[x.risk.id,x]));
 const defining=profile.authority==='execution'&&inAny(profile,['review'])?'R01':profile.authority==='autonomous'&&inAny(profile,['review'])?'R02':null;
 const candidates=rulebook.filter(r=>byId.has(r.id)&&r.check(profile))
   .map(r=>{
     const item=byId.get(r.id);
     const conditional=item.status==='Needs verification';
     const isDefining=r.id===defining;
     return {id:r.id,why:r.trigger(profile),consequence:r.impact,
       decisionQuestion:item.risk.challenge,whatChanges:r.change,
       rule:'Explicit architecture signals; conditionally applicable cases are flagged',
       category:isDefining?'Architecture-defining question':'Supporting investigation',
       conditional,rank:r.order};
   });
 candidates.sort((a,b)=>{
  if(a.id===defining)return -1;
  if(b.id===defining)return 1;
  if(a.conditional!==b.conditional)return a.conditional?1:-1;
  return a.rank-b.rank;
 });
 return candidates.slice(0,6);
}

root.SDLCPriorities={select,ruleCount:rulebook.length};
})(window);
