/* Shared risk-aware SDLC navigation; presentation only, never an approval engine. */
(function(root){
'use strict';
const doc=root.document,model=root.SharedPipelineContext,scenarios=root.RiskScenarioStages;
const host=doc&&doc.getElementById('risk-stage-context');
if(!host||!model||!scenarios)return;
const lens=host.dataset.perspective;
if(!['engineering','monitoring','assurance'].includes(lens))return;
const labels={introduced:'Introduced',exposed:'Exposed',mitigated:'Potential safeguard'};
const names={'RR-02':'Unsafe change misclassified low risk','RR-01':'Unauthorized automated authorization','RR-04':'Deployment bypasses approved change path'};
const q=new URLSearchParams(root.location.search);
let risk=Object.hasOwn(scenarios,q.get('risk'))?q.get('risk'):'RR-02';
let stage=model.stageFromLocation(root.location.search);
if(stage===null)stage=scenarios[risk][0][0];
function node(tag,txt,parent,cls){const el=doc.createElement(tag);if(txt!==null&&txt!==undefined)el.textContent=txt;if(cls)el.className=cls;(parent||host).append(el);return el}
function link(l,label,st){const a=node('a',label);a.href='./'+model.urls[l]+'?risk='+encodeURIComponent(risk)+'&stage='+st+'#'+(l==='risk'?'risk-sdlc-trace':'risk-stage-context');if(l===lens)a.setAttribute('aria-current','page');return a}
const eyebrow=node('span','SHARED SDLC INVESTIGATION',host,'risk-context-eyebrow');
const title=node('h2','One risk. Seven stages. Four perspectives.',host);
node('p','Follow where a failure originates, creates exposure, and may be interrupted. Each perspective explains a different responsibility for the same change.',host,'risk-context-intro');
const form=node('label',undefined,host,'risk-context-label');node('span','Selected risk scenario',form);
const chooser=node('select',undefined,form,'risk-context-select');
for(const key of ['RR-02','RR-01','RR-04']){const opt=node('option',key+' · '+names[key],chooser);opt.value=key}
const legend=node('div',undefined,host,'risk-context-legend');
for(const kind of ['introduced','exposed','mitigated'])node('span',labels[kind],legend,'risk-context-'+kind);
const buttons=node('div',undefined,host,'risk-context-stages');buttons.setAttribute('role','group');buttons.setAttribute('aria-label','Seven software delivery stages');
const detail=node('div',undefined,host,'risk-context-detail');detail.setAttribute('aria-live','polite');
node('p','Illustrative mapping; potential safeguards are not verified as implemented or effective. Unmarked stages are not risk-free.',host,'risk-context-caveat');
function localTarget(){return lens==='engineering'?'technical-requirements':lens==='monitoring'?'monitoring-guide':'prelaunch-validation'}
function syncExistingStage(){
 if(lens==='assurance')return;
 const selector=doc.getElementById(lens==='engineering'?'stages':'stage-pickers');
 const button=selector&&selector.querySelectorAll('button')[stage];
 if(button)button.click();
}
function save(){
 const url=new URL(root.location.href);
 url.searchParams.set('risk',risk);url.searchParams.set('stage',String(stage));
 root.history.replaceState(null,'',url);
}
function render(){
 chooser.value=risk;buttons.replaceChildren();detail.replaceChildren();
 for(const item of model.stages){
  const roles=[...new Set(scenarios[risk].filter(x=>x[0]===item.id).map(x=>x[1]))];
  const b=node('button',undefined,buttons,'risk-context-stage');
  b.type='button';b.setAttribute('aria-pressed',String(item.id===stage));
  node('strong',String(item.id+1).padStart(2,'0')+' · '+item.title,b);
  const chips=node('span',undefined,b,'risk-context-chips');
  for(const kind of roles)node('small',labels[kind],chips,'risk-context-'+kind);
  if(!roles.length)node('small','—',chips,'risk-context-unmapped');
  b.addEventListener('click',()=>{stage=item.id;syncExistingStage();save();render()});
 }
 const st=model.stages[stage],rows=scenarios[risk].filter(x=>x[0]===stage);
 node('strong','Stage '+String(stage+1).padStart(2,'0')+' · '+st.title,detail,'risk-context-stage-title');
 if(rows.length){
  for(const [,kind,description] of rows){
   const p=node('p',undefined,detail,'risk-context-event risk-context-'+kind);
   node('b',labels[kind]+': ',p);
   p.append(doc.createTextNode(description));
  }
 }else node('p','No specific propagation point is mapped here for this scenario. '+st.summary,detail,'risk-context-empty');
 const record=model.trace[stage],test=model.assuranceTests[stage];
 let text=null;
 if(lens==='engineering')text=record?.engineering||'Use the Engineering stage explorer below for this stage’s requirements, implementation, and validation criteria.';
 if(lens==='monitoring')text=record?.monitoring||'Use the Monitoring stage details below to examine signals, exception investigations, and response.';
 if(lens==='assurance')text=record?.assurance||test?.expected||'Refer to the control domains and technical test procedures below for relevant evidence and challenge tests.';
 node('p',text,detail,'risk-context-perspective');
 const action=node('div',undefined,detail,'risk-context-actions');
 const local=node('a',lens==='engineering'?'Inspect implementation and validation':lens==='monitoring'?'Inspect monitoring signals':'Inspect control domains and assurance evidence',action);
 local.href='#'+localTarget();
 if(lens==='engineering'||lens==='monitoring')local.addEventListener('click',()=>syncExistingStage());
 const nav=node('nav',undefined,detail,'risk-context-links');nav.setAttribute('aria-label','Keep selected risk and stage across perspectives');
 for(const [key,label] of [['risk','Risk'],['engineering','Engineering'],['monitoring','Monitoring'],['assurance','Assurance']])nav.append(link(key,label,stage));
}
chooser.addEventListener('change',()=>{if(!Object.hasOwn(scenarios,chooser.value))return;risk=chooser.value;stage=scenarios[risk][0][0];syncExistingStage();save();render()});
root.addEventListener('popstate',()=>{const p=new URLSearchParams(root.location.search);if(Object.hasOwn(scenarios,p.get('risk')))risk=p.get('risk');const next=model.stageFromLocation(root.location.search);if(next!==null)stage=next;syncExistingStage();render()});
render();
})(typeof window!=='undefined'?window:globalThis);
