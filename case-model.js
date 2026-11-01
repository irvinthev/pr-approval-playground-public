/* Fictional, editable simulation only. No real permissions or audit evidence. */
(function(root){
'use strict';
const F=typeof module!=='undefined'&&module.exports?require('./financial-engine'):root.FinancialDemo;
const ACTIONS=['CHECKS','APPROVE','PUSH','MAP_CHANGE','POLICY_CHANGE','MAP_MISSING','MAP_RESTORE','BUILD','RELEASE_CHECKS','DEPLOY','UNCOVERED_ROUTE','CORROBORATE','ACCEPT_RISK'];
const MAX_EVENTS=64,MAX_FRAGMENT=12000;
const clone=x=>JSON.parse(JSON.stringify(x));
const identity=x=>typeof x==='string'&&x.trim().length>0&&x.length<=160;
function initial(){return {schemaVersion:1,caseId:'shared-library',change:{repository:'demo/shared-components',repoAllowlisted:true,author:'demo-contributor',revision:'case-revision-A',files:['lib/dedup/key.js']},versions:{policy:'demo-policy-1',mapping:'demo-map-1'},mappingKnown:true,technical:{ci:null,reviewA:null,reviewB:null},authorizations:[],build:null,release:null,deployments:[],riskAcceptances:[],evidence:{populationCorroborated:false,coveredRoutes:['standard']},events:[]};}
function validateCase(c){
 const keys=Object.keys(initial());
 if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).some(k=>!keys.includes(k))||keys.some(k=>!(k in c)))return false;
 if(c.schemaVersion!==1||c.caseId!=='shared-library'||!c.change||!c.versions||!c.technical||!c.evidence)return false;
 if(typeof c.change.repoAllowlisted!=='boolean')return false;
 if(!Array.isArray(c.change.files)||!c.change.files.length||c.change.files.some(f=>!identity(f)))return false;
 if(typeof c.mappingKnown!=='boolean'||typeof c.evidence.populationCorroborated!=='boolean'||!Array.isArray(c.evidence.coveredRoutes))return false;
 for(const k of ['authorizations','deployments','riskAcceptances','events'])if(!Array.isArray(c[k])||c[k].length>MAX_EVENTS)return false;
 if(c.events.some(e=>!ACTIONS.includes(e)))return false;
 if(c.authorizations.some(a=>!a||typeof a!=='object')||c.deployments.some(d=>!d||typeof d!=='object'))return false;
 return true;
}
function aggregate(predicates){for(const status of ['FAIL','UNKNOWN','PENDING'])if(predicates.some(p=>p.status===status))return status;return 'PASS';}
function evaluateCase(c){
 if(!validateCase(c))throw new TypeError('Invalid shared-case schema');
 const revision=c.change.revision,policyVersion=c.versions.policy,mappingVersion=c.versions.mapping;
 const map=clone(F.registry);map.version=mappingVersion;map.policyVersion=policyVersion;if(!c.mappingKnown)delete map.nodes.dedup;
 const change=F.makeChange('shared',{author:c.change.author,repoAllowlisted:c.change.repoAllowlisted,sha:revision,files:c.change.files,ci:false,reviewA:null,reviewB:null});
 const scope=F.assessFinancialImpact(change,map),predicates=[];
 const add=(id,status,reason,evidenceRefs=[])=>predicates.push({id,status,reason,evidenceRefs});
 const identities=[revision,c.change.repository,c.change.author,policyVersion,mappingVersion].every(identity);
 add('identity',identities?'PASS':'UNKNOWN',identities?'Current revision, author and applicable versions are identified.':'Required revision, actor or version identity is missing.');
 add('repository-scope',c.change.repoAllowlisted?'PASS':'FAIL','Repository must be within the modeled approval scope.');
 add('mapping',scope.status==='UNRESOLVED'?'UNKNOWN':'PASS',scope.reason,['dependency-map:'+String(mappingVersion)]);
 function check(field){const r=c.technical[field];return !r?'PENDING':!identity(r.revision)?'UNKNOWN':r.revision!==revision?'FAIL':r.status!=='PASS'?'FAIL':!identity(r.recordId)?'UNKNOWN':field!=='ci'&&(!identity(r.actor)||!identity(r.modelVersion)||!identity(r.promptVersion))?'UNKNOWN':'PASS';}
 for(const field of ['ci','reviewA','reviewB']){const status=check(field);add(field,status,status==='PASS'?'Evidence matches '+revision:status==='FAIL'?'Failed or stale '+field+' evidence.':'Current '+field+' evidence is missing or incomplete.',c.technical[field]?.recordId?[c.technical[field].recordId]:[]);}
 const technical=F.assessTechnicalEligibility({...change,ci:check('ci')==='PASS',reviewA:check('reviewA')==='PASS'?'low':null,reviewB:check('reviewB')==='PASS'?'low':null});
 const approval=c.authorizations.at(-1)||null;
 const authIdentity=approval&&[approval.actor,approval.role,approval.sha,approval.mappingVersion,approval.policyVersion,approval.recordId,approval.rationale].every(identity);
 const authCurrent=authIdentity&&approval.sha===revision&&approval.mappingVersion===mappingVersion&&approval.policyVersion===policyVersion;
 const authAuthority=authIdentity&&approval.actor==='demo-independent-reviewer'&&approval.actor!==c.change.author&&approval.role===scope.requiredRole;
 const authDecision=F.resolveAuthorization(technical,scope,change,authCurrent&&authAuthority?approval:null);
 let authorizationStatus=!approval?'REQUIRED':!authIdentity?'INCOMPLETE':!authCurrent?'STALE':!authAuthority?'INVALID':authDecision.allowed?'VALID':'WITHHELD';
 add('independent-authorization',authorizationStatus==='VALID'?'PASS':authorizationStatus==='REQUIRED'?'PENDING':authorizationStatus==='INCOMPLETE'?'UNKNOWN':'FAIL',authorizationStatus==='VALID'?'Independent authorization matches revision and applicable versions.':authorizationStatus==='STALE'?'Prior authorization is retained but invalid for the current revision or versions.':'Protected financial scope requires qualified independent authorization.',approval?.recordId?[approval.recordId]:[]);
 const policyStatus=aggregate(predicates);
 const releasePredicates=[];const rel=(id,status,reason)=>releasePredicates.push({id,status,reason,evidenceRefs:[]});
 rel('policy',policyStatus,'All mandatory pre-merge predicates must hold.');
 const build=c.build;
 rel('artifact-lineage',!build?'PENDING':build.revision!==revision||build.policyVersion!==policyVersion||build.mappingVersion!==mappingVersion?'FAIL':!identity(build.digest)||!identity(build.recordId)?'UNKNOWN':'PASS','Build must bind the current authorized revision and versions to an identified artifact.');
 const release=c.release;
 rel('release-checks',!release?'PENDING':!build?'FAIL':![release.revision,release.digest,release.policyVersion,release.mappingVersion,release.buildId,release.recordId].every(identity)?'UNKNOWN':release.digest!==build.digest||release.revision!==revision||release.policyVersion!==policyVersion||release.mappingVersion!==mappingVersion||release.buildId!==build.recordId?'FAIL':release.passed!==true?'FAIL':'PASS','Mandatory release validation must pass for the same source, artifact, build and applicable versions.');
 const releaseEligibility=aggregate(releasePredicates)==='PASS'?'ELIGIBLE':aggregate(releasePredicates)==='PENDING'?'PENDING':'BLOCKED';
 const evidenceGaps=predicates.filter(p=>['UNKNOWN','PENDING'].includes(p.status)).map(p=>p.reason);
 for(const p of releasePredicates)if(['UNKNOWN','PENDING'].includes(p.status)&&p.id!=='policy')evidenceGaps.push(p.reason);
 const monitoringFindings=[];
 if(authorizationStatus==='STALE')monitoringFindings.push({id:'stale-approval',status:'EXCEPTION',detail:'Authorization refers to an earlier revision or policy/mapping version.'});
 if(!c.evidence.populationCorroborated)evidenceGaps.push('Production population has not been independently corroborated within this simulation.');
 for(const d of c.deployments){
  if(!c.evidence.coveredRoutes.includes(d.route)||d.inFeed!==true){evidenceGaps.push('Uncovered production route: '+String(d.route));monitoringFindings.push({id:'uncovered-route',status:'EVIDENCE_GAP',detail:'A known '+String(d.route)+' deployment is absent from covered telemetry. Investigate; this alone does not prove unauthorized change.'});}
  const a=c.authorizations.find(a=>a.recordId===d.authorizationId);
  if(!a){evidenceGaps.push('Deployment authorization linkage is missing.');monitoringFindings.push({id:'approval-link',status:'UNRESOLVED',detail:'Obtain the approval/source/artifact linkage before concluding authorization.'});}
  else if(a.sha!==d.revision||a.policyVersion!==d.policyVersion||a.mappingVersion!==d.mappingVersion)monitoringFindings.push({id:'deployment-mismatch',status:'EXCEPTION',detail:'Recorded deployment conflicts with its linked authorization.'});
 }
 const nextValidActions=[];
 const base=aggregate(predicates.filter(p=>p.id!=='independent-authorization'));
 if(!c.mappingKnown)nextValidActions.push('MAP_RESTORE');
 else if(identities&&['ci','reviewA','reviewB'].some(f=>check(f)!=='PASS'))nextValidActions.push('CHECKS');
 else if(base==='PASS'&&authorizationStatus!=='VALID')nextValidActions.push('APPROVE');
 else if(policyStatus==='PASS'&&releasePredicates[1].status!=='PASS')nextValidActions.push('BUILD');
 else if(policyStatus==='PASS'&&releasePredicates[2].status!=='PASS')nextValidActions.push('RELEASE_CHECKS');
 else if(releaseEligibility==='ELIGIBLE'&&!c.deployments.some(d=>d.revision===revision&&d.route==='standard'))nextValidActions.push('DEPLOY');
 return {caseId:c.caseId,evaluatedRevision:revision,policyVersion,mappingVersion,dependencyAssessment:scope,technical,authorizationStatus,policyStatus,predicates,failedPredicates:predicates.filter(p=>p.status==='FAIL'),releasePredicates,releaseEligibility,evidenceCompleteness:evidenceGaps.length?'INCOMPLETE':'COMPLETE_IN_MODELED_SCOPE',evidenceGaps,monitoringFindings,riskAcceptance:c.riskAcceptances.length?'RECORDED_NOT_AUTHORIZATION':'NOT_RECORDED',nextValidActions};
}
function transition(c,action){
 if(!ACTIONS.includes(action))throw new TypeError('Unknown case action');
 const e=evaluateCase(c);if(c.events.length>=MAX_EVENTS)throw new RangeError('Case action limit reached');
 if(['CHECKS','APPROVE','BUILD','RELEASE_CHECKS','DEPLOY','MAP_RESTORE'].includes(action)&&!e.nextValidActions.includes(action))throw new Error('Action is not valid for this case state');
 const n=clone(c),revision=n.change.revision;
 if(action==='CHECKS')for(const field of ['ci','reviewA','reviewB'])n.technical[field]={recordId:field+':'+revision,revision,status:'PASS',actor:field==='ci'?'demo-ci':field,modelVersion:'demo-model-1',promptVersion:'demo-prompt-1'};
 if(action==='APPROVE')n.authorizations.push({...F.approve({...n.change,sha:revision},e.dependencyAssessment),recordId:'approval:'+n.events.length,rationale:'Reviewed shared-library dependency impact and tests for this exact revision.'});
 if(action==='PUSH')n.change.revision='case-revision-'+String.fromCharCode(66+n.events.filter(x=>x==='PUSH').length);
 if(action==='MAP_CHANGE')n.versions.mapping='demo-map-'+(2+n.events.filter(x=>x==='MAP_CHANGE').length);
 if(action==='POLICY_CHANGE')n.versions.policy='demo-policy-'+(2+n.events.filter(x=>x==='POLICY_CHANGE').length);
 if(action==='MAP_MISSING')n.mappingKnown=false;
 if(action==='MAP_RESTORE')n.mappingKnown=true;
 if(action==='BUILD')n.build={revision,policyVersion:n.versions.policy,mappingVersion:n.versions.mapping,digest:'demo-digest:'+revision,recordId:'build:'+n.events.length};
 if(action==='RELEASE_CHECKS')n.release={revision,policyVersion:n.versions.policy,mappingVersion:n.versions.mapping,buildId:n.build.recordId,digest:n.build.digest,passed:true,recordId:'release-check:'+n.events.length};
 if(action==='DEPLOY')n.deployments.push({revision,policyVersion:n.versions.policy,mappingVersion:n.versions.mapping,digest:n.build.digest,authorizationId:n.authorizations.at(-1).recordId,route:'standard',inFeed:true});
 if(action==='UNCOVERED_ROUTE')n.deployments.push({revision,policyVersion:n.versions.policy,mappingVersion:n.versions.mapping,digest:'demo-manual-artifact',authorizationId:null,route:'manual',inFeed:false});
 if(action==='CORROBORATE')n.evidence.populationCorroborated=true;
 if(action==='ACCEPT_RISK')n.riskAcceptances.push({owner:'demo-risk-owner',revision,rationale:'Residual-risk discussion recorded; mandatory predicates remain applicable.'});
 n.events.push(action);return n;
}
function replay(events){let c=initial();for(const e of events)c=transition(c,e);return c;}
function encode(c){evaluateCase(c);const rebuilt=replay(c.events);if(JSON.stringify(rebuilt)!==JSON.stringify(c))throw new Error('Case does not match its editable action history');const hash='#case='+encodeURIComponent(JSON.stringify({schemaVersion:1,caseId:c.caseId,events:c.events}));if(hash.length>MAX_FRAGMENT)throw new RangeError('Case URL too large');return hash;}
function decode(hash){
 if(typeof hash!=='string'||hash.length>MAX_FRAGMENT||!hash.startsWith('#case='))throw new TypeError('Invalid case fragment');
 let p;try{p=JSON.parse(decodeURIComponent(hash.slice(6)));}catch{throw new TypeError('Malformed case fragment');}
 if(!p||Object.keys(p).sort().join(',')!=='caseId,events,schemaVersion'||p.schemaVersion!==1||p.caseId!=='shared-library'||!Array.isArray(p.events)||p.events.length>MAX_EVENTS||p.events.some(e=>!ACTIONS.includes(e)))throw new TypeError('Unsupported case schema or actions');
 return replay(p.events);
}
const api={initial,evaluateCase,transition,aggregate,encode,decode,replay,validateCase,MAX_FRAGMENT,MAX_EVENTS};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SharedCase=api;
})(typeof globalThis!=='undefined'?globalThis:this);
