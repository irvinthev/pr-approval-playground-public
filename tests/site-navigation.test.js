const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=['index.html','experience.html','engineering-blueprint.html','risk-controls.html','control-matrix.html','continuous-monitoring.html','independent-assurance.html','auditor-view.html','playground.html'];
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
test('published pages share the four-chapter navigation with accurate page or reference context',()=>{
 const targets=['index.html','experience.html','engineering-blueprint.html','risk-controls.html','independent-assurance.html'];
 for(const page of pages){const html=read(page),nav=html.match(/<nav class="site-chapters"[^>]*>([\s\S]*?)<\/nav>/);assert.ok(nav,page);
 const hrefs=[...nav[1].matchAll(/href="\.\/([^"#?]+)"/g)].map(m=>m[1]);assert.deepEqual(hrefs,targets,page);
 const active=[...nav[1].matchAll(/href="([^"]+)"[^>]*aria-current="(page|location)"/g)];
 if(page==='continuous-monitoring.html'){assert.equal(active.length,1,page);assert.equal(active[0][1],'./engineering-blueprint.html');assert.equal(active[0][2],'location');}
 else if(targets.includes(page)){assert.equal(active.length,1,page);assert.equal(active[0][1],'./'+page);assert.equal(active[0][2],'page');}
 else if(page==='auditor-view.html'){assert.equal(active.length,1);assert.equal(active[0][1],'./independent-assurance.html');assert.equal(active[0][2],'location');}
 else if(page==='control-matrix.html'){assert.equal(active.length,1);assert.equal(active[0][1],'./risk-controls.html');assert.equal(active[0][2],'location');}
 else {assert.equal(active.length,0);assert.match(html,/class="site-experiments"[^>]*aria-current="page"/);}
 }
});
test('static local links and fragment destinations resolve',()=>{for(const page of pages){for(const match of read(page).matchAll(/href="([^"]+)"/g)){const u=new URL(match[1],'https://example.test/'+page);if(u.origin!=='https://example.test')continue;const file=decodeURIComponent(u.pathname.slice(1));assert.ok(fs.existsSync(path.join(root,file)),page+' → '+match[1]);if(u.hash){const id=decodeURIComponent(u.hash.slice(1));assert.ok(read(file).includes('id="'+id+'"'),page+' → '+match[1]);}}}});
test('homepage offers four practitioner lenses and a separate pipeline entry',()=>{
 const html=read('index.html');
 const section=html.match(/<section class="lens-section"[^>]*>([\s\S]*?)<\/section>/);
 assert.ok(section,'practitioner lens section must exist');
 const targets=[...section[1].matchAll(/<a class="lens-card" href="\.\/([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(targets,['engineering-blueprint.html','risk-controls.html','independent-assurance.html','control-matrix.html']);
 assert.match(html,/<a class="guide-action" href="#workflow">Explore the workflow/);
 assert.match(html,/<a class="guide-action" href="\.\/engineering-blueprint.html">View the engineering blueprint/);
});
test('homepage maintains eight stages and four distinct example outcomes',()=>{
 const html=read('index.html');
 const stages=[...html.matchAll(/<button class="workflow-stage"[^>]*data-stage="(\d+)"/g)].map(m=>Number(m[1]));
 assert.deepEqual(stages,[0,1,2,3,4,5,6,7]);
 const scenarios=[...html.matchAll(/<button type="button" data-scenario="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(scenarios,['pass','split','excluded','canary']);
 assert.match(html,/AI classification, formal authorization, and release eligibility are separate decisions/);
 assert.match(html,/Human approval is an alternative route, not a second AI submission/);
});

