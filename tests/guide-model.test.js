const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const G=require('../guide-model');
test('exactly three shared examples and no example claims a deployment',()=>{
 assert.equal(Object.keys(G.scenarios).length,3);
 for(const id of Object.keys(G.scenarios)){const r=G.evaluate(id);assert.equal(r.deployment,'Not deployed');assert.notEqual(r.release,'ELIGIBLE');}
});
test('protected downstream dependency overrides two favorable AI ratings',()=>{
 const r=G.evaluate('protected');assert.equal(r.reviewA,'LOW');assert.equal(r.reviewB,'LOW');assert.equal(r.scope,'REVIEW_REQUIRED');assert.equal(r.automatic,false);assert.equal(r.release,'Awaiting human approval');
});
test('one nonqualifying AI review with otherwise eligible scope cannot auto-approve',()=>{
 const r=G.evaluate('review');assert.equal(r.scope,'ELIGIBLE');assert.equal(r.reviewB,'HIGH');assert.equal(r.automatic,false);assert.equal(r.route,'Human approval required');
});
test('happy path establishes only auto-approval eligibility; downstream checks are pending',()=>{
 const r=G.evaluate('happy');assert.equal(r.automatic,true);assert.equal(r.release,'Pending build and release checks');
});
test('navigation inputs stay bounded and do not affect conclusions',()=>{
 for(const q of ['?scenario=__proto__&step=-1','?scenario=<script>&step=700','?step=NaN'])assert.deepEqual(G.selection(q),{scenario:'happy',stage:0});
 const before=G.evaluate('protected');for(let step=0;step<7;step++){G.selection('?scenario=protected&step='+step);assert.deepEqual(G.evaluate('protected'),before);}
});
test('every stage names a monitor, responsible owner, response, evidence and audit test',()=>{
 assert.equal(G.stages.length,7);for(const s of G.stages)for(const key of ['monitor','owner','response','evidence','test','control'])assert.ok(s[key]?.length>10,s.title+' '+key);
 const ui=fs.readFileSync(require.resolve('../field-guide.js'),'utf8');assert.match(ui,/monitor-summary/);assert.match(ui,/Detection does not prove a release was blocked/);
});
