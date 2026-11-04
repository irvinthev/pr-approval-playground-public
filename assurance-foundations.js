/* Static learning demo only: no approvals or CI/CD actions are executed. */
(function(){
'use strict';
const foundations=[
{title:'Repository Protection & Enforcement',question:'Are protected branches, required checks, merge restrictions and bypass privileges independently governed?',owner:'Repository and platform owners',evidence:'Effective rulesets, branch protections, required status checks, bypass actors, configuration history and negative merge tests.',challenge:'Attempt an unauthorized merge or disable a required check in an approved test repository. Evaluate alternate branches and emergency paths.',related:'AI-08, AI-15'},
{title:'Independent Authorization & Segregation of Duties',question:'Can a contributor alter application logic and the approval mechanism, including across repositories or privileged identities?',owner:'Engineering access and policy owners',evidence:'Cross-repository effective permissions, code owners, service identities, token ownership, inherited access, approved exceptions and administrative history.',challenge:'Evaluate whether someone able to update an application can also modify shared policy, bot credentials, reviewer rules or release authorization.',related:'AI-03, AI-04, AI-07'},
{title:'Engineering & Security Baseline',question:'Has Engineering established the testing, quality, dependency and security requirements that determine whether automation is permitted?',owner:'Engineering and Security',evidence:'Versioned engineering standards, required CI/security checks, approved applicability rules, secure-development practices and exception criteria.',challenge:'Make a required security or quality check fail or disappear on a test change. Verify AI agreement does not bypass mandatory requirements.',related:'AI-01, AI-08, AI-11'},
{title:'Classification Data & Dependency Integrity',question:'Are repository inventories, dependency maps, impact classifications and other inputs complete, current and independently validated?',owner:'Service, data and dependency owners',evidence:'Input provenance, financial-impact mappings where relevant, owner-supported dependency inventory, validation results, mapping versions and freshness checks.',challenge:'Omit a shared-library dependency or provide stale risk metadata. Verify unknown or untrusted impact prevents auto-approval.',related:'AI-01, AI-05, AI-15'},
{title:'AI Classification QA & Negative Testing',question:'Does independent human inspection and controlled testing identify inappropriate low-risk decisions?',owner:'Engineering quality owners and independent validators',evidence:'Adjudicated reference cases, representative manual inspections, deliberately unsafe and adversarial inputs, false-low-risk measures by severity, release criteria and retests.',challenge:'Feed misleading metadata and known risky changes through both reviewers; evaluate correlated misses and human escalation.',related:'AI-05, AI-06, AI-12'},
{title:'Model & Policy Change Governance',question:'Are model, prompt, threshold, mapping and enforcement changes independently authorized and revalidated before use?',owner:'Model, policy and CI/CD owners',evidence:'Approved baseline versions, prompt/model/rule changes, reviewer access, validation evidence, rollout and rollback history.',challenge:'Change a threshold or model version under controlled test conditions and verify revalidation, approval and effective-version traceability.',related:'AI-14, AI-15'},
{title:'Continuous Monitoring & Assurance Evidence',question:'Can stakeholders obtain timely, complete and reliable records of decisions, exceptions, configuration changes and production deployment?',owner:'Platform operations, monitoring and control owners',evidence:'Source-to-monitor event reconciliation, approval and deployment audit trail, evidence retention, freshness indicators, exception alerts, investigations and closure.',challenge:'Interrupt the evidence feed; verify the dashboard identifies missing records rather than presenting stale data as current.',related:'AI-10, AI-11, AI-12, AI-13'}
];
const scenarios=[
{label:'Branch protection bypass',category:'Repository protection',condition:'An administrator bypasses a mandatory merge check.',response:'A governed ruleset prevents the bypass, or an independently authorized exception is recorded and reviewed. Uncontrolled bypass is a design failure.',evidence:'Effective ruleset, bypass actor list, merge and admin event logs, exception record.'},
{label:'Cross-repository SoD conflict',category:'Independent authorization',condition:'A contributor can change application logic in one repository and the central approval policy in another.',response:'A policy owner evaluates effective cross-repository access and removes or independently governs conflicting authority. Separate repositories do not, by themselves, establish SoD.',evidence:'Permissions across repositories, policy history, admin roles and independent authorization.'},
{label:'Missing financial dependency',category:'Data integrity',condition:'A shared library is changed, but the dependency map omits a downstream billing-related service.',response:'Unknown or incomplete required impact information blocks automated approval and routes the change for human assessment.',evidence:'Dependency mapping version, completeness check, affected service list and escalation record.'},
{label:'False-low-risk classification',category:'AI validation',condition:'A deliberately unsafe change affecting a sensitive calculation is presented with misleading low-risk metadata.',response:'Deterministic exclusions or reviewers identify the risk; a missed case is recorded as a false-low-risk result, investigated and used for regression validation.',evidence:'Known expected outcome, model and prompt versions, adjudication, review outputs and regression history.'},
{label:'Security gate failure',category:'Security baseline',condition:'A required security check fails or returns no result while both reviewers label the change low risk.',response:'The mandatory technical gate blocks automated merge regardless of agreement between AI reviewers.',evidence:'Required-check policy, CI results, current revision identity and attempted override records.'},
{label:'Evidence feed interruption',category:'Continuous assurance',condition:'Production approvals continue, but the assurance data feed stops receiving new events.',response:'A freshness or completeness alarm identifies the monitoring gap. A stale dashboard cannot support a claim of ongoing effectiveness.',evidence:'Source event counts, ingestion health, missing-record alerts and reconciliation follow-up.'}
];
const list=document.getElementById('foundation-list'),choices=document.getElementById('challenge-choices'),result=document.getElementById('challenge-result');
if(!list||!choices||!result)return;
function el(tag,className,text,parent){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;if(parent)parent.appendChild(n);return n;}
foundations.forEach((item,i)=>{
 const d=el('details','foundation-item',undefined,list);
 const s=el('summary',null,undefined,d);
 el('span','foundation-num',String(i+1).padStart(2,'0'),s);
 const title=el('span','foundation-summary',undefined,s);
 el('strong',null,item.title,title);el('span',null,item.question,title);
 const body=el('div','foundation-body',undefined,d);
 for(const [label,value] of [['Suggested owner',item.owner],['Expected evidence',item.evidence],['Illustrative challenge',item.challenge],['Related proposed RCM controls',item.related]]){
  const p=el('p',null,undefined,body);el('strong',null,label+': ',p);p.appendChild(document.createTextNode(value));
 }
});
let active=2;
function render(){
 choices.replaceChildren();
 scenarios.forEach((s,i)=>{
  const b=el('button','challenge-option',undefined,choices);
  b.type='button';b.setAttribute('aria-pressed',String(i===active));b.setAttribute('aria-controls','challenge-result');
  el('span','challenge-circle',undefined,b).setAttribute('aria-hidden','true');
  el('span',null,s.label,b);b.addEventListener('click',()=>{active=i;render();});
 });
 const s=scenarios[active];result.replaceChildren();
 el('span','challenge-category',s.category,result);
 for(const [title,body] of [['Injected condition',s.condition],['Expected safeguard response',s.response],['Evidence to inspect',s.evidence]]){
 el('h4',null,title,result);el('p',null,body,result);
 }
}
render();
})();
