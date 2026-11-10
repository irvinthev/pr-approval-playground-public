# Open validations

Checked 2026-11-10. A source check establishes the narrow documented claim, not operation in any target environment.

## Verified primary references used by Phase 1

- **Strong:** OWASP's resource page explicitly names *OWASP Top 10 for Agentic Applications for 2026* and dates it December 9, 2025. This replaces the ambiguous/bad LLM-2026 URL on Assurance. It is separate from LLM Top 10. https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
- **Strong:** GitHub documents `success`, `skipped`, `neutral` as successful required-check statuses, and a skipped job reporting success. The proposed stricter review policy must be separately enforced. https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks
- **Strong, narrow naming check:** GitHub ruleset documentation confirms “Require a pull request before merging”, “Require status checks to pass before merging”, “Dismiss stale pull request approvals when new commits are pushed” and “Require approval of the most recent reviewable push”. Applicability, bypass interactions, head versus merge SHA and actual configuration remain **verify** for private use. https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
- **Qualified:** Fritz Scholz, University of Washington, *Confidence Bounds*, PDF pages 12–14 (zero-index 11–13), gives exact zero-event upper bound and rule of three. Calculation independently checked: `1 - 0.05**(1/300) = 0.009936...`; `3/300 = 0.01`. Requires appropriate independent trials with stable probability and representative sampling. https://faculty.washington.edu/fscholz/DATAFILES/ConfBoundsSlides.pdf

## Unverified — validate before implementation or reliance

| ID | Item | Current treatment / resolution needed |
| --- | --- | --- |
| OV-01 | Vendor reviewer model/prompt version visibility and stability | Unverified. Generic schema expectation, no vendor capability claim. Unknown version remains indeterminate and routes to human. Verify actual identifiers and semantics. |
| OV-02 | Daily seeded canary efficacy/cadence | Tentative proposed design, not proven drift detection or production accuracy. Validate isolation, seed selection, holdouts, cost, missing-run alerts and response thresholds. |
| OV-03 | Human diff-view telemetry and rubber-stamp interval | Unverified; no claim GitHub supplies it. Use only available lawful telemetry, substantive review evidence and interviews. Set an interval before testing; missing activity alone proves nothing. |
| OV-04 | Policy outage human fallback | Qualified design. Verify an independent, enforced fallback actually exists and still enforces mandatory conditions; otherwise block. |
| OV-05 | Evidence source schemas and query executability | Query intents only, not runnable SQL or measured results. Private implementation must supply source schemas, reliable joins, time semantics, retention and extraction completeness. |
| OV-06 | Historical reassessment capability | Qualified proposal, not product behavior. Verify effective/observed timestamps, affected-approval selection, linked immutable history and response workflow. |
| OV-07 | Shadow trial assumptions and management thresholds | No universal acceptance threshold or sample size prescribed. Define eligible population, strata, adjudication and independence; do not treat repeated seeds as representative trials. |
| OV-08 | Existing framework/product references outside the corrected OWASP link | Unverified in this phase. Earlier mappings, clause interpretations, native features, GitHub snippets and attestations are not newly certified by Qualified tags. Revalidate against primary sources before implementation. |
| OV-09 | Attestation settings and protected-branch/ruleset/bypass interactions | **verify**. No new config/settings examples added. Verify each existing snippet's exact spelling, API/plan applicability and real enforcement before using it. Provenance alone does not establish approval. |
| OV-10 | Full /data-driven content and private-overlay schema | Deferred architecture change under P2-00; no claim the current site is data-driven or drift-proof. Phase 1 deliberately retains existing HTML/JS content locations. |
| OV-11 | Legacy Advanced examples | Historical, editable simulations outside Phase 1 tagging pass. Not authoritative decisions, authentic evidence or operational controls. Extend tagging/source validation in P2-10. |
| OV-12 | Full browser and external-link verification | Record actual checks in phase-1-review.md. Internal href/file checks and regression tests do not establish all external links or screen-reader usability. |
