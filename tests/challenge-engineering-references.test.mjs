import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import handler,{buildModelRequest,validateRequest,buildContractRepairRequest,contractFailureCodes,invalidSourceIds} from '../api/challenge.js';
const require=createRequire(import.meta.url);
const {references,selectEngineeringReferences,referencePrompt}=require('../lab/engineering-references.cjs');
const scenario='Can CODEOWNERS automatically approve a pull request using a GitHub App?';
const response={
 contractVersion:'0.1.0',
 facts:[{statement:'A team proposes CODEOWNERS-driven approval.',support:'explicit-user-statement'}],
 approvalOutcomes:[],
 challenges:[{question:'Which identity submits the GitHub review?'}],
 conclusions:[{scenarioBasis:'The team wants a low-risk automated path.',application:'CODEOWNERS routes review requests, but an actor must submit the review.',openQuestion:'What review rule is enabled?',basisType:'engineering-judgment',citationIds:[]}],
 citationIds:[], alternatives:['Human review','Authorized bot submission'], unknowns:['Actual ruleset'],
 referenceIds:['GH-CODEOWNERS']
};
const mockRes=()=>({
 statusCode:200,headers:{},
 setHeader(k,v){this.headers[k]=v;return this},
 status(n){this.statusCode=n;return this},
 json(body){this.body=body;return this}
});
test('19 unique public engineering source cards with publisher provenance and bounded facts',()=>{
 assert.equal(references.length,19);
 assert.equal(new Set(references.map(r=>r.id)).size,references.length);
 for(const r of references){
  assert.match(r.url,/^https:\/\//);
  assert.ok(r.publisher&&r.title&&r.kind&&r.limits&&r.reviewedAsOf);
  assert.ok(r.facts.length>0&&r.facts.every(x=>typeof x==='string'&&x.length<450));
 }
});
test('local matching selects relevant docs and does not treat URLs as executable data',()=>{
 const matches=selectEngineeringReferences(scenario,[],5);
 assert.ok(matches.some(r=>r.id==='GH-CODEOWNERS'));
 assert.ok(matches.some(r=>r.id==='GH-REVIEWS-API'));
 assert.ok(!matches.some(r=>r.id==='GOOGLE-SRE-CANARY'));
 assert.ok(matches.length<=5);
 const claude=selectEngineeringReferences('Claude Code permission modes and a PreToolUse hook for a CLI approval');
 assert.ok(claude.some(r=>r.id==='CLAUDE-PERMISSIONS'));
 assert.ok(claude.some(r=>r.id==='CLAUDE-HOOKS'));
 const noMatch=selectEngineeringReferences('A greeting about the weather');
 assert.equal(noMatch.length,0);
 assert.match(referencePrompt(matches),/CODEOWNERS does not submit approval/);
 assert.match(referencePrompt(matches),/Limit:/);
});
test('prompt provides only curated technical context, not claims of live web verification',()=>{
 const req=validateRequest({scenarioText:scenario});
 const model=buildModelRequest(req);
 assert.deepEqual(model.messages.map(x=>x.role),['system','user']);
 assert.match(model.messages[0].content,/\[REFERENCE GH-CODEOWNERS\]/);
 assert.match(model.messages[0].content,/not live data|not live retrieval|not live/i);
 assert.match(model.messages[0].content,/referenceIds array/);
 assert.ok(!model.tools);
});
test('the existing model endpoint receives curated context and returns provenance metadata',async t=>{
 const token=process.env.CHALLENGE_API_TOKEN,key=process.env.GEMINI_API_KEY;
 process.env.CHALLENGE_API_TOKEN='private-test-token';
 process.env.GEMINI_API_KEY='provider-test-key';
 t.after(()=>{
  if(token===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=token;
  if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;
 });
 let calls=0;
 t.mock.method(globalThis,'fetch',async (url,opts)=>{
  calls++;
  assert.match(String(url),/openai\/chat\/completions/);
  assert.match(opts.body,/GH-CODEOWNERS/);
  return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(response)}}]})};
 });
 const res=mockRes();
 await handler({method:'POST',headers:{authorization:'Bearer private-test-token'},body:{scenarioText:scenario}},res);
 assert.equal(res.statusCode,200,JSON.stringify(res.body));
 assert.equal(calls,1);
 assert.ok(res.body.continuityReceipt);
 const source=res.body.engineeringReferences.find(x=>x.id==='GH-CODEOWNERS');
 assert.equal(source.modelUsed,true);
 assert.ok(source.url.includes('docs.github.com'));
 assert.equal(res.body.research,undefined);
});
test('model may omit references but may not invent or cite unprovided source IDs',async t=>{
 const token=process.env.CHALLENGE_API_TOKEN,key=process.env.GEMINI_API_KEY;
 process.env.CHALLENGE_API_TOKEN='private-test-token';
 process.env.GEMINI_API_KEY='provider-test-key';
 t.after(()=>{
  if(token===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=token;
  if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;
 });
 let provided={...response,referenceIds:['GH-NONEXISTENT']};
 t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(provided)}}]})}));
 const req={method:'POST',headers:{authorization:'Bearer private-test-token'},body:{scenarioText:scenario}};
 const rejected=mockRes();
 await handler(req,rejected);
 assert.equal(rejected.statusCode,502);
 assert.match(rejected.body.error,/unprovided/);
 provided={...response,referenceIds:[]};
 const accepted=mockRes();
 await handler(req,accepted);
 assert.equal(accepted.statusCode,200);
 assert.ok(accepted.body.engineeringReferences.every(x=>x.modelUsed===false));
});

