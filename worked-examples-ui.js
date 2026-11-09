(function(){
'use strict';
const W=window.WorkedExamples,host=document.getElementById('worked-examples');if(!W||!host)return;
let id='standard',condition='baseline',view='engineering';
const status=document.createElement('p');status.className='we-sr';status.setAttribute('role','status');status.setAttribute('aria-live','polite');host.after(status);
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
const link=(text,href)=>{const n=node('a',text);n.href=href;return n;};
const params=new URLSearchParams(location.search);if(Object.hasOwn(W.definitions,params.get('example')))id=params.get('example');
if(Object.hasOwn(W.definitions[id].conditions,params.get('condition')))condition=params.get('condition');
function render(announce=false){
 const x=W.evaluate(id,condition);host.replaceChildren();host.dataset.view=view;
 host.append(node('p','FOUR WORKED EXAMPLES','we-kicker'),node('h2','One event. Engineering and Assurance.'),node('p','Choose a situation, change one condition, and compare what the system reports with what an assessor would still need to establish.'));
 const choices=node('div',null,'we-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label','Worked examples');
 for(const [key,d]of Object.entries(W.definitions)){const b=node('button',d.title);b.type='button';b.setAttribute('aria-pressed',String(key===id));b.onclick=()=>{id=key;condition='baseline';render(true);document.getElementById('we-heading').focus({preventScroll:true});};choices.append(b);}host.append(choices);
 const context=node('div',null,'we-context'),heading=node('h3',x.title);heading.id='we-heading';heading.tabIndex=-1;
 context.append(heading,node('p',x.situation),node('p',x.lesson,'we-lesson'));
 const label=node('label','Challenge this example');label.htmlFor='we-condition';const select=node('select');select.id='we-condition';
 for(const [key,text]of Object.entries(x.conditions)){const o=node('option',text);o.value=key;select.append(o);}select.value=condition;
 select.onchange=()=>{condition=select.value;render(true);document.getElementById('we-condition').focus({preventScroll:true});};
 context.append(label,select);host.append(context);
 const summary=node('div',null,'we-decision');summary.append(node('span','SIMULATED WORKFLOW OUTCOME','we-kicker'),node('h3',x.decision),node('p',x.why),node('strong','Next action'),node('p',x.next));host.append(summary);
 const tabs=node('div',null,'we-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Mobile example perspective');
 for(const [key,text]of [['engineering','Engineering evidence'],['assurance','Assurance assessment']]){const b=node('button',text);b.type='button';b.dataset.perspective=key;b.setAttribute('aria-pressed',String(view===key));b.setAttribute('aria-controls','we-'+key);b.onclick=()=>{view=key;render();host.querySelector('[data-perspective="'+view+'"]').focus({preventScroll:true});};tabs.append(b);}host.append(tabs);
 const panes=node('div',null,'we-panes'),eng=node('section',null,'we-engineering');eng.id='we-engineering';eng.setAttribute('aria-label','Engineering evidence');
 eng.append(node('h3','Engineering evidence'),node('p','Selected fields from the fictional record. No live system is connected.'));
 const dl=node('dl');for(const [name,value]of x.fields){dl.append(node('dt',name),node('dd',value));}eng.append(dl);
 const raw=node('details');raw.append(node('summary','Inspect complete simulated record'));const pre=node('pre',JSON.stringify(x.record,null,2));pre.tabIndex=0;pre.setAttribute('aria-label','Scrollable simulated JSON');raw.append(pre);eng.append(raw);
 const audit=node('section',null,'we-assurance');audit.id='we-assurance';audit.setAttribute('aria-label','Assurance assessment');
 audit.append(node('h3','Assurance assessment'),node('p',x.assessment),node('p','Verified implementation: Not assessed','we-assessment'));
 const testbox=node('details');testbox.append(node('summary','How would an assessor test this?'));for(const [name,text]of x.tests){testbox.append(node('h4',name),node('p',text));}audit.append(testbox);
 const controls=node('nav',null,'we-controls');controls.setAttribute('aria-label','Related current RCM controls');controls.append(node('strong','Related controls'));for(const c of x.controls)controls.append(link('WEB15:'+c,'./rcm-view.html#control-'+c));audit.append(controls);
 panes.append(eng,audit);host.append(panes);
 const footer=node('div',null,'we-footer');footer.append(link('Open current RCM →','./rcm-view.html'),link('Follow the connected change →','./experience.html?example=shared'),link('Explore the dependency lab ↓','#billing-challenge-lab'));host.append(footer,node('p','Fictional, editable examples. Switching perspective changes only the view. Real evidence, enforcement and operation require independent verification.','we-boundary'));
 if(announce)status.textContent=x.title+'. '+x.decision+'. '+x.why;
 if(announce){const u=new URL(location.href);u.searchParams.set('example',id);u.searchParams.set('condition',condition);u.hash='worked-examples';history.replaceState(null,'',u);}
}
render();
})();
