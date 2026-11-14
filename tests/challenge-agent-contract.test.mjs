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


test('engineered reasoning can be valid without any framework citation',()=>{
 const response={
  contractVersion:AGENT_CONTRACT_VERSION,
  facts:[{statement:'The engineer chooses to delegate execution.',support:'explicit-user-statement'}],
  approvalOutcomes:[],
  challenges:[{question:'Does the CLI preserve exact revision authorization?'}],
  citationIds:[],
  conclusions:[{scenarioBasis:'The user described an explicit delegation.',application:'A CLI action may be a reasonable interface when revision checks are equivalent.',openQuestion:'Which revision did the engineer review?',basisType:'engineering-judgment',citationIds:[]}]
 };
 const result=validateAgentResponse(response,{scenarioText:scenario,requireGrounding:true});
 assert.equal(result.ok,true,JSON.stringify(result.errors));
 assert.equal(result.data.citations.length,0);
 assert.equal(result.data.conclusions[0].basisType,'engineering-judgment');
 assert.deepEqual(result.data.conclusions[0].citations,[]);
});
test('framework-based interpretations require a real canonical provision',()=>{
 const base={
  contractVersion:AGENT_CONTRACT_VERSION,
  facts:[{statement:'Approval policy has not been established.',support:'unknown'}],
  approvalOutcomes:[],
  challenges:[{question:'What can the repository enforce?'}],
  conclusions:[{scenarioBasis:'The repository has unspecified policies.',application:'Documented approval can be useful.',openQuestion:'What rules are configured?',basisType:'framework-interpretation',citationIds:[]}],
  citationIds:[]
 };
 const noSupport=validateAgentResponse(base,{scenarioText:scenario,requireGrounding:true});
 assert.equal(noSupport.ok,false);
 assert.ok(noSupport.errors.some(e=>e.includes('Expected 1–3 conclusions')));
 const invented=validateAgentResponse({...base,citationIds:['INVENTED:CLAUDE-REQUIRES-UI']},{scenarioText:scenario,requireGrounding:true});
 assert.equal(invented.ok,false);
 assert.ok(invented.errors.some(e=>e.includes('Unsupported catalog citation')));
 const valid=validateAgentResponse({...base,citationIds:['NIST-800-53:CM-3(1)'],conclusions:[{...base.conclusions[0],citationIds:['NIST-800-53:CM-3(1)']}]},{scenarioText:scenario,requireGrounding:true});
 assert.equal(valid.ok,true,JSON.stringify(valid.errors));
 const invalidBasis=validateAgentResponse({...base,conclusions:[{...base.conclusions[0],basisType:'verified-technical-fact',citationIds:[]}]},{scenarioText:scenario,requireGrounding:true});
 assert.equal(invalidBasis.ok,false);
});
