import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';

const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
const inline=source.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
test('V8 remains valid browser module with no backend changes',()=>{
 assert.ok(inline);
 const result=spawnSync(process.execPath,['--check','--input-type=module'],{input:inline,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 assert.match(source,/fetch\('\.\/api\/challenge'/);
 assert.match(source,/continuityReceipts:follow\?state\.continuityReceipts:\[\]/);
 assert.doesNotMatch(source,/googleSearch|generateContent/);
});
test('scenario-specific question sets contain exactly three decision-changing questions each',()=>{
 const block=inline.match(/const refinementSets=({[\s\S]*?});\nfunction suggestRefinementFocus/);
 assert.ok(block,'Curated question sets missing');
 const sets=runInNewContext('('+block[1]+')',{});
 assert.deepEqual(Object.keys(sets).sort(),['access','delegated','general','plan']);
 for(const [name,questions] of Object.entries(sets)){
  assert.equal(questions.length,3,name+' must have exactly three curated questions');
  const ids=new Set();
  for(const q of questions){
   assert.ok(q.q.length>30 && q.why.length>30 && q.changes.length>30,
     name+' requires question, why, and what changes');
   assert.match(q.url,/^https:\/\//);
   assert.ok(q.short.length<=60);
   assert.ok(!ids.has(q.id));ids.add(q.id);
  }
 }
 assert.match(sets.delegated[1].q,/revision/i);
 assert.match(sets.access[1].q,/MCP.*CLI/);
 assert.match(sets.plan[0].q,/delegated.*decision/);
});
test('suggested focus follows the scenario rather than applying one generic checklist',()=>{
 const functionText=inline.match(/function suggestRefinementFocus\(scenario\)\{[\s\S]*?\n\}/)?.[0];
 assert.ok(functionText);
 const detect=runInNewContext(functionText+'; suggestRefinementFocus',{});
 assert.equal(detect('An engineer reviews four stacked PRs using Claude Code'),'delegated');
 assert.equal(detect('Does Claude have access through GitHub MCP and CLI credentials?'),'access');
 assert.equal(detect('A team introduces PR Plan approval to decide qualifying PRs'),'plan');
 assert.equal(detect('Improve the software deployment process'),'general');
});
test('questions are optional, editable, and feed existing signed follow-up',()=>{
 assert.match(source,/id="refinement-focus"/);
 assert.match(source,/id="refinement-questions"/);
 assert.match(source,/id="refinement-submit"/);
 assert.match(source,/box\.open=index===0/);
 assert.match(inline,/input\.maxLength=140/);
 assert.match(inline,/function refinementFollowupPrompt\(\)/);
 assert.match(inline,/state\.refinementAnswers\[q\.id\]/);
 assert.match(inline,/state\.pendingRefinement=true;\s*ask\(true\)/);
 assert.match(inline,/if\(follow && state\.pendingRefinement\)setView\('report'\)/);
 assert.match(inline,/if\(prompt\.length>1000\)/);
 assert.match(inline,/state\.turns\.length>=6/);
 assert.match(source,/id="refinement-next-questions"/);
 assert.match(inline,/state\.refinementSent && Array\.isArray\(data\?\.challenges\)/);
});
test('self-challenge leverages signed prior model output without inventing proof',()=>{
 assert.equal((source.match(/data-challenge="justify"/g)||[]).length,3);
 assert.match(inline,/justify:'Challenge your own three most consequential claims/);
 assert.match(inline,/do not infer implemented safeguards/);
 assert.match(inline,/strongest counterargument/);
 assert.match(inline,/if there is no supporting source, explicitly mark the claim unsupported/);
 assert.match(source,/These are editorial prompts, not Gemini findings/);
 assert.match(source,/Implementation details not supplied/);
 assert.doesNotMatch(source,/id="report-unknowns-title">Implementation evidence not yet established/);
});
test('example safeguards provide why, official design source, and no proof-of-implementation claim',()=>{
 for(const phrase of ['GitHub: CODEOWNERS','Protected branches','Claude: permissions',
    'GitHub CLI review','OWASP: agentic threats','GitHub: rulesets','Why:']){
  assert.ok(source.includes(phrase),'Expected reference/rationale: '+phrase);
 }
 assert.match(source,/manually curated context, not evidence Gemini used them/);
 assert.match(source,/These source links explain potential design mechanisms/);
 assert.match(source,/No severity or residual-risk score has been assigned/);
 assert.match(source,/not a control deficiency/);
});
test('privacy warning, original scenario and no saved browser answer state',()=>{
 assert.match(source,/Use fictional or publicly shareable scenarios only/);
 assert.match(inline,/state\.refinementAnswers=\{\}/);
 assert.match(inline,/state\.latestResponse=null/);
 assert.match(inline,/el\('reset'\)\.addEventListener/);
 assert.match(inline,/el\('remember'\)/);
 const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,'No duplicate DOM ids');
});
