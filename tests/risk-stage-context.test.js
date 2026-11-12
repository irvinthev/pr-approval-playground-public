const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const pages=[['engineering-blueprint.html','engineering'],['continuous-monitoring.html','monitoring'],['independent-assurance.html','assurance']];
test('three technical perspectives mount one risk-aware SDLC navigator',()=>{
 for(const [file,lens] of pages){
  const html=read(file);
  assert.match(html,new RegExp('id="risk-stage-context" data-perspective="'+lens+'"'),file);
  assert.match(html,/src="\.\/risk-sdlc-trace\.js\?v=2"/,file);
  assert.match(html,/src="\.\/risk-stage-context\.js\?v=1"/,file);
  assert.match(html,/href="\.\/risk-stage-context\.css\?v=1"/,file);
  assert.ok(html.indexOf('shared-pipeline-context.js?v=1')<html.indexOf('risk-sdlc-trace.js?v=2'));
  assert.ok(html.indexOf('risk-sdlc-trace.js?v=2')<html.indexOf('risk-stage-context.js?v=1'));
 }
});
test('one mapping source powers all perspectives and passes risk plus stage in links',()=>{
 const risk=read('risk-sdlc-trace.js'),shared=read('risk-stage-context.js');
 assert.match(risk,/root\.RiskScenarioStages=Object\.freeze\(scenarios\)/);
 for(const id of ['RR-01','RR-02','RR-04'])assert.ok(risk.includes("'"+id+"':["),id);
 assert.match(shared,/const scenarios=root\.RiskScenarioStages/);
 assert.match(shared,/searchParams\.set\('risk',risk\)/);
 assert.match(shared,/searchParams\.set\('stage',String\(stage\)\)/);
 assert.match(shared,/model\.stages/);
 assert.match(shared,/aria-pressed/);
 assert.doesNotMatch(shared,/evaluateCase|mergePullRequest|approveMerge|Braze|QualityBot/);
});
test('legacy selectors and links are retained for technical content and deep links',()=>{
 const engineering=read('engineering-blueprint.html'),monitoring=read('continuous-monitoring.html'),assurance=read('independent-assurance.html');
 for(const id of ['technical-requirements','stages'])assert.ok(engineering.includes('id="'+id+'"'));
 for(const id of ['monitoring-guide','stage-pickers'])assert.ok(monitoring.includes('id="'+id+'"'));
 for(const id of ['assurance-control-explorer','stage-journey','prelaunch-validation'])assert.ok(assurance.includes('id="'+id+'"'));
 assert.match(assurance,/id="stage-journey" class="stage-journey" data-perspective="assurance" hidden/);
 assert.ok(read('index.html').includes('risk=RR-02&amp;stage=1#risk-sdlc-trace'));
});
