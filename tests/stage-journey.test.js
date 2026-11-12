const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const model=require('../shared-pipeline-context.js');
test('three perspectives mount one read-only seven-stage journey',()=>{
 for(const [file,lens] of [['continuous-monitoring.html','monitoring'],['independent-assurance.html','assurance']]){
  const html=read(file);
  assert.match(html,new RegExp('id="stage-journey"[^>]+data-perspective="'+lens+'"'),file);
  assert.match(html,/src="\.\/stage-journey\.js\?v=1"/,file);
  assert.match(html,/href="\.\/stage-journey\.css\?v=1"/,file);
  assert.ok(html.indexOf('id="stage-journey"')<html.indexOf(lens==='engineering'?'id="technical-requirements"':lens==='monitoring'?'id="monitoring-guide"':'id="prelaunch-validation"'),file);
 }
 const engineering=read('engineering-blueprint.html');
 assert.match(engineering,/id="technical-requirements"/);
 assert.match(engineering,/id="stage-journey" hidden/);
 assert.doesNotMatch(engineering,/src="\\.\\/stage-journey\\.js/);
});
test('journey links use actual existing destinations and preserve zero-based stage IDs',()=>{
 const js=read('stage-journey.js');
 for(const [key,file,anchor] of [['engineering','engineering-blueprint.html','technical-requirements'],['monitoring','continuous-monitoring.html','monitoring-guide'],['assurance','independent-assurance.html','stage-journey']]){
  assert.ok(js.includes(key+':{label:'),key);
  assert.ok(read(file).includes('id="'+anchor+'"'),anchor);
 }
 assert.match(js,/model\.stageFromLocation\(root\.location\.search\)/);
 assert.match(js,/url\.searchParams\.set\('stage',String\(i\)\)/);
 assert.match(js,/root\.queueMicrotask\(sync\)/);
 assert.match(js,/assurance-procedures-reference\.html\?stage=/);
 assert.ok(read('assurance-procedures-reference.html').includes('id="testing-guide"'));
 for(let i=0;i<7;i++)assert.equal(model.stages[i].id,i);
});
test('cross-page presentation does not modify the evaluator or introduce employer data',()=>{
 const js=read('stage-journey.js'),css=read('stage-journey.css');
 assert.doesNotMatch(js,/\bevaluateCase\s*\(|\bmergePullRequest\s*\(|QualityBot|RiskBot|Braze|Appboy/i);
 assert.doesNotMatch(css,/Braze|Appboy/i);
 assert.match(js,/Illustrative linkage only/);
});
