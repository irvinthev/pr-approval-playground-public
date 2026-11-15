import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
test('workspace has one assessment and a valid browser module',()=>{
 const script=source.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script);
 const result=spawnSync(process.execPath,['--check','--input-type=module'],{input:script,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 assert.match(source,/id="result" class="panel" hidden aria-labelledby="resulttitle"/);
 assert.doesNotMatch(source,/role="tab"|data-challenge=|challengePrompts|riskScore/);
 const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(ids.length,new Set(ids).size);
});
test('the picker offers three PR use cases and an unrelated scenario',()=>{
 for(const name of ['delegated','tools','plan','rotation'])
  assert.match(source,new RegExp('data-example="'+name+'"'));
 assert.match(source,/Cloud credential rotation/);
 assert.match(source,/el\('report-model-examples'\)\.hidden=!prTopic/);
});
