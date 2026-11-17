// Pure validation contract between a future private LLM backend and the public educational UI.
// Does not invoke a model. Framework records remain canonical in framework-source-catalog.js.
import {sourceCatalog} from './framework-source-catalog.js';

export const AGENT_CONTRACT_VERSION = '0.1.0';
const knownProvisions=new Map(sourceCatalog.provisions.map(p=>[p.id,p]));
const knownSources=new Map(sourceCatalog.sources.map(s=>[s.id,s]));
const maxLength=(v,n)=>String(v??'').trim().slice(0,n);
const strings=(arr,maxItems,maxChars)=>Array.isArray(arr)?arr.slice(0,maxItems).filter(x=>typeof x==='string').map(x=>maxLength(x,maxChars)).filter(Boolean):[];
const choices=['explicit-user-statement','inference','unknown'];
const isPlainObject=o=>o!==null && typeof o==='object' && !Array.isArray(o);
function validateFact(f){
 if(!isPlainObject(f)||!choices.includes(f.support))return null;
 const statement=maxLength(f.statement,500);
 if(!statement)return null;
 return {statement,support:f.support};
}
function validateChallenge(ch){
 if(!isPlainObject(ch))return null;
 const question=maxLength(ch.question,500);
 if(!question)return null;
 return {question,reason:maxLength(ch.reason,650),tests:strings(ch.tests,5,350),alternatives:strings(ch.alternatives,4,350)};
}
// The model's leading judgment is advisory only, never an authorization.
// It is optional for backwards compatibility with earlier valid responses.
function validateRecommendation(item){
 if(!isPlainObject(item))return null;
 const judgment=maxLength(item.judgment,260),why=maxLength(item.why,500);
 const failureCondition=maxLength(item.failureCondition,400),alternative=maxLength(item.alternative,400);
 const decisionChanger=maxLength(item.decisionChanger,400);
 if(!judgment||!why||!failureCondition||!alternative||!decisionChanger)return null;
 return {judgment,why,failureCondition,alternative,decisionChanger};
}
// A compact linked architecture-risk model for the two local views.
// Gemini proposes relationships by 1-based indexes; the server assigns stable,
// display-only R-01 / C-01 IDs after checking every index.
function validateRiskItem(item){
 if(!isPlainObject(item))return null;
 const title=maxLength(item.title,120),trigger=maxLength(item.trigger,360),impact=maxLength(item.impact,360);
 const category=maxLength(item.category,80);
 if(!title||!trigger||!impact||!category)return null;
 return {title,trigger,impact,category};
}
function validateSafeguardItem(item,riskCount){
 if(!isPlainObject(item))return null;
 const fields=['name','why','authority','enforcement','evidence','negativeTest','proof','gap'];
 const limits=[120,320,330,430,340,360,360,330];
 const obj={};
 for(let i=0;i<fields.length;i++)obj[fields[i]]=maxLength(item[fields[i]],limits[i]);
 if(fields.some(field=>!obj[field]))return null;
 const indices=item.riskIndexes;
 if(!Array.isArray(indices)||!indices.length||indices.length>riskCount ||
    indices.some(n=>!Number.isInteger(n)||n<1||n>riskCount)||new Set(indices).size!==indices.length)return null;
 return {...obj,riskIndexes:indices};
}
function validateAssessment(item){
 if(!isPlainObject(item))return null;
 const risk=maxLength(item.risk,350),expectedControl=maxLength(item.expectedControl,450);
 if(!risk||!expectedControl)return null;
 const refs=Array.isArray(item.citationIds)?item.citationIds.slice(0,6):[];
 return {risk,expectedControl,demonstration:strings(item.demonstration,5,240),citationIds:refs};
}
function citeProvision(id){
 const p=knownProvisions.get(id),s=p&&knownSources.get(p.sourceId);
 if(!p||!s||!/^https:\/\//.test(p.url||s.url||''))return null;
 return {provisionId:p.id,provisionTitle:p.title,sourceId:s.id,sourceTitle:s.title,sourceVersion:s.version,sourceStatus:s.status,url:p.url||s.url,qualification:p.qualification||s.limitations||'',reviewStatus:p.reviewStatus||'unreviewed'};
}
export function validateAgentResponse(input,{scenarioText}={}){
 const errors=[];
 if(!isPlainObject(input))return {ok:false,errors:['Response must be an object'],data:null};
 if(input.contractVersion!==AGENT_CONTRACT_VERSION)errors.push('Unknown contract version');
 const scenario=maxLength(scenarioText,4000);
 if(!scenario)errors.push('Original scenario is required for binding');
 if(input.scenarioDigest !== undefined)errors.push('External model cannot assert its own trusted scenario digest');
 const recommendation=input.recommendation===undefined?null:validateRecommendation(input.recommendation);
 // Older structured responses remain accepted, but no missing technical
 // details are invented to populate the new Safeguard Explorer.
 const receivedRisks=input.risks;
 const receivedSafeguards=input.safeguards;
 const risks=Array.isArray(receivedRisks)?receivedRisks.slice(0,4).map(validateRiskItem):[];
 const safeguards=Array.isArray(receivedSafeguards)?receivedSafeguards.slice(0,5).map(s=>validateSafeguardItem(s,risks.length)):[];
 if(receivedRisks!==undefined&&(!Array.isArray(receivedRisks)||risks.length===0||risks.some(x=>!x)))
   errors.push('Malformed risk assessment items');
 if(receivedSafeguards!==undefined&&(!Array.isArray(receivedSafeguards)||safeguards.length===0||safeguards.some(x=>!x)))
   errors.push('Malformed safeguard model');
 if((receivedRisks===undefined)!==(receivedSafeguards===undefined))
   errors.push('Risks and safeguards must be provided together');
 if(input.recommendation!==undefined && !recommendation)errors.push('Malformed leading recommendation');
 const facts=Array.isArray(input.facts)?input.facts.slice(0,12).map(validateFact).filter(Boolean):[];
 const challenges=Array.isArray(input.challenges)?input.challenges.slice(0,6).map(validateChallenge).filter(Boolean):[];
 const ids=Array.isArray(input.citationIds)?input.citationIds.slice(0,20):[];
 const assessments=Array.isArray(input.assessments)?input.assessments.slice(0,3).map(validateAssessment).filter(Boolean):[];
 if(input.assessments!==undefined && (!Array.isArray(input.assessments)||assessments.length===0))errors.push('Malformed control assessment');
 const citations=[],seen=new Set();
 for(const item of assessments){
   for(const id of item.citationIds){
     if(typeof id!=='string'||!knownProvisions.has(id))errors.push('Unsupported assessment citation: '+maxLength(id,80));
     else if(!ids.includes(id))errors.push('Assessment citation not in validated response references: '+id);
   }
 }
 for(const id of ids){
   if(typeof id!=='string'){errors.push('Nonstring citation ID');continue;}
   const citation=citeProvision(id);
   if(!citation){errors.push('Unsupported catalog citation: '+maxLength(id,80));continue;}
   if(!seen.has(id)){citations.push(citation);seen.add(id);}
 }
 if(challenges.length===0)errors.push('At least one challenge question is required');
 if(facts.length===0)errors.push('At least one explicit fact, inference or unknown is required');
 if(citations.length===0)errors.push('No validated framework citations');
 const state={
   contractVersion:AGENT_CONTRACT_VERSION,
   scenarioText:scenario,
   catalogVersion:sourceCatalog.schemaVersion,
   catalogAsOf:sourceCatalog.asOf,
   recommendation,
   risks:risks.filter(Boolean).map((item,i)=>({...item,id:'R-'+String(i+1).padStart(2,'0')})),
   safeguards:safeguards.filter(Boolean).map((item,i)=>({
     ...item,id:'C-'+String(i+1).padStart(2,'0'),
     riskIds:item.riskIndexes.map(n=>'R-'+String(n).padStart(2,'0'))
   })),
   facts,
   challenges,
   assessments:assessments.map(a=>({...a,sourceStatus:'suggested-relevance-only',evidenceStatus:'not-demonstrated',assessmentStatus:'not-assessed'})),
   citations,
   unknowns:strings(input.unknowns,12,400),
   alternatives:strings(input.alternatives,6,400),
   // This is model-derived technical reasoning, not an attestation of implementation or compliance.
   provenance:{kind:'unverified-model-interpretation',frameworkRelationships:'proposed-unvalidated',decisionStatus:'no-approval-or-certification'}
 };
 return {ok:errors.length===0,errors,data:errors.length===0?state:null};
}
// Construct a backend request with no credentials, URLs, real PR details or hidden privilege claim.
// A separate approved server must perform content screening, privacy controls, authentication,
// model access, prompt assembly, citation checks and rate limiting.
export function createInterpretationRequest(scenarioText){
 const scenario=maxLength(scenarioText,4000);
 if(!scenario)return {ok:false,error:'Scenario text is required'};
 return {ok:true,contractVersion:AGENT_CONTRACT_VERSION,scenarioText:scenario,requestedCapabilities:['scenario-interpretation','architecture-challenges','framework-citation-ids']};
}
