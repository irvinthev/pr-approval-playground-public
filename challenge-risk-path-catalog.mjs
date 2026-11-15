// Shared, presentation-only lifecycle vocabulary for the Challenge Lab.
// Delivery touchpoints align to Field Guide CASE-SHARED-01's eight-stage journey.
// The separate risk chapter groups these touchpoints into seven broader phases.
// Neither set asserts an implemented or mandatory engineering architecture.
export const riskPathCatalog=Object.freeze({
  delivery:Object.freeze([
    {id:'pr',label:'Pull request'},
    {id:'eligibility',label:'Eligibility & CI'},
    {id:'ai-review',label:'AI review'},
    {id:'authorization',label:'Authorize'},
    {id:'merge',label:'Merge & build'},
    {id:'release',label:'Release'},
    {id:'monitor',label:'Monitor'},
    {id:'evidence',label:'Evidence'}
  ].map(Object.freeze)),
  operations:Object.freeze([
    {id:'design',label:'Design'},
    {id:'scope',label:'Scope'},
    {id:'authorize',label:'Authorize'},
    {id:'execute',label:'Execute'},
    {id:'verify',label:'Verify'},
    {id:'observe',label:'Monitor'},
    {id:'recover',label:'Recover'}
  ].map(Object.freeze))
});
export const riskPathRoles=Object.freeze({
  origin:'Introduced',
  exposure:'Exposed',
  prevention:'Potential safeguard',
  detection:'Detection'
});
export function riskPathPromptStages(){
  return Object.entries(riskPathCatalog)
    .map(([kind,stages])=>kind+': '+stages.map(stage=>stage.id).join(', '))
    .join(' | ');
}
