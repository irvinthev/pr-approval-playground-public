/* Renders the shared-model billing case. No model status is labeled a control-effectiveness conclusion. */
(function(){
'use strict';
const engine=window.AuditorChallenge,root=document.getElementById('billing-challenge-lab');
if(!engine||!root)return;
const make=(tag,text,parent,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;if(parent)parent.appendChild(e);return e;};
let selected='known',tab='policy',rendered=null;
const presets=document.getElementById('billing-challenge-presets');
const intro=document.getElementById('billing-challenge-intro');
const tabs=document.getElementById('billing-challenge-tabs');
const filename=document.getElementById('billing-code-filename');
const code=document.getElementById('billing-code');
const banner=document.getElementById('billing-result-banner');
const explanation=document.getElementById('billing-result-explanation');
const expected=document.getElementById('billing-expected');
const evidence=document.getElementById('billing-evidence-body');
const controls=document.getElementById('billing-control-links');
const limits=document.getElementById('billing-limitations');
const announce=document.getElementById('billing-status');
const fileLabels={policy:'approval-policy.yaml',mapping:'dependency-map.yaml',ruleset:'github-ruleset.json',workflow:'pr-approval.yml',event:'approval-event.json'};
function switchTab(next){if(!(next in fileLabels)||!rendered)return;tab=next;filename.textContent='Fictional / '+fileLabels[tab];code.textContent=rendered.code[tab];[...tabs.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));}
for(const [id,label] of Object.entries(fileLabels)){
 const b=make('button',label,tabs,'challenge-file-tab');b.type='button';b.dataset.tab=id;b.setAttribute('aria-pressed',String(id===tab));b.addEventListener('click',()=>switchTab(id));
}
function run(key){
 if(!Object.prototype.hasOwnProperty.call(engine.scenarios,key))return;
 selected=key;
 rendered=engine.evaluate(key);
 [...presets.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===key)));
 intro.textContent=rendered.scenario.description+' Change: '+rendered.scenario.change;
 banner.textContent=rendered.outcome.replace(/_/g,' ')+' — '+(rendered.unsafe?'Modeled design failure':'Modeled automatic route blocked');
 banner.dataset.unsafe=String(rendered.unsafe);
 explanation.textContent=rendered.summary;
 expected.textContent=rendered.scenario.expected;
 evidence.replaceChildren();
 for(const item of rendered.corroboration){
  const tr=make('tr',undefined,evidence);
  for(const value of [item.name,item.source,item.reported,item.status])make('td',value,tr);
 }
 controls.replaceChildren();for(const id of rendered.controls){const a=make('a',id+' ↗',controls);a.href='./rcm-view.html#control-'+id;}
 limits.replaceChildren();for(const gap of rendered.unanswered)make('li',gap,limits);
 switchTab(tab);
 announce.textContent=rendered.scenario.title+'. '+rendered.summary;
}
for(const key of engine.keys){
 const caseData=engine.scenarios[key];
 const b=make('button',caseData.title,presets,'challenge-preset');b.type='button';b.dataset.case=key;b.setAttribute('aria-pressed','false');
 make('small',key==='known'?'Baseline: blocked correctly':key==='omitted'?'Mapping gap: unsafe route':key==='incomplete'?'Incomplete map: fail closed':'Reviewer conflict: human route',b);
 b.addEventListener('click',()=>{run(key);if(history&&history.replaceState){const url=new URL(location.href);url.hash='billing-'+key;history.replaceState(null,'',url);}});
}
const requested=location.hash.replace(/^#billing-/,'');
run(engine.keys.includes(requested)?requested:'known');
window.addEventListener('hashchange',()=>{const target=location.hash.replace(/^#billing-/,'');if(engine.keys.includes(target))run(target);});
})();
