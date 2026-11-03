const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('Blueprint and Monitoring offer stage-aware reciprocal lenses',()=>{
 const blueprint=read('engineering-blueprint.html'),monitoring=read('continuous-monitoring.html'),monitorJS=read('monitoring.js');
 assert.match(blueprint,/id="blueprint-monitor-link"/);
 assert.match(blueprint,/initialStageParam=new URLSearchParams\(location\.search\)\.get\('stage'\)/);
 assert.match(blueprint,/\^\[0-6\]\$/);
 assert.match(blueprint,/monitoring\.html\?stage='\+active\+'#monitoring-guide'/);
 assert.match(blueprint,/history\.replaceState\(null,'',url\)/);
 assert.match(monitoring,/id="monitor-blueprint-link"/);
 assert.match(monitoring,/Why these monitoring signals matter/);
 assert.match(monitorJS,/monitor-blueprint-link/);
 assert.match(monitorJS,/engineering-blueprint\.html\?stage='\+active\+'#technical-requirements'/);
});
test('Two-lens change retains Blueprint guidance and worked Monitoring examples',()=>{
 const blueprint=read('engineering-blueprint.html'),monitoring=read('continuous-monitoring.html');
 for(const item of ['id="technical-requirements"','id="required-ci"','Full implementation checklist']) assert.ok(blueprint.includes(item),item);
 for(const item of ['id="monitoring-guide"','id="signal-cards"','monitoring-examples.js','id="stage-pickers"']) assert.ok(monitoring.includes(item),item);
});
