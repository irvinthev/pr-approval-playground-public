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
  if(data.modelGenerated)panel.append(el('span','cdr-kicker','SCENARIO-SPECIFIC MODEL ANALYSIS'));
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
  if(data.modelGenerated){
    const refs=project.references.filter(ref=>data.referenceIds.includes(ref.id));
    const section=el('div','cdr-lens-references');
    section.append(el('strong','','Technical reference support'));
    if(!refs.length){
      addText(section,'cdr-mini','No directly supporting technical source was identified for this perspective.');
    }else{
      for(const ref of refs){
        const entry=el('div','cdr-lens-reference');
        sourceLink(entry,ref.url,ref.title);
        addText(entry,'cdr-source-limit','Source limit: '+(ref.limits||'No source limit supplied.'));
        section.append(entry);
      }
    }
    panel.append(section);
  }
  root.replaceChildren(panel);
}
// Compact causal trace: select only consequential stages first, optionally
// expand all canonical touchpoints. Selection is local; no API/model calls.
function renderRiskPath(project,container){
  const path=project.riskPath;
  if(!path)return;
  const section=el('section','cdr-path');
  section.setAttribute('aria-label','Scenario risk path');
  append(section,el('span','cdr-kicker','SCENARIO RISK PATH · PROPOSED'),
    el('h3','','Where does the failure occur?'));
  addText(section,'cdr-path-failure',path.failure);
  const intro=el('p','cdr-mini','Select a stage to see the failure condition, possible stopping point and evidence to investigate.');
  section.append(intro);

  const buttons=[],selected=path.steps;
  const strip=el('div','cdr-path-strip');
  strip.setAttribute('role','group');
  strip.setAttribute('aria-label','Relevant scenario stages');
  strip.tabIndex=0;
  const detail=el('div','cdr-path-detail');
  detail.setAttribute('role','region');
  detail.setAttribute('aria-live','polite');
  detail.id='cdr-path-selected-detail';

  let activeStageId=null;
  function select(stageId){
    activeStageId=stageId;
    for(const button of buttons){
      const active=button.dataset.pathStage===stageId;
      button.setAttribute('aria-pressed',String(active));
      button.classList.toggle('cdr-path-active',active);
    }
    const mapped=selected.find(x=>x.id===stageId);
    const stage=path.stages.find(x=>x.id===stageId);
    detail.replaceChildren();
    append(detail,el('span','cdr-kicker',stage?.label||'Lifecycle stage'));
    if(!mapped){
      addText(detail,'cdr-mini','No specific causal point was mapped to this stage. This is not evidence that the stage has no risk.');
      return;
    }
    const labels=el('div','cdr-path-roles');
    for(const role of mapped.roles)labels.append(el('span','cdr-path-role cdr-path-role-'+role.id,role.label));
    detail.append(labels);
    addText(detail,'cdr-path-event',mapped.event);
    if(mapped.interruption)addText(detail,'cdr-mini','Potential interruption: '+mapped.interruption);
    addText(detail,'cdr-mini','Evidence to investigate: '+mapped.evidence);
  }
  function stageButton(stage,collection){
    const button=el('button','cdr-path-button');
    button.type='button';
    button.dataset.pathStage=stage.id;
    button.setAttribute('aria-pressed','false');
    button.setAttribute('aria-controls','cdr-path-selected-detail');
    append(button,el('strong','',stage.label));
    const mapped=selected.find(x=>x.id===stage.id);
    if(mapped){
      const badges=el('span','cdr-path-mini-roles');
      for(const role of mapped.roles)badges.append(el('i','cdr-path-dot cdr-path-dot-'+role.id));
      button.append(badges);
    }else button.classList.add('cdr-path-unmapped');
    button.addEventListener('click',()=>select(stage.id));
    collection.append(button);buttons.push(button);
  }
  for(const stage of selected)stageButton(stage,strip);
  section.append(strip,detail);
  const all=el('details','cdr-path-full');
  all.append(el('summary','','Show all '+path.stages.length+' lifecycle touchpoints'));
  const grid=el('div','cdr-path-full-grid');
  for(const stage of path.stages)stageButton(stage,grid);
  all.append(grid);
  all.addEventListener('toggle',()=>{
    if(!all.open&&!selected.some(x=>x.id===activeStageId))
      select(selected.find(x=>x.roles.some(role=>role.id==='origin'))?.id||selected[0].id);
  });
  addText(all,'cdr-mini','Unmapped does not mean risk-free. These are illustrative touchpoints, not a required workflow.');
  section.append(all);
  addText(section,'cdr-path-caveat',path.uncertainty?
    'Mapping uncertainty: '+path.uncertainty:
    'This is a proposed failure path; implementation and safeguards have not been verified.');
  addText(section,'cdr-path-caveat','This trace is model interpretation, not an observation of actual system behavior or proof that safeguards exist.');
  container.append(section);
  select(selected.find(x=>x.roles.some(role=>role.id==='origin'))?.id||selected[0].id);
}
// Precomputed conditional branches come from the original validated response.
// Selection changes only the displayed implication, never the recommendation.
function renderDecisionConditions(project,container){
  if(!project.questions.length)return;
  const section=el('section','cdr-shared');
  append(section,el('span','cdr-kicker','WHAT COULD CHANGE THE ANSWER'),
    el('h3','','Decision conditions'));
  addText(section,'cdr-mini','Choose a condition to explore an implication already generated by Gemini. No second assessment occurs; the original recommendation remains unchanged.');
  for(const [i,question] of project.questions.entries()){
    const disclosure=el('details','cdr-more');
    disclosure.open=i===0;
    disclosure.append(el('summary','',question.question));
    addText(disclosure,'cdr-mini',question.why);
    if(!question.options.length||question.implications.length!==question.options.length){
      addText(disclosure,'cdr-mini','The initial assessment did not include validated implications. This condition remains unresolved.');
      section.append(disclosure);continue;
    }
    const options=el('div','cdr-path-strip'),status=el('p','cdr-mini','Select a proposed answer to see its conditional effect.');
    status.setAttribute('aria-live','polite');
    for(const [n,option] of [...question.options,'Unknown'].entries()){
      const button=el('button','cdr-path-button',option);
      button.type='button';button.setAttribute('aria-pressed','false');
      button.addEventListener('click',()=>{
        for(const other of options.querySelectorAll('button'))other.setAttribute('aria-pressed',String(other===button));
        status.textContent=n===question.options.length?
          'Unresolved. The initial recommendation remains conditional.':
          'If '+option+': '+question.implications[n]+' This is a precomputed conditional interpretation, not a revised assessment.';
      });
      options.append(button);
    }
    disclosure.append(options,status);section.append(disclosure);
  }
  container.append(section);
}
function renderShared(project,container){
  if(project.riskPath&&!project.reconciliation&&!project.operational)return;
  const shared=el('section','cdr-shared');
  if(project.riskPath){
    const head=el('div','cdr-section-head');
    append(head,el('span','cdr-kicker','OPERATIONAL IMPLICATIONS'),el('h3','','What happens if the boundary fails?'));
    shared.append(head);
  }else{
    const head=el('div','cdr-section-head');
    append(head,el('span','cdr-kicker','SHARED TECHNICAL BASIS'),el('h3','','What could realistically go wrong?'));
    shared.append(head);
    addText(shared,'cdr-summary',project.leadRisk||'No lead risk was returned.');
    addText(shared,'cdr-mini',project.leadRiskReason);
  }
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
    if(project.reconciliation.detection)addText(recon,'cdr-mini','Detection: '+project.reconciliation.detection);
    if(project.reconciliation.response)addText(recon,'cdr-mini','Response and recovery: '+project.reconciliation.response);
    if(project.reconciliation.statusBasis)addText(recon,'cdr-mini','User-reported basis: '+project.reconciliation.statusBasis);
    addText(recon,'cdr-mini',project.reconciliation.note);
    shared.append(recon);
  }
  if(project.operational){
    const review=el('section','cdr-recon');
    append(review,el('span','cdr-kicker','SCENARIO-SPECIFIC OPERATIONS'),
      el('h3','',project.operational.title),el('span','cdr-state',project.operational.status));
    addText(review,'cdr-summary',project.operational.question);
    addText(review,'cdr-mini','Detection: '+project.operational.detection);
    addText(review,'cdr-mini','Response and recovery: '+project.operational.response);
    if(project.operational.statusBasis)addText(review,'cdr-mini','User-reported basis: '+project.operational.statusBasis);
    shared.append(review);
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
  renderRiskPath(project,root);
  renderDecisionConditions(project,root);
  const controls=el('div','cdr-tabs');
  controls.setAttribute('role','tablist');controls.setAttribute('aria-label','Assessment perspective');
  const content=el('div','cdr-content');
  const views=[['engineering','Engineering'],['risk','Risk & tradeoffs'],['assurance','Evidence & assurance']];
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
  if(project.advisoryWarnings.length){
    for(const message of project.advisoryWarnings)addText(root,'cdr-foot',message);
  }
  root.append(el('p','cdr-foot',project.advisoryGenerated?
    'Three complementary model-generated advisory perspectives. Source links document technical capabilities, not evidence of the actual implementation or an accepted management decision.':
    'Engineering, risk and evidence views are local projections of one model assessment, not separate model judgments or verified management decisions.'));
  target.replaceChildren(root);
  activate('engineering');
  return true;
}
