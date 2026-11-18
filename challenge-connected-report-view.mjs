import {projectConnectedReport} from './challenge-connected-report-data.mjs';
// Contextual reading links only. These do not alter assessments or share scenario data.
const fieldGuideBase='https://irvinthev.github.io/pr-approval-playground-public/';
const fieldGuideStageLinks=Object.freeze({
  delivery:Object.freeze({
    pr:'index.html#overview-authority-preview',
    eligibility:'ai-sdlc-risk.html#risk-explorer',
    'ai-review':'engineering-blueprint.html#engineering-build-plan',
    authorization:'engineering-blueprint.html#engineering-build-plan',
    merge:'engineering-blueprint.html#technical-requirements',
    release:'continuous-monitoring.html#monitoring-guide',
    monitor:'continuous-monitoring.html#monitoring-guide',
    evidence:'independent-assurance.html#assurance-control-explorer'
  }),
  operations:Object.freeze({
    design:'engineering-blueprint.html#engineering-build-plan',
    scope:'ai-sdlc-risk.html#risk-explorer',
    authorize:'engineering-blueprint.html#engineering-build-plan',
    execute:'engineering-blueprint.html#technical-requirements',
    verify:'independent-assurance.html#assurance-control-explorer',
    observe:'continuous-monitoring.html#monitoring-guide',
    recover:'continuous-monitoring.html#monitoring-guide'
  })
});
function addFieldGuideContext(parent,pathway,stageId){
  const chapter=fieldGuideStageLinks[pathway]?.[stageId];
  if(!chapter)return;
  const link=el('a','cdr-source-link','Explore this stage in the public Field Guide ↗');
  link.href=fieldGuideBase+chapter;
  link.target='_blank';
  link.rel='noopener noreferrer';
  parent.append(link);
}

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
// Compact causal trace: select only consequential stages first, optionally
// expand all canonical touchpoints. Selection is local; no API/model calls.
// Illustrative good/failure contrast is not an observed test result.
// New model outputs may include explicit outcomes; older assessments use
// qualified fallbacks from the same validated causal trace.
function renderRiskPath(project,container){
  const path=project.riskPath;
  if(!path)return;
  const section=el('section','cdr-path cdr-failure-path');
  section.setAttribute('aria-label','Scenario failure path');
  append(section,
    el('span','cdr-kicker','FAILURE PATH · PROPOSED'),
    el('h3','','Where should the system stop this failure?'));
  addText(section,'cdr-path-failure',path.failure);
  addText(section,'cdr-mini','Compare expected safe behavior with an illustrative failure. Selecting a stage does not establish that a safeguard exists or has been tested.');

  const selected=path.steps,buttons=[];
  const strip=el('div','cdr-path-strip cdr-path-steps');
  strip.setAttribute('role','group');
  strip.setAttribute('aria-label','Scenario pipeline stages');
  const detail=el('div','cdr-path-outcome-panel');
  detail.id='cdr-path-selected-detail';
  detail.setAttribute('role','region');
  detail.setAttribute('aria-live','polite');
  let current=null;
  function outcomeCard(title,description,kind){
    const panel=el('div','cdr-path-outcome cdr-path-outcome-'+kind);
    panel.append(el('strong','cdr-path-outcome-title',title),
      el('p','',description));
    return panel;
  }
  function select(stageId){
    current=stageId;
    for(const button of buttons){
      const active=button.dataset.pathStage===stageId;
      button.setAttribute('aria-pressed',String(active));
      button.classList.toggle('cdr-path-active',active);
    }
    const mapped=selected.find(x=>x.id===stageId);
    const stage=path.stages.find(x=>x.id===stageId);
    detail.replaceChildren();
    append(detail,el('span','cdr-kicker','SELECTED STAGE · '+(stage?.label||'Lifecycle stage')));
    if(!mapped){
      addText(detail,'cdr-path-unmapped-note','No specific causal point was mapped to this stage. This does not mean the stage is safe or controlled.');
      return;
    }
    const cells=el('div','cdr-path-outcome-grid');
    const good=mapped.goodOutcome||
      (mapped.interruption?
        'If the proposed stopping point works: '+mapped.interruption:
        'No stage-specific safe outcome was supplied. Establish expected behavior before relying on this stage.');
    const failure=mapped.failureOutcome||
      'If this condition is not contained: '+mapped.event+
        ' The wider scenario could lead to: '+path.failure;
    cells.append(
      outcomeCard('What good looks like',good,'good'),
      outcomeCard('What failure looks like',failure,'bad'),
      outcomeCard('What should prevent or detect it',
        mapped.interruption||'No specific interruption was supplied for this stage. That is an assessment gap, not proof that no safeguard exists.','safeguard'),
      outcomeCard('How we would know',mapped.evidence,'evidence')
    );
    detail.append(cells);
    const source=el('p','cdr-path-event-note','Causal condition: '+mapped.event);
    detail.append(source);
    addFieldGuideContext(detail,path.pathway,stageId);
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
      const roles=el('span','cdr-path-mini-roles');
      for(const role of mapped.roles)roles.append(el('i','cdr-path-dot cdr-path-dot-'+role.id));
      button.append(roles);
    }else button.classList.add('cdr-path-unmapped');
    button.addEventListener('click',()=>select(stage.id));
    collection.append(button);buttons.push(button);
  }
  for(const stage of selected)stageButton(stage,strip);
  section.append(strip,detail);
  const all=el('details','cdr-path-full');
  all.append(el('summary','','Explore all '+path.stages.length+' lifecycle touchpoints'));
  const grid=el('div','cdr-path-full-grid');
  for(const stage of path.stages)stageButton(stage,grid);
  all.append(grid);
  all.addEventListener('toggle',()=>{
    if(!all.open&&!selected.some(x=>x.id===current))
      select(selected.find(x=>x.roles.some(role=>role.id==='origin'))?.id||selected[0].id);
  });
  addText(all,'cdr-mini','An unmapped stage is neither verified safe nor necessarily in scope. The path is a model-generated hypothesis.');
  section.append(all);

  const teamDetails=el('details','cdr-path-teams');
  teamDetails.append(el('summary','','What Engineering, Risk/GRC and IA should examine'));
  const actions=el('div','cdr-path-team-grid');
  for(const [role,label] of [
    ['engineering','Engineering'],['risk','Risk & GRC'],
    ['assurance','Independent assurance']
  ]){
    const action=project.perspectives?.[role]?.action;
    if(action)actions.append(outcomeCard(label,action,'team'));
  }
  if(actions.childElementCount)teamDetails.append(actions);
  else teamDetails.append(el('p','cdr-mini','No role-specific actions were returned.'));
  section.append(teamDetails);
  addText(section,'cdr-path-caveat',path.uncertainty?
    'Mapping uncertainty: '+path.uncertainty:
    'Stage mapping is illustrative; actual system configuration has not been inspected.');
  addText(section,'cdr-path-caveat',
    'Green and red describe hypothetical outcomes—not observed control performance. Blue identifies the selected stage.');
  container.append(section);
  select(selected.find(x=>x.roles.some(role=>role.id==='origin'))?.id||selected[0].id);
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
  details.open=false; // Source detail stays available without crowding the decision.
  const summary=el('summary','');
  append(summary,el('strong','','Referenced sources and limits'),
    el('span','cdr-mini',project.references.length+' technical · '+project.frameworkSources.length+' framework'));
  details.append(summary);
  details.append(el('p','cdr-mini','A model-returned source ID shows attribution in its output, not live retrieval, independent verification, or proof that a safeguard is configured.'));
  const cards=el('div','cdr-source-grid');
  for(const source of project.references){
    const s=card(cards,source.title,'','cdr-source');
    s.prepend(el('span','cdr-kicker',source.used?'Referenced in model output':'Provided to model (not referenced)'));
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
// Shared decision first. Role-specific prompts are supporting considerations,
// never separate recommendations or independent assurance conclusions.
export function renderConnectedReport(target,response,scenarioText=''){
  const project=projectConnectedReport(response,scenarioText);
  if(!project){
    target.replaceChildren(el('p','','This response cannot be projected into a shared assessment.'));
    return false;
  }
  const root=el('div','cdr cdr-decision-output');
  const header=el('header','cdr-banner cdr-decision-banner');
  append(header,
    el('span','cdr-kicker','ONE SHARED ASSESSMENT · MODEL-GENERATED · NOT AN AUTHORIZATION'),
    el('h2','','Engineering decision'),
    el('p','cdr-recommendation-text',project.recommendation));
  addText(header,'cdr-summary',project.basis);

  const issue=project.questions[0]?.question||project.perspectives.engineering.pivot;
  const gate=el('div','cdr-decision-gate');
  gate.append(el('strong','','What could change the recommendation?'));
  addText(gate,'cdr-gate-question',issue||'No specific decision-changing question was returned.');
  if(project.questions.length>1)
    addText(gate,'cdr-mini',(project.questions.length-1)+' other clarification question(s) are available in the detailed assessment.');
  if(project.questions.length){
    const answer=el('button','cdr-answer-button','Answer clarification questions and reassess');
    answer.type='button';
    answer.addEventListener('click',()=>{
      const toggle=document.getElementById('cdr-toggle');
      if(toggle&&document.getElementById('result')?.classList.contains('cdr-active'))
        toggle.click();
      const panel=document.getElementById('refine-panel');
      if(panel&&!panel.hidden){
        panel.scrollIntoView({block:'start'});
        const heading=document.getElementById('refinement-title');
        if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
      }
    });
    gate.append(answer);
  }
  const total=project.safeguards.length;
  const unknown=project.safeguards.filter(x=>x.implementation==='Unknown').length;
  const reported=project.safeguards.filter(x=>x.implementation.includes('user-reported')).length;
  const evidence=el('p','cdr-evidence-summary');
  evidence.textContent=total?
    'Implementation knowledge: '+unknown+' of '+total+' expected safeguards lack a reported implementation status; '+
    reported+' are user-reported. No independently verified effectiveness was supplied to this assessment.':
    'No safeguard implementation evidence was returned. Unknown must not be interpreted as absent or ineffective.';
  gate.append(evidence);
  header.append(gate);
  root.append(header);

  const options=el('section','cdr-decision-section');
  append(options,el('span','cdr-kicker','CHALLENGE THE OPERATING MODEL'),
    el('h3','','Compare the current path, proposal and simpler alternatives'));
  const optionGrid=el('div','cdr-option-grid');
  card(optionGrid,'Current workflow · establish the baseline',
    'Existing effort, review quality, failure modes and enforcement have not been independently measured here. Compare them before concluding automation is better or worse.','cdr-option-card');
  card(optionGrid,'Proposed workflow · measure the change',
    'Evaluate the benefit described in the proposal alongside the new authority, execution and operational dependencies. The recommendation above remains conditional.','cdr-option-card');
  card(optionGrid,'Simpler architecture · compare before committing',
    project.alternatives[0]||'No scenario-specific simpler alternative was returned. Consider redesigning or eliminating the friction before automating it.','cdr-option-card');
  options.append(optionGrid);
  root.append(options);

  const exposure=el('section','cdr-decision-section');
  append(exposure,el('span','cdr-kicker','MATERIAL EXPOSURE'),
    el('h3','','How could the proposal fail?'));
  const risk=el('div','cdr-lead-exposure');
  addText(risk,'cdr-risk-label',project.leadRisk);
  addText(risk,'cdr-summary',project.leadRiskReason||
    'The submitted assessment did not describe the conditions for this failure.');
  exposure.append(risk);
  if(project.counterargument){
    const counter=el('div','cdr-counter');
    append(counter,el('strong','','Strongest competing explanation'),
      el('p','cdr-mini',project.counterargument));
    exposure.append(counter);
  }
  root.append(exposure);

  const safeguards=el('section','cdr-decision-section');
  append(safeguards,el('span','cdr-kicker','SHARED FACTS · NOT THREE SEPARATE REPORTS'),
    el('h3','','Expected safeguards and what is actually known'));
  if(!project.safeguards.length){
    addText(safeguards,'cdr-mini','The assessment did not return expected safeguards; do not infer adequate coverage.');
  }else{
    const grid=el('div','cdr-safeguard-ledger');
    for(const item of project.safeguards){
      const entry=el('article','cdr-safeguard-entry');
      append(entry,el('strong','',item.objective),
        el('span','cdr-safeguard-status',item.implementation));
      addText(entry,'cdr-mini',item.why);
      addText(entry,'cdr-source-limit',item.statusBasis?
        'Implementation claim from proposal: '+item.statusBasis:
        'No implementation basis supplied. Proposed safeguard; effectiveness not assessed.');
      grid.append(entry);
    }
    safeguards.append(grid);
  }
  addText(safeguards,'cdr-mini',
    'A referenced technical capability is not evidence that a safeguard is configured or effective in the proposed environment.');
  root.append(safeguards);

  const roles=el('section','cdr-decision-section cdr-role-section');
  append(roles,el('span','cdr-kicker','THREE RESPONSIBILITIES · ONE UNDERLYING ASSESSMENT'),
    el('h3','','Next consideration by role'));
  const rows=el('div','cdr-role-rows');
  const rolesList=[
    ['engineering','Engineering'],
    ['risk','Risk & GRC'],
    ['assurance','Independent Assurance — evidence questions only']
  ];
  for(const [key,name] of rolesList){
    const item=el('div','cdr-role-row');
    append(item,el('strong','',name),el('p','',project.perspectives[key].action));
    rows.append(item);
  }
  roles.append(rows);
  addText(roles,'cdr-mini','Suggested next steps are not management decisions, risk acceptance or independent assurance conclusions.');
  root.append(roles);

  const more=el('details','cdr-more cdr-supporting');
  more.append(el('summary','','Supporting analysis: operational path, tests and source limits'));
  const details=el('div','cdr-supporting-body');
  if(project.experiments.length){
    details.append(el('h3','','Potential experiments (not evidence of execution)'),
      bulletList(project.experiments,5));
  }
  renderShared(project,details);
  more.append(details);
  root.append(more);
  renderSources(project,root);
  if(project.reassessment){
    const delta=el('div','cdr-reassess-delta');
    append(delta,el('strong','','What changed on reassessment?'),
      el('p','',project.reassessment));
    root.insertBefore(delta,options);
  }
  if(project.sourceWarning)addText(root,'cdr-source-limit',project.sourceWarning);
  for(const message of project.advisoryWarnings)addText(root,'cdr-source-limit',message);
  root.append(el('p','cdr-foot',
    'These role-specific next considerations are generated from the same assessment. They do not constitute separate risk acceptance or an independent assurance opinion.'));
  // Preserve all existing analysis; move it into focused presentation tabs.
  const brief=el('section','cdr-workspace-panel');
  const safeguardPanel=el('section','cdr-workspace-panel');
  const failurePanel=el('section','cdr-workspace-panel');
  brief.id='cdr-workspace-brief';
  safeguardPanel.id='cdr-workspace-safeguards';
  failurePanel.id='cdr-workspace-failure';
  for(const node of [...root.children]){
    if(node===safeguards)safeguardPanel.append(node);
    else if(node===roles){
      const disclosure=el('details','cdr-role-expand');
      disclosure.append(el('summary','','What each team should examine'),node);
      brief.append(disclosure);
    }else brief.append(node);
  }
  if(project.experiments.length){
    const experiments=el('details','cdr-safeguard-tests');
    experiments.append(el('summary','','Suggested technical experiments (not executed)'));
    experiments.append(bulletList(project.experiments,5));
    safeguardPanel.append(experiments);
  }
  if(project.riskPath)renderRiskPath(project,failurePanel);
  else failurePanel.append(
    el('p','cdr-path-unmapped-note',
      'No defensible scenario failure path was returned. The model did not identify enough reliable stage context; this is not evidence that the proposal has no risk.'));
  const navigation=el('div','cdr-workspace-tabs');
  navigation.setAttribute('role','tablist');
  navigation.setAttribute('aria-label','Challenge Lab assessment views');
  const panels=[
    ['brief','Decision Brief',brief],
    ['safeguards','Engineering Safeguards',safeguardPanel],
    ['failure','Failure Path',failurePanel]
  ];
  function activate(name){
    for(const [id,,panel] of panels){
      const active=id===name;
      panel.hidden=!active;
      navigation.querySelector('[data-view="'+id+'"]')?.setAttribute('aria-selected',String(active));
    }
  }
  for(const [id,label,panel] of panels){
    panel.setAttribute('role','tabpanel');
    panel.setAttribute('aria-labelledby','cdr-tab-'+id);
    const tab=el('button','cdr-workspace-tab',label);
    tab.id='cdr-tab-'+id;
    tab.type='button';
    tab.dataset.view=id;
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',panel.id);
    tab.setAttribute('aria-selected','false');
    tab.addEventListener('click',()=>activate(id));
    navigation.append(tab);
  }
  root.append(navigation,brief,safeguardPanel,failurePanel);
  activate('brief');
  target.replaceChildren(root);
  return true;
}