test('focused assessment recovers from duplicate or unprovided engineering references',async t=>{
 const token=process.env.CHALLENGE_API_TOKEN,key=process.env.GEMINI_API_KEY;
 process.env.CHALLENGE_API_TOKEN='private-test-token';
 process.env.GEMINI_API_KEY='provider-test-key';
 t.after(()=>{
  if(token===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=token;
  if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;
 });
 const focused={...response,counterargument:'A designated reviewer could handle this directly.',
  expectedSafeguards:[{objective:'Require a designated reviewer',why:'Route changes to the relevant reviewer.',
   implementation:'not-assessed',referenceIds:['GH-CODEOWNERS']}],clarifications:[]};
 const unprovided={...focused,referenceIds:['GH-NONEXISTENT']};
 const req={method:'POST',headers:{authorization:'Bearer private-test-token'},body:{scenarioText:scenario,assessment:true}};
 for(const {replies,status,calls} of [
  {replies:[{...focused,referenceIds:['GH-CODEOWNERS','GH-CODEOWNERS']}],status:200,calls:1},
  {replies:[unprovided,focused],status:200,calls:2},
  {replies:[unprovided,unprovided],status:502,calls:2}
 ]){
  let count=0;
  const mock=t.mock.method(globalThis,'fetch',async (_url,opts)=>{
   const reply=replies[count++];
   if(count===2)assert.match(JSON.parse(opts.body).messages[1].content,/ENGINEERING_REFERENCES/);
   return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(reply)}}]})};
  });
  const res=mockRes();
  await handler(req,res);
  mock.mock.restore();
  assert.equal(res.statusCode,status,JSON.stringify(res.body));
  assert.equal(count,calls);
  if(status===200){
   assert.equal(res.body.responseRepaired,calls===2);
   assert.deepEqual(res.body.engineeringReferences.filter(x=>x.modelUsed).map(x=>x.id),['GH-CODEOWNERS']);
  }else{
   assert.match(res.body.error,/correction attempt/);
   assert.equal(res.body.continuityReceipt,undefined);
  }
 }
});

