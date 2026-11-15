import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
test('the decision brief puts the recommendation, lead risk, safeguards and questions ahead of technical depth',()=>{
 const order=['report-takeaway','report-lead-risk','report-expected-safeguards','refine-panel','report-other-safeguards','report-risks','report-counterargument','report-option','report-sources-details'];
 for(let i=1;i<order.length;i++)
  assert.ok(source.indexOf('id="'+order[i]+'"')>source.indexOf('id="'+order[i-1]+'"'));
 assert.match(source,/add\('details',risks/);
 assert.match(source,/add\('details',target,'','expected-item'\)/);
 assert.match(source,/<details class="report-extra report-reasoning" id="report-reasoning"/);
 assert.match(source,/<details class="report-extra" id="report-sources-details"/);
 const renderer=source.split('function renderAssessmentReport(data){')[1].split('function showAssessment()')[0];
 assert.doesNotMatch(renderer,/fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
});
test('safeguards distinguish reported status, technical capability and source limits',()=>{
 for(const label of ['Unknown','Not implemented','Partial','Full','User-reported'])
  assert.ok(source.includes(label));
 assert.match(source,/item\.implementationBasis/);
 assert.match(source,/refById\.get\(id\)/);
 assert.match(source,/list\(box,ref\.facts\)/);
 assert.match(source,/if\(ref\.limits\)/);
 assert.match(source,/What the references support/);
 assert.match(source,/Illustrative design patterns/);
});
