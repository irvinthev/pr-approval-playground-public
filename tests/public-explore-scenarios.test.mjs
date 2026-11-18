import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scenarioCases} from '../explore-scenarios.js';

const html=fs.readFileSync(new URL('../explore-scenarios.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../explore-scenarios.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../explore-scenarios.css',import.meta.url),'utf8');
const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('three distinct, completely fictional assessments contain complete engineering views',()=>{
  assert.deepEqual(Object.keys(scenarioCases),['routing','substitution','agent']);
  for(const [id,scenario] of Object.entries(scenarioCases)){
    for(const field of ['number','category','title','description','authority','assumption',
      'decision','why','pivot','current','proposed','alternative','counterargument','failureQuestion'])
      assert.ok(typeof scenario[field]==='string'&&scenario[field].length>12,id+': '+field);
    assert.equal(scenario.risks.length,3,id+': risk count');
    assert.equal(scenario.safeguards.length,3,id+': safeguards count');
    assert.equal(scenario.stages.length,5,id+': stage count');
    for(const risk of scenario.risks){
      assert.ok(Number.isInteger(risk.safeguard)&&risk.safeguard>=0&&risk.safeguard<3);
      for(const f of ['title','condition','consequence'])assert.ok(risk[f]?.length>15,id+' risk '+f);
    }
    for(const safeguard of scenario.safeguards)
      for(const field of ['title','why','enforce','test','evidence'])assert.ok(safeguard[field]?.length>15,id+' safeguard '+field);
    for(const stage of scenario.stages)
      for(const field of ['name','condition','good','bad','safeguard','evidence'])
        assert.ok(stage[field]?.length>3,id+' stage '+field);
    assert.deepEqual(Object.keys(scenario.teams),['engineering','risk','assurance']);
  }
});

test('routing, substitution and human-delegated approval retain materially different authority assumptions',()=>{
  assert.match(scenarioCases.routing.assumption,/remain enforced/);
  assert.match(scenarioCases.substitution.authority,/replace specialist/);
  assert.match(scenarioCases.agent.authority,/Human decides/);
  assert.match(scenarioCases.agent.stages[1].good,/one PR, one revision/);
});

test('page is a deterministic public teaching artifact: no private API or sensitive source material',()=>{
  for(const content of [html,js,css]){
    assert.doesNotMatch(content,/\bBraze\b|\bGreg\b|\bJon\b|\bD&O\b|@francisco|Parsons|Appboy|quality-bot\.braze|MDQ|CHALLENGE_API_TOKEN|GEMINI_API_KEY|api\/challenge|private-challenge/i);
    assert.doesNotMatch(content,/localStorage|sessionStorage|document\.cookie|navigator\.sendBeacon|XMLHttpRequest|WebSocket/);
  }
  assert.doesNotMatch(js,/\bfetch\s*\(|\bimport\s*\(/);
  assert.match(html,/Curated, not generated/);
  assert.match(html,/No external API is called/);
  assert.match(html,/Implementation status: Not assessed/);
  assert.match(html,/no live assessment/);
  assert.match(html,/what good looks like/i);
  assert.match(html,/what failure looks like/i);
});

test('accessible three-tab UI, five-stage explorer, mobile layout and public Field Guide entry point',()=>{
  for(const id of ['view-brief','view-safeguards','view-failure','stage-strip','risk-list','safeguard-list',
    'outcome-good','outcome-bad','outcome-safeguard','outcome-evidence'])assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/role="tablist"/);
  assert.match(html,/aria-selected="true"/);
  assert.match(html,/aria-pressed="false"/);
  assert.match(js,/ArrowRight/);
  assert.match(js,/ArrowLeft/);
  assert.match(js,/createElement/);
  assert.match(js,/textContent/);
  assert.doesNotMatch(js,/innerHTML|eval\s*\(/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(css,/\[hidden\]\{display:none!important\}/);
  assert.match(home,/href="\.\/explore-scenarios\.html"/);
  assert.match(home,/id="page-lab"/);
});
