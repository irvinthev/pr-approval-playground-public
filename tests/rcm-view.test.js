const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('new RCM viewer loads the single canonical catalog and documents scope of illustrative controls',()=>{
 const page=read('rcm-view.html'),catalog=read('assurance-catalog.js');
 assert.match(page,/src="\.\/assurance-catalog\.js"/);
 assert.match(page,/window\.AssuranceCatalog/);
 assert.match(page,/id="catalog"/);
 assert.match(page,/No directly connected demonstration yet/);
 assert.match(catalog,/const controls=/);
 assert.match(page,/not ten implemented controls/i);
});
test('Assurance entry and Auditor View preserve both views and testing guide',()=>{
 const landing=read('independent-assurance.html'),reference=read('assurance-procedures-reference.html'),auditor=read('auditor-view.html');
 assert.match(landing,/href="\.\/rcm-view\.html#[^"]+"/);assert.match(landing,/href="\.\/auditor-view\.html#billing-challenge-lab"/);
 assert.match(landing,/href="\.\/assurance-procedures-reference\.html#testing-guide"/);
 assert.match(landing,/id="test-approval"/);assert.match(reference,/id="assurance-matrix-body"/);
 assert.match(reference,/id="matrix-details"/);assert.match(reference,/id="matrix-download"/);
 assert.match(reference,/src="\.\/assurance-matrix\.js\?v=1"/);
 assert.doesNotMatch(landing,/id="stage-pickers"|id="test-detail"/,'replaced stage selector is no longer rendered');
 assert.match(auditor,/href="\.\/rcm-view\.html"/);assert.match(auditor,/initialScenario/);
});
test('replacement RCM has responsive detail layout, focusable skip link and explicit export',()=>{
 const page=read('rcm-view.html');
 assert.match(page,/\.detail\{display:none/);
 assert.match(page,/@media\(max-width:800px\)/);
 assert.match(page,/<a class="site-skip" href="#main-content">Skip to content<\/a>/);
 assert.match(page,/<header id="main-content" class="intro" tabindex="-1">/);
 assert.match(page,/id="export"/);
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

