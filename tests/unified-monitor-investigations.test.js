const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('archived references still point to Assurance while current Assurance footer follows Monitoring',()=>{
 const risks=read('risk-controls.html'),matrix=read('control-matrix.html'),assurance=read('independent-assurance.html');
 for(const [file,html] of [['Risks',risks],['Control Matrix',matrix]]){
  const footer=html.slice(html.lastIndexOf('<footer'),html.indexOf('</footer>',html.lastIndexOf('<footer'))+9);
  assert.match(footer,/href="\.\/independent-assurance\.html"/,file+' should link to Assurance');
  assert.doesNotMatch(footer,/href="\.\/continuous-monitoring\.html"/,file+' must not loop to Monitoring');
 }
 const footer=assurance.slice(assurance.lastIndexOf('<footer'),assurance.indexOf('</footer>',assurance.lastIndexOf('<footer'))+9);
 assert.match(footer,/href="\.\/continuous-monitoring\.html"/);
 assert.doesNotMatch(footer,/href="\.\/risk-controls\.html"/);
});
test('advanced Monitoring investigations and working interactions migrated into unified page',()=>{
 const page=read('engineering-blueprint.html'),renderer=read('unified-monitoring.js');
 for(const text of ['id="worked-examples"','Approved demo-01. Deployed demo-02.','24 / 24 records','id="eng-data"','id="event-detail"','id="investigate"','id="resolve"','id="trace"','data-event="0"'])assert.ok(page.includes(text),'missing '+text);
 assert.match(renderer,/document\.getElementById\('worked-examples'\)/);
 assert.match(page,/revealLinkedResource\(\)/);
 assert.match(page,/section\.open=true/);
 assert.match(page,/section\.scrollIntoView/);
 assert.match(renderer,/investigations\.hidden=active!==6/);
 assert.match(renderer,/if\(active!==6\)investigations\.open=false/);
 assert.match(page,/document\.querySelector\('\[data-event="0"\]'\)\.click\(\)/);
});
test('legacy deep link opens migrated exercises at stage 7 and shared case links stay on legacy page',()=>{
 const page=read('continuous-monitoring.html');
 assert.match(page,/if\(location\.hash\.startsWith\('#case='\)\)return/);
 assert.match(page,/\['#worked-examples','#monitoring-use-notes','#ci-canary-monitoring'\]\.includes\(location\.hash\)/);
 assert.match(page,/if\(fragment==='#worked-examples'\)stage='6'/);
 assert.match(page,/location\.replace\('\.\/engineering-blueprint\.html\?stage='\+stage\+'&view=monitor'\+fragment\)/);
});

test('remaining monitoring setup and CI/canary guidance are retained with deep links',()=>{
 const page=read('engineering-blueprint.html'),legacy=read('continuous-monitoring.html');
 for(const id of ['monitoring-use-notes','ci-canary-monitoring']){assert.ok(page.includes('id="'+id+'"'));assert.ok(legacy.includes("'#"+id+"'"));}
 for(const phrase of ['Define the population, processing window, threshold, owner and closure evidence','Reconcile against independent merge and deployment sources','Required CI and canary outcomes'])assert.ok(page.includes(phrase),phrase);
});
test('coverage warning has readable foreground and navigation discards stale monitoring fragments',()=>{
 const page=read('engineering-blueprint.html');
 assert.match(page,/\.unified-monitor p#coverage-note\.label\{color:#16332f!important\}/);
 assert.match(page,/if\(\['#worked-examples','#monitoring-use-notes','#ci-canary-monitoring'\]\.includes\(u\.hash\)\)u\.hash=''/);
 assert.match(page,/if\(\['#worked-examples','#monitoring-use-notes','#ci-canary-monitoring'\]\.includes\(url\.hash\)\)url\.hash=''/);
 assert.match(page,/legacyMonitoringFragments=new Set\(\['worked-examples','monitoring-use-notes','ci-canary-monitoring'\]\)/);
});
