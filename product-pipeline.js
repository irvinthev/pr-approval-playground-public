/* Canonical vocabulary for the fictional field guide. Presentation metadata only:
   never grants approval, never overrides evaluateCase, and never asserts real enforcement. */
(function (root) {
  'use strict';
  const stages = Object.freeze([
    { id:'pr', label:'Pull request', phase:'intake', description:'Identify files, author, repository, and exact revision.', engineeringStage:1 },
    { id:'eligibility', label:'Deterministic eligibility', phase:'screen', description:'Evaluate scope, protected paths, dependency mapping, and exclusions.', engineeringStage:2 },
    { id:'ci', label:'Required CI and code checks', phase:'validate', description:'Verify applicable builds, tests and security checks for the current revision.', engineeringStage:2 },
    { id:'ai', label:'AI code review', phase:'assess', description:'Collect structured, revision-bound assessments from two reviewers.', engineeringStage:3 },
    { id:'authorization', label:'Authorization decision', phase:'authorize', description:'Select protected automated or qualified human authorization; a score is not authority.', engineeringStage:4 },
    { id:'merge', label:'Protected merge and build', phase:'enforce', description:'Enforce applicable GitHub rules and link merged source to the built artifact.', engineeringStage:5 },
    { id:'release', label:'Preproduction and release', phase:'deliver', description:'Verify artifact/source lineage and mandatory release conditions before production.', engineeringStage:6 },
    { id:'monitor', label:'Production monitoring and response', phase:'operate', description:'Observe rollout, exceptions, coverage, stop and recovery conditions.', engineeringStage:7 }
  ].map(Object.freeze));
  const routes = Object.freeze({
    AUTOMATION_ELIGIBLE:'Automation may be requested; protected enforcement still required.',
    HUMAN_REVIEW_REQUIRED:'Qualified human code review and approval required before protected merge.',
    BLOCKED:'A mandatory condition failed; human approval does not waive it.',
    UNRESOLVED:'Required facts or evidence are unknown; do not infer automated eligibility.',
    RELEASE_INTERVENTION:'Release must be contained, halted or rolled back per validated operating policy.'
  });
  const scenarios = Object.freeze([
    Object.freeze({id:'pass',label:'Standard low-risk pass',boundary:'Eligibility + mandatory checks + authorization + release'}),
    Object.freeze({id:'split',label:'AI split decision',boundary:'No automated approval; human review required'}),
    Object.freeze({id:'excluded',label:'Hard-gate scope exclusion',boundary:'Exclude automated route; human review may remain available'}),
    Object.freeze({id:'canary',label:'Production canary failure',boundary:'Operational intervention does not erase prior authorization'})
  ]);
  const contract = Object.freeze({schemaVersion:1,stages:Object.freeze(stages),routes,scenarios:Object.freeze(scenarios)});
  if (typeof module !== 'undefined' && module.exports) module.exports=contract;
  else root.ProductPipeline=contract;
})(typeof globalThis !== 'undefined'?globalThis:this);
