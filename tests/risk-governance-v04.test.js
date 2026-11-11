const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const W=require('../risk-governance-worksheet');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('AI inventory requires ownership and use, and separates data classification from crown jewel exposure',()=>{
 assert.throws(()=>W.inventoryRecord({name:'Example',purpose:'Reviews changes'},1),/owner/);
 const x=W.inventoryRecord({name:'Example AI reviewer',owner:'Engineering lead',purpose:'Reviews proposed code',dataClass:'Restricted',crownJewel:'Unknown',criticalAsset:'Billing engine',dataTypes:'Source code'},1);
 assert.equal(x.dataClass,'Restricted');
 assert.equal(x.crownJewel,'Unknown');
 assert.equal(x.criticalAsset,'Billing engine');
 assert.equal(x.id,'AI-SYS-001');
 assert.match(x.reviewStatus,/not verified/);
});
test('risk tracking needs an inventory linkage and keeps assessments undetermined',()=>{
 assert.throws(()=>W.riskRecord({assetId:'NONE',event:'Misclassify',owner:'Risk owner'},1,['AI-SYS-001']),/inventory/);
 const r=W.riskRecord({assetId:'AI-SYS-001',event:'Unsafe misclassification',owner:'Platform lead',treatment:'Mitigate',actionPlan:'Test unsafe commits',targetDate:'2027-01-31',riskStatus:'Draft — treatment planned'},1,['AI-SYS-001']);
 assert.equal(r.actionPlan,'Test unsafe commits');
 assert.equal(r.riskStatus,'Draft — treatment planned');
 assert.equal(r.residualRisk,'Not determined');
 assert.equal(r.acceptanceStatus,'Not requested');
});
test('risk acceptance is always a proposal, with owner, rationale, conditions and time bound',()=>{
 const base={assetId:'AI-SYS-001',event:'Reviewer outputs unsafe',owner:'Risk owner',treatment:'Propose acceptance'};
 assert.throws(()=>W.riskRecord(base,1,['AI-SYS-001']),/Acceptance proposals/);
 const r=W.riskRecord({...base,rationale:'Time-limited exception',conditions:'Mandatory manual review',reviewDate:'2027-02-01',approver:'Authorized manager'},1,['AI-SYS-001']);
 assert.equal(r.acceptanceStatus,'Proposed — decision not evidenced');
 assert.equal(r.proposedDecisionMaker,'Authorized manager');
 assert.equal(r.residualRisk,'Not determined');
 assert.doesNotMatch(JSON.stringify(r),/Approved — accepted|Risk accepted/i);
});
test('the risk dashboard retains all existing capabilities and separates navigation panels',()=>{
 const html=read('ai-sdlc-risk.html');
 for(const id of ['risk-tab-register','risk-tab-inventory','risk-tab-model','risk-tab-guidance','sdlc-risk-register','operating-model-explorer','risk-governance-workspace','operating-model-form','shared-pipeline-context'])assert.match(html,new RegExp('id="'+id+'"'));
 for(const source of ['risk-dashboard-v04.css','risk-governance-worksheet.js','sdlc-risk-register.js','sdlc-risk-register-ui.js','risk-governance-ui.js','risk-dashboard-tabs.js','operating-model.js'])assert.ok(html.includes(source),source);
 assert.match(html,/Govern/);assert.match(html,/Map/);assert.match(html,/Measure/);assert.match(html,/Manage/);
 assert.match(html,/NIST AI RMF/);
 assert.match(html,/not a required architecture|not official NIST risk statements/i);
 const tabs=read('risk-dashboard-tabs.js');
 assert.match(tabs,/ArrowRight/);assert.match(tabs,/ArrowLeft/);
});
test('governance browser never persists or claims authorized risk acceptance',()=>{
 const ui=read('risk-governance-ui.js');
 assert.match(ui,/Session-only/);
 assert.match(ui,/Zero authorized acceptances/);
 assert.match(ui,/no management approval or acceptance/);
 assert.doesNotMatch(ui,/localStorage|sessionStorage|fetch\(|XMLHttpRequest|document\.cookie/);
 const exported=W.exportData([],[]);
 assert.match(exported,/not a validated inventory, signed risk acceptance/);
});
test('new page scripts parse and remote pages are not modified',()=>{
 for(const name of ['risk-governance-worksheet.js','risk-governance-ui.js','risk-dashboard-tabs.js'])new vm.Script(read(name),{filename:name});
 assert.match(read('ai-sdlc-risk.html'),/id="risk-register"/);
});
