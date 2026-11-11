const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../shared-pipeline-context');
const read=p=>fs.readFileSync(p,'utf8');
const lenses=['risk','engineering','monitoring','assurance'];
test('one canonical seven-stage model and valid links for all four perspectives',()=>{
 assert.equal(M.stages.length,7);
 assert.deepEqual(M.stages.map(s=>s.id),[0,1,2,3,4,5,6]);
 assert.deepEqual(M.stages.map(s=>s.title),['Pull request','Eligibility & CI','AI reviews','Authorization','Merge + build','Pre-production','Production rollout']);
 for(const lens of lenses)for(const stage of M.stages){const dest=M.href(lens,stage.id);assert.ok(dest.includes('stage='+stage.id));assert.ok(dest.includes(M.urls[lens]));}
 assert.equal(M.stageFromLocation('?stage=3'),3);assert.equal(M.stageFromLocation('?stage=6'),6);
 for(const invalid of ['3.5','07','-1','NaN','Infinity','__proto__'])assert.equal(M.stageFromLocation('?stage='+invalid),null);
 assert.throws(()=>M.href('invalid',3));assert.throws(()=>M.href('risk',7));
});
test('shared-library decision connects eligibility, authorization and production to concrete evidence and challenges',()=>{
 assert.deepEqual(Object.keys(M.trace).map(Number).sort(),[1,3,6]);
 for(const key of [1,3,6]){
  const t=M.trace[key];for(const field of ['question','risk','engineering','monitoring','evidence','assurance','limitation'])assert.ok(t[field].length>70,'stage '+key+' lacks '+field);
  assert.ok(t.controls.length>=3);
 }
 assert.match(M.trace[1].risk,/billing consumer/);
 assert.match(M.trace[1].assurance,/map coverage|map/);
 assert.match(M.trace[3].assurance,/revision A and push revision B/);
 assert.match(M.trace[3].evidence,/SHAs/);
 assert.match(M.trace[6].assurance,/production deployment population/);
 assert.match(M.trace[6].evidence,/artifact digest/);
 assert.deepEqual(M.trace[3].controls,['AI-03','AI-06','AI-07','AI-08','AI-15']);
});
test('Risk and Assurance have the stage strip; Engineering and Monitoring retain independent stage explorers',()=>{
 for(const [page,lens] of [['ai-sdlc-risk.html','risk'],['engineering-blueprint.html','engineering'],['independent-assurance.html','assurance']]){
  const s=read(page);
  assert.match(s,new RegExp('id="shared-pipeline-context" data-perspective="'+lens+'"'));
  assert.match(s,/src="\.\/shared-pipeline-context\.js\?v=1"/);
  assert.match(s,/src="\.\/shared-pipeline-nav\.js\?v=1"/);
  assert.match(s,/shared-pipeline-context\.css\?v=1/);
 }
 const script=read('shared-pipeline-nav.js');
 assert.match(script,/if\(!engineering\)\{/,'Engineering has no duplicate stage strip');
 assert.match(script,/const existing=doc.querySelectorAll\('#stages button'\)/);
 assert.match(script,/history\.replaceState/);
 assert.doesNotMatch(script,/resolveAuthorization|evaluateCase|approveMerge|runApproval/,'navigation must not touch evaluation engine');
 const monitor=read('continuous-monitoring.html');
 assert.match(monitor,/id="stage-pickers"/);
 assert.match(monitor,/id="monitoring-guide"/);
 assert.match(monitor,/src="\.\/monitoring\.js\?v=shared-1"/);
 assert.doesNotMatch(monitor,/location\.replace\('\.\/engineering-blueprint\.html\?stage='/);
});
test('shared navigation JavaScript parses and exposes only reference data',()=>{
 for(const p of ['shared-pipeline-context.js','shared-pipeline-nav.js'])new vm.Script(read(p),{filename:p});
 assert.equal(typeof M.href,'function');
 assert.ok(!('evaluate' in M));
 assert.ok(!('authorize' in M));
});
