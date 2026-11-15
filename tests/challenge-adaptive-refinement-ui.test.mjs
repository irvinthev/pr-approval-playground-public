import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
test('reassessment batches model-selected options into one signed follow-up',()=>{
 assert.match(source,/state\.reassessmentUsed\?\[\]:data\.clarifications/);
 assert.match(source,/el\('refine-panel'\)\.hidden=!questions\.length/);
 assert.match(source,/q\.options,'Unknown','Other'/);
 assert.match(source,/input\.type='radio'/);
 assert.match(source,/if\(state\.busy \|\| \(follow && \(state\.reassessmentUsed \|\| !state\.receipt\)\)\)return/);
 assert.match(source,/if\(follow\)state\.reassessmentUsed=true;\s+const resp=await fetch/);
 assert.match(source,/assessment:true,turns,continuityReceipts:follow\?\[state\.receipt\]:\[\]/);
 assert.match(source,/state\.refinementAnswers=\{\}/);
});
test('reassessment displays original recommendation and model explanation',()=>{
 assert.match(source,/state\.previousTakeaway=follow\?state\.latestResponse\.conclusions\[0\]\.application:null/);
 assert.match(source,/el\('report-revised'\)\.textContent=data\.reassessment/);
 assert.match(source,/Remaining uncertainties/);
});
