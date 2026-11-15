import test from 'node:test';
import assert from 'node:assert/strict';
import handler,{validateRequest,buildModelRequest,selectFrameworkProvisions} from '../api/challenge.js';
import {validateAgentResponse,AGENT_CONTRACT_VERSION} from '../challenge-agent-contract.js';

const scenario='A script updates one of 20 servers, logs a failure and continues to the next server.';
const mockRes=()=>({statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(v){this.statusCode=v;return this},json(v){this.body=v;return this}});
test('focused lab does not accept reassessment turns or signed history',()=>{
 assert.match(validateRequest({scenarioText:scenario,assessment:true,turns:[{role:'user',content:'Yes'}]}).error,/One assessment per proposal/);
 assert.match(validateRequest({scenarioText:scenario,assessment:true,continuityReceipts:['mock']}).error,/One assessment per proposal/);
 assert.equal(validateRequest({scenarioText:scenario,assessment:true,turns:[]}).assessmentPhase,'initial');
});
test('simple operations scenario receives only relevant framework cards and a smaller prompt',()=>{
 const selected=selectFrameworkProvisions(scenario,[]);
 assert.ok(selected.length<=6);
 assert.ok(selected.some(x=>x.id==='NIST-800-53:CM-3'));
 assert.ok(!selected.some(x=>x.id.startsWith('AI-RMF:')));
 const req=buildModelRequest({scenarioText:scenario,turns:[],history:[],assessmentPhase:'initial'});
 assert.ok(req.messages[0].content.length<12000,'System prompt should be proportional: '+req.messages[0].content.length);
 assert.ok(!req.messages[0].content.includes('PCAOB:AS2201.21'));
 assert.match(req.messages[0].content,/Do not produce decisionPerspectives or reassessment/);
 assert.match(req.messages[0].content,/implications:/);
});
test('decision-condition implications are aligned and remain model-authored',()=>{
 const base={
  contractVersion:AGENT_CONTRACT_VERSION,
  facts:[{statement:'A script updates 20 servers',support:'explicit-user-statement'}],
  challenges:[{question:'Can mixed configurations cause faults?',reason:'A failed update creates inconsistent configuration.'}],
  conclusions:[{scenarioBasis:'Script continues after failure.',application:'Proceed if partial completion is tolerable.',openQuestion:'Can servers run mixed versions?',basisType:'engineering-judgment',citationIds:[]}],
  approvalOutcomes:[],citationIds:[],referenceIds:[],counterargument:'A coordinated rollout might be safer.',
  expectedSafeguards:[{objective:'Verify actual configuration',why:'Catch drift',implementation:'not-assessed',referenceIds:[]}],
  clarifications:[{question:'Can servers run mixed configurations?',why:'Changes rollout requirements',
   options:['Yes','No'],implications:['A partial rollout can be recovered asynchronously.','Require coordinated recovery or atomic rollout.']}]
 };
 const opts={scenarioText:scenario,requireGrounding:true,assessmentPhase:'initial',allowedReferenceIds:[]};
 const a=validateAgentResponse(base,opts);
 assert.equal(a.ok,true,JSON.stringify(a.errors));
 assert.deepEqual(a.data.clarifications[0].implications,base.clarifications[0].implications);
 assert.equal(validateAgentResponse({...base,clarifications:[{...base.clarifications[0],implications:['Only one']}]},opts).ok,false);
});
test('focused assessment does not perform the legacy second-call contract repair',async t=>{
 const token=process.env.CHALLENGE_API_TOKEN,key=process.env.GEMINI_API_KEY;
 process.env.CHALLENGE_API_TOKEN='only-local';process.env.GEMINI_API_KEY='only-local';
 t.after(()=>{
  if(token===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=token;
  if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;
 });
 let calls=0;
 t.mock.method(console,'warn',()=>{});t.mock.method(console,'info',()=>{});
 t.mock.method(globalThis,'fetch',async()=>{
  calls++;
  return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({
   contractVersion:AGENT_CONTRACT_VERSION,approvalOutcomes:[],
   facts:[{statement:'Script proposed',support:'explicit-user-statement'}],
   challenges:[{question:'What if an update fails?',reason:'Mixed configuration'}],
   conclusions:[{scenarioBasis:'A proposed script',application:'Proceed conditionally',openQuestion:'Can we tolerate drift?',basisType:'engineering-judgment',citationIds:[]}],
   citationIds:[],referenceIds:[],expectedSafeguards:[],clarifications:[]
  })}}]})};
 });
 const res=mockRes();
 await handler({method:'POST',headers:{authorization:'Bearer only-local'},body:{scenarioText:scenario,assessment:true}},res);
 assert.equal(res.statusCode,502);
 assert.equal(calls,1,'No repair or reassessment request should follow the failed initial model response');
});
