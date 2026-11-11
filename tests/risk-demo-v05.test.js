const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const W=require('../risk-governance-worksheet');
test('two fictional case studies are loaded as draft inventory and risk entries',()=>{
 const src=read('risk-governance-ui.js');
 assert.match(src,/Fictional PR review assistant/);
 assert.match(src,/Fictional low-risk PR approval gate/);
 assert.match(src,/const sampleCases=\[/);
 assert.match(src,/D\.inventoryRecord\(example\.inventory,assets\.length\+1\)/);
 assert.match(src,/D\.riskRecord\(\{\.\.\.example\.risk,assetId:asset\.id\},risks\.length\+1,\[asset\.id\]\)/);
 assert.match(src,/examplesVisible=true/);
 const a=W.inventoryRecord({name:'Fictional PR review assistant',owner:'Engineering lead (fictional)',purpose:'AI suggestions',authority:'Advisory',crownJewel:'Unknown',dataClass:'Internal'},1);
 const b=W.inventoryRecord({name:'Fictional low-risk PR approval gate',owner:'Platform owner (fictional)',purpose:'Auto authorization',authority:'Automated approval',crownJewel:'Yes',dataClass:'Confidential'},2);
 assert.equal(a.crownJewel,'Unknown');assert.equal(b.crownJewel,'Yes');
 for(const x of [a,b])assert.match(x.reviewStatus,/Draft/);
});
test('examples foreground summaries; detailed forms and tables are progressively disclosed',()=>{
 const src=read('risk-governance-ui.js');
 for(const phrase of ['Two fictional assessments — start here','View risk, safeguard and evidence','Use as inventory template','Add another AI system / edit a sample template','Add another risk / draft treatment or acceptance','View complete inventory register','View all recorded risk drafts'])assert.ok(src.includes(phrase),phrase);
 assert.match(src,/const inventoryEditor=n\('details'/);
 assert.match(src,/const riskEditor=n\('details'/);
 assert.match(src,/const inventoryList=n\('details'/);
 assert.match(src,/const riskList=n\('details'/);
 assert.match(src,/examplesVisible=false;render\(\)/);
});
test('example entries remain unverified and no acceptance is issued',()=>{
 const src=read('risk-governance-ui.js');
 assert.match(src,/Zero authorized acceptances/);
 assert.match(src,/Not assessed/);
 assert.match(src,/No verified systems/);
 assert.match(src,/no management approval or acceptance/);
 assert.doesNotMatch(src,/localStorage|sessionStorage|fetch\(|XMLHttpRequest/);
 assert.doesNotMatch(src,/treatment:'Propose acceptance'/);
});
test('CSS and JavaScript additions parse and are mobile responsive',()=>{
 const ui=read('risk-governance-ui.js');
 new vm.Script(ui,{filename:'risk-governance-ui.js'});
 assert.match(read('risk-dashboard-v04.css'),/governance-example-grid/);
 assert.match(read('risk-dashboard-v04.css'),/@media\(max-width:760px\)/);
});
