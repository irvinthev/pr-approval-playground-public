const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../shared-pipeline-context');
const read=n=>fs.readFileSync(n,'utf8');
test('Overview contains one inline seven-stage walkthrough and keeps the four deeper chapters',()=>{
 const html=read('index.html');
 assert.match(html,/id="overview-pipeline"/);
 assert.match(html,/id="overview-stage-choices"/);
 assert.match(html,/id="overview-stage-detail"/);
 assert.match(html,/id="overview-evidence"/);
 assert.match(html,/id="overview-verify"/);
 assert.match(html,/id="overview-rcm-links"/);
 assert.match(html,/src="\.\/shared-pipeline-context\.js\?v=1"/);
 assert.match(html,/src="\.\/overview-pipeline\.js\?v=1"/);
 for(const page of ['ai-sdlc-risk.html','engineering-blueprint.html','continuous-monitoring.html','independent-assurance.html'])assert.ok(html.includes('href="./'+page+'"'));
 assert.match(html,/href="#overview-pipeline"/);
});
test('Overview data covers each shared pipeline stage with distinct action, route, risk, evidence and independent test',()=>{
 const code=read('overview-pipeline.js');
 const match=code.match(/const examples=(\[[\s\S]*?\]);\s*let selected=/);
 assert.ok(match,'stage details defined in the overview renderer');
 const scenarios=vm.runInNewContext('('+match[1]+')');
 assert.equal(scenarios.length,M.stages.length);
 for(const [index,row] of scenarios.entries()){
  for(const field of ['action','route','risk','evidence','verify'])assert.ok(row[field].length>60,'stage '+index+' missing '+field);
  assert.ok(row.control.length>0);
 }
 assert.match(scenarios[1].risk,/financial consumer/);
 assert.match(scenarios[3].verify,/revision A, push B/);
 assert.match(scenarios[6].verify,/production deployments/);
});
test('Overview is read-only and links to corresponding cross-page stage',()=>{
 const code=read('overview-pipeline.js');
 assert.match(code,/M\.stages\.forEach/);
 assert.match(code,/M\.href\(lens,selected\)/);
 assert.match(code,/history\.replaceState/);
 assert.match(code,/overview-next/);
 assert.match(code,/overview-prev/);
 assert.doesNotMatch(code,/resolveAuthorization|evaluateCase|approveMerge|releaseArtifact|innerHTML\s*=/);
 new vm.Script(code,{filename:'overview-pipeline.js'});
});
