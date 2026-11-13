import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceCatalog} from '../framework-source-catalog.js';
import {frameworkRegistry,findMappings} from '../framework-registry.js';

const oldPairs=[
'WEB15:AI-01|SSDF:PO.4',
'WEB15:AI-03|SSDF:PS.1',
'WEB15:AI-03|PCAOB:AS2201.21',
'WEB15:AI-04|OWASP-2026:LLM03',
'WEB15:AI-04|SSDF:PS.1',
'WEB15:AI-05|AI-RMF:MEASURE',
'WEB15:AI-10|SLSA:PROVENANCE'
].sort();
test('legacy seven mappings survive exact identifier reconciliation',()=>{
 assert.deepEqual(frameworkRegistry.mappings.map(m=>m.controlId+'|'+m.refId).sort(),oldPairs);
 assert.equal(frameworkRegistry.references.length,8);
 assert.equal(frameworkRegistry.frameworks.length,5);
});
test('every compatibility mapping derives from canonical provision metadata, not its own store',()=>{
 const index=new Map(sourceCatalog.provisions.map(p=>[p.id,p]));
 for(const mapping of frameworkRegistry.mappings){
  const canonical=sourceCatalog.mappings.find(m=>m.controlId===mapping.controlId&&m.legacy?.refId===mapping.refId);
  assert.ok(canonical,mapping.refId);
  assert.equal(mapping.rationale,canonical.legacy.rationale);
  assert.equal(mapping.limits,canonical.legacy.limits);
  assert.equal(mapping.mappingStatus,canonical.legacy.mappingStatus);
  assert.ok(index.has(canonical.provisionId));
 }
});
test('historical aliases and unmapped controls preserve compatibility',()=>{
 assert.equal(findMappings('WEB15:AI-13').length,0);
 assert.equal(findMappings('WEB15:AI-04').length,2);
 assert.ok(frameworkRegistry.legacyAliases.some(x=>x.legacy.includes('LLM06:2025')&&x.current.includes('LLM03:2026')));
});
test('canonical registry no longer relies on independent content in adapter',()=>{
 const adapter=readFileSync(new URL('../framework-registry.js',import.meta.url),'utf8');
 assert.match(adapter,/import \{sourceCatalog\}/);
 assert.ok(!adapter.includes('"rationale":'));
});
test('every new canonical mapping is still proposed and not auto-approved',()=>{
 assert.equal(sourceCatalog.mappings.length,11);
 assert.ok(sourceCatalog.mappings.every(m=>m.reviewStatus==='proposed-for-review'&&m.decision==='Pending'));
});
test('CSV projections contain all provision and mapping identifiers',()=>{
 const provisionCsv=readFileSync(new URL('../data/framework-provisions.csv',import.meta.url),'utf8');
 const mappingCsv=readFileSync(new URL('../data/framework-control-mappings.csv',import.meta.url),'utf8');
 assert.equal(provisionCsv.trim().split(/\r?\n/).length,sourceCatalog.provisions.length+1);
 assert.equal(mappingCsv.trim().split(/\r?\n/).length,sourceCatalog.mappings.length+1);
 for(const p of sourceCatalog.provisions)assert.ok(provisionCsv.includes('"'+p.id+'"'));
 for(const m of sourceCatalog.mappings)assert.ok(mappingCsv.includes('"'+m.provisionId+'"'));
});
