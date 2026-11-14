import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../api/challenge.js',import.meta.url),'utf8');
test('Challenge endpoint uses the Gemini credentials configured for Preview',()=>{
 assert.match(source,/!process\.env\.GEMINI_API_KEY/);
 assert.match(source,/process\.env\.CHALLENGE_API_TOKEN/);
 assert.match(source,/generativelanguage\.googleapis\.com\/v1beta\/openai\/chat\/completions/);
 assert.match(source,/'Bearer '\+process\.env\.GEMINI_API_KEY/);
 assert.doesNotMatch(source,/OPENAI_API_KEY|api\.openai\.com/);
});
test('Gemini provider selected without exposing credentials or disabling authorization',()=>{
 assert.match(source,/GEMINI_MODEL\|\|'gemini-3\.1-flash-lite'/);
 assert.match(source,/hasChallengeToken\(req\.headers\.authorization/);
 assert.match(source,/response_format:\{type:'json_object'\}/);
});
