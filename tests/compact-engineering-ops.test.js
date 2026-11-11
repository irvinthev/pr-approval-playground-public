const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const page=fs.readFileSync(path.join(__dirname,'..','engineering-blueprint.html'),'utf8');
test('Engineering build plan precedes stage explorer and optional references',()=>{
 const build=page.indexOf('id="engineering-build-plan"'),stage=page.indexOf('id="technical-requirements"'),triad=page.indexOf('class="core-triad"'),resource=page.indexOf('id="supporting-resources"');
 assert.ok(build>=0&&stage>build&&triad>stage&&resource>triad);
 for(const field of ['id="needed"','id="implement"','id="tests"','id="architecture-name"','id="required-ci"','id="progressive-rollout"','Full implementation checklist'])assert.ok(page.includes(field),field);
});
test('Legacy Monitoring does not duplicate DOM or runtime on Engineering',()=>{
 for(const field of ['id="monitor-view"','id="worked-examples"','id="monitoring-use-notes"','id="ci-canary-monitoring"','id="mon-signal-cards"','id="event-detail"','id="view-monitor"'])assert.ok(!page.includes(field),'duplicate '+field);
 assert.doesNotMatch(page,/src="\.\/unified-monitoring\.js"/);
 assert.doesNotMatch(page,/document\.querySelector\('\[data-event="0"\]'\)\.click\(\)/);
});
test('Responsive build stage selector and retained resource deep links remain present',()=>{
 assert.match(page,/#technical-requirements>\.stages\{display:flex;flex-wrap:nowrap/);
 assert.match(page,/\.core-triad,\.resource-grid\{grid-template-columns:1fr\}/);
 assert.match(page,/function revealLinkedResource\(\)/);
 assert.match(page,/engineeringResources=new Set\(\['required-ci','progressive-rollout','supporting-resources'\]\)/);
});
