/* Presentation-only links: the selected stage never authorizes or evaluates a change. */
(function(root){
'use strict';
const doc=root.document,model=root.SharedPipelineContext,host=doc&&doc.getElementById('stage-journey');
if(!host||!model)return;
const perspective=host.dataset.perspective;
const routes={
 engineering:{label:'Engineering',url:'engineering-blueprint.html',hash:'technical-requirements'},
 monitoring:{label:'Monitoring',url:'continuous-monitoring.html',hash:'monitoring-guide'},
 assurance:{label:'Assurance',url:'independent-assurance.html',hash:'stage-journey'}
};
let selected=model.stageFromLocation(root.location.search);
if(selected===null)selected=0;
function linkTo(lens,stage){const route=routes[lens];return './'+route.url+'?stage='+stage+'#'+route.hash;}
function el(tag,txt,cls){const n=doc.createElement(tag);if(txt!==undefined&&txt!==null)n.textContent=txt;if(cls)n.className=cls;return n;}
function render(){
 host.replaceChildren();
 const stage=model.stages[selected];
 const heading=el('h2','Follow this decision across the field guide');
 host.append(heading,el('p','Selected stage '+(selected+1)+' of 7: '+stage.title+'. Each perspective answers a different question about the same illustrative delivery stage.','stage-journey-intro'));
 if(perspective==='assurance'){
  const select=el('div',null,'stage-journey-select');select.setAttribute('role','group');select.setAttribute('aria-label','Select a stage for the assurance perspective');
  model.stages.forEach((s,i)=>{const b=el('button',(i+1)+' · '+s.title);b.type='button';b.setAttribute('aria-pressed',String(i===selected));b.addEventListener('click',()=>{selected=i;const url=new URL(root.location.href);url.searchParams.set('stage',String(i));root.history.replaceState(null,'',url);render();});select.append(b)});
  host.append(select);
 }
 const nav=el('nav',null,'stage-journey-links');nav.setAttribute('aria-label','Same stage across Engineering, Monitoring and Assurance');
 for(const [key,question] of [['engineering','What must be built and enforced?'],['monitoring','What signals and responses matter?'],['assurance','What evidence and testing support reliance?']]){
  const a=el('a',null,'stage-journey-link');a.href=linkTo(key,selected);
  a.append(el('strong',routes[key].label),el('span',question));
  if(key===perspective){a.setAttribute('aria-current','page');a.setAttribute('aria-label',routes[key].label+' (current perspective)');}
  nav.append(a);
 }
 host.append(nav);
 if(perspective==='assurance'){
  const detail=el('p',null,'stage-journey-detail');
  detail.append('For stage-specific procedures and evidence, ',(()=>{const a=el('a','open the existing testing reference →');a.href='./assurance-procedures-reference.html?stage='+selected+'#testing-guide';return a;})());
  host.append(detail);
 }
 host.append(el('p','Illustrative linkage only. A matching stage is not evidence that a control has been implemented or independently tested.','stage-journey-note'));
}
function sync(){
 const n=model.stageFromLocation(root.location.search);
 if(n!==null&&n!==selected){selected=n;render();}
}
if(perspective!=='assurance'){
 const selector=doc.getElementById(perspective==='engineering'?'stages':'stage-pickers');
 if(selector)selector.addEventListener('click',()=>root.queueMicrotask(sync));
}
root.addEventListener('popstate',sync);
render();
})(typeof window!=='undefined'?window:globalThis);
