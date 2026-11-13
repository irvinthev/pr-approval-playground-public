// Run locally after Preview-only credentials have been configured.
// Reads credentials from environment; never hardcodes or prints them.
import assert from 'node:assert/strict';

const root=process.env.CHALLENGE_API_URL;
const token=process.env.CHALLENGE_API_TOKEN;
if(!root || !token){
  console.error('Set CHALLENGE_API_URL and CHALLENGE_API_TOKEN in your private shell.');
  process.exit(2);
}
let endpoint;
try{
  const url=new URL(root);
  if(url.protocol!=='https:' || !url.hostname.endsWith('.vercel.app'))throw new Error();
  endpoint=new URL('/api/challenge',url);
}catch{
  console.error('CHALLENGE_API_URL must be an HTTPS Vercel deployment URL.');
  process.exit(2);
}
const scenarios=[
  {label:'bounded approval',scenarioText:'A fictional bot merges low-risk documentation updates after two AI reviewers agree. A separate service controls branch protection.'},
  {label:'revision drift',scenarioText:'A fictional automated reviewer approves a commit, but a developer pushes another commit before merging. What should invalidate prior evidence?'},
  {label:'shared failure',scenarioText:'Two fictional AI reviewers rely on the same model provider and both classify a risky configuration change as low risk.'}
];
async function call(body,bearer){
  const response=await fetch(endpoint,{
    method:'POST',headers:{'Content-Type':'application/json',...(bearer?{Authorization:'Bearer '+bearer}:{})},
    body:JSON.stringify(body),signal:AbortSignal.timeout(20000)
  });
  let data;
  try{data=await response.json()}catch{data={error:'Non-JSON response'};}
  return {status:response.status,data};
}
const unauth=await call({scenarioText:scenarios[0].scenarioText});
assert.equal(unauth.status,401,'Expected 401 when Preview is configured and POST is unauthenticated');
console.log('PASS: unauthenticated POST rejected');
let failures=0;
for(const scenario of scenarios){
  try{
    const {status,data}=await call({scenarioText:scenario.scenarioText,turns:[]},token);
    assert.equal(status,200,'Expected 200, got '+status+' / '+String(data?.error||'unknown'));
    assert.equal(data.mode,'live-model');
    assert.ok(data.challenges?.length>0);
    assert.ok(data.citations?.length>0);
    assert.ok(data.facts?.length>0);
    assert.ok(data.citations.every(c=>c.provisionId && /^https:\/\//.test(c.url)));
    console.log('PASS:',scenario.label,'- challenges:',data.challenges.length,'citations:',data.citations.length);
  }catch(error){
    failures++;
    console.error('FAIL:',scenario.label,'-',error.message);
  }
}
if(failures)process.exitCode=1;
