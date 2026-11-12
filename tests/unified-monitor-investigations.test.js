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
});
test('Dedicated Monitoring retains both interactive cases and population testing',()=>{
 const monitoring=read('continuous-monitoring.html'),js=read('monitoring.js');
 for(const id of ['worked-examples','eng-data','event-detail','investigate','resolve','trace','coverage','monitoring-use-notes','ci-canary-monitoring','stage-pickers'])assert.ok(monitoring.includes('id="'+id+'"'),id);
 for(const item of ['Approved demo-01. Deployed demo-02.','24 / 24 records','24 / 25','data-event="0"'])assert.ok(monitoring.includes(item),item);
 assert.match(js,/examples\.hidden=active!==6/);
 assert.match(js,/location\.hash==='#worked-examples'/);
 assert.match(monitoring,/src="\.\/monitoring\.js\?v=shared-1"/);
});
test('Old Engineering monitoring bookmarks redirect to their counterpart on Monitoring',()=>{
 const engineering=read('engineering-blueprint.html');
 assert.match(engineering,/const fragment=location\.hash\.slice\(1\)/);
 assert.match(engineering,/params\.get\('view'\)!=='monitor'/);
 assert.match(engineering,/fragment==='worked-examples'\?6/);
 assert.match(engineering,/location\.replace\('\.\/continuous-monitoring\.html\?stage='/);
 for(const id of ['worked-examples','monitoring-use-notes','ci-canary-monitoring'])assert.ok(read('continuous-monitoring.html').includes('id="'+id+'"'),id);
 assert.doesNotMatch(engineering,/id="monitor-view"|src="\.\/unified-monitoring\.js"/);
});
test('Engineering retains technical resource links while Monitoring owns CI/canary guidance',()=>{
 const engineering=read('engineering-blueprint.html'),monitoring=read('continuous-monitoring.html');
 for(const id of ['required-ci','progressive-rollout','supporting-resources'])assert.ok(engineering.includes('id="'+id+'"'),id);
 for(const id of ['monitoring-use-notes','ci-canary-monitoring'])assert.ok(monitoring.includes('id="'+id+'"'),id);
 assert.match(monitoring,/href="\.\/engineering-blueprint\.html\?stage=0#risk-stage-context"/);
 assert.match(monitoring,/<span id="stage-pickers" hidden aria-hidden="true"><\/span>/);
});
