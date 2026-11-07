const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('auditor-view.html','utf8');
const fixed=html.match(/const scenarios = \{([\s\S]*?)\n\};/);
const briefs=html.match(/const scenarioBriefs=Object\.freeze\(\{([\s\S]*?)\n\}\);/);
test('four named fixed scenario choices remain identifiable and separate from connected-case workflow',()=>{
 const names=['Standard Low-Risk Pass','AI Split Decision','Hard Gate Scope Exclusion','Production Canary Failure'];
 for(const name of names)assert.ok(html.includes(name),name);
 for(const id of ['pass','split','scope','canary'])assert.match(html,new RegExp('data-scenario="'+id+'"'));
 assert.match(html,/These four fixed examples use their own historical scenario records/);
 assert.match(html,/SharedCase\.evaluateCase\(\)/);
 assert.match(html,/experience\.html\?example=shared/);
});
test('all four fixed presets have the same explanation fields without altering scenario payloads',()=>{
 assert.ok(fixed&&briefs);
 const context={};
 const source=html.match(/const headSha = [^\n]+\nconst priorSha = [^\n]+\nconst policyVersion = [^\n]+\nconst mappingVersion = [^\n]+/);
 assert.ok(source,'fixture identities must be supplied from actual scenario definitions');
 vm.runInNewContext(source[0]+'\n'+fixed[0]+'\n'+briefs[0]+'\nthis.fixture={scenarios,scenarioBriefs};',context);
 const scenarios=context.fixture.scenarios,notes=context.fixture.scenarioBriefs;
 assert.deepEqual(Object.keys(notes).sort(),['canary','pass','scope','split']);
 for(const key of Object.keys(notes)){
  assert.ok(scenarios[key],'missing historical scenario '+key);
  assert.ok(scenarios[key].payload.run_id);
  assert.ok(scenarios[key].tests.length);
  assert.ok(notes[key].trigger&&notes[key].boundary&&notes[key].next&&notes[key].limit);
 }
 assert.equal(scenarios.canary.auditStatus,'ROLLED BACK');
 assert.match(notes.canary.limit,/not proof of real rollback/i);
 assert.match(notes.split.next,/human approval/i);
});
test('comparison is presentation-only and respects historical different state models',()=>{
 assert.match(html,/const brief=scenarioBriefs\[key\]/);
 for(const key of ['scenario-trigger','scenario-boundary','scenario-next-route','scenario-limit'])assert.match(html,new RegExp('id="'+key+'"'));
 assert.match(html,/byId\(id\)\.textContent=value/);
 assert.match(html,/A fixed canary rollback example does not imply/);
 assert.doesNotMatch(briefs[0],/\.transition\(|\.evaluateCase\(|canApprove\s*=/);
});
