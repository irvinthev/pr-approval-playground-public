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
  // Stage participation is not equivalent to authority. The selected capability
  // determines the delegated trust boundary and any incremental safeguards.
  const capabilityOverrides = Object.freeze({
    develop: {
      advisory:{authority:'Advisory',concern:'AI-suggested code may introduce defects or insecure dependencies; human review can over-rely on suggestions.',safeguard:'Review generated suggestions and run relevant tests before accepting changes.',evidence:'Reviewed code changes, test results and reviewer accountability.'},
      execution:{authority:'Execution'}
    },
    review: {
      advisory:{authority:'Advisory',concern:'AI reviewer can miss defects or produce misleading findings; relying on recommendations may create automation bias.',safeguard:'Evaluate AI review quality and require qualified humans or independently approved controls to make authorization decisions.',evidence:'Review outputs, reviewer validation results and human authorization evidence.'},
      gating:{authority:'Decision gate',concern:'False passes, timeouts or bypass of a mandatory AI review check can affect whether a change progresses.',safeguard:'Protect required checks and versions; fail closed on missing, malformed, stale or failing verdicts; test authorized bypass routes.',evidence:'Effective ruleset, required-check and bypass settings; exact-revision check status, negative tests and reviewer validation.'}
    },
    monitor: {
      advisory:{authority:'Advisory',concern:'AI monitoring may miss or mischaracterize anomalies; humans may over-rely on inaccurate recommendations.',safeguard:'Confirm monitoring coverage, human triage ownership, alert quality and escalation paths.',evidence:'Alert inventory, independent telemetry, triage records and detection-quality evaluations.'},
      autonomous:{authority:'Production',concern:'An AI agent may initiate unsafe remediation or create cascading production changes.',safeguard:'Bound remediation privileges and allowed operations; independently enforce containment, escalation and rollback conditions.',evidence:'Effective production remediation permissions, denied-action tests, response execution logs, rollback and recovery drills.'}
    }
  });
  const governanceOptions=Object.freeze([
    ['unknown','Not assessed'],
    ['none','AI cannot propose or change governance settings'],
    ['advisory','AI suggests governance changes; humans authorize and apply them'],
    ['execute','AI executes governance changes only after independent authorization'],
    ['self-authorize','AI can authorize or change governing rules without an independent approval']
  ]);
  const governanceExecute=Object.freeze({
    id:'governance',label:'Authorized governance execution',authority:'Governance execution',
    concern:'AI executes a governance change, potentially applying a larger or different configuration change than independently authorized.',
    safeguard:'Require independently approved, revision-bound governance changes; restrict execution to the authorized policy/configuration and preserve protected enforcement.',
    evidence:'Authorized governance diff and revision, independent approver, effective admin privileges, execution logs and negative tests.',
    control:'G02',rcm:'AI-15'
  });
  const governanceSelfAuthorize=Object.freeze({
    id:'governance',label:'Independent AI governance authorization',authority:'Governance authorization',
    concern:'AI can alter or authorize policies, credentials, model settings or approval enforcement without an independent gate, permitting self-expansion of authority or control bypass.',
    safeguard:'Separately protect the governing rules and privileged credentials; require independent authorization and enforce fail-closed boundaries against self-modification.',
    evidence:'Effective administrative grants, ruleset history, bypass and credential inventory, protected workflow tests and independent approvals.',
    control:'G02',rcm:'AI-15'
  });
  const governanceAdvisory=Object.freeze({
    id:'governance',label:'Governance change recommendations',authority:'Advisory',
    concern:'An inaccurate AI-generated recommendation could weaken protected policy if accepted without evaluation.',
    safeguard:'Require independently authorized human assessment, tests and change approval before policy changes take effect.',
    evidence:'Recommendations, policy diff, validation and qualified independent approvals.',
    control:'G02',rcm:'AI-15'
  });
  function additionalQuestions(context,applicable){
    const has=id=>applicable.some(s=>s.id===id);
    if(context==='critical'){
      const questions=[
        'Which financially significant, security-sensitive or otherwise critical processes depend on the affected services, repositories or shared components?',
        'Who validated the protected scope and indirect dependencies, and what evidence supports the criticality classification?'
      ];
      if(has('approve')||has('review')&&applicable.some(s=>s.id==='review'&&s.authority==='Decision gate'))
        questions.push('How are required approval/check status, eligibility exclusions and exception routes independently enforced for critical changes?');
      if(has('deploy')||has('monitor')&&applicable.some(s=>s.id==='monitor'&&s.authority==='Production'))
        questions.push('What release/remediation privileges, artifact integrity requirements and containment evidence protect production actions in critical systems?');
      if(has('develop'))questions.push('How are changes generated or suggested by AI independently tested against critical business and security requirements?');
      if(has('governance'))questions.push('What independent restrictions protect control administration and policy changes affecting critical systems?');
      return questions;
    }
    if(context==='routine')return [
      'Who substantiated that the system and indirect dependencies are routine or low-impact, and when was this classification last reviewed?',
      'What changes or new dependencies would trigger reclassification or mandatory human escalation?'
    ];
    return ['Identify and substantiate system criticality, affected business processes and indirect dependencies before deciding which scope-specific safeguards apply.'];
  }
  function explain(selection){
    const applicable=stageDefinitions.filter(s=>meaningful[s.id].includes(selection[s.id])).map(s=>({
      ...s,...(capabilityOverrides[s.id]?.[selection[s.id]]||{})
    }));
    const governance=selection.governance||'unknown';
    if(governance==='advisory')applicable.push({...governanceAdvisory});
    if(governance==='execute')applicable.push({...governanceExecute});
    if(governance==='self-authorize')applicable.push({...governanceSelfAuthorize});
    const authorities=[...new Set(applicable.map(s=>s.authority))];
    const context=selection.context||'unassessed';
    const questions=additionalQuestions(context,applicable);
    if(governance==='unknown' && applicable.length)questions.push('Verify whether any AI agent can directly or indirectly change protected governance rules, identities or enforcement settings.');
    // Declared absence of governance authority must be checked against effective
    // tool permissions when an agent can modify code, workflows, or configuration.
    if(governance==='none' && selection.develop==='execution')
      questions.push('Can this coding agent edit protected CI workflows, approval policies, ruleset configuration or policy-as-code? Verify effective path protections and administrative separation before concluding governance access is absent.');
    return {applicable,authorities,context,governance,questions};

  }
  const examples=Object.freeze({
    assist:Object.freeze({develop:'advisory',review:'advisory',approve:'human',deploy:'deterministic',monitor:'conventional',governance:'unknown',context:'unassessed'}),
    approval:Object.freeze({develop:'human',review:'gating',approve:'delegated',deploy:'deterministic',monitor:'conventional',governance:'unknown',context:'unassessed'}),
    autonomous:Object.freeze({develop:'execution',review:'human',approve:'human',deploy:'ai',monitor:'autonomous',governance:'unknown',context:'unassessed'})
  });
  if(typeof module!=='undefined' && module.exports)module.exports={stageDefinitions,governanceOptions,explain,examples};
  if(typeof document==='undefined')return;
  const form=document.getElementById('operating-model-form');
  const results=document.getElementById('operating-model-results');
  if(!form||!results)return;
  const buttons=[...document.querySelectorAll('[data-model]')];
  const exampleLabel=document.getElementById('operating-model-example-label');
  const outputList=document.getElementById('operating-model-findings');
  const summary=document.getElementById('operating-model-summary');
  const reset=document.getElementById('operating-model-reset');
  const questionsEl=document.getElementById('operating-model-questions');
  const takeaways=document.getElementById('operating-model-takeaways');
  const resultsHeading=document.getElementById('operating-model-results-heading');
  const evidencePanel=document.querySelector('.operating-evidence');
  const prefersReducedMotion=()=>typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function revealResults(){
    resultsHeading.focus({preventScroll:true});
    results.scrollIntoView?.({block:'start',behavior:prefersReducedMotion()?'auto':'smooth'});
  }
  function add(tag,content,parent,cls){
    const el=document.createElement(tag);if(cls)el.className=cls;
    if(content!==null)el.textContent=content;
    parent.append(el);return el;
  }
  function selected(){
    const selection={};
    for(const s of stageDefinitions)selection[s.id]=form.elements[s.id].value;
    selection.context=form.elements.context.value;
    selection.governance=form.elements.governance.value;
    return selection;
  }
  function selectModel(model){
    const selection=examples[model];
    if(!selection)return;
    for(const [key,value] of Object.entries(selection))form.elements[key].value=value;
    render(model);
    revealResults();
  }
  function render(model){
    const selection=selected();
    const {applicable,authorities,context,questions}=explain(selection);
    for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.model===model));
    exampleLabel.textContent=model?'Illustrative model: '+buttons.find(b=>b.dataset.model===model).querySelector('strong').textContent:'Customized operating model (illustrative)';
    outputList.replaceChildren();
    questionsEl.replaceChildren();
    const contextNote=context==='unassessed'?'Business/system criticality has not been evaluated.':context==='critical'?'Critical scope is user-declared and requires verification.':'Routine/low-impact scope is user-declared and not verified.';
    summary.textContent=contextNote+(selection.governance==='unknown'?' Governance authority is not assessed.':'');
    takeaways.replaceChildren();
    const detail={
      assist:{
        change:'AI supplies suggestions and code-review findings. People retain execution and change authorization.',
        failure:'Incorrect suggestions, missed defects or over-reliance on AI review can introduce unsafe changes.',
        safeguard:'Human validation of changes, meaningful tests, and scoped AI tool access.'
      },
      approval:{
        change:'AI review becomes a required check and its outcome can qualify selected changes for automated authorization.',
        failure:'A false pass, stale verdict or bypassed policy can allow an unsafe merge.',
        safeguard:'Independent eligibility enforcement, protected required checks, exact-revision validation and tested bypass handling.'
      },
      autonomous:{
        change:'AI can change source, initiate a release or execute production remediation.',
        failure:'Unsafe autonomous action or excessive privileges can propagate a defect into production.',
        safeguard:'Constrained privileges, independent release enforcement, monitoring, containment and rollback.'
      }
    };
    const sections=model&&detail[model]?detail[model]:{
      change:authorities.length?'This model includes '+authorities.join(', ')+'.':'No AI-involved SDLC capabilities were selected.',
      failure:applicable.length?applicable.map(item=>item.concern).join(' '):'Confirm the scope, permissions and applicable non-AI SDLC risks.',
      safeguard:applicable.length?applicable.map(item=>item.safeguard).join(' '):'Apply normal change and release governance.'
    };
    for(const [title,text] of [['What changes?',sections.change],['What could fail?',sections.failure],['What safeguards matter?',sections.safeguard]]){
      const card=add('section',null,takeaways);
      add('h4',title,card);
      add('p',text,card);
    }
    evidencePanel.open=false;
    for(const item of applicable){
      const article=add('article',null,outputList,'operating-finding');
      add('h3',item.label+' — '+item.authority,article);
      add('p','What could fail: '+item.concern,article);
      add('p','Safeguard: '+item.safeguard,article);
      add('p','Evidence: '+item.evidence,article);
      const links=add('p',null,article);
      const a=add('a','Control '+item.control,links);a.href='./control-matrix.html#control-'+item.control;
      add('span',' · ',links);
      const link=add('a','RCM '+item.rcm,links);link.href='./rcm-view.html';
    }
    if(!applicable.length)add('p','Choose an example above or adjust advanced authority settings to see relevant safeguards.',outputList);
    for(const question of questions)add('li',question,questionsEl);
    results.hidden=false;
  }
  for(const button of buttons)button.addEventListener('click',()=>selectModel(button.dataset.model));
  form.addEventListener('change',()=>render(null));
  form.addEventListener('submit',event=>{event.preventDefault();render(null);revealResults();});
  reset.addEventListener('click',()=>{
    form.reset();
    for(const button of buttons)button.setAttribute('aria-pressed','false');
    results.hidden=true;
  });
})();
