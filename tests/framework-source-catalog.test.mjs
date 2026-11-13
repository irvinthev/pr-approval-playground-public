import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceCatalog} from '../framework-source-catalog.js';
import {controls} from '../rcm-explorer-data.js';
const c=sourceCatalog;
test('source catalog has distinct, version-qualified sources',()=>{
 assert.equal(c.sources.length,10);
 assert.equal(new Set(c.sources.map(s=>s.id)).size,c.sources.length);
 for(const s of c.sources){assert.ok(s.version&&s.status&&s.sourceType);assert.match(s.url,/^https:\/\//);assert.ok(s.limitations);}
});
test('provision references resolve and have explicit review and source status',()=>{
 assert.equal(c.provisions.length,18);
 assert.equal(new Set(c.provisions.map(p=>p.id)).size,c.provisions.length);
 for(const p of c.provisions){assert.ok(c.sources.some(s=>s.id===p.sourceId),p.id);assert.match(p.url,/^https:\/\//);assert.ok(p.qualification&&p.reviewStatus);}
});
test('pilot maps only source-qualified preexisting safeguards',()=>{
 assert.equal(c.mappings.length,8);
 for(const m of c.mappings){assert.ok(controls.some(x=>x.id===m.controlId));assert.ok(c.provisions.some(p=>p.id===m.provisionId));assert.equal(m.reviewStatus,'proposed-for-review');assert.equal(m.decision,'Pending');}
});
test('no restricted third-party assurance report or employer content',()=>{
 const body=JSON.stringify(c).toLowerCase();
 assert.ok(!body.includes('soc 2'));assert.ok(!body.includes('anysphere'));assert.ok(!body.includes('braze'));assert.ok(!body.includes('cursor'));
});
test('NIST Cyber AI is explicitly a preliminary draft',()=>{
 const source=c.sources.find(s=>s.id==='NIST-CYBER-AI-8596-IPRD');
 assert.equal(source.status,'preliminary-draft');
 assert.ok(c.provisions.filter(p=>p.sourceId===source.id).every(p=>p.referenceType==='draft-focus-area'));
});
test('OWASP 2025 and 2026 identifiers do not collide',()=>{
 assert.ok(c.sources.some(s=>s.id==='OWASP-LLM-2025'));
 assert.ok(c.provisions.some(p=>p.id==='OWASP-2026:LLM03'&&p.title==='Excessive Agency'));
 assert.ok(!c.provisions.some(p=>p.id==='OWASP-2026:LLM06'&&p.title==='Excessive Agency'));
});
test('framework remains navigation-only when not provision-level validated',()=>{
 assert.equal(c.provisions.find(p=>p.id==='COSAI-RM:DATA').referenceType,'structured-dataset');
 assert.ok(c.provisions.every(p=>p.reviewStatus==='publisher-id-observed'));
});
