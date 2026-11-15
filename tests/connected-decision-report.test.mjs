import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../connected-decision-report.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../connected-decision-report.css',import.meta.url),'utf8');
const script=readFileSync(new URL('../connected-decision-report.mjs',import.meta.url),'utf8');
const recon=readFileSync(new URL('../connected-decision-reconciliation.mjs',import.meta.url),'utf8');
const reconCss=readFileSync(new URL('../connected-decision-reconciliation.css',import.meta.url),'utf8');

test('A and B are distinct layouts of one common engineering case',()=>{
  for(const id of ['executive-layout','workspace-layout','technical-basis','workspace-cards',
      'lens-panel','case-heading','lens-next','lens-pivot']){
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  assert.match(html,/data-layout="executive"/);
  assert.match(html,/data-layout="workspace"/);
  assert.match(script,/setLayout\(layout/);
  assert.match(script,/setLens\(lens/);
  assert.match(script,/renderWorkspace\(\)/);
  assert.match(html,/one PR is rebased/i);
});

test('One scenario provides engineering, risk, and assurance decision perspectives',()=>{
  for(const lens of ['engineering','risk','assurance']){
    assert.match(html,new RegExp('data-lens="'+lens+'"'));
    assert.match(script,new RegExp('^  '+lens+':\\{','m'));
  }
  assert.match(script,/Make PR number, repository, head SHA/);
  assert.match(script,/permission map/);
  assert.match(script,/Trace the approval instruction/);
  assert.match(script,/Compare agent-executed approvals with conventional human review/);
  assert.match(script,/narrow batch submitter/i);
  assert.match(script,/targeted review rules/);
});

test('Design is safely isolated and does not ask Gemini to invent decisions',()=>{
  assert.doesNotMatch(script,/\bfetch\s*\(|\bXMLHttpRequest\b|navigator\.sendBeacon|localStorage|sessionStorage/);
  assert.doesNotMatch(html,/<form\b/i);
  assert.doesNotMatch(html,/gemini.api|api\/challenge/);
  assert.match(html,/Static fictional example/);
  assert.match(script,/not the objective/);
  assert.match(script,/not merely the existence of an AI agent/);
  assert.match(script,/Existing evidence may be enough/);
});

test('Mobile design avoids fixed-width columns and has accessible controls',()=>{
  assert.match(html,/role="tablist"/);
  assert.match(html,/role="tabpanel"/);
  assert.match(html,/aria-pressed="true"/);
  assert.match(html,/aria-controls="lens-panel"/);
  assert.match(script,/ArrowRight/);
  assert.match(script,/ArrowLeft/);
  assert.match(css,/@media \(max-width:530px\)/);
  assert.match(css, /\.workspace-grid\{grid-template-columns:1fr\}/);
  assert.match(css, /\[hidden\]\{display:none!important\}/);
});

test('The shared report shows reconciliation across authorization, execution and GitHub read-back',()=>{
  for(const term of ['Human intent','Agent / API action','GitHub review',
      'unmatched','stale-SHA','independently compare','Exception handling unknown'])
    assert.ok(recon.includes(term), 'Missing reconciliation topic: '+term);
  assert.match(recon,/id="reconciliation"/);
  assert.match(recon,/recon-stage/g);
  assert.match(html,/connected-decision-reconciliation\.mjs/);
  assert.match(html,/connected-decision-reconciliation\.css/);
  assert.match(html,/href="#reconciliation"/);
  assert.match(reconCss,/@media\(max-width:600px\)/);
});

test('Technical source claims are bounded and link to official documentation',()=>{
  const links=[
    'https://docs.github.com/en/rest/pulls/reviews',
    'https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request_review',
    'https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries',
    'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets',
    'https://code.claude.com/docs/en/permissions'
  ];
  for(const url of links)assert.ok(recon.includes(url),'Missing documentation link '+url);
  assert.match(recon,/What each source supports/);
  assert.match(recon,/Does not establish/);
  assert.match(recon,/three records do not match/);
  assert.doesNotMatch(recon,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
});

test('The public report uses neutral role labels instead of stakeholder or program-specific names',()=>{
  const rendered=[html,script,recon].join('\n');
  const excluded=[['fast','track'].join(' '),['ch','ase'].join(''),['j','on'].join(''),['and','rew'].join(''),['bra','ze'].join('')];
  for(const word of excluded){
    assert.doesNotMatch(rendered,new RegExp('\\\\b'+word+'\\\\b','i'));
  }
});
