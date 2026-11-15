import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAgentResponse,AGENT_CONTRACT_VERSION} from '../challenge-agent-contract.js';
import {buildModelRequest} from '../api/challenge.js';
const base={
 contractVersion:AGENT_CONTRACT_VERSION,
 facts:[{statement:'The fictional agent proposes a change.',support:'explicit-user-statement'}],
 challenges:[{question:'What could go wrong?',reason:'Unbounded actions could have unintended impact.'}],
 approvalOutcomes:[],
 conclusions:[{scenarioBasis:'The proposal grants automated action authority.',application:'Use bounded autonomy with independently enforced limits.',openQuestion:'What actual permissions exist?',basisType:'engineering-judgment',citationIds:[]}],
 citationIds:[],
 referenceIds:[],
 alternatives:['Keep current workflow']
};
const good={
 ...base,
 expectedSafeguards:[
  {objective:'Bound authority of automated operations',why:'Prevent actions beyond the intended scope.',implementation:'not-assessed',referenceIds:['GOOGLE-SAIF']},
  {objective:'Provide recovery from unintended action',why:'Bound production impact.',implementation:'reported-partial',referenceIds:[]}
 ],
 clarifications:[{
  question:'Can the agent independently modify production resources?',
  why:'Actual production authority changes the appropriate protections.',
  options:['No, human authorization each time','Only preauthorized resources','Yes, without fresh approval']
 }]
};
const options={scenarioText:'A fictional agent manages cloud resources.',requireGrounding:true,allowedReferenceIds:['GOOGLE-SAIF']};
test('focused scenario assessment preserves bounded source IDs and multiple choice',()=>{
 const check=validateAgentResponse(good,options);
 assert.equal(check.ok,true,JSON.stringify(check.errors));
 assert.equal(check.data.expectedSafeguards.length,2);
 assert.equal(check.data.expectedSafeguards[0].referenceIds[0],'GOOGLE-SAIF');
 assert.deepEqual(check.data.clarifications[0].options,good.clarifications[0].options);
 assert.equal(check.data.expectedSafeguards[0].implementation,'not-assessed');
 assert.equal(check.data.provenance.kind,'unverified-model-interpretation');
});
test('unprovided technical source ID cannot be cited by an expected safeguard',()=>{
 const altered={...good,expectedSafeguards:[{...good.expectedSafeguards[0],referenceIds:['CLAUDE-PERMISSIONS']}]};
 const result=validateAgentResponse(altered,options);
 assert.equal(result.ok,false);
 assert.ok(result.errors.some(x=>x.includes('Invalid focused assessment fields')));
});
test('malformed or excessive questions fail closed rather than yielding misleading buttons',()=>{
 for(const bad of [
   {...good,clarifications:[{question:'What?',why:'Why?',options:['Yes','yes']}]},
   {...good,clarifications:[{question:'What?',why:'Why?',options:['Yes']}]},
   {...good,clarifications:new Array(4).fill(good.clarifications[0])}
 ]){
  assert.equal(validateAgentResponse(bad,options).ok,false);
 }
});
test('status values are explicitly limited to reported states or not assessed',()=>{
 for(const invalid of ['verified-full','effective','implemented','high-risk']){
  const result=validateAgentResponse({...good,expectedSafeguards:[
   {...good.expectedSafeguards[0],implementation:invalid}]},options);
  assert.equal(result.ok,false);
 }
});
test('zero clarification questions is valid when no material unknown remains',()=>{
 const result=validateAgentResponse({...good,clarifications:[]},options);
 assert.equal(result.ok,true,JSON.stringify(result.errors));
 assert.equal(result.data.clarifications.length,0);
});
test('legacy response remains valid for existing user flows',()=>{
 const result=validateAgentResponse(base,options);
 assert.equal(result.ok,true,JSON.stringify(result.errors));
 assert.deepEqual(result.data.expectedSafeguards,[]);
 assert.deepEqual(result.data.clarifications,[]);
});
test('Gemini request requests generalizable safeguards and buttons, not risk scores',()=>{
 const req=buildModelRequest({scenarioText:'A fictional agent rotates cloud credentials.',turns:[],history:[]});
 const system=req.messages[0].content;
 for(const phrase of ['For unfamiliar scenarios','expectedSafeguards:','clarifications: zero to three','No risk scores']){
  assert.ok(system.includes(phrase),phrase);
 }
 assert.ok(!system.includes('Braze'));
});