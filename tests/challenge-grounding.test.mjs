import test from 'node:test';
import assert from 'node:assert/strict';
import handler,{validateRequest,buildModelRequest} from '../api/challenge.js';
import {validateReferenceUrl,buildNativeResearchRequest,readNativeResearchResponse} from '../lab/challenge-grounding.cjs';

const scenario='A fictional team uses CODEOWNERS for low-risk PR reviews.';
const modelOutput={
 contractVersion:'0.1.0',
 facts:[{statement:'A team proposes using CODEOWNERS.',support:'explicit-user-statement'}],
 approvalOutcomes:[],
 challenges:[{question:'Which service or user actually submits the approval?'}],
 conclusions:[{scenarioBasis:'CODEOWNERS is a reviewer ownership mechanism.',application:'A bot or human must submit review; CODEOWNERS alone is not an approval action.',openQuestion:'Which ruleset is active?',basisType:'engineering-judgment',citationIds:[]}],
 citationIds:[],
 alternatives:['Manual review: human decides and submits; slower but familiar.','Delegated approval: human decides, bot submits; needs identity mapping.'],
 unknowns:['Current GitHub ruleset is not given']
};
const mockRes=()=>({
 statusCode:200,headers:{},
 setHeader(k,v){this.headers[k]=v;return this},
 status(n){this.statusCode=n;return this},
 json(body){this.body=body;return this}
});
test('reference URLs are opt-in and must be public HTTPS URLs',()=>{
 for(const v of ['http://docs.github.com/test','https://127.0.0.1/foo','https://10.10.0.1/foo','https://localhost/foo','https://me:secret@docs.github.com','https://[::1]/','https://foo.internal/docs']){
  assert.ok(validateReferenceUrl(v).error,v);
 }
 assert.equal(validateReferenceUrl('https://docs.github.com/en/get-started').url,'https://docs.github.com/en/get-started');
 assert.equal(validateRequest({scenarioText:scenario,referenceUrl:'https://docs.github.com'}).error,'Enable research to investigate the reference URL');
 assert.equal(validateRequest({scenarioText:scenario,researchMode:'discover',referenceUrl:'https://docs.github.com'}).researchMode,'discover');
 assert.match(validateRequest({scenarioText:scenario,researchMode:'unsupported'}).error,/Invalid research mode/);
});
test('native research mode is opt-in and uses Google Search with optional URL Context',()=>{
 const base=buildModelRequest({scenarioText:scenario,turns:[],history:[]});
 const search=buildNativeResearchRequest(base);
 assert.deepEqual(search.tools,[{googleSearch:{}}]);
 assert.equal(search.generationConfig.responseMimeType,'application/json');
 assert.match(search.systemInstruction.parts[0].text,/Search only if it materially helps/);
 assert.match(search.contents[0].parts[0].text,/CODEOWNERS/);
 const url=buildNativeResearchRequest(base,'https://docs.github.com/en/get-started');
 assert.deepEqual(url.tools,[{googleSearch:{}},{urlContext:{}}]);
 assert.match(url.contents[0].parts[0].text,/docs.github.com/);
});
test('provider metadata is the only source of live citation URLs',()=>{
 const payload={
  candidates:[{content:{parts:[{text:JSON.stringify({...modelOutput,referenceUrl:'https://made-up.example/article'})}]},
   groundingMetadata:{
    webSearchQueries:['GitHub CODEOWNERS auto-approve documentation'],
    searchEntryPoint:{renderedContent:'<style>.chip{color:#fff}</style><a href="https://www.google.com/search?q=CODEOWNERS">Search</a>'},
    groundingChunks:[{web:{uri:'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners',title:'About code owners'}}],
    groundingSupports:[{segment:{text:'CODEOWNERS specifies review owners.'},groundingChunkIndices:[0]}]
   }}]
 };
 const result=readNativeResearchResponse(payload);
 assert.equal(result.error,undefined);
 assert.equal(result.parsed.referenceUrl,'https://made-up.example/article');
 assert.equal(result.research.sources.length,1);
 assert.ok(result.research.sources[0].url.startsWith('https://docs.github.com/'));
 assert.equal(result.research.evidence[0].sourceUrls.length,1);
 assert.match(result.research.suggestionHtml,/google.com\/search/);
 const noSource=readNativeResearchResponse({candidates:[{content:{parts:[{text:JSON.stringify(modelOutput)}]}}]});
 assert.equal(noSource.research.status,'no-retrieved-sources');
 const missingSuggestion=readNativeResearchResponse({candidates:[{content:{parts:[{text:JSON.stringify(modelOutput)}]},groundingMetadata:{webSearchQueries:['GitHub CODEOWNERS'],groundingChunks:[{web:{uri:'https://docs.github.com/en',title:'GitHub Docs'}}]}}]});
 assert.match(missingSuggestion.error,/attribution/);
});
test('live opt-in request returns provider-grounded sources and keeps old catalog path unchanged',async t=>{
 const prevKey=process.env.GEMINI_API_KEY,prevToken=process.env.CHALLENGE_API_TOKEN;
 process.env.GEMINI_API_KEY='fake-provider-key';
 process.env.CHALLENGE_API_TOKEN='private-preview-secret';
 t.after(()=>{
  if(prevKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=prevKey;
  if(prevToken===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=prevToken;
 });
 let count=0;
 t.mock.method(globalThis,'fetch',async (url,options)=>{
  const body=JSON.parse(options.body);
  count++;
  if(String(url).includes(':generateContent')){
   assert.equal(options.headers['x-goog-api-key'],'fake-provider-key');
   assert.equal(body.tools[0].googleSearch!==undefined,true);
   assert.equal(body.tools[1]?.urlContext!==undefined,true);
   assert.equal(body.generationConfig.responseMimeType,'application/json');
   return {ok:true,json:async()=>({
    candidates:[{content:{parts:[{text:JSON.stringify(modelOutput)}]},
      groundingMetadata:{
       webSearchQueries:['GitHub CODEOWNERS review'],
       searchEntryPoint:{renderedContent:'<a target="_blank" href="https://google.com/search?q=codeowners">Search</a>'},
       groundingChunks:[{web:{uri:'https://docs.github.com/en/repositories',title:'GitHub documentation'}}]
      }}]
   })};
  }
  assert.ok(String(url).includes('openai/chat/completions'));
  assert.equal(body.response_format.type,'json_object');
  return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(modelOutput)}}]})};
 });
 const req={method:'POST',headers:{authorization:'Bearer private-preview-secret'},body:{scenarioText:scenario,researchMode:'discover',referenceUrl:'https://docs.github.com/en/repositories'}};
 const result=mockRes();
 await handler(req,result);
 assert.equal(result.statusCode,200,JSON.stringify(result.body));
 assert.equal(result.body.research.status,'grounded');
 assert.equal(result.body.research.sources[0].title,'GitHub documentation');
 assert.ok(result.body.continuityReceipt);
 const normal=mockRes();
 await handler({...req,body:{scenarioText:scenario}},normal);
 assert.equal(normal.statusCode,200);
 assert.equal(normal.body.research,null);
 assert.equal(count,2);
});
test('search endpoint failure does not silently fall back to ungrounded output',async t=>{
 const prevKey=process.env.GEMINI_API_KEY,prevToken=process.env.CHALLENGE_API_TOKEN;
 process.env.GEMINI_API_KEY='fake-provider-key';
 process.env.CHALLENGE_API_TOKEN='private-preview-secret';
 t.after(()=>{
  if(prevKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=prevKey;
  if(prevToken===undefined)delete process.env.CHALLENGE_API_TOKEN;else process.env.CHALLENGE_API_TOKEN=prevToken;
 });
 t.mock.method(globalThis,'fetch',async()=>({ok:false,status:429}));
 const res=mockRes();
 await handler({method:'POST',headers:{authorization:'Bearer private-preview-secret'},body:{scenarioText:scenario,researchMode:'discover'}},res);
 assert.equal(res.statusCode,502);
 assert.match(res.body.error,/research is unavailable/);
});
