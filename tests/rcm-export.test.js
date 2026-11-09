const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crosswalk=require('../control-crosswalk');
const {buildRows}=require('../rcm-export');

function sample(id,title){return {id,domain:'Example',title,risk:'Illustrative risk',activity:'Proposed safeguard',evidence:'Request evidence',test:'Test example',framework:'Framework illustration',scenario:'scope'};}
test('WEB15 export retains qualified identifiers and maps semantic collisions by namespace',()=>{
 const rows=buildRows([sample('AI-03','Approval Authority & SoD'),sample('AI-05','AI Reviewer Validation')],crosswalk);
 const h=rows[0],qualified=h.indexOf('Qualified ID'),related=h.indexOf('Related workbook controls (proposed)');
 assert.equal(rows[1][qualified],'WEB15:AI-03');
 assert.ok(rows[2][related].includes('WB16:AI-03'));
 assert.ok(!rows[1][related].includes('WB16:AI-03'));
});
test('all 15 web safeguards have explicit proposed workbook relationships, no equivalence claims',()=>{
 const controls=crosswalk.webSafeguards.map(w=>sample(w.legacyId,w.title));
 const rows=buildRows(controls,crosswalk);
 assert.equal(rows.length,16);
 const h=rows[0],rel=h.indexOf('Related workbook controls (proposed)');
 const qualified=h.indexOf('Qualified ID'),status=h.indexOf('Relationship status');
 assert.equal(new Set(rows.slice(1).map(r=>r[qualified])).size,15);
 for(const row of rows.slice(1)){assert.ok(row[rel].startsWith('WB16:'));assert.match(row[status],/not equivalence/i);}
});
test('exports never present simulation as actual evidence or assessed implementation',()=>{
 const rows=buildRows([sample('AI-12','Monitoring & Evidence')],crosswalk),h=rows[0],r=rows[1];
 for(const key of ['Design status','Simulated evidence status','Verified implementation status','Retention and population completeness limitation'])assert.ok(h.includes(key));
 assert.match(r[h.indexOf('Design status')],/proposed/i);
 assert.match(r[h.indexOf('Simulated evidence status')],/fictional/i);
 assert.equal(r[h.indexOf('Verified implementation status')],'Not assessed');
 assert.match(r[h.indexOf('Retention and population completeness limitation')],/not established/i);
});
test('RCM download wires crosswalk before new export script and does not overwrite workbook',()=>{
 const html=fs.readFileSync('rcm-view.html','utf8');
 assert.match(html,/RcmExport\.buildRows\(controls,window\.ControlCrosswalk\)/);
 assert.ok(html.indexOf('control-crosswalk.js?v=inventory-1')<html.indexOf('rcm-export.js?v=dp06-1'));
 assert.match(html,/Existing 16-control workbook|inventory-crosswalk/);
});

test('export provides conventional DevOps RCM fields before historical inventory metadata',()=>{
 const c={...sample('AI-07','Independent Automated Authorization'),domain:'Change Management & Secure SDLC',engineeringArea:'Policy authorization',engineeringStage:'04 · Authorization',objective:'Only authorized and current changes are automatically approved.',nature:'Preventive',trigger:'On each decision',frameworkRelationship:'NIST SSDF supporting practice; audit applicability conditional',applicability:'Scope dependent'};
 const rows=buildRows([c],crosswalk),h=rows[0],r=rows[1];
 const expected=['Common control domain','Engineering area','Engineering SDLC stage','Risk statement','Control ID','Control name','Control objective','Control description / proposed engineering safeguard','Control nature','Trigger / cadence (illustrative)','Evidence / IPE','Testing procedure (illustrative)','Industry reference / qualified relationship','SOX / other applicability'];
 assert.deepEqual(h.slice(0,expected.length),expected);
 assert.equal(r[h.indexOf('Control objective')],c.objective);
 assert.equal(r[h.indexOf('Engineering area')],c.engineeringArea);
 assert.equal(r[h.indexOf('Industry reference / qualified relationship')],c.frameworkRelationship);
 assert.equal(r[h.indexOf('Qualified ID')],'WEB15:AI-07');
});
