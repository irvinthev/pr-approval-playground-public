# Product foundation: canonical pipeline and decision contract

**Status:** Proposed, non-production simulator foundation. This branch adds vocabulary and contract tests; it does **not** replace every page's own logic or establish that the whole site now shares one evaluator. No real CI, GitHub authorization, AI inference, or deployment occurs.

## What has actually been inspected

Primary repository sources inspected: `README.md`, `index.html`, `experience.html`, `engineering-blueprint.html`, `risk-controls.html`, `continuous-monitoring.html`, `independent-assurance.html`, `auditor-view.html`, `rcm-view.html`, `control-matrix.html`, `financial-engine.js`, `case-model.js`, `case-ui.js`, and associated tests.

The existing `case-model.js` is the strongest starting point: `evaluateCase(case)` is pure; `transition` and replay bind modeled evidence and approvals to revision, policy and mapping versions. The connected shared-library case already transfers across Pipeline, Monitoring and Assurance via replayed URL fragments. Fixed Overview and Auditor View outcomes remain separate.

## Canonical product stages

`product-pipeline.js` is the proposed product-level vocabulary. It describes **eight visible steps**; existing Engineering stage numbers remain seven because deterministic eligibility and CI belong to the same implementation checklist stage, and production monitoring is part of the last engineering operations stage.

| Product stage | Current seven-stage Engineering mapping | Intent |
| --- | --- | --- |
| 1 Pull request | 1 Pull request | Exact repository, author, changed paths, revision |
| 2 Deterministic eligibility | 2 Eligibility + CI | Protected scope, dependencies, unknown impact |
| 3 Required CI and code checks | 2 Eligibility + CI | Mandatory technical validation for current revision |
| 4 AI code review | 3 AI code review | Revision-bound model outputs, disagreement |
| 5 Authorization decision | 4 Authorization | Enforced automated or qualified human route |
| 6 Protected merge and build | 5 Merge + build | Protected merge and source-to-artifact identity |
| 7 Preproduction and release | 6 Pre-production gate; 7 Production rollout | Release eligibility, provenance, deployment |
| 8 Production monitoring and response | 7 Production rollout / Operations | Canary, population, incidents and containment |

**This is a mapping, not a claim that page labels have already been migrated.** Preserve the distinction between logical product stages and technical execution order: CI and AI evaluation may run concurrently, but authorization requires all applicable prerequisites.

## Canonical case schema: retain and extend deliberately

Preserve `case-model.js` schema-1 for the current connected shared-library slice:
`schemaVersion`, `caseId`, `change`, `versions`, `mappingKnown`, `technical`, `authorizations`, `build`, `release`, `deployments`, `riskAcceptances`, `evidence`, `events`.

Do **not** replace these with a generic score or a UI stage selector. A later schema revision must add explicit reviewer outcomes, approved automated identity, alternative authorized human routes, deterministic downstream dependency edits, and rollback/canary events with migration and tests. Keep all imported history bounded, validated, recomputed, and explicitly labeled simulation data.

## Decision meanings

| Question | Required result boundary |
| --- | --- |
| Is auto-approval in scope? | Deterministic eligibility, protected impact, mapping certainty; not an AI score |
| Have mandatory checks passed? | Technical checks must match revision; a human cannot waive failures |
| What do two reviewers say? | Structured evidence, versions and exact revision; disagreement routes to human **when other mandatory checks pass** |
| Who can authorize? | Different protected automated/human actor routes; authority independent of model scores |
| Can this exact revision merge? | Effective protected GitHub enforcement must check applicable mandatory conditions |
| Can the artifact reach production? | Source/artifact identity and required release validation |
| Is production healthy? | Canary and recovery observations distinct from historical approval validity |
| Is evidence complete? | Source/population corroboration and alternative production routes, not merely dashboard count |
| Was risk accepted? | Residual risk record; never substitutes for authorization or required checks |

For predicates, preserve `PASS`, `FAIL`, `UNKNOWN`, `PENDING`. For user-facing routes, do not overload `BLOCKED` to mean both a failed mandatory CI check and a valid human-escalation decision. Separate **route selection** from **enforcement outcome**.

