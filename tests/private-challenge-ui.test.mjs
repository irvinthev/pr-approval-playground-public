import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
test('Private challenge lab has mobile accessible scenario input and follow-up',()=>{
 for(const id of ['token','scenario','ask','question','continue','reset','result','status','remember','remembered']){
   assert.match(source,new RegExp('id="'+id+'"'));
 }
 assert.match(source,/name="viewport"/);
 assert.match(source,/aria-live="polite"/);
});
test('Private lab uses same-origin API, no embedded tokens or model credential',()=>{
 assert.match(source,/fetch\('\.\/api\/challenge'/);
 assert.match(source,/headers\.Authorization='Bearer '\+token/);
 assert.doesNotMatch(source,/AIza[A-Za-z0-9_-]{25,}/);
 assert.doesNotMatch(source,/localStorage|sessionStorage|document\.cookie/);
 assert.match(source,/type="password"/);
});
test('Model response rendered as text, citations require https and new session clears token',()=>{
 assert.match(source,/node\.textContent=String/);
 assert.match(source,/url\.protocol==='https:'/);
 assert.match(source,/el\('token'\)\.value=''/);
 assert.match(source,/state\.scenario!==scenario/);
});
