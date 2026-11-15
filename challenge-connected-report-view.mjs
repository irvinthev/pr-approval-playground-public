import {projectConnectedReport} from './challenge-connected-report-data.mjs';

const el=(tag,cls,text)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=text;
  return node;
};
const append=(parent,...nodes)=>{for(const node of nodes)parent.append(node);return parent;};
const addText=(parent,cls,text)=>{if(text)parent.append(el('p',cls,text));};
function bulletList(items,max=5){
  const list=el('ul','cdr-list');
  for(const item of items.slice(0,max))if(item)list.append(el('li','',item));
  return list;
}
function sourceLink(parent,href,title){
  if(!href)return;
  try{
    const url=new URL(href);
    if(url.protocol!=='https:')return;
    const link=el('a','cdr-source-link',title+' ↗');
    link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';
    parent.append(link);
  }catch{}
}
function card(parent,title,body,className='cdr-card'){
  const root=el('article',className);
  if(title)root.append(el('h3','',title));
  if(body)root.append(el('p','',body));
  parent.append(root);return root;
}
function appendView(root,view,project){
  const panel=el('section','cdr-perspective');
  panel.id='cdr-perspective-content';
  panel.setAttribute('role','tabpanel');
  panel.setAttribute('aria-labelledby','cdr-tab-'+view);
  const data=project.perspectives[view];
  const head=el('div','cdr-perspective-head');
  append(head,el('span','cdr-kicker',data.title),el('h3','',data.highlight));
  panel.append(head);
  addText(panel,'cdr-summary',data.summary);
  if(data.items.length){
    const container=el('div','cdr-perspective-details');
    append(container,el('h4','',view==='engineering'?'Design choices':'Considerations'),bulletList(data.items));
    panel.append(container);
  }
  if(view==='engineering'&&project.safeguards.length){
    const safes=el('div','cdr-safeguards');
    safes.append(el('h4','','Expected safeguards and implementation knowledge'));
    for(const safeguard of project.safeguards.slice(0,3)){
      const sc=el('div','cdr-safeguard');
      append(sc,el('strong','',safeguard.objective),el('span','cdr-safeguard-status',safeguard.implementation));
      addText(sc,'cdr-mini',safeguard.why);
      if(safeguard.statusBasis)addText(sc,'cdr-mini','Reported basis: '+safeguard.statusBasis);
      safes.append(sc);
    }
    panel.append(safes);
  }
  const next=el('div','cdr-next');
  append(next,el('span','cdr-kicker','NEXT CONSIDERATION'),el('p','',data.action));
  panel.append(next);
  if(data.pivot){
    const pivot=el('div','cdr-pivot');
    append(pivot,el('strong','','What could change this view?'),el('p','',data.pivot));
    panel.append(pivot);
  }
  root.replaceChildren(panel);
}
function renderShared(project,container){
  const shared=el('section','cdr-shared');
  const head=el('div','cdr-section-head');
  append(head,el('span','cdr-kicker','SHARED TECHNICAL BASIS'),el('h3','','What could realistically go wrong?'));
  shared.append(head);
  addText(shared,'cdr-summary',project.leadRisk||'No lead risk was returned.');
  addText(shared,'cdr-mini',project.leadRiskReason);
  if(project.reconciliation){
    const recon=el('section','cdr-recon');
    append(recon,el('span','cdr-kicker','OPERATIONAL RECONCILIATION'),el('h3','',project.reconciliation.title),
      el('span','cdr-state',project.reconciliation.status));
    const flow=el('div','cdr-recon-flow');
    for(const [i,stage] of project.reconciliation.stages.entries()){
      const node=card(flow,stage.label,stage.detail,'cdr-recon-stage');
      node.prepend(el('span','cdr-recon-index','0'+(i+1)));
    }
    recon.append(flow);
    const question=el('div','cdr-recon-question');
    append(question,el('strong','','Exception detection & response'),el('p','',project.reconciliation.question));
    recon.append(question);
    addText(recon,'cdr-mini',project.reconciliation.note);
    shared.append(recon);
  }
  container.append(shared);
}
function renderSources(project,container){
  const details=el('details','cdr-sources');
  details.open=true; // Sources and their limits are part of the primary report.
  const summary=el('summary','');
  append(summary,el('strong','','Referenced sources and limits'),
    el('span','cdr-mini',project.references.length+' technical · '+project.frameworkSources.length+' framework'));
  details.append(summary);
  const cards=el('div','cdr-source-grid');
  for(const source of project.references){
    const s=card(cards,source.title,'','cdr-source');
    s.prepend(el('span','cdr-kicker',source.used?'Used in assessment':'Provided as context'));
    addText(s,'cdr-mini',source.facts.slice(0,2).join(' · '));
    addText(s,'cdr-source-limit','Source limit: '+(source.limits||'Not stated in the selected card.'));
    sourceLink(s,source.url,source.publisher||'Open documentation');
  }
  for(const source of project.frameworkSources){
    const s=card(cards,source.title,'','cdr-source');
    s.prepend(el('span','cdr-kicker','Framework reference'));
    addText(s,'cdr-mini',source.summary);
    addText(s,'cdr-source-limit','Source limit: '+(source.limits||'Source applicability depends on the scenario.'));
    sourceLink(s,source.url,source.sourceTitle||'Open publisher reference');
  }
  if(!cards.childElementCount)cards.append(el('p','cdr-mini','No applicable publisher references were returned for this assessment.'));
  details.append(cards);container.append(details);
}
export function renderConnectedReport(target,response,scenarioText=''){
  const project=projectConnectedReport(response,scenarioText);
  if(!project){target.replaceChildren(el('p','','This response cannot be projected into a connected report.'));return false;}
  const root=el('div','cdr');
  const header=el('div','cdr-banner');
  append(header,el('span','cdr-kicker','CONNECTED ASSESSMENT · LIVE RESPONSE'),
    el('h2','','Engineering decision and supporting perspectives'));
  const recommendation=el('div','cdr-recommendation');
  append(recommendation,el('span','cdr-kicker','RECOMMENDED DIRECTION'),
    el('p','cdr-recommendation-text',project.recommendation));
  addText(recommendation,'cdr-mini',project.basis);
  header.append(recommendation);
  root.append(header);
  const controls=el('div','cdr-tabs');
  controls.setAttribute('role','tablist');controls.setAttribute('aria-label','Assessment perspective');
  const content=el('div','cdr-content');
  const views=[['engineering','Engineering advisory'],['risk','Risk disposition'],['assurance','Independent assurance']];
  function activate(view){
    for(const [name] of views){
      const tab=controls.querySelector('#cdr-tab-'+name);
      const active=name===view;
      tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
    }
    appendView(content,view,project);
  }
  for(const [index,[name,label]] of views.entries()){
    const button=el('button','cdr-tab',label);
    button.type='button';button.id='cdr-tab-'+name;
    button.setAttribute('role','tab');
    button.setAttribute('aria-controls','cdr-perspective-content');
    button.setAttribute('aria-selected',String(index===0));button.tabIndex=index===0?0:-1;
    button.addEventListener('click',()=>activate(name));
    button.addEventListener('keydown',event=>{
      const idx=views.findIndex(([key])=>key===name);
      const dest=event.key==='ArrowRight'?(idx+1)%views.length:
        event.key==='ArrowLeft'?(idx+views.length-1)%views.length:
        event.key==='Home'?0:event.key==='End'?views.length-1:-1;
      if(dest<0)return;
      event.preventDefault();activate(views[dest][0]);controls.querySelector('#cdr-tab-'+views[dest][0]).focus();
    });
    controls.append(button);
  }
  root.append(controls,content);
  renderShared(project,root);
  if(project.counterargument){
    const alternative=el('details','cdr-more');
    append(alternative,el('summary','','Counterargument and other alternatives'));
    addText(alternative,'cdr-mini',project.counterargument);
    root.append(alternative);
  }
  renderSources(project,root);
  if(project.reassessment)addText(root,'cdr-mini','Reassessment: '+project.reassessment);
  root.append(el('p','cdr-foot','This preview reuses the existing validated assessment. Separate risk-treatment and independent-assurance recommendations are not yet model-generated; missing evidence is left unresolved.'));
  target.replaceChildren(root);
  activate('engineering');
  return true;
}
