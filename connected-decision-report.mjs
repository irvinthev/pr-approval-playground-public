// Isolated, static report-design experiment. No API calls and no persisted decisions.
// All three perspectives are authored from the same fictional architectural facts.
const VIEWS={
  engineering:{
    eyebrow:'ENGINEERING ADVISORY · DESIGN & OPERATIONS',
    title:'Use a constrained executor, not broad agent approval authority.',
    status:'Narrow pilot',
    summary:'The workflow may reduce approval friction, but its benefit depends on preserving the exact human decision when revisions change. A general coding agent is one implementation option—not the objective.',
    detailTitle:'What Engineering should consider',
    considerations:[
      'Make PR number, repository, head SHA, and explicit human instruction the input to each approval action.',
      'Define what happens after a push or rebase, partial batch failure, token expiry, retries, or a merge-queue update.',
      'Measure whether clicking Approve is the bottleneck. Compare developer time saved against maintenance, exception handling, and review quality.'
    ],
    options:[
      {title:'A · Narrow batch submitter',body:'Small permission surface and deterministic revision checks; requires purpose-built workflow maintenance.'},
      {title:'B · Claude Code + existing GitHub tools',body:'Familiar developer workflow; more attention required for tool reach, available credentials, and unplanned actions.'},
      {title:'C · Improve native GitHub review',body:'Try routing, notifications, or Fast Track first if those address most of the delay without an agent.'}
    ],
    nextLabel:'Next engineering move',
    next:'Run one sandbox PR stack through the narrow tool and current agent workflow. Trigger a rebase, an out-of-scope approval, and a partial batch failure. Compare permitted actions, recovery, and developer effort.',
    pivot:'Evidence that native GitHub workflows solve the delay more simply—or that current agent tooling already enforces exact-revision scope at substantially lower cost.'
  },
  risk:{
    eyebrow:'RISK DISPOSITION · MANAGEMENT & GRC',
    title:'Clarify the exposure before proposing formal acceptance.',
    status:'Treatment to determine',
    summary:'An agent with broadly reusable approval credentials could act beyond a specific engineer instruction. Whether that warrants registration depends on the actual enforcement boundary, exposure, and remaining safeguards.',
    detailTitle:'What Risk Management should determine',
    considerations:[
      'Identify the affected repositories, change classes, and impact of unauthorized approvals—not merely the existence of an AI agent.',
      'Distinguish an unresolved design question from demonstrated residual risk. Establish the actual permission and merge-rule configuration.',
      'If material exposure remains, identify a management risk owner, treatment, timeframe, and any applicable acceptance authority.'
    ],
    options:[
      {title:'Mitigate through architecture',body:'Enforce exact revision scope and narrow agent authority; reassess residual exposure using evidence.'},
      {title:'Narrow scope',body:'Limit the pilot to a small change class or sandbox while unresolved boundaries are addressed.'},
      {title:'Formal acceptance, where applicable',body:'Management may consider time-bound acceptance of identified residual exposure through the established GRC process.'}
    ],
    nextLabel:'Next risk-management move',
    next:'Ask Engineering for a concrete permission map, stale-revision behavior, affected change scope, and remaining safeguards. Chase can then determine whether a tracked risk and management treatment decision are warranted.',
    pivot:'A tested enforcement boundary showing the agent cannot submit unauthorized approvals; alternatively, evidence of a material bypass and a decision to operate with it.'
  },
  assurance:{
    eyebrow:'INDEPENDENT ASSURANCE · RELIANCE & EVIDENCE',
    title:'Establish what a recorded approval actually proves.',
    status:'Reliance unresolved',
    summary:'Human decision authority is described, but approval attribution alone does not demonstrate that the engineer authorized the specific revision. The relevance to change-management assurance depends on the system and its actual enforcement.',
    detailTitle:'What Internal Audit should examine',
    considerations:[
      'Trace the approval instruction, actor identity, exact PR revision, agent tool action, and recorded GitHub result.',
      'Determine whether independently enforced GitHub rules or other mechanisms invalidate stale decisions and prevent bypass.',
      'Compare agent-executed approvals with conventional human review. Avoid assuming existing CODEOWNERS clicks establish meaningful judgment.'
    ],
    options:[
      {title:'Existing evidence may be enough',body:'If effective revision rules and review evidence already establish the intended authorization, new controls may add little.'},
      {title:'Supplement the evidence chain',body:'Correlate human instruction, agent execution, and GitHub result where existing records do not substantiate the decision.'},
      {title:'Reconsider the review objective',body:'If human review is weak or duplicative, examine a stronger design rather than preserving a ceremony solely for appearance.'}
    ],
    nextLabel:'Next independent-assurance move',
    next:'Observe a test approval across a revision change, inspect the relevant GitHub enforcement path, and compare that evidence against the authorization objective. Determine if any assurance gap remains.',
    pivot:'Direct evidence that the engineer\'s decision is bound to the action and revision, with effective independent enforcement—or evidence of a bypass that undermines that linkage.'
  }
};
const $=selector=>document.querySelector(selector);
const $$=selector=>Array.from(document.querySelectorAll(selector));
const lensOrder=['engineering','risk','assurance'];
function make(tag,className,text){
  const n=document.createElement(tag);
  if(className)n.className=className;
  if(text!==undefined)n.textContent=text;
  return n;
}
function renderLens(lens){
  const data=VIEWS[lens];if(!data)return;
  $('#lens-kicker').textContent=data.eyebrow;
  $('#lens-headline').textContent=data.title;
  $('#lens-outcome').textContent=data.status;
  $('#lens-summary').textContent=data.summary;
  $('#lens-detail-title').textContent=data.detailTitle;
  $('#lens-next-label').textContent=data.nextLabel;
  $('#lens-next').textContent=data.next;
  $('#lens-pivot').textContent=data.pivot;
  const items=$('#lens-considerations');items.replaceChildren();
  for(const point of data.considerations)items.append(make('li','',point));
  const options=$('#lens-options');options.replaceChildren();
  for(const option of data.options){
    const card=make('div','option');
    card.append(make('strong','',option.title),make('p','',option.body));
    options.append(card);
  }
  for(const tab of $$('[data-lens]')){
    const selected=tab.dataset.lens===lens;
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex=selected?0:-1;
  }
  $('#lens-panel').setAttribute('aria-labelledby','tab-'+lens);
}
function renderWorkspace(){
  const dest=$('#workspace-cards');dest.replaceChildren();
  const roleTitles={engineering:'Engineering advisory',risk:'Risk disposition',assurance:'Independent assurance'};
  for(const role of lensOrder){
    const d=VIEWS[role];
    const card=make('article','workspace-card');
    card.dataset.role=role;
    const head=make('div','workspace-card-head');
    head.append(make('span','workspace-card-kicker',roleTitles[role]),make('h3','',d.title),
      make('span','workspace-card-outcome',d.status));
    const summary=make('p','',d.summary);
    const list=make('ul','workspace-mini-list');
    for(const item of d.considerations.slice(0,2))list.append(make('li','',item));
    const next=make('div','workspace-action');
    next.append(make('span','',d.nextLabel),make('p','',d.next));
    const pivot=make('div','workspace-pivot');
    pivot.append(make('span','','What could change this view?'),make('p','',d.pivot));
    card.append(head,summary,list,next,pivot);
    dest.append(card);
  }
}
function setLayout(layout,{updateUrl=true}={}){
  if(!['executive','workspace'].includes(layout))return;
  $('#executive-layout').hidden=layout!=='executive';
  $('#workspace-layout').hidden=layout!=='workspace';
  $('#layout-title').textContent=layout==='executive'?'A · Executive-first report':'B · Decision workspace';
  $('#layout-description').textContent=layout==='executive'?
    'Start with the recommended direction. Explore the professional perspective you need.':
    'See the Engineering, Risk, and Assurance recommendations together and compare their next actions.';
  for(const button of $$('[data-layout]'))button.setAttribute('aria-pressed',String(button.dataset.layout===layout));
  if(updateUrl){
    const url=new URL(location.href);
    url.searchParams.set('layout',layout);
    history.replaceState(null,'',url);
  }
}
function setLens(lens,{updateUrl=true}={}){
  if(!VIEWS[lens])return;
  renderLens(lens);
  if(updateUrl){
    const url=new URL(location.href);
    url.searchParams.set('lens',lens);
    history.replaceState(null,'',url);
  }
}
for(const button of $$('[data-layout]'))button.addEventListener('click',()=>setLayout(button.dataset.layout));
for(const tab of $$('[data-lens]')){
  tab.addEventListener('click',()=>setLens(tab.dataset.lens));
  tab.addEventListener('keydown',event=>{
    const current=lensOrder.indexOf(tab.dataset.lens);
    const next=event.key==='ArrowRight'?(current+1)%lensOrder.length:
      event.key==='ArrowLeft'?(current-1+lensOrder.length)%lensOrder.length:
      event.key==='Home'?0:event.key==='End'?lensOrder.length-1:-1;
    if(next<0)return;
    event.preventDefault();
    const chosen=lensOrder[next];setLens(chosen);
    $('#tab-'+chosen).focus();
  });
}
renderWorkspace();
const params=new URL(location.href).searchParams;
setLens(lensOrder.includes(params.get('lens'))?params.get('lens'):'engineering',{updateUrl:false});
setLayout(params.get('layout')==='workspace'?'workspace':'executive',{updateUrl:false});
