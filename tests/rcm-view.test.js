const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('RCM view includes complete proposed inventory and seven domains',()=>{
 const page=read('rcm-view.html');const match=page.match(/const controls=(\[[\s\S]*?\]);\s*const domainEl=/);assert.ok(match,'control registry exists');
 const controls=JSON.parse(match[1]);assert.equal(controls.length,15);assert.equal(new Set(controls.map(x=>x.id)).size,15);assert.equal(new Set(controls.map(x=>x.domain)).size,7);
 for(const c of controls){for(const k of ['risk','activity','evidence','test','framework','scenario'])assert.ok(c[k],c.id+' missing '+k);assert.match(c.id,/^AI-\d{2}$/);assert.ok(['pass','split','scope','canary'].includes(c.scenario))}
 assert.match(page,/textContent=text/,'dynamic control content uses textContent');
});
test('Assurance entry and Auditor View preserve both views and testing guide',()=>{
 const landing=read('independent-assurance.html'),auditor=read('auditor-view.html');
 assert.match(landing,/href="\.\/rcm-view\.html"/);assert.match(landing,/href="\.\/auditor-view\.html"/);
 assert.match(landing,/id="test-approval"/);assert.match(landing,/id="test-detail"/);
 assert.match(auditor,/href="\.\/rcm-view\.html"/);assert.match(auditor,/initialScenario/);
});
