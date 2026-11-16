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

test('legacy chapters retain navigation while V2 is the new main entry', () => {
 const canonical = ['Overview','Risk &amp; Governance','Engineering &amp; Safeguards','Monitoring &amp; Operations','Assurance'];
 for(const file of pages.filter(p=>p!=='index.html')){
  const nav = htmlOnly(file).match(/<nav class="site-chapters"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav,file+' missing primary navigation');
  const hrefs = [...nav[1].matchAll(/href="\.\/([^"#?]+)"/g)].map(m=>m[1]);
  assert.deepEqual(hrefs,chapters,file+' nav destinations');
  for(const label of canonical) assert.ok(nav[1].includes('>'+label+'</a>'),file+' missing '+label);
  assert.doesNotMatch(nav[1],/\.\/playground\.html|\.\/rcm-view\.html/,file+' advanced tools should not be chapters');
 }
 assert.match(htmlOnly('legacy-homepage.html'),/href="\.\/playground\.html"/);
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

test('the shared case appears across chapters while each chapter owns its investigation', () => {
 for(const file of chapters) assert.match(read(file),/CASE-SHARED-01/,file);
 for(const file of ['engineering-blueprint.html','continuous-monitoring.html','independent-assurance.html']){
  assert.match(read(file),/example-sha-A/,file);
  assert.match(read(file),/example-sha-B/,file);
 }
 const journey=read('field-guide-journey.js');
 assert.match(journey,/const stages = \[/);
 assert.match(journey,/field-guide-shared-journey/);
 assert.match(journey,/fgj-context/);
 assert.doesNotMatch(journey,/fgj-stages|function select\(index\)|deeper\.href=/);
 assert.doesNotMatch(journey,/history\.(pushState|replaceState)|location\.(assign|replace)/);
});

test('mobile and keyboard contracts support focused chapter choices without an extra stage strip', () => {
 const css=read('field-guide-v2.css');
 const contextCSS=read('field-guide-journey.css');
 const js=read('field-guide-v2.js');
 assert.match(css,/@media\(max-width:640px\)/);
 assert.match(css,/focus-visible/);
 assert.match(css,/min-height:44px/);
 assert.match(contextCSS,/fgj-context/);
 assert.match(js,/setAttribute\('aria-pressed'/);
 assert.match(js,/setAttribute\('aria-label'/);
 assert.doesNotMatch(read('field-guide-journey.js'),/Swipe or scroll horizontally/);
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
 assert.match(read('legacy-homepage.html'),/id="workflow"/);
 assert.match(read('playground.html'),/data-lab=/);
});
