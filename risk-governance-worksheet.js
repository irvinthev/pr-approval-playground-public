/* Risk Assessment v0.4: client-side illustrative worksheets.
 * User entries are held in page memory only; no backend, persistence, approval workflow, or authority.
 * Risk acceptance is always a PROPOSAL, never an approved/accepted determination. */
(function(root){
'use strict';
function clean(v){return String(v==null?'':v).trim();}
const classes=['Not classified','Public','Internal','Confidential','Restricted'];
function inventoryRecord(fields,index){
 const name=clean(fields.name),owner=clean(fields.owner),purpose=clean(fields.purpose);
 if(!name||!owner||!purpose)throw new Error('System name, accountable owner and intended use are required.');
 const dataClass=classes.includes(fields.dataClass)?fields.dataClass:'Not classified';
 return {id:'AI-SYS-'+String(index).padStart(3,'0'),name,owner,purpose,
 provider:clean(fields.provider)||'Unknown',authority:clean(fields.authority)||'Not assessed',
 dataClass,crownJewel:['Yes','No','Unknown'].includes(fields.crownJewel)?fields.crownJewel:'Unknown',
 criticalAsset:clean(fields.criticalAsset)||'Not identified',dataFlow:clean(fields.dataFlow)||'Not documented',
 classificationBasis:clean(fields.classificationBasis)||'Not documented',
 reviewStatus:'Draft — not verified'};
}
function riskRecord(fields,index,inventoryIds){
 const assetId=clean(fields.assetId),event=clean(fields.event),owner=clean(fields.owner);
 if(!assetId||!inventoryIds.includes(assetId))throw new Error('Select a recorded AI inventory asset.');
 if(!event||!owner)throw new Error('Risk scenario and accountable risk owner are required.');
 const treatment=clean(fields.treatment)||'Undetermined';
 const wantsAcceptance=treatment==='Propose acceptance';
 const rationale=clean(fields.rationale),conditions=clean(fields.conditions),reviewDate=clean(fields.reviewDate),approver=clean(fields.approver);
 if(wantsAcceptance&&(!rationale||!conditions||!reviewDate||!approver))throw new Error('Acceptance proposals need rationale, conditions, proposed decision-maker and review date.');
 return {id:'AI-RISK-'+String(index).padStart(3,'0'),assetId,event,owner,
 impact:clean(fields.impact)||'Not assessed',likelihood:clean(fields.likelihood)||'Not assessed',
 safeguard:clean(fields.safeguard)||'Not documented',evidence:clean(fields.evidence)||'Not supplied',
 treatment,proposedDecisionMaker:approver||'Not identified',
 acceptanceRationale:rationale||'Not supplied',conditions:conditions||'Not specified',
 nextReview:reviewDate||'Not scheduled',
 acceptanceStatus:wantsAcceptance?'Proposed — decision not evidenced':'Not requested',
 riskStatus:'Open — unverified',residualRisk:'Not determined'};
}
function exportData(assets,risks){return JSON.stringify({notice:'Illustrative local worksheet; not a validated inventory, signed risk acceptance, or production evidence.',exportedAt:'Date not recorded in this illustrative export',inventory:assets,risks},null,2);}
const api={inventoryRecord,riskRecord,exportData,classes};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RiskGovernanceWorksheet=api;
})(typeof globalThis!=='undefined'?globalThis:this);
