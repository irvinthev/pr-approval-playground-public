import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
test('Private challenge lab has mobile accessible scenario input and follow-up',()=>{
 for(const id of ['token','scenario','ask','question','continue','reset','result','status']){
   assert.match(source,new RegExp('id="'+id+'"'));
 }
 assert.match(source,/name="viewport"/);
 assert.match(source,/aria-live="polite"/);
});
test('Private lab uses same-origin API, no embedded tokens or model credential',()=>{
 assert.match(source,/fetch\('\.\/api\/challenge'/);
 assert.match(source,/Authorization:'Bearer '\+token/);
 assert.doesNotMatch(source,/AIza[A-Za-z0-9_-]{25,}/);
 assert.doesNotMatch(source,/localStorage|sessionStorage|document\.cookie/);
 assert.match(source,/type="password"/);
});
test('Model response rendered as text, citations require https and new session clears token',()=>{
 assert.match(source,/node\.textContent=String/);
 assert.match(source,/url\.protocol==='https:'/);
 assert.match(source,/el\('token'\)\.value=''/);
 assert.match(source,/state\.scenario!==scenario/);
});

test('private lab renders bounded evidence-based control assessment without claiming effectiveness',()=>{
 for(const id of ['assessment-section','assessments'])assert.match(source,new RegExp('id="'+id+'"'));
 assert.match(source,/EXPECTED CONTROL/);
 assert.match(source,/MANAGEMENT DEMONSTRATION/);
 assert.match(source,/Not assessed — implementation and effectiveness have not been verified/);
});

test('follow-ups retain the original assessment and append to a separate conversation thread',()=>{
 assert.match(source,/id="followup-history"/);
 assert.match(source,/state\.followups\+\+/);
 assert.match(source,/appendFollowup\(data,question\)/);
 assert.match(source,/if\(follow\)\{[\s\S]*?appendFollowup\(data,question\)[\s\S]*?\}else\{[\s\S]*?render\(data\)/);
 assert.match(source,/for\(const id of \['facts','challenges','assessments','unknowns','citations','followup-history'\]\)clear/);
 assert.match(source,/state\.followups=0/);
});
test('bounded continuity conveys previous model output as untrusted assistant context',()=>{
 const fn=source.match(/function compactAssistantSummary\(data\)\{[\s\S]*?\n\}/);
 assert.ok(fn,'Expected a pure compactAssistantSummary function');
 const compact=vm.runInNewContext('('+fn[0]+')');
 const result=compact({
   facts:[{statement:'Engineer approved a plan'}],
   challenges:[{question:'Who approved this exact commit?',reason:'Plan and code approval differ'}],
   assessments:[{risk:'Unreviewed source revision',expectedControl:'Commit-bound permission enforcement'}],
   unknowns:['Effective rulesets were not provided'],
   alternatives:['AI-assisted human approval']
 });
 assert.match(result,/Engineer approved a plan/);
 assert.match(result,/Who approved this exact commit/);
 assert.match(result,/Unreviewed source revision/);
 assert.ok(result.length<=720);
 assert.match(source,/role:'assistant',content:compactAssistantSummary\(data\)/);
 assert.match(source,/state\.turns\.slice\(-5\)/);
 assert.match(source,/role:'user',content:question/);
});
test('follow-up history does not suppress further conversation or persist tokens in storage',()=>{
 assert.doesNotMatch(source,/state\.turns\.length>=6/);
 assert.match(source,/recent conversation context retained/);
 assert.doesNotMatch(source,/localStorage|sessionStorage|document\.cookie/);
 assert.match(source,/node\.textContent=String/);
});

test('private Lab can check authorized backend configuration without generating Gemini output',()=>{
 assert.match(source,/id="check-connection"/);
 assert.match(source,/function checkConnection/);
 assert.match(source,/body:JSON\.stringify\(\{action:'diagnostic'\}\)/);
 assert.match(source,/Gemini generation has NOT been tested/);
 assert.match(source,/API returned a non-JSON response/);
 assert.match(source,/Sign in to Vercel/);
 assert.match(source,/data\?\.code/);
 assert.doesNotMatch(source,/localStorage|sessionStorage|document\.cookie/);
});

test('the first result leads with recommendation; detailed references remain locally expandable',()=>{
 assert.match(source,/id="recommendation"/);
 assert.match(source,/<details id="assessment-details"/);
 assert.match(source,/Explore the reasoning, safeguards, and framework references/);
 assert.match(source,/function renderRecommendation\(data\)/);
 assert.match(source,/renderRecommendation\(data\);/);
 assert.match(source,/el\('assessment-details'\)\.open=false/);
 assert.match(source,/WHAT COULD GO WRONG/);
 assert.match(source,/CREDIBLE ALTERNATIVE/);
 assert.match(source,/WHAT COULD CHANGE THIS VIEW/);
 assert.match(source,/r\.judgment/);
 assert.match(source,/r\.why/);
 assert.match(source,/node\.textContent=String/);
});
test('initial judgment enters bounded untrusted conversation memory',()=>{
 const fn=source.match(/function compactAssistantSummary\(data\)\{[\s\S]*?\n\}/);
 assert.ok(fn);
 const compact=vm.runInNewContext('('+fn[0]+')');
 const r=compact({
   recommendation:{judgment:'Pilot conditionally',why:'Faster review, uncertain dependency scope'},
   assessments:[{risk:'Risk of outdated commit approval',expectedControl:'Revision-bound branch rules'}],
   facts:[{statement:'Two reviewers agree'}],
   challenges:[{question:'Who decides?',reason:'Unclear authority'}],
   unknowns:['Can rules protect deployment?'],
   alternatives:['Human-led approval']
 });
 assert.match(r,/Judgment: Pilot conditionally/);
 assert.match(r,/Risk of outdated commit approval/);
 assert.ok(r.length<=720);
 assert.match(source,/role:'assistant',content:compactAssistantSummary\(data\)/);
});
