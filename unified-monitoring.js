(function(root){
 'use strict';
 const data=root.MonitoringData,$=id=>document.getElementById('mon-'+id);let active=0;
 function el(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
 function source(id){const ref=data.references[id],a=el('a',ref.label+' ↗','source-link');a.href=ref.url;return a;}
 function workedMonitor(key){
  const api=root.MonitoringExamples,example=api.examples.find(e=>e.key===key),box=el('section',null,'worked-monitor');
  box.append(el('span','WORKED MONITOR · FICTIONAL','test-number'),el('h5',example.name),el('p','Runs: '+example.cadence),el('p','Rule: '+example.rule));
  const toggles=el('div',null,'monitor-toggles');toggles.setAttribute('role','group');toggles.setAttribute('aria-label',example.name+' sample');
  const records=el('dl',null,'monitor-records'),result=el('div',null,'monitor-result');result.setAttribute('aria-live','polite');
  function show(which){
   const record=example[which],finding=api.evaluate(key,record);records.replaceChildren();
   for(const[field,label]of Object.entries(example.fields)){const row=el('div');const value=record[field];row.append(el('dt',label),el('dd',Array.isArray(value)?value.join(', '):typeof value==='boolean'?(value?'Yes':'No'):String(value)));records.append(row);}
   result.dataset.state=finding.state;result.replaceChildren(el('strong',finding.state==='exception'?'Investigate this sample':finding.state==='pending'?'Await reconciliation':'No exception in this sample'));
   if(finding.state==='exception'){result.append(el('p','Unmet conditions: '+finding.reasons.join('; ')),el('p',finding.message||example.alert));}
   else result.append(el('p',finding.state==='pending'?finding.reasons[0]:'The displayed records meet this example’s rule. This does not establish completeness or control effectiveness.'));
   [...toggles.children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sample===which)));
  }
  for(const[which,label]of [['normal','Normal sample'],['exception','Exception sample']]){const b=el('button',label);b.type='button';b.dataset.sample=which;b.addEventListener('click',()=>show(which));toggles.append(b);}
  box.append(toggles,records,result,el('p',example.qualification,'monitor-qualification'));show('exception');return box;
 }
 function render(){
  const stage=data.stages[active];$('stage-index').textContent='STAGE '+(active+1)+' / 7';
  for(const [id,key]of [['stage-title','title'],['stage-subtitle','subtitle'],['scenario','scenario'],['risk','risk'],['concern','concern'],['principle','principle']])$(id).textContent=stage[key];
  $('framework-guidance').replaceChildren(...stage.guidance.map(g=>{const row=el('div',null,'framework-row');row.append(source(g.ref),el('p',g.text));return row;}));
  $('signal-cards').replaceChildren(...stage.signals.map((signal,i)=>{
   const card=el('article',null,'unified-mon-card signal-card');card.append(el('span','SIGNAL '+(i+1),'test-number'),el('h4',signal.title),el('p','Responsible owner: '+signal.owner,'owner'));
   card.append(workedMonitor(active+':'+i));
   const purpose=el('details');purpose.append(el('summary','Purpose, evidence and owner response'));
   for(const[label,key]of [['Watch for','signal'],['Evidence to correlate','evidence'],['Owner response','response']])purpose.append(el('h5',label),el('p',signal[key]));card.append(purpose);
   const detail=el('details');detail.append(el('summary','Exercise this monitor'),el('p',signal.exercise),el('p','Expected response: '+signal.expected));card.append(detail);
   const refs=el('div',null,'test-refs');refs.append(...signal.refs.map(source));card.append(refs);return card;
  }));
  $('pipeline-link').href='./experience.html?stage='+active+'#pipeline-section';$('assurance-link').href='./independent-assurance.html?stage='+active+'#testing-guide';
  $('control-links').replaceChildren(...stage.controls.map(id=>{const a=el('a',id+' · View control →');a.href='./control-matrix.html#control-'+id;return a;}));
  $('monitoring-stage-status').textContent='Monitoring Stage '+(active+1)+': '+stage.title;
 }
 root.renderUnifiedMonitor=function(stage){if(!Number.isInteger(stage)||stage<0||stage>6)return;active=stage;render();};
})(typeof globalThis!=='undefined'?globalThis:this);
