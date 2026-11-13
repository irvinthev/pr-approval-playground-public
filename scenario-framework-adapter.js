// Scenario retrieval adapter. Source facts live ONLY in framework-source-catalog.js.
// This heuristic, closed-vocabulary adapter is NOT an LLM and does not validate a real architecture.
import {sourceCatalog} from './framework-source-catalog.js';

export const CHALLENGE_V1 = '0.1.0';
const TOPICS = Object.freeze([
  {id:'authorization',title:'Who has change-approval authority?',terms:/\b(approv(?:al|e|ed|er|ing)?|sign.?off|delegate(?:d|s|ion)?|authorize|review plan|codeowner|code owner|merge)\b/i,provisions:['COSAI-AGENTIC:HUMAN','OWASP-2026:LLM03','SSDF:PS.1'],
  question:'Is approval of a plan, a policy delegation, or the actual change intended—and which enforceable mechanism distinguishes those acts?',
  alternatives:['Human approves the exact change','Independently governed policy delegates approval for a bounded class'],
  tests:['Attempt automated approval outside the delegated class','Attempt change with an unauthorized reviewer or bot identity']},
  {id:'review-quality',title:'Can the AI assessment be relied upon?',terms:/\b(bugbot|review(?:er|s|ing)?|model|llm|classif(?:y|ication)|score|test(?:s|ing)?|false positive|false negative|agent(?:s)?)\b/i,provisions:['AI-RMF:MEASURE-2.1','AI-RMF:MEASURE-2.3','AI-RMF:MEASURE-1.3'],
  question:'What adjudicated unsafe examples and shared-failure cases establish the reviewers’ actual detection limits?',
  alternatives:['AI assessment remains advisory','Validated AI checks support a separate policy decision'],
  tests:['Run known unsafe and ambiguous changes','Compare individual reviewers and correlated false-low classifications']},
  {id:'trust-input',title:'Can untrusted inputs manipulate the agent?',terms:/\b(prompt|inject(?:ion|ed)?|instruction(?:s)?|comment(?:s)?|untrusted|tool call|context|readme)\b/i,provisions:['OWASP-2026:LLM01','COSAI-AGENTIC:BOUNDED'],
  question:'Which user-controlled text can reach agent instructions or tools, and how is it prevented from changing policy?',
  alternatives:['Separate untrusted PR content from governing instructions','Enforce restricted tool rights outside the model'],
  tests:['Inject approval instructions into a PR description','Attempt prohibited tool actions via untrusted content']},
  {id:'config',title:'Who can change the control mechanism?',terms:/\b(ruleset|policy|configuration|config|threshold|admin|credential|permission|token|bypass|allowlist|denylist|self.modify|governance)\b/i,provisions:['SSDF:PS.1','COSAI-AGENTIC:BOUNDED','OWASP-2026:LLM03'],
  question:'Can the contributor or agent modify the rules, reviewer configuration or identities governing its own change?',
  alternatives:['Separate policy administration from contributors','Enforce least privilege and record protected configuration changes'],
  tests:['Attempt unauthorized policy edits','Attempt bypass using service identities']},
  {id:'revision',title:'Does the authorization cover the correct revision?',terms:/\b(sha|commit|rebase|force.push|push|stale|revision|branch|pull request|pr\b|merge.queue)\b/i,provisions:['SSDF:PO.4','SLSA:SOURCE-TRACK'],
  question:'How are review evidence, required CI and authorization invalidated when the evaluated revision changes?',
  alternatives:['Bind all assessments to a commit identity','Route unverifiable or stale decisions to fresh human review'],
  tests:['Push a new commit after approval','Attempt merge with reviews bound to a prior SHA']},
  {id:'release',title:'Can the approved change be traced into production?',terms:/\b(deploy(?:ment|ed|s)?|release|production|artifact|build|pipeline|ci\/cd|buildkite|jenkins|provenance|roll.?back)\b/i,provisions:['SLSA:BUILD-PROVENANCE','COSAI-AGENTIC:VERIFIABLE'],
  question:'What independently establishes that the deployed artifact came from the tested and authorized source?',
  alternatives:['Require release provenance and immutable artifact mapping','Constrain deployment identities and exception paths'],
  tests:['Substitute an artifact after approval','Exercise an emergency deployment bypass']},
  {id:'monitoring',title:'How are failures detected and automation suspended?',terms:/\b(monitor|drift|vendor|update|incident|alert|canary|outage|kill.switch|fallback|rollback|retrain)\b/i,provisions:['AI-RMF:MEASURE-1.2','COSAI-AGENTIC:VERIFIABLE'],
  question:'Who owns the signals and what specific condition suspends automated decisions or returns to humans?',
  alternatives:['Monitor independent telemetry and human adjudications','Require a tested disable-and-fallback route'],
  tests:['Change a model version without updating the policy','Simulate missing or delayed monitoring events']}
]);
const uniq=x=>[...new Set(x)];
export function normalizeFrameworkCatalog(catalog=sourceCatalog){
  const sources=new Map(catalog.sources.map(s=>[s.id,s]));
  const provisions=new Map(catalog.provisions.map(p=>[p.id,p]));
  const issues=[];
  if(sources.size!==catalog.sources.length)issues.push('Duplicate framework source IDs');
  if(provisions.size!==catalog.provisions.length)issues.push('Duplicate provision IDs');
  for(const p of catalog.provisions)if(!sources.has(p.sourceId))issues.push('Unknown source for '+p.id);
  for(const m of catalog.mappings)if(!provisions.has(m.provisionId))issues.push('Unknown provision in mapping '+m.controlId+': '+m.provisionId);
  return Object.freeze({schemaVersion:catalog.schemaVersion,asOf:catalog.asOf,sources,provisions,mappings:catalog.mappings,issues});
}
export const frameworkIndex=normalizeFrameworkCatalog();
export function analyzeScenario(raw){
  const text=String(raw??'').trim().slice(0,4000);
  const matched=text ? TOPICS.filter(t=>t.terms.test(text)) : [];
  const topics=matched.slice(0,5);
  const references=uniq(topics.flatMap(t=>t.provisions)).map(id=>{
    const p=frameworkIndex.provisions.get(id);
    const s=p&&frameworkIndex.sources.get(p.sourceId);
    return p&&s ? {id:p.id,title:p.title,sourceTitle:s.title,sourceId:s.id,sourceVersion:s.version,sourceStatus:s.status,sourceUrl:p.url||s.url,qualification:p.qualification||s.limitations||'',reviewStatus:p.reviewStatus||'unverified',mappingStatus:'Suggested applicability only; not an approved control mapping'}:null;
  }).filter(Boolean);
  return {
    input:text,
    version:CHALLENGE_V1,
    catalogVersion:frameworkIndex.schemaVersion,
    catalogAsOf:frameworkIndex.asOf,
    detectionMethod:'Transparent keyword matching (not generative interpretation)',
    topics:topics.map(({terms,...t})=>t),
    references,
    uncertainties:[
      'The scenario is a user statement, not verified system evidence.',
      'Relevant systems, actors, reviewer authority and effective permissions are not established.',
      'This tool does not verify policy requirements, framework applicability or control effectiveness.',
      ...(matched.length>topics.length?['Only the first five recognized topics are shown; coverage is incomplete.']:[]),
      ...(!topics.length?['No supported keyword-based topic matched; the tool cannot infer the architecture.']:[])
    ],
    coverage:matched.length ? 'Illustrative matches requiring human review' : 'Unsupported / insufficient information',
    recommendedNext:topics[0]?.question || 'Who acts on the change, what action can they take, and which system independently permits or blocks it?'
  };
}
export function getTopicIds(){return TOPICS.map(x=>x.id);}
