import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');

test('one scenario triggers exactly one assessment request and no follow-up submit path',()=>{
 assert.equal((source.match(/fetch\('\.\/api\/challenge'/g)||[]).length,1);
 assert.match(source,/assessment:true,turns:\[\],continuityReceipts:\[\]/);
 assert.doesNotMatch(source,/refinement-submit|reassessmentUsed|Reassess with answers|async function ask\(answers/);
 assert.match(source,/state\.scenario=scenario/);
});
test('decision conditions reveal only precomputed implications without another Gemini call',()=>{
 assert.match(source,/const implications=Array\.isArray\(q\.implications\)/);
 assert.match(source,/if\(!implications\)/);
 assert.match(source,/\.textContent=n===q\.options\.length/);
 assert.match(source,/This is not a revised assessment/);
 assert.match(source,/recommendation remains conditional/);
 assert.match(source,/el\('refine-panel'\)\.hidden=!questions\.length/);
 assert.match(source,/input\.type='radio'/);
});
