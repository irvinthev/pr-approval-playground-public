/* Shared stage navigation is read-only: presentation never alters simulated decisions. */
(function(root){
'use strict';
const model=root.SharedPipelineContext;
if(!model||!root.document)return;
const doc=root.document;
const host=doc.getElementById('shared-pipeline-context');
if(!host)return;
const page=host.getAttribute('data-perspective')||'risk';
const engineering=page==='engineering';
const parent=host;
let current=model.stageFromLocation(root.location.search);
if(current===null)current=engineering?0:1;
function element(tag,text,into,cls){
 const e=doc.createElement(tag);if(text!==null)e.textContent=(tag==='p'?'Qualified · ':'')+text;if(cls)e.className=cls;(into||parent).appendChild(e);return e;
}
function clean(){host.replaceChildren()}
function setStage(i,fromExisting){
 if(!Number.isInteger(i)||i<0||i>=model.stages.length)return;
 current=i;
 const url=new URL(root.location.href);
 if(url.searchParams.get('stage')!==String(i)){url.searchParams.set('stage',String(i));root.history.replaceState(null,'',url)}
 render();
 if(engineering&&!fromExisting){
  const existing=doc.querySelectorAll('#stages button');
  if(existing[i])existing[i].click();
 }
}
function stageDetail(stage,where){
 const record=model.trace[stage.id];
 const title=element('strong','Stage '+String(stage.id+1).padStart(2,'0')+' · '+stage.title,where);
 title.className='shared-stage-summary';
 if(!record){
 element('p',stage.summary+' Detailed assurance evidence mapping is currently illustrated for stages 02, 04 and 07.',where);
 if(page==='assurance'){
  const procedure=model.assuranceTests&&model.assuranceTests[stage.id];
  if(procedure){
   const details=element('details',null,where,'shared-ia-procedure');details.open=true;
   element('summary','How IA tests it · procedures and expected results',details);
   for(const [label,field] of [['Prepare & obtain','preparation'],['Execute / negative test','execution'],['Expected result','expected'],['Test operation over time','operation'],['Retain in workpaper','retain']]){
    element('strong',label,details);element('p',procedure[field],details);
   }
  }
 }return;
}
 const lens=(engineering&&new URLSearchParams(root.location.search).get('view')==='monitor')?'monitoring':page;
 element('p',record.question,where);
 if(lens==='risk'){
  element('strong','What could fail',where);element('p',record.risk,where);
 }else if(lens==='engineering'){
  element('strong','Engineering expectation',where);element('p',record.engineering,where);
  element('strong','Management evidence to retain',where);element('p',record.evidence,where);
 }else if(lens==='monitoring'){
  element('strong','Operational monitoring',where);element('p',record.monitoring,where);
  element('strong','Evidence Engineering should retain',where);element('p',record.evidence,where);
 }else{
  element('strong','Independent assurance challenge',where);element('p',record.assurance,where);
  element('strong','Management evidence to request',where);element('p',record.evidence,where);
  element('strong','What records alone cannot establish',where);element('p',record.limitation,where);
  const procedure=model.assuranceTests&&model.assuranceTests[stage.id];
  if(procedure){
   const details=element('details',null,where,'shared-ia-procedure');details.open=true;
   const summary=element('summary','How IA tests it · procedures and expected results',details);
   for(const [label,field] of [['Prepare & obtain','preparation'],['Execute / negative test','execution'],['Expected result','expected'],['Test operation over time','operation'],['Retain in workpaper','retain']]){
    element('strong',label,details);element('p',procedure[field],details);
   }
  }
 }
 const links=element('div',null,where,'shared-rcm');
 for(const id of record.controls){const link=element('a',id,links);link.href='./rcm-view.html#control-'+id}
}
function render(){
 clean();const stage=model.stages[current];
 const actualLens=engineering&&new URLSearchParams(root.location.search).get('view')==='monitor'?'monitoring':page;
 const heading=element('h2','Follow the same change through the pipeline');
 element('p',engineering?'Context connects the selected Engineering stage to risk, monitoring and independent assurance.':'Select a stage. The same stage stays selected when you change pages.');
 if(!engineering){
  const strip=element('div',null,host,'shared-stages');strip.setAttribute('role','group');strip.setAttribute('aria-label','Seven stages of AI-enabled approval');
  for(const s of model.stages){
   const btn=element('button',(s.id+1)+' · '+s.title,strip,'shared-stage');
   btn.type='button';btn.setAttribute('aria-pressed',String(s.id===current));
   btn.addEventListener('click',()=>setStage(s.id,false));
  }
 }
 const nav=element('nav',null,host,'shared-lenses');nav.setAttribute('aria-label','View selected stage in another perspective');
 for(const [lens,label] of [['risk','Risk'],['engineering','Engineering'],['monitoring','Monitoring'],['assurance','Assurance']]){
  const link=element('a',label,nav);link.href=model.href(lens,current);
  if(lens===actualLens)link.setAttribute('aria-current','page');
 }
 const detail=element('div',null,host,'shared-detail');stageDetail(stage,detail);
 element('p','Illustrative reference, not an implemented approval control or proof of audit reliance.',host,'shared-note');
}
if(engineering){
 host.classList.add('compact');
 const selectors=doc.getElementById('stages');
 if(selectors)selectors.addEventListener('click',ev=>{
  const btn=ev.target.closest('button');if(!btn)return;
  const items=[...selectors.querySelectorAll('button')],idx=items.indexOf(btn);
  if(idx>=0)root.queueMicrotask(()=>setStage(idx,true));
 });
 for(const id of ['view-build','view-monitor']){
  const btn=doc.getElementById(id);if(btn)btn.addEventListener('click',()=>root.queueMicrotask(render));
 }
}
root.addEventListener('popstate',()=>{const next=model.stageFromLocation(root.location.search);if(next!==null)current=next;render()});
render();
})(typeof window!=='undefined'?window:globalThis);
