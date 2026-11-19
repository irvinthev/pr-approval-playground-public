import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const get=n=>readFileSync(new URL('../v2/'+n,import.meta.url),'utf8');
const library=get('risk-control-library.html');
const records=JSON.parse(library.match(/const records=(\[[\s\S]*?\]);\nconst esc=/)[1]);
test('Preserves all nine original PR approval records within the 21-risk SDLC library',()=>{
 assert.equal(records.length,21);
 for(let i=1;i<=9;i++)assert.equal(records.filter(r=>r.id==='R'+String(i).padStart(2,'0')&&r.type==='original').length,1);
 assert.equal(new Set(records.map(r=>r.id)).size,21);
});
test('Every record preserves engineering and assurance detail',()=>{
 for(const r of records)for(const key of ['objective','securityBoundary','approaches','negativeTest','evidence','incidentResponse','sourceStatement'])assert.ok(r[key],r.id+' missing '+key);
});
test('Library linked from all V2 preview sections',()=>{
 for(const n of ['index.html','learn.html','nondeterministic-audit.html'])assert.match(get(n),/href="\.\/risk-control-library\.html"/);
});
test('Assessor links are scoped to original nine risks',()=>{
 assert.match(library,/r.type==='original'\?'<a class=/);
 assert.match(library,/environment assessment currently supports R01–R09/);
 assert.match(get('index.html'),/new URLSearchParams\(location.search\).get\("risk"\)/);
});
test('Public library contains no identified private identifiers',()=>{
 for(const token of ['TEM-607','Appboy','Braze','SRC-001','GRC-3735'])assert.ok(!library.includes(token),token);
});
