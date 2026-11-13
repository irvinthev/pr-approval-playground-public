import test from 'node:test';
import assert from 'node:assert/strict';
import {frameworkRegistry,findMappings} from '../framework-registry.js';
import {controls} from '../rcm-explorer-data.js';
const {frameworks,references,mappings,legacyAliases}=frameworkRegistry;
test('registry schema uses stable identities, versions and primary URLs',()=>{
 assert.equal(frameworks.length,5);
 assert.equal(new Set(frameworks.map(f=>f.id)).size,5);
 for(const f of frameworks){assert.ok(f.version&&f.issuer&&f.role&&f.currencyNote);assert.match(f.sourceUrl,/^https:\/\//);}
});
test('every reference resolves to a registered framework and primary URL',()=>{
 for(const r of references){assert.ok(frameworks.some(f=>f.id===r.frameworkId),r.id);assert.match(r.sourceUrl,/^https:\/\//);}
});
test('only five existing WEB15 controls receive pilot mappings',()=>{
 const ids=[...new Set(mappings.map(m=>m.controlId))].sort();
 assert.deepEqual(ids,['WEB15:AI-01','WEB15:AI-03','WEB15:AI-04','WEB15:AI-05','WEB15:AI-10']);
 assert.ok(ids.every(id=>controls.some(c=>c.id===id)));
});
test('mapping references, rationales, limitations and review status are complete',()=>{
 for(const m of mappings){assert.ok(references.some(r=>r.id===m.refId),m.refId);assert.ok(m.rationale.length>40&&m.limits.length>25);assert.equal(m.mappingStatus,'proposed_for_review');assert.equal(m.support,'qualified');}
});
test('legacy OWASP 2025 ID is not mislabeled as current',()=>{
 assert.ok(legacyAliases.some(x=>x.legacy.includes('LLM06:2025')&&x.current.includes('LLM03:2026')));
 assert.ok(references.some(r=>r.id==='OWASP-2026:LLM03'));
 assert.ok(!references.some(r=>r.id==='OWASP-2026:LLM06'));
});
test('qualified AS2201 methodology mapping does not declare a mandatory AI approval architecture',()=>{
 const item=mappings.find(m=>m.refId==='PCAOB:AS2201.21');assert.equal(item.relationship,'assurance_context_only');assert.match(item.limits,/does not direct/);
});
test('public UI receives no registry mapping for unreviewed controls',()=>{
 assert.equal(findMappings('WEB15:AI-13').length,0);
 assert.ok(findMappings('WEB15:AI-04').every(x=>x.reference&&x.framework));
});
test('source status and relationship approval remain distinct',()=>{
 assert.equal(frameworks.find(f=>f.id==='OWASP-LLM-2026').status,'published');
 assert.ok(mappings.every(m=>m.mappingStatus!=='approved'));
});
