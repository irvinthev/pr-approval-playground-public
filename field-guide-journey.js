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
  if(defaultFocus===undefined)return; // Overview has its own introduction.
const context = {
  'ai-sdlc-risk.html': {
    role:'RISK / EXPOSURE', question:'Could this shared dependency affect protected business functions?',
    insight:'Two LOW reviewer outputs cannot resolve missing downstream dependency evidence.',
    anchor:'#risk-explorer', action:'Inspect failure paths'
  },
  'engineering-blueprint.html': {
    role:'ENGINEERING / ENFORCEMENT', question:'What independently restricts this change?',
    insight:'The approval decision, execution identity, branch gate, and release path are distinct boundaries.',
    anchor:'#engineering-build-plan', action:'Inspect the enforcement path'
  },
  'continuous-monitoring.html': {
    role:'OPERATIONS / RECONCILIATION', question:'Would revision B inherit revision A’s authorization?',
    insight:'A previous approval can remain in history but must not automatically authorize revised code.',
    anchor:'#fg-monitoring-dashboard', action:'Investigate the evidence'
  },
  'independent-assurance.html': {
    role:'ASSURANCE / CLAIM', question:'What conclusion is supported by the actual evidence?',
    insight:'Sampled approvals, complete populations, and adversarial evaluations substantiate different assertions.',
    anchor:'#assurance-control-explorer', action:'Inspect evidence limits'
  }
};
function render() {
  if(document.getElementById('field-guide-shared-journey'))return;
  const hero=document.getElementById('main-content'),c=context[currentPage];
  if(!hero||!c)return;
  const panel=document.createElement('aside');
  panel.id='field-guide-shared-journey';
  panel.className='fgj-context';
  panel.setAttribute('aria-label','Shared fictional case context');
  const marker=document.createElement('strong');
  marker.textContent='CASE-SHARED-01 · '+c.role+' · FICTIONAL';
  const question=document.createElement('p');question.className='fgj-context-question';
  question.textContent=c.question;
  const note=document.createElement('p');note.textContent=c.insight;
  const link=document.createElement('a');link.href=c.anchor;link.textContent=c.action+' →';
  panel.append(marker,question,note,link);
  hero.insertAdjacentElement('afterend',panel);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})(typeof window!=='undefined'?window:globalThis);
