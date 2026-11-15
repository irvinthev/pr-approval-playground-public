import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TEMPLATE_SCORECARD, EXAMPLE_SCORECARD, assessmentToScorecard, scorecardText} from '../decision-scorecard.mjs';

const page=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
const moduleSource=fs.readFileSync(new URL('../decision-scorecard.mjs',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../decision-scorecard.css',import.meta.url),'utf8');

test('scorecard template and worked example are available without a model request',()=>{
  assert.match(TEMPLATE_SCORECARD.recommendation,/Proceed/);
  assert.match(EXAMPLE_SCORECARD.proposal,/stacked pull requests/);
  assert.match(EXAMPLE_SCORECARD.basis,/not an assessment of an implemented system/);
  assert.equal(EXAMPLE_SCORECARD.safeguards.length,3);
  assert.doesNotMatch(moduleSource,/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/);
  assert.match(page,/id="scorecard-prototype"/);
  assert.match(page,/data-scorecard-mode="template"/);
  assert.match(page,/data-scorecard-mode="example"/);
  assert.match(page,/data-scorecard-mode="current"/);
  assert.match(page,/href="\.\/decision-scorecard\.css"/);
  assert.match(page,/from '\.\/decision-scorecard\.mjs'/);
  assert.match(css,/scorecard-sheet/);
});

test('current assessment scorecard reuses existing validated data, not a fabricated risk score',()=>{
  const data={
    conclusions:[{application:'Pilot only with per-revision authorization',scenarioBasis:'Reduce repeated submission clicks',openQuestion:'Is authorization enforced?'}],
    challenges:[{question:'Could an agent approve outside its instruction?',reason:'A broad token permits unrelated actions',tests:['Block one stale-revision approval']}],
    expectedSafeguards:[
      {objective:'Revision binding',implementation:'reported-partial',implementationBasis:'Self-reported'},
      {objective:'Bounded credentials',implementation:'not-assessed'},
      {objective:'Decision trace',implementation:'reported-full',implementationBasis:'Claimed'},
      {objective:'Monitoring',implementation:'not-assessed'}],
    clarifications:[{question:'Does the agent have unrestricted CLI access?'}]
  };
  const before=JSON.stringify(data);
  const card=assessmentToScorecard(data);
  assert.equal(JSON.stringify(data),before);
  assert.equal(card.recommendation,data.conclusions[0].application);
  assert.match(card.failure,/broad token/);
  assert.deepEqual(card.safeguards.map(x=>x.status),[
    'Partial · user-reported','Unknown · not assessed','Full · user-reported']);
  assert.equal(card.safeguards.length,3);
  assert.equal(card.pivot,'Does the agent have unrestricted CLI access?');
  assert.equal(card.action,'Block one stale-revision approval');
  assert.match(card.basis,/not independently verified/);
  const text=scorecardText(card);
  assert.match(text,/ENGINEERING DECISION SCORECARD/);
  assert.match(text,/Next move: Block one stale-revision approval/);
  assert.doesNotMatch(text,/\d+\/100|risk score:/i);
});

test('scorecard handles sparse assessments and missing safeguards explicitly',()=>{
  assert.equal(assessmentToScorecard({conclusions:[]}),null);
  const sparse=assessmentToScorecard({
    conclusions:[{application:'Defer until clarified',scenarioBasis:'Unknown design',openQuestion:''}],
    challenges:[],expectedSafeguards:[],clarifications:[]
  });
  assert.equal(sparse.safeguards.length,0);
  assert.match(sparse.failure,/No material failure scenario/);
  assert.match(sparse.pivot,/No decision-changing question/);
  assert.match(scorecardText(sparse),/No safeguards returned/);
});

test('scorecard is additive and the original challenge assessment stays intact',()=>{
  assert.match(page,/id="report-takeaway"/);
  assert.match(page,/id="report-lead-risk"/);
  assert.match(page,/id="report-expected-safeguards"/);
  assert.match(page,/id="refine-panel"/);
  assert.match(page,/id="open-scorecard"/);
  assert.match(page,/decisionScorecard\.setAssessment\(data\)/);
  assert.match(page,/decisionScorecard\.reset\(\)/);
  assert.match(page,/renderAssessmentReport\(data\)/);
  assert.match(page,/renderRefinementQuestions\(data\)/);
});
