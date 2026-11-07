/* DP-08: fictional source-to-feed comparison; not proof of population completeness. */
(function(root){
'use strict';
const SCENARIOS=Object.freeze({
 unverified:'No independently established source population',
 matched:'Sample records match',
 missing:'Deployment omitted from monitoring feed',
 extra:'Feed contains an unmatched record',
 duplicate:'Duplicate monitored event',
 mismatch:'Same identifier, conflicting artifact'
});
function record(id,digest){return {id,digest};}
function compare(source,feed){
 if(!Array.isArray(source)||!Array.isArray(feed))throw new TypeError('Source and feed arrays required');
 const valid=a=>a.every(r=>r&&typeof r.id==='string'&&r.id.trim()&&typeof r.digest==='string'&&r.digest.trim());
 if(!valid(source)||!valid(feed))throw new TypeError('Records require identified deployment and digest');
 const count=a=>{const counts=new Map();for(const r of a)counts.set(r.id,(counts.get(r.id)||0)+1);return counts;};
 const sourceCounts=count(source),feedCounts=count(feed);
 const duplicates=[...new Set([...sourceCounts,...feedCounts].filter(([id])=>(sourceCounts.get(id)||0)>1||(feedCounts.get(id)||0)>1).map(([id])=>id))];
 const src=new Map(source.map(r=>[r.id,r])),observed=new Map(feed.map(r=>[r.id,r]));
 const missing=source.filter(r=>!observed.has(r.id)).map(r=>r.id);
 const unmatched=feed.filter(r=>!src.has(r.id)).map(r=>r.id);
 const mismatches=source.filter(r=>observed.has(r.id)&&observed.get(r.id).digest!==r.digest).map(r=>r.id);
 const status=duplicates.length?'DUPLICATE':mismatches.length?'MISMATCH':missing.length?'MISSING_FEED':unmatched.length?'UNMATCHED_FEED':'MATCHED_SAMPLE';
 return {status,sourceCount:source.length,feedCount:feed.length,missing,unmatched,duplicates,mismatches};
}
function simulate(caseRecord,scenario){
 if(!Object.prototype.hasOwnProperty.call(SCENARIOS,scenario))throw new TypeError('Unknown reconciliation case');
 const latest=caseRecord&&Array.isArray(caseRecord.deployments)?caseRecord.deployments.at(-1):null;
 const baseline=record(latest&&typeof latest.recordId==='string'&&latest.recordId.trim()?latest.recordId:'demo-deployment-sample',latest&&typeof latest.digest==='string'&&latest.digest.trim()?latest.digest:'demo-artifact-sample');
 const source=[baseline],feed=[{...baseline}];
 if(scenario==='missing')source.push(record('demo-independent-release-02','demo-artifact-02'));
 if(scenario==='extra')feed.push(record('demo-unmatched-feed-02','demo-artifact-02'));
 if(scenario==='duplicate')feed.push({...baseline});
 if(scenario==='mismatch')feed[0].digest='demo-conflicting-artifact';
 const comparison=scenario==='unverified'?null:compare(source,feed);
 const actions={
  unverified:'Request an independently maintained inventory of all production routes, scoped extraction criteria and accountable source owners before testing feed completeness.',
  matched:'Validate source authority, coverage of emergency and manual routes, extraction parameters, pagination and period completeness; matching sample rows cannot establish the population.',
  missing:'Investigate the missing deployment using source-of-record evidence; restore telemetry coverage and assess whether an operational suspension is required.',
  extra:'Identify whether this is a missing source-system record, an out-of-scope feed event or an unauthorized deployment; do not label it unauthorized without corroboration.',
  duplicate:'Examine deduplication and identifier uniqueness, then reconcile event counts and affected reports.',
  mismatch:'Preserve both records and investigate the conflicting artifact identifiers; a known conflict is not simply missing evidence.'
 };
 return {
  scenario,label:SCENARIOS[scenario],
  source,feed,comparison,
  comparisonStatus:comparison?comparison.status:'NOT_ASSESSED',
  populationConclusion:'UNRESOLVED',
  action:actions[scenario],
  proposedAuthority:'Engineering release operations investigates; designated Security/GRC policy owners determine escalation or suspension authority (illustrative responsibilities, not assigned roles).',
  limitation:'The source and feed are invented samples. Their agreement cannot verify a complete, independent population, extraction reliability, retention or operating effectiveness.'
 };
}
const api=Object.freeze({SCENARIOS,compare,simulate});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PopulationDemo=api;
})(typeof globalThis!=='undefined'?globalThis:this);
