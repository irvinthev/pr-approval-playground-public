import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
const inline=source.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
test('V9 retains browser module syntax and signed model continuity',()=>{
 assert.ok(inline);
 const checked=spawnSync(process.execPath,['--check','--input-type=module'],{input:inline,encoding:'utf8'});
 assert.equal(checked.status,0,checked.stderr);
 assert.match(source,/fetch\('\.\/api\/challenge'/);
 assert.match(source,/continuityReceipts:follow\?state\.continuityReceipts:\[\]/);
 assert.match(inline,/typeof data\.continuityReceipt!=='string'/);
});
test('questions now come from the model response rather than keyword-selected sets',()=>{
 assert.doesNotMatch(source,/const refinementSets=/);
 assert.doesNotMatch(source,/function suggestRefinementFocus/);
 assert.doesNotMatch(source,/id="refinement-focus"/);
 assert.match(inline,/Array\.isArray\(data\.clarifications\)/);
 assert.match(source,/Up to three scenario-specific questions from Gemini/);
 assert.match(inline,/function renderRefinementQuestions\(data\)/);
 assert.match(inline,/el\('refine-panel'\)\.hidden=!questions\.length/);
});
test('tap-to-answer options and unknown or other feed one signed follow-up',()=>{
 assert.match(inline,/q\.options,'Unknown','Other'/);
 assert.match(inline,/input\.type='radio'/);
 assert.match(inline,/state\.refinementAnswers\[i\]=/);
 assert.match(inline,/function refinementFollowupPrompt\(\)/);
 assert.match(inline,/state\.latestResponse\?\.clarifications/);
 assert.match(inline,/state\.pendingRefinement=true;\s*ask\(true\)/);
 assert.match(inline,/if\(prompt\.length>1000\)/);
});
test('initial assessment and reassessment are visible, not a risk score',()=>{
 assert.match(source,/id="report-delta"/);
 assert.match(source,/id="report-previous"/);
 assert.match(source,/id="report-revised"/);
 assert.match(inline,/state\.previousTakeaway=follow\?/);
 assert.match(inline,/setView\('report'\)/);
 assert.match(source,/Expected safeguards/);
 assert.match(inline,/data\.expectedSafeguards/);
 assert.doesNotMatch(source,/riskScore\s*=/);
});
test('scenario specific expected safeguards have why, reported status and bounded source links',()=>{
 assert.match(inline,/reported-partial/);
 assert.match(inline,/reported-full/);
 assert.match(inline,/reported-absent/);
 assert.match(inline,/refById\.get\(id\)/);
 assert.match(inline,/url\.protocol!=='https:'/);
 assert.match(source,/reported status is not independent verification/i);
 assert.match(source,/No directly relevant source card supplied for this expectation/);
});
test('illustrative GitHub model cards remain available only as optional depth',()=>{
 assert.match(source,/id="report-model-examples"/);
 assert.match(inline,/el\('report-model-examples'\)\.hidden=!prTopic/);
 assert.match(source,/GitHub: CODEOWNERS/);
 assert.match(source,/Claude: permissions/);
 assert.match(source,/OWASP: agentic threats/);
 assert.match(source,/id="report-sources-details"/);
});
test('self challenge and browser/session reset still available',()=>{
 assert.equal((source.match(/data-challenge="justify"/g)||[]).length,3);
 assert.match(inline,/justify:'Challenge your own three most consequential claims/);
 assert.match(inline,/state\.refinementAnswers=\{\}/);
 assert.match(inline,/state\.previousTakeaway=null/);
 assert.match(source,/Use fictional or publicly shareable scenarios only/);
 const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size);
});