(function(){
'use strict';
const W=window.WorkedExamples,host=document.getElementById('worked-examples');if(!W||!host)return;
let id='standard',condition='baseline',view='engineering';
const status=document.createElement('p');status.className='we-sr';status.setAttribute('role','status');status.setAttribute('aria-live','polite');host.after(status);
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(cls)n.className=cls;return n;};
const link=(text,href)=>{const n=node('a',text);n.href=href;return n;};
const params=new URLSearchParams(location.search);
if(Object.hasOwn(W.definitions,params.get('example')))id=params.get('example');
if(Object.hasOwn(W.definitions[id].conditions,params.get('condition')))condition=params.get('condition');
const frame={
 standard:{
  baseline:['Review evidence for revision A; CI is green for A.','Confirm authorization on the same revision and preserve required checks.','Automatic route eligible in this fictional decision model.','Confirm current SHA and required checks from GitHub; validate effective rulesets, actor privileges, policy history and bypass routes.'],
  stale:['Approval evidence exists for revision A.','A developer pushes revision B after review.','Approval for A must not authorize B.','Adapter blocks the modeled route on SHA mismatch. This is scenario-specific, not a proven shared-engine guard.','Reperform stale-review denial in actual GitHub / merge queue, including webhook delay and privileged bypass.'],
  failed:['Revision A has favorable reviewer signals.','A required CI check fails.','Automated authorization must be denied.','The fictional model blocks the route due to failed CI.','Inspect actual required check names/issuers, queue checks and exception paths.']
 },
 dependency:{
  baseline:['Library change has known billing consumer.','Dependency map exposes financial relevance.','Route to qualified human review.','The simulated eligibility screen blocks automation.','Validate real dependency lineage and control ownership.'],
  omitted:['Library change has billing impact.','Remove its consumer from the supplied dependency map.','Unknown or financially relevant impact should not silently enter automation.','The fictional model exposes unsafe eligibility; no successful detector is invented.','Validate completeness of financial consumer mapping and historical exposure.'],
  incomplete:['A dependency mapping contains incomplete relationships.','Submit unresolved mapping to the gate.','Unknown impact requires human escalation.','The fictional model withholds approval.','Validate classification of unknown dependencies and source completeness.']
 },
 policy:{
  baseline:['Infrastructure operator attempts to weaken a financial policy.','Independent administration is assumed.','Unauthorised policy downgrade should be denied.','Fictional model denies the attempt.','Confirm real admin privileges, effective config paths and audit events.'],
  weakened:['An infrastructure operator has policy control.','Allow that operator to downgrade eligibility.','Contributor/operator should not self-authorize weaker rules.','Fictional model permits the downgrade, exposing the trust boundary.','Inspect inherited roles, deployment tokens and active policy administration.']
 },
 population:{
  baseline:['Two fictional deployment sample feeds match.','Compare recorded samples.','Matching samples alone cannot prove complete production population.','Sample comparison matches; total completeness remains UNRESOLVED.','Reconcile all normal, manual and emergency release pathways.'],
  missing:['Independent source contains another deployment.','Omit the release from the monitoring feed.','Missing release must be investigated, not treated as authorized.','The fictional comparison finds a missing deployment; completeness remains UNRESOLVED.','Establish independent source population and event ingestion completeness.'],
  unverified:['The monitoring feed is available.','Remove independent source corroboration.','Do not assert a complete population from a single feed.','The fictional model marks completeness UNRESOLVED.','Verify independent inventory, time bounds, pagination and deduplication.']
 }
};
function addFact(parent,title,value,extra){const s=node('section',null,'we-fact'+(extra?' we-limit':''));s.append(node('h4',title),node('p',value));parent.append(s);}
function render(announce=false){
 const x=W.evaluate(id,condition),story=frame[id][condition];
 const observation=story[0],challenge=story.length===5?story[1]:(condition==='baseline'?'Assess the initial eligible condition.':story[1]);
 const expected=story.length===5?story[2]:story[1];
 const observed=story.length===5?story[3]:story[2];
 const verification=story.length===5?story[4]:story[3];
 host.replaceChildren();host.dataset.view=view;
 host.append(node('p','WORKED ENGINEERING / ASSURANCE EXAMPLES','we-kicker'),node('h2','One decision. Two perspectives.'),node('p','Select a challenge and compare the simulated engineering record with the workpaper. Original labs remain available below as optional deep dives.'));
 const choices=node('div',null,'we-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label','Worked examples');
 for(const [key,d] of Object.entries(W.definitions)){const b=node('button',d.title);b.type='button';b.setAttribute('aria-pressed',String(key===id));b.onclick=()=>{id=key;condition='baseline';render(true);document.getElementById('we-heading').focus({preventScroll:true});};choices.append(b);}host.append(choices);
 const context=node('div',null,'we-context'),heading=node('h3',x.title);heading.id='we-heading';heading.tabIndex=-1;
 context.append(heading,node('p',x.situation),node('p',x.lesson,'we-lesson'));
 const label=node('label','Challenge this example');label.htmlFor='we-condition';const select=node('select');select.id='we-condition';
 for(const [key,value] of Object.entries(x.conditions)){const o=node('option',value);o.value=key;select.append(o);}select.value=condition;
 select.onchange=()=>{condition=select.value;render(true);document.getElementById('we-condition').focus({preventScroll:true});};
 context.append(label,select);host.append(context);
 const summary=node('div',null,'we-decision');summary.append(node('span','SIMULATED WORKFLOW OUTCOME','we-kicker'),node('h3',x.decision),node('p',x.why),node('strong','Next action'),node('p',x.next));host.append(summary);
 const tabs=node('div',null,'we-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Mobile workpaper perspective');
 for(const [key,text] of [['engineering','Engineering evidence'],['assurance','Audit workpaper']]){const b=node('button',text);b.type='button';b.dataset.perspective=key;b.setAttribute('aria-pressed',String(view===key));b.setAttribute('aria-controls','we-'+key);b.onclick=()=>{view=key;render();host.querySelector('[data-perspective="'+view+'"]').focus({preventScroll:true});};tabs.append(b);}host.append(tabs);
 const panes=node('div',null,'we-panes dashboard');
 const eng=node('section',null,'pane engineering we-engineering');eng.id='we-engineering';eng.setAttribute('aria-label','Engineering evidence');
 const eh=node('header',null,'pane-header');eh.append(node('h3','01 / Engineering evidence'),node('span','FICTIONAL RECORD','badge'));eng.append(eh);
 const eb=node('div',null,'we-pane-body');eb.append(node('p','Selected fields from the simulated record. No live GitHub or production connection.'));
 const dl=node('dl');for(const [name,value]of x.fields)dl.append(node('dt',name),node('dd',value));eb.append(dl);
 const raw=node('details',null,'we-evidence-json');raw.append(node('summary','Inspect complete simulated JSON'));const pre=node('pre',JSON.stringify(x.record,null,2));pre.tabIndex=0;pre.setAttribute('aria-label','Scrollable fictional JSON');raw.append(pre);eb.append(raw);eng.append(eb);
 const assurance=node('section',null,'pane audit we-assurance');assurance.id='we-assurance';assurance.setAttribute('aria-label','Audit workpaper');
 const ah=node('header',null,'pane-header');ah.append(node('h3','02 / Audit workpaper'),node('span','SIMULATION · NOT VERIFIED','badge'));assurance.append(ah);
 const ab=node('div',null,'we-pane-body');
 addFact(ab,'Engineering observation',observation);
 addFact(ab,'Challenge introduced',challenge);
 addFact(ab,'Expected control behavior',expected);
 addFact(ab,'Observed simulation result',observed);
 addFact(ab,'Remaining independent verification',verification);
 addFact(ab,'Permissible conclusion',x.assessment+' Production effectiveness is not established.',true);
 if(id==='standard'){addFact(ab,'Revision-binding implementation','The stale-SHA guard is simulated by the worked-example adapter before calling the shared authorization resolver. It is not proof of an engine-wide enforcement guarantee.',true);}
 const testbox=node('details',null,'we-testing');testbox.append(node('summary','Testing approach · design / implementation / operation'));for(const [name,description]of x.tests)testbox.append(node('h4',name),node('p',description));ab.append(testbox);
 const controls=node('nav',null,'we-controls');controls.setAttribute('aria-label','RCM control mapping');
 const primary={standard:'AI-07',dependency:'AI-01',policy:'AI-15',population:'AI-12'}[id];controls.append(node('strong','Primary control · '),link('WEB15:'+primary,'./rcm-view.html#control-'+primary));
 const support=node('details');support.append(node('summary','Supporting safeguards & dependencies'));
 const related=new Set(x.controls.filter(k=>k!==primary));if(id==='standard')for(const k of ['AI-01','AI-03','AI-15'])related.add(k);
 for(const k of related)support.append(link('WEB15:'+k,'./rcm-view.html#control-'+k));
 controls.append(support);ab.append(controls);assurance.append(ab);
 panes.append(eng,assurance);host.append(tabs,panes);
 const footer=node('div',null,'we-footer');footer.append(link('Current RCM →','./rcm-view.html'),link('Connected change journey →','./experience.html?example=shared'),link('Dependency deep dive ↓','#dependency-deep-dive'));host.append(footer,node('p','Simulation-only. The modeled outcome is not a control test or authorization to merge or deploy.','we-boundary'));
 if(announce){status.textContent=x.title+'. '+x.decision+'. '+x.why;const u=new URL(location.href);u.searchParams.set('example',id);u.searchParams.set('condition',condition);u.hash='worked-examples';history.replaceState(null,'',u);}
}
render();
})();