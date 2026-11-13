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
    const el=document.createElement('nav');
    el.id='field-guide-shared-journey';el.className='field-guide-shared-journey';
    el.setAttribute('aria-label','Shared illustrative PR journey');
    const header=document.createElement('div');header.className='fgj-heading';
    const title=document.createElement('strong');title.textContent='ONE CHANGE / EIGHT LIFECYCLE STAGES';
    const caption=document.createElement('span');caption.textContent='CASE-SHARED-01 · shared-library change · fictional case';
    header.append(title,caption);el.append(header);
    const list=document.createElement('ol');list.className='fgj-stages';
    stages.forEach((stage,i)=>{
      const li=document.createElement('li'),a=document.createElement('a');
      const params=new URLSearchParams({case:'CASE-SHARED-01',journeyStage:String(i)});
      a.href='./'+stage.page+'?'+params.toString()+'#'+stage.hash;
      a.textContent=stage.name;a.title=stage.question;
      a.setAttribute('aria-label',stage.name+': '+stage.question);
      if(i===selected){li.classList.add('fgj-current');a.setAttribute('aria-current','step');}
      if(stage.page===currentPage){li.classList.add('fgj-page-scope');}
      li.append(a);list.append(li);
    });
    el.append(list);
    const detail=document.createElement('div');detail.className='fgj-case-detail';
    const label=document.createElement('strong');label.textContent='CASE STATE / '+stages[selected].name;
    const description=document.createElement('p');description.textContent=stages[selected].description;
    const evidence=document.createElement('p');evidence.textContent='Question: '+stages[selected].question+' Evidence to seek: '+stages[selected].evidence;
    const warning=document.createElement('small');warning.textContent='Illustrative case state; this view does not synchronize or validate the separate interactive labs.';
    detail.append(label,description,evidence,warning);el.append(detail);
    anchor.insertAdjacentElement('afterend',el);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
