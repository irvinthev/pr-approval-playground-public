'use strict';
/**
 * Educational operating-model explorer. This is a deterministic explanatory mapping,
 * not an AI evaluator, authorization engine, risk score or evidence of control operation.
 */
(function(){
  const stageDefinitions = Object.freeze([
    {id:'develop',label:'Develop',options:[['human','Human-led / no AI execution'],['advisory','AI advises or suggests code'],['execution','AI can create or modify code, tests or configuration']],authority:'Execution',concern:'Generated-code integrity, unsafe agent tool use, manipulated repository instructions and changes to tests or CI configuration.',safeguard:'Constrain repository and tool permissions; independently validate relevant code and test changes.',evidence:'Effective agent permissions, pull-request diffs, test results and protected workflow settings.',control:'A02',rcm:'AI-04'},
    {id:'review',label:'Review',options:[['human','Human review only'],['advisory','AI review is advisory'],['gating','AI review result is a required gate']],authority:'Decision influence',concern:'Reviewer misses, misleading or manipulated output, common-mode errors and version drift.',safeguard:'Validate reviewer performance using adjudicated unsafe examples; bind review to the exact code revision.',evidence:'Reviewer results, versioned evaluations, false-low analyses and revision-bound logs.',control:'A01',rcm:'AI-05'},
    {id:'approve',label:'Approve',options:[['human','Human authorization required'],['delegated','AI output can qualify a change for automated authorization']],authority:'Delegated decision',concern:'Unsafe or out-of-scope change receiving authorization, contributor-controlled policy and stale approval.',safeguard:'Enforce management-owned eligibility and independent authorization for the current revision; fail closed.',evidence:'Approved scope, effective GitHub rulesets, decision and policy versions, bypass tests and authorized identity.',control:'G02',rcm:'AI-07'},
    {id:'deploy',label:'Deploy',options:[['deterministic','Human-approved or deterministic CI/CD release'],['ai','AI can initiate or direct production release']],authority:'Production',concern:'Unsafe release instructions, excessive privileges, unauthorized paths or artifact mismatch.',safeguard:'Restrict production operations and independently verify release eligibility and artifact integrity.',evidence:'Deployment permissions, signed/protected provenance, release gates, rollback tests and runtime identity.',control:'P02',rcm:'AI-11'},
    {id:'monitor',label:'Monitor / remediate',options:[['conventional','Conventional monitoring or human-led response'],['advisory','AI recommends investigation or response'],['autonomous','AI can execute production remediation']],authority:'Advisory or production response',concern:'Missed signals, unsafe remediation, cascading actions and insufficient containment.',safeguard:'Bound response permissions, define rollback and escalation, monitor independent telemetry and suspension triggers.',evidence:'Monitoring coverage, incident actions, effective remediation privileges, recovery drill results.',control:'P03',rcm:'AI-13'}
  ]);
  const meaningful = Object.freeze({develop:['advisory','execution'],review:['advisory','gating'],approve:['delegated'],deploy:['ai'],monitor:['advisory','autonomous']});
  function explain(selection){
    const applicable=stageDefinitions.filter(s=>meaningful[s.id].includes(selection[s.id]));
    const authorities=[...new Set(applicable.map(s=>s.authority))];
    return {applicable,authorities,context:selection.context||'unassessed'};
  }
  if(typeof module!=='undefined' && module.exports)module.exports={stageDefinitions,explain};
  if(typeof document==='undefined')return;
  const form=document.getElementById('operating-model-form');
  const results=document.getElementById('operating-model-results');
  if(!form||!results)return;
  const outputList=document.getElementById('operating-model-findings');
  const summary=document.getElementById('operating-model-summary');
  const contextEl=document.getElementById('operating-model-context');
  const reset=document.getElementById('operating-model-reset');
  function add(tag,content,parent,cls){
    const el=document.createElement(tag);if(cls)el.className=cls;
    if(content!==null)el.textContent=content;
    parent.append(el);return el;
  }
  function render(){
    const selection={context:contextEl.value};
    for(const s of stageDefinitions)selection[s.id]=form.elements[s.id].value;
    const {applicable,authorities,context}=explain(selection);
    outputList.replaceChildren();
    let contextNote=context==='unassessed'?'Business/system criticality has not been evaluated.':context==='critical'?'Financially significant, security-sensitive or otherwise critical systems require explicit scope and authorization decisions.':'Routine/low-impact scope is user-declared and not verified.';
    summary.textContent=(applicable.length?applicable.length+' AI-involved activity/activities identified.':'No AI involvement selected. Conventional SDLC safeguards still apply.')+
      ' Authority dimensions in scope: '+(authorities.length?authorities.join('; '):'none identified')+'. '+contextNote;
    for(const s of applicable){
      const article=add('article',null,outputList,'operating-finding');
      add('h3',s.label+' — '+s.authority,article);
      add('p','What could go wrong: '+s.concern,article);
      add('p','Illustrative safeguard: '+s.safeguard,article);
      add('p','Evidence to request: '+s.evidence,article);
      const links=add('p',null,article);
      const a=add('a','Control '+s.control,links);a.href='./control-matrix.html#control-'+s.control;
      add('span',' · ',links);
      const b=add('a','RCM '+s.rcm,links);b.href='./rcm-view.html';
    }
    if(!applicable.length)add('p','Choose an AI-enabled activity to display the corresponding risk and assurance questions.',outputList);
    results.hidden=false;
  }
  form.addEventListener('change',render);
  form.addEventListener('submit',e=>{e.preventDefault();render();});
  reset.addEventListener('click',()=>{form.reset();render();});
  render();
})();
