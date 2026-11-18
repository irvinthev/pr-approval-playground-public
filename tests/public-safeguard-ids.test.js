const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const inventory = require('../control-crosswalk');
const { buildRows } = require('../rcm-export');

test('one SG namespace appears in public Assurance and V2 references', () => {
  for (const file of ['index.html','field-guide-v2.html']) {
    const html = read(file);
    assert.match(html, /SG-01/);
    assert.match(html, /SG-15/);
    assert.match(html, /RELATED ILLUSTRATIVE SAFEGUARDS/);
    assert.match(html, /href="\.\/rcm-view\.html#safeguard-SG-01"/);
    assert.doesNotMatch(html, /\bFG-(?:0[1-9]|1[0-5])\b/);
    const references = [...html.matchAll(/class="as-rcm-control-link" href="\.\/rcm-view\.html#safeguard-SG-(\d{2})"/g)];
    assert.ok(references.length >= 15, file+' has accessible safeguard detail links');
  }
});

test('legacy AI and source-qualified IDs remain stable behind public SG labels', () => {
  const page = read('rcm-view.html');
  const controls = JSON.parse(page.match(/const controls=(\[[\s\S]*?\]);\s*const searchEl=/)[1]);
  assert.equal(controls.length,15);
  assert.deepEqual(controls.map(c=>c.id), Array.from({length:15},(_,i)=>'AI-'+String(i+1).padStart(2,'0')));
  assert.match(page, /function matchesControlHash/);
  assert.match(page, /location\.hash==='#control-'\+c\.id/);
  assert.match(page, /location\.hash==='#safeguard-'\+publicId\(c\.id\)/);
  assert.match(page, /\['Safeguard ID',publicId\(c\.id\)\]/);
  assert.equal(inventory.webSafeguards.length,15);
  assert.ok(inventory.webSafeguards.every(x=>x.id.startsWith('WEB15:AI-')));
  assert.ok(inventory.workbookControls.every(x=>x.id.startsWith('WB16:AI-')));
});

test('public exports use SG IDs while crosswalk provenance remains source-qualified', () => {
  const controls = [{id:'AI-01',title:'Automated Approval Eligibility',domain:'Governance',risk:'Example',activity:'Gate',evidence:'Config',test:'Negative test',framework:'Reference',scenario:'scope'}];
  const rows = buildRows(controls,inventory);
  const headers = rows[0], result = rows[1];
  assert.equal(result[headers.indexOf('Control ID')],'SG-01');
  assert.equal(result[headers.indexOf('Qualified ID')],'WEB15:AI-01');
  const explorer = read('rcm-explorer-engine.js');
  assert.match(explorer, /'Safeguard ID','Control title'/);
  assert.match(explorer, /'SG-'\+c\.id\.slice\(-2\)/);
  const app = read('rcm-explorer-app.js');
  assert.match(app, /const publicId=id=>'SG-'\+id\.slice\(-2\)/);
});

test('Assurance links show public SG names while retaining existing routes',()=>{
  const assurance = read('independent-assurance.html');
  assert.match(assurance,/Safeguard SG-02/);
  assert.match(assurance,/code\.textContent='SG-'\+id\.slice\(-2\)/);
  assert.match(assurance,/a\.href='\.\/rcm-view\.html#control-'\+id/);
});
