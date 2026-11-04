(function(root){
'use strict';
const data=root.AssuranceData;
if(!data||typeof document==='undefined')return;
const node=(tag,txt,cls)=>{const e=document.createElement(tag);if(txt!==undefined&&txt!==null)e.textContent=txt;if(cls)e.className=cls;return e;};
const $=id=>document.getElementById(id);
const summaries=[
['A PR may conceal relevant changes or carry an approval from an older revision.','Ensure the full diff and the exact revision are captured and evaluated.','Reconstruct the PR and challenge approval reuse after a push.','Diff, PR events, author, SHA and renewed checks.'],
['Missing or stale dependency information may qualify protected changes for automation.','Exclude protected or uncertain impact before any AI review.','Challenge a billing dependency, unknown consumers and failed required checks.','Dependency inventory, versions, validation and routing records.'],
['AI reviewers may share unsafe misses, follow hostile instructions or change behavior.','Validate combined reviewer coverage and escalate uncertainty without granting authority to models.','Use adjudicated false-low, disagreement, injection and fail-safe cases.','Evaluation corpus, model/prompt versions, outputs and escalation logs.'],
['Favorable scores or mutable policy may authorize an ineligible revision.','Require independently governed authorization of the exact revision and prerequisites.','Attempt stale-SHA, failed-check and privilege/policy bypass cases.','Policy versions, permissions, approval decision and check statuses.'],
['A bypassed merge or altered build may break authorization-to-artifact lineage.','Enforce protected merge and trace built artifacts to authorized source.','Try blocked merges and trace approved revision through the build.','Rulesets, CI checks, bypass records, build and artifact digests.'],
['A substituted artifact or failed release validation may reach production.','Permit promotion only for the verified, authorized artifact after required checks.','Substitute the digest and fail a mandatory pre-production gate.','Release policy, provenance verification, failures and promotion logs.'],
['Missing production events or unsafe automated approvals may escape detection.','Reconcile production activity and require owned investigation, suspension and recovery.','Reconcile an independent deployment population; exercise shutdown/restart.','Runtime/deployment population, alerts, incidents and restart approval.']
];
let active=Number(new URLSearchParams(location.search).get('stage'));
if(!Number.isInteger(active)||active<0||active>=data.stages.length){const v=data.legacy[new URLSearchParams(location.search).get('area')];active=Number.isInteger(v)?v:0;}
function link(label,href){const a=node('a',label);a.href=href;return a;}
function areaList(i){return data.areas.filter(a=>a.stages.includes(i));}
function renderOverview(){
const body=$('assurance-matrix-body');body.replaceChildren();
data.stages.forEach((s,i)=>{
const tr=node('tr',null,i===active?'selected':'');const cell=(content,cls)=>{const td=node('td',null,cls);if(typeof content==='string')td.textContent=content;else td.append(content);tr.append(td);};
const b=node('button',null,'matrix-stage-button');b.type='button';b.setAttribute('aria-expanded',String(i===active));b.setAttribute('aria-controls','matrix-details');b.append(node('span',String(i+1).padStart(2,'0'),'stage-number'),node('span',s.title));b.addEventListener('click',()=>select(i,true));
cell(b,'stage-col');cell(summaries[i][0],'risk-cell');cell(summaries[i][1],'objective-cell');cell(summaries[i][2],'testing-cell');cell(summaries[i][3],'evidence-cell');body.append(tr);
});}
function titleAndText(title,text,cls){const section=node('div',null,cls||'');section.append(node('h4',title),node('p',text));return section;}
function renderDetails(){
const stage=data.stages[active],areas=areaList(active),target=$('matrix-details');target.replaceChildren();
const head=node('div',null,'matrix-detail-header');const heading=node('div');heading.append(node('span','STAGE '+(active+1)+' / 7','eyebrow'),node('h2',stage.title));const jump=link('Inspect in Pipeline →','./experience.html?stage='+active+'#pipeline-section');head.append(heading,jump);target.append(head);
const intro=node('div',null,'matrix-intro');intro.append(titleAndText('Fictional scenario',stage.scenario),titleAndText('The auditor’s challenge',stage.concern));target.append(intro);
const label=node('p',areas.length+' applicable focus areas · Select an area for complete numbered procedures, evidence and further challenge.','matrix-explainer');target.append(label);
const holder=node('div',null,'matrix-area-list');
areas.forEach((a,i)=>{
const details=node('details',null,'matrix-area');details.open=i===0;
const summary=node('summary',null,'matrix-area-heading');summary.append(node('strong',a.title),node('span','Risk · Objective · Tests · Evidence'));
details.append(summary);
const grid=node('div',null,'matrix-area-grid');grid.append(titleAndText('Risk — what could go wrong?',a.risk,'matrix-risk'),titleAndText('Control objective — what must be achieved?',a.objective,'matrix-objective'));details.append(grid);
const proc=node('section',null,'matrix-full-procedures');proc.append(node('h4','Supporting testing procedures'));const ol=node('ol');a.steps.forEach(t=>ol.append(node('li',t)));proc.append(ol);details.append(proc);
const expected=node('div',null,'matrix-result-grid');expected.append(titleAndText('Evidence considerations',a.evidence),titleAndText('Expected result',a.expect),titleAndText('Further challenge',a.blind));details.append(expected);
const controls=node('div',null,'matrix-links');controls.append(node('strong','Related control objectives: '));a.links.forEach(id=>controls.append(link(id+' ↗','./control-matrix.html#control-'+id)));details.append(controls);holder.append(details);
});target.append(holder);
const tests=node('details',null,'matrix-scenario-tests');tests.append(node('summary','Two scenario-specific negative/positive tests and expected results'));stage.tests.forEach((t,i)=>{const sec=node('article');sec.append(node('h4',(i+1)+'. '+t.title),titleAndText('Test approach',t.action),titleAndText('Expected result',t.expect),titleAndText('Evidence',t.evidence));const refs=node('div',null,'matrix-links');t.refs.forEach(ref=>refs.append(link(data.references[ref].label+' ↗',data.references[ref].url)));sec.append(refs);tests.append(sec);});target.append(tests);
const fw=node('details',null,'matrix-frameworks');fw.append(node('summary','Framework guidance for this stage'));stage.guidance.forEach(g=>{const row=node('p');row.append(link(data.references[g.ref].label+' ↗',data.references[g.ref].url),document.createTextNode(' — '+g.text));fw.append(row);});fw.append(node('p','DevSecOps application: '+stage.principle));target.append(fw);
$('matrix-status').textContent='Showing stage '+(active+1)+': '+stage.title+', '+areas.length+' applicable focus areas.';
if(root.SharedCaseUI)root.SharedCaseUI.refreshLinks();
}
function select(i,scroll){
active=i;renderOverview();renderDetails();const url=new URL(location.href);url.searchParams.set('stage',String(i));if(!url.hash.startsWith('#case='))url.hash='testing-guide';history.replaceState(null,'',url);
if(scroll){$('matrix-details').scrollIntoView({block:'start',behavior:'auto'});$('matrix-details').focus({preventScroll:true});}
}
function downloadCsv(){
const rows=[['Stage #','Pipeline stage','Focus area','Risk','Control objective','Procedure #','Complete supporting testing procedure','Evidence considerations','Expected result','Further challenge','Related control IDs']];
data.stages.forEach((stage,i)=>areaList(i).forEach(a=>a.steps.forEach((step,n)=>rows.push([i+1,stage.title,a.title,a.risk,a.objective,n+1,step,a.evidence,a.expect,a.blind,a.links.join('; ')]))));
const csv='\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=link('Download',url);a.download='AI_Approval_Full_Procedures_By_Stage.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('matrix-download').addEventListener('click',downloadCsv);
const refs=$('reference-list');if(refs)refs.replaceChildren(...Object.keys(data.references).map(id=>{const p=node('p',null,'reference-item');p.append(link(data.references[id].label+' ↗',data.references[id].url));return p;}));
select(active,false);
})(typeof globalThis!=='undefined'?globalThis:this);
