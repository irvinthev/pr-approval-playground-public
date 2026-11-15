import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
test('private challenge lab retains accessible inputs, status and sign-out',()=>{
 for(const id of ['token','scenario','ask','refinement-submit','reset','result','status','remember','remembered'])
  assert.match(source,new RegExp('id="'+id+'"'));
 assert.match(source,/name="viewport"/);
 assert.match(source,/aria-live="polite"/);
 assert.match(source,/Use fictional or publicly shareable scenarios only/);
 assert.match(source,/el\('token'\)\.value=''/);
});
test('private lab uses the same-origin authenticated endpoints and keeps continuity in memory',()=>{
 assert.match(source,/fetch\('\.\/api\/challenge'/);
 assert.match(source,/fetch\('\.\/api\/challenge-session'/);
 assert.match(source,/headers\.Authorization='Bearer '\+token/);
 assert.match(source,/typeof data\.continuityReceipt!=='string'/);
 assert.match(source,/state\.receipt=null/);
 assert.doesNotMatch(source,/AIza[A-Za-z0-9_-]{25,}|localStorage|sessionStorage|document\.cookie/);
});
test('model text is rendered as text and source links are HTTPS only',()=>{
 assert.match(source,/node\.textContent=String/);
 assert.match(source,/url\.protocol!=='https:'/);
 assert.match(source,/ref\.modelUsed\?'Selected by Gemini':'Provided as context'/);
 assert.match(source,/No live web research is performed/);
 assert.doesNotMatch(source,/\.innerHTML|frame\.srcdoc/);
});
