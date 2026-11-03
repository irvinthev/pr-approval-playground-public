const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('four chapter footers advance from Risks and Controls to Assurance',()=>{
 const risks=read('risk-controls.html'),matrix=read('control-matrix.html'),assurance=read('independent-assurance.html');
 for(const [file,html] of [['Risks',risks],['Control Matrix',matrix]]){
  const footer=html.slice(html.lastIndexOf('<footer'),html.indexOf('</footer>',html.lastIndexOf('<footer'))+9);
  assert.match(footer,/href="\.\/independent-assurance\.html"/,file+' should link to Assurance');
  assert.doesNotMatch(footer,/href="\.\/continuous-monitoring\.html"/,file+' must not loop to Monitoring');
 }
 const footer=assurance.slice(assurance.lastIndexOf('<footer'),assurance.indexOf('</footer>',assurance.lastIndexOf('<footer'))+9);
 assert.match(footer,/href="\.\/risk-controls\.html"/);
 assert.doesNotMatch(footer,/href="\.\/continuous-monitoring\.html"/);
});
test('advanced Monitoring investigations and working interactions migrated into unified page',()=>{
 const page=read('engineering-blueprint.html'),renderer=read('unified-monitoring.js');
 for(const text of ['id="worked-examples"','Approved demo-01. Deployed demo-02.','24 / 24 records','id="eng-data"','id="event-detail"','id="investigate"','id="resolve"','id="trace"','data-event="0"'])assert.ok(page.includes(text),'missing '+text);
 assert.match(page,/document\.getElementById\('worked-examples'\)/);
 assert.match(page,/revealLegacyInvestigation\(\)/);
 assert.match(page,/section\.open=true/);
 assert.match(page,/section\.scrollIntoView/);
 assert.match(renderer,/investigations\.hidden=active!==6/);
 assert.match(renderer,/if\(active!==6\)investigations\.open=false/);
 assert.match(page,/document\.querySelector\('\[data-event="0"\]'\)\.click\(\)/);
});
test('legacy deep link opens migrated exercises at stage 7 and shared case links stay on legacy page',()=>{
 const page=read('continuous-monitoring.html');
 assert.match(page,/if\(location\.hash\.startsWith\('#case='\)\)return/);
 assert.match(page,/location\.hash==='#worked-examples'/);
 assert.match(page,/if\(investigation\)stage='6'/);
 assert.match(page,/investigation\?'#worked-examples'/);
});
