const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const C=require('../case-model');
const crosswalk=require('../control-crosswalk');
const {buildRows}=require('../rcm-export');

const ui=fs.readFileSync('case-ui.js','utf8');
const css=fs.readFileSync('case.css','utf8');

test('Monitoring retains selected source-to-feed comparison between case rerenders',()=>{
 assert.match(ui,/let current=C\.initial\(\),active=false,error='',populationChoice='unverified'/);
 assert.match(ui,/select\.value=Object\.prototype\.hasOwnProperty\.call\(window\.PopulationDemo\.SCENARIOS,populationChoice\)\?populationChoice:'unverified'/);
 assert.match(ui,/select\.addEventListener\('change',\(\)=>\{populationChoice=select\.value;show\(\);\}\)/);
 assert.doesNotMatch(ui,/populationChoice\s*=\s*['"]MATCHED_SAMPLE['"]/);
});

test('reconciliation controls have keyboard focus and announced result semantics',()=>{
 assert.match(ui,/label\.htmlFor='case-population-choice'/);
 assert.match(ui,/select\.id='case-population-choice'/);
 assert.match(ui,/output\.setAttribute\('role','status'\)/);
 assert.match(ui,/output\.setAttribute\('aria-live','polite'\)/);
 assert.match(ui,/output\.setAttribute\('aria-atomic','true'\)/);
 assert.match(css,/#case-population-choice:focus-visible\{outline:3px/);
 assert.match(css,/#case-population-choice\{[^}]*min-height:44px/);
 assert.match(css,/#case-population-result\{overflow-wrap:anywhere\}/);
});

test('case navigation and change actions still rely on revision-bound evaluator',()=>{
 assert.match(ui,/function wireLinks\(\)/);
 assert.match(ui,/u\.hash=C\.encode\(current\)/);
 assert.match(ui,/current=C\.transition\(current,action\)/);
 const history=C.replay(['CHECKS','APPROVE','PUSH']);
 assert.equal(C.evaluateCase(history).authorizationStatus,'STALE');
 assert.equal(C.decode(C.encode(history)).change.revision,'case-revision-B');
});

test('RCM export keeps 15 source-qualified controls and does not assert implementation effectiveness',()=>{
 const rows=buildRows(crosswalk.webSafeguards.map(x=>({
  id:x.legacyId,domain:'Example',title:x.title,risk:'Example',activity:'Example',evidence:'Example',test:'Example',framework:'Example',scenario:'pass'
 })),crosswalk);
 assert.equal(rows.length,16);
 const header=rows[0];
 assert.equal(new Set(rows.slice(1).map(r=>r[header.indexOf('Qualified ID')])).size,15);
 for(const r of rows.slice(1))assert.equal(r[header.indexOf('Verified implementation status')],'Not assessed');
 const rcm=fs.readFileSync('rcm-view.html','utf8');
 assert.match(rcm,/assurance-catalog\.js/);
 assert.match(rcm,/id="export"/);
 assert.match(rcm,/Previous inventories/);
});

test('connected Monitoring loads the reconciliation helper before shared UI',()=>{
 const page=fs.readFileSync('continuous-monitoring.html','utf8');
 for(const name of ['financial-engine.js','case-model.js','population-reconciliation.js','case-ui.js'])assert.ok(page.includes('src="./'+name));
 assert.ok(page.indexOf('population-reconciliation.js?v=dp08-1')<page.indexOf('case-ui.js?v=case-ux-1'));
});
