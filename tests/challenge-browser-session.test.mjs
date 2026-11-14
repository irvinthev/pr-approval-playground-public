import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import session from '../api/challenge-session.js';
import challenge from '../api/challenge.js';

function response() {
  return {
    headers:{},
    setHeader(name,value){this.headers[name]=value;},
    status(code){this.code=code;return this;},
    json(body){this.body=body;return this;}
  };
}

test('remembered browser works across requests, expires, and remains Preview-only', async t=>{
  const prior = {...process.env};
  t.after(()=>{
    for(const key of ['VERCEL_ENV','CHALLENGE_API_TOKEN','GEMINI_API_KEY']){
      if(prior[key]===undefined)delete process.env[key];
      else process.env[key]=prior[key];
    }
  });
  process.env.VERCEL_ENV='preview';
  process.env.CHALLENGE_API_TOKEN='test-lab-token';
  process.env.GEMINI_API_KEY='test-provider-key';
  const clock=t.mock.method(Date,'now',()=>1_800_000_000_000);
  const browser={'x-challenge-lab':'1'};
  const access={...browser,authorization:'Bearer test-lab-token'};
  const call=(method,headers)=>{
    const res=response();
    session({method,headers},res);
    assert.equal(res.headers['Cache-Control'],'no-store');
    return res;
  };
  assert.equal(call('POST',browser).code,401);
  assert.equal(call('POST',{authorization:access.authorization}).code,403);
  assert.equal(call('DELETE',{}).code,403);
  const created=call('POST',access);
  assert.equal(created.code,200);
  const header=created.headers['Set-Cookie'];
  assert.match(header,/^__Host-challenge-lab=/);
  assert.match(header,/Max-Age=28800; Path=\/; HttpOnly; Secure; SameSite=Strict$/);
  assert.doesNotMatch(header,/Domain=|test-lab-token/);
  const cookie=header.split(';')[0];
  assert.deepEqual(call('GET',{...browser,cookie}).body,{active:true});
  assert.equal(call('GET',{cookie}).code,403);
  assert.deepEqual(call('GET',{...browser,cookie:cookie+'0'}).body,{active:false});

  const challengeStatus=async headers=>{
    const res=response();
    await challenge({method:'POST',headers,body:{}},res);
    return res.code;
  };
  // An empty scenario reaches input validation only after authentication succeeds.
  assert.equal(await challengeStatus({...browser,cookie}),400);
  assert.equal(await challengeStatus({cookie}),401);
  assert.equal(await challengeStatus({authorization:access.authorization}),400);
  const cleared=call('DELETE',{...browser,cookie});
  assert.match(cleared.headers['Set-Cookie'],/^__Host-challenge-lab=; Max-Age=0;/);
  assert.deepEqual(call('GET',browser).body,{active:false});

  clock.mock.mockImplementation(()=>1_800_000_000_000+28_800_000);
  assert.deepEqual(call('GET',{...browser,cookie}).body,{active:false});
  assert.equal(await challengeStatus({...browser,cookie}),401);
  clock.mock.mockImplementation(()=>1_800_000_000_000);
  process.env.CHALLENGE_API_TOKEN='rotated-test-token';
  assert.deepEqual(call('GET',{...browser,cookie}).body,{active:false});
  process.env.CHALLENGE_API_TOKEN='test-lab-token';
  process.env.VERCEL_ENV='production';
  assert.equal(call('POST',access).code,404);
  assert.equal(await challengeStatus({...browser,cookie}),401);
});

test('the session helper loads from a CommonJS Vercel function bundle', ()=>{
  const require=createRequire(new URL('../api/challenge.js',import.meta.url));
  const helper=require('../lab/challenge-browser-session.cjs');
  assert.equal(typeof helper.hasBrowserSession,'function');
  assert.equal(typeof helper.hasChallengeToken,'function');
});
