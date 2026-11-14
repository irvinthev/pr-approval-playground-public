import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import handler,{validateRequest,buildModelRequest} from '../api/challenge.js';
const require=createRequire(import.meta.url);
const {issueReceipt,decodeReceipt,verifiedHistory,MAX_RECEIPTS}=require('../lab/challenge-turn-receipts.cjs');
const scenario='A fictional engineer asks an agent to execute explicit approval on a code change.';
const response={
  contractVersion:'0.1.0',
  approvalOutcomes:[],
  facts:[{statement:'A fictional engineer delegated execution.',support:'explicit-user-statement'}],
  conclusions:[{scenarioBasis:'Explicit delegation is claimed.',application:'A manual click is not inherently safer than a properly bound delegated approval.',openQuestion:'What revision was reviewed?',citationIds:['NIST-800-53:CM-3(1)']}],
  challenges:[{question:'What enforcement preserves revision identity?'}],
  citationIds:['NIST-800-53:CM-3(1)'],
  alternatives:['Direct manual UI approval: familiar but click does not prove judgment.','Explicit delegated CLI approval: fewer clicks but requires binding.']
};
const mockRes=()=>({
 statusCode:200,headers:{},
 setHeader(k,v){this.headers[k]=v;return this},
 status(n){this.statusCode=n;return this},
 json(body){this.body=body;return this}
});
test('receipts authenticate prior model answers, enforce scenario and expiry and reject tampering',t=>{
 const old=process.env.CHALLENGE_API_TOKEN;
 process.env.CHALLENGE_API_TOKEN='local-continuity-secret';
 t.after(()=>{if(old===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=old});
 const now=Math.floor(Date.now()/1000);
 const receipt=issueReceipt(response,scenario,now);
 assert.equal(decodeReceipt(receipt,scenario,now).answer,response.conclusions[0].application);
 assert.equal(decodeReceipt(receipt,scenario+' changed',now),null);
 assert.equal(decodeReceipt(receipt,scenario,now+8*60*60+1),null);
 assert.equal(decodeReceipt(receipt.slice(0,-1)+'0',scenario,now),null);
 assert.equal(verifiedHistory([receipt],scenario).length,1);
 assert.equal(verifiedHistory(Array(MAX_RECEIPTS+1).fill(receipt),scenario),null);
});
test('request rejects fabricated prior responses and no-question replays',t=>{
 const old=process.env.CHALLENGE_API_TOKEN;
 process.env.CHALLENGE_API_TOKEN='local-continuity-secret';
 t.after(()=>{if(old===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=old});
 const valid=issueReceipt(response,scenario);
 const follow={scenarioText:scenario,turns:[{role:'user',content:'Why is the manual click better?'}],continuityReceipts:[valid]};
 const accepted=validateRequest(follow);
 assert.equal(accepted.error,undefined);
 assert.equal(accepted.history[0].answer,response.conclusions[0].application);
 const model=buildModelRequest(accepted);
 assert.deepEqual(model.messages.map(m=>m.role),['system','user']);
 assert.match(model.messages[0].content,/signed snapshots from this application, not facts/);
 assert.match(model.messages[1].content,/Previously validated model responses/);
 assert.match(model.messages[1].content,/manual click is not inherently safer/);
 assert.match(model.messages[1].content,/Why is the manual click better/);
 assert.match(validateRequest({...follow,continuityReceipts:['fake']}).error,/invalid or expired/);
 assert.match(validateRequest({...follow,turns:[]}).error,/follow-up question/);
});
test('API issues a signed receipt after validating live output, and follow-up reuses it',async t=>{
 const oldToken=process.env.CHALLENGE_API_TOKEN,oldKey=process.env.GEMINI_API_KEY;
 process.env.CHALLENGE_API_TOKEN='local-continuity-secret';
 process.env.GEMINI_API_KEY='local-only-provider-key';
 t.after(()=>{
  if(oldToken===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=oldToken;
  if(oldKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=oldKey;
 });
 let seen=0;
 t.mock.method(globalThis,'fetch',async (_url,init)=>{
  const req=JSON.parse(init.body);
  if(++seen===2)assert.match(req.messages[1].content,/manual click is not inherently safer/);
  return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(response)}}]})};
 });
 const first=mockRes();
 await handler({method:'POST',headers:{authorization:'Bearer local-continuity-secret'},body:{scenarioText:scenario}},first);
 assert.equal(first.statusCode,200);
 assert.ok(first.body.continuityReceipt);
 const second=mockRes();
 await handler({method:'POST',headers:{authorization:'Bearer local-continuity-secret'},body:{
  scenarioText:scenario,
  turns:[{role:'user',content:'Challenge the initial manual click assumption'}],
  continuityReceipts:[first.body.continuityReceipt]
 }},second);
 assert.equal(second.statusCode,200);
 assert.equal(seen,2);
 assert.ok(second.body.continuityReceipt);
});
