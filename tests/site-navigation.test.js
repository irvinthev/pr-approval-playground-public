const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
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
function supportedRedirect(file,fragment){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes("const old=['rcm-preview-list'"));
 if(!script)return null;
 let target=null;vm.runInNewContext(script,{location:{hash:'#'+fragment,replace(value){target=value;}},window:{addEventListener(){}}});return target;
}
function localDestinationExists(file,fragment){
 if(!fs.existsSync(path.join(root,file)))return false;
 if(!fragment||read(file).includes('id="'+fragment+'"'))return true;
 const redirect=supportedRedirect(file,fragment);if(!redirect)return false;
 const target=new URL(redirect,'https://example.test/'+file),destination=decodeURIComponent(target.pathname.slice(1));
 return target.origin==='https://example.test'&&fs.existsSync(path.join(root,destination))&&(!target.hash||read(destination).includes('id="'+decodeURIComponent(target.hash.slice(1))+'"'));
}
test('static local links and supported redirect aliases resolve to real destinations',()=>{for(const page of pages){for(const match of read(page).matchAll(/href="([^"]+)"/g)){const u=new URL(match[1],'https://example.test/'+page);if(u.origin!=='https://example.test')continue;const file=decodeURIComponent(u.pathname.slice(1)),id=decodeURIComponent(u.hash.slice(1));assert.ok(localDestinationExists(file,id),page+' → '+match[1]);}}});
test('legacy Assurance redirects are bounded and missing destinations still fail',()=>{
 for(const id of ['rcm-preview-list','assurance-safeguards','rcm-dependencies','rcm-binding','rcm-independence','rcm-artifacts','testing-guide','example-rcm','framework-crosswalk','failure-scenarios','industry-challenge','challenge-domain-source'])assert.ok(localDestinationExists('independent-assurance.html',id),id);
 assert.equal(localDestinationExists('independent-assurance.html','not-a-real-fragment'),false);
 assert.equal(localDestinationExists('missing-page.html',''),false);
 assert.equal(supportedRedirect('independent-assurance.html','case=%7B%7D'),null);
});
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
test('Assurance presents three core sections and links to detailed testing and live lab',()=>{
 const html=fs.readFileSync(path.join(root,'independent-assurance.html'),'utf8');
 const markers=['id="foundational-controls"','id="test-approval"','id="document-assessment"'];
 for(const marker of markers)assert.equal(html.split(marker).length-1,1,marker);
 assert.ok(markers.every((marker,i)=>i===0||html.indexOf(marker)>html.indexOf(markers[i-1])));
 for(const objective of ['Change eligibility','AI reliability','Authorization','Policy integrity','Deployment integrity','Continuous monitoring'])assert.ok(html.includes('<td>'+objective+'</td>'),objective);
 for(const conclusion of ['Design','Implementation','Operation over time'])assert.ok(html.includes('<strong>'+conclusion+'</strong>'),conclusion);
 assert.match(html,/href="\.\/rcm-view\.html#download-current-rcm"/);
 assert.match(html,/href="\.\/auditor-view\.html#billing-challenge-lab"/);
 assert.doesNotMatch(html,/href="\.\/assurance-procedures-reference\.html#testing-guide"/);
 assert.match(html,/id="shared-case-root" hidden/);
 assert.doesNotMatch(html,/<strong>Framework references<\/strong>|<strong>Control previews<\/strong>/);
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
test('Assurance step navigation targets its three current sections without duplicating the old selector',()=>{
 const assurance=read('independent-assurance.html');
 const nav=assurance.match(/<nav class="simple-steps"[^>]*>([\s\S]*?)<\/nav>/)?.[1];assert.ok(nav);
 assert.deepEqual([...nav.matchAll(/href="#([^"#]+)"/g)].map(m=>m[1]),['operating-model','foundational-controls','prelaunch-validation','operations-assurance','document-assessment']);
 for(const label of ['01 · The model','02 · Trust foundations','03 · Go-live tests','04 · Live monitoring','05 · Audit evidence'])assert.ok(nav.includes(label),label);
 assert.doesNotMatch(assurance,/<nav class="assurance-tools"|id="stage-pickers"|id="test-detail"/);
});

test('Assurance explains the AI assurance challenge without claiming verified operation',()=>{
 const html=fs.readFileSync(path.join(root,'independent-assurance.html'),'utf8');
 for(const term of ['Human developer','Deterministic eligibility','Two AI reviewers','AI sign-off and human merge','Non-AI release controls','Shared responsibility','CODEOWNERS','false-low-risk','parallel testing','Point-in-time','AI assurance challenger','practitioner feedback']){
  assert.match(html,new RegExp(term,'i'),term);
 }
 for(const id of ['operating-model','foundational-controls','prelaunch-validation','operations-assurance','document-assessment'])assert.equal(html.split('id="'+id+'"').length-1,1,id);
 assert.match(html,/not prescriptive/i);
 assert.match(html,/not claims of implemented controls/i);
 assert.match(html,/independence, feasibility and cost remain open for discussion/i);
 assert.match(html,/id="test-approval"/,'legacy deep link stays valid');
 assert.match(html,/id="shared-case-root" hidden/,'existing case mount preserved');
 assert.match(html,/src="\.\/case-model\.js/,'existing case engine preserved');
});

test('Assurance first screen teaches shared-library deterministic exclusion before the chapter navigation',()=>{
 const html=read('independent-assurance.html');
 const caseStart=html.indexOf('class="assurance-example"');
 const navStart=html.indexOf('<nav class="simple-steps"');
 assert.ok(caseStart>0&&caseStart<navStart,'case leads before chapter selector');
 for(const phrase of ['START HERE / ONE FICTIONAL PR','shared-library','AI REVIEWER A','AI REVIEWER B','DETERMINISTIC ELIGIBILITY','Financial dependency identified','HUMAN REVIEW REQUIRED','human approval path','Illustrative result']){
  assert.ok(html.includes(phrase),phrase);
 }
 assert.match(html,/href="\.\/auditor-view\.html#billing-challenge-lab">Challenge the decision/);
 assert.match(html,/href="#foundational-controls">See what must be tested/);
 assert.match(html,/href="\.\/rcm-view\.html#download-current-rcm">Inspect the proposed controls/);
 assert.equal(html.split('class="assurance-example"').length-1,1,'one case only');
 assert.match(html,/id="shared-case-root" hidden/,'case model mount is retained');
});
