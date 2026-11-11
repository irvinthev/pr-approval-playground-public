/* Static Risk Governance worksheet: session-only example, not a system of record.
 * Neither proposed risk treatment nor CSV/JSON export constitutes approval. */
(function(){
'use strict';
const root=document.getElementById('risk-governance-workspace'),D=window.RiskGovernanceWorksheet,R=window.SdlcRiskRegister;
if(!root||!D||!R)return;
const assets=[],risks=[];
const n=(tag,content,cls)=>{const x=document.createElement(tag);if(content!==undefined&&content!==null)x.textContent=content;if(cls)x.className=cls;return x;};
const makeField=(label,key,type='text',options=null,full=false)=>{
 const wrapper=n('label',label,full?'full':'');let el;
 if(options){el=n('select');for(const [value,text] of options){const opt=n('option',text);opt.value=value;el.append(opt);}}
 else if(type==='textarea'){el=n('textarea');el.rows=2;}else{el=n('input');el.type=type;}
 el.name=key;wrapper.append(el);return wrapper;
};
const formValues=f=>Object.fromEntries(new FormData(f).entries());
const inventorySection=n('section',null,'risk-frame');
inventorySection.append(n('h2','01 / AI system inventory'),n('p','First establish the AI capability and the owner accountable for its use. Record its intended use, effective authority, provider, data touched and the business asset it could affect. Crown-jewel status describes asset criticality; it is not the same thing as information classification.'));
const inventoryForm=n('form',null,'governance-form');
[
 ['AI system or capability','name','text',null,true],['Accountable owner','owner'],['Intended use','purpose','textarea',null,true],
 ['Provider / model arrangement','provider'],
 ['Effective authority','authority','select',[['Not assessed','Not assessed'],['Advisory','Advisory'],['Review gate','Review gate'],['Automated approval','Automated approval'],['Production execution','Production execution'],['Governance changes','Governance changes']]],
 ['Highest information classification','dataClass','select',D.classes.map(k=>[k,k])],
 ['Classification source / basis','classificationBasis'],
 ['Crown-jewel exposure','crownJewel','select',[['Unknown','Unknown'],['Yes','Yes'],['No','No']]],
 ['Critical asset / process affected','criticalAsset'],
 ['Data flow and boundary','dataFlow','textarea',null,true]
].forEach(args=>inventoryForm.append(makeField(...args)));
const inventoryButtons=n('div',null,'governance-actions');const addAsset=n('button','Add inventory draft');addAsset.type='submit';const demo=n('button','Fill fictional example','secondary');demo.type='button';demo.addEventListener('click',()=>{
 const fields={name:'Example AI PR reviewer',owner:'Engineering lead (fictional)',purpose:'Review a documentation-only PR and recommend an eligibility decision',provider:'Third-party model runtime',authority:'Review gate',dataClass:'Internal',classificationBasis:'Example company information policy',crownJewel:'Unknown',criticalAsset:'Shared billing library (potential downstream consumer)',dataFlow:'PR diff → vendor model API → evaluation → independent policy gate'};
 for(const [key,value] of Object.entries(fields)){const input=inventoryForm.elements.namedItem(key);if(input)input.value=value;}
});
inventoryButtons.append(addAsset,demo);inventoryForm.append(inventoryButtons);inventorySection.append(inventoryForm);
const inventoryCount=n('p',null,'governance-summary'),inventoryTable=n('div',null,'field-overflow');inventorySection.append(inventoryCount,inventoryTable);
const riskSection=n('section',null,'risk-frame');
riskSection.append(n('h2','02 / Track risk and propose treatment'),n('p','Associate a credible failure scenario with an inventoried AI capability, identify safeguards and unresolved evidence, and document management’s intended response. Any acceptance here remains a proposal unless separately approved through an authorized organizational process.'));
const riskForm=n('form',null,'governance-form');
riskForm.append(makeField('AI inventory item','assetId','select',[['','Select an inventory record']]));
const scenarioChoices=[['','Choose a sample risk or write your own'],...R.risks.map(r=>[r.id,r.id+' · '+r.title]),['custom','Custom risk']];
riskForm.append(makeField('Illustrative risk to examine','scenario','select',scenarioChoices));
const eventField=makeField('Risk event and failure scenario','event','textarea',null,true);
riskForm.append(eventField);
riskForm.append(makeField('Accountable risk owner','owner'));
riskForm.append(makeField('Qualitative impact (unverified)','impact','select',[['Not assessed','Not assessed'],['Low — user hypothesis','Low — user hypothesis'],['Moderate — user hypothesis','Moderate — user hypothesis'],['High — user hypothesis','High — user hypothesis']]));
riskForm.append(makeField('Likelihood (unverified)','likelihood','select',[['Not assessed','Not assessed'],['Low — user hypothesis','Low — user hypothesis'],['Moderate — user hypothesis','Moderate — user hypothesis'],['High — user hypothesis','High — user hypothesis']]));
riskForm.append(makeField('Proposed safeguard / current control','safeguard','textarea',null,true));
riskForm.append(makeField('Evidence and validation gaps','evidence','textarea',null,true));
riskForm.append(makeField('Management response under consideration','treatment','select',[['Undetermined','Undetermined'],['Mitigate','Mitigate'],['Avoid or restrict','Avoid or restrict'],['Transfer or share','Transfer or share'],['Propose acceptance','Propose acceptance']]));
riskForm.append(makeField('Acceptance rationale (required if proposing acceptance)','rationale','textarea',null,true));
riskForm.append(makeField('Conditions and compensating safeguards','conditions','textarea',null,true));
riskForm.append(makeField('Proposed authorized decision-maker','approver'));
riskForm.append(makeField('Proposed review / expiration date','reviewDate','date'));
const riskButtons=n('div',null,'governance-actions'),addRisk=n('button','Add risk draft');addRisk.type='submit';riskButtons.append(addRisk);riskForm.append(riskButtons);riskSection.append(riskForm);
const riskCount=n('p',null,'governance-summary'),riskTable=n('div',null,'field-overflow');riskSection.append(riskCount,riskTable);
const status=n('p',null,'governance-note');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const actions=n('div',null,'governance-actions'),download=n('button','Export draft worksheets (.json)','governance-export');download.type='button';
download.addEventListener('click',()=>{
 const data=D.exportData(assets,risks),url=URL.createObjectURL(new Blob([data],{type:'application/json'})),a=n('a');
 a.href=url;a.download='Illustrative_AI_Inventory_Risk_Drafts.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 status.textContent='Local draft exported. No approval, risk acceptance, or external storage has occurred.';
});
const clear=n('button','Clear session drafts','secondary');clear.type='button';clear.addEventListener('click',()=>{
 assets.splice(0);risks.splice(0);render();status.textContent='Session drafts cleared in this page. Previously downloaded files are unaffected.';
});actions.append(download,clear);
root.append(inventorySection,riskSection,actions,status,n('p','Session-only: this browser page does not save, submit, sign or authorize inventory entries or risk acceptance. Do not enter confidential or production information in this public demonstration.','governance-note'));
function table(headers,values){const t=n('table',null,'governance-table'),thead=n('thead'),tr=n('tr');
 headers.forEach(h=>tr.append(n('th',h)));thead.append(tr);t.append(thead);
 const body=n('tbody');for(const row of values){const tr=n('tr');row.forEach(val=>tr.append(n('td',val)));body.append(tr);}t.append(body);return t;
}
function render(){
 inventoryCount.textContent=assets.length+' draft AI inventory entries · No verified systems';
 inventoryTable.replaceChildren(table(['ID','AI capability / owner','Data classification','Crown-jewel exposure','Authority','State'],assets.map(x=>[x.id,x.name+' / '+x.owner,x.dataClass,x.crownJewel,x.authority,x.reviewStatus])));
 riskCount.textContent=risks.length+' draft risks · Zero authorized acceptances';
 riskTable.replaceChildren(table(['ID','Inventory','Risk','Owner','Treatment','Acceptance','Status'],risks.map(x=>[x.id,x.assetId,x.event,x.owner,x.treatment,x.acceptanceStatus,x.riskStatus])));
 const sel=riskForm.elements.namedItem('assetId');const current=sel.value;sel.replaceChildren(n('option','Select an inventory record'));
 sel.firstChild.value='';
 for(const x of assets){const o=n('option',x.id+' · '+x.name);o.value=x.id;sel.append(o);}if(assets.some(x=>x.id===current))sel.value=current;
}
riskForm.elements.namedItem('scenario').addEventListener('change',e=>{
 const item=R.risks.find(x=>x.id===e.target.value);
 if(item){riskForm.elements.namedItem('event').value=item.event+' '+item.failure;riskForm.elements.namedItem('safeguard').value=item.safeguard;riskForm.elements.namedItem('evidence').value=item.evidence;}
});
inventoryForm.addEventListener('submit',e=>{e.preventDefault();try{assets.push(D.inventoryRecord(formValues(inventoryForm),assets.length+1));render();status.textContent='Inventory draft added locally. Classification and crown-jewel exposure are unverified.';}catch(err){status.textContent=err.message;}});
riskForm.addEventListener('submit',e=>{e.preventDefault();try{risks.push(D.riskRecord(formValues(riskForm),risks.length+1,assets.map(x=>x.id)));render();status.textContent='Risk draft recorded locally; no management approval or acceptance has been issued.';}catch(err){status.textContent=err.message;}});
render();
})();
