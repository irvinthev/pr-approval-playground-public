const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const F = require('../financial-engine');
const ui = fs.readFileSync(path.join(__dirname,'../financial-ui.js'),'utf8');
const html = fs.readFileSync(path.join(__dirname,'../playground.html'),'utf8');
const context = vm.createContext({FinancialDemo:F});
vm.runInContext(ui.slice(0,ui.indexOf("document.addEventListener('DOMContentLoaded'")), context);
const definitions = ui.slice(ui.indexOf('  const events ='),ui.indexOf('  Object.entries(raceDefinitions)'));
vm.runInContext(definitions+'\nglobalThis.cases = raceDefinitions;',context);
const evaluate = (id,count,shadowMode=false) => {const s={...context.cases[id],sha:'demo-revision-1',financial:true};return context.financialRaceEvaluate(s,s.events.slice(0,count),{shadowMode});};
test('real UI scripts parse and financial evaluation is wired before legacy race',()=>{
 for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
 new vm.Script(ui);
 assert.match(html,/if\(s\.financial\)return financialRaceEvaluate\(s,seen,policy\)/);
 assert.match(html,/\['financial','Financial Impact Lab'\]/);
});
test('two low reviews cannot merge before independent financial approval',()=>{
 const blocked=evaluate('financial',7);assert.equal(blocked.merged,false);assert.equal(blocked.status,'HUMAN REVIEW REQUIRED');
 const allowed=evaluate('financial',10);assert.equal(allowed.merged,true);assert.equal(allowed.record.humanApproval.sha,allowed.record.commit);
});
test('shadow mode preserves non-mutating behavior after qualified approval',()=>assert.equal(evaluate('financial',10,true).merged,false));
test('new revisions invalidate both prior technical checks and financial approval',()=>{
 const x=evaluate('financialPush',100);assert.equal(x.merged,false);assert.equal(x.approvedSha,null);assert.equal(x.status,'HUMAN REVIEW REQUIRED');assert.equal(x.record.commit,'demo-revision-2');
});
test('mapping revision invalidates approval even when code remains unchanged',()=>{
 const x=evaluate('financialMapping',100);assert.equal(x.merged,false);assert.equal(x.record.mappingVersion,'demo-map-2');assert.equal(x.record.humanApproval,null);assert.equal(x.status,'HUMAN REVIEW REQUIRED');
});
