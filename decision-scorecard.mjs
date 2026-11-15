// Presentation-only decision scorecard for the private Challenge Lab.
// No model calls, storage, approval actions, or claims of implemented controls.
export const TEMPLATE_SCORECARD = Object.freeze({
  proposal: '[Name the engineering proposal]',
  recommendation: '[Proceed conditionally / redesign / defer / do not proceed — and why]',
  rationale: '[What problem does this solve, and why is this approach worth considering?]',
  failure: '[A realistic failure condition that would undermine the recommendation]',
  safeguards: [
    {objective:'[Most important safeguard]',status:'Unknown'},
    {objective:'[Second important safeguard]',status:'Unknown'},
    {objective:'[Third important safeguard]',status:'Unknown'}
  ],
  pivot: '[Which unresolved answer could change the recommendation?]',
  action: '[The next specific engineering experiment, design change, or decision]',
  basis:'Blank template. No engineering proposal assessed.'
});

export const EXAMPLE_SCORECARD = Object.freeze({
  proposal:'Agent-submitted approval across stacked pull requests',
  recommendation:'Conditionally pilot agent-executed human approvals; do not delegate the approval decision.',
  rationale:'The engineer decides which PRs to approve. The agent removes repetitive submission steps, provided that its action cannot exceed the engineer\'s instruction.',
  failure:'An agent with broad GitHub CLI or MCP credentials approves a PR revision the engineer never authorized—for example, after one PR in the stack is rebased.',
  safeguards: [
    {objective:'Explicit human decision bound to each PR and commit SHA',status:'Unknown · fictional example'},
    {objective:'Restricted approval permissions and independent revision checks',status:'Unknown · fictional example'},
    {objective:'Trace linking instruction, agent action and GitHub review',status:'Unknown · fictional example'}
  ],
  pivot:'Can an agent submit an approval for a PR or SHA without a fresh, explicit human instruction?',
  action:'Trial one fictional PR stack in a sandbox. Demonstrate that a stale-SHA approval is blocked and that each authorization can be reconstructed.',
  basis:'Illustrative engineering judgment. This is not an assessment of an implemented system.'
});

const STATUS_LABELS = Object.freeze({
  'not-assessed':'Unknown · not assessed',
  'reported-absent':'Not implemented · user-reported',
  'reported-partial':'Partial · user-reported',
  'reported-full':'Full · user-reported'
});

export function assessmentToScorecard(data) {
  const primary=Array.isArray(data?.conclusions)?data.conclusions[0]:null;
  if(!primary || typeof primary.application!=='string') return null;
  const lead=Array.isArray(data.challenges)?data.challenges[0]:null;
  const firstQuestion=Array.isArray(data.clarifications)?data.clarifications[0]:null;
  const pivot=firstQuestion?.question || primary.openQuestion ||
    'No decision-changing question identified in this assessment.';
  const action=Array.isArray(lead?.tests) && lead.tests[0] ?
    lead.tests[0] : (firstQuestion?.question ?
      'Clarify: '+firstQuestion.question :
      'Review the decision basis and verify applicable safeguards before relying on this recommendation.');
  const safeguards=(Array.isArray(data.expectedSafeguards)?data.expectedSafeguards:[])
    .slice(0,3).map(item=>({
      objective:item.objective||'Unspecified safeguard',
      // Do not upgrade a scenario claim into verified implementation.
      status:STATUS_LABELS[item.implementation]||STATUS_LABELS['not-assessed']
    }));
  return {
    proposal:'Assessment of the described engineering proposal',
    recommendation:primary.application,
    rationale:primary.scenarioBasis||'The assessment did not supply a decision basis.',
    failure:lead ? [lead.question,lead.reason].filter(Boolean).join(' — ') :
      'No material failure scenario was supplied; investigate before treating this as low risk.',
    safeguards,
    pivot,
    action,
    basis:'Model-generated from the submitted scenario and curated references; not independently verified.'
  };
}

export function scorecardText(card) {
  return [
    'ENGINEERING DECISION SCORECARD',
    'Proposal: '+card.proposal,
    'Recommendation: '+card.recommendation,
    'Why: '+card.rationale,
    'Principal failure condition: '+card.failure,
    'Safeguards / implementation: ',
    ...(card.safeguards.length ? card.safeguards.map(item=>'- '+item.objective+' — '+item.status) :
      ['- No safeguards returned; do not infer they are unnecessary.']),
    'What could change the answer: '+card.pivot,
    'Next move: '+card.action,
    'Basis: '+card.basis
  ].join('\n');
}

export function createDecisionScorecard(root){
  if(!root)throw new Error('Decision scorecard root not found');
  const find=id=>root.querySelector('#'+id);
  const modes=Array.from(root.querySelectorAll('[data-scorecard-mode]'));
  let active='example', assessment=null, selected=EXAMPLE_SCORECARD;
  function fill(id,value){find(id).textContent=value;}
  function render(){
    const available=Boolean(assessment);
    const current=modes.find(button=>button.dataset.scorecardMode==='current');
    if(current)current.disabled=!available;
    if(active==='current'&&!available)active='example';
    selected=active==='template'?TEMPLATE_SCORECARD:
      active==='current'?assessment:EXAMPLE_SCORECARD;
    modes.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scorecardMode===active)));
    fill('scorecard-tag',active==='current'?'This assessment · not independently verified':
      active==='template'?'Blank template':'Completed fictional example');
    for(const [id,key] of [
      ['scorecard-proposal','proposal'],['scorecard-decision','recommendation'],
      ['scorecard-why','rationale'],['scorecard-failure','failure'],
      ['scorecard-pivot','pivot'],['scorecard-next','action'],['scorecard-basis','basis']
    ])fill(id,selected[key]);
    const target=find('scorecard-safeguards');
    target.replaceChildren();
    if(!selected.safeguards.length){
      const note=document.createElement('p');
      note.textContent='No safeguards returned. This does not establish that none are required.';
      target.append(note);
    }
    for(const safeguard of selected.safeguards){
      const item=document.createElement('div');item.className='scorecard-safeguard';
      const name=document.createElement('strong');name.textContent=safeguard.objective;
      const status=document.createElement('span');status.textContent=safeguard.status;
      item.append(name,status);target.append(item);
    }
    fill('scorecard-copy-status','');
  }
  modes.forEach(button=>button.addEventListener('click',()=>{
    if(button.disabled)return;
    active=button.dataset.scorecardMode;
    render();
  }));
  find('scorecard-copy').addEventListener('click',async()=>{
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(scorecardText(selected));
      fill('scorecard-copy-status','Copied to clipboard.');
    }catch{
      fill('scorecard-copy-status','Copy unavailable here. Select the text to copy manually.');
    }
  });
  render();
  return {
    setAssessment(data){
      assessment=assessmentToScorecard(data);
      if(assessment)active='current';
      render();
    },
    reset(){
      assessment=null;active='example';render();
    },
    openCurrent(){
      active=assessment?'current':'example';render();
      root.open=true;root.scrollIntoView({block:'start',behavior:'smooth'});
    }
  };
}
