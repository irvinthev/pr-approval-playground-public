import {findMappings,frameworkRegistry} from './framework-registry.js';
import {sourceCatalog} from './framework-source-catalog.js';
import {recommend,useCases,riskAreas,authorityLevels,families,rowsForExport} from './rcm-explorer-engine.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const state={useCase:'approval',authority:'authorize',risks:['scope','sod','accuracy'],financialImpact:false,selectedFamilies:['AI RMF','SSDF','OWASP'],showAll:false,search:'',selected:'WEB15:AI-03',tab:'controls'};
const scenarioDetails={approval:'AI evaluates pull requests and may approve limited classes',agent:'Agents create code and initiate engineering actions',deployment:'Automation controls release or promotion decisions',decision:'AI influences customer or financially relevant decisions'};
const icon={approval:'⌘',agent:'◇',deployment:'↗',decision:'◎'};
function choices(){
 $('#scenarios').innerHTML=Object.entries(useCases).map(([id,u])=>`<button class="scenario ${state.useCase===id?'selected':''}" data-case="${id}" aria-pressed="${state.useCase===id}"><span class="symbol">${icon[id]}</span><span><b>${esc(u.label)}</b><small>${esc(scenarioDetails[id])}</small></span></button>`).join('');
 $('#authority').innerHTML=Object.entries(authorityLevels).map(([id,label])=>`<label class="radio-choice"><input type="radio" name="authority" value="${id}" ${state.authority===id?'checked':''}><span class="radio-text"><b>${esc(label)}</b><small>${id==='advisory'?'AI recommends, humans decide':id==='authorize'?'Automation can approve eligible actions':'Automation can execute or deploy actions'}</small></span></label>`).join('');
 $('#risks').innerHTML=Object.entries(riskAreas).map(([id,r])=>`<label class="risk-choice"><input type="checkbox" data-risk="${id}" ${state.risks.includes(id)?'checked':''}><span><b>${esc(r.label)}</b><small>${id==='scope'?'Protected files and dependencies':id==='sod'?'Permissions and bypass':id==='accuracy'?'False low-risk decisions':id==='injection'?'Untrusted instructions':id==='delivery'?'Source-to-production integrity':id==='monitoring'?'Signals and response':id==='evidence'?'Traceability and IPE':'Policy and model changes'}</small></span></label>`).join('');
 $('#financial').checked=state.financialImpact;
 $('#risk-count').textContent=state.risks.length+' selected';
}
function panel(){
 const all=recommend(state), candidates=all.filter(c=>c.recommended);
 $('#match-count').textContent=candidates.length;$('#stat-risk').textContent=state.risks.length;$('#stat-framework').textContent=state.selectedFamilies.length;
 $('#all-controls').checked=state.showAll;$('#search').value=state.search;
 const visible=(state.showAll?all:candidates).filter(c=>[c.id,c.title,c.domain,c.risk,c.objective].join(' ').toLowerCase().includes(state.search.toLowerCase()));
 $('#controls').innerHTML=visible.length?visible.map(c=>`<button class="control ${state.selected===c.id?'selected':''}" data-control="${esc(c.id)}" aria-pressed="${state.selected===c.id}"><div class="top"><code>${esc(c.id)}</code><span class="level">${c.score>=10?'HIGH RELEVANCE':c.recommended?'RELEVANT':'LIBRARY'}</span></div><strong>${esc(c.title)}</strong><p>${esc(c.risk)}</p><div class="pills">${c.frameworkFamilies.map(f=>`<span>${esc(f)}</span>`).join('')}</div></button>`).join(''):'<div class="empty">No controls match. Clear the search or select additional risks.</div>';
 const picked=all.find(c=>c.id===state.selected)||visible[0]||all[0];
 const sections=[['WHY THIS WAS MATCHED',picked.reasons.length?picked.reasons.join(' · '):'Available in the library; not currently recommended.'],['RISK',picked.risk],['CONTROL OBJECTIVE',picked.objective],['IMPLEMENTATION / SAFEGUARD',picked.activity],['ASSURANCE TEST',picked.test],['EVIDENCE REQUEST',picked.evidence],['INDUSTRY REFERENCE',picked.framework]];
 const provisionMappings=sourceCatalog.mappings.filter(m=>m.controlId===picked.id).map(m=>({...m,provision:sourceCatalog.provisions.find(p=>p.id===m.provisionId)}));
 const provisionHtml=provisionMappings.length?'<section class="inspection framework-evidence"><h4>PROVISION-LEVEL SOURCE REFERENCES · V1</h4><p class="reference-note">Framework provision IDs are publisher-based; control relationships remain proposed, qualified and independently reviewable.</p>'+provisionMappings.map(m=>'<div class="source-mapping"><b>'+esc(m.provision.provisionId)+' · '+esc(m.provision.title)+'</b><span class="source-status">'+esc(m.relationship)+' · '+esc(m.reviewStatus)+'</span><p>'+esc(m.rationale)+'</p><p><strong>Source limitation:</strong> '+esc(m.provision.qualification)+'</p><a href="'+esc(m.provision.url)+'" target="_blank" rel="noopener noreferrer">Publisher reference ↗</a></div>').join('')+'</section>':'';
 const verifiedMappings=findMappings(picked.id);
 const citationHtml=verifiedMappings.length?'<section class="inspection framework-evidence"><h4>PRIMARY-SOURCE CROSSWALK · PILOT</h4><p class="reference-note">Primary sources checked '+esc(frameworkRegistry.reviewedAsOf)+'. Relationships are proposed interpretations pending control-owner review.</p>'+verifiedMappings.map(m=>'<div class="source-mapping"><b>'+esc(m.reference.label)+'</b><span class="source-status">'+esc(m.relationship.replaceAll('_',' '))+' · '+esc(m.support)+' · proposed mapping</span><p>'+esc(m.rationale)+'</p><p><strong>Limit:</strong> '+esc(m.limits)+'</p><a target="_blank" rel="noopener noreferrer" href="'+esc(m.reference.sourceUrl)+'">Primary source ↗</a></div>').join('')+'</section>':'<section class="inspection"><h4>PRIMARY-SOURCE CROSSWALK</h4><p>Not yet reviewed in the five-control mapping pilot. Existing indicative references remain unchanged.</p></section>';
 $('#inspector').innerHTML=`<code>${esc(picked.id)}</code><h3>${esc(picked.title)}</h3><div class="meta">${esc(picked.domain)} · ${esc(picked.nature)}</div>${sections.map(([h,b])=>`<section class="inspection"><h4>${esc(h)}</h4><p>${esc(b)}</p></section>`).join('')}${citationHtml}${provisionHtml}<p class="note">Existing web safeguard, not a new control. Related objective/workbook identifiers may describe narrower or different requirements. This result does not establish implementation or operating effectiveness.</p><a href="./rcm-view.html#control-${esc(picked.id.replace('WEB15:',''))}">View original RCM control →</a>`;
 $('#framework-options').innerHTML=Object.entries(families).map(([id,label])=>`<label class="family"><input type="checkbox" data-family="${esc(id)}" ${state.selectedFamilies.includes(id)?'checked':''}><span><b>${esc(label)}</b><small>${esc(id==='PCAOB'?'Audit evidence / assurance standards':id==='SLSA'?'Provenance reference':id==='OWASP'?'LLM threat reference':id==='SSDF'?'Secure development guidance':'AI risk management guidance')}</small><em>${candidates.filter(c=>c.frameworkFamilies.includes(id)).length} recommended controls reference this family</em></span></label>`).join('');
 const mapped=candidates.filter(c=>c.frameworkFamilies.some(f=>state.selectedFamilies.includes(f)));
 $('#framework-controls').innerHTML=mapped.length?mapped.map(c=>`<div><b>${esc(c.id)} · ${esc(c.title)}</b><p>${esc(c.framework)}</p></div>`).join(''):'<div class="empty">No mappings for the selected framework families.</div>';
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===state.tab)));
 ['controls','frameworks','method'].forEach(id=>$('#'+id+'-panel').hidden=state.tab!==id);
}
function render(){choices();panel()}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-case]');if(t){state.useCase=t.dataset.case;render();return}
 const c=e.target.closest('[data-control]');if(c){state.selected=c.dataset.control;panel();return}
 const tab=e.target.closest('[data-tab]');if(tab){state.tab=tab.dataset.tab;panel();return}
 if(e.target.closest('#reset')){Object.assign(state,{useCase:'approval',authority:'authorize',risks:['scope','sod','accuracy'],financialImpact:false,selectedFamilies:['AI RMF','SSDF','OWASP'],showAll:false,search:'',selected:'WEB15:AI-03',tab:'controls'});render();return}
 if(e.target.closest('#export')){
  const candidates=recommend(state).filter(c=>c.recommended);const rows=rowsForExport(candidates);
  const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='illustrative-rcm-'+state.useCase+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
});
document.addEventListener('change',e=>{
 const t=e.target;if(t.name==='authority')state.authority=t.value;
 else if(t.dataset.risk){state.risks=t.checked?[...state.risks,t.dataset.risk]:state.risks.filter(id=>id!==t.dataset.risk)}
 else if(t.dataset.family){state.selectedFamilies=t.checked?[...state.selectedFamilies,t.dataset.family]:state.selectedFamilies.filter(id=>id!==t.dataset.family)}
 else if(t.id==='financial')state.financialImpact=t.checked;
 else if(t.id==='all-controls')state.showAll=t.checked;
 else return;
 render();
});
$('#search').addEventListener('input',e=>{state.search=e.target.value;panel()});
render();
