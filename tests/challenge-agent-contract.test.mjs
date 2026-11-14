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
 assessments:[{risk:'Bot can approve beyond delegated scope',expectedControl:'Approval actions restricted to authorized scope',demonstration:['Effective GitHub permissions','Denied approval test'],citationIds:['SSDF:PS.1'],scenarioExcerpt:'agents approve a pull request'}]
};
test('positive structured model response resolves canonical citations and separates facts',()=>{
 const r=validateAgentResponse(good,{scenarioText:scenario});
 assert.equal(r.ok,true,JSON.stringify(r.errors));
 assert.equal(r.data.scenarioText,scenario);
 assert.equal(r.data.citations.length,2);
 assert.equal(r.data.assessments[0].evidenceStatus,'not-demonstrated');
 assert.equal(r.data.assessments[0].assessmentStatus,'not-assessed');
 assert.equal(r.data.assessments[0].expectedControlOrigin,'assessment-derived-recommendation');
 assert.equal(r.data.assessments[0].scenarioClaimStatus,'verbatim-scenario-claim-unverified');
 assert.match(r.data.assessments[0].frameworkBasisStatus,/applicability-unverified/);
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

test('invented design commitment is rejected even if framework citation exists',()=>{
 const r=validateAgentResponse({...good,assessments:[{risk:'R',expectedControl:'C',citationIds:['SSDF:PS.1'],scenarioExcerpt:'Engineering has fully deployed the safeguard'}]},{scenarioText:scenario});
 assert.equal(r.ok,false);
 assert.ok(r.errors.some(e=>e.includes('not present verbatim')));
});
test('absence of design commitment never implies management evidence',()=>{
 const r=validateAgentResponse({...good,assessments:[{risk:'R',expectedControl:'C',citationIds:['SSDF:PS.1']}]},{scenarioText:scenario});
 assert.equal(r.ok,true);
 assert.equal(r.data.assessments[0].scenarioClaimStatus,'no-management-design-commitment-established');
});
