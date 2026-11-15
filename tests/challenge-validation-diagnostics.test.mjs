import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAgentResponse,AGENT_CONTRACT_VERSION} from '../challenge-agent-contract.js';
import {contractFailureCodes,contractRepairHints,buildContractRepairRequest,buildModelRequest} from '../api/challenge.js';

const scenarioText='A fictional worker performs an automated cloud configuration change.';
const base={
  contractVersion:AGENT_CONTRACT_VERSION,
  facts:[{statement:'A worker is proposed.',support:'explicit-user-statement'}],
  challenges:[{question:'Could a change be unsafe?',reason:'A proposed action might have an unintended effect.',tests:[],alternatives:[]}],
  conclusions:[{scenarioBasis:'A worker can modify resources.',application:'Trial bounded automation.',openQuestion:'Which operations can it perform?',basisType:'engineering-judgment',citationIds:[]}],
  approvalOutcomes:[],citationIds:[],referenceIds:[],
  alternatives:[],unknowns:[],
  counterargument:'The current manual workflow may be simpler.',
  expectedSafeguards:[{objective:'Limit actions',why:'Reduce impact.',implementation:'not-assessed',referenceIds:[]}],
  clarifications:[]
};
const validate=(value,phase='initial')=>validateAgentResponse(value,{
  scenarioText,assessmentPhase:phase,requireGrounding:true,allowedReferenceIds:[]
});
test('focused failures have stable, specific categories instead of OTHER',()=>{
  const bads=[
    [{...base,expectedSafeguards:[{...base.expectedSafeguards[0],implementation:'effective'}]},'SAFEGUARDS'],
    [{...base,expectedSafeguards:[{...base.expectedSafeguards[0],implementation:'reported-full'}]},'SAFEGUARDS'],
    [{...base,clarifications:[{question:'Q?',why:'Why?',options:['yes']}]},'CLARIFICATIONS'],
    [{...base,counterargument:''},'COUNTERARGUMENT'],
    [{...base,expectedSafeguards:[]},'SAFEGUARDS'],
    [{...base,clarifications:undefined},'CLARIFICATIONS'],
    [{...base,challenges:new Array(5).fill(base.challenges[0])},'CHALLENGE_LIMIT'],
    [{...base,reassessment:undefined},'REASSESSMENT','reassess']
  ];
  for(const [sample,expected,phase] of bads){
    const result=validate(sample,phase||'initial');
    assert.equal(result.ok,false,'Malformed fields must not pass.');
    const codes=contractFailureCodes(result.errors);
    assert.ok(codes.includes(expected),JSON.stringify({expected,codes,errors:result.errors}));
    assert.ok(!codes.includes('OTHER'),JSON.stringify(codes));
  }
});
test('repair instructions target exact schema failure without inventing provenance',()=>{
  const bad=validate({...base,expectedSafeguards:[{...base.expectedSafeguards[0],implementation:'effective'}]});
  const hints=contractRepairHints(bad.errors);
  assert.match(hints,/implementation exactly not-assessed/);
  assert.match(hints,/referenceIds/);
  assert.match(hints,/do not invent implementation/);
  const req=buildModelRequest({scenarioText,turns:[],history:[],assessmentPhase:'initial'});
  const repair=buildContractRepairRequest(req,{...base,expectedSafeguards:[]},bad.errors);
  assert.match(repair.messages[1].content,/SAFEGUARDS/);
  assert.match(repair.messages[1].content,/implementation exactly not-assessed/);
  assert.deepEqual(repair.messages.map(x=>x.role),['system','user']);
  assert.ok(repair.messages[1].content.length<req.messages[1].content.length+9000);
});
test('legitimate focused response still passes without manufactured citations',()=>{
  const result=validate(base);
  assert.equal(result.ok,true,JSON.stringify(result.errors));
  assert.deepEqual(result.data.expectedSafeguards[0].referenceIds,[]);
  assert.equal(result.data.expectedSafeguards[0].implementation,'not-assessed');
});
test('diagnostic codes do not echo untrusted model text',()=>{
  const arbitrary='my-secret-caller-prose';
  const codes=contractFailureCodes(['Unsupported catalog citation: '+arbitrary,
    'Invalid focused assessment fields: clarifications have malformed question, reason or choices']);
  assert.deepEqual(codes,['UNRECOGNIZED_CITATION','CLARIFICATIONS']);
  assert.deepEqual(contractFailureCodes(['Response must be an object']),['RESPONSE_SHAPE']);
  assert.match(contractRepairHints(['Response must be an object']),/top-level JSON object/);
  assert.ok(!codes.join(',').includes(arbitrary));
});
