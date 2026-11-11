const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../sdlc-risk-register');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
test('public library holds nine unique unassessed SDLC risks with source-independent assessment fields',()=>{
 assert.equal(D.risks.length,9);
 assert.equal(new Set(D.risks.map(r=>r.id)).size,9);
 for(const r of D.risks){
  for(const key of ['event','failure','objective','safeguard','evidence','test','question'])assert.ok(r[key].length>12,r.id+' '+key);
  assert.ok(r.rcm.length>0);
  assert.ok(r.functions.every(x=>['Govern','Map','Measure','Manage'].includes(x)));
 }
});
test('all four NIST function filters and authority filters are nonexclusive and never calculate risk levels',()=>{
 for(const fn of ['Govern','Map','Measure','Manage'])assert.ok(D.select(fn).length>0);
 assert.equal(D.select().length,9);
 assert.ok(D.select('Measure','review').some(x=>x.id==='RR-02'));
 const csv=D.csv();
 for(const h of ['Assessment status','Likelihood','Impact','Residual risk'])assert.ok(csv.includes(h));
 assert.match(csv,/Not assessed/);
 assert.match(csv,/Not determined/);
 assert.doesNotMatch(read('sdlc-risk-register.js'),/Math\.random|riskScore\s*=/);
});
test('risk page preserves existing operating model and provides bounded NIST references and RCM deep links',()=>{
 const html=read('ai-sdlc-risk.html'),ui=read('sdlc-risk-register-ui.js');
 assert.match(html,/id="operating-model-explorer"/);
 assert.match(html,/id="risk-assessment-guide"/);
 assert.match(html,/id="sdlc-risk-register"/);
 assert.match(html,/NIST AI RMF 1\.0/);
 assert.match(html,/not official NIST risk statements/i);
 assert.match(html,/Missing evidence means/);
 assert.ok(html.indexOf('sdlc-risk-register.js')<html.indexOf('sdlc-risk-register-ui.js'));
 assert.match(ui,/\.\/rcm-view\.html#control-/);
 assert.match(ui,/textContent/);
 const rcm=read('rcm-view.html');
 for(const r of D.risks)for(const id of r.rcm)assert.ok(rcm.includes('"id":"'+id+'"'),id);
});
