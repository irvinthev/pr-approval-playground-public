# Framework registry — five-control validation pilot

**As of:** 2026-11-12. **Registry revision:** 2026-11-12-pilot.1. **Source:** `framework-registry.js`.

## Scope and intent

Source-versioned primary references and reviewable mapping rationale for **five** existing WEB15 controls: AI-01, AI-03, AI-04, AI-05, AI-10. The separate existing 14 OBJ / 15 WEB15 / 16 WB16 inventories are not collapsed. This does not make the registry authoritative over management policies or applicable regulatory obligations.

Framework records capture issuer, title, version, status, release date where known, primary URL, use case and currency caveat. Reference records have stable IDs. Control-reference relationships carry a narrow interpretation, limitations, and **proposed_for_review** status. Source existence/wording verification does not equal mapping approval or operating-effectiveness assessment.

## Primary sources checked

- NIST SP 800-218 v1.1 (final): https://csrc.nist.gov/pubs/sp/800/218/final . Newer v1.2 revision listed as draft: https://csrc.nist.gov/projects/ssdf/publications
- NIST AI RMF 1.0: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10 . MEASURE playbook: https://airc.nist.gov/airmf-resources/playbook/measure/
- OWASP LLM Top 10 **2026**: https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/README.md . Current Excessive Agency is `LLM03:2026`; older `LLM06:2025` appears in legacy RCM reference text. The old reference is not silently reclassified.
- SLSA v1.2 provenance: https://slsa.dev/spec/v1.2/build-provenance
- PCAOB AS 2201: https://pcaobus.org/oversight/standards/auditing-standards/details/AS2201 . Amendments effective December 15, 2026 are distinguished from the date of this review.

## Pilot mapping interpretations

| Existing web control | Reference | Relationship | Material limitation |
|---|---|---|---|
| WEB15:AI-01 — eligibility | SSDF PO.4 | Supporting secure-development criteria | No framework-mandated financial-dependency allowlist |
| WEB15:AI-03 — approval authority and SoD | SSDF PS.1; PCAOB AS2201 .21 | Supporting principle and assurance context | Neither specifies GitHub bot SoD implementation |
| WEB15:AI-04 — agent identity/permissions | OWASP LLM03:2026; SSDF PS.1 | Threat mitigation and supporting principle | No asserted identity-control effectiveness |
| WEB15:AI-05 — reviewer validation | AI RMF MEASURE | Voluntary AI assessment principle | No universal false-approval threshold prescribed |
| WEB15:AI-10 — build provenance | SLSA v1.2 provenance | Technical source-to-artifact alignment | Provenance alone does not prove change authorization |

## Gaps and next decision

1. Mapping judgments remain **qualified, proposed for expert review**, not independently certified framework requirements.
2. Current source URLs are publisher-controlled and may evolve. Preserve versioned snapshots or immutable upstream revision identifiers before high-stakes use.
3. Framework source data is static, not automatically refreshed. A documented release-update process is required.
4. Most RCM controls are not mapped in this pilot. The existing recommendation weights were **not** recalibrated or replaced; this slice improves evidence lineage, not recommendation accuracy.
5. Owner adjudication should decide whether to accept, narrow, reject or revise each proposed mapping before expanding coverage.

## Reproduction

Run `node --test tests/framework-registry.test.mjs`. Review the **Primary-source crosswalk** section inside any of the five mapped controls in `rcm-explorer.html`. Unmapped controls deliberately say not yet reviewed.
