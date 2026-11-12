/* Page-native seven-stage SDLC explainer. Never changes approval/evaluation behavior. */
(function(root){
'use strict';
const doc=root.document,model=root.SharedPipelineContext,host=doc&&doc.getElementById('risk-stage-context');
if(!host||!model)return;
const lens=host.dataset.perspective;
if(!['engineering','monitoring','assurance'].includes(lens))return;
const views={
 engineering:{eyebrow:'ENGINEERING / BUILD & VALIDATE',title:'What must Engineering implement at each stage?',intro:'Select a delivery stage to examine its build requirements, enforcement, integrations and acceptance tests. The implementation detail below follows the selected stage.',cta:'Inspect implementation & acceptance tests',anchor:'technical-requirements'},
 monitoring:{eyebrow:'MONITORING / DETECT & RESPOND',title:'How do we monitor each delivery stage?',intro:'Select a stage to inspect relevant signals, exceptions, investigation paths and operational response. The worked monitoring examples below follow the selected stage.',cta:'Inspect monitoring signals & exercises',anchor:'monitoring-guide'},
 assurance:{eyebrow:'ASSURANCE / INDEPENDENT CHALLENGE',title:'How would we independently test each stage?',intro:'Select a stage to review a proposed test, its expected outcome and the evidence needed. The six control domains below remain a separate way to organize controls.',cta:'Inspect assurance control domains',anchor:'assurance-control-explorer'}
};
const view=views[lens],urlParams=new URLSearchParams(root.location.search);
let stage=model.stageFromLocation(root.location.search);
if(stage===null)stage=0;
function node(tag,txt,parent,cls){const el=doc.createElement(tag);if(txt!==null&&txt!==undefined)el.textContent=txt;if(cls)el.className=cls;(parent||host).append(el);return el}
function updateUrl(){
 const url=new URL(root.location.href);
 url.searchParams.delete('risk'); // Risk scenarios belong exclusively to the Risk page.
 url.searchParams.set('stage',String(stage));
 root.history.replaceState(null,'',url);
}
function syncDetail(){
 if(lens==='engineering')root.EngineeringStageView?.select(stage);
 if(lens==='monitoring')root.MonitoringStageView?.select(stage);
}
node('span',view.eyebrow,host,'risk-context-eyebrow');
node('h2',view.title,host);
node('p',view.intro,host,'risk-context-intro');
const stages=node('div',null,host,'risk-context-stages');
stages.setAttribute('role','group');stages.setAttribute('aria-label','Select a stage within this '+lens+' page');
const detail=node('div',null,host,'risk-context-detail');detail.setAttribute('aria-live','polite');
node('p','Illustrative guidance only. Refer to the actual system configuration and independently sourced evidence before relying on a safeguard.',host,'risk-context-caveat');
function render(){
 stages.replaceChildren();detail.replaceChildren();
 for(const st of model.stages){
  const button=node('button',null,stages,'risk-context-stage');
  button.type='button';button.setAttribute('aria-pressed',String(st.id===stage));
  node('strong',String(st.id+1).padStart(2,'0')+' · '+st.title,button);
  node('small',lens==='engineering'?'Build & test':lens==='monitoring'?'Observe & respond':'Challenge & verify',button,'risk-context-stage-role');
  button.addEventListener('click',()=>{stage=st.id;updateUrl();syncDetail();render()});
 }
 const st=model.stages[stage],record=model.trace[stage],test=model.assuranceTests[stage];
 node('strong','Stage '+String(stage+1).padStart(2,'0')+' · '+st.title,detail,'risk-context-stage-title');
 if(lens==='engineering'){
  node('p',st.summary,detail,'risk-context-perspective');
  if(record?.engineering)node('p',record.engineering,detail,'risk-context-body');
  node('p','The implementation section below contains the applicable architecture choices, dependencies and acceptance criteria for this stage.',detail,'risk-context-body');
 }
 if(lens==='monitoring'){
  node('p',record?.monitoring||'Inspect the stage-specific monitoring examples below for observable events, evidence to correlate, exception triggers and responsible response.',detail,'risk-context-perspective');
  node('p','Use the worked signal exercises below to distinguish a normal event from an exception; they are fictional examples, not live telemetry.',detail,'risk-context-body');
 }
 if(lens==='assurance'){
  if(test){
   for(const [label,key] of [['Prepare','preparation'],['Challenge','execution'],['Expected outcome','expected'],['Test operation over time','operation'],['Retain','retain']]){
    const group=node('div',null,detail,'risk-context-test');
    node('strong',label,group);
    node('p',test[key],group);
   }
  }else node('p','No stage-specific assurance procedure is documented for this stage.',detail);
 }
 const cta=node('a',view.cta,detail,'risk-context-local-link');
 cta.href='#'+view.anchor;
}
root.addEventListener('popstate',()=>{
 const next=model.stageFromLocation(root.location.search);
 if(next!==null){stage=next;syncDetail();render()}
});
render();
})(typeof window!=='undefined'?window:globalThis);
