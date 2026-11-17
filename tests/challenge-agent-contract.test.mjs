import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAgentResponse,createInterpretationRequest,AGENT_CONTRACT_VERSION} from '../challenge-agent-contract.js';
const scenario='A human approves the review plan and agents approve a pull request.';
const good={
 contractVersion:AGENT_CONTRACT_VERSION,
 facts:[{statement:'Human approves review plan',support:'explicit-user-statement'},{statement:'Delegation has not been established',support:'unknown'}],
 challenges:[{question:'Who authorizes the final code revision?',reason:'Plan execution and change authorization are different decisions.',tests:['Try out-of-scope code'],alternatives:['Human review','Bounded policy delegation']}],
 citationIds:['SSDF:PS.1','OWASP-2026:LLM03'],
 unknowns:['Protected branch rules unknown'],
 assessments:[{risk:'Bot can approve beyond delegated scope',expectedControl:'Approval actions restricted to authorized scope',demonstration:['Effective GitHub permissions','Denied approval test'],citationIds:['SSDF:PS.1']}]
};
test('positive structured model response resolves canonical citations and separates facts',()=>{
 const r=validateAgentResponse(good,{scenarioText:scenario});
 assert.equal(r.ok,true,JSON.stringify(r.errors));
 assert.equal(r.data.scenarioText,scenario);
 assert.equal(r.data.citations.length,2);
 assert.equal(r.data.assessments[0].evidenceStatus,'not-demonstrated');
 assert.equal(r.data.assessments[0].assessmentStatus,'not-assessed');
 assert.equal(r.data.provenance.decisionStatus,'no-approval-or-certification');
 assert.ok(r.data.citations.every(c=>c.url.startsWith('https://') && c.sourceVersion));
});
test('unrecognized citation fails closed, not fabricated',()=>{
 const r=validateAgentResponse({...good,citationIds:['SSDF:PS.1','FAKE:SUPER-APPROVAL']},{scenarioText:scenario});
 assert.equal(r.ok,false);assert.equal(r.data,null);
 assert.ok(r.errors.some(s=>s.includes('Unsupported catalog citation')));
});
test('empty or malformed interpretation is rejected',()=>{
 assert.equal(validateAgentResponse({},{}).ok,false);
 assert.equal(validateAgentResponse({...good,challenges:[]},{scenarioText:scenario}).ok,false);
 assert.equal(validateAgentResponse(null,{scenarioText:scenario}).ok,false);
});
test('model cannot provide its own trusted scenario digest',()=>{
 assert.equal(validateAgentResponse({...good,scenarioDigest:'trusted'},{scenarioText:scenario}).ok,false);
});
test('invalid fact support must not be elevated',()=>{
 const r=validateAgentResponse({...good,facts:[{statement:'Control is effective',support:'verified'}]},{scenarioText:scenario});
 assert.equal(r.ok,false);
});
test('model-inferred result never claims to be a verified control conclusion',()=>{
 const r=validateAgentResponse(good,{scenarioText:scenario});
 assert.equal(r.data.provenance.kind,'unverified-model-interpretation');
 assert.equal(r.data.provenance.frameworkRelationships,'proposed-unvalidated');
});
test('request is bounded and does not embed provider credentials',()=>{
 const r=createInterpretationRequest('x'.repeat(7000));
 assert.equal(r.ok,true);assert.equal(r.scenarioText.length,4000);
 assert.deepEqual(Object.keys(r).sort(),['contractVersion','ok','requestedCapabilities','scenarioText'].sort());
});

test('assessment citation must be present in validated source references',()=>{
 const r=validateAgentResponse({...good,assessments:[{risk:'R',expectedControl:'C',citationIds:['OWASP-2026:LLM03','FAKE:CLAIM']}]},{scenarioText:scenario});
 assert.equal(r.ok,false);
 assert.ok(r.errors.some(s=>s.includes('Unsupported assessment citation')));
});
test('assessment can only refer to citations included in response',()=>{
 const r=validateAgentResponse({...good,assessments:[{risk:'R',expectedControl:'C',citationIds:['SSDF:PW.1']}]},{scenarioText:scenario});
 assert.equal(r.ok,false);
});

