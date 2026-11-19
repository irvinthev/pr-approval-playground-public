# V2 — Environment-to-Evidence Assessment Journey

**Status:** Design-branch prototype. Public-safe, fictional, not independently validated. The earlier Field Guide is preserved at `/field-guide-v2.html`; the existing Gemini Challenge Lab backend remains unchanged.

## Preview

Open `/v2/index.html` on the corresponding preview deployment, or serve the repository locally and navigate to `v2/index.html`.

The four views are one connected experience, not four unrelated static documents:

1. **Overview:** proposed design vs. existing workflow, expected outputs, fictional shared-library PR.
2. **Risk Assessment:** select authority, exposure and reachable paths; examine applicability and priority separately; explicitly confirm edits before recalculation.
3. **Engineering Architecture & Build:** business objective, architecture comparisons, reuse/configure/build plan, authorization enforcement, telemetry and technical experiments, plus linked risk-specific expectations.
4. **Assessment & Testing:** selected assessment question, step-by-step inspection and negative testing, fictional worked outcome, explicitly recorded user observations, bounded summary and JSON export.

The risk catalog is a deterministic, illustrative teaching model. **There is no Gemini call, source parsing, AI inference, automatic verification, or claim of actual control effectiveness.**

## Core distinctions

- **Applicability:** could this failure mechanism exist for the stated authority and reachable paths?
- **Priority:** how consequential is it under the stated exposure and credible conditions?
- **Treatment:** what safeguards are proposed or implemented, and what evidence supports operation?
- **Conclusion:** what can legitimately be said given a proposal, or given observed implementation evidence?

A reported safeguard never removes a relevant risk from the matrix.
An environment change is staged and requires **Review risk relevance** before the user sees revised judgments.
Evidence findings are recorded as user-reported observations; the browser does not verify them. Proposed designs cannot record observed enforcement outcomes, and a described existing workflow cannot be judged effective from a conditional design label.
Export is a locally generated JSON payload clearly labeled fictional/unverified.

## Manual acceptance test matrix

1. Open V2 with the fictional shared-library proposal. Confirm R02/R03/R05/R06/R07 are visible and source limitations are clear.
2. Change only the **evidence level** of R03. Confirm its **applicability and priority do not change**.
3. Change the architecture to **agent submits explicit human approval** and click **Review risk relevance**. Confirm R01 applies and R02 is not indicated.
4. Change to **manager routing**, with **replaces required code-owner approval** unchecked. Confirm R08 applies, but no claim is made that routing grants approval authority.
5. Check **replaces required code-owner approval** and apply. Confirm the authorization rationale changes.
6. Edit the environment but do not apply. Confirm the **pending review** notice and unchanged risk results.
7. In Engineering Expectations, inspect R03. Confirm proposed approaches, independence and operations are separate from evidence; links clearly distinguish GitHub technical guidance, NIST methodology and broader AI guidance.
8. Toggle the optional bypass illustration. Confirm it does not claim evidence or actual GitHub enforcement.
9. In Assessment & Testing, record an observation with a scope note. Confirm it is labeled user-reported and does not establish broader effectiveness.
10. Switch proposed to existing. Confirm the conclusion changes from design viability to evidence-bounded implementation assessment.
11. Export JSON; verify it includes environment, applicability, priority, recorded observations, architecture choice, history and disclaimer. Do not export actual confidential content.
12. Review on mobile; test keyboard navigation and visible focus.
13. Confirm the original branch root remains available, V2 opens at `/v2/index.html`, and the previous guide remains available at `/field-guide-v2.html`, and `/open-scenario.html` plus the private Gemini backend are unaffected.

## Out of scope / limitations

- No private or proprietary submissions, external data storage, AI assessment backend, automatic evidence ingestion, document parsing, authentication or collaboration.
- No numerical risk scoring or automatic acceptance of evidence; recorded maturity remains a user assertion.
- Framework links are guidance pointers. The current prototype does not independently validate paragraph-level applicability.
- The fictional risk mappings are **hypotheses for human review**, not a universal risk ranking.
- There is no claim that the existing deployment supports branch preview until an actual preview URL is confirmed.

## Release strategy

Keep `main` and the original homepage unchanged and review this as a **draft pull request**. Validate the above scenarios, fix issues on the feature branch, and only then decide whether to merge the branch-level homepage redirect. Do not merge before the four-stage walkthrough and mobile checks have been completed.

## Engineering and guided assessment redesign

The Engineering view now starts with the problem, compares three possible implementations per authority pattern, and explains what to reuse, configure, build, instrument and operate. The selected risk remains linked to the architecture and its targeted negative-test question. The Assessment view replaces opaque evidence-maturity counters with a guided investigation and a user-reported result. An illustrative completed test is explicitly fictional.

**Verification note:** The 18 targeted checks executed against the latest branch source passed. This is not equivalent to a complete Node test run, interactive browser QA, accessibility testing or validation of real GitHub enforcement.
