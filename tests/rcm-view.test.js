const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('RCM view includes complete proposed inventory and six common domains',()=>{
 const page=read('rcm-view.html');const match=page.match(/const controls=(\[[\s\S]*?\]);\s*const searchEl=/);assert.ok(match,'control registry exists');
 const controls=JSON.parse(match[1]);assert.equal(controls.length,15);assert.equal(new Set(controls.map(x=>x.id)).size,15);assert.equal(new Set(controls.map(x=>x.domain)).size,6);
 for(const c of controls){for(const k of ['risk','activity','evidence','test','framework','scenario'])assert.ok(c[k],c.id+' missing '+k);assert.match(c.id,/^AI-\d{2}$/);assert.ok(['pass','split','scope','canary'].includes(c.scenario))}
 assert.match(page,/node.textContent=value/,'dynamic control content uses textContent');
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


test('common-domain RCM retains stable IDs and separate risk, objective, description and testing',()=>{
 const page=read('rcm-view.html');const controls=JSON.parse(page.match(/const controls=(\[[\s\S]*?\]);\s*const searchEl=/)[1]);
 assert.equal(controls.length,15);
 for(const c of controls){
  for(const field of ['domain','engineeringArea','engineeringStage','risk','objective','activity','nature','trigger','evidence','test','frameworkRelationship','applicability'])assert.ok(c[field],c.id+' missing '+field);
  assert.notEqual(c.title,c.objective,c.id+' uses a label as objective');
  assert.match(c.frameworkRelationship,/support|adapt|practice|principle|audit consideration|audit testing/i);
 }
 assert.match(page,/id="rcm-domain-cards"/);
 assert.match(page,/data-label/);
 assert.match(page,/How would we evaluate this\?/);
 assert.match(page,/Explore common DevOps control domains/);
 assert.match(page,/not a compliance determination/i);
 assert.match(page,/detailRow\.hidden=!open/,'expand/collapse preserved');
 assert.match(page,/location\.hash==='#control-'\+c\.id/,'control deep links preserved');
 assert.match(page,/@media\(max-width:700px\)/,'mobile card view');
});
test('compact RCM gives each control a distinct, specific testing procedure without duplicating its objective',()=>{
 const page=read('rcm-view.html');
 const ids=JSON.parse(page.match(/const controls=(\[[\s\S]*?\]);\s*const searchEl=/)[1]).map(x=>x.id);
 assert.match(page,/const controlTests=/);
 const tests=JSON.parse(page.match(/const controlTests=(\{[\s\S]*?\});\s*function add/)[1]);
 assert.deepEqual(Object.keys(tests).sort(),ids.sort());
 for(const [id,steps] of Object.entries(tests)){assert.equal(steps.length,3,id);assert.ok(steps.every(x=>x.length>45),id)}
 assert.match(page,/entry\(detail,'Engineering safeguard',c\.activity\)/);
 assert.match(page,/entry\(detail,'Evidence \/ IPE',c\.evidence\)/);
 assert.doesNotMatch(page,/entry\(grid,'Risk statement'/);
 assert.doesNotMatch(page,/Existing test prompt/);
 assert.doesNotMatch(page,/id="domain"/,'single domain selector is the card group');
 assert.doesNotMatch(page,/rcm-domain-all"/,'no duplicate All Controls card');
 assert.match(page,/id="rcm-clear-filter"/,'clear filter still available');
 assert.match(page,/selectedDomain===name\?'':name/,'selecting a card twice clears selection');
 assert.match(page,/A simulated rejection does not establish production enforcement/);
 assert.match(page,/approve revision A; push revision B; attempt merge with A/);
 assert.match(page,/Independently establish approval and policy-configuration populations/);
 assert.match(page,/Open related Engineering \/ Assurance example|Explore related Engineering \/ Assurance example/);
 const control=JSON.parse(page.match(/const controls=(\[[\s\S]*?\]);\s*const searchEl=/)[1]).find(x=>x.id==='AI-09');
 assert.equal(control.title,'Human Approval & Escalation');
});


test('RCM authority focus is non-exclusive and preserves export, deep links and existing control inventory',()=>{
 const page=read('rcm-view.html');
 const registry=JSON.parse(page.match(/const controls=(\[[\s\S]*?\]);\s*const searchEl=/)[1]);
 assert.equal(registry.length,15);
 for(const key of ['foundation','review','automated'])assert.ok(page.includes('value="'+key+'"'));
 const m=page.match(/const authorityFocus=Object\.freeze\((\{[^;]+\})\);/);
 assert.ok(m,'authority focus mapping exists');
 const focus=Function('return ('+m[1]+')')();
 assert.deepEqual(Object.keys(focus).sort(),registry.map(c=>c.id).sort());
 for(const value of Object.values(focus))assert.ok(value.length&&value.every(x=>['foundation','review','automated'].includes(x)));
 assert.deepEqual(focus['AI-05'],['review','automated']);
 assert.ok(focus['AI-10'].includes('foundation'));
 assert.ok(page.includes('authorityEl.addEventListener(\'change\',render)'));
 assert.ok(page.includes("authorityEl.value='all';render()"),'deep-linked controls should be exposed regardless of filter');
});
