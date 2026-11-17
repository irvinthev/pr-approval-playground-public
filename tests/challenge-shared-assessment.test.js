// Focused regression checks for the decision-first projection and reader hierarchy.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('shared assessment retains one decision, with three presentation tabs—not independent model conclusions',()=>{
  const renderer=read('challenge-connected-report-view.mjs');
  assert.match(renderer,/ONE SHARED ASSESSMENT/);
  assert.match(renderer,/Engineering decision/);
  assert.match(renderer,/What could change the recommendation/);
  assert.match(renderer,/Next consideration by role/);
  assert.match(renderer,/Compare the current path, proposal and simpler alternatives/);
  assert.match(renderer,/role','tablist/);
  assert.match(renderer,/root.append\(navigation,brief,safeguardPanel,failurePanel\)/);
  assert.doesNotMatch(renderer,/appendView\(|fetch\(|innerHTML/);
});

test('implementation claims remain user-reported and never become verified by projection',()=>{
  const projector=read('challenge-connected-report-data.mjs');
  const renderer=read('challenge-connected-report-view.mjs');
  assert.match(projector,/alternatives:options/);
  assert.match(projector,/experiments:tests/);
  assert.match(projector,/Not implemented · user-reported/);
  assert.match(projector,/Partial · user-reported/);
  assert.match(renderer,/No independently verified effectiveness was supplied/);
  assert.match(renderer,/Unknown must not be interpreted as absent or ineffective/);
  assert.match(renderer,/A referenced technical capability is not evidence/);
});

test('clarification action returns to the existing assessment rather than invoking a new model request',()=>{
  const renderer=read('challenge-connected-report-view.mjs');
  const original=read('private-challenge.html');
  assert.match(renderer,/Answer clarification questions and reassess/);
  assert.match(renderer,/getElementById\('cdr-toggle'\)/);
  assert.match(original,/renderRefinementQuestions\(data\)/);
  assert.match(original,/setConnectedReportMode\(previewReady\)/);
  assert.doesNotMatch(renderer,/fetch\(|api\/challenge/);
});

test('updated ES module renderer and projection parse successfully',()=>{
  for(const name of ['challenge-connected-report-view.mjs','challenge-connected-report-data.mjs']){
    const run=spawnSync(process.execPath,['--check',path.join(root,name)],{encoding:'utf8'});
    assert.equal(run.status,0,name+': '+run.stderr);
  }
});
