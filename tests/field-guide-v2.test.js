const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('legacy chapters retain their shared V2 experience without changing lab routes',()=>{
 for(const page of ['legacy-homepage.html','ai-sdlc-risk.html','engineering-blueprint.html','continuous-monitoring.html','independent-assurance.html']){
  const html=read(page);
  assert.match(html,/\.\/field-guide-v2\.css\?v=1/);
  assert.match(html,/\.\/field-guide-v2\.js\?v=1/);
  assert.match(html,/id="main-content"/);
 }
 assert.match(read('continuous-monitoring.html'),/A PR changed after approval\. Would we know\?/);
});

test('chapter interactions are deterministic and specific rather than another full simulator',()=>{
 const js=read('field-guide-v2.js');
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const phrase of ['Human approval','Human-directed agent','Autonomous approval','AI-assisted','Fast Track','10:08 · Push B','10:10 · Reconcile','Sample approvals','Reconcile population','Challenge decisions']){
  assert.ok(js.includes(phrase),phrase);
 }
 assert.match(js,/hero\.insertAdjacentElement\('afterend', explorer\)/);
 assert.match(js,/aria-pressed/);
 assert.match(js,/textContent = value/);
 assert.doesNotMatch(js,/\bfetch\s*\(|\bXMLHttpRequest\b|\/api\/challenge/);
 assert.match(js,/Not a live GitHub, AI, monitoring, or assurance determination/);
});

test('each focus link references a current chapter anchor',()=>{
 const js=read('field-guide-v2.js');
 for(const anchor of ['overview-authority-preview','engineering-build-plan','rr02-negative-test','fg-monitoring-dashboard','monitoring-investigations','monitoring-guide','assurance-control-explorer','fg-worked-investigation']){
  assert.ok(js.includes("link:'#"+anchor+"'"),anchor);
  const target=/^overview/.test(anchor)?'legacy-homepage.html':/^(engineering|rr02)/.test(anchor)?'engineering-blueprint.html':/^(fg-monitor|monitoring)/.test(anchor)?'continuous-monitoring.html':'independent-assurance.html';
  assert.ok(read(target).includes('id="'+anchor+'"'),target+'#'+anchor);
 }
});
