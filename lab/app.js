import {evaluate} from './evaluator.js';
import {scenarios,checkDescriptions} from './scenarios.js';
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active=scenarios[0], inputs={...active.inputs}, tab='authority';
const labels={policyEligibility:'Policy eligibility',evidenceCompleteness:'Evidence completeness',authorization:'Authorization',releaseEligibility:'Release eligibility',riskAcceptance:'Risk acceptance'};
const stageText={
authority:['Who grants this AI authority?','Two AI classifications are advisory inputs. Defined scope and an independently governed policy must permit the change before a bot is authorized to act.'],
enforcement:['What prevents an unsafe merge?','Repository/path exclusions, required CI, revision identity and separate administration are independent prerequisites. Missing or conflicting inputs fail closed.'],
evidence:['What does this result prove?','Only that the illustrative evaluator reached this decision for these inputs. A real assurance conclusion also needs complete populations, configuration evidence, negative tests and deployed-artifact traceability.']
};
function render(){
 const result=evaluate({...inputs,sha:active.sha});
 $('#cases').innerHTML=scenarios.map(s=>`<button class="case ${s.id===active.id?'selected':''}" data-case="${s.id}" aria-pressed="${s.id===active.id}"><span class="small">${escape(s.repo)}</span><strong>${escape(s.name)}</strong><span>${escape(s.subtitle)}</span></button>`).join('');
 $('#change').textContent=active.change;$('#repo').textContent=active.repo;$('#sha').textContent=active.sha;
 $('#tabs').innerHTML=['authority','enforcement','evidence'].map((t,i)=>`<button class="${tab===t?'selected':''}" data-tab="${t}" aria-pressed="${tab===t}">0${i+1} / ${t}</button>`).join('');
 $('#stage-title').textContent=stageText[tab][0];$('#stage-detail').textContent=stageText[tab][1];
 $('#switches').innerHTML=Object.entries(checkDescriptions).map(([key,[name,description]])=>`<label class="switch-row"><span><strong>${escape(name)}</strong><small>${escape(description)}</small></span><input type="checkbox" data-key="${key}" ${key==='reviewerA'||key==='reviewerB'?(inputs[key]==='LOW'?'checked':''):(inputs[key]?'checked':'')} aria-label="${escape(name)}"></label>`).join('');
 $('#outcome').textContent=result.outcome.replaceAll('_',' ');
 $('#outcome-box').dataset.tone=result.releaseEligibility?'pass':result.outcome==='RELEASE_HALT'?'alert':'hold';
 $('#reason').textContent=result.failed.length?'Blocked or qualified by: '+result.failed.map(k=>checkDescriptions[k]?.[0]||k).join(', '):'All illustrative prerequisites are satisfied. This does not establish real-world control effectiveness.';
 $('#summary').innerHTML=Object.entries(labels).map(([k,label])=>`<div class="metric"><span>${label}</span><strong>${typeof result[k]==='boolean'?(result[k]?'SATISFIED':'NOT SATISFIED'):'NOT EVALUATED'}</strong></div>`).join('');
 $('#matrix').innerHTML=Object.entries(result.checks).map(([k,ok])=>`<div class="matrix-row"><span>${escape(checkDescriptions[k]?.[0]||k)}</span><b class="${ok?'pass':'fail'}">${ok?'PASS':'NOT MET'}</b></div>`).join('');
 $('#assurance-note').textContent=result.releaseEligibility?'Simulation eligible; actual policy, access, population and enforcement evidence remain unverified.':'The scenario does not satisfy the simulated release prerequisites. Human investigation or remediation is required.';
 const record={notice:'Fictional educational simulation; not an audit record',scenario:active.id,repository:active.repo,commit:active.sha,policy:inputs.policyVersion,inputs,decision:result};
 $('#trace').textContent=JSON.stringify(record,null,2);
}
document.addEventListener('click',e=>{
 const caseButton=e.target.closest('[data-case]');
 if(caseButton){active=scenarios.find(x=>x.id===caseButton.dataset.case);inputs={...active.inputs};tab='authority';render();return}
 const tabButton=e.target.closest('[data-tab]');if(tabButton){tab=tabButton.dataset.tab;render();return}
 if(e.target.closest('#reset')){inputs={...active.inputs};render();return}
 if(e.target.closest('#export')){const blob=new Blob([$('#trace').textContent],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='illustrative-decision-'+active.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
});
document.addEventListener('change',e=>{
 if(!e.target.matches('[data-key]'))return;
 const key=e.target.dataset.key;
 inputs[key]=key==='reviewerA'||key==='reviewerB'?(e.target.checked?'LOW':'MEDIUM'):e.target.checked;
 render();
});
render();
