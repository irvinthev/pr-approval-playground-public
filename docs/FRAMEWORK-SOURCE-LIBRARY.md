# Framework Source Library and Mapping Register

As-of baseline: **2026-11-12**. Draft PR #158; source catalog format v1.0.0.

## Two synchronized representations

- **GitHub = source of truth:** `framework-source-catalog.js` with immutable record IDs; CSV projections under `data/`.
- **Spreadsheet = review instrument:** `AI_SDLC_Framework_Source_Mapping_Register.xlsx` supplied alongside the PR. Identical ID sets and review baseline; the workbook is **not** a live two-way synchronization system. Review decisions must be intentionally reconciled back into GitHub before adoption.

The workbook deliberately contains 10 source metadata records, 18 *selected* framework provision/topic records, and 8 proposed WEB15 mappings. It is **not a full extraction** of NIST, OWASP, SLSA or CoSAI catalogs. Framework references are categorized as normative-ish specification topics, voluntary guidance practices, draft areas, threat taxonomy, design principles, accountability models or structured catalog pointers; none implies automatically applicable compliance.

### Source inventory

| Primary source | Version and status | Primary link |
|---|---|---|
| NIST SP 800-218 SSDF | v1.1, final | https://csrc.nist.gov/pubs/sp/800/218/final |
| NIST AI RMF | v1.0, final | https://www.nist.gov/itl/ai-risk-management-framework |
| NIST IR 8596 Cyber AI Profile | Initial preliminary draft, **not final** | https://csrc.nist.gov/pubs/ir/8596/iprd |
| SLSA | v1.2, approved | https://slsa.dev/spec/v1.2/ |
| OWASP Top 10 LLM | 2026, published | https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/README.md |
| OWASP Top 10 LLM | 2025, historical version | https://genai.owasp.org/llm-top-10/ |
| CoSAI Agentic Security Principles | July 14, 2025, approved | https://github.com/cosai-oasis/cosai-tsc/blob/main/security-principles-for-agentic-systems.md |
| CoSAI Risk Map | Living structured YAML | https://github.com/cosai-oasis/secure-ai-tooling/tree/main/risk-map |
| CoSAI Shared Responsibility | v1.0 | https://github.com/cosai-oasis/ws3-ai-risk-governance/blob/main/shared-responsibility-framework/CoSAI%20Shared%20Responsibility%20Framework.md |
| PCAOB AS 2201 | Edition/effective date context required | https://pcaobus.org/oversight/standards/auditing-standards/details/AS2201 |

## Provenance discipline

1. **Source facts:** Publisher, title, version, source URL and status are distinct fields.
2. **Reference facts:** Exact NIST AI RMF subcategory IDs (e.g. MEASURE 2.1), OWASP versioned IDs, or source-specific topics.
3. **Relationship judgments:** All eight mapping rows are `proposed-for-review` and `Pending`, with rationale and a qualified support label.
4. **Control implementation:** Not tested. The existing RCM and evaluator maintain their own statuses.
5. **Confidentiality:** Restricted Cursor SOC 2 vendor assurance and confidential Braze configuration are excluded from every repository source and spreadsheet row.

## Important source distinctions

- NIST AI RMF **MEASURE 1.3, 2.1 and 2.3** are specific, numbered subcategories in the uploaded 2023 original PDF (Table 3, printed page 29). This narrows the old broad `MEASURE` label for WEB15:AI-05.
- NIST IR 8596 (December 2025) covers **Secure, Defend, Thwart** as proposed focus areas and associates them with CSF 2.0 outcome categories. Do **not** present its suggested priorities as final NIST requirements.
- SLSA v1.2 **Build** and **Source** tracks serve different integrity properties; build provenance alone is not release authorization.
- OWASP `LLM06:2025` Excessive Agency becomes `LLM03:2026`; do not overwrite historical source version IDs.
- CoSAI Risk Map has its own YAML/schema and component/risk/control/persona relations. This pilot records the canonical pointer rather than importing unvalidated complete upstream content.
- The original repository's 14-objective / 15-web-safeguard / 16-workbook mapping namespaces remain separate. The source catalog uses `WEB15:` references only.

## Workflow

1. Verify source versions against upstream publisher before new mapping batches.
2. Inspect exact provision and content; note where the source is a practice, threat or principle rather than an obligation.
3. Propose a narrow control relationship with rationale and limitation.
4. Have a reviewer mark **Accept / Narrow / Reject / Needs research** in the spreadsheet.
5. Resolve decisions into the GitHub data module and tests. Do not edit the public RCM's mappings automatically.
6. Revisit on source updates or significant use-case changes.

No live network fetches, vendor data, secrets, or private documents are used by the browser Explorer.

## Automated checks

`node --test tests/framework-source-catalog.test.mjs tests/framework-registry.test.mjs tests/rcm-explorer.test.mjs`
