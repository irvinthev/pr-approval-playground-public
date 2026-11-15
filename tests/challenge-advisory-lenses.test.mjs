import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateAgentResponse,AGENT_CONTRACT_VERSION} from '../challenge-agent-contract.js';
import {projectConnectedReport} from '../challenge-connected-report-data.mjs';
import {buildModelRequest} from '../api/challenge.js';

const scenario='An engineer explicitly decides to approve three stacked GitHub pull requests. An agent submits the approvals using a GitHub API.';
const base={
 contractVersion:AGENT_CONTRACT_VERSION,
 facts:[{statement:'An engineer decides and an agent submits.',support:'explicit-user-statement'}],
 challenges:[{question:'Can the revision change?',reason:'A rebase may invalidate the engineer decision.',tests:['Rebase in a sandbox'],alternatives:[]}],
 conclusions:[{scenarioBasis:'Human decides, agent executes.',application:'Investigate a scoped approval submitter.',openQuestion:'Which GitHub permissions apply?',basisType:'engineering-judgment',citationIds:[]}],
 approvalOutcomes:[],citationIds:[],referenceIds:[],unknowns:['Approval evidence'],
 alternatives:['Improve native review routing'],
 expectedSafeguards:[{objective:'Bind approval to revision',why:'Prevent approvals for unseen code.',implementation:'not-assessed',referenceIds:[]}],
 clarifications:[],counterargument:'GitHub review rules may already address revision changes.'
};
const decisionPerspectives={
 engineering:{position:'Compare a narrow submitter with existing GitHub tooling.',considerations:['Handle rebases, retries and partial batch failure.','Measure developer friction and maintenance.'],nextStep:'Trial a scoped sandbox submission.',pivot:'Would native GitHub improvements remove the bottleneck?',referenceIds:['GH-REVIEW']},
 risk:{position:'Broad authority could create unauthorized review exposure.',considerations:['Determine repository scope and material outcome.'],nextStep:'Determine the management treatment needed, if any.',pivot:'Do permissions prevent out-of-scope reviews?',referenceIds:[]},
 assurance:{position:'A recorded GitHub review alone is not the original human instruction.',considerations:['Trace instruction, execution and persisted review.'],nextStep:'Independently examine the evidence chain and GitHub enforcement.',pivot:'Does the read-back tie to the authorized revision?',referenceIds:['GH-REVIEW']}
};
const operationalReview={
 kind:'reconciliation',
 question:'Can human intent, agent API action and GitHub persisted review be matched?',
 detection:'Compare reviews to authorized decisions by repository, PR, SHA and ID.',
 response:'Investigate unapproved or missing reviews and suspend execution where warranted.',
 implementation:'not-assessed',referenceIds:['GH-REVIEW']
};
const check=(x,scenarioText=scenario)=>validateAgentResponse(x,{
 scenarioText,requireGrounding:true,assessmentPhase:'initial',allowedReferenceIds:['GH-REVIEW']
});
test('all three scenario-specific perspectives survive validation without changing main conclusion',()=>{
 const result=check({...base,decisionPerspectives,operationalReview});
 assert.equal(result.ok,true,JSON.stringify(result.errors));
 assert.equal(result.data.decisionPerspectives.engineering.nextStep,decisionPerspectives.engineering.nextStep);
 assert.equal(result.data.decisionPerspectives.risk.position,decisionPerspectives.risk.position);
 assert.equal(result.data.decisionPerspectives.assurance.position,decisionPerspectives.assurance.position);
 assert.equal(result.data.operationalReview.kind,'reconciliation');
 assert.equal(result.data.conclusions[0].application,base.conclusions[0].application);
 assert.deepEqual(result.data.decisionPerspectives.engineering.referenceIds,['GH-REVIEW']);
});
test('unprovided source IDs and unsupported implementation claims are not rendered in new fields',()=>{
 const invalidLens={...decisionPerspectives,assurance:{...decisionPerspectives.assurance,referenceIds:['INVENTED']}}; 
 const bad=check({...base,decisionPerspectives:invalidLens,operationalReview:{
  ...operationalReview,implementation:'reported-full',implementationBasis:''}});
 assert.equal(bad.ok,true,'The already validated base assessment should survive invalid optional lenses.');
 assert.equal(bad.data.decisionPerspectives,undefined);
 assert.equal(bad.data.operationalReview,undefined);
 assert.equal(bad.data.advisoryWarnings.length,2);
});
test('model-authored advisory positions and their references appear instead of legacy placeholders',()=>{
 const response=check({...base,decisionPerspectives,operationalReview}).data;
 const p=projectConnectedReport({...response,engineeringReferences:[{
  id:'GH-REVIEW',title:'GitHub reviews',url:'https://docs.github.com/en/rest/pulls/reviews',
  facts:['Review records are retrievable'],limits:'Does not establish the human decision.',modelUsed:true
 }]},scenario);
 assert.equal(p.advisoryGenerated,true);
 assert.equal(p.perspectives.engineering.summary,decisionPerspectives.engineering.position);
 assert.equal(p.perspectives.risk.action,decisionPerspectives.risk.nextStep);
 assert.equal(p.perspectives.assurance.pivot,decisionPerspectives.assurance.pivot);
 assert.deepEqual(p.perspectives.assurance.referenceIds,['GH-REVIEW']);
 assert.equal(p.reconciliation.question,operationalReview.question);
 assert.match(p.reconciliation.detection,/Compare reviews/);
 assert.equal(p.reconciliation.status,'Unknown');
 assert.equal(p.references[0].used,true);
 assert.match(p.references[0].limits,/Does not establish/);
});
test('unrelated proposal uses its own operations, not stacked PR reconciliation',()=>{
 const unrelated='A worker rotates cloud secrets and several consumers cache the old value.';
 const operational={
  kind:'monitoring',question:'Can lagging consumers be detected?',detection:'Track credential rejection rates.',
  response:'Rollback and allow overlapping credentials during recovery.',implementation:'not-assessed',referenceIds:[]
 };
 const response=check({...base,decisionPerspectives,operationalReview:operational},unrelated).data;
 const p=projectConnectedReport({...response,engineeringReferences:[]},unrelated);
 assert.equal(p.reconciliation,null);
 assert.equal(p.operational.title,'Operational monitoring and detection');
 assert.match(p.operational.detection,/rejection rates/);
});
test('legacy responses remain valid and clearly identified as synthesized',()=>{
 const response=check(base).data;
 const p=projectConnectedReport({...response,engineeringReferences:[]},scenario);
 assert.equal(p.advisoryGenerated,false);
 assert.equal(p.perspectives.assurance.modelGenerated,false);
 assert.equal(p.reconciliation.status,'Not assessed');
});
test('single model request includes distinct advisory and operational fields, not a separate call',()=>{
 const req=buildModelRequest({scenarioText:scenario,turns:[],history:[],assessmentPhase:'initial'});
 const instruction=req.messages[0].content;
 assert.match(instruction,/decisionPerspectives: one compact object/);
 assert.match(instruction,/operationalReview: null/);
 assert.match(instruction,/three paraphrases/);
 assert.match(instruction,/human instruction, agent\/API action and recorded GitHub review/);
 assert.equal(req.messages.length,2);
});
test('new display is a safe HTML-free projection with linked source limits',()=>{
 const view=readFileSync(new URL('../challenge-connected-report-view.mjs',import.meta.url),'utf8');
 assert.match(view,/Referenced sources and limits/);
 assert.match(view,/Source limit:/);
 assert.match(view,/THREE RESPONSIBILITIES · ONE UNDERLYING ASSESSMENT/);
 assert.match(view,/SCENARIO-SPECIFIC OPERATIONS/);
 assert.doesNotMatch(view,/innerHTML|\bfetch\s*\(|eval\(/);
 for(const word of ['Jon','Chase','Andrew','Braze','Fast Track'])
  assert.doesNotMatch(view,new RegExp('\\b'+word+'\\b','i'));
});
