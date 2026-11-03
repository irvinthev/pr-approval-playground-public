const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('one page owns Build and Monitor lenses and one stage selector',()=>{
 const page=read('engineering-blueprint.html'),monitor=read('unified-monitoring.js');
 for(const id of ['view-build','view-monitor','build-view','monitor-view','stages','mon-signal-cards'])assert.match(page,new RegExp('id="'+id+'"'));
 assert.match(page,/src="\.\/monitoring-data\.js"/);assert.match(page,/src="\.\/monitoring-examples\.js"/);assert.match(page,/src="\.\/unified-monitoring\.js"/);
 assert.match(page,/if\(window\.renderUnifiedMonitor\)window\.renderUnifiedMonitor\(active\)/);
 assert.match(page,/new URLSearchParams\(location\.search\)\.get\('view'\)/);
 assert.match(monitor,/root\.renderUnifiedMonitor=function\(stage\)/);
 assert.doesNotMatch(monitor,/stage-pickers|monitor-blueprint-link/);
});
test('technical depth and interactive examples retained; old monitoring links migrate',()=>{
 const page=read('engineering-blueprint.html'),legacy=read('continuous-monitoring.html');
 for(const label of ['id="technical-requirements"','id="required-ci"','Full implementation checklist','Sourcing, integrations and technical detail'])assert.ok(page.includes(label),label);
 for(const label of ['Normal sample','Exception sample','Purpose, evidence and owner response','Exercise this monitor'])assert.ok(read('unified-monitoring.js').includes(label),label);
 assert.match(legacy,/location\.replace\('\.\/engineering-blueprint\.html\?stage='/);
 assert.match(legacy,/location\.hash\.startsWith\('#case='\)/);
});
