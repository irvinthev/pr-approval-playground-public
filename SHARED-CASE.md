# Connected shared-library case (schema 1)

This is fictional, editable browser simulation data. It neither enforces real permissions nor supplies authentic, immutable or tamper-resistant audit evidence. No role dashboards, backend, inference, dependencies, external service, analytics or credential storage were added.

## Entry and trace

On `experience.html`, choose **Shared library · connected case** or **Follow the shared-library case**. The normal documentation walkthrough remains the default. Use the case's **Monitoring** and **Assurance** links to retain its state. Ordinary stage selection only changes the explanation in view.

1. Start at `case-revision-A`: technical evidence is pending; independent authorization is required.
2. Simulate fresh CI and two LOW findings. The map traces `dedup → usage → billing → reporting`; protected financial review remains required.
3. Simulate qualified independent review. Policy is PASS and authorization VALID; release is still PENDING.
4. Under **Change the case or inspect its record**, push a revision. Revision B retains A's approval as history, but authorization is STALE, policy FAIL and release BLOCKED.
5. Record fresh checks. The old approval remains stale.
6. Simulate renewed review. A new authorization binds revision B, `demo-policy-1` and `demo-map-1`. Release remains pending until the synthetic build and release validations occur.
7. Follow Monitoring or Assurance. Both pages decode the same case actions and recompute the same evaluation using `SharedCase.evaluateCase`.
8. Observe an uncovered manual deployment. Monitoring reports missing coverage and unresolved linkage; it does not automatically label the release unauthorized.

Reproduce the revision trace without a browser:

```sh
node - <<'JS'
const C=require('./case-model');
let c=C.initial();
for(const action of [null,'CHECKS','APPROVE','PUSH','CHECKS','APPROVE']){
 if(action)c=C.transition(c,action);
 const x=C.evaluateCase(c);
 console.log(action||'INITIAL',x.evaluatedRevision,x.policyStatus,x.authorizationStatus,x.releaseEligibility);
}
JS
```

## Contract and status meanings

`case-model.js` exports `initial`, `validateCase`, `evaluateCase`, `transition`, `aggregate`, `encode`, `decode` and `replay`. `evaluateCase` does not mutate its input or read browser, clock, network, stage or role state. It reuses `FinancialDemo.assessFinancialImpact`, `assessTechnicalEligibility` and `resolveAuthorization`.

| Input | Meaning |
| --- | --- |
| `schemaVersion`, `caseId` | Schema 1 and the fixed fictional `shared-library` fixture. |
| `change` | Fictional repository/allowlist fact, author, changed paths and current revision. |
| `versions`, `mappingKnown` | Applicable policy/mapping versions and availability of mapping evidence. |
| `technical` | CI and two reviewer records, bound to revision and record IDs. Reviewer records identify model/prompt versions. |
| `authorizations[]` | Historical approvals with actor, role, rationale, revision and policy/mapping versions. |
| `build`, `release`, `deployments[]` | Synthetic source/artifact lineage, required gate outcomes and observed production routes. |
| `evidence` | Population corroboration within modeled scope and the covered route list. |
| `riskAcceptances[]` | Residual-risk records, separate from authorization. |
| `events[]` | Ordered fictional action history; editable and replayable, not an authentic audit trail. |

Predicates use PASS, FAIL, UNKNOWN and PENDING. Aggregation precedence is FAIL → UNKNOWN → PENDING → PASS. FAIL means a known failed/stale condition; UNKNOWN means necessary scope or identity is unresolved; PENDING means a required modeled record/action has not occurred. The evaluator emits all predicates, their record references and reasons; it also returns `failedPredicates` and `nextValidActions`.

| Output | Meaning |
| --- | --- |
| `policyStatus` | Aggregation of identity, mapping, technical and mandatory independent-authorization predicates. PASS does not establish real control effectiveness. |
| `authorizationStatus` | REQUIRED (none), INCOMPLETE (identity missing), STALE (revision/version mismatch), INVALID (wrong authority), WITHHELD (other prerequisites fail), or VALID (all modeled authorization conditions hold). |
| `evidenceCompleteness` | INCOMPLETE or COMPLETE_IN_MODELED_SCOPE. Complete is limited to this model and does not prove real-world population completeness. |
| `releaseEligibility` | PENDING, BLOCKED or ELIGIBLE based on mandatory policy, current source/artifact lineage and passing release checks. This is not a deployment record. |
| `riskAcceptance` | NOT_RECORDED or RECORDED_NOT_AUTHORIZATION. It never satisfies mandatory predicates. |
| `monitoringFindings` | Stale authorization, uncovered route and unresolved/conflicting deployment linkage. Missing evidence is distinguished from known mismatch. |

## Fragment boundary

Only `{schemaVersion:1,caseId:'shared-library',events:[...]}` is transported in `#case=...`. The payload accepts no imported conclusions, actors, role or stage metadata. It is limited to 12,000 encoded characters and 64 enumerated actions. Unknown fields/actions, malformed encoding, unsupported schemas and impossible action sequences are rejected. Each page replays accepted actions into a fresh fixture and evaluates again. Export encoding also verifies the case matches its history.

The UI renders values with DOM `textContent`/text nodes and uses fixed local destinations for links. No storage API or server state is used. Different tabs are independent snapshots of their links; there is no cross-tab synchronization. Deleting or editing history changes the simulation; it cannot establish authenticity.

## Baseline disposition

Inspected baseline: `257688acb0418b5fb7d5143015534a5c7475295a`; 68 tests, 65 passed, 3 failed.

- Stage equality failure: terminology regression after introducing Production rollout. Data labels now agree; the equality test remains.
- Navigation failure: intentional five-chapter redesign plus a stale sandbox header. Tests now assert the intended navigation and supporting-reference context; the sandbox header was corrected.
- Homepage card count: obsolete six-card assertion. Tests now check all five intended destinations in order, including Blueprint.

Four new regression tests were run red before fixes: stale reviews in non-`newCommit` decision branches; missing revision identity permitting `canApprove`; hypothetical no-consumer scope retaining protected mapping facts; blocked release attempt displaying completed-promotion wording.

Retired experiments are not migrated to the shared evaluator. Their four specifically reproduced inconsistencies are fixed, and changed script assets are versioned. Billing-error arithmetic remains a conditional scenario calculation and is not used as a loss or materiality conclusion.

## Verification for this slice

After changes: 93 Node tests passed, including 25 new tests. The four reproduced inconsistencies were first tested against the unfixed code: all four tests failed, then passed after fixes. Additional regressions cover explicitly blank identity, invalid monitor data, version-bound release checks, protected review, stale technical evidence, uncovered routes, schema/import bounds and evaluator/view independence.

Preview browser checks exercised the A → approval → B → stale → fresh checks → renewed-review sequence; compared identical serialized case and evaluation records across Journey, Monitoring and Assurance; checked stage selection without case mutation; simulated build/release/deployment; rejected an injection-shaped unknown action; and verified the skip link preserves the case while moving focus. Three 375px-content iframe views had no page overflow, including an expanded predicate table. New UI has no animations, and reduced-motion CSS is retained/inspected.

Not performed: physical-device testing, full screen-reader/accessibility audit, actual reduced-motion preference emulation, optional Playwright smoke script, production integrations or real control-effectiveness testing. No four-role UI exists in this slice; unit tests verify view metadata cannot alter evaluation. Remaining retired experiments retain their separate models.
