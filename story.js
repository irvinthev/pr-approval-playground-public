(function(){
 'use strict';
 const $=id=>document.getElementById(id),S=StoryDemo;
 let state=S.initial();
 const titles=['A small change. Two green reviews.','Follow what consumes the change.','Apply the separately governed rule.','Who can satisfy that requirement?','See the authorization outcome.'];
 const copies={
 shared:[
  'A contributor changes a key in a shared deduplication function. CI passes. Both AI reviewers classify the PR as low risk. Would you let it ship?',
  'The file is outside the billing service, but its output feeds usage aggregation, invoice generation and financial reporting. File size and directory alone do not establish its financial significance.',
  'The approved dependency map identifies protected billing logic. The independent gate requires a qualified reviewer, even when both AI assessments are favorable.',
  'The approval bot cannot waive this rule. A qualified reviewer, separate from the contributor, can authorize this exact revision under the current policy.',
  'Automation supplied technical evidence. The independent policy determined the authorization required. Inspect the outcome, then try changing the code after approval.'
 ],
 docs:[
  'A contributor corrects a typo in a user guide. CI passes and both AI reviewers classify the change as low risk.',
  'The verified demo mapping identifies documentation with no financial-process dependency. This limited scope is established, rather than inferred from a low-risk label.',
  'The financial policy permits the automated route for this verified scope. Required technical checks still apply.',
  'No additional financial reviewer is required here. The approval bot still has no authority to change the policy itself.',
  'Routine work can use the automated route when the modeled scope and checks support it. A new revision still needs fresh validation.'
 ],
 unknown:[
  'A new metering component passes CI and receives two low-risk AI reviews. Its downstream consumers have not been mapped.',
  'The dependency inventory has no entry for this component. The absence of a financial link is missing evidence, not evidence of no financial effect.',
  'The independent gate cannot establish the required authorization route. The mapping must be resolved; the calculator cannot call missing exposure zero.',
  'Neither an approval-bot override nor a reviewer click can replace the missing scope analysis. The technical owner and financial-process owner need to establish the mapping.',
  'The route remains unresolved. That is a request for specific missing information, not a claim that the code is necessarily dangerous.'
 ]};
 function appendCard(root,title,body){const box=document.createElement('div');box.className='card';const h=document.createElement('strong');h.textContent=title;const p=document.createElement('p');p.textContent=body;box.append(h,p);root.appendChild(box);}
 function render(focus=false){
  const x=S.evaluate(state),visual=$('story-visual');visual.replaceChildren();
  $('story-progress').textContent='Step '+(state.step+1)+' of 5';
  [...$('story-steps').children].forEach((el,i)=>{el.className=i<state.step?'done':'';if(i===state.step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $('story-title').textContent=titles[state.step];$('story-copy').textContent=copies[state.scenario][state.step];
  if(state.step===0){
   const code=document.createElement('pre');code.className='story-code';code.textContent=state.scenario==='shared'?'lib/dedup/key.js · 2 lines changed\n\n− return event.id;\n+ return event.customerId + ":" + event.id;':state.scenario==='docs'?'docs/usage-guide.md\n\n− Read the instuctions.\n+ Read the instructions.':'services/new-meter/index.js\n\nNew metering component · consumers not mapped';visual.appendChild(code);
   const row=document.createElement('div');row.className='grid story-status';appendCard(row,'CI',state.ci?'Passed for '+x.change.sha:'Pending for new revision');appendCard(row,'Reviewer A','Low risk');appendCard(row,'Reviewer B','Low risk');visual.appendChild(row);
  }else if(state.step===1){
   const route=document.createElement('div');route.className='story-route';const labels=state.scenario==='shared'?['Shared library','Usage aggregation','Billing','Financial reporting']:state.scenario==='docs'?['User guide','Verified documentation scope']:['New component','Consumers unknown'];labels.forEach((label,i)=>{if(i){const arrow=document.createElement('i');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');route.appendChild(arrow)}const item=document.createElement('span');item.textContent=label;route.appendChild(item)});visual.appendChild(route);
  }else if(state.step===2){
   visual.className='story-visual grid';appendCard(visual,'Technical eligibility',x.technical.eligible?'Passed. Both AI verdicts are low.':'Pending or failed technical evidence.');appendCard(visual,'Independent financial policy',x.financial.reason);
  }else if(state.step===3){
   visual.className='story-visual grid';appendCard(visual,'Requesting contributor and approval bot','Cannot unilaterally change the protected classification or waive review.');appendCard(visual,'Independent administration','The claim only holds if gate code, credentials and enforcement are outside unilateral control of requesting and infrastructure operators.');
  }
  if(state.step!==2&&state.step!==3)visual.className='story-visual';
  $('story-challenges').hidden=state.step!==3;
  $('story-authorize').hidden=state.scenario!=='shared';$('story-authorize').disabled=!x.technical.eligible||!!state.approval;
  $('story-feedback').textContent=state.feedback||'Choose an action, or continue to see what remains required.';
  $('story-outcome').hidden=state.step!==4;
  const outcomeLabels={HUMAN_AUTHORIZED:'Authorized through independent human review',AUTOMATION_ELIGIBLE:'Eligible for the automated route',HUMAN_REVIEW_REQUIRED:'Independent human review still required',UNRESOLVED:'Resolve the missing dependency mapping',BLOCKED:'Fresh technical validation required'};
  $('story-verdict').textContent=outcomeLabels[x.decision.route]+'. '+x.decision.reason;
  $('story-verdict').className='callout '+(x.decision.allowed?'good':'bad');
  $('story-recheck').hidden=state.ci;
  $('story-review-again').hidden=state.scenario!=='shared'||!state.ci||!!state.approval;
  $('story-review-again').textContent=state.revision>1?'Review the new revision':'Simulate qualified independent review';
  $('story-lenses').hidden=state.step<2;
  $('story-engineering').textContent=x.decision.route==='AUTOMATION_ELIGIBLE'?'The verified routine change can proceed through the modeled automated route.':x.decision.route==='HUMAN_AUTHORIZED'?'The required reviewer has authorized this revision. All modeled checks now permit the route.':x.decision.route==='UNRESOLVED'?'Establish the component’s downstream consumers and financial relevance before routing approval.':x.decision.route==='BLOCKED'?'Re-run technical checks for the new revision, then satisfy the independent review requirement if applicable.':'Request a qualified reviewer for the protected financial behavior; a favorable AI verdict alone cannot authorize it.';
  $('story-assurance').textContent='Check the mapping, reviewer authority, exact revision and policy versions. This browser simulation cannot establish real administrative independence or production enforcement.';
  $('story-impact').hidden=state.scenario!=='shared'||state.step<2;
  const exposure=x.financial.exposure,money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v);
  $('story-amount').textContent=exposure.status==='ESTIMATED'?money(exposure.low)+'–'+money(exposure.high):'Unknown — check the assumptions';
  $('story-formula').textContent=exposure.status==='ESTIMATED'?'$12 million × '+state.share+'% affected × 5–15% undercount × '+state.months+' month(s). Assumes the error accumulates over that duration.':exposure.reason;
  $('story-evidence').hidden=state.step<2;
  $('story-record').textContent=JSON.stringify({synthetic:true,revision:x.change.sha,mappingVersion:x.financial.mappingVersion,policyVersion:x.financial.policyVersion,financialScope:x.financial.status,rule:x.financial.rule,technical:x.technical,approval:state.approval,decision:x.decision},null,2);
  $('story-back').disabled=state.step===0;$('story-next').hidden=state.step===4;
  $('story-next').textContent=['Trace the impact →','Apply independent policy →','Challenge the authority →','See the outcome →'][state.step]||'Continue';
  $('story-limit').hidden=state.step<2;
  if(focus)$('story-title').focus({preventScroll:true});
 }
 function dispatch(event,value){state=S.transition(state,event,value);if(event==='scenario'||event==='reset'){$('story-share').value=20;$('story-months').value=1;$('story-impact').open=false;$('story-evidence').open=false;}render(['next','back','scenario','reset'].includes(event));}
 [['story-next','next'],['story-back','back'],['story-reset','reset'],['story-override','override'],['story-authorize','approve'],['story-push','push'],['story-recheck','recheck'],['story-review-again','approve']].forEach(([id,event])=>$(id).addEventListener('click',()=>dispatch(event)));
 $('story-case').addEventListener('change',()=>dispatch('scenario',$('story-case').value));
 [['story-share','share'],['story-months','months']].forEach(([id,key])=>$(id).addEventListener('input',()=>dispatch(key,$(id).value.trim()===''?NaN:Number($(id).value))));
 render();
})();
