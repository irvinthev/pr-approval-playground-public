const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const pages=[['engineering-blueprint.html','engineering'],['continuous-monitoring.html','monitoring'],['independent-assurance.html','assurance']];
test('technical pages use page-native seven-stage navigation, not Risk scenarios',()=>{
 const js=read('risk-stage-context.js'),risk=read('risk-sdlc-trace.js');
 for(const [file,lens] of pages){
  const html=read(file);
  assert.match(html,new RegExp('id="risk-stage-context" data-perspective="'+lens+'"'),file);
  assert.match(html,/src="\.\/risk-stage-context\.js\?v=2"/);
  assert.doesNotMatch(html,/src="\.\/risk-sdlc-trace\.js/);
  assert.ok(html.indexOf('shared-pipeline-context.js?v=1')<html.indexOf('risk-stage-context.js?v=2'));
 }
 assert.match(js,/model\.stages/);
 assert.match(js,/aria-pressed/);
 assert.match(js,/url\.searchParams\.delete\('risk'\)/);
 assert.match(js,/url\.searchParams\.set\('stage',String\(stage\)\)/);
 assert.doesNotMatch(js,/RR-01|RR-02|RR-04|RiskScenarioStages|introduced|exposed|mitigated|model\.urls|risk-context-links/);
 assert.match(risk,/root\.RiskScenarioStages=Object\.freeze\(scenarios\)/);
 assert.match(read('ai-sdlc-risk.html'),/id="risk-sdlc-trace"/);
});
test('every page has its own question and page-local interaction',()=>{
 const js=read('risk-stage-context.js');
 for(const phrase of ['What must Engineering implement at each stage?','How do we monitor each delivery stage?','How would we independently test each stage?','EngineeringStageView?.select(stage)','MonitoringStageView?.select(stage)','model.assuranceTests[stage]','technical-requirements','monitoring-guide','assurance-control-explorer'])
  assert.ok(js.includes(phrase),phrase);
 assert.match(js,/cta\.href='#'\+view\.anchor/);
 assert.doesNotMatch(js,/createElement\('a'\).*model\.urls|href='\.\/'/);
 assert.doesNotMatch(js,/evaluateCase|mergePullRequest|approveMerge|Braze|QualityBot/);
});
test('existing technical details and legacy anchors remain',()=>{
 const eng=read('engineering-blueprint.html'),mon=read('continuous-monitoring.html'),assurance=read('independent-assurance.html');
 for(const id of ['technical-requirements','stages','build-view','required-ci'])assert.ok(eng.includes('id="'+id+'"'));
 for(const id of ['monitoring-guide','stage-pickers','worked-examples','eng-data'])assert.ok(mon.includes('id="'+id+'"'));
 for(const id of ['assurance-control-explorer','stage-journey','prelaunch-validation'])assert.ok(assurance.includes('id="'+id+'"'));
 assert.match(assurance,/id="stage-journey" class="stage-journey" data-perspective="assurance" hidden/);
 assert.match(eng,/window\.EngineeringStageView=\{select\(i\)/);
 assert.match(read('monitoring.js'),/root\.MonitoringStageView=\{select\(i\)/);
});
test('seven-stage assurance guidance is independently testable without changing page',()=>{
 const model=require('../shared-pipeline-context.js');
 assert.equal(model.stages.length,7);
 for(const st of model.stages){
  const t=model.assuranceTests[st.id];
  assert.ok(t,'Missing test for stage '+st.id);
  for(const key of ['preparation','execution','expected','operation','retain'])assert.ok(t[key]?.length>25,st.id+':'+key);
 }
 const js=read('risk-stage-context.js');
 assert.match(js,/\['Prepare','preparation'\]/);
 assert.match(js,/\['Challenge','execution'\]/);
 assert.match(js,/\['Retain','retain'\]/);
});
