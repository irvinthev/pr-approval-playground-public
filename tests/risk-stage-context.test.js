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
 assert.match(shared,/scenarios=root\.RiskScenarioStages/);
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

test('Engineering and Monitoring use shared navigation without second visible stage strips',()=>{
 const eng=read('engineering-blueprint.html'),mon=read('continuous-monitoring.html');
 const engJs=read('risk-stage-context.js'),monitorJs=read('monitoring.js');
 assert.match(eng,/<span id="stages" hidden aria-hidden="true"><\/span>/);
 assert.doesNotMatch(eng,/<div class="stages" id="stages"/);
 assert.doesNotMatch(eng,/id="stage-swipe-hint"/);
 assert.match(mon,/<span id="stage-pickers" hidden aria-hidden="true"><\/span>/);
 assert.doesNotMatch(mon,/class="panel monitoring-stage-picker"/);
 assert.match(eng,/window\.EngineeringStageView=\{select\(i\)/);
 assert.match(monitorJs,/root\.MonitoringStageView=\{select\(i\)/);
 assert.match(engJs,/root\.EngineeringStageView\?\.select\(stage\)/);
 assert.match(engJs,/root\.MonitoringStageView\?\.select\(stage\)/);
 assert.doesNotMatch(monitorJs,/\$\('stage-pickers'\)\.append\(b\)/);
 assert.doesNotMatch(eng,/\$\('stages'\)\.append\(b\)/);
});
test('Existing technical links preserve selected risk and stage',()=>{
 const eng=read('engineering-blueprint.html'),monitor=read('monitoring.js'),shared=read('risk-stage-context.js');
 assert.match(eng,/selectedRisk&&\/\^RR-\(01\|02\|04\)\$\//);
 assert.match(monitor,/selectedRisk&&\/\^RR-\(01\|02\|04\)\$\//);
 assert.match(shared,/stage=item\.id;save\(\);syncExistingStage\(\);render\(\)/);
});
