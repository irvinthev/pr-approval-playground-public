import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const load=name=>readFileSync(new URL('../v2/'+name,import.meta.url),'utf8');
const assessment=load('sdlc-assessment.html'), prioritySource=load('sdlc-priorities.js');
const riskData=load('sdlc-risk-data.js');
const risks=JSON.parse(riskData.match(/window.SDLCRiskRecords=(\[[\s\S]*?\]);/)[1]);
const code=assessment.match(/<script>\s*'use strict';([\s\S]*?)<\/script>/)[1];
const segment=code.slice(code.indexOf('const toolRequired='),code.indexOf('function riskCard'));
const stageLabels=[['design','Design & planning'],['coding','Coding & tool execution'],['testing','Testing & validation'],['review','Review & approval'],['release','Build & release'],['ops','Production & operations']];
const evaluate=new Function('risks','stageLabels',"const labelOf=id=>stageLabels.find(x=>x[0]===id)?.[1]||id;const has=(arr,v)=>arr.includes(v);"+segment+"return evaluate;")(risks,stageLabels);
const window={};new Function('window',prioritySource)(window);
const priorities=window.SDLCPriorities.select;
const profile=(activities,authority,capabilities=[],safeguards=[])=>({activities,authority,capabilities,safeguards});
const ids=p=>priorities(p,evaluate(p)).map(x=>x.id);
test('Priority section appears above detailed results and reuses the shared catalog',()=>{
 assert.ok(assessment.indexOf('id="prioritySummary"')<assessment.indexOf('id="resultsList"'));
 assert.match(assessment,/src="\.\/sdlc-priorities\.js"/);
 assert.match(assessment,/window\.SDLCPriorities\.select\(profile,matched\)/);
 assert.equal(risks.length,21);
});
test('Advisory code suggestions do not automatically elevate agent tool or autonomous approval risks',()=>{
 const selected=ids(profile(['coding'],'advisory'));
 assert.ok(selected.includes('R14'));
 for(const id of ['R13','R12','R02','R03','R19','R20'])assert.ok(!selected.includes(id),id);
});
test('Autonomous PR approval emphasizes authorization over production remediation',()=>{
 const selected=ids(profile(['review'],'autonomous',['tools','untrusted']));
 for(const id of ['R13','R12','R02','R03'])assert.ok(selected.includes(id),id);
 assert.ok(!selected.includes('R20'));assert.ok(!selected.includes('R19'));
});
test('Production operations focuses on remediation and stopping unsafe agents',()=>{
 const selected=ids(profile(['ops'],'autonomous',['tools','untrusted','release']));
 for(const id of ['R20','R21'])assert.ok(selected.includes(id),id);
 assert.ok(!selected.includes('R02'));
});
test('External data-transfer signal can elevate R06 but does not appear when absent',()=>{
 const base=profile(['design','coding','review'],'autonomous',['tools','untrusted']);
 const withEgress=profile(['design','coding','review'],'autonomous',['tools','untrusted','external']);
 assert.ok(!ids(base).includes('R06'));
 assert.ok(ids(withEgress).includes('R06'));
});
test('Priority list is bounded, contains existing matched risks and does not infer safeguard effectiveness',()=>{
 const p=profile(['design','coding','review','testing','release','ops'],'autonomous',['tools','untrusted','external','release','sameAuthor'],['authorization','identity']);
 const matches=evaluate(p),selected=priorities(p,matches),allowed=new Set(matches.map(x=>x.risk.id));
 assert.ok(selected.length<=6);
 assert.ok(selected.every(x=>allowed.has(x.id)&&x.why&&x.whatChanges&&x.decisionQuestion));
 assert.deepEqual(ids(p),ids({...p,safeguards:[]}));
});
test('No selected activities yields no priorities and no claim of low risk',()=>{
 assert.deepEqual(ids(profile([],'advisory')),[]);
 assert.match(assessment,/This does not demonstrate low risk/);
});
