const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../shared-pipeline-context');
const script=fs.readFileSync('shared-pipeline-nav.js','utf8');
test('each of seven stages provides specific independently executable IA procedures',()=>{
 assert.equal(Object.keys(M.assuranceTests).length,7);
 for(const stage of M.stages){
  const p=M.assuranceTests[stage.id];assert.ok(p,'missing IA procedures for '+stage.title);
  for(const field of ['preparation','execution','expected','operation','retain'])assert.ok(p[field]?.length>80,stage.title+' lacks specific '+field);
 }
});
test('stages 02, 04 and 07 cover distinct failure injection, evidence and completeness',()=>{
 assert.match(M.assuranceTests[1].execution,/known billing consumer/);
 assert.match(M.assuranceTests[1].expected,/human path/);
 assert.match(M.assuranceTests[3].execution,/push revision B/);
 assert.match(M.assuranceTests[3].expected,/denies automated authorization/);
 assert.match(M.assuranceTests[6].operation,/entire actual production deployment population/);
 assert.match(M.assuranceTests[6].expected,/canary breach/);
});
test('read-only Assurance stage component renders how IA tests, not just assurance challenges',()=>{
 assert.match(script,/How IA tests it · procedures and expected results/);
 assert.match(script,/Prepare & obtain/);
 assert.match(script,/Execute \/ negative test/);
 assert.match(script,/Expected result/);
 assert.match(script,/Test operation over time/);
 assert.match(script,/Retain in workpaper/);
 assert.match(script,/details\.open=true/);
 assert.match(script,/page==='assurance'/);
 assert.doesNotMatch(script,/evaluateCase\(|resolveAuthorization\(|approveMerge\(/);
 new vm.Script(script);
});
