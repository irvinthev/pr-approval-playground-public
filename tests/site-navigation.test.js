const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=['index.html','experience.html','engineering-blueprint.html','risk-controls.html','control-matrix.html','continuous-monitoring.html','independent-assurance.html','auditor-view.html','playground.html'];
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
test('published pages share the three-page navigation with accurate page or reference context',()=>{
 const targets=['index.html','engineering-blueprint.html','independent-assurance.html'];
 for(const page of pages){const html=read(page),nav=html.match(/<nav class="site-chapters"[^>]*>([\s\S]*?)<\/nav>/);assert.ok(nav,page);
 const hrefs=[...nav[1].matchAll(/href="\.\/([^"#?]+)"/g)].map(m=>m[1]);assert.deepEqual(hrefs,targets,page);
 const active=[...nav[1].matchAll(/href="([^"]+)"[^>]*aria-current="(page|location)"/g)];
 if(targets.includes(page)){assert.equal(active.length,1,page);assert.equal(active[0][1],'./'+page);assert.equal(active[0][2],'page');}
 else if(['experience.html','continuous-monitoring.html','auditor-view.html','control-matrix.html','risk-controls.html'].includes(page)){assert.equal(active.length,1);assert.equal(active[0][1],['experience.html','continuous-monitoring.html'].includes(page)?'./index.html':'./independent-assurance.html');assert.equal(active[0][2],'location');}
 else {assert.equal(active.length,0);assert.match(html,/class="site-experiments"[^>]*aria-current="page"/);}
 }
});
test('static local links and fragment destinations resolve',()=>{for(const page of pages){for(const match of read(page).matchAll(/href="([^"]+)"/g)){const u=new URL(match[1],'https://example.test/'+page);if(u.origin!=='https://example.test')continue;const file=decodeURIComponent(u.pathname.slice(1));assert.ok(fs.existsSync(path.join(root,file)),page+' → '+match[1]);if(u.hash){const id=decodeURIComponent(u.hash.slice(1));assert.ok(read(file).includes('id="'+id+'"'),page+' → '+match[1]);}}}});
test('homepage uses one scenario-driven experience rather than duplicate chapter cards',()=>{const html=read('index.html');assert.match(html,/id="guide-app"[^>]*data-page="field"/);assert.doesNotMatch(html,/class="chapters"/);assert.match(html,/Monitor catalog/);});
