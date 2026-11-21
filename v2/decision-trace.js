/* V3.8 Decision Traceability — illustrative, user-entered claims and observations.
   No evidence authentication, automatic authorization, risk score, or backend. */
(function(root){
'use strict';
const modes={
 fasttrack:{label:'Human fast-track',title:'Should deterministic checks and better routing replace some mandatory human review?',decider:'Human reviewer',executor:'Human reviewer / existing CI',scope:'Human approval remains required for consequential changes.',alternatives:['Human fast-track','Human-authorized agent execution','Bounded autonomous AI approval']},
 execution:{label:'Human-authorized agent execution',title:'Should an agent execute an engineer’s explicit PR approval?',decider:'Engineer explicitly authorizes an exact PR/revision',executor:'Agent identity performs the specified GitHub action',scope:'No additional PR, changed revision, or action without renewed authorization.',alternatives:['Direct human approval / fast-track','Human-authorized agent execution','Bounded autonomous AI approval']},
 autonomous:{label:'Bounded autonomous AI approval',title:'Should AI independently approve eligible low-risk pull requests?',decider:'AI eligibility and decision process within management-approved scope',executor:'Restricted automation identity through independently enforced GitHub gates',scope:'Only explicitly eligible changes and validated revisions; outside scope requires human authorization.',alternatives:['Human fast-track','Human-authorized agent execution','Bounded autonomous AI approval']},
 custom:{label:'Other specific engineering decision',title:'',decider:'',executor:'',scope:'',alternatives:[]}
};
const statuses={support:'Reported supporting observation',contradict:'Reported contradictory observation',unknown:'Unresolved / inconclusive'};
function id(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);}
function text(v){return typeof v==='string'?v.trim():'';}
function decisionFromFields(fields,existing){
 const mode=modes[fields.mode]?fields.mode:'custom',template=modes[mode];
 const d={id:existing?.id||id('decision'),mode,title:text(fields.title)||template.title,alternatives:(Array.isArray(fields.alternatives)?fields.alternatives:String(fields.alternatives||'').split('\n')).map(text).filter(Boolean),
  authority:{decider:text(fields.decider),executor:text(fields.executor),scope:text(fields.scope)},
  relatedRisks:Array.isArray(fields.relatedRisks)?fields.relatedRisks.filter(v=>/^R(?:0[1-9]|1\d|2[01])$/.test(v)):[],
  assumptions:text(fields.assumptions),claims:Array.isArray(existing?.claims)?existing.claims:[],management:existing?.management||{decision:'',owner:'',rationale:''}};
 return d;
}
function classify(claim){
 const observations=Array.isArray(claim?.observations)?claim.observations:[];
 const supportive=observations.filter(o=>o.status==='support'&&text(o.result));
 const contrary=observations.filter(o=>o.status==='contradict'&&text(o.result));
 const incomplete=observations.filter(o=>!text(o.source)||!text(o.scope)||!text(o.attribution));
 let label='Unresolved — no reported observations';
 if(contrary.length&&supportive.length)label='Conflicting user-reported observations';
 else if(contrary.length)label='Contradicted by user-reported observation';
 else if(supportive.length)label='Reported support — not independently verified';
 else if(observations.length)label='Unresolved — no conclusive observations';
 return {label,supportive:supportive.length,contrary:contrary.length,incomplete:incomplete.length,verified:false};
}
function summarize(decision){
 const claims=(decision?.claims||[]).map(c=>({id:c.id,claim:c.text||'',assessment:classify(c),observations:c.observations||[]}));
 const unknown=claims.filter(c=>!c.assessment.supportive&&!c.assessment.contrary);
 const conflicted=claims.filter(c=>c.assessment.contrary>0);
 const asserted=(decision?.assertedSafeguards||[]).map(x=>({label:x,verified:false}));
 return {decisionId:decision?.id||null,question:decision?.title||'No decision defined',
  authority:decision?.authority||{},alternatives:decision?.alternatives||[],assumptions:decision?.assumptions||'',
  claims,assertedSafeguards:asserted,unresolved:unknown.map(c=>c.id),
  contradictions:conflicted.map(c=>c.id),relatedRisks:decision?.relatedRisks||[],
  management:decision?.management||{decision:'',owner:'',rationale:''},
  evidenceBoundary:'All observations are user-entered and unverified. This summary is descriptive; not an authorization, independent assurance conclusion or risk score.'};
}
function exportRecord(decision,profile){
 return {schema:'field-guide-decision-record-v1',exportedAt:new Date().toISOString(),decision:decision||null,environmentProfile:profile||null,brief:summarize(decision),
 disclaimer:'Self-entered working record. The application does not authenticate observations or decide architecture eligibility. JSON export is portable; no backend storage.'};
}
root.FGDecision={modes,statuses,id,decisionFromFields,classify,summarize,exportRecord};
})(window);
