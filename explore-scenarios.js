// Static educational data only. No external services, persistence, authentication,
// user-submitted inputs, or model-generated conclusions are used on this page.
export const scenarioCases = Object.freeze({
  routing:{
    number:'01',category:'Workflow improvement',title:'Automated PR routing',
    description:'A fictional engineering team wants a service to identify low-risk pull requests and request manager review. Required code-owner approvals and merge checks remain unchanged.',
    authority:'Automated reviewer assignment only',
    assumption:'Existing required approvals remain enforced',
    decision:'Explore the simplest routing improvement first',
    why:'The principal benefit is faster assignment, not reduced review. Incorrect classification should create a routing or workload problem—not allow a change to merge without its required approvals. Confirm the bottleneck before building a custom classifier.',
    pivot:'Does the routing service only request reviewers, or can it change required approvals, rulesets, or merge eligibility?',
    current:'Manual reviewer requests and existing code-owner review rules.',
    proposed:'Automatically request a manager review for low-risk changes without replacing mandatory technical approvals.',
    alternative:'Use repository-native reviewer requests and team ownership rules before introducing an AI classifier or custom service.',
    counterargument:'Managers may coordinate review better than automated team assignment, particularly where code ownership is fragmented. This would support a routing pilot, not a change in approval authority.',
    risks:[
      {title:'Assignment creates a new review bottleneck',condition:'Managers receive PRs they cannot review quickly or competently.',consequence:'Cycle time increases and engineers still need domain experts.',safeguard:0},
      {title:'Routing automation gains unintended privileges',condition:'The service can alter rulesets or use privileged bypass capabilities.',consequence:'An assignment convenience becomes an unintended authorization mechanism.',safeguard:1},
      {title:'Low-risk labels are mistaken for permission to merge',condition:'A reviewer or downstream tool treats a routing label as an approval decision.',consequence:'Teams misunderstand which GitHub requirements still apply.',safeguard:2}
    ],
    safeguards:[
      {title:'Keep routing separate from authorization',why:'Reviewer assignment should not itself satisfy approval requirements.',
        enforce:'Grant only reviewer-request permissions; independently enforce existing branch protections and required reviewers.',
        test:'Approve as the routed manager with a required code-owner approval missing. Confirm that merge remains blocked.',
        evidence:'GitHub App permission export, effective rulesets, PR review history, denied merge result.'},
      {title:'Constrain the routing identity',why:'A workflow helper should not control the rules protecting a change.',
        enforce:'Do not grant ruleset administration, repository administration, bypass, or merge rights to the router.',
        test:'Attempt a policy change and direct merge with the routing identity; both should be denied.',
        evidence:'Service identity permissions, ruleset bypass actors, audit events for rejected operations.'},
      {title:'Measure routing usefulness and clarify labels',why:'Automation can add another queue without improving actual review.',
        enforce:'Separate assignment labels from authorization states; provide reassignment/escalation and reviewer-capacity visibility.',
        test:'Misroute a fictional PR; show that escalation works and approval requirements are unchanged.',
        evidence:'Assignment events, time-to-review, reviewer feedback, reassignment counts, unchanged merge conditions.'}
    ],
    failureQuestion:'Could an incorrectly routed PR merge without the required code-owner approval?',
    stages:[
      {name:'Classify',condition:'A routing rule decides which manager should receive a PR.',
        good:'A mistaken low-risk label changes the assignment only. The required approval policy remains unchanged.',
        bad:'A label is treated as evidence that a PR may skip mandatory reviewers.',
        safeguard:'Keep classification metadata advisory and prohibit it from changing merge rules.',
        evidence:'Classification decision, label history, effective reviewer requirements before and after assignment.'},
      {name:'Assign',condition:'The automation asks a manager to review the proposed change.',
        good:'The request reaches an available reviewer, or an escalation selects a suitable alternative.',
        bad:'The manager lacks context or capacity; the new queue slows down review.',
        safeguard:'Role mapping, workload limits, reassignment, and specialist escalation.',
        evidence:'Requested reviewers, reassignment logs, response time, domain ownership.'},
      {name:'Review',condition:'A manager responds to the automated request.',
        good:'Manager feedback supplements the specialist review required by policy.',
        bad:'A manager assumes the low-risk label means a specialist review is unnecessary.',
        safeguard:'Clear review expectations and visible required reviewer status in GitHub.',
        evidence:'Review comments, code-owner coverage, explicit approval records, unresolved review requests.'},
      {name:'Enforce',condition:'The PR is proposed for merge after the manager has approved.',
        good:'GitHub still blocks merge if a required code owner or status check is missing.',
        bad:'The router or a privileged actor bypasses the protected merge requirements.',
        safeguard:'Protected branch/ruleset enforcement independent of the routing service.',
        evidence:'Negative merge test, current ruleset export, bypass actors, attempted merge audit event.'},
      {name:'Observe',condition:'Engineering evaluates whether the routing experiment helped.',
        good:'Review latency falls without increasing reassignments or reducing required review quality.',
        bad:'A faster assignment metric conceals delays, churn, or poor review outcomes.',
        safeguard:'Measure end-to-end review time and reviewer outcomes, not classification rate alone.',
        evidence:'Cycle-time baseline, escalations, reassignments, post-merge defects and reviewer feedback.'}
    ],
    teams:{
      engineering:'Which bottleneck is measured, and can existing GitHub reviewer requests solve it?',
      risk:'Are reviewer requests and merge authorization technically separate?',
      assurance:'What ruleset export and negative merge example would substantiate the separation?'
    }
  },
  substitution:{
    number:'02',category:'Authorization redesign',title:'Manager-only approval',
    description:'For a narrow class of fictional low-risk pull requests, one manager approval would replace required specialist code-owner approvals. The engineering team expects shorter review times.',
    authority:'Manager can replace specialist approval',
    assumption:'Low-risk eligibility changes who may authorize merge',
    decision:'Treat this as a redesign of approval authority',
    why:'The classifier now determines access to a different merge-authorization route. A mistaken eligible label can remove specialist review. This may be justified for tightly bounded changes, but the safe population, reviewer competence and independent enforcement must be established.',
    pivot:'What independently prevents an excluded or high-impact change from using manager-only authorization?',
    current:'Specialist code owners approve changes according to protected repository requirements.',
    proposed:'For a defined subset, one qualified manager reviews the entire change and can authorize merge without specialist code-owner approval.',
    alternative:'Accelerate qualified specialist assignment, reduce unnecessary code-owner overlap, or start with a narrower human-review fast lane without broadly bypassing specialist requirements.',
    counterargument:'Requiring every specialist for every trivial change can impose measurable delay with little additional review value. A correctly bounded single-reviewer route may outperform the status quo; review quality, eligibility and independent enforcement decide whether it does.',
    risks:[
      {title:'An ineligible change enters the lighter route',condition:'High-impact files or cross-domain dependencies are missed by eligibility checks.',consequence:'A PR can merge without specialist coverage that would otherwise apply.',safeguard:0},
      {title:'The manager lacks sufficient technical context',condition:'A manager reviews an eligible-looking change spanning unfamiliar domains.',consequence:'Consequential defects may escape the sole substantive review.',safeguard:1},
      {title:'Policy and merge bypass are more powerful than intended',condition:'An automation or privileged identity can select eligibility and waive approval rules.',consequence:'A bypass path can operate outside the bounded manager-only route.',safeguard:2}
    ],
    safeguards:[
      {title:'Bound and independently enforce eligibility',why:'An incorrect low-risk classification can now change merge authorization.',
        enforce:'Use protected, deterministic exclusions and conservative handling of unknown dependencies; validate eligibility again at merge for the exact revision.',
        test:'Include an excluded file or unknown cross-domain dependency; confirm manager-only merge is rejected.',
        evidence:'Versioned eligibility rules, ruleset/bypass configuration, rejected merge attempt, commit identity.'},
      {title:'Require a qualified review and escalation path',why:'A manager title does not establish suitable technical review coverage.',
        enforce:'Define reviewer competence, protected domains, full-change review expectation, and mandatory specialist escalation triggers.',
        test:'Present a change in two specialist domains and verify that the lighter route requires escalation.',
        evidence:'Review policy, ownership map, sample approval comments, escalation cases, defect feedback.'},
      {title:'Separate policy authority from merge execution',why:'The automation should not grant itself a broader exception.',
        enforce:'Restrict policy edits, allowlists, bypass accounts and merge credentials independently from the classifier and router.',
        test:'Attempt manager-only merge with an excluded change through each supported merge or privileged path.',
        evidence:'Identity permission exports, ruleset ownership, bypass actor list, test outcomes and audit events.'}
    ],
    failureQuestion:'Could an excluded change reach manager-only approval and merge without specialist review?',
    stages:[
      {name:'Classify',condition:'A policy decides whether a PR may use manager-only authorization.',
        good:'Protected paths, high-impact dependencies and unknowns are excluded from the lighter route.',
        bad:'A consequential file is labeled low risk and becomes eligible for reduced reviewer coverage.',
        safeguard:'Versioned deterministic exclusions, dependency awareness and deny-by-default handling.',
        evidence:'Effective eligibility policy, reviewed diff and dependencies, classification trace.'},
      {name:'Route',condition:'The system requests a manager rather than all affected code owners.',
        good:'Only truly eligible PRs enter the manager route; excluded cases keep specialist review.',
        bad:'An excluded PR is routed to a manager with no specialist escalation.',
        safeguard:'Policy-enforced reviewer requirements and explicitly protected classes.',
        evidence:'Routing decision, requested reviewers, code ownership and denial reasons.'},
      {name:'Review',condition:'The manager reviews the entire candidate change.',
        good:'A qualified reviewer evaluates the scope and escalates unfamiliar or cross-team changes.',
        bad:'The only reviewer lacks context but approves a technically consequential change.',
        safeguard:'Reviewer qualifications, full-diff expectations and enforceable escalation criteria.',
        evidence:'Review comments, affected domains, reviewer role and escalation events.'},
      {name:'Authorize',condition:'The candidate is proposed for merge under the alternate approval route.',
        good:'The merge gate independently confirms eligibility, required approval and current commit.',
        bad:'The manager-only approval or a privileged bot satisfies a broad bypass for ineligible code.',
        safeguard:'Scope-bound authorization, latest-commit validation and separately governed merge privileges.',
        evidence:'Actual ruleset/bypass configuration, authorization record, negative merge test for an excluded PR.'},
      {name:'Observe',condition:'The team evaluates quality and exceptions after enabling the route.',
        good:'Escalations, false eligibility decisions and defects trigger review or rollback of the route.',
        bad:'Only approval speed is measured while unsafe classifications go undetected.',
        safeguard:'Exception reconciliation, targeted quality sampling, escalation owner and shutdown criteria.',
        evidence:'Eligibility/merge population reconciliation, missed exclusions, incidents, rollout decisions.'}
    ],
    teams:{
      engineering:'Exactly which file classes can be competently approved by one person, and what is the measurable benefit?',
      risk:'Who owns eligibility policy, reviewer qualification and privileged bypass exceptions?',
      assurance:'Can an excluded PR be shown to fail at the real merge boundary, including privileged paths?'
    }
  },
  agent:{
    number:'03',category:'Agentic engineering',title:'Agent-submitted approval',
    description:'A human engineer reviews several fictional pull requests and explicitly decides which ones to approve. An agent then submits the GitHub review actions for the engineer.',
    authority:'Human decides; agent executes an action',
    assumption:'Approval must be bound to each reviewed PR revision',
    decision:'Pilot only with explicit, revision-bound authorization',
    why:'Delegating a mechanical GitHub action is not automatically delegating approval judgment. The design becomes riskier if an agent can approve without a specific human decision, reuse stale instructions, or act through credentials whose scope exceeds that decision.',
    pivot:'What prevents the agent from approving a PR or commit that the human did not explicitly authorize?',
    current:'Engineers inspect changes and submit GitHub approvals themselves.',
    proposed:'Engineers decide; an agent submits separately authorized review actions for the exact PRs and revisions.',
    alternative:'Use a human-operated GitHub batch interface or purpose-built review command requiring explicit per-PR confirmation before delegating agent execution.',
    counterargument:'If each human has already evaluated a change, insisting on manual button clicks adds little review substance. A reliable execution tool may reduce friction, provided it cannot silently expand the engineer’s decisions.',
    risks:[
      {title:'Agent judgment replaces the human decision',condition:'The instruction is vague, such as “review and approve what looks safe.”',consequence:'The agent makes substantive approval judgments despite appearing to act for a person.',safeguard:0},
      {title:'Approval applies to a changed revision',condition:'A stacked PR is rebased or updated after human authorization.',consequence:'The recorded approval may cover code the engineer never saw.',safeguard:1},
      {title:'Agent credentials exceed delegated permission',condition:'An agent can access GitHub CLI/API routes outside the intended approval workflow.',consequence:'The agent can submit extra approvals or potentially take privileged actions.',safeguard:2}
    ],
    safeguards:[
      {title:'Capture explicit per-PR human authorization',why:'A GitHub approval under a human identity does not by itself prove that a human made the decision.',
        enforce:'Require an explicit human go/no-go for each PR and reviewed revision before the agent submits a review.',
        test:'Give an ambiguous “approve any safe PRs” instruction; confirm the agent cannot approve on its own judgment.',
        evidence:'Human instruction record, per-PR decision, action trace and resulting GitHub review.'},
      {title:'Bind execution to exact revisions',why:'Stacks, rebases and subsequent commits can invalidate a previous review.',
        enforce:'Match repository, PR ID, head SHA and action to the explicit human authorization immediately before submission.',
        test:'Rebase one PR after the approval instruction, then attempt to submit the old decision; require renewed authorization.',
        evidence:'Commit IDs at decision and execution, rejected stale action, current GitHub review revision.'},
      {title:'Bound credential and tool authority',why:'The agent may have CLI or API paths beyond the approved interaction.',
        enforce:'Least-privilege credentials, narrow permitted actions, audit of GitHub MCP/CLI paths, and independent detection of extra submissions.',
        test:'Try to approve a PR not in the authorized set or alter repository protections; require denial and visible exception.',
        evidence:'GitHub App/token scopes, command/API trace, rejection events and reconciliation across decisions and reviews.'}
    ],
    failureQuestion:'Can an agent submit an approval for a PR revision the engineer never explicitly approved?',
    stages:[
      {name:'Inspect',condition:'The engineer examines a stack of proposed changes with AI assistance.',
        good:'The engineer receives sufficient context to decide on each exact revision.',
        bad:'The agent substitutes its own assessment while the human sees only a summary.',
        safeguard:'Distinguish AI review assistance from the human approval decision.',
        evidence:'Reviewed PR identifiers, head SHAs, interaction and decision records.'},
      {name:'Decide',condition:'The engineer explicitly chooses whether to approve individual PRs.',
        good:'Each decision identifies one PR, one revision and one intended GitHub action.',
        bad:'A blanket instruction authorizes decisions the engineer did not actually make.',
        safeguard:'Per-PR human confirmation with bounded scope and clear rejection on ambiguity.',
        evidence:'Explicit human authorization artifact and corresponding PR head identity.'},
      {name:'Execute',condition:'The agent invokes GitHub MCP, CLI or API to submit a review.',
        good:'Only authorized review actions are submitted under an appropriate identity.',
        bad:'The agent approves an extra PR or acts through an unrestricted credential.',
        safeguard:'Allowlisted action scope, least privilege and revision checks at execution time.',
        evidence:'Tool-call trace, token scope, review audit event, attempted disallowed action.'},
      {name:'Enforce',condition:'GitHub evaluates the review and the current merge requirements.',
        good:'Changed revisions and missing required approvals remain blocked independently of the agent.',
        bad:'An old approval or privileged bypass allows a merge beyond the human decision.',
        safeguard:'Protected merge rules, current-commit validation and controlled bypass permissions.',
        evidence:'Ruleset export, commit/review mapping and a negative stale-approval merge test.'},
      {name:'Reconcile',condition:'Operations compare recorded human decisions with submitted approvals.',
        good:'Unexpected approvals, missing decisions and revision mismatches create actionable exceptions.',
        bad:'Only agent tool logs are collected, so independent approval discrepancies go unnoticed.',
        safeguard:'Reconcile the population of actual GitHub reviews against independent human authorization records.',
        evidence:'Complete GitHub review events, authorization register, exceptions, notification and resolution.'}
    ],
    teams:{
      engineering:'Could the same productivity benefit come from a simpler per-PR confirmation interface?',
      risk:'Which action permissions and credentials can the agent use outside the intended approval flow?',
      assurance:'Can every GitHub approval be matched to a human decision and the exact approved revision?'
    }
  }
});
const byId=id=>document.getElementById(id);
const setText=(id,value)=>{const node=byId(id);if(node)node.textContent=value;};
function create(tag,className,textValue){
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(textValue!==undefined)node.textContent=textValue;
  return node;
}
function renderList(items,container,renderer){
  container.replaceChildren(...items.map(renderer));
}
export function initExplorer(){
  if(typeof document==='undefined')return;
  let caseId='routing',view='brief',stageIndex=0;
  const choiceButtons=[...document.querySelectorAll('[data-case]')];
  const tabButtons=[...document.querySelectorAll('.assessment-tabs [data-view]')];
  function activateView(next,{focus=false}={}){
    view=next;
    for(const tab of tabButtons){
      const selected=tab.dataset.view===next;
      tab.setAttribute('aria-selected',String(selected));
      tab.tabIndex=selected?0:-1;
      if(selected&&focus)tab.focus();
    }
    for(const kind of ['brief','safeguards','failure'])byId('view-'+kind).hidden=kind!==next;
  }
  function showSafeguard(index){
    activateView('safeguards');
    const card=byId('safeguard-'+index);
    if(card){
      card.classList.add('flash');
      card.scrollIntoView({block:'start',behavior:'auto'});
      card.focus({preventScroll:true});
    }
  }
  function renderDecision(data){
    setText('decision-title',data.decision);
    setText('decision-why',data.why);
    setText('decision-pivot',data.pivot);
    setText('option-current',data.current);
    setText('option-proposed',data.proposed);
    setText('option-alternative',data.alternative);
    setText('decision-counterargument',data.counterargument);
    renderList(data.risks,byId('risk-list'),(risk,i)=>{
      const row=create('article','risk-item');
      const button=create('button');
      button.type='button';
      button.setAttribute('aria-label','Explore safeguard for '+risk.title);
      const left=create('div');
      left.append(create('span','risk-symbol','RISK '+String(i+1).padStart(2,'0')),
        create('strong','',risk.title),
        create('p','',risk.condition+' '+risk.consequence));
      button.append(left,create('span','risk-link','Inspect safeguard →'));
      button.addEventListener('click',()=>showSafeguard(risk.safeguard));
      row.append(button);
      return row;
    });
  }
  function renderSafeguards(data){
    renderList(data.safeguards,byId('safeguard-list'),(item,i)=>{
      const card=create('article','safeguard-card');
      card.id='safeguard-'+i;
      card.tabIndex=-1;
      const head=create('header');
      head.append(create('span','eyebrow','SAFEGUARD 0'+(i+1)),
        create('span','safeguard-status','NOT ASSESSED'));
      card.append(head,create('h3','',item.title),create('p','',item.why));
      const tech=create('div','safeguard-tech');
      for(const [label,description] of [
        ['How to enforce',item.enforce],
        ['Negative test',item.test],
        ['Evidence to inspect',item.evidence]
      ]){
        const box=create('div');
        box.append(create('strong','',label),create('p','',description));
        tech.append(box);
      }
      card.append(tech);
      return card;
    });
  }
  function selectStage(index){
    stageIndex=index;
    const stage=scenarioCases[caseId].stages[index];
    if(!stage)return;
    for(const button of document.querySelectorAll('#stage-strip .stage-button')){
      button.setAttribute('aria-pressed',String(Number(button.dataset.stage)===index));
    }
    setText('stage-title',stage.name);
    setText('stage-condition',stage.condition);
    setText('outcome-good',stage.good);
    setText('outcome-bad',stage.bad);
    setText('outcome-safeguard',stage.safeguard);
    setText('outcome-evidence',stage.evidence);
  }
  function renderFailure(data){
    setText('failure-question',data.failureQuestion);
    renderList(data.stages,byId('stage-strip'),(stage,i)=>{
      const button=create('button','stage-button');
      button.type='button';
      button.dataset.stage=String(i);
      button.setAttribute('aria-pressed','false');
      button.setAttribute('aria-label','Inspect stage '+(i+1)+': '+stage.name);
      button.append(create('span','stage-index',String(i+1).padStart(2,'0')),
        create('strong','',stage.name));
      button.addEventListener('click',()=>selectStage(i));
      return button;
    });
    const teams=Object.entries(data.teams).map(([key,value])=>{
      const card=create('article');
      const labels={engineering:'Engineering',risk:'Risk & Governance',assurance:'Independent Assurance'};
      card.append(create('strong','',labels[key]||key),create('p','',value));
      return card;
    });
    byId('team-questions').replaceChildren(...teams);
    byId('teams-disclosure').open=false;
    selectStage(0);
  }
  function choose(id){
    if(!Object.hasOwn(scenarioCases,id))return;
    caseId=id;
    const data=scenarioCases[id];
    for(const button of choiceButtons)button.setAttribute('aria-pressed',String(button.dataset.case===id));
    setText('case-number',data.number);
    setText('case-category',data.category);
    setText('scenario-title',data.title);
    setText('scenario-description',data.description);
    setText('case-authority',data.authority);
    setText('case-assumption',data.assumption);
    renderDecision(data);
    renderSafeguards(data);
    renderFailure(data);
    activateView('brief');
  }
  for(const button of choiceButtons)button.addEventListener('click',()=>choose(button.dataset.case));
  for(const button of tabButtons)button.addEventListener('click',()=>activateView(button.dataset.view));
  const names=['brief','safeguards','failure'];
  for(const button of tabButtons)button.addEventListener('keydown',event=>{
    const i=names.indexOf(button.dataset.view);
    const next=event.key==='ArrowRight'?names[(i+1)%names.length]:
      event.key==='ArrowLeft'?names[(i+names.length-1)%names.length]:
      event.key==='Home'?names[0]:event.key==='End'?names[names.length-1]:null;
    if(next){event.preventDefault();activateView(next,{focus:true});}
  });
  choose('routing');
}
if(typeof document!=='undefined')initExplorer();
