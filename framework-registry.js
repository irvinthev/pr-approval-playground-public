export const frameworkRegistry={
  "registryVersion": "2026-11-12-pilot.1",
  "reviewedAsOf": "2026-11-12",
  "frameworks": [
    {
      "id": "NIST-SSDF-1.1",
      "title": "NIST Secure Software Development Framework",
      "version": "SP 800-218 v1.1",
      "status": "final",
      "published": "2022-02-03",
      "issuer": "NIST",
      "sourceUrl": "https://csrc.nist.gov/pubs/sp/800/218/final",
      "role": "Recommended secure development practices; not an automatic SOX requirement",
      "currencyNote": "SP 800-218 Rev.1 v1.2 is draft as of review date"
    },
    {
      "id": "NIST-AI-RMF-1.0",
      "title": "NIST AI Risk Management Framework",
      "version": "AI 100-1 v1.0",
      "status": "final",
      "published": "2023-01-26",
      "issuer": "NIST",
      "sourceUrl": "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10",
      "role": "Voluntary AI risk management framework; not regulatory control criteria",
      "currencyNote": "NIST indicates an update is in progress"
    },
    {
      "id": "OWASP-LLM-2026",
      "title": "OWASP GenAI LLM Top 10",
      "version": "2026 release",
      "status": "published",
      "published": "2026-08-04",
      "issuer": "OWASP GenAI Security Project",
      "sourceUrl": "https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/README.md",
      "role": "Threat awareness and mitigations; not certification",
      "currencyNote": "Current 2026 list renumbered Excessive Agency to LLM03"
    },
    {
      "id": "SLSA-1.2",
      "title": "SLSA specification",
      "version": "v1.2",
      "status": "approved",
      "published": null,
      "issuer": "SLSA project",
      "sourceUrl": "https://slsa.dev/spec/v1.2/",
      "role": "Software supply-chain integrity and provenance reference",
      "currencyNote": "Conformance requires assessment against applicable SLSA requirements"
    },
    {
      "id": "PCAOB-AS2201",
      "title": "PCAOB AS 2201",
      "version": "Current standard; amendments effective 2026-12-15 separately",
      "status": "effective_version_context_required",
      "published": null,
      "issuer": "PCAOB",
      "sourceUrl": "https://pcaobus.org/oversight/standards/auditing-standards/details/AS2201",
      "role": "Auditor methodology for integrated ICFR audits; not an AI approval design mandate",
      "currencyNote": "Amendments effective December 15, 2026 must not be treated as already effective on this registry as-of date"
    }
  ],
  "references": [
    {
      "id": "SSDF:PO.4",
      "frameworkId": "NIST-SSDF-1.1",
      "label": "PO.4 — Define and use criteria for software security checks",
      "sourceUrl": "https://csrc.nist.gov/pubs/sp/800/218/final",
      "referenceLevel": "practice"
    },
    {
      "id": "SSDF:PS.1",
      "frameworkId": "NIST-SSDF-1.1",
      "label": "PS.1 — Protect all forms of code from unauthorized access and tampering",
      "sourceUrl": "https://csrc.nist.gov/pubs/sp/800/218/final",
      "referenceLevel": "practice"
    },
    {
      "id": "AI-RMF:MEASURE",
      "frameworkId": "NIST-AI-RMF-1.0",
      "label": "MEASURE — Assess and analyze AI risks",
      "sourceUrl": "https://airc.nist.gov/airmf-resources/playbook/measure/",
      "referenceLevel": "function"
    },
    {
      "id": "AI-RMF:GOVERN",
      "frameworkId": "NIST-AI-RMF-1.0",
      "label": "GOVERN — Organizational AI risk policies and practices",
      "sourceUrl": "https://airc.nist.gov/airmf-resources/playbook/govern/",
      "referenceLevel": "function"
    },
    {
      "id": "OWASP-2026:LLM03",
      "frameworkId": "OWASP-LLM-2026",
      "label": "LLM03:2026 — Excessive Agency",
      "sourceUrl": "https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM03_ExcessiveAgency.md",
      "referenceLevel": "threat"
    },
    {
      "id": "OWASP-2026:LLM01",
      "frameworkId": "OWASP-LLM-2026",
      "label": "LLM01:2026 — Prompt Injection",
      "sourceUrl": "https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM01_PromptInjection.md",
      "referenceLevel": "threat"
    },
    {
      "id": "SLSA:PROVENANCE",
      "frameworkId": "SLSA-1.2",
      "label": "SLSA 1.2 provenance — trace build artifacts to source",
      "sourceUrl": "https://slsa.dev/spec/v1.2/build-provenance",
      "referenceLevel": "specification"
    },
    {
      "id": "PCAOB:AS2201.21",
      "frameworkId": "PCAOB-AS2201",
      "label": "AS 2201 .21 — Top-down approach to controls selected for testing",
      "sourceUrl": "https://pcaobus.org/oversight/standards/auditing-standards/details/AS2201",
      "referenceLevel": "auditing_standard"
    }
  ],
  "mappings": [
    {
      "controlId": "WEB15:AI-01",
      "refId": "SSDF:PO.4",
      "relationship": "supporting_principle",
      "support": "qualified",
      "rationale": "SSDF PO.4 addresses defining criteria for security checks; repository/path/dependency screening is a project-specific implementation adaptation, not language required verbatim by SSDF.",
      "limits": "Does not itself establish financial dependency completeness or SOX applicability.",
      "mappingStatus": "proposed_for_review"
    },
    {
      "controlId": "WEB15:AI-03",
      "refId": "SSDF:PS.1",
      "relationship": "supporting_principle",
      "support": "qualified",
      "rationale": "Protecting code from unauthorized access/tampering is relevant to controlling changes to approval mechanisms; independence of approver administrators is an additional implementation judgment.",
      "limits": "SSDF PS.1 is not a prescriptive SOX segregation-of-duties rule.",
      "mappingStatus": "proposed_for_review"
    },
    {
      "controlId": "WEB15:AI-03",
      "refId": "PCAOB:AS2201.21",
      "relationship": "assurance_context_only",
      "support": "qualified",
      "rationale": "The ICFR auditor's top-down approach can make change authorization controls relevant when they address assessed financial reporting risks.",
      "limits": "AS 2201 .21 does not direct organizations to use any particular GitHub reviewer or bot architecture.",
      "mappingStatus": "proposed_for_review"
    },
    {
      "controlId": "WEB15:AI-04",
      "refId": "OWASP-2026:LLM03",
      "relationship": "threat_mitigation_alignment",
      "support": "qualified",
      "rationale": "Excessive agent authority and permissions are explicitly in scope of OWASP 2026 Excessive Agency; limiting bot privileges is a relevant mitigation.",
      "limits": "Threat alignment does not demonstrate that effective identity boundaries are implemented.",
      "mappingStatus": "proposed_for_review"
    },
    {
      "controlId": "WEB15:AI-04",
      "refId": "SSDF:PS.1",
      "relationship": "supporting_principle",
      "support": "qualified",
      "rationale": "Least-privilege service identities support protection of code and software delivery assets.",
      "limits": "Separate review and merge bot identities are an architectural option, not an explicit SSDF requirement.",
      "mappingStatus": "proposed_for_review"
    },
    {
      "controlId": "WEB15:AI-05",
      "refId": "AI-RMF:MEASURE",
      "relationship": "supporting_principle",
      "support": "qualified",
      "rationale": "The MEASURE function addresses assessing AI risks with appropriate methods and metrics; adjudicated false-low-risk evaluations are a case-specific application.",
      "limits": "AI RMF does not prescribe a universal approval threshold or sufficient false-approval rate.",
      "mappingStatus": "proposed_for_review"
    },
    {
      "controlId": "WEB15:AI-10",
      "refId": "SLSA:PROVENANCE",
      "relationship": "technical_alignment",
      "support": "qualified",
      "rationale": "SLSA 1.2 build provenance concerns verifiable source-to-artifact traceability, supporting the control's build provenance objective.",
      "limits": "A provenance record alone does not prove authorization or full SLSA conformance.",
      "mappingStatus": "proposed_for_review"
    }
  ],
  "legacyAliases": [
    {
      "legacy": "LLM06:2025 Excessive Agency",
      "current": "LLM03:2026 Excessive Agency",
      "note": "Renumbered in OWASP 2026; do not silently re-label 2025 source text as 2026"
    },
    {
      "legacy": "LLM01:2025 Prompt Injection",
      "current": "LLM01:2026 Prompt Injection",
      "note": "Identifier retained but reference must still be versioned"
    }
  ]
};
export const findMappings=(controlId)=>frameworkRegistry.mappings.filter(m=>m.controlId===controlId).map(m=>({...m,reference:frameworkRegistry.references.find(r=>r.id===m.refId),framework:frameworkRegistry.frameworks.find(f=>f.id===frameworkRegistry.references.find(r=>r.id===m.refId)?.frameworkId)}));
