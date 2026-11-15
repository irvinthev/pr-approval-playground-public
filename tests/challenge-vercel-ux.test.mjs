import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const cwd=new URL('..',import.meta.url);
const capture=fs.readFileSync(new URL('../scripts/capture-vercel-ux.mjs',import.meta.url),'utf8');
const discover=fs.readFileSync(new URL('../scripts/discover-vercel-preview.mjs',import.meta.url),'utf8');
const workflow=fs.readFileSync(new URL('../.github/workflows/vercel-ux-screenshots.yml',import.meta.url),'utf8');
test('Playwright remote UX helpers have valid Node module syntax',()=>{
 for(const name of ['scripts/capture-vercel-ux.mjs','scripts/discover-vercel-preview.mjs']){
  const run=spawnSync(process.execPath,['--check',name],{cwd,encoding:'utf8'});
  assert.equal(run.status,0,name+'\n'+run.stderr);
 }
});
test('Remote screenshot script only allows the private lab Vercel project hostname',()=>{
 assert.match(capture,/ai-sdlc-challenge-agent-/);
 assert.match(capture,/irvlife23\\.vercel\\.app/);
 assert.match(capture,/x-vercel-protection-bypass/);
 assert.match(capture,/x-vercel-set-bypass-cookie/);
 assert.match(capture,/context\.route\('\*\*\/api\/challenge'/);
 assert.match(capture,/context\.route\('\*\*\/api\/challenge-session'/);
 assert.match(capture,/fixture:true/);
 assert.doesNotMatch(capture,/api\.gemini|generativelanguage\.googleapis/);
});
test('Captures real deployed V6 navigation with mobile and desktop fixture data',()=>{
 for(const x of ['mobile','desktop','architecture','risk','evidence','challenge','challenge-followup']){
  assert.ok(capture.includes(x),'Missing '+x);
 }
 assert.match(capture,/document\.documentElement\.scrollWidth-window\.innerWidth/);
 assert.match(capture,/screenshots-vercel/);
 assert.match(capture,/manifest\.json/);
 assert.match(capture,/index\.html/);
});
test('Manual preview override accepts only an allowlisted HTTPS URL',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'challenge-ux-'));
 const out=path.join(dir,'result.txt');
 const valid='https://ai-sdlc-challenge-agent-hardyrba1-irvlife23.vercel.app/private-challenge.html';
 let run=spawnSync(process.execPath,['scripts/discover-vercel-preview.mjs'],{
  cwd,encoding:'utf8',env:{...process.env,UX_MANUAL_URL:valid,
    VERCEL_AUTOMATION_BYPASS_SECRET:'fixture-bypass',GITHUB_OUTPUT:out}
 });
 assert.equal(run.status,0,run.stderr);
 assert.match(fs.readFileSync(out,'utf8'),/https:\/\/ai-sdlc-challenge-agent-hardyrba1-irvlife23\.vercel\.app/);
 run=spawnSync(process.execPath,['scripts/discover-vercel-preview.mjs'],{
  cwd,encoding:'utf8',env:{...process.env,UX_MANUAL_URL:'https://evil.example/private-challenge.html',
    VERCEL_AUTOMATION_BYPASS_SECRET:'fixture-bypass',GITHUB_OUTPUT:path.join(dir,'bad.txt')}
 });
 assert.notEqual(run.status,0);
 fs.rmSync(dir,{recursive:true,force:true});
});
test('Workflow avoids fork secrets and produces short-lived review artifacts',()=>{
 assert.match(workflow,/head\.repo\.full_name == github\.repository/);
 assert.match(workflow,/secrets\.VERCEL_AUTOMATION_BYPASS_SECRET/);
 assert.match(workflow,/retention-days: 7/);
 assert.match(workflow,/workflow_dispatch:/);
 assert.match(workflow,/pull_request:/);
 assert.match(workflow,/screenshots-vercel\//);
});
