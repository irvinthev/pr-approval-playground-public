/* Educational DevOps / AI RCM export; not an assessment of implemented controls. */
(function(root){
'use strict';
function buildRows(controls, inventory){
 if(!Array.isArray(controls)||!inventory||!Array.isArray(inventory.workbookControls))throw new TypeError('RCM and inventory crosswalk are required');
 const headings=['Common control domain','Engineering area','Engineering SDLC stage','Risk statement','Control ID','Control name','Control objective','Control description / proposed engineering safeguard','Control nature','Trigger / cadence (illustrative)','Evidence / IPE','Testing procedure (illustrative)','Industry reference / qualified relationship','SOX / other applicability','Illustrative scenario','Source namespace','Qualified ID','Related workbook controls (proposed)','Relationship status','Design status','Simulated evidence status','Verified implementation status','Retention and population completeness limitation'];
 const rows=controls.map(c=>{
  const qualified='WEB15:'+c.id;
  const related=inventory.workbookControls.filter(w=>w.webIds.includes(qualified)).map(w=>w.id);
  return [c.domain,c.engineeringArea||'Not mapped',c.engineeringStage||'Not mapped',c.risk,c.id,c.title,c.objective||c.title,c.activity,c.nature||'Not assigned',c.trigger||'Not assigned',c.evidence,c.test,c.frameworkRelationship||c.framework,c.applicability||'Applicability not assessed',c.scenario,'WEB15',qualified,related.join('; '),'Proposed related intent; not equivalence','Proposed example; not assessed','Fictional simulation only; not operating evidence','Not assessed','Retention, integrity and independent production-population completeness are not established by this export'];
 });
 return [headings,...rows];
}
const api={buildRows};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RcmExport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
