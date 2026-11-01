(function(root){
 'use strict';
 function initialStage(search){const stage=new URLSearchParams(search).get('stage');return /^[0-6]$/.test(stage||'')?Number(stage):0;}
 if(typeof module!=='undefined'&&module.exports){module.exports={initialStage};return;}
 const data=root.MonitoringData,$=id=>document.getElementById(id);let active=initialStage(location.search);
 function el(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
 function source(id){const ref=data.references[id],a=el('a',ref.label+' ↗','source-link');a.href=ref.url;return a;}
 function render(){
  const stage=data.stages[active];$('stage-index').textContent='STAGE '+(active+1)+' / 7';
  for(const [id,key]of [['stage-title','title'],['stage-subtitle','subtitle'],['scenario','scenario'],['risk','risk'],['concern','concern'],['principle','principle']])$(id).textContent=stage[key];
  $('framework-guidance').replaceChildren(...stage.guidance.map(g=>{const row=el('div',null,'framework-row');row.append(source(g.ref),el('p',g.text));return row;}));
  $('signal-cards').replaceChildren(...stage.signals.map((signal,i)=>{
   const card=el('article',null,'test-card signal-card');card.append(el('span','SIGNAL '+(i+1),'test-number'),el('h4',signal.title),el('p','Responsible owner: '+signal.owner,'owner'));
   for(const[label,key]of [['Watch for','signal'],['Evidence to correlate','evidence'],['Owner response','response']])card.append(el('h5',label),el('p',signal[key]));
   const detail=el('details');detail.append(el('summary','Exercise this monitor'),el('p',signal.exercise),el('p','Expected response: '+signal.expected));card.append(detail);
   const refs=el('div',null,'test-refs');refs.append(...signal.refs.map(source));card.append(refs);return card;
  }));
  $('pipeline-link').href='./experience.html?stage='+active+'#pipeline-section';$('assurance-link').href='./independent-assurance.html?stage='+active+'#testing-guide';
  $('control-links').replaceChildren(...stage.controls.map(id=>{const a=el('a',id+' · View control →');a.href='./control-matrix.html#control-'+id;return a;}));
  [...$('stage-pickers').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));
  $('monitoring-stage-status').textContent='Showing monitoring for stage '+(active+1)+': '+stage.title;
 }
 data.stages.forEach((stage,i)=>{const b=el('button');b.type='button';b.append(el('span',String(i+1).padStart(2,'0')),document.createTextNode(stage.title));b.addEventListener('click',()=>{active=i;render();const url=new URL(location.href);url.search='';url.searchParams.set('stage',String(i));url.hash='monitoring-guide';history.replaceState(null,'',url);$('stage-title').focus({preventScroll:true});$('monitoring-guide').scrollIntoView({behavior:'auto',block:'start'});});$('stage-pickers').append(b);});
 const status=el('p',null,'stage-status');status.id='monitoring-stage-status';status.setAttribute('role','status');$('stage-pickers').after(status);render();
})(typeof globalThis!=='undefined'?globalThis:this);
