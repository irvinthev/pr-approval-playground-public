const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html','ai-sdlc-risk.html','engineering-blueprint.html','continuous-monitoring.html','independent-assurance.html','playground.html','rcm-view.html','auditor-view.html'];
const chapters = pages.slice(0,5);
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const htmlOnly = file => read(file).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const ids = file => new Set([...htmlOnly(file).matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]));

test('five core chapters use the same navigation labels and keep advanced tools separate', () => {
 const canonical = ['Overview','Risk &amp; Governance','Engineering &amp; Safeguards','Monitoring &amp; Operations','Assurance'];
 for(const file of pages){
  const nav = htmlOnly(file).match(/<nav class="site-chapters"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav,file+' missing primary navigation');
  const hrefs = [...nav[1].matchAll(/href="\.\/([^"#?]+)"/g)].map(m=>m[1]);
  assert.deepEqual(hrefs,chapters,file+' nav destinations');
  for(const label of canonical) assert.ok(nav[1].includes('>'+label+'</a>'),file+' missing '+label);
  assert.doesNotMatch(nav[1],/\.\/playground\.html|\.\/rcm-view\.html/,file+' advanced tools should not be chapters');
 }
 assert.match(htmlOnly('index.html'),/href="\.\/playground\.html"/);
 assert.match(htmlOnly('independent-assurance.html'),/href="\.\/rcm-view\.html/);
 assert.ok(fs.existsSync(path.join(root,'assets/ai-sdlc-scenario-rcm-template.csv')));
});

test('static local page destinations and fragment identifiers resolve', () => {
 const idsByPage = Object.fromEntries(pages.map(p=>[p,ids(p)]));
 for(const file of pages){
  for(const match of htmlOnly(file).matchAll(/href=["']([^"']+)["']/g)){
   const href = match[1];
   if(/^(?:https?:|mailto:|tel:|javascript:)/i.test(href))continue;
   const [base,fragment] = href.split('#');
   const target = base ? base.replace(/^\.\//,'').split('?')[0] : file;
   if(base && !base.startsWith('./'))continue;
   if(!target.endsWith('.html'))continue;
   assert.ok(fs.existsSync(path.join(root,target)),file+' points to missing '+target);
   if(fragment && idsByPage[target]){
    const hash = decodeURIComponent(fragment);
    assert.ok(idsByPage[target].has(hash),file+' has invalid link '+href);
   }
  }
 }
});

test('the shared case appears across all chapters and preserves a canonical revision chain', () => {
 for(const file of chapters) assert.match(read(file),/CASE-SHARED-01/,file);
 for(const file of ['engineering-blueprint.html','continuous-monitoring.html','independent-assurance.html']){
  assert.match(read(file),/example-sha-A/,file);
  assert.match(read(file),/example-sha-B/,file);
 }
 const journey=read('field-guide-journey.js');
 assert.match(journey,/const stages = \[/);
 assert.match(journey,/does not synchronize or validate the separate interactive labs/);
 assert.match(journey,/if\(i===selected\)/);
 assert.match(journey,/aria-current','step'/);
});

test('mobile and keyboard contracts keep stage navigation operable', () => {
 const css=read('field-guide-journey.css');
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/overflow-x:auto/);
 assert.match(css,/focus-visible/);
 assert.match(css,/min-height:47px/);
 assert.match(css,/fgj-scroll-hint/);
 const js=read('field-guide-journey.js');
 assert.match(js,/setAttribute\('aria-label'/);
 assert.match(js,/Swipe or scroll horizontally/);
 const monitoring=read('continuous-monitoring.html');
 assert.match(monitoring,/aria-pressed="true"/);
 assert.match(monitoring,/id="fg-monitor-signal-detail" aria-live="polite"/);
});

test('redundant chapter guides are secondary and optional experiments remain intact', () => {
 const risk=htmlOnly('ai-sdlc-risk.html');
 const monitoring=htmlOnly('continuous-monitoring.html');
 assert.match(risk,/<details class="fg-supplementary-guide"[\s\S]*?<nav class="risk-chapter-guide"/);
 assert.match(monitoring,/<details class="fg-supplementary-guide"[\s\S]*?<section class="monitoring-chapter-guide"/);
 assert.equal((monitoring.match(/id="fg-monitoring-dashboard"/g)||[]).length,1);
 assert.match(read('index.html'),/id="workflow"/);
 assert.match(read('playground.html'),/data-lab=/);
});
