/* Public-safe deterministic demonstration. Never grants real approval. */
(function(root){
'use strict';
const F=typeof module!=='undefined'&&module.exports?require('./financial-engine.js'):root.FinancialDemo;
const definitions={
 docs:{id:'docs',title:'Documentation correction',kind:'financial',financialScenario:'docs'},
 shared:{id:'shared',title:'Shared metering dependency',kind:'financial',financialScenario:'shared'},
 policy:{id:'policy',title:'Policy self-change',kind:'financial',financialScenario:'downgrade'},
 newCommit:{id:'newCommit',title:'New commit after review',kind:'revision'},
 bypass:{id:'bypass',title:'Manual deployment bypass',kind:'deployment'}
};
function evaluate(input){
 const x=input||{},id=definitions[x.scenario]?x.scenario:'docs',definition=definitions[id];
 const sha=typeof x.sha==='string'&&x.sha.trim()?x.sha:'demo-sha-001';
 const reviewedSha=typeof x.reviewedSha==='string'&&x.reviewedSha.trim()?x.reviewedSha:sha;
 const policyVersion=F.registry.policyVersion;
 const events=[];
 const add=(stage,status,reason)=>events.push({stage,status,reason});
 add('intake','RECORDED','Fictional PR at '+sha);
 if(definition.kind==='financial'){
   const change=F.makeChange(definition.financialScenario,{sha,ci:x.ci!==false,reviewA:x.reviewA||'low',reviewB:x.reviewB||'low'});
   const technical=F.assessTechnicalEligibility(change);
   const scope=F.assessFinancialImpact(change);
   const authorization=F.resolveAuthorization(technical,scope,change,null);
   add('eligibility',scope.status==='ELIGIBLE'?'ELIGIBLE':'ESCALATE',scope.reason);
   add('review',technical.eligible?'FAVORABLE':'NOT_CLEARED',technical.eligible?'Simulated reviews and CI favorable.':technical.reasons.join(' '));
   add('authorization',authorization.route,authorization.reason);
   add('merge',authorization.allowed?'CONDITIONALLY_ELIGIBLE':'BLOCKED',authorization.allowed?'Still subject to independently enforced merge requirements.':'Automated route cannot merge.');
   add('production','NOT_DEPLOYED','No real build or deployment takes place.');
   return {scenario:id,sha,reviewedSha,policyVersion,classification:technical.eligible?'LOW_RISK':'NOT_CLEARED',eligibility:scope.status,authorization:authorization.route,merge:authorization.allowed?'CONDITIONALLY_ELIGIBLE':'BLOCKED',deployment:'NOT_DEPLOYED',evidence:events,reason:authorization.reason};
 }
 if(definition.kind==='revision'){
   const stale=sha!==reviewedSha;
   add('eligibility','CHECK_REQUIRED','Re-evaluate changed content.');
   add('review',stale?'STALE':'FAVORABLE',stale?'Review applied to '+reviewedSha:'Review matches current SHA.');
   add('authorization',stale?'INVALIDATED':'CONDITIONALLY_ELIGIBLE',stale?'Approval is bound to a different SHA.':'No evidence of a stale approval in this simulated record.');
   add('merge',stale?'BLOCKED':'CONDITIONALLY_ELIGIBLE',stale?'Fresh evaluation and authorization required.':'Additional required checks still apply.');
   add('production','NOT_DEPLOYED','No deployment executed.');
   return {scenario:id,sha,reviewedSha,policyVersion,classification:stale?'STALE':'LOW_RISK',eligibility:'RECHECK',authorization:stale?'INVALIDATED':'CONDITIONALLY_ELIGIBLE',merge:stale?'BLOCKED':'CONDITIONALLY_ELIGIBLE',deployment:'NOT_DEPLOYED',evidence:events,reason:stale?'Previous authorization invalidated; evaluate the current SHA.':'Reviewed SHA matches current revision; other controls still required.'};
 }
 const bypassPrevented=x.deploymentEnforced!==false;
 add('eligibility','OUTSIDE_APPROVAL_ROUTE','Manual deployment request does not establish PR eligibility.');
 add('review','NOT_APPLICABLE','GitHub review cannot authorize a separate deployment path.');
 add('authorization','NOT_AUTHORIZED','No qualifying authorized source record.');
 add('merge','BYPASSED','Alternate deployment route attempted.');
 add('production',bypassPrevented?'PREVENTED':'UNAUTHORIZED_DEPLOYMENT',bypassPrevented?'Independent deployment gate rejected the request.':'Bypass reached production; monitoring may detect it but does not retroactively authorize it.');
 return {scenario:id,sha,reviewedSha,policyVersion,classification:'NOT_APPLICABLE',eligibility:'OUTSIDE_APPROVAL_ROUTE',authorization:'NOT_AUTHORIZED',merge:'BYPASSED',deployment:bypassPrevented?'PREVENTED':'UNAUTHORIZED_DEPLOYMENT',evidence:events,reason:bypassPrevented?'Deployment prevented by independent enforcement.':'Unauthorized deployment occurred; detection is not prevention.'};
}
const api={definitions,evaluate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PlaygroundDecision=api;
})(typeof globalThis!=='undefined'?globalThis:this);
