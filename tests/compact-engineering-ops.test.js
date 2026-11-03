const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const page=fs.readFileSync(path.join(__dirname,'..','engineering-blueprint.html'),'utf8');
test('compact layout prioritizes stage and lens before optional resources',()=>{
 const stage=page.indexOf('id="technical-requirements"'),tabs=page.indexOf('id="view-build"'),triad=page.indexOf('class="core-triad"'),resource=page.indexOf('id="supporting-resources"');
 assert.ok(stage>=0&&tabs>stage&&triad>tabs&&resource>triad);
 assert.ok(!page.includes('1. Start with the workflow</h2>'),'duplicate workflow chapter must not precede selector');
 for(const field of ['id="needed"','id="implement"','id="tests"'])assert.ok(page.includes(field));
 for(const field of ['id="architecture-name"','id="required-ci"','id="progressive-rollout"','Full implementation checklist'])assert.ok(page.includes(field),'retained '+field);
});
test('monitor resources stay scoped to monitor lens with interactive investigations retained',()=>{
 assert.match(page,/class="resource-item monitor-only" hidden/);
 assert.match(page,/document\.querySelectorAll\('\.monitor-only'\)\.forEach\(x=>x\.hidden=view!=='monitor'\)/);
 for(const field of ['id="worked-examples"','id="monitoring-use-notes"','id="ci-canary-monitoring"','id="mon-signal-cards"','id="event-detail"'])assert.ok(page.includes(field),'retained '+field);
});
test('responsive layout keeps the two view controls and stage strip near top',()=>{
 assert.match(page,/#technical-requirements>\.stages\{display:flex;flex-wrap:nowrap/);
 assert.match(page,/\.unified-tabs\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(page,/\.core-triad,\.resource-grid\{grid-template-columns:1fr\}/);
 assert.match(page,/function revealLinkedResource\(\)/);
});