## Four scenario contracts and current coverage

| Scenario | Expected route | Current reusable implementation | Gap |
| --- | --- | --- | --- |
| Standard low-risk pass | Auto route eligible, then protected authorization and release | Financial engine documentation fixture shows `AUTOMATION_ELIGIBLE`; fixed Overview simulates the full release | Connected case lacks a fully modeled automated-approver grant |
| AI split decision | Human code review required, no auto-approval | Overview and Auditor View have fixed examples | Financial engine currently returns `BLOCKED` for non-low AI review, not a distinct route; shared-case action `CHECKS` always creates two PASS results |
| Hard-gate scope exclusion | Auto route excluded; qualified human review may proceed | Shared-library connected case covers protected billing dependency, human review, stale SHA, controlled release | Dependency-removal toggle is not modeled in schema-1 |
| Production canary failure | Contain/stop/rollback, retain historical approval | Fixed Overview and Auditor View scenarios; operational monitoring examples | Shared-case evaluator does not have a canary-failure transition |

**Do not mark these gaps as solved because the four buttons render.** Later work should first introduce red tests for route distinctions and safe state transitions, then integrate page views.

## Shared data contract: pages

- Overview: stage and scenario *preview*. Should read canonical stage definitions; avoid independent authorization logic.
- Pipeline: primary writable scenario controller for the single connected case.
- Engineering & Operations: component implementation contracts and operations readouts driven by case and evaluator.
- Risks & Safeguards: failure injection alters case inputs; cannot directly set a favorable outcome.
- Monitoring: observation, population gap and incident evidence for that same case.
- Assurance and Auditor View: read-only case evidence and independent evaluation guidance; assessments do not alter authorization.
- RCM/Control Reference: single versioned control inventory eventually drives views and workbook export.
- Advanced Labs: explicitly separate experimental models until individually migrated, tested and retired.

## Baseline observations (reproduced from source, not full CI test suite)

In-process execution of the current `financial-engine.js` and `case-model.js` yielded:
- `initial`: protected dependency / authorization REQUIRED / policy PENDING.
- `CHECKS`: protected dependency / still authorization REQUIRED.
- `CHECKS, APPROVE`: authorization VALID / policy PASS / release PENDING.
- `CHECKS, APPROVE, PUSH`: authorization STALE / policy FAIL / release BLOCKED.
- `CHECKS, APPROVE, BUILD, RELEASE_CHECKS`: release ELIGIBLE.
- `CHECKS, MAP_MISSING`: dependency UNRESOLVED / policy UNKNOWN.
- Documentation fixture: `AUTOMATION_ELIGIBLE`.
- AI split fixture: current financial engine says `BLOCKED`; this is a semantic gap, not a policy recommendation.

The new `tests/product-foundation.test.js` adds assertions for these contracts and regression boundaries. **The complete Node and browser test suites have not been executed in this connector-only environment.** Execute `node --test tests/*.test.js` and the optional Playwright browser smoke tests in CI/locally before merging.

## Next implementation vertical slice

1. Red-test and implement separate **automated eligibility**, **human escalation**, **mandatory-check blocking**, **authorization validity**, and **release/incident** states; do not silently change the legacy financial lab.
2. Extend shared-case schema and replay with safe migration for the four selected scenarios. Preserve revision identity, bounded import and immutable historical simulation records.
3. Wire Pipeline, Overview, Monitoring and Auditor View to the same event history and evaluator; no second case-specific scoring engine.
4. Unify the control inventory (interactive RCM presently differs from downloadable RCM and technical reference).
5. Confirm browser behavior, responsive interaction, accessibility, and no external data calls before migrating the remaining pages.

## Ownership and boundary

The public simulator illustrates possible engineering and assurance practices. It does not authorize real changes, implement administrative independence, establish audit evidence authenticity, or determine SOX compliance. Engineering owns real architecture, policy, rollout and controls. Audit and GRC may challenge and evaluate.
