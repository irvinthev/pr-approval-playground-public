const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('shared case has eight named stages and preserves separate approval authority', () => {
 const js = read('field-guide-journey.js');
 assert.match(js, /CASE-SHARED-01/);
 for (const stage of ['PR','Eligibility','AI ×2','Authorize','Merge','Release','Monitor','Evidence']) {
  assert.ok(js.includes("name:'"+stage+"'"), stage);
 }
 assert.match(js, /aria-current','step'/);
 assert.match(js, /does not synchronize or validate the separate interactive labs/);
 assert.match(js, /Authorization, merge eligibility and release eligibility are separate decisions/);
});

test('the five chapters use the common journey without replacing their existing advanced cases', () => {
 for (const page of ['ai-sdlc-risk.html','engineering-blueprint.html','continuous-monitoring.html','independent-assurance.html']) {
  const html=read(page);
  assert.match(html,/\.\/field-guide-journey\.js/);
  assert.match(html,/\.\/field-guide-journey\.css/);
 }
 const html=read('index.html');
 assert.match(html,/id="overview-authority-preview"/);
 assert.match(html,/id="workflow"/);
});

test('Engineering specifies an independent decision truth table and negative tests', () => {
 const html=read('engineering-blueprint.html');
 for (const phrase of ['Policy truth table','Unauthorized identity','SHA changes after evaluation','Administrative ownership boundary','nondeterministic reviewer']) {
  assert.ok(html.includes(phrase),phrase);
 }
});

test('Assurance delivers a case investigation and a not-tested RCM template', () => {
 const html=read('independent-assurance.html');
 assert.match(html,/id="fg-worked-investigation"/);
 assert.match(html,/ai-sdlc-scenario-rcm-template\.csv/);
 const csv=read('assets/ai-sdlc-scenario-rcm-template.csv');
 assert.match(csv,/Observed Result,Support Level/);
 assert.match(csv,/NOT TESTED,UNESTABLISHED/);
});

test('Monitoring provides three interactive illustrative signals without implying live data', () => {
 const html=read('continuous-monitoring.html');
 assert.equal((html.match(/data-monitor-signal="(?:quality|population|release)"/g)||[]).length,3);
 assert.match(html,/id="fg-monitor-signal-detail"/);
 assert.match(html,/aria-live="polite"/);
 assert.match(html,/No live data or configured alerts/);
 assert.match(html,/24 decisions \/ 25 independently identified merges/);
});
