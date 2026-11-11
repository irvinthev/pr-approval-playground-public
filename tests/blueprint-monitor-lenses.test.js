const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('Engineering owns the build experience and Monitoring owns operational investigations',()=>{
 const engineering=read('engineering-blueprint.html'),monitor=read('continuous-monitoring.html');
 for(const id of ['technical-requirements','build-view','stages','stage-monitor-link','required-ci','progressive-rollout'])assert.ok(engineering.includes('id="'+id+'"'),id);
 for(const id of ['monitor-view','view-monitor','mon-signal-cards','worked-examples','eng-data'])assert.ok(!engineering.includes('id="'+id+'"'),'unexpected duplicate '+id);
 for(const id of ['monitoring-guide','stage-pickers','worked-examples','eng-data','event-detail','monitoring-use-notes','ci-canary-monitoring'])assert.ok(monitor.includes('id="'+id+'"'),id);
 assert.doesNotMatch(engineering,/src="\.\/unified-monitoring\.js"/);
 assert.doesNotMatch(engineering,/src="\.\/monitoring-data\.js"/);
 assert.doesNotMatch(engineering,/renderUnifiedMonitor\(/);
 assert.match(monitor,/src="\.\/monitoring\.js\?v=shared-1"/);
});
test('Engineering preserves stage deep links, resource content and legacy Monitoring redirects',()=>{
 const page=read('engineering-blueprint.html');
 assert.match(page,/id="delivery-roadmap"/);
 assert.match(page,/id="full-build-checklist"/);
 assert.match(page,/Implementation details, sourcing and integrations/);
 assert.match(page,/location\.replace\('\.\/continuous-monitoring\.html\?stage='/);
 assert.match(page,/const legacy=\['worked-examples','monitoring-use-notes','ci-canary-monitoring'\]/);
 assert.match(page,/function revealLinkedResource\(\)/);
});