test('one bounded schema retry restores missing conclusion fields while keeping source restrictions',async t=>{
 const token=process.env.CHALLENGE_API_TOKEN,key=process.env.GEMINI_API_KEY;
 process.env.CHALLENGE_API_TOKEN='private-test-token';
 process.env.GEMINI_API_KEY='provider-test-key';
 t.after(()=>{
  if(token===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=token;
  if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;
 });
 let calls=0;
 const invalid={...response,conclusions:[{...response.conclusions[0],basisType:undefined}]};
 t.mock.method(globalThis,'fetch',async (_url,opts)=>{
  calls++;
  const body=JSON.parse(opts.body);
  if(calls===2){
    assert.match(body.messages[1].content,/PREVIOUS MODEL OUTPUT TO REPAIR/);
    assert.match(body.messages[1].content,/CONCLUSIONS/);
    assert.match(body.messages[1].content,/approvalOutcomes:\[\]/);
  }
  return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(calls===1?invalid:response)}}]})};
 });
 const res=mockRes();
 await handler({method:'POST',headers:{authorization:'Bearer private-test-token'},body:{scenarioText:scenario}},res);
 assert.equal(res.statusCode,200,JSON.stringify(res.body));
 assert.equal(calls,2);
 assert.equal(res.body.responseRepaired,true);
 assert.equal(res.body.engineeringReferences.find(r=>r.id==='GH-CODEOWNERS').modelUsed,true);
});
test('even a repair response cannot introduce unprovided engineering source IDs',async t=>{
 const token=process.env.CHALLENGE_API_TOKEN,key=process.env.GEMINI_API_KEY;
 process.env.CHALLENGE_API_TOKEN='private-test-token';
 process.env.GEMINI_API_KEY='provider-test-key';
 t.after(()=>{
  if(token===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=token;
  if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;
 });
 let calls=0;
 const invalid={...response,conclusions:[{...response.conclusions[0],openQuestion:undefined}]};
 t.mock.method(globalThis,'fetch',async()=>{
  calls++;
  const reply=calls===1?invalid:{...response,referenceIds:['CLAUDE-SANDBOX']};
  return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(reply)}}]})};
 });
 const res=mockRes();
 await handler({method:'POST',headers:{authorization:'Bearer private-test-token'},body:{scenarioText:scenario}},res);
 assert.equal(res.statusCode,502);
 assert.match(res.body.error,/unprovided/);
 assert.equal(calls,2);
});
test('structural diagnostics do not expose model or scenario content',()=>{
 const diagnostics=contractFailureCodes([
  'Invalid approval outcomes',
  'Expected 1–3 conclusions with valid evidence basis',
  'Unsupported catalog citation: secret or fabricated text'
 ]);
 assert.deepEqual(diagnostics,['APPROVAL_OUTCOMES','CONCLUSIONS','UNRECOGNIZED_CITATION']);
 const original=buildModelRequest(validateRequest({scenarioText:scenario}));
 const repair=buildContractRepairRequest(original,{contractVersion:'0.1.0',conclusions:[]},['Invalid approval outcomes']);
 assert.match(repair.messages[1].content,/APPROVAL_OUTCOMES/);
 assert.deepEqual(repair.messages.map(x=>x.role),['system','user']);
 assert.ok(repair.messages[1].content.length<original.messages[1].content.length+9000);
});


test('misplaced selected technical source is repaired into referenceIds without claiming framework authority',async t=>{
 const token=process.env.CHALLENGE_API_TOKEN,key=process.env.GEMINI_API_KEY;
 process.env.CHALLENGE_API_TOKEN='private-test-token';
 process.env.GEMINI_API_KEY='provider-test-key';
 t.after(()=>{
  if(token===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=token;
  if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;
 });
 const misplaced={...response,
  citationIds:['GH-CODEOWNERS'],
  conclusions:[{...response.conclusions[0],citationIds:['GH-CODEOWNERS'],basisType:'framework-interpretation'}]
 };
 assert.deepEqual(invalidSourceIds(misplaced,[{id:'GH-CODEOWNERS'}]).misplaced,['GH-CODEOWNERS','GH-CODEOWNERS']);
 let calls=0;
 t.mock.method(globalThis,'fetch',async (_url,opts)=>{
  calls++;
  if(calls===2)assert.match(JSON.parse(opts.body).messages[1].content,/technical source IDs only into referenceIds/);
  return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(calls===1?misplaced:response)}}]})};
 });
 const res=mockRes();
 await handler({method:'POST',headers:{authorization:'Bearer private-test-token'},body:{scenarioText:scenario}},res);
 assert.equal(res.statusCode,200,JSON.stringify(res.body));
 assert.equal(res.body.responseRepaired,true);
 assert.equal(res.body.citations.length,0);
 assert.equal(calls,2);
});
test('invented framework or technical source IDs fail without retry',async t=>{
 const token=process.env.CHALLENGE_API_TOKEN,key=process.env.GEMINI_API_KEY;
 process.env.CHALLENGE_API_TOKEN='private-test-token';
 process.env.GEMINI_API_KEY='provider-test-key';
 t.after(()=>{
  if(token===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=token;
  if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;
 });
 const invented={...response,
  citationIds:['GH-IMAGINARY'],
  conclusions:[{...response.conclusions[0],citationIds:['GH-IMAGINARY']}]};
 assert.deepEqual(invalidSourceIds(invented,[{id:'GH-CODEOWNERS'}]).invented,['GH-IMAGINARY','GH-IMAGINARY']);
 let calls=0;
 t.mock.method(globalThis,'fetch',async()=>{
  calls++;
  return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(invented)}}]})};
 });
 t.mock.method(console,'warn',()=>{});
 const res=mockRes();
 await handler({method:'POST',headers:{authorization:'Bearer private-test-token'},body:{scenarioText:scenario}},res);
 assert.equal(res.statusCode,502);
 assert.match(res.body.error,/UNRECOGNIZED_CITATION/);
 assert.equal(calls,1);
});
