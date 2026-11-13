// Compatibility projection. All source records, provisions, and mappings live in framework-source-catalog.js.
// Do not add independent framework or mapping data here.
import {sourceCatalog} from './framework-source-catalog.js';
const sourceById=new Map(sourceCatalog.sources.map(s=>[s.id,s]));
const provisionById=new Map(sourceCatalog.provisions.map(p=>[p.id,p]));
export const frameworkRegistry={
 registryVersion:sourceCatalog.schemaVersion,
 reviewedAsOf:sourceCatalog.asOf,
 frameworks:sourceCatalog.sources.filter(s=>s.legacyCompatibility).map(s=>({id:s.id,title:s.title,version:s.version,status:s.status,published:s.published,issuer:s.issuer,sourceUrl:s.url,role:s.legacyRole,currencyNote:s.legacyCurrencyNote})),
 references:sourceCatalog.provisions.filter(p=>p.legacyReferenceId).map(p=>({id:p.legacyReferenceId,frameworkId:p.sourceId,label:p.legacyReferenceLabel,sourceUrl:p.url,referenceLevel:p.legacyReferenceLevel})),
 mappings:sourceCatalog.mappings.filter(m=>m.legacy).map(m=>({controlId:m.controlId,refId:m.legacy.refId,relationship:m.legacy.relationship,support:m.legacy.support,rationale:m.legacy.rationale,limits:m.legacy.limits,mappingStatus:m.legacy.mappingStatus})),
 legacyAliases:[
 {legacy:'LLM06:2025 Excessive Agency',current:'LLM03:2026 Excessive Agency',note:'Historical 2025 and 2026 OWASP identifiers are version-specific'},
 {legacy:'LLM01:2025 Prompt Injection',current:'LLM01:2026 Prompt Injection',note:'Identifier unchanged but versions remain distinct'}]
};
export const findMappings=(controlId)=>frameworkRegistry.mappings.filter(m=>m.controlId===controlId).map(m=>({...m,reference:frameworkRegistry.references.find(r=>r.id===m.refId),framework:frameworkRegistry.frameworks.find(f=>f.id===frameworkRegistry.references.find(r=>r.id===m.refId)?.frameworkId)}));
