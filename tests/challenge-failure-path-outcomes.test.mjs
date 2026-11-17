import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AGENT_CONTRACT_VERSION,validateAgentResponse} from '../challenge-agent-contract.js';
import {projectConnectedReport} from '../challenge-connected-report-data.mjs';

const sample={
  contractVersion:AGENT_CONTRACT_VERSION,
  facts:[{statement:'Engineers authorize the change.',support:'explicit-user-statement'}],
  challenges:[{question:'What happens after a new commit?',reason:'Approval may become stale.'}],
  citationIds:[],
  conclusions:[{
    scenarioBasis:'Engineer-approved PR changes before the agent acts.',
    application:'Treat approval as revision-specific.',
    openQuestion:'Is the latest commit independently checked?',
    basisType:'engineering-judgment',citationIds:[]
  }]
};
const path={
  pathway:'delivery',
  failure:'An agent approves an unintended revision.',
  uncertainty:'Actual repository settings are unknown.',
  steps:[
    {stageId:'pr',roles:['origin'],
      event:'A new commit is pushed after human authorization.',
      interruption:'',evidence:'PR commit timeline.',
      goodOutcome:'A changed revision requires fresh authorization.',
      failureOutcome:'Prior authorization remains usable after the commit.'},
    {stageId:'authorization',roles:['exposure','prevention'],
      event:'The agent attempts a review for the changed revision.',
      interruption:'Reject approvals for a SHA not authorized by the engineer.',
      evidence:'Authorization record and rejected API result.',
      goodOutcome:'A mismatched SHA cannot pass the authorization gate.',
      failureOutcome:'The approval is accepted despite the mismatch.'}
  ]
};
function validate(value){
  const result=validateAgentResponse({...sample,riskPath:value},
    {scenarioText:'An engineer delegates GitHub approval submission.',requireGrounding:true});
  assert.equal(result.ok,true,JSON.stringify(result.errors));
  return result.data;
}
test('conditional good and failure outcomes survive validation and projection',()=>{
  const data=validate(path);
  assert.equal(data.riskPath.steps[1].goodOutcome,path.steps[1].goodOutcome);
  const projected=projectConnectedReport(data,'An engineer delegates GitHub approval submission.');
  assert.equal(projected.riskPath.steps[1].failureOutcome,path.steps[1].failureOutcome);
});
test('old responses without stage outcomes remain compatible',()=>{
  const legacy=structuredClone(path);
  for(const step of legacy.steps){delete step.goodOutcome;delete step.failureOutcome;}
  const data=validate(legacy);
  const projected=projectConnectedReport(data);
  assert.ok(projected.riskPath);
  assert.equal(projected.riskPath.steps[0].goodOutcome,'');
  assert.equal(projected.riskPath.steps[0].failureOutcome,'');
});
test('invalid non-text outcomes are never used as stage observations',()=>{
  const unsafe=structuredClone(path);
  unsafe.steps[0].goodOutcome={status:'verified'};
  const data=validate(unsafe);
  assert.equal(data.riskPath,null);
});
test('UI uses distinct expected/failure outcomes and hides untouched assessment panes',()=>{
  const source=fs.readFileSync(new URL('../challenge-connected-report-view.mjs',import.meta.url),'utf8');
  assert.match(source,/What good looks like/);
  assert.match(source,/What failure looks like/);
  assert.match(source,/What should prevent or detect it/);
  assert.match(source,/How we would know/);
  assert.match(source,/panel.hidden=!active/);
  assert.match(source,/Green and red describe hypothetical outcomes/);
  assert.doesNotMatch(source,/detail\.innerHTML/);
});
