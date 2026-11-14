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
function citeProvision(id){
 const p=knownProvisions.get(id),s=p&&knownSources.get(p.sourceId);
 if(!p||!s||!/^https:\/\//.test(p.url||s.url||''))return null;
 return {provisionId:p.id,sourceLocator:p.provisionId,provisionTitle:p.title,sourceSummary:p.summary,sourceId:s.id,sourceTitle:s.title,sourceVersion:s.version,sourceStatus:s.status,url:p.url||s.url,qualification:p.qualification||s.limitations||'',reviewStatus:p.reviewStatus||'unreviewed'};
}
function validateConclusion(conclusion, citations){
 if(!isPlainObject(conclusion))return null;
 const {scenarioBasis, application, openQuestion, citationIds}=conclusion;
 if([scenarioBasis,application,openQuestion].some(text=>typeof text!=='string' || !text.trim()))return null;
 if(!Array.isArray(citationIds) || citationIds.length>3 ||
    citationIds.some(id=>!citations.has(id)) || new Set(citationIds).size!==citationIds.length)return null;
 return {
   scenarioBasis:maxLength(scenarioBasis,450),
   application:maxLength(application,650),
   openQuestion:maxLength(openQuestion,400),
   citations:citationIds.map(id=>citations.get(id))
 };
}
const submissionStates=['submitted','not-submitted','unknown'];
const gateStates=['accepted','rejected','unknown'];
const mergeStates=['merged','not-merged','unknown'];
function validateApprovalOutcome(outcome){
 if(!isPlainObject(outcome))return null;
 const {review,submission,gate,merge}=outcome;
 if(typeof review!=='string' || !review.trim() ||
    !submissionStates.includes(submission) || !gateStates.includes(gate) || !mergeStates.includes(merge))return null;
 if(submission==='not-submitted' && gate==='accepted')return null;
 return {review:maxLength(review,240),submission,gate,merge};
}
export function validateAgentResponse(input,{scenarioText,requireGrounding=false}={}){
 const errors=[];
 if(!isPlainObject(input))return {ok:false,errors:['Response must be an object'],data:null};
 if(input.contractVersion!==AGENT_CONTRACT_VERSION)errors.push('Unknown contract version');
 const scenario=maxLength(scenarioText,4000);
 if(!scenario)errors.push('Original scenario is required for binding');
 if(input.scenarioDigest !== undefined)errors.push('External model cannot assert its own trusted scenario digest');
 const facts=Array.isArray(input.facts)?input.facts.slice(0,12).map(validateFact).filter(Boolean):[];
 const challenges=Array.isArray(input.challenges)?input.challenges.slice(0,6).map(validateChallenge).filter(Boolean):[];
 const ids=Array.isArray(input.citationIds)?input.citationIds.slice(0,20):[];
 const citations=[],seen=new Set();
 for(const id of ids){
   if(typeof id!=='string'){errors.push('Nonstring citation ID');continue;}
   const citation=citeProvision(id);
   if(!citation){errors.push('Unsupported catalog citation: '+maxLength(id,80));continue;}
   if(!seen.has(id)){citations.push(citation);seen.add(id);}
 }
 if(challenges.length===0)errors.push('At least one challenge question is required');
 if(facts.length===0)errors.push('At least one explicit fact, inference or unknown is required');
 if(citations.length===0)errors.push('No validated framework citations');
 let conclusions,approvalOutcomes;
 if(requireGrounding){
   approvalOutcomes=Array.isArray(input.approvalOutcomes) && input.approvalOutcomes.length<=4
     ? input.approvalOutcomes.map(validateApprovalOutcome) : null;
   if(!approvalOutcomes || approvalOutcomes.some(outcome=>!outcome)){
     errors.push('Invalid approval outcomes');
   }
   const byId=new Map(citations.map(c=>[c.provisionId,c]));
   conclusions=Array.isArray(input.conclusions) && input.conclusions.length>=1 && input.conclusions.length<=3
     ? input.conclusions.map(conclusion=>validateConclusion(conclusion,byId)) : [];
   if(!conclusions.length || conclusions.some(conclusion=>!conclusion)){
     errors.push('Expected 1–3 conclusions with scenario basis, application, open question and canonical citation IDs');
   }else if(citations.some(citation=>!conclusions.some(conclusion=>conclusion.citations.includes(citation)))){
     errors.push('Every framework citation must support a specific conclusion');
   }
 }
 const state={
   contractVersion:AGENT_CONTRACT_VERSION,
   scenarioText:scenario,
   catalogVersion:sourceCatalog.schemaVersion,
   catalogAsOf:sourceCatalog.asOf,
   facts,
   challenges,
   citations,
   ...(requireGrounding ? {conclusions,approvalOutcomes} : {}),
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
