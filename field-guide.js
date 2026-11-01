/* The three pages render the same validated event history. No real approval or deployment. */
(function(){
'use strict';
const app=document.getElementById('guide-app');if(!app)return;
const M=GuideModel,page=app.dataset.page;
let state,caseData,error='',legacy=false;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const disclosure=(title,body,open=false)=>`<details${open?' open':''}><summary>${title}</summary>${body}</details>`;
const controlNames=['Eligibility','Dependencies','AI evaluation','Failure handling','Decision binding','Human authorization','Administrative independence','Merge enforcement','Build and release','Deployment routes','Approver changes','Evidence integrity','Population and IPE','Monitoring and response','Shutdown and recovery','Exceptions and risk acceptance'];
const aliases={'ITGC-CM-01':['AI-01','AI-02'],'ITGC-CM-02':['AI-01','AI-03','AI-05','AI-07','AI-08'],'ITGC-CM-03':['AI-04','AI-06'],'ITGC-CM-07':['AI-09','AI-14','AI-15']};
function link(file,stage=state.stage,section=''){
 const p=new URLSearchParams({scenario:caseData.scenario,step:String(stage)});if(section)p.set('section',section);
 return './'+file+'?'+p+M.encode(caseData);
}
function announce(message){document.getElementById('guide-announcement').textContent=message;}
function load(){
 error='';legacy=location.hash.startsWith('#case=');
 if(legacy){error='This link belongs to the previous advanced simulation. It has not been loaded into this guide.';return;}
 try{
  state=M.selection(location.search);
  caseData=location.hash.startsWith('#guide=')?M.decode(location.hash):M.initial(state.scenario);
  if(location.hash.startsWith('#guide=')&&new URLSearchParams(location.search).has('scenario')&&caseData.scenario!==state.scenario)throw new Error('Scenario and case history disagree. No imported conclusion was accepted.');
  if(location.hash&&!location.hash.startsWith('#guide=')&&page==='field'&&location.hash!=='#foundations'&&location.hash!=='#main-content')throw new Error('Unsupported case link. Choose a fresh example explicitly.');
 }catch(e){error=e.message;}
}
function persist(){const u=new URL(location.href);u.searchParams.delete('stage');u.searchParams.delete('section');u.searchParams.set('scenario',caseData.scenario);u.searchParams.set('step',state.stage);u.hash=M.encode(caseData);history.replaceState(null,'',u);}
function picker(x){
 const statuses=['Recorded','Assessed',x.checks?'Results recorded':'Pending',x.authorization?'Authorized':'Pending',x.build?'Built':'Pending',x.releaseRecord?'Checks passed':'Pending',x.reconciliation?'Reconciled':x.deploymentRecord?'Deployed':'Pending'];
 return `<div class="pipeline-stages" role="group" aria-label="Inspect pipeline stage">${M.stages.map((s,i)=>`<button type="button" data-step="${i}" aria-pressed="${i===state.stage}"><span class="stage-number">0${i+1}</span><span>${s.title}<small>${statuses[i]}</small></span></button>`).join('')}</div>`;
}
function controls(s){return `<div class="related"><strong>Applicable controls</strong><p>${esc(s.control)}</p><p>${s.rcmIds.map(id=>`<a href="${link('independent-assurance.html',state.stage,'rcm-'+id)}">${id}</a>`).join(' · ')} <span class="muted">Example RCM</span></p><p class="muted">Library cross-reference: ${s.libraryIds.map(id=>`<a href="./control-matrix.html#control-${id}">${id}</a>`).join(' · ')}</p></div>`;}
function monitorBody(m){return `<p><strong>Rule:</strong> ${esc(m.rule)}</p><p><strong>Sources:</strong> ${esc(m.sources)}<br><strong>When:</strong> ${esc(m.cadence)}</p><p class="muted">Worked monitor · Invented records; not a live service.</p><dl class="monitor-sample">${m.rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><p><strong>Result: ${m.status}</strong> — ${esc(m.result)}</p><p><strong>Owner:</strong> ${esc(m.owner)}<br><strong>Response:</strong> ${esc(m.response)}</p><p class="muted">${esc(m.limitation)} Detection does not prove a release was blocked.</p>`;}
function crosswalk(){
 return disclosure('RCM and control-library crosswalk',`<p>These are illustrative links between the same control objectives, not a formal COSO mapping. The RCM uses AI-01–AI-16; library and older workpaper IDs are aliases.</p><div class="crosswalk-table"><table><caption>Example RCM control references</caption><thead><tr><th scope="col">RCM ID / domain</th><th scope="col">Stage and library references</th></tr></thead><tbody>${controlNames.map((name,i)=>{const id='AI-'+String(i+1).padStart(2,'0'),mapped=M.stages.filter(s=>s.rcmIds.includes(id));return `<tr id="rcm-${id}"><th scope="row">${id}<br>${name}</th><td>${mapped.map(s=>s.title).join(', ')}<br>${[...new Set(mapped.flatMap(s=>s.libraryIds))].map(k=>`<a href="./control-matrix.html#control-${k}">${k}</a>`).join(' · ')}</td></tr>`;}).join('')}</tbody></table></div><p><strong>Older workpaper aliases:</strong> ${Object.entries(aliases).map(([id,ids])=>`${id} → ${ids.join(', ')}`).join('; ')}.</p><a href="./downloads/AI_Approval_Example_RCM.xlsx" download>Download the same 16-control example RCM ↓</a>`);
}
function render(){
 if(error){
  delete app.dataset.caseScenario;delete app.dataset.caseEvents;delete app.dataset.caseRevision;
  const old='./experience.html'+(location.hash.startsWith('#case=')?location.hash:'');
  app.innerHTML=`<h1>${legacy?'Previous simulation link':'Case link not accepted'}</h1><p role="alert">${esc(error)}</p><p>No new case or favorable conclusion has been substituted.</p>${legacy?`<p><a id="legacy-case-link" href="${esc(old)}">Open this exact case in the advanced walkthrough →</a></p>`:''}<button type="button" data-reset="fresh">Start a fresh happy-path example</button>`;
  document.querySelectorAll('.site-chapters a').forEach(a=>{const u=new URL(a.href);u.search='';u.hash='';a.href=u.href;});
  return;
 }
 const x=M.evaluate(caseData),s=M.stages[state.stage],m=M.monitor(state.stage,x),amber=x.checks&&!x.automatic?' amber':'';
 app.dataset.caseScenario=x.id;app.dataset.caseEvents=String(x.eventCount);app.dataset.caseRevision=x.revision;
 const context=`<div class="context"><span class="badge${amber}">${esc(x.authorization?x.authorizationStatus:x.route)}</span><p>${esc(x.summary)}</p><p class="case-status"><strong>Authorization:</strong> ${esc(x.authorizationStatus)}<br><strong>Release:</strong> ${esc(x.release)} · <strong>Production:</strong> ${esc(x.deployment)}</p></div>`;
 const actions=`<section class="journey-actions" aria-label="Advance the fictional case"><div><strong>${x.nextAction?'Next simulation action':'Example complete'}</strong><p class="muted">${x.nextAction?'Only this action advances the case. Stage buttons inspect it.':'Deployment and reconciliation records now link to the authorized revision. This establishes no live control effectiveness.'}</p></div>${x.nextAction?`<button type="button" data-action="${x.nextAction}">${esc(x.nextLabel)} →</button>`:''}<button type="button" data-reset="current" class="reset-case">Reset example</button></section>`;
 const summary=`<div class="monitor-summary"><strong>Monitor · ${m.status}</strong><p>${esc(s.monitor)}</p><small>Owner: ${esc(s.owner)}</small></div>`;
 const routes=`<div class="guide-links">${[['index.html','Field Guide'],['engineering-blueprint.html','Blueprint'],['independent-assurance.html','Assurance']].filter(([file])=>!((page==='field'&&file==='index.html')||(page==='blueprint'&&file==='engineering-blueprint.html')||(page==='assurance'&&file==='independent-assurance.html'))).map(([file,label])=>`<a href="${link(file)}">${label} →</a>`).join('')}</div>`;
 let html='';
 if(page==='field'){
  html=`<span class="eyebrow">Engineering · Risk/GRC · Audit</span><h1>AI approval: from design to assurance</h1><div class="intro-grid"><div><strong>The problem</strong><p>AI judgment can vary. Approval needs clear authority and safeguards.</p></div><div><strong>The objective</strong><p>Explore what to build, evidence, monitor and evaluate.</p></div><div><strong>The example</strong><p>Follow one fictional change from review through production.</p></div></div><div class="scenario-controls" role="group" aria-label="Simulation scenarios">${Object.entries(M.scenarios).map(([id,v])=>`<button type="button" data-scenario="${id}" aria-pressed="${id===x.id}">${esc(v.label)}</button>`).join('')}</div>${context}${actions}<h2 id="pipeline-section">Proposed pipeline</h2>${picker(x)}<p class="route-branch${amber}"><strong>Approval route:</strong> ${x.automatic?'Two qualifying AI reviews + eligible scope → policy authorization':'Protected scope or nonqualifying AI review → human review → independent human approval'} → merge & build → release gate → production.<br>Mandatory tests apply to both routes.</p><section class="stage-card" aria-labelledby="selected-stage"><span class="eyebrow">0${state.stage+1} / INSPECT STAGE</span><h2 id="selected-stage" tabindex="-1">${s.title}</h2>${summary}${disclosure('Engineering requirement',`<p>${esc(s.requirement)}</p><p><strong>Evidence:</strong> ${esc(s.evidence)}</p>`)}${disclosure('Monitoring requirement',monitorBody(m))}${disclosure('Audit evaluation',`<p>${esc(s.test)}</p><p><strong>Evidence to inspect:</strong> ${esc(s.evidence)}</p><p>Test design separately from operation over a defined period. A successful example does not establish either in a real environment.</p>`)}${controls(s)}${routes}</section>`;
 }else if(page==='blueprint'){
  html=`<a href="${link('index.html')}">← Back to the shared case</a><h1>Build the safeguards</h1>${context}${actions}<div class="stage-sidebar">${picker(x)}<section class="stage-card"><h2 id="selected-stage" tabindex="-1">${s.title}</h2><p>${esc(s.requirement)}</p>${summary}${disclosure('Acceptance checks',`<ul><li>${esc(s.test)}</li><li>Missing required revision, actor or applicable version identity cannot qualify as valid approval.</li><li>Human approval cannot waive mandatory CI or release checks.</li></ul>`,true)}${disclosure('Worked monitor',monitorBody(m))}${disclosure('Policy and evidence contract',`<p>Management defines eligible classes, approver authority and non-waivable requirements. Protect policy administration and monitor ${esc(s.owner)}’s response.</p><p>${esc(s.evidence)} Bind records to the revision and applicable versions.</p>`)}${controls(s)}${routes}</section></div>`;
 }else{
  const records={checks:x.checks,validation:x.validation,authorization:x.authorization,build:x.build,release:x.releaseRecord,deployment:x.deploymentRecord,reconciliation:x.reconciliation};
  const rows={Change:x.id==='protected'?'Shared library → usage → billing':'Documentation correction',Revision:x.revision,'Policy / mapping':x.policy+' / '+x.mapping,'AI review A / B':x.reviewA+' / '+x.reviewB,Authorization:x.authorizationStatus,'Approval record':x.authorization?.recordId||'Not recorded',Artifact:x.build?.digest||'Not built','Release gate':x.release,Production:x.deployment,Reconciliation:x.monitoring};
  html=`<a href="${link('index.html')}">← Back to the shared case</a><h1>Evaluate the evidence</h1>${context}${actions}${picker(x)}<div class="evidence-grid"><section><h2>Pipeline evidence</h2><dl>${Object.entries(rows).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${disclosure('View linked example records',`<pre>${esc(JSON.stringify(records,null,2))}</pre>`)}</section><section><span class="badge">Illustrative records · no audit conclusion</span><h2 id="selected-stage" tabindex="-1">${s.title}: audit evaluation</h2><p><strong>Control objective</strong><br>${esc(s.control)}</p><p><strong>Inspect and test</strong><br>${esc(s.test)}</p><p><strong>Expected evidence</strong><br>${esc(s.evidence)}</p><p class="muted">Records demonstrate example logic only. Validate source reliability, population coverage and operation over the intended reliance period separately.</p>${controls(s)}</section></div>${summary}${disclosure('Worked monitor and response',monitorBody(m))}<div class="guide-links"><a class="primary" href="./downloads/AI_Approval_Example_RCM.xlsx" download>Download example RCM ↓</a><a href="./control-matrix.html">Control library →</a></div>${crosswalk()}${disclosure('Additional testing considerations','<p>Challenge stale revisions, missing mappings, policy changes, inherited administrative access, alternate deployment routes, artifact substitution, vendor/model changes and recovery. These are testing considerations, not extra scenarios.</p>')}${routes}`;
 }
 app.innerHTML=html+'<p class="muted">Editable fictional simulation · No live pipeline connection · Synthetic records are not operating evidence.</p>';
 document.querySelectorAll('.site-chapters a').forEach(a=>{const u=new URL(a.href);a.href=link(u.pathname.split('/').pop());});
 const section=new URLSearchParams(location.search).get('section');
 if(section&&/^[A-Za-z][A-Za-z0-9_-]{0,80}$/.test(section)){
  const target=document.getElementById(section);if(target){for(let p=target;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}
 }
}
app.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 let focus='';
 try{
  if(b.dataset.reset){if(error||b.dataset.reset==='fresh'){state={scenario:'happy',stage:0};caseData=M.initial('happy');}else{caseData=M.initial(caseData.scenario);state.stage=0;}error='';legacy=false;focus='[data-reset="current"]';}
  else if(b.dataset.scenario){caseData=M.initial(b.dataset.scenario);state={scenario:caseData.scenario,stage:0};focus=`[data-scenario="${caseData.scenario}"]`;}
  else if(b.dataset.action){caseData=M.transition(caseData,b.dataset.action);state.stage={REVIEW:2,AUTHORIZE:3,BUILD:4,RELEASE:5,DEPLOY:6,MONITOR:6}[b.dataset.action];focus='[data-action], [data-reset="current"]';}
  else if(b.dataset.step!==undefined){state.stage=Number(b.dataset.step);focus=`[data-step="${state.stage}"]`;}
  else return;
  persist();render();app.querySelector(focus)?.focus({preventScroll:true});const x=M.evaluate(caseData);announce(`${M.stages[state.stage].title}. ${x.authorizationStatus}. ${x.release}. ${x.deployment}. ${x.monitoring}.`);
 }catch(e){announce(e.message);}
});

// A fragment is also the case carrier. Local reference links must not replace it.
document.addEventListener('click',event=>{
 const a=event.target.closest('a[href]');if(!a)return;
 if(a.classList.contains('site-skip')){event.preventDefault();const target=document.getElementById('main-content');target.focus({preventScroll:true});target.scrollIntoView({block:'start'});return;}
 if(error)return;const u=new URL(a.href,location.href);
 if(u.origin!==location.origin||u.pathname!==location.pathname||!u.hash||/^#(?:guide|case)=/.test(u.hash))return;
 const id=u.hash.slice(1);if(!/^[A-Za-z][A-Za-z0-9_-]{0,80}$/.test(id))return;
 const target=document.getElementById(id);if(!target)return;
 event.preventDefault();u.searchParams.set('scenario',caseData.scenario);u.searchParams.set('step',state.stage);u.searchParams.set('section',id);u.hash=M.encode(caseData);history.replaceState(null,'',u);
 for(let p=target;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
 target.scrollIntoView({block:'start'});
});
function restore(){load();render();}
window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);restore();
})();
