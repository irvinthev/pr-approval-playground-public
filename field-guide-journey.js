/* Shared illustrative case orientation. Separate from each page's standalone simulation engines. */
(function () {
  'use strict';
  const stages = [
    {name:'PR',description:'One shared-library PR is submitted at example-sha-A.',page:'index.html',hash:'overview-authority-preview',question:'What exactly changed?',evidence:'Changed files, dependencies and immutable revision.'},
    {name:'Eligibility',description:'Financial dependencies are uncertain; an unknown dependency must follow the human route.',page:'ai-sdlc-risk.html',hash:'risk-explorer',question:'Does scope policy allow automated review?',evidence:'Versioned scope exclusions and dependency inventory.'},
    {name:'AI ×2',description:'Two nondeterministic reviewers provide advice, but neither reviewer authorizes.',page:'engineering-blueprint.html',hash:'engineering-build-plan',question:'Can two assessments fail together?',evidence:'Individual reviewer results, model/prompt versions and adjudicated evaluation cases.'},
    {name:'Authorize',description:'Only a permitted actor and policy can authorize the evaluated revision.',page:'engineering-blueprint.html',hash:'engineering-build-plan',question:'Who can grant approval and change the rules?',evidence:'Policy-of-record, approver identity, authorization event and bypass configuration.'},
    {name:'Merge',description:'Changed source revision example-sha-B invalidates approval tied to example-sha-A.',page:'engineering-blueprint.html',hash:'technical-requirements',question:'Can stale approval or privilege bypass reach the protected branch?',evidence:'Branch-rule evaluation, source SHA and required-check history.'},
    {name:'Release',description:'The illustrative release mismatch compares an approval for A with deployment of B.',page:'continuous-monitoring.html',hash:'monitoring-guide',question:'Was the exact authorized artifact built and deployed?',evidence:'Provenance linking approved source, merge, CI build and deployed artifact.'},
    {name:'Monitor',description:'Reconcile 25 merged changes to 24 decision records; investigate the unmatched change.',page:'continuous-monitoring.html',hash:'monitoring-guide',question:'What is outside the dashboard denominator?',evidence:'Independent merged-change population and complete evaluation/authorization events.'},
    {name:'Evidence',description:'An independent conclusion remains open until revision, policy, population and release evidence reconcile.',page:'independent-assurance.html',hash:'assurance-control-explorer',question:'What can a reviewer conclude from the actual records?',evidence:'Source-linked records, negative tests, reviewer-quality evaluation and scoped findings.'}
  ];
  const currentPage=location.pathname.split('/').pop()||'index.html';
  const focusMap={'ai-sdlc-risk.html':1,'engineering-blueprint.html':3,'continuous-monitoring.html':6,'independent-assurance.html':7};
  const defaultFocus=focusMap[currentPage];
  const query=new URLSearchParams(location.search);
  const requested=Number(query.get('journeyStage'));
  const selected=Number.isInteger(requested)&&requested>=0&&requested<stages.length&&query.get('case')==='CASE-SHARED-01'?requested:defaultFocus;
  window.FieldGuideCase=Object.freeze({
    id:'CASE-SHARED-01',type:'illustrative',subject:'Shared-library PR; financial relevance uncertain',
    sourceRevision:'example-sha-A',changedRevision:'example-sha-B',
    stages:stages.map(s=>Object.freeze({...s})),
    note:'Teaching scenario only. No real policy decision, model output, approval or release evidence is asserted.'
  });
  if(defaultFocus===undefined)return; // The Overview already has a detailed full-size journey.
  function render(){
    if(document.getElementById('field-guide-shared-journey'))return;
    const anchor=document.querySelector('.risk-main-hero, .assurance-hero, section.hero');
    if(!anchor)return;
    const el=document.createElement('section');
    el.id='field-guide-shared-journey';
    el.className='field-guide-shared-journey';
    el.setAttribute('aria-label','Shared illustrative PR journey');
    const header=document.createElement('div');header.className='fgj-heading';
    const title=document.createElement('strong');title.textContent='ONE CHANGE / EIGHT LIFECYCLE STAGES';
    const caption=document.createElement('span');caption.textContent='CASE-SHARED-01 · shared-library change · fictional case';
    header.append(title,caption);el.append(header);
    const instructions=document.createElement('p');instructions.className='fgj-instructions';
    instructions.textContent='Select a stage to inspect it here. Open its full chapter only when you want to go deeper.';
    el.append(instructions);
    const list=document.createElement('div');list.className='fgj-stages';
    list.setAttribute('role','group');list.setAttribute('aria-label','Inspect a lifecycle stage without navigating');
    const buttons=[];
    const detail=document.createElement('div');detail.className='fgj-case-detail';
    detail.setAttribute('role','region');detail.setAttribute('aria-label','Selected lifecycle stage');
    const label=document.createElement('strong');label.id='fgj-selected-label';
    const description=document.createElement('p');
    const evidence=document.createElement('p');
    const deeper=document.createElement('a');deeper.className='fgj-open-chapter';
    deeper.textContent='Open full chapter →';
    const warning=document.createElement('small');
    warning.textContent='Illustrative case state; this view does not synchronize or validate the separate interactive labs.';
    detail.append(label,description,evidence,deeper,warning);
    let current=selected;
    function select(index){
      if(index<0||index>=stages.length)return;
      current=index;
      const stage=stages[index];
      buttons.forEach((button,i)=>{
        const active=i===index;
        button.setAttribute('aria-pressed',String(active));
        button.classList.toggle('fgj-selected',active);
      });
      label.textContent='CASE STATE / '+stage.name;
      description.textContent=stage.description;
      evidence.textContent='Question: '+stage.question+' Evidence to seek: '+stage.evidence;
      const params=new URLSearchParams({case:'CASE-SHARED-01',journeyStage:String(index)});
      deeper.href='./'+stage.page+'?'+params.toString()+'#'+stage.hash;
      deeper.textContent=stage.page===currentPage?'Open detailed section →':'Open '+({
        'index.html':'Overview',
        'ai-sdlc-risk.html':'Risk & Governance',
        'engineering-blueprint.html':'Engineering & Safeguards',
        'continuous-monitoring.html':'Monitoring & Operations',
        'independent-assurance.html':'Assurance'
      }[stage.page]||'chapter')+' →';
    }
    stages.forEach((stage,i)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='fgj-stage';
      button.textContent=stage.name;
      button.title=stage.question;
      button.setAttribute('aria-label','Inspect '+stage.name+': '+stage.question);
      button.setAttribute('aria-controls','fgj-selected-label');
      button.setAttribute('aria-pressed','false');
      button.addEventListener('click',()=>select(i)); // No location/hash or scroll change.
      buttons.push(button);list.append(button);
    });
    el.append(list);
    const mobileHint=document.createElement('p');mobileHint.className='fgj-scroll-hint';
    mobileHint.textContent='Swipe or scroll horizontally to view all eight stages.';
    el.append(mobileHint);
    el.append(detail);
    anchor.insertAdjacentElement('afterend',el);
    select(current);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
