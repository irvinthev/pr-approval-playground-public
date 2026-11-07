/* Educational RCM export; no assertions about implemented controls. */
(function(root){
'use strict';
function buildRows(controls, inventory){
 if(!Array.isArray(controls)||!inventory||!Array.isArray(inventory.workbookControls))throw new TypeError('RCM and inventory crosswalk are required');
 const headings=['ID','Domain','Control objective','Risk','Proposed engineering safeguard','Examples of evidence to request','Illustrative audit test procedure','Framework relationship','Illustrative scenario','Source namespace','Qualified ID','Related workbook controls (proposed)','Relationship status','Design status','Simulated evidence status','Verified implementation status','Retention and population completeness limitation'];
 const rows=controls.map(c=>{
  const qualified='WEB15:'+c.id;
  const related=inventory.workbookControls.filter(w=>w.webIds.includes(qualified)).map(w=>w.id);
  return [c.id,c.domain,c.title,c.risk,c.activity,c.evidence,c.test,c.framework,c.scenario,'WEB15',qualified,related.join('; '),'Proposed related intent; not equivalence','Proposed example; not assessed','Fictional simulation only; not operating evidence','Not assessed','Retention, integrity and independent production-population completeness are not established by this export'];
 });
 return [headings,...rows];
}
const api={buildRows};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RcmExport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
