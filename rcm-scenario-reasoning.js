// One explicit example, not a new scoring or compliance engine.
import {controls} from './rcm-explorer-data.js';
import {sourceCatalog} from './framework-source-catalog.js';
const controlIds=['WEB15:AI-04','WEB15:AI-05','WEB15:AI-06','WEB15:AI-07'];
const sourceIds=['OWASP-2026:LLM01','OWASP-2026:LLM03','COSAI-AGENTIC:BOUNDED'];
export function explainAdversarialReview({useCase='approval',authority='authorize',risks=[]}={}){
 if(useCase!=='approval'||!risks.includes('injection'))return null;
 if(!['advisory','authorize','execute'].includes(authority))return null;
 const canAuthorize=authority!=='advisory';
 const consequence=authority==='execute'
  ?'The reviewer could influence a privileged execution path. Independent approval and release checks must prevent an unsafe action.'
  :canAuthorize
  ?'A manipulated low-risk assessment could influence automated approval. An independent policy gate must reject an unauthorized merge.'
  :'The reviewer only advises. A human or separate enforcement gate still needs to reject an unsafe approval.';
 const check=authority==='execute'
  ?'Inject a hostile PR comment, then attempt prohibited approval and release. Verify both fail at independent enforcement.'
  :canAuthorize
  ?'Inject a hostile PR comment and attempt an ineligible or stale-revision approval. Confirm the policy gate blocks merge.'
  :'Inject a hostile PR comment. Confirm the AI output cannot itself satisfy an approval requirement or bypass human review.';
 const guards=controlIds.map(id=>controls.find(c=>c.id===id));
 const references=sourceIds.map(id=>sourceCatalog.provisions.find(p=>p.id===id));
 if(guards.some(x=>!x)||references.some(x=>!x))throw new Error('Scenario references missing from canonical inventories');
 return {
  id:'adversarial-pr-comment',
  title:'A PR comment tries to instruct the AI reviewer',
  failure:'Untrusted PR text tells the reviewer to ignore policy and call the change safe.',
  consequence,owner:'Engineering owns approval enforcement and agent permissions; AI/reviewer owners validate behavior. Assign named owners in a real implementation.',
  safeguards:guards.map(c=>({id:c.id,title:c.title})),
  check,
  references:references.map(p=>({id:p.id,label:p.provisionId+' · '+p.title,url:p.url,scope:'Related threat or design principle — not an approved control mapping'})),
  status:'Illustrative reasoning. Actual applicability, controls and evidence require evaluation.'
 };
}
