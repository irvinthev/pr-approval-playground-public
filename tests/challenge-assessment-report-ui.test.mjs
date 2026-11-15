import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
test('front-end only report retains valid client module syntax',()=>{
 const script=source.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script);
 const checked=spawnSync(process.execPath,['--check','--input-type=module'],{input:script,encoding:'utf8'});
 assert.equal(checked.status,0,checked.stderr);
});
test('report is a fifth accessible workspace tab and is navigable from architecture view',()=>{
 assert.match(source,/id="tab-report" role="tab" aria-controls="workspace-report"/);
 assert.match(source,/id="workspace-report" role="tabpanel" aria-labelledby="tab-report" hidden/);
 assert.match(source,/data-target="report"/);
 assert.match(source,/id="report-preview-link"/);
 assert.match(source,/setView\('report',true\)/);
 assert.match(source,/const allowed=\['architecture','risk','evidence','challenge','report'\]/);
});
test('renders dynamically using existing response contract and no new network or model requests',()=>{
 assert.match(source,/function renderAssessmentReport\(data\)/);
 assert.match(source,/renderAssessmentReport\(data\)/);
 const report=source.split('function renderAssessmentReport(data){')[1]?.split('function evidenceLabel(type){')[0];
 assert.ok(report?.length>100);
 assert.match(report,/data\.challenges/);
 assert.match(report,/data\.unknowns/);
 assert.match(report,/data\.conclusions/);
 assert.match(report,/data\.engineeringReferences/);
 assert.doesNotMatch(report,/fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
 assert.match(source,/body:JSON\.stringify\(\{scenarioText:scenario,turns,continuityReceipts:follow\?state\.continuityReceipts:\[\]\}\)/);
});
test('report explicitly distinguishes illustrative safeguards from actual findings',()=>{
 assert.match(source,/Illustrative design patterns—not confirmed controls/);
 assert.match(source,/not verified weaknesses/);
 assert.match(source,/Model-generated design assessment, not independent source verification/);
 assert.match(source,/Not independently verified/);
 assert.match(source,/No defensible preliminary conclusion was returned/);
 assert.doesNotMatch(source,/riskScore\s*=/);
});
test('compares example controls for human, delegated and autonomous authority',()=>{
 const report=source.split('id="workspace-report"')[1]?.split('id="workspace-challenge"')[0]||source;
 for(const phrase of ['Human decides and submits','Human decides, agent submits','AI decides and submits',
  'CODEOWNERS where appropriate','Bounded CLI, MCP, App and credential permissions',
  'Deterministic scope and exclusions','Traceable GitHub reviewer']){
  assert.ok(report.includes(phrase),'Missing '+phrase);
 }
});
test('references only provided external HTTPS source links, with provenance context',()=>{
 const report=source.split('function renderAssessmentReport(data){')[1]?.split('function evidenceLabel(type){')[0];
 assert.match(report,/url\.protocol!=='https:'/);
 assert.match(report,/knownLinks\.has\(url\.href\)/);
 assert.match(report,/ref\.modelUsed\?'Model identified as used':'Provided as context'/);
 assert.match(report,/Framework catalog provision cited; applicability not independently verified/);
 assert.match(report,/No source references were provided/);
});
test('keeps original privacy, authentication, conversation continuity and session reset',()=>{
 assert.match(source,/Use fictional or publicly shareable scenarios only/);
 assert.match(source,/id="remember"/);
 assert.match(source,/continuityReceipt/);
 assert.match(source,/id="reset"/);
 assert.match(source,/data-challenge="assumptions"/);
 const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(ids.length,new Set(ids).size,'Duplicate ids');
});
