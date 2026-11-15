import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Production incident 2026-11-15: a Vercel function compiled to CommonJS
// attempted require('challenge-risk-path-catalog.mjs'), raising ERR_REQUIRE_ESM.
// Keep shared server imports in a format already used by this API's bundler.
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('server bundle imports the shared stage catalogue through a .js module',()=>{
  const api=read('api/challenge.js');
  const contract=read('challenge-agent-contract.js');
  const catalog=read('challenge-risk-path-catalog.js');
  const browser=read('challenge-connected-report-data.mjs');
  assert.ok(api.includes("from '../challenge-risk-path-catalog.js'"));
  assert.ok(contract.includes("from './challenge-risk-path-catalog.js'"));
  assert.ok(browser.includes("from './challenge-risk-path-catalog.js'"));
  assert.ok(catalog.includes('export const riskPathCatalog'));
  for(const [name,code] of [['api/challenge.js',api],['challenge-agent-contract.js',contract]]){
    const invalidImports=code.split('\n').filter(line=>line.includes(' from ') && line.includes('.mjs'));
    assert.deepEqual(invalidImports,[],name+' must not import .mjs from the Node API entry graph');
  }
});
test('API module loads and keeps the riskPath contract instructions',async()=>{
  const {buildModelRequest}=await import('../api/challenge.js');
  const req=buildModelRequest({scenarioText:'An engineer approves a PR and an agent submits the review through the API.',turns:[],history:[],assessmentPhase:'initial'});
  assert.equal(req.messages.length,2);
  assert.ok(req.messages[0].content.includes('riskPath: optionally provide'));
});
