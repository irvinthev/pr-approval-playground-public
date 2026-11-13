import test from 'node:test';
import assert from 'node:assert/strict';
import {explainAdversarialReview} from '../rcm-scenario-reasoning.js';
import {sourceCatalog} from '../framework-source-catalog.js';
import {controls} from '../rcm-explorer-data.js';

const example=(authority='authorize')=>explainAdversarialReview({useCase:'approval',authority,risks:['injection','sod']});
test('example only appears for AI review with selected injection risk',()=>{
 assert.equal(explainAdversarialReview({useCase:'approval',authority:'authorize',risks:['scope']}),null);
 assert.equal(explainAdversarialReview({useCase:'agent',authority:'execute',risks:['injection']}),null);
 assert.ok(example());
});
test('authority changes the described consequence and verification',()=>{
 const advisory=example('advisory'),authorize=example('authorize'),execute=example('execute');
 assert.match(advisory.consequence,/only advises/);
 assert.match(authorize.consequence,/automated approval/);
 assert.match(execute.consequence,/privileged execution/);
 assert.notEqual(advisory.check,authorize.check);
 assert.notEqual(execute.check,authorize.check);
});
test('safeguards are existing controls and preserve original IDs',()=>{
 assert.deepEqual(example().safeguards.map(s=>s.id),['WEB15:AI-04','WEB15:AI-05','WEB15:AI-06','WEB15:AI-07']);
 assert.ok(example().safeguards.every(s=>controls.some(c=>c.id===s.id)));
});
test('source lenses resolve to canonical versioned references',()=>{
 assert.ok(example().references.length>=2);
 for(const r of example().references){
  const p=sourceCatalog.provisions.find(x=>x.id===r.id);
  assert.ok(p&&p.url===r.url);
  assert.match(r.scope,/not an approved control mapping/);
 }
 assert.ok(example().references.some(r=>r.id==='OWASP-2026:LLM01'));
});
test('cannot treat this illustrative example as verified controls',()=>{
 assert.match(example().status,/Illustrative/);
 assert.match(example().owner,/Assign named owners/);
 assert.ok(!example().status.includes('effective'));
});
