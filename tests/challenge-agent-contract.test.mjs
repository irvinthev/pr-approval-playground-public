import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAgentResponse,createInterpretationRequest,AGENT_CONTRACT_VERSION} from '../challenge-agent-contract.js';
const scenario='A human approves the review plan and agents approve a pull request.';
const good={
 contractVersion:AGENT_CONTRACT_VERSION,
 facts:[{statement:'Human approves review plan',support:'explicit-user-statement'},{statement:'Delegation has not been established',support:'unknown'}],
 challenges:[{question:'Who authorizes the final code revision?',reason:'Plan execution and change authorization are different decisions.',tests:['Try out-of-scope code'],alternatives:['Human review','Bounded policy delegation']}],
 citationIds:['SSDF:PS.1','OWASP-2026:LLM03'],
 unknowns:['Protected branch rules unknown']
};
test('positive structured model response resolves canonical citations and separates facts',()=>{
 const r=validateAgentResponse(good,{scenarioText:scenario});
 assert.equal(r.ok,true,JSON.stringify(r.errors));
 assert.equal(r.data.scenarioText,scenario);
 assert.equal(r.data.citations.length,2);
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
