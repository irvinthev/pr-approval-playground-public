const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const page=fs.readFileSync(path.join(__dirname,'..','engineering-blueprint.html'),'utf8');
test('Enforcement journey precedes the preserved Engineering implementation details',()=>{
 const start=page.indexOf('id="engineering-build-plan"'),explore=page.indexOf('id="technical-requirements"');
 assert.ok(start>=0&&explore>start);
 const plan=page.slice(start,explore);
 assert.match(plan,/From AI recommendation to enforceable change/);
 for(const text of ['Keep unsafe scope out','Use AI as a signal','Authorize independently','Protect the merge','Protect production'])assert.ok(plan.includes(text),text);
 for(const text of ['Automated approval','Human code review','Both routes rejoin','Human approval never waives mandatory CI'])assert.ok(plan.includes(text),text);
 assert.equal((page.match(/data-build-stage="[1-7]"/g)||[]).length,7);
 for(let i=0;i<7;i++)assert.ok(page.includes('engineering-blueprint.html?stage='+i+'#technical-requirements'));
 assert.match(page,/Canonical seven-stage implementation checklist/);
 assert.ok(page.indexOf('id="rr02-negative-test"')>explore);
 assert.ok(page.indexOf('id="supporting-resources"')>page.indexOf('id="rr02-negative-test"'));
 assert.match(page,/id="risk-stage-context" data-perspective="engineering"/);
 assert.doesNotMatch(page,/id="stage-swipe-hint"/);
 assert.match(page,/id="delivery-roadmap"/);
 assert.match(page,/id="rr02-run-negative-test"/);
});
test('Build plan keeps accessible mobile summaries and original interactive chapters',()=>{
 assert.match(page,/build-plan__mobile-label/);
 assert.match(page,/@media\(max-width:800px\)/);
 for(const id of ['technical-requirements','build-view','stage-monitor-link','supporting-resources','required-ci','progressive-rollout'])assert.ok(page.includes('id="'+id+'"'),id);
 assert.match(page,/<h2>Inspect the selected stage<\/h2>/);
 assert.match(page,/<p class="engineering-original-stage-label">Engineering implementation &amp; validation<\/p>/);
 assert.match(page,/<summary>Full implementation checklist/);
 const link=page.indexOf('id="stage-monitor-link"'),stageButtons=page.indexOf('id="stages"');
 assert.ok(link>=0&&stageButtons>link,'Dedicated Monitoring link precedes the retained legacy anchor');
});
