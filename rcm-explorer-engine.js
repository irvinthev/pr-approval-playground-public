import {controls} from './rcm-explorer-data.js';

export const useCases={
 approval:{label:'AI code review & approval',ids:['AI-01','AI-03','AI-05','AI-07','AI-08','AI-09']},
 agent:{label:'Autonomous engineering agents',ids:['AI-03','AI-04','AI-06','AI-07','AI-14']},
 deployment:{label:'AI-enabled CI/CD & deployment',ids:['AI-04','AI-08','AI-10','AI-11','AI-13']},
 decision:{label:'AI-powered business decisioning',ids:['AI-02','AI-05','AI-06','AI-12','AI-14']}
};
export const riskAreas={
 scope:{label:'Scope & eligibility',ids:['AI-01','AI-02','AI-07','AI-09','AI-15']},
 sod:{label:'Approval authority & SoD',ids:['AI-03','AI-04','AI-07','AI-09','AI-15']},
 accuracy:{label:'AI false approvals',ids:['AI-05','AI-06','AI-09','AI-14']},
 injection:{label:'Prompt injection',ids:['AI-04','AI-06','AI-05']},
 delivery:{label:'Release integrity',ids:['AI-08','AI-10','AI-11','AI-13']},
 monitoring:{label:'Model drift & incidents',ids:['AI-12','AI-13','AI-14']},
 evidence:{label:'Evidence & population',ids:['AI-07','AI-08','AI-10','AI-12']},
 governance:{label:'Model & policy governance',ids:['AI-02','AI-03','AI-14','AI-15']}
};
export const authorityLevels={advisory:'Advisory only',authorize:'Can authorize a change',execute:'Can execute or deploy'};
export const families={'AI RMF':'NIST AI Risk Management Framework',SSDF:'NIST Secure Software Development Framework',OWASP:'OWASP LLM Top 10',SLSA:'SLSA supply-chain provenance',PCAOB:'PCAOB auditing standards'};
const elevated=new Set(['AI-03','AI-04','AI-07','AI-08','AI-09','AI-10','AI-11','AI-15']);
const financial=new Set(['AI-01','AI-02','AI-03','AI-07','AI-08','AI-09','AI-10','AI-11','AI-12']);
const bare=id=>id.replace(/^WEB15:/,'');
export function frameworkFamilies(text){
 const found=[];
 if(/AI RMF/i.test(text))found.push('AI RMF');
 if(/SSDF/i.test(text))found.push('SSDF');
 if(/OWASP/i.test(text))found.push('OWASP');
 if(/SLSA/i.test(text))found.push('SLSA');
 if(/PCAOB/i.test(text))found.push('PCAOB');
 return found;
}
export function recommend({useCase='approval',authority='authorize',risks=['scope','sod','accuracy'],financialImpact=false}={}){
 if(!useCases[useCase]||!authorityLevels[authority])throw new Error('Unknown scenario or authority');
 const selected=[...new Set(risks)].filter(r=>riskAreas[r]);
 return controls.map(c=>{
  const id=bare(c.id);let score=0;const reasons=[];
  if(useCases[useCase].ids.includes(id)){score+=3;reasons.push('Related to selected workflow');}
  for(const risk of selected){if(riskAreas[risk].ids.includes(id)){score+=4;reasons.push('Addresses '+riskAreas[risk].label.toLowerCase());}}
  if(authority!=='advisory'&&elevated.has(id)){score+=2;reasons.push('Relevant to delegated '+(authority==='execute'?'execution':'authorization'));}
  if(financialImpact&&financial.has(id)){score+=3;reasons.push('Potential financial-reporting relevance; actual ICFR scope unassessed');}
  return {...c,score,reasons,frameworkFamilies:frameworkFamilies(c.framework),recommended:score>=5};
 }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
export function rowsForExport(items){
 return [
  ['Source-qualified ID','Control title','Risk','Objective','Safeguard activity','Evidence request','Testing approach','Framework relationship','Applicability caveat','Recommendation rationale','Implementation status'],
  ...items.map(c=>[c.id,c.title,c.risk,c.objective,c.activity,c.evidence,c.test,c.framework,c.applicability,c.reasons.join('; '),'Not assessed — illustrative candidate'])
 ];
}