test('leading engineering recommendation is bounded and remains unverified',()=>{
 const recommendation={
   judgment:'Proceed only with deterministic low-risk eligibility',
   why:'Engineering may reduce review delays, but scores alone do not constrain authority.',
   failureCondition:'If code alters protected dependencies, the automation could approve outside its mandate.',
   alternative:'Retain human approval with automated analysis for changes outside explicit policy.',
   decisionChanger:'Can protected-branch rules bind eligibility to the exact revision?'
 };
 const r=validateAgentResponse({...good,recommendation},{scenarioText:scenario});
 assert.equal(r.ok,true,JSON.stringify(r.errors));
 assert.deepEqual(r.data.recommendation,recommendation);
 assert.equal(r.data.provenance.decisionStatus,'no-approval-or-certification');
 assert.equal(validateAgentResponse(good,{scenarioText:scenario}).data.recommendation,null);
});
test('incomplete recommendation cannot silently become a definitive judgment',()=>{
 const r=validateAgentResponse({...good,recommendation:{judgment:'Approved!'}},{scenarioText:scenario});
 assert.equal(r.ok,false);
 assert.ok(r.errors.some(e=>e.includes('Malformed leading recommendation')));
});

test('linked risk and safeguard model creates stable server-controlled IDs without claims of effectiveness',()=>{
 const riskModel={
   risks:[
     {title:'Security sensitive code is misclassified',category:'Application security',trigger:'Dependency change bypasses the exclusion inventory',impact:'An unsafe change could reach production'},
     {title:'Approval authority escapes delegation',category:'Agent identity',trigger:'Agent uses an alternate GitHub credential',impact:'The system can approve without a valid decision'}
   ],
   safeguards:[
     {name:'Protected eligibility gate',why:'Rejects excluded changes independent of model agreement',authority:'Engineering owns the approved scope',enforcement:'Protected required check blocks merges',evidence:'Policy version, SHA and check result',negativeTest:'Attempt excluded PR merge',proof:'Effective rules and denied merge event',gap:'Can alternate identities bypass the required check?',riskIndexes:[1]},
     {name:'Least-privilege approval authority',why:'Limits agent access to delegated paths',authority:'Engineer or policy makes decision',enforcement:'Scoped GitHub app and protected approval command',evidence:'Principal and approved SHA event',negativeTest:'Try privileged API route',proof:'Permission configuration and denial',gap:'Are all CLI and MCP paths covered?',riskIndexes:[1,2]}
   ]
 };
 const result=validateAgentResponse({...good,...riskModel},{scenarioText:scenario});
 assert.equal(result.ok,true,JSON.stringify(result.errors));
 assert.deepEqual(result.data.risks.map(r=>r.id),['R-01','R-02']);
 assert.deepEqual(result.data.safeguards.map(c=>c.id),['C-01','C-02']);
 assert.deepEqual(result.data.safeguards[1].riskIds,['R-01','R-02']);
 assert.equal(result.data.safeguards[0].enforcement,'Protected required check blocks merges');
 assert.equal(result.data.provenance.decisionStatus,'no-approval-or-certification');
});
test('mapped safeguards reject nonexistent, duplicate, and forged risk relationships',()=>{
 const risk={title:'Unsafe change',category:'Security',trigger:'Untracked file',impact:'Vulnerability'};
 const guard={name:'Scope check',why:'Blocks excluded scope',authority:'Engineering',enforcement:'Protected required check',evidence:'Workflow records',negativeTest:'Try excluded merge',proof:'Denied merge record',gap:'Unknown bypass routes',riskIndexes:[1]};
 for(const invalid of [[0],[2],[1,1],['R-01']]){
   const r=validateAgentResponse({...good,risks:[risk],safeguards:[{...guard,riskIndexes:invalid}]},{scenarioText:scenario});
   assert.equal(r.ok,false,JSON.stringify({invalid,errors:r.errors}));
   assert.ok(r.errors.some(e=>e.includes('Malformed safeguard model')));
 }
 const partial=validateAgentResponse({...good,risks:[risk]},{scenarioText:scenario});
 assert.equal(partial.ok,false);
 assert.ok(partial.errors.some(e=>e.includes('together')));
});
