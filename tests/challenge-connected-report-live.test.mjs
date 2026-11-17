import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectConnectedReport,isHumanDelegatedApprovalScenario} from '../challenge-connected-report-data.mjs';

const html=readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
const view=readFileSync(new URL('../challenge-connected-report-view.mjs',import.meta.url),'utf8');
const css=readFileSync(new URL('../challenge-connected-report.css',import.meta.url),'utf8');
const scenario='An engineer decides to approve three stacked GitHub pull requests; an agent submits those reviews through GitHub API.';
const response={
  conclusions:[{application:'Explore restricted approval execution.',scenarioBasis:'The engineer decides and the agent submits.',openQuestion:'How are review decisions bound to a revision?',basisType:'engineering-judgment',citations:[]}],
  counterargument:'A simpler native workflow may suffice.',
  challenges:[{question:'Could a rebase invalidate authorization?',reason:'An agent might approve a different revision.',tests:['Try a stale-SHA approval'],alternatives:['Use a scoped batch approval executor']}],
  alternatives:['Improve notifications and native review routing'],
  facts:[{statement:'An engineer decides.',support:'explicit-user-statement'},{statement:'Credential boundaries unknown.',support:'unknown'}],
  unknowns:['No confirmed API action log'],
  expectedSafeguards:[
    {objective:'Bind to exact revision',why:'Prevent stale approval.',implementation:'reported-partial',implementationBasis:'User described partial SHA checks',referenceIds:['GH-REVIEW']},
    {objective:'Reconcile review outcomes',why:'Detect unmatched events.',implementation:'not-assessed',referenceIds:[]}
  ],
  clarifications:[{question:'Are API actions tied to the human decision?',why:'Determines approval fidelity.'}],
  engineeringReferences:[
    {id:'GH-REVIEW',title:'GitHub review API',publisher:'GitHub Docs',url:'https://docs.github.com/en/rest/pulls/reviews',facts:['Review records include review ID and commit SHA'],limits:'API data does not establish human intent.',modelUsed:true},
    {id:'BAD',title:'Bad link',url:'javascript:alert(1)',facts:['Untrusted content'],modelUsed:false}
  ]
};
test('delegated human approvals use an optional reconciliation question, not asserted implementation',()=>{
  assert.equal(isHumanDelegatedApprovalScenario(scenario),true);
  assert.equal(isHumanDelegatedApprovalScenario('An engineer reviews and approves four stacked pull requests. An agent submits those approvals.'),true);
  const p=projectConnectedReport(response,scenario);
  assert.match(p.reconciliation.title,/human authorization/i);
  assert.equal(p.reconciliation.status,'Not assessed');
  assert.deepEqual(p.reconciliation.stages.map(x=>x.label),['Human decision','Agent / API action','Recorded review']);
  assert.match(p.reconciliation.note,/not a claim/);
});
test('unrelated engineering proposal does not receive GitHub-specific reconciliation',()=>{
  const p=projectConnectedReport(response,'A worker rotates cloud credentials to reduce manual toil.');
  assert.equal(p.reconciliation,null);
  assert.equal(isHumanDelegatedApprovalScenario('An AI agent autonomously approves code'),false);
  assert.equal(isHumanDelegatedApprovalScenario('For a subset of low-risk pull requests, an engineer reviews a PR Plan that defines acceptance criteria. An agent evaluates the final change against the plan and decides whether to submit an approval.'),false);
});
test('risk and assurance do not invent disposition, acceptance, verification, or evidence',()=>{
  const p=projectConnectedReport(response,scenario);
  assert.match(p.perspectives.risk.action,/not been determined/);
  assert.match(p.perspectives.assurance.action,/does not contain a separately substantiated/);
  assert.equal(p.perspectives.engineering.action,'Try a stale-SHA approval');
  assert.equal(p.perspectives.engineering.items[0],'Improve notifications and native review routing');
  assert.equal(p.safeguards[0].implementation,'Partial · user-reported');
  assert.equal(p.safeguards[1].implementation,'Unknown');
  assert.equal(p.safeguards[0].statusBasis,'User described partial SHA checks');
});
test('source cards are genuine selected references with links and caveats, not manufactured source claims',()=>{
  const p=projectConnectedReport(response,scenario);
  assert.equal(p.references.length,1);
  assert.equal(p.references[0].id,'GH-REVIEW');
  assert.equal(p.references[0].used,true);
  assert.match(p.references[0].limits,/does not establish human intent/);
});
test('invalid response cannot generate a plausible connected report',()=>{
  assert.equal(projectConnectedReport(null,scenario),null);
  assert.equal(projectConnectedReport({},scenario),null);
});
test('live report is opt-in reversible and retains current API and clarification flow',()=>{
  for(const id of ['cdr-toggle','cdr-preview','refine-panel','result'])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/import \{renderConnectedReport\}/);
  assert.match(html,/renderConnectedReport\(el\('cdr-preview'\),data,scenario\)/);
  assert.match(html,/setConnectedReportMode\(previewReady\)/);
  assert.match(html,/showAssessment\(\)/);
  assert.match(css,/#result\.cdr-active > :not\(#cdr-controls\):not\(#cdr-preview\)/);
  assert.match(view,/projectConnectedReport\(response,scenarioText\)/);
  assert.match(view,/Next consideration by role/);
  assert.match(view,/What could change the recommendation/);
  assert.match(view,/setAttribute\('role','tablist'\)/);
  assert.match(view,/activate\('brief'\)/);
  assert.match(view,/panel.hidden=!active/);
  assert.doesNotMatch(view,/\bfetch\s*\(|XMLHttpRequest|innerHTML|localStorage/);
});
test('new view contains neutral audience terminology',()=>{
  const artifacts=[view,css].join('\n');
  for(const word of ['Jon','Chase','Andrew','Braze','Fast Track'])
    assert.doesNotMatch(artifacts,new RegExp('\\b'+word+'\\b','i'));
});
