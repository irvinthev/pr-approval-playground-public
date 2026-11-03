const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const page=fs.readFileSync(path.join(__dirname,'..','engineering-blueprint.html'),'utf8');
test('Engineering build plan is visible ahead of interactive stage selector',()=>{
 const start=page.indexOf('id="engineering-build-plan"'),explore=page.indexOf('id="technical-requirements"');
 assert.ok(start>=0&&explore>start);
 const plan=page.slice(start,explore);
 assert.match(plan,/How would we actually build this\?/);
 assert.equal((plan.match(/data-build-stage="[1-7]"/g)||[]).length,7);
 for(let i=0;i<7;i++)assert.ok(plan.includes('engineering-blueprint.html?stage='+i+'#technical-requirements'));
 for(const label of ['What Engineering implements','Done when','Automated approval','Human code review','Both routes rejoin','Human approval never waives mandatory CI'])assert.ok(plan.includes(label),label);
 assert.match(plan,/does not call GitHub APIs/);
});
test('Build plan keeps accessible mobile summaries and original interactive chapters',()=>{
 assert.match(page,/build-plan__mobile-label/);
 assert.match(page,/@media\(max-width:800px\)/);
 for(const id of ['view-build','view-monitor','technical-requirements','monitor-view','supporting-resources','required-ci','progressive-rollout'])assert.ok(page.includes('id="'+id+'"'),id);
 assert.match(page,/<h2>Engineering stage explorer<\/h2>/);
 assert.match(page,/<summary>Full implementation checklist/);
 const mode=page.indexOf('id="view-build"'),stageButtons=page.indexOf('id="stages"');
 assert.ok(mode>=0&&stageButtons>mode,'Build/Operate modes precede stage selection');
});
