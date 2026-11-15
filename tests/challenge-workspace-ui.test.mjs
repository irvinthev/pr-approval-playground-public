import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
test('V6 private workspace compiles as a JavaScript module',()=>{
 const script=source.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script?.length>1000);
 const result=spawnSync(process.execPath,['--check','--input-type=module'],{input:script,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
});
test('V6 workspace has accessible architecture, risk, evidence and challenge tabs',()=>{
 for(const name of ['architecture','risk','evidence','challenge']){
  assert.match(source,new RegExp('id="tab-'+name+'" role="tab"'));
  assert.match(source,new RegExp('id="workspace-'+name+'" role="tabpanel"'));
  assert.match(source,new RegExp('aria-controls="workspace-'+name+'"'));
 }
 assert.match(source,/function setView\(view,scroll=false\)/);
 assert.match(source,/tab\.setAttribute\('aria-selected',String\(active\)\)/);
 assert.match(source,/panel\.hidden=!active/);
 assert.match(source,/event\.key==='ArrowRight'/);
 assert.match(source,/event\.key!=='ArrowLeft'/);
});
test('authority models are explicitly illustrative and distinct from implementation tools',()=>{
 assert.match(source,/Illustrative authority models/);
 assert.match(source,/1 · Human review/);
 assert.match(source,/2 · Delegated approval/);
 assert.match(source,/3 · Autonomous approval/);
 assert.match(source,/GitHub Apps, rulesets, and CI workflows are implementation mechanisms/);
 assert.match(source,/id="operating-models" data-selected-model="delegated"/);
 assert.match(source,/\.model-grid/);
 assert.match(source,/@media\(max-width:650px\)/);
 assert.match(source,/btn\.setAttribute\('aria-pressed'/);
});
test('one-click challenges reuse same signed follow-up and are not rendered as inert UI',()=>{
 for(const id of ['assumptions','simpler','evidence','failure'])assert.match(source,new RegExp('data-challenge="'+id+'"'));
 assert.match(source,/const challengePrompts=\{/);
 assert.match(source,/el\('question'\)\.value=prompt/);
 assert.match(source,/setView\('challenge',true\)/);
 assert.match(source,/ask\(true\)/);
 assert.match(source,/continuityReceipts:follow\?state\.continuityReceipts:\[\]/);
 assert.match(source,/state\.scenario!==scenario/);
 assert.match(source,/document\.querySelectorAll\('\[data-challenge\]'\)\.forEach\(btn=>btn\.disabled/);
});
test('source rail uses HTTPS publisher URL, model-use attribution and no live fetching',()=>{
 assert.match(source,/function renderRailSources\(data\)/);
 assert.match(source,/renderRailSources\(data\)/);
 assert.match(source,/url\.protocol!=='https:'/);
 assert.match(source,/Model identified as used/);
 assert.match(source,/Provided as context/);
 assert.match(source,/role="status"/);
 assert.doesNotMatch(source,/googleSearch|generateContent|frame\.srcdoc/);
});
test('V6 retains privacy warning, single challenge endpoint, token and signed receipt flow',()=>{
 assert.match(source,/Gemini free-tier requests may be used by Google/);
 assert.match(source,/id="remember"/);
 assert.match(source,/fetch\('\.\/api\/challenge'/);
 assert.match(source,/fetch\('\.\/api\/challenge-session'/);
 assert.match(source,/typeof data\.continuityReceipt!=='string'/);
 assert.match(source,/state\.continuityReceipts=\(follow\?state\.continuityReceipts:\[\]\)\.concat\(data\.continuityReceipt\)\.slice\(-3\)/);
 assert.match(source,/el\('token'\)\.value=''/);
 const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,'Duplicate DOM IDs must not be introduced');
});
