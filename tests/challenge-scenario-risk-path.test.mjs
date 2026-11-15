import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AGENT_CONTRACT_VERSION,validateAgentResponse} from '../challenge-agent-contract.js';
import {riskPathCatalog,riskPathRoles,riskPathPromptStages} from '../challenge-risk-path-catalog.js';
import {projectConnectedReport,projectRiskPath} from '../challenge-connected-report-data.mjs';
import {buildModelRequest} from '../api/challenge.js';

const scenario='An engineer decides to approve three stacked GitHub PRs. An agent submits the decisions through GitHub API.';
const base={
 contractVersion:AGENT_CONTRACT_VERSION,
 facts:[{statement:'An engineer decides and the agent submits.',support:'explicit-user-statement'}],
 challenges:[{question:'Could an unapproved revision receive approval?',reason:'The PR revision might change before execution.',tests:[],alternatives:[]}],
 conclusions:[{scenarioBasis:'Human decision and agent execution are separate.',application:'Explore bounded execution.',openQuestion:'Is the reviewed SHA bound to execution?',basisType:'engineering-judgment',citationIds:[]}],
 approvalOutcomes:[],citationIds:[],referenceIds:[],unknowns:['Enforcement configuration'],alternatives:[],
 counterargument:'Native GitHub routing might suffice.',
 expectedSafeguards:[{objective:'Bind execution to reviewed revision',why:'Avoid stale decisions.',implementation:'not-assessed',referenceIds:[]}],
 clarifications:[]
};
const deliveryPath={
 pathway:'delivery',
 failure:'A changed PR revision may receive an approval that the engineer did not authorize.',
 uncertainty:'Repository revision and bypass enforcement are not described.',
 steps:[
  {stageId:'authorization',roles:['origin'],event:'The agent submits without rechecking the exact authorized revision.',interruption:'',evidence:'Explicit decision bound to repo, PR and head SHA.'},
  {stageId:'merge',roles:['exposure','prevention'],event:'A stale review might satisfy the merge gate.',interruption:'Require fresh review after changes and independently enforce merge eligibility.',evidence:'GitHub ruleset, review commit ID and merge event.'},
  {stageId:'monitor',roles:['detection'],event:'A review-to-authorization mismatch may be found after submission.',interruption:'',evidence:'Reconcile human instruction, API requests and GitHub reviews.'}
 ]
};
const options=(text=scenario)=>({scenarioText:text,requireGrounding:true,assessmentPhase:'initial',allowedReferenceIds:[]});
function validResponse(riskPath=deliveryPath,text=scenario){
 return validateAgentResponse({...base,riskPath},options(text));
}
test('delivery stage catalogue aligns to the eight Field Guide touchpoints',()=>{
 assert.deepEqual(riskPathCatalog.delivery.map(x=>x.id),[
  'pr','eligibility','ai-review','authorization','merge','release','monitor','evidence'
 ]);
 assert.ok(Object.hasOwn(riskPathRoles,'origin'));
 assert.match(riskPathPromptStages(),/operations:/);
});
test('validated causal path distinguishes origins, exposures, possible safeguards and detection',()=>{
 const result=validResponse();
 assert.equal(result.ok,true,JSON.stringify(result.errors));
 assert.deepEqual(result.data.riskPath.steps[1].roles,['exposure','prevention']);
 assert.equal(result.data.riskPath.steps[2].stageId,'monitor');
 assert.equal(result.data.expectedSafeguards[0].implementation,'not-assessed');
 const project=projectConnectedReport({...result.data,engineeringReferences:[]},scenario);
 assert.equal(project.riskPath.steps.length,3);
 assert.equal(project.riskPath.stages.length,8);
 assert.equal(project.riskPath.steps[0].label,'Authorize');
 assert.equal(project.riskPath.steps[1].roles[1].label,'Potential safeguard');
 assert.match(project.riskPath.uncertainty,/not described/);
});
test('invalid, hallucinated or unsorted stage mappings are suppressed without rejecting the assessment',()=>{
 const bad=[
  {...deliveryPath,pathway:'__proto__'},
  {...deliveryPath,pathway:'operations'},
  {...deliveryPath,steps:[deliveryPath.steps[1],deliveryPath.steps[0]]},
  {...deliveryPath,steps:[deliveryPath.steps[0],deliveryPath.steps[0]]},
  {...deliveryPath,steps:[{...deliveryPath.steps[0],stageId:'not-a-stage'},...deliveryPath.steps.slice(1)]},
  {...deliveryPath,steps:[{...deliveryPath.steps[0],roles:['made-up']},...deliveryPath.steps.slice(1)]},
  {...deliveryPath,steps:[{...deliveryPath.steps[0],roles:['origin','origin']},...deliveryPath.steps.slice(1)]},
  {...deliveryPath,steps:[{...deliveryPath.steps[1],stageId:'merge',roles:['exposure']},deliveryPath.steps[2]]},
  {...deliveryPath,steps:[{...deliveryPath.steps[1],stageId:'merge',roles:['prevention'],interruption:''},deliveryPath.steps[2]]},
  {...deliveryPath,steps:deliveryPath.steps.slice(0,1)}
 ];
 for(const path of bad){
  const checked=validResponse(path);
  assert.equal(checked.ok,true,JSON.stringify(checked.errors));
  assert.equal(checked.data.riskPath,undefined);
  assert.ok(checked.data.advisoryWarnings.some(x=>/lifecycle trace/.test(x)),JSON.stringify(path));
  assert.equal(projectRiskPath(path),null);
 }
});
test('operational scenario uses operations taxonomy, not PR or AI reviewer labels',()=>{
 const cloud='A fictional worker rotates application credentials and some consumers may cache old secrets.';
 const ops={
  pathway:'operations',
  failure:'A stale consumer could fail authentication after old credentials are revoked.',
  uncertainty:'Consumer inventory and grace period are unspecified.',
  steps:[
   {stageId:'execute',roles:['origin'],event:'Old credential is revoked before all consumers switch.',interruption:'',evidence:'Rotation timeline and consumer inventory.'},
   {stageId:'verify',roles:['exposure','prevention'],event:'An outdated consumer begins rejecting requests.',interruption:'Confirm all critical consumers use new credentials before revocation.',evidence:'Independent authentication success rates.'},
   {stageId:'observe',roles:['detection'],event:'Credential rejection alerts may identify affected consumers.',interruption:'',evidence:'Authentication failure metrics.'}
  ]
 };
 const response=validResponse(ops,cloud);
 assert.equal(response.ok,true,JSON.stringify(response.errors));
 const view=projectConnectedReport({...response.data,engineeringReferences:[]},cloud);
 assert.equal(view.riskPath.pathway,'operations');
 assert.equal(view.riskPath.stages.length,7);
 assert.equal(view.riskPath.steps[0].label,'Execute');
 assert.ok(!view.riskPath.stages.some(x=>/github|pr|AI review/i.test(x.label)));
});
test('uncertain incident origin can yield no risk path rather than invent a root cause',()=>{
 const response=validResponse(null);
 assert.equal(response.ok,true,JSON.stringify(response.errors));
 assert.equal(response.data.riskPath,undefined);
 const view=projectConnectedReport({...response.data,engineeringReferences:[]});
 assert.equal(view.riskPath,null);
});
test('model prompt requests conditional origin, exposure, prevention and detection once',()=>{
 const req=buildModelRequest({scenarioText:scenario,turns:[],history:[],assessmentPhase:'initial'});
 const instruction=req.messages[0].content;
 assert.match(instruction,/one optional riskPath causal trace/);
 assert.match(instruction,/Unknown failure origin must not be invented/);
 assert.match(instruction,/A submitted review alone does not establish an enforcement bypass/);
 assert.match(instruction,/delivery: pr, eligibility, ai-review/);
 assert.match(instruction,/or null when mapping is unjustified/);
 assert.equal(req.messages.length,2);
});
test('interactive view is a read-only local stage selector, with no HTML injection',()=>{
 const view=readFileSync(new URL('../challenge-connected-report-view.mjs',import.meta.url),'utf8');
 assert.match(view,/function renderRiskPath/);
 assert.match(view,/Show all /);
 assert.match(view,/No specific causal point was mapped/);
 assert.match(view,/aria-pressed/);
 assert.match(view,/select\(selected\.find/);
 assert.match(view,/renderRiskPath\(project,root\)/);
 assert.doesNotMatch(view,/innerHTML|eval\(|\bfetch\s*\(/);
});
