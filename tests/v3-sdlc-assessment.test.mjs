import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const load=name=>readFileSync(new URL('../v2/'+name,import.meta.url),'utf8');
const source=load('sdlc-risk-data.js');
const risks=JSON.parse(source.match(/window.SDLCRiskRecords=(\[[\s\S]*?\]);/)[1]);
const library=load('risk-control-library.html');
const assessment=load('sdlc-assessment.html');
const code=assessment.match(/<script>\s*'use strict';([\s\S]*?)<\/script>/)[1];
const segment=code.slice(code.indexOf('const toolRequired='),code.indexOf('function riskCard'));
const stageLabels=[
 ['design','Design & planning'],['coding','Coding & tool execution'],['testing','Testing & validation'],
 ['review','Review & approval'],['release','Build & release'],['ops','Production & operations']
];
const evaluate=new Function('risks','stageLabels',
 "const labelOf=id=>stageLabels.find(x=>x[0]===id)?.[1]||id;"+
 "const has=(arr,v)=>arr.includes(v);"+segment+"return evaluate;")(risks,stageLabels);
const profile=(activities,authority='advisory',capabilities=[])=>({activities,authority,capabilities,safeguards:[]});
test('Library and assessor use a single 21-risk source',()=>{
 assert.equal(risks.length,21);assert.equal(new Set(risks.map(x=>x.id)).size,21);
 assert.match(library,/src="\.\/sdlc-risk-data\.js"/);
 assert.match(assessment,/src="\.\/sdlc-risk-data\.js"/);
});
test('No activities does not imply a validated low risk',()=>{
 assert.equal(evaluate(profile([])).length,0);
 assert.match(assessment,/This does not demonstrate that the environment has no AI-enabled SDLC risks/);
});
test('A design-only environment surfaces design scenarios',()=>{
 const ids=evaluate(profile(['design'])).map(x=>x.risk.id);
 assert.ok(ids.includes('R10'));assert.ok(ids.includes('R11'));
 assert.ok(!ids.includes('R20'));
});
test('Advisory review does not silently qualify autonomous AI approval',()=>{
 const x=evaluate(profile(['review'])).find(x=>x.risk.id==='R02');
 assert.ok(x);assert.equal(x.status,'Not applicable under stated architecture');
 assert.match(x.reason,/does not delegate autonomous/);
 assert.match(x.reassess,/Reassess if/);
});
test('Autonomous approval can surface R02 without authority caveat',()=>{
 const x=evaluate(profile(['review'],'autonomous',['tools','untrusted'])).find(x=>x.risk.id==='R02');
 assert.ok(x);assert.equal(x.conditions.length,0);
});
test('External-data exposure requires confirmation of egress',()=>{
 const x=evaluate(profile(['review'])).find(x=>x.risk.id==='R06');
 assert.ok(x.conditions.some(c=>c.includes('external')));
});
test('New risks do not claim the legacy assessor provides a risk score',()=>{
 assert.match(library,/environment assessment currently supports R01–R09/);
 assert.match(assessment,/not verified exposure/);
 assert.match(assessment,/not a calculated risk score|NOT a calculated risk score/);
});
test('All shared records expose evidence and challenge fields',()=>{
 for(const r of risks)assert.ok(r.id&&r.challenge&&r.evidence&&r.primaryStage&&r.stages.includes(r.primaryStage));
});

test('Advisory coding without tool access excludes execution-only mechanisms',()=>{
 const result=evaluate(profile(['coding'],'advisory'));
 for(const id of ['R12','R13','R18','R21']){
  const match=result.find(x=>x.risk.id===id);
  assert.equal(match.status,'Not applicable under stated architecture',id);
  assert.ok(match.reason&&match.reassess,id);
 }
 assert.equal(result.find(x=>x.risk.id==='R14').status,'Potentially applicable');
 assert.match(result.find(x=>x.risk.id==='R14').description,/assistant suggests/);
 assert.match(result.find(x=>x.risk.id==='R17').description,/advisory assistant/);
});
test('Autonomous agent scenarios are not excluded by advisory-only rules',()=>{
 const result=evaluate(profile(['review'],'autonomous',['tools','untrusted']));
 for(const id of ['R01','R02','R03','R12','R13','R21']){
  assert.notEqual(result.find(x=>x.risk.id===id)?.status,'Not applicable under stated architecture',id);
 }
});
test('Unknown external transfer remains conditional rather than excluded',()=>{
 const x=evaluate(profile(['coding'],'advisory')).find(x=>x.risk.id==='R06');
 assert.equal(x.status,'Needs verification');
});
test('Excluded results appear in decision brief and exported results',()=>{
 assert.match(assessment,/Excluded under the stated architecture/);
 assert.match(assessment,/reason:x.reason\|\|null/);
 assert.match(assessment,/Not applicable under stated architecture/);
});
