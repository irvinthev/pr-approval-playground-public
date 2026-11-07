# DP-11 — Shared terminology and logic ownership map

**Scope:** public, fictional PR Approval Playground. **Status:** documented current source boundaries, not a refactor or an approved production architecture. Based on repository `main` inspected November 6–7, 2026; recheck against the PR base before relying on file paths. Terminology is **local to this simulator**.

## One connected case, one decision record

```text
fictional change / revision + policy and dependency-map versions
                |
financial-engine.js  (dependency assessment, technical eligibility, authorization helpers)
                |
case-model.js         (SharedCase.evaluateCase; predicates, historical records, release and rollout)
                |
case-ui.js            (reads the evaluation; displays and dispatches explicit case actions)
    |                   |                              |
experience.html    continuous-monitoring.html    independent-assurance.html
    |
case-guide.js       (optional instructional explanation from evaluation; no authorization)
```

**Canonical within the connected shared-library example:** `SharedCase.evaluateCase(caseRecord)` in `case-model.js`. Its `transition`, `replay`, `encode` and `decode` functions own the bounded editable action history. `case-model.js` invokes `FinancialDemo.assessFinancialImpact`, `assessTechnicalEligibility` and `resolveAuthorization`; it is **not independent of** those helpers. Both model and helpers are client-side fictional demonstrations, not GitHub, CI or production controls.

**The three connected entry pages** load `financial-engine.js` then `case-model.js` then `case-ui.js`; Pipeline additionally loads `case-guide.js`. `case-ui.js` recomputes `SharedCase.evaluateCase(current)` and renders outcome labels, evidence gaps and permissible next actions. `case-guide.js` accepts an evaluation and stage to generate explanatory text. Neither a stage selection nor an explanation is an approval. Actions dispatched by the UI do alter the *fictional* case through `SharedCase.transition`.

## Decision vocabulary — do not collapse these fields

| Term / field | Definition in the connected case | Not a substitute for |
| --- | --- | --- |
| **Mandatory policy** / `policyStatus` | Aggregation of the modeled identity, scope, mapping, checks, reviewer outputs and independent-authorization predicates (`PASS`, `FAIL`, `UNKNOWN`, `PENDING`). | Population completeness or real-world policy approval |
| **Authorization** / `authorizationStatus` | Whether a recorded qualified actor is bound to the exact revision and policy/mapping versions (for example `VALID`, `REQUIRED`, `STALE`, `INVALID`). | AI low-risk scores, merge or release eligibility |
| **Evidence completeness** / `evidenceCompleteness` | `INCOMPLETE` or `COMPLETE_IN_MODELED_SCOPE` based on simulated gaps. The latter does **not** establish authentic, independently reconciled production population or integrity. | Mandatory policy compliance, historical evidence authenticity |
| **Risk acceptance** / `riskAcceptance` | `NOT_RECORDED` or `RECORDED_NOT_AUTHORIZATION` from fictional acceptance events. | Waiver of hard gates, review authority, evidence |
| **Release eligibility** / `releaseEligibility` | Pre-deployment predicate result, including source/build lineage, release checks and matching artifact digest. | A successful production canary or evidence that deployment occurred |
| **Deployment integrity** / `deploymentIntegrity` | Assessment of observed historical deployment/source/build/authorization linkage and modeled route telemetry; missing coverage is unresolved, not automatically unauthorized. | Completeness of all production routes |
| **Rollout / promotion** / `rolloutStatus`, `promotionEligibility` | Post-deployment canary/linkage and permission to promote; failed canary requires designated human containment. | Earlier change authorization, rollback success or safe restart |
| **Human response** / `humanResponse` | Whether a failed canary has a bounded, attributable simulated containment record. | Re-running AI authorization for the incident |

The plain predicate values `PASS`, `FAIL`, `UNKNOWN`, and `PENDING` are **not** the same taxonomy as a reviewer saying `low`, a routing decision such as `HUMAN_REVIEW_REQUIRED`, or an audit conclusion. Never infer authorization merely from a green visual status.

## Assurance terminology — three source inventories, not one

