const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('RCM view includes complete proposed inventory and seven domains',()=>{
 const page=read('rcm-view.html');const match=page.match(/const controls=(\[[\s\S]*?\]);\s*const domainEl=/);assert.ok(match,'control registry exists');
 const controls=JSON.parse(match[1]);assert.equal(controls.length,15);assert.equal(new Set(controls.map(x=>x.id)).size,15);assert.equal(new Set(controls.map(x=>x.domain)).size,7);
 for(const c of controls){for(const k of ['risk','activity','evidence','test','framework','scenario'])assert.ok(c[k],c.id+' missing '+k);assert.match(c.id,/^AI-\d{2}$/);assert.ok(['pass','split','scope','canary'].includes(c.scenario))}
 assert.match(page,/textContent=text/,'dynamic control content uses textContent');
});
test('Assurance entry and Auditor View preserve both views and testing guide',()=>{
 const landing=read('independent-assurance.html'),reference=read('assurance-procedures-reference.html'),auditor=read('auditor-view.html');
 assert.match(landing,/href="\.\/rcm-view\.html#[^"]+"/);assert.match(landing,/href="\.\/auditor-view\.html#billing-challenge-lab"/);
 assert.doesNotMatch(landing,/href="\.\/assurance-procedures-reference\.html#testing-guide"/);
 assert.match(landing,/id="test-approval"/);assert.match(reference,/id="assurance-matrix-body"/);
 assert.match(reference,/id="matrix-details"/);assert.match(reference,/id="matrix-download"/);
 assert.match(reference,/src="\.\/assurance-matrix\.js\?v=1"/);
 assert.doesNotMatch(landing,/id="stage-pickers"|id="test-detail"/,'replaced stage selector is no longer rendered');
 assert.match(auditor,/href="\.\/rcm-view\.html"/);assert.match(auditor,/initialScenario/);
});
test('RCM detail cells wrap and the skip link targets the focusable content intro',()=>{
 const page=read('rcm-view.html');
 assert.match(page,/\.rcm-table td:nth-child\(1\):not\(\[colspan\]\)[^{]*\{[^}]*white-space:nowrap/);
 assert.match(page,/<a class="site-skip" href="#main-content">Skip to content<\/a>/);
 assert.match(page,/<header class="rcm-intro" id="main-content" tabindex="-1">/);
});

test('Assurance matrix preserves all seven stages, full procedure text and stage mappings',()=>{
 const data=require('../assurance-data.js');
 const matrix=read('assurance-matrix.js');
 assert.equal(data.stages.length,7);
 assert.equal(data.areas.length,9);
 assert.equal(data.areas.reduce((n,a)=>n+a.steps.length,0),45);
 const mapped=data.stages.reduce((n,_,i)=>n+data.areas.filter(a=>a.stages.includes(i)).reduce((sum,a)=>sum+a.steps.length,0),0);
 assert.equal(mapped,140);
 assert.match(matrix,/a\.steps\.forEach\(t=>ol\.append\(node\('li',t\)\)\)/,'full procedure text is rendered');
 assert.match(matrix,/a\.steps\.forEach\(\(step,n\)=>rows\.push/,'CSV uses the same full procedure library');
 for(let i=0;i<data.stages.length;i++)assert.ok(data.areas.some(a=>a.stages.includes(i)),'stage '+(i+1)+' has supporting areas');
});

