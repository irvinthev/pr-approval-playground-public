import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AGENT_CONTRACT_VERSION,validateAgentResponse} from '../challenge-agent-contract.js';
import {projectConnectedReport,projectDecisionChallenge} from '../challenge-connected-report-data.mjs';
import {buildModelRequest,validateRequest} from '../api/challenge.js';

const original='An engineer reviews three stacked GitHub pull requests and explicitly approves each. Claude submits them in one batch. One PR may change before submission.';
const challenge={
 objective:'Reduce repeated GitHub review submissions without delegating the review judgment.',
 tension:'PR-2 changes after the engineer authorized its original revision.',
 question:'Should the executor pause the batch or process unaffected authorized PRs?',
 boundary:{
  decision:'Engineer explicitly approves each PR revision.',
  execution:'Claude submits reviews using an execution identity and tool path not yet confirmed.',
  enforcement:'GitHub applies applicable merge requirements; effective settings unknown.'
 },
 options:[
  {
   label:'Pause all submissions',
   consequence:'None of the three approvals is submitted until the engineer rechecks the stack.',
   tradeoff:'Simpler recovery, but may delay unaffected reviews.',
   verification:'Check a rebase just before submission and confirm every action pauses.',
   managementImplication:'Fewer partial states, at a potential cost in time saved.',
   safeguardIndex:1
  },{
   label:'Proceed only with still-authorized reviews',
   consequence:'Only reviews tied to unchanged, dependency-safe revisions are submitted.',
   tradeoff:'More throughput, but complex dependency and partial-completion handling.',
   verification:'Rebase PR-2 and compare execution, commit identities and dependency decisions.',
   managementImplication:'Potentially more throughput, with more operational recovery complexity.',
   safeguardIndex:1
  }
 ]
};
const response={
 contractVersion:AGENT_CONTRACT_VERSION,
 facts:[{statement:'The engineer authorizes decisions for each PR.',support:'explicit-user-statement'}],
 challenges:[{question:'Can a stale revision be approved?',reason:'A PR may change before the execution.'}],
 conclusions:[{scenarioBasis:'Human decides, agent submits.',application:'Consider a bounded pilot only with revision-binding.',openQuestion:'Is each revision checked immediately before execution?',basisType:'engineering-judgment',citationIds:[]}],
 approvalOutcomes:[],citationIds:[],
 expectedSafeguards:[
  {objective:'Capture explicit human authorization',why:'Avoid agent-generated decisions.',implementation:'not-assessed',referenceIds:[]},
  {objective:'Check the authorized commit before execution',why:'Prevent stale approvals.',implementation:'not-assessed',referenceIds:[]}
 ],
 clarifications:[],counterargument:'A simpler GitHub CLI action may reduce clicks.',
 alternatives:['A GitHub CLI batch script with explicit per-PR confirmation.'],
 decisionChallenge:challenge
};
function validate(value,scenario=original){
 const result=validateAgentResponse(value,{scenarioText:scenario,requireGrounding:true});
 assert.equal(result.ok,true,JSON.stringify(result.errors));
 return result.data;
}
test('V6 decision challenge is optional, grounded and survives the API contract',()=>{
 const data=validate(response);
 assert.equal(data.decisionChallenge.options.length,2);
 const report=projectConnectedReport(data,original);
 assert.equal(report.decisionChallenge.options[1].label,'Proceed only with still-authorized reviews');
 assert.equal(report.decisionChallenge.options[1].safeguardIndex,1);
 assert.equal(report.safeguards[1].implementation,'Unknown');
});
test('invalid option indices, non-text impacts, duplicate choices and missing boundaries suppress only the optional comparison',()=>{
 const cases=[
  {...challenge,options:[{...challenge.options[0],safeguardIndex:99},challenge.options[1]]},
  {...challenge,options:[{...challenge.options[0],consequence:{secret:'x'}},challenge.options[1]]},
  {...challenge,options:[challenge.options[0],{...challenge.options[1],label:challenge.options[0].label}]},
  {...challenge,boundary:{decision:'human'}},
  {...challenge,options:[challenge.options[0]]}
 ];
 for(const invalid of cases){
  const data=validate({...response,decisionChallenge:invalid});
  assert.equal(data.decisionChallenge,undefined);
  assert.ok(data.advisoryWarnings.some(w=>w.includes('decision comparison')));
  assert.equal(projectConnectedReport(data,original).decisionChallenge,null);
 }
});
test('four different scenario domains do not require a PR-specific or invented decision',()=>{
 const proposals=[
  original,
  'An agent reads GitHub pull requests and summarizes code for an engineer.',
  'An agent decides which low-risk PRs to approve under a policy.',
  'A worker rotates production service credentials across cloud consumers.'
 ];
 for(const proposal of proposals){
  const base=validate({...response,decisionChallenge:undefined},proposal);
  const report=projectConnectedReport(base,proposal);
  assert.equal(report.decisionChallenge,null);
  assert.ok(report.recommendation);
  assert.ok(report.safeguards.length);
 }
});
test('model instructions permit null instead of fabricated dilemmas and disallow conflated architecture alternatives',()=>{
 const request=buildModelRequest(validateRequest({scenarioText:original,assessment:true}));
 const prompt=request.messages[0].content;
 assert.match(prompt,/decisionChallenge: OPTIONAL/);
 assert.match(prompt,/SAME design dimension/);
 assert.match(prompt,/decisionChallenge:null/);
 assert.match(prompt,/Do not assume every scenario concerns GitHub/);
});
test('V6 UI is a single text-only report, and clarification still uses the real API only on user action',()=>{
 const html=fs.readFileSync(new URL('../private-challenge.html',import.meta.url),'utf8');
 const view=fs.readFileSync(new URL('../challenge-v6-report-view.mjs',import.meta.url),'utf8');
 const style=fs.readFileSync(new URL('../challenge-v6-report.css',import.meta.url),'utf8');
 assert.match(html,/renderV6Report\(el\('cdr-preview'\)/);
 assert.match(html,/renderConnectedReport\(el\('cdr-preview'\)/);
 assert.match(html,/v6-clarify-mode/);
 assert.match(html,/function refinementFollowupPrompt/);
 assert.match(html,/fetch\('\.\/api\/challenge'/);
 assert.match(html,/setConnectedReportMode\(previewReady\)/);
 for(const text of ['Decision under tension','FAILURE PATH','ENGINEERING SAFEGUARDS','MANAGEMENT CONSIDERATIONS','Clarify & reassess with Gemini'])
  assert.match(view,new RegExp(text,'i'));
 assert.match(view,/data-v6-selection/);
 assert.match(view,/data-v6-safeguard/);
 assert.match(view,/setTab\('failure'\)/);
 assert.match(view,/const challenge=project\.decisionChallenge/);
 assert.doesNotMatch(view,/fetch\s*\(|innerHTML|eval\s*\(/);
 assert.match(style,/@media\(max-width:560px\)/);
 assert.match(style,/v6-clarify-mode/);
});

test('missing or invalid causal traces preserve the primary modeled risk rather than imply absence of failure',()=>{
 const noTrace=validate({...response,riskPath:null,decisionChallenge:undefined});
 const output=projectConnectedReport(noTrace,original);
 assert.equal(output.riskPath,null);
 assert.match(output.leadRisk,/stale revision/i);
 assert.match(output.leadRiskReason,/change before the execution/i);
 assert.equal(output.safeguards.length,2);
 const malformed=validate({...response,decisionChallenge:undefined,riskPath:{
  pathway:'delivery',failure:'Stale authorization',
  uncertainty:'Current merge gates unknown',
  steps:[{stageId:'invented-stage',roles:['origin'],event:'Not grounded',interruption:'',evidence:'None'}]
 }});
 assert.equal(malformed.riskPath,undefined);
 assert.ok(malformed.advisoryWarnings.some(w=>/lifecycle trace/.test(w)));
});
test('model prompt seeks a grounded conditional trace for PR Plan and GitHub tool permission examples',()=>{
 const request=buildModelRequest(validateRequest({scenarioText:original,assessment:true}));
 const prompt=request.messages[0].content;
 assert.match(prompt,/A CONDITIONAL causal hypothesis is useful/);
 assert.match(prompt,/For a PR-Plan-based autonomous approval proposal/);
 assert.match(prompt,/For a PR summarization assistant with local GitHub CLI or MCP credentials/);
 assert.match(prompt,/Use riskPath:null only when no supportable causal sequence/);
});
test('V6 empty-state fallback renders scenario challenge and safeguard rather than an empty failure card',()=>{
 const view=fs.readFileSync(new URL('../challenge-v6-report-view.mjs',import.meta.url),'utf8');
 assert.match(view,/v6-fallback-card/);
 assert.match(view,/project\.leadRiskReason/);
 assert.match(view,/project\.safeguards\[0\]\.objective/);
 assert.match(view,/Inspect engineering safeguards/);
 assert.match(view,/invalidTrace/);
 assert.doesNotMatch(view,/No defensible stage-by-stage failure path was returned/);
 assert.doesNotMatch(view,/No artificial decision was generated/);
});
