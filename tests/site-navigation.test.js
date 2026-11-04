const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=['index.html','ai-sdlc-risk.html','experience.html','engineering-blueprint.html','risk-controls.html','control-matrix.html','continuous-monitoring.html','independent-assurance.html','auditor-view.html','playground.html','previous-overview.html'];
const primary=['index.html','ai-sdlc-risk.html','engineering-blueprint.html','continuous-monitoring.html','independent-assurance.html'];
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
test('current pages use five-section navigation, with reference pages not impersonating primary destinations',()=>{
 for(const page of pages.filter(p=>p!=='previous-overview.html')){
 const html=read(page),nav=html.match(/<nav class="site-chapters"[^>]*>([\s\S]*?)<\/nav>/);
 assert.ok(nav,page);
 const hrefs=[...nav[1].matchAll(/href="\.\/([^"#?]+)"/g)].map(m=>m[1]);
 assert.deepEqual(hrefs,primary,page);
 const active=[...nav[1].matchAll(/href="([^"]+)"[^>]*aria-current="(page|location)"/g)];
 const mapped={'index.html':'index.html','ai-sdlc-risk.html':'ai-sdlc-risk.html','engineering-blueprint.html':'engineering-blueprint.html','continuous-monitoring.html':'continuous-monitoring.html','independent-assurance.html':'independent-assurance.html','control-matrix.html':'ai-sdlc-risk.html','auditor-view.html':'independent-assurance.html'};
 if(mapped[page]){
 assert.equal(active.length,1,page);
 assert.equal(active[0][1],'./'+mapped[page],page);
 assert.equal(active[0][2],page===mapped[page]?'page':'location',page);
 }else assert.equal(active.length,0,page);
 }
});
test('previous overview remains an intact historical simulation reference',()=>{
 const old=read('previous-overview.html');
 assert.match(old,/class="lens-section"/);
 assert.deepEqual([...old.matchAll(/<button class="workflow-stage"[^>]*data-stage="(\d+)"/g)].map(m=>Number(m[1])),[0,1,2,3,4,5,6,7]);
 assert.deepEqual([...old.matchAll(/<button type="button" data-scenario="([^"]+)"/g)].map(m=>m[1]),['pass','split','excluded','canary']);
});
test('static local links and fragment destinations resolve',()=>{for(const page of pages){for(const match of read(page).matchAll(/href="([^"]+)"/g)){const u=new URL(match[1],'https://example.test/'+page);if(u.origin!=='https://example.test')continue;const file=decodeURIComponent(u.pathname.slice(1));assert.ok(fs.existsSync(path.join(root,file)),page+' → '+match[1]);if(u.hash){const id=decodeURIComponent(u.hash.slice(1));assert.ok(read(file).includes('id="'+id+'"'),page+' → '+match[1]);}}}});
test('homepage makes assessment the primary path and parks simulations',()=>{
 const html=read('index.html');
 assert.match(html,/href="\.\/ai-sdlc-risk\.html">Start with the AI operating model/);
 assert.match(html,/href="\.\/previous-overview\.html">Open previous Overview/);
 assert.doesNotMatch(html,/class="workflow-stage"/);
 assert.doesNotMatch(html,/data-scenario="/);
});
test('risk assessment explains capability-specific authority without claiming a validated risk score',()=>{
 const html=read('ai-sdlc-risk.html');
 for(const capability of ['Execution','Decision','Production','Governance'])assert.ok(html.includes(capability),capability);
 assert.match(html,/No computed AI risk score/);
 assert.match(html,/management/i);
});


test('engineering build remains primary while monitoring is a dedicated chapter',()=>{
 const engineering=fs.readFileSync(path.join(root,'engineering-blueprint.html'),'utf8');
 const monitoring=fs.readFileSync(path.join(root,'continuous-monitoring.html'),'utf8');
 assert.match(engineering,/href="\.\/continuous-monitoring\.html\?stage=0#monitoring-guide"/);
 assert.match(monitoring,/id="monitoring-guide"/);
 assert.match(engineering,/id="view-monitor"[^>]*hidden/);
 assert.match(engineering,/Engineering stage explorer/);
 assert.match(engineering,/Implementation/);
});
test('assurance entry presents task-led choices with optional detailed matrix',()=>{
 const html=fs.readFileSync(path.join(root,'independent-assurance.html'),'utf8');
 assert.match(html,/Explore the controls/);
 assert.match(html,/Test a fictional change/);
 assert.match(html,/href="\.\/rcm-view\.html"/);
 assert.match(html,/href="\.\/auditor-view\.html"/);
 assert.match(html,/href="#test-approval"/);
 assert.ok(html.indexOf('Explore the controls')<html.indexOf('Risk, Control &amp; Testing Matrix'));
});
test('advisory example avoids claiming execution authority',()=>{
 const html=fs.readFileSync(path.join(root,'ai-sdlc-risk.html'),'utf8');
 assert.match(html,/01 \/ Advisory assistance/);
 assert.doesNotMatch(html,/01 \/ Advisory and execution/);
});

test('Engineering to Monitoring preserves selected stage and legacy view links remain supported',()=>{
 const engineering=fs.readFileSync(path.join(root,'engineering-blueprint.html'),'utf8');
 const monitoring=read('continuous-monitoring.html');
 assert.match(engineering,/id="stage-monitor-link" href="\.\/continuous-monitoring\.html\?stage=0#monitoring-guide"/);
 assert.match(engineering,/id="engineering-footer-monitor-link" href="\.\/continuous-monitoring\.html\?stage=0#monitoring-guide"/);
 assert.match(engineering,/\$\('stage-monitor-link'\)\.href='\.\/continuous-monitoring\.html\?stage='\+encodeURIComponent\(String\(active\)\)/);
 assert.match(engineering,/id="view-monitor"[^>]*hidden/);
 assert.match(engineering,/get\('view'\)==='monitor'\?'monitor':'build'/);
 assert.match(monitoring,/id="monitoring-guide"/);
 const script=fs.readFileSync(path.join(root,'monitoring.js'),'utf8');
 assert.match(script,/new URLSearchParams\(search\)\.get\('stage'\)/);
});
test('current chapter footers do not send the main journey to archived perspective pages',()=>{
 for(const page of ['engineering-blueprint.html','continuous-monitoring.html','independent-assurance.html']){
  const footer=read(page).match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
  assert.ok(footer,page+' footer');
  assert.doesNotMatch(footer,/href="\.\/(?:experience|risk-controls)\.html"/);
 }
});
test('Assurance task choices precede the detailed matrix without duplicate toolbar choices',()=>{
 const assurance=read('independent-assurance.html');
 assert.doesNotMatch(assurance,/<nav class="assurance-tools"/);
 assert.match(assurance,/Explore the controls/);
 assert.match(assurance,/Test a fictional change/);
 assert.match(assurance,/href="#test-approval"/);
});
