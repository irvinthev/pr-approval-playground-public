import {projectConnectedReport} from './challenge-connected-report-data.mjs';

// V6 renders a validated assessment exactly once. Interactive strategy
// selections compare pre-generated conditional outcomes; they never call Gemini,
// mutate safeguard status, or represent actual management authorization.
const node=(tag,cls='',content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;};
const add=(parent,...children)=>{for(const child of children)parent.append(child);return parent;};
const text=(parent,cls,content)=>{if(content)add(parent,node('p',cls,content));};
function link(parent,url,label){
 try{const parsed=new URL(url);if(parsed.protocol!=='https:')return;
  const a=node('a','v6-link',label);a.href=parsed.href;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
 }catch{}
}
function disclose(title,className='v6-detail'){
 const details=node('details',className);details.append(node('summary','',title));return details;
}
function kicker(label){return node('span','v6-kicker',label);}
function jumpButton(textValue,action,cls='v6-button'){
 const button=node('button',cls,textValue);button.type='button';button.addEventListener('click',action);return button;
}
function renderActors(parent,challenge){
 const actorWrap=node('div','v6-actors');
 const roles=challenge?[
  ['Decision authority',challenge.boundary.decision],
  ['Execution mechanism',challenge.boundary.execution],
  ['Independent enforcement',challenge.boundary.enforcement]
 ]:[
  ['Decision authority','Who is authorized to make the decision?'],
  ['Execution mechanism','Which identity or tool performs the action?'],
  ['Independent enforcement','What boundary actually restricts the outcome?']
 ];
 for(const [title,body] of roles){
  const card=node('div','v6-actor');
  add(card,node('strong','',title),node('span','',body));
  actorWrap.append(card);
 }
 parent.append(actorWrap);
 text(parent,'v6-note','Architecture responsibilities are based on the proposal, not verified identities, permissions or deployment configuration.');
}
export function renderV6Report(target,response,scenarioText=''){
 const project=projectConnectedReport(response,scenarioText);
 if(!project)return false;
 const challenge=project.decisionChallenge;
 const root=node('div','v6-journey');
 root.setAttribute('data-version','6');
 const hero=node('section','v6-hero');
 add(hero,kicker('ENGINEERING CHALLENGE · MODEL-GENERATED · NO MANAGEMENT AUTHORIZATION'));
 add(hero,node('h2','v6-title',challenge?.objective||'What engineering problem should this design solve?'));
 text(hero,'v6-proposal',challenge?
   project.scenarioText:
   'Proposal to examine: '+project.scenarioText);
 renderActors(hero,challenge);
 root.append(hero);

 // A decision challenge is displayed only if the model supplied two
 // validated, comparable strategies. Generic proposals get no fake dilemma.
 let selectedIndex=0;
 let updateSelection=()=>{};
 const choices=node('section','v6-choices');
 if(challenge){
  add(choices,kicker('DECISION UNDER TENSION'),
    node('h3','v6-question',challenge.question),
    node('p','v6-tension',challenge.tension));
  const buttons=node('div','v6-option-grid');
  const details=node('div','v6-selected-choice');
  details.setAttribute('aria-live','polite');
  const consequence=node('p','v6-consequence');
  const evidence=node('p','v6-option-evidence');
  add(details,node('strong','','If this approach is chosen (hypothetical)'),consequence,evidence);
  const controls=challenge.options.map((option,index)=>{
    const button=node('button','v6-choice');
    button.type='button';
    button.setAttribute('aria-pressed',String(index===selectedIndex));
    add(button,node('strong','',option.label),node('span','',option.tradeoff));
    button.addEventListener('click',()=>updateSelection(index));
    buttons.append(button);
    return button;
  });
  updateSelection=index=>{
   selectedIndex=index;
   const option=challenge.options[index];
   for(const [i,button] of controls.entries())button.setAttribute('aria-pressed',String(i===index));
   consequence.textContent=option.consequence;
   evidence.textContent='What would distinguish the outcomes: '+option.verification;
   for(const block of root.querySelectorAll('[data-v6-selection]')){
    if(block.dataset.v6Selection==='failure')block.textContent=option.verification;
    if(block.dataset.v6Selection==='management')block.textContent=option.managementImplication;
   }
   for(const card of root.querySelectorAll('[data-v6-safeguard]')){
    card.classList.toggle('v6-emphasis',Number(card.dataset.v6Safeguard)===option.safeguardIndex);
   }
   const selectedLabel=root.querySelector('[data-v6-option-label]');
   if(selectedLabel)selectedLabel.textContent=option.label;
   const focusLink=root.querySelector('[data-v6-safeguard-action]');
   if(focusLink){
    focusLink.hidden=option.safeguardIndex===null;
    focusLink.dataset.focus=String(option.safeguardIndex);
    focusLink.textContent=option.safeguardIndex===null?
      'No directly matched safeguard':'Inspect safeguard S'+(option.safeguardIndex+1);
   }
  };
  choices.append(buttons,details);
 }else{
  add(choices,kicker('ARCHITECTURE QUESTION'),
    node('h3','v6-question',project.leadRisk||'Which condition would change this decision?'));
  text(choices,'v6-tension',project.leadRiskReason||project.basis);
  text(choices,'v6-note','Gemini did not return a defensible two-option design choice. No artificial decision was generated.');
 }
 root.append(choices);

 const tabs=node('div','v6-tabs');tabs.setAttribute('role','tablist');
 tabs.setAttribute('aria-label','Engineering assessment views');
 const content=node('div','v6-content');
 const panels=[
  ['failure','01 · Failure Path'],
  ['safeguards','02 · Engineering Safeguards'],
  ['management','03 · Management Considerations']
 ];
 const tabButtons=[],tabPanels={};
 function setTab(key,{focus=false}={}){
  for(const [id] of panels){
   const active=id===key;
   tabPanels[id].hidden=!active;
   const tab=tabButtons.find(t=>t.dataset.tab===id);
   tab.setAttribute('aria-selected',String(active));
   tab.tabIndex=active?0:-1;
   if(active&&focus)tab.focus();
  }
 }
 for(const [index,[key,label]] of panels.entries()){
  const button=node('button','v6-tab',label);
  button.id='v6-tab-'+key;
  button.type='button';button.dataset.tab=key;
  button.setAttribute('role','tab');
  button.setAttribute('aria-selected','false');
  button.setAttribute('aria-controls','v6-panel-'+key);
  button.addEventListener('click',()=>setTab(key));
  button.addEventListener('keydown',event=>{
   const next=event.key==='ArrowRight'?panels[(index+1)%3][0]:
    event.key==='ArrowLeft'?panels[(index+2)%3][0]:
    event.key==='Home'?panels[0][0]:event.key==='End'?panels[2][0]:null;
   if(next){event.preventDefault();setTab(next,{focus:true});}
  });
  const panel=node('section','v6-panel');
  panel.id='v6-panel-'+key;
  panel.setAttribute('role','tabpanel');
  panel.setAttribute('aria-labelledby',button.id);
  tabButtons.push(button);tabPanels[key]=panel;
  tabs.append(button);content.append(panel);
 }
 root.append(tabs,content);

 // Failure Path: the real model-provided causal stages, not fixed PR examples.
 const failure=tabPanels.failure;
 add(failure,kicker('FAILURE PATH · PROPOSED'),node('h3','', 'Where could the workflow depart from the intended decision?'));
 if(project.riskPath){
  text(failure,'v6-note','An illustrative causal trace, not evidence that the proposed stopping mechanisms are implemented.');
  const stages=node('div','v6-stage-buttons');
  const stageCard=node('section','v6-stage-card');
  stageCard.setAttribute('aria-live','polite');
  const stageHeading=node('h3','v6-stage-title');
  const stageEvent=node('p','v6-stage-event');
  const good=node('p',''),bad=node('p',''),stop=node('p',''),stageEvidence=node('p','');
  const grid=node('div','v6-outcomes');
  for(const [cls,label,el] of [
   ['good','Expected safe behavior',good],['bad','Plausible failure',bad],
   ['stop','Potential stopping mechanism',stop],['evidence','Evidence to inspect',stageEvidence]
  ]){
   const card=node('div','v6-outcome v6-'+cls);
   add(card,node('strong','',label),el);grid.append(card);
  }
  add(stageCard,stageHeading,stageEvent,grid);
  if(challenge){
   const selection=node('div','v6-selection-box');
   add(selection,node('strong','','For the selected design approach'),
     node('span','v6-note','What needs checking:'),
     node('p',''));
   selection.lastElementChild.dataset.v6Selection='failure';
   stageCard.append(selection);
  }
  const focus=jumpButton('Inspect related safeguard',()=>{
   const index=Number(focus.dataset.focus);
   if(!Number.isInteger(index)||!project.safeguards[index])return;
   showSafeguard(index);
  },'v6-button v6-safeguard-jump');
  focus.dataset.v6SafeguardAction='1';
  focus.hidden=!challenge||challenge.options[selectedIndex].safeguardIndex===null;
  stageCard.append(focus);
  const buttonNodes=[];
  function selectStage(id){
   const mapped=project.riskPath.steps.find(x=>x.id===id);
   const stage=project.riskPath.stages.find(x=>x.id===id);
   for(const b of buttonNodes)b.setAttribute('aria-pressed',String(b.dataset.stage===id));
   stageHeading.textContent=stage?.label||'Workflow stage';
   if(!mapped){
    stageEvent.textContent='No specific causal event was mapped to this stage. This is not evidence the stage is safe.';
    good.textContent='No stage-specific expected outcome was supplied.';
    bad.textContent='No stage-specific failure was mapped.';
    stop.textContent='No stopping point established for this stage.';
    stageEvidence.textContent='Establish relevant implementation evidence before reliance.';
    return;
   }
   stageEvent.textContent=mapped.event;
   good.textContent=mapped.goodOutcome||'If the proposed interruption works: '+(mapped.interruption||'No safe outcome was supplied.');
   bad.textContent=mapped.failureOutcome||'If this condition is not contained: '+mapped.event;
   stop.textContent=mapped.interruption||'No specific stop was supplied; implementation not assessed.';
   stageEvidence.textContent=mapped.evidence;
  }
  for(const stage of project.riskPath.steps){
   const b=node('button','v6-stage-button',stage.label);
   b.type='button';b.dataset.stage=stage.id;
   b.setAttribute('aria-pressed','false');
   b.addEventListener('click',()=>selectStage(stage.id));
   buttonNodes.push(b);stages.append(b);
  }
  failure.append(stages,stageCard);
  const focus=project.riskPath.steps.find(s=>s.roles.some(role=>role.id==='exposure'))||
    project.riskPath.steps.find(s=>s.roles.some(role=>role.id==='prevention'))||
    project.riskPath.steps[0];
  selectStage(focus.id);
 }else{
  text(failure,'v6-empty','No defensible stage-by-stage failure path was returned. This does not establish that the design is risk-free.');
 }
 if(project.reconciliation||project.operational){
  const operation=project.reconciliation||project.operational;
  const detail=disclose('Operational detection and recovery');
  text(detail,'v6-note',operation.question);
  if(operation.detection)text(detail,'', 'Detection: '+operation.detection);
  if(operation.response)text(detail,'','Response: '+operation.response);
  text(detail,'v6-note','Implementation: '+operation.status+' · Not independently verified.');
  failure.append(detail);
 }

 // Safeguard detail has one home; the Failure Path links here instead of
 // repeating each safeguard's full explanation.
 const safeguards=tabPanels.safeguards;
 add(safeguards,kicker('ENGINEERING SAFEGUARDS'),node('h3','','What should enforce the proposed boundary?'));
 text(safeguards,'v6-note','A source describes possible technology capabilities; it does not establish that any safeguard is implemented or effective.');
 const cards=[];
 for(const [index,safeguard] of project.safeguards.entries()){
  const details=disclose('S'+(index+1)+' · '+safeguard.objective,'v6-safeguard');
  details.dataset.v6Safeguard=String(index);
  details.id='v6-safeguard-'+index;
  add(details,node('p','v6-status','Implementation knowledge: '+safeguard.implementation));
  text(details,'',safeguard.why);
  if(safeguard.statusBasis)text(details,'v6-note','User-reported implementation basis: '+safeguard.statusBasis);
  else text(details,'v6-note','No implementation evidence was supplied to this assessment.');
  cards.push(details);safeguards.append(details);
 }
 if(!project.safeguards.length)text(safeguards,'v6-empty','No validated safeguards returned; absence of a proposed safeguard is not proof of safety.');
 if(project.experiments.length){
  const experiments=disclose('Technical experiments to consider');
  const list=node('ul','v6-list');
  for(const item of project.experiments)list.append(node('li','',item));
  experiments.append(list);safeguards.append(experiments);
 }
 function showSafeguard(index){
  if(!cards[index])return;
  setTab('safeguards');
  cards[index].open=true;
  cards[index].scrollIntoView({block:'start',behavior:'auto'});
  cards[index].querySelector('summary')?.focus({preventScroll:true});
 }

 // One management interpretation, no second duplicate recommendation.
 const management=tabPanels.management;
 add(management,kicker('MANAGEMENT CONSIDERATIONS'),
   node('h3','','What should management consider before changing the operating model?'));
 const proposal=node('article','v6-management-card');
 add(proposal,kicker('POTENTIAL APPROACH · NOT AN AUTHORIZATION'),
   node('h3','',project.recommendation));
 text(proposal,'',project.basis);management.append(proposal);
 if(project.reassessment){
  const delta=node('article','v6-management-card');
  add(delta,node('strong','','What changed after reassessment?'));
  text(delta,'',project.reassessment);management.append(delta);
 }
 if(challenge){
  const current=node('article','v6-management-impact');
  add(current,kicker('THE SELECTED DESIGN CHOICE'),
    node('h3','',challenge.options[0].label));
  current.querySelector('h3').dataset.v6OptionLabel='1';
  const implication=node('p','');implication.dataset.v6Selection='management';
  current.append(implication);management.append(current);
 }
 const compare=node('div','v6-compare');
 const alternative=node('article','v6-compare-card');
 add(alternative,kicker('SIMPLER OPTION'),node('h3','','Alternative architecture'));
 text(alternative,'',project.alternatives[0]||'No defensible simpler alternative was supplied.');
 compare.append(alternative);
 const pivot=node('article','v6-compare-card');
 add(pivot,kicker('DECISION-CHANGING UNKNOWN'),node('h3','','What evidence could change the recommendation?'));
 text(pivot,'',project.questions[0]?.question||project.perspectives.engineering.pivot);
 compare.append(pivot);management.append(compare);
 if(project.counterargument){
  const d=disclose('Strongest competing explanation');
  text(d,'',project.counterargument);management.append(d);
 }
 if(project.questions.length){
  const btn=jumpButton('Clarify & reassess with Gemini',()=>{
   const toggle=document.getElementById('cdr-toggle');
   if(toggle)toggle.click();
   const panel=document.getElementById('refine-panel');
   if(panel&&!panel.hidden){panel.scrollIntoView({block:'start'});document.getElementById('refinement-title')?.focus({preventScroll:true});}
  });
  management.append(btn);
 }

 // Compact references and stakeholder questions. Never display the old
 // detailed report in addition to V6; the existing clarification control
 // remains available through its original, independently verified flow.
 const supporting=disclose('Supporting references and role-specific questions','v6-support');
 const roleList=node('div','v6-role-list');
 for(const [name,label] of [['engineering','Engineering'],['risk','Risk & Governance'],['assurance','Independent assurance']]){
  const action=project.perspectives?.[name]?.action;
  if(action){
   const r=node('div','v6-role');
   add(r,node('strong','',label),node('p','',action));roleList.append(r);
  }
 }
 if(roleList.childElementCount)add(supporting,node('h3','','Role-specific questions'),roleList);
 const refs=[...project.references,...project.frameworkSources];
 const sourceList=node('div','v6-references');
 for(const ref of refs){
  const row=node('div','v6-reference');
  add(row,node('strong','',ref.title),
    node('span','v6-source-type',ref.used?'Referenced in model output':'Provided as reference'));
  link(row,ref.url,ref.publisher||ref.sourceTitle||'Publisher source');
  const deeper=disclose('Source scope and limitations','v6-reference-detail');
  text(deeper,'',ref.limits||'Applicability depends on the specific implementation.');
  if(ref.facts?.length)text(deeper,'',ref.facts.slice(0,2).join(' · '));
  row.append(deeper);sourceList.append(row);
 }
 if(sourceList.childElementCount)add(supporting,node('h3','','Technical references and source limits'),sourceList);
 if(project.sourceWarning)text(supporting,'v6-note',project.sourceWarning);
 for(const warning of project.advisoryWarnings)text(supporting,'v6-note',warning);
 root.append(supporting);
 text(root,'v6-footer','This is a model-generated architecture exploration. Strategy selections show prewritten conditional implications, not a new Gemini assessment, management decision, control test, or verified implementation.');
 target.replaceChildren(root);
 setTab('failure');
 if(challenge)updateSelection(0);
 return true;
}
