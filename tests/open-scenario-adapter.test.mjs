import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeScenario,normalizeFrameworkCatalog,frameworkIndex,getTopicIds} from '../scenario-framework-adapter.js';

test('canonical catalog resolves its internal source and provision references',()=>{
 assert.equal(frameworkIndex.issues.length,0,frameworkIndex.issues.join('; '));
 assert.ok(frameworkIndex.sources.size>=8);
 assert.ok(frameworkIndex.provisions.size>=15);
});
test('open-ended review-plan proposal identifies authorization and reviewer questions',()=>{
 const r=analyzeScenario('Human approves an AI review plan; agents execute tests and approve the pull request.');
 assert.ok(r.topics.some(t=>t.id==='authorization'));
 assert.ok(r.topics.some(t=>t.id==='review-quality'));
 assert.ok(r.references.length>0);
 for(const p of r.references){
  assert.match(p.sourceUrl,/^https:\/\//);
  assert.ok(p.id&&p.sourceVersion&&p.mappingStatus);
 }
});
test('novel unmatched scenario is unresolved, never automatically safe',()=>{
 const r=analyzeScenario('florb quasar nebulizer');
 assert.equal(r.coverage,'Unsupported / insufficient information');
 assert.equal(r.references.length,0);
 assert.ok(r.uncertainties.some(x=>x.includes('No supported')));
});
test('release scenario retrieves traceable SLSA provision',()=>{
 const r=analyzeScenario('An AI triggers a production deployment using an unverified build artifact.');
 assert.ok(r.topics.some(t=>t.id==='release'));
 assert.ok(r.references.some(x=>x.id==='SLSA:BUILD-PROVENANCE'));
});
test('untrusted scenario text is bounded and not rendered as framework assertions',()=>{
 const r=analyzeScenario('<script>alert(1)</script> ' + 'x'.repeat(5000));
 assert.ok(r.input.length<=4000);
 assert.equal(r.coverage,'Unsupported / insufficient information');
});
test('catalog validation reports broken foreign keys',()=>{
 const bad={...{schemaVersion:'test',asOf:'test'},sources:[{id:'a'}],provisions:[{id:'x',sourceId:'missing'}],mappings:[{controlId:'c',provisionId:'missing'}]};
 const normalized=normalizeFrameworkCatalog(bad);
 assert.equal(normalized.issues.length,2);
});
test('topic coverage IDs unique',()=>{
 const ids=getTopicIds();
 assert.equal(ids.length,new Set(ids).size);
});

test('UI invalidates prior analysis after any scenario revision and gates export',async()=>{
 const {readFile}=await import('node:fs/promises');
 const ui=await readFile(new URL('../open-scenario.html',import.meta.url),'utf8');
 assert.match(ui,/id="stale-note"/);
 assert.match(ui,/addEventListener\('input'/);
 assert.match(ui,/current=null;step=0;[\s\S]*?\$\('output'\)\.hidden=true;[\s\S]*?\$\('download'\)\.disabled=true;/);
 assert.match(ui,/if\(!current \|\| \$\('scenario'\)\.value\.trim\(\)!==current\.input\)return;/);
});