| Concept | Source-qualified identity | What the item represents |
| --- | --- | --- |
| **Control objective** | `OBJ:G01` etc. in `control-matrix.html` | Desired outcome / risk-management objective; 14 in the historical objective inventory |
| **Proposed web safeguard** | `WEB15:AI-01` etc. in `rcm-view.html` / `control-crosswalk.js` | Example engineering mechanism addressing an objective; 15 in web RCM |
| **Workbook control** | `WB16:AI-01` etc. in `downloads/AI_Approval_Example_RCM.xlsx` | Separately authored proposed activity, with linked fictional failure and test rows; 16 in workbook |
| **Test** | Scenario, procedure and expected observation (including workbook T-01..T-16) | Attempt to challenge or validate design/operation; not proof of execution without records |
| **Evidence** | Requested source record or fictional case event | Something to inspect; simulated outputs and exported CSV do not attest to completeness, retention or integrity |
| **Crosswalk relationship** | `control-crosswalk.js`; `rcm-export.js` serializes qualified links | Proposed **related intent**, neither equivalence nor a canonical inventory choice |

A bare `AI-03` is ambiguous: `WEB15:AI-03` concerns approval authority/SoD, while `WB16:AI-03` concerns AI evaluation. The source-qualified links are proposed. Implementation status remains unassessed, not verified by simulator tests.

## Other engines: coexistence, not proven duplication

| Component | Observed behavior | Relationship / disposition |
| --- | --- | --- |
| `financial-engine.js` | Dependency graph traversal, technical eligibility and authorization helpers | Shared pure calculations used by connected case, story and other examples; changing it can affect multiple consumers |
| `story-model.js` + `story.js` | A separately shaped guided-story state and transitions using financial helpers | **Legacy/alternate experience**. Not the connected-case action-history contract; do not replace without parity tests |
| `decision-engine.js` | Simplified scenario-to-stage evaluation and routing; also calls financial helpers | **Separate scenario engine**. Overlap in concepts, not established algorithmic equivalence |
| `rule-engine.js` | Generic configured deterministic rules, evaluated blocks/pending checks and SHA validity | **Separate rules experiment**. Not imported by `case-model.js`; `canApprove` is a modeled flag, not shared-case authorization |
| `financial-ui.js` | Financial Lab and Approval Race presentation, including its own fictional event sequence | Related simulator, distinct state and evaluation path; not an adapter for `SharedCase` |
| `case-guide.js` | Stage-specific explanation of a supplied connected-case evaluation | Presentation-only and tested not to mutate state |
| `case-ui.js` | Connected journey/Monitoring/Assurance presentation and user action dispatch | Adapter, **not** a second source of approval policy |
| `control-crosswalk.js`, `control-crosswalk-ui.js`, `rcm-export.js` | Inventory reconciliation, read-only presentation and CSV rows | No PR authorization behavior; source mappings remain reviewable |

### Duplication candidates — no removal in DP-11

1. **Policy/routing semantics:** `rule-engine.evaluateApproval`, `decision-engine.evaluate` and `case-model.evaluateCase` express overlapping concepts with different input/output contracts. Compare identical negative cases (unknown dependency, stale revision, missing CI, incompatible reviewer decisions and bypass) before proposing consolidation.
2. **Scenario history:** `story-model.transition` and `case-model.transition` mutate different fixtures. Do not port one action by matching names alone.
3. **UI status translations:** `case-ui.js`, the legacy stage views and financial lab have distinct presentation labels. A normalized *display glossary* may be worthwhile; changing engine enums just to align labels risks breaking replay or tests.
4. **Control language:** OBJ, WEB15 and WB16 overlap. Their many-to-many mapping needs Engineering/GRC review; no renumbering or forced equivalence.

## Change-boundary and verification rules

- Changing **`financial-engine.js`**: run financial, story, decision and connected-case regressions; inspect how financial dependency and human authority affect each route.
- Changing **`case-model.js`**: test exact-revision and policy/map invalidation, unknown/failed predicates, action replay, deployment artifact and canary response; compare the same serialized case/evaluation across Pipeline, Monitoring and Assurance.
- Changing **`case-guide.js`** or a UI adapter: assert that explanation, stage selection and navigation do not mutate a decision; intentional fictional actions must still go through `SharedCase.transition`.
- Changing **crosswalk or RCM export**: retain OBJ/WEB15/WB16 namespaces, collision examples, proposed relationships and `Not assessed` status; distinguish design, simulator behavior and real evidence.
- Before retiring an engine: publish fixture-level output comparisons and negative-case parity, plus navigation/URL compatibility evidence. **This comparison has not been completed in DP-11.**

**Open decisions:** Which older experiences warrant retirement; whether their specific decision semantics should converge; GRC/Engineering sign-off on inventory relationships; any canonical control inventory. This document is an engineering interpretation of inspected public source, not management endorsement or auditor reliance.
