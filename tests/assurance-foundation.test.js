'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
test('detailed Assurance reference retains foundation, pipeline, scenarios and assessment',()=>{
 const page=read('assurance-procedures-reference.html');
 const order=['id="foundational-controls"','id="test-approval"','id="failure-scenarios"','id="document-assessment"'];
 for(const id of order)assert.equal(page.split(id).length-1,1,id+' appears once');
 const positions=order.map(id=>page.indexOf(id));
 assert.ok(positions.every((n,i)=>i===0||n>positions[i-1]),'section order');
 for(const phrase of ['01 · Establish the Foundation','02 · Evaluate the Pipeline','03 · Select Failure Scenarios','04 · Document the Assessment'])assert.ok(page.includes(phrase),phrase);
 assert.doesNotMatch(page,/<strong>Framework references<\/strong>/);
 assert.doesNotMatch(page,/<strong>Control previews<\/strong>/);
 assert.match(page,/id="assurance-matrix-body"/);
 assert.match(page,/id="challenge-choices"/);
 assert.match(page,/id="challenge-result"/);
 assert.match(page,/id="matrix-details"/);
});
test('Foundational controls and selectable scenario content remain intact and fictional',()=>{
 const page=read('assurance-procedures-reference.html');
 const script=read('assurance-foundations.js');
 const css=read('assurance-foundations.css');
 for(const text of [page,script,css])assert.doesNotMatch(text,/Braze|Appboy|braze\.com/i);
 for(const term of ['Repository Protection & Enforcement','Independent Authorization & Segregation of Duties','Engineering & Security Baseline','Classification Data & Dependency Integrity','AI Classification QA & Negative Testing','Model & Policy Change Governance','Continuous Monitoring & Assurance Evidence'])assert.ok(script.includes(term),term);
 for(const term of ['Branch protection bypass','Cross-repository SoD conflict','Missing financial dependency','False-low-risk classification','Security gate failure','Evidence feed interruption'])assert.ok(script.includes(term),term);
 assert.match(script,/challenge-stage-link/);
 assert.match(page,/Educational test specifications only/);
});
test('RCM and seven-stage matrix retain integrated control and framework mappings',()=>{
 const rcm=read('rcm-view.html'),page=read('assurance-procedures-reference.html'),matrix=read('assurance-matrix.js');
 const match=rcm.match(/const controls=(\[[\s\S]*?\]);\s*const crosswalk=/);
 assert.ok(match,'15-control catalog available');
 const controls=JSON.parse(match[1]);
 assert.equal(controls.length,15);
 const ids=new Set(controls.map(c=>c.id));
 assert.equal(ids.size,15);
 const refs=[...matrix.matchAll(/id:'(AI-\d{2})'/g)].map(x=>x[1]);
 for(const id of refs)assert.ok(ids.has(id),id);
 assert.deepEqual([...new Set(refs)].sort(),['AI-01','AI-03','AI-05','AI-07','AI-10','AI-12']);
 assert.match(matrix,/Control examples — risk, safeguard, evidence and challenge/);
 assert.match(matrix,/Framework guidance for this stage/);
 assert.match(rcm,/id="framework-crosswalk"/);
 assert.match(rcm,/id="rcm-csv-download"/);
 assert.doesNotMatch(rcm,/id="framework-csv-download"/);
 assert.match(rcm,/id="archived-testing"/);
 assert.match(rcm,/id="framework-crosswalk"/);
 assert.match(page,/Legacy example workbook/);
 assert.match(page,/rcm-preview-list/); // legacy deep link remains supported
});
test('Assurance JavaScript parses',()=>{
 for(const name of ['assurance-foundations.js','assurance-matrix.js']){
 new vm.Script(read(name),{filename:name});
 }
 for(const name of ['independent-assurance.html','assurance-procedures-reference.html','rcm-view.html']){
 const inline=[...read(name).matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
 for(const [i,source] of inline.entries())new vm.Script(source,{filename:name+'-inline-'+i});
 }
});

