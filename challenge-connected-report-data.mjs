// Pure projection of the current validated Challenge Lab response into a connected-report preview.
// No claims about system implementation, management decisions, or independent assurance are synthesized.
const words=(value,max=800)=>typeof value==='string'?value.trim().slice(0,max):'';
const array=value=>Array.isArray(value)?value:[];
const uniqueStrings=(items,max=6)=>[...new Set(items.map(x=>words(x,600)).filter(Boolean))].slice(0,max);
const isHttpUrl=url=>{try{return new URL(url).protocol==='https:';}catch{return false;}};
const implementationLabels={
  'not-assessed':'Unknown',
  'reported-absent':'Not implemented · user-reported',
  'reported-partial':'Partial · user-reported',
  'reported-full':'Full · user-reported'
};
function evidenceLabel(support){
  return {'explicit-user-statement':'User-reported',inference:'Inference',unknown:'Unknown'}[support]||'Unclassified';
}
export function isHumanDelegatedApprovalScenario(scenario){
  const text=words(scenario,4000);
  return /\b(agent|automation|assistant|claude)\b/i.test(text) &&
    /\b(approv(?:e|al|es|ed|ing)|reviews?)\b/i.test(text) &&
    /\b(github|pull requests?|\bPRs?\b|stacked)\b/i.test(text) &&
    // Attribute the decision to the human actor in the same clause.
    // A scenario where an engineer reviews a plan but the agent decides
    // actual PR approval must NOT be treated as delegated human approval.
    /\b(?:engineer|human|person|reviewer)\b(?:(?!\b(?:agent|bot|autonomous model)\b)[^.!?]){0,180}\b(?:decid(?:e|es|ed|ing)|decision|authoriz(?:e|es|ed|ation)|approv(?:e|es|ed|ing|al))\b/i.test(text);
}
export function projectConnectedReport(data,scenarioText=''){
  if(!data||typeof data!=='object'||!array(data.conclusions).length) return null;
  const primary=data.conclusions[0]||{};
  const challenges=array(data.challenges).filter(x=>x&&typeof x==='object');
  const lead=challenges[0]||{};
  const tests=uniqueStrings(challenges.flatMap(x=>array(x.tests)),5);
  const options=uniqueStrings([...array(data.alternatives),...challenges.flatMap(x=>array(x.alternatives))],6);
  const facts=array(data.facts).filter(x=>x&&words(x.statement));
  const unknownFacts=facts.filter(f=>f.support==='unknown').map(f=>words(f.statement));
  const unknowns=uniqueStrings([...array(data.unknowns),...unknownFacts],6);
  const questions=array(data.clarifications).filter(x=>x&&words(x.question));
  const pivot=words(questions[0]?.question)||words(primary.openQuestion);
  const safeguards=array(data.expectedSafeguards).filter(x=>x&&words(x.objective)).slice(0,6).map(s=>({
    objective:words(s.objective,200),
    why:words(s.why,350),
    implementation:implementationLabels[s.implementation]||'Unknown',
    statusBasis:words(s.implementationBasis,300),
    referenceIds:uniqueStrings(array(s.referenceIds),3)
  }));
  const advisory=data.decisionPerspectives||{};
  const operational=data.operationalReview||null;
  const selectedIds=new Set([
    ...array(data.engineeringReferences).filter(ref=>ref&&ref.modelUsed).map(ref=>ref.id),
    ...safeguards.flatMap(x=>x.referenceIds),
    ...['engineering','risk','assurance'].flatMap(name=>array(advisory[name]?.referenceIds)),
    ...array(operational?.referenceIds)
  ]);
  const sources=array(data.engineeringReferences).filter(r=>r&&isHttpUrl(r.url)).map(ref=>({
    id:words(ref.id,100),
    title:words(ref.title,240),
    url:ref.url,
    publisher:words(ref.publisher,100),
    facts:uniqueStrings(array(ref.facts),6),
    limits:words(ref.limits,700),
    reviewedAsOf:words(ref.reviewedAsOf,40),
    used:selectedIds.has(ref.id)
  })).sort((a,b)=>Number(b.used)-Number(a.used));
  const frameworkSources=array(data.conclusions).flatMap(c=>array(c?.citations))
    .filter(c=>c&&isHttpUrl(c.url))
    .reduce((acc,c)=>{
      if(!acc.some(x=>x.provisionId===c.provisionId))
        acc.push({provisionId:words(c.provisionId,120),title:words(c.provisionTitle||c.sourceTitle,240),
          sourceTitle:words(c.sourceTitle,240),summary:words(c.sourceSummary,500),
          limits:words(c.qualification,600),url:c.url});
      return acc;
    },[]);
  // Prefer validated, audience-specific model reasoning; retain the previous
  // transparent synthesis for older responses that do not include new fields.
  const lens=(name,fallback)=>{
    const authored=advisory[name];
    if(!authored)return {...fallback,modelGenerated:false,referenceIds:[]};
    return {
      ...fallback,summary:words(authored.position,650),
      items:uniqueStrings(array(authored.considerations),3),
      action:words(authored.nextStep,500),
      pivot:words(authored.pivot,400),
      referenceIds:array(authored.referenceIds),
      modelGenerated:true
    };
  };
  const delegated=isHumanDelegatedApprovalScenario(scenarioText||data.scenarioText);
  const operationalState=operational?.implementation?
    (implementationLabels[operational.implementation]||'Unknown'):'Not assessed';
  return {
    recommendation:words(primary.application,1200),
    basis:words(primary.scenarioBasis,800),
    counterargument:words(data.counterargument,900),
    leadRisk:words(lead.question,400),
    leadRiskReason:words(lead.reason,900),
    safeguards,
    facts:facts.slice(0,12).map(f=>({statement:words(f.statement,700),label:evidenceLabel(f.support)})),
    unknowns,
    scenarioText:words(scenarioText||data.scenarioText,4000),
    references:sources,
    frameworkSources,
    questions:questions.slice(0,3).map(q=>({question:words(q.question,350),why:words(q.why,400)})),
    reassessment:words(data.reassessment,900),
    perspectives:{
      engineering:lens('engineering',{
        title:'Engineering advisory',
        summary:words(primary.application,1200),
        highlight:'Architecture and operational tradeoffs',
        items:options,
        action:tests[0]||'No specific engineering experiment was supplied in this assessment.',
        pivot:pivot||'No decision-changing question was returned.'
      }),
      risk:lens('risk',{
        title:'Risk disposition',
        summary:words(lead.reason,900)||'No material exposure description was returned.',
        highlight:'Exposure and treatment considerations',
        items:challenges.slice(0,3).map(c=>words(c.question,450)),
        action:'Risk registration, treatment, ownership and acceptance have not been determined by this assessment.',
        pivot:pivot||'No scenario-specific decision-changing question was returned.'
      }),
      assurance:lens('assurance',{
        title:'Independent assurance',
        summary:words(primary.scenarioBasis,800)||'No separate assurance conclusion was returned.',
        highlight:'Evidence and remaining unknowns',
        items:unknowns.length?unknowns:array(data.conclusions).slice(0,2).map(c=>words(c.openQuestion)),
        action:'The current response does not contain a separately substantiated independent assurance position.',
        pivot:words(primary.openQuestion)||'No assurance-specific question was returned.'
      })
    },
    reconciliation:delegated?{
      title:'Can human authorization, agent/API execution, and the recorded GitHub review be reconciled?',
      status:operational?.kind==='reconciliation'?operationalState:'Not assessed',
      stages:[
        {label:'Human decision',detail:'Identity, explicit instruction, repository, PR and authorized revision'},
        {label:'Agent / API action',detail:'Execution identity, tool request, revision, result and correlation ID'},
        {label:'Recorded review',detail:'GitHub actor, review ID, commit SHA, state and submission time'}
      ],
      question:operational?.kind==='reconciliation'?
        words(operational.question,450):
        'Is there a way to match all three records and detect missing, duplicated, unauthorized or stale-revision approvals?',
      detection:operational?.kind==='reconciliation'?words(operational.detection,500):'',
      response:operational?.kind==='reconciliation'?words(operational.response,500):'',
      statusBasis:operational?.kind==='reconciliation'?words(operational.implementationBasis,300):'',
      note:operational?.kind==='reconciliation'?
        'This is model-generated operational reasoning based on the scenario; reported status is not independently verified.':
        'This is an architectural question surfaced for the described workflow, not a claim that reconciliation exists or is absent.'
    }:null,
    operational:operational&&!delegated?{
      title:operational.kind==='monitoring'?'Operational monitoring and detection':
        operational.kind==='recovery'?'Operational recovery and response':'Operational reconciliation',
      question:words(operational.question,450),
      detection:words(operational.detection,500),
      response:words(operational.response,500),
      status:operationalState,
      statusBasis:words(operational.implementationBasis,300)
    }:null,
    advisoryGenerated:!!(advisory.engineering&&advisory.risk&&advisory.assurance),
    advisoryWarnings:array(data.advisoryWarnings).map(x=>words(x,180)),
    sourceWarning:words(data.referenceWarning,500)
  };
}
