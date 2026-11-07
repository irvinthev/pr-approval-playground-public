# Control inventory crosswalk and connected-case repair

Baseline: `775a3b40ce3e76bd0823b5609314b4400233cb3b` (inspected November 6, 2026, America/New_York).

## Result

Direct extraction verifies 14 objectives in `control-matrix.html`, 15 safeguards in the `rcm-view.html` controls array, and 16 controls in `downloads/AI_Approval_Example_RCM.xlsx`. The workbook has four tabs: RCM (16 control rows), Failure Scenarios (16 linked rows), Testing and Evidence (16 linked rows), and Assumptions (20 topic rows). Every F-01..F-16 and T-01..T-16 row points to its corresponding workbook control.

The counts describe different inventories, not a simple missing-control count. Bare AI-xx identifiers collide semantically. For example, workbook AI-03 is AI evaluation; web AI-03 is Approval Authority & SoD.

Use source-qualified aliases in the crosswalk: `OBJ:G01`, `WEB15:AI-01`, `WB16:AI-01`. Existing source IDs and anchors remain intact. This does not select a canonical inventory or claim that related safeguards are equivalent.

## Workbook-row disposition

All relationships below are proposed related-intent mappings. Source extraction is direct evidence; the relationship judgment remains reviewable. Detailed activities, evidence, row references and limitations are preserved in `control-crosswalk.js` and the downloadable CSV on `rcm-view.html#inventory-crosswalk`.

| Workbook source | Domain | Related objectives | Related web safeguards |
| --- | --- | --- | --- |
| WB16:AI-01 (RCM row 6) | Eligibility | OBJ:G01, OBJ:D02 | WEB15:AI-01, WEB15:AI-02 |
| WB16:AI-02 (RCM row 7) | Dependencies | OBJ:D02 | WEB15:AI-01, WEB15:AI-15 |
| WB16:AI-03 (RCM row 8) | AI evaluation | OBJ:A01, OBJ:X02 | WEB15:AI-05, WEB15:AI-14 |
| WB16:AI-04 (RCM row 9) | Failure handling | OBJ:A02, OBJ:A04 | WEB15:AI-04, WEB15:AI-06 |
| WB16:AI-05 (RCM row 10) | Decision binding | OBJ:D01, OBJ:X01 | WEB15:AI-06, WEB15:AI-07, WEB15:AI-08, WEB15:AI-15 |
| WB16:AI-06 (RCM row 11) | Human authorization | OBJ:G01, OBJ:D01 | WEB15:AI-09 |
| WB16:AI-07 (RCM row 12) | Administrative independence | OBJ:G02, OBJ:A02 | WEB15:AI-03, WEB15:AI-04, WEB15:AI-15 |
| WB16:AI-08 (RCM row 13) | Merge enforcement | OBJ:D01, OBJ:D03 | WEB15:AI-08, WEB15:AI-03 |
| WB16:AI-09 (RCM row 14) | Build and release | OBJ:P01, OBJ:X01 | WEB15:AI-10, WEB15:AI-11 |
| WB16:AI-10 (RCM row 15) | Deployment routes | OBJ:P02 | WEB15:AI-11, WEB15:AI-03 |
| WB16:AI-11 (RCM row 16) | Approver changes | OBJ:A03, OBJ:G02, OBJ:X02 | WEB15:AI-14, WEB15:AI-15 |
| WB16:AI-12 (RCM row 17) | Evidence integrity | OBJ:X01, OBJ:A04 | WEB15:AI-06, WEB15:AI-07, WEB15:AI-10, WEB15:AI-12 |
| WB16:AI-13 (RCM row 18) | Population and IPE | OBJ:X01, OBJ:P03, OBJ:X02 | WEB15:AI-12 |
| WB16:AI-14 (RCM row 19) | Monitoring and response | OBJ:A04, OBJ:P03, OBJ:X02 | WEB15:AI-12, WEB15:AI-13 |
| WB16:AI-15 (RCM row 20) | Shutdown and recovery | OBJ:A04, OBJ:P02, OBJ:P03 | WEB15:AI-12, WEB15:AI-13 |
| WB16:AI-16 (RCM row 21) | Exceptions and risk acceptance | OBJ:G01, OBJ:D01, OBJ:X01 | WEB15:AI-02, WEB15:AI-09, WEB15:AI-15 |

## Explicit coverage distinctions

The workbook has dedicated requirements for evidence lifecycle (WB16:AI-12), population/IPE (WB16:AI-13), shutdown and restart including queued/in-flight activity (WB16:AI-15), and five separate conclusions plus exception expiry/non-waiver (WB16:AI-16). Related web safeguards distribute or state narrower parts of those requirements. These are documentation distinctions, not findings about real production controls. Conversely, WEB15:AI-02 states policy ownership explicitly, WEB15:AI-04 isolates agent identities/permissions, and WEB15:AI-08 includes relevant testing; related workbook rows do not automatically establish equivalent scope.

The workbook remains unchanged. All 16 implementation statuses remain Not assessed, all failure executions Not run, and all test statuses Not tested. Running simulator tests does not change workbook operating-effectiveness statuses.

## Connected-case repair

The current Assurance landing had no shared-case mount, evaluator scripts or case styles, despite case links pointing to it. Restored the hidden mount and ordered dependencies. Default Assurance content is retained; an active case fragment or explicit shared example reveals the case. Existing fragment validation and replay remain unchanged.

Browser verification found a second rendering regression: Pipeline's adapter unconditionally wrote to a removed `.head .caption`. The adapter now treats the caption as optional and continues rendering the shared evaluator's statuses. Evaluator logic, authority and accepted case actions did not change. Script versions were updated on the three consumers.

## Verification

- Two new tests failed before crosswalk/mount changes and passed afterward. A third test reproduced the optional-caption TypeError before the adapter fix and passed after it.
- Focused command: `node --test --test-reporter=tap tests/control-crosswalk.test.js tests/shared-case.test.js tests/financial-engine.test.js tests/case-entry.test.js`. 39 passed, 0 failed.
- Browser trace: revision A, fresh checks, independent approval, push revision B. Serialized case and evaluation records are identical across Pipeline, Monitoring and restored Assurance. All report STALE authorization, FAIL mandatory policy, BLOCKED release.
- Fresh checks alone leave authorization STALE. Renewed independent review, trusted build and release checks produce VALID authorization, PASS mandatory policy and ELIGIBLE release while evidence remains INCOMPLETE and risk acceptance NOT_RECORDED. Returning to Pipeline preserves the record. Selecting a stage does not mutate it.
- Crosswalk search and CSV download were exercised. All 16 workbook controls are available; filtering WB16:AI-03 returns the correct reviewer-validation relationship.
- At 375px iframe viewport widths, active Assurance and crosswalk have no page-level horizontal overflow. The wide crosswalk uses its labeled local scrolling region. This is not a physical-device or screen-reader audit.

## Baseline test disposition

The original complete suite had 171 tests: 159 passed, 12 failed. The shared-case mount failure is an in-scope regression repaired here. The initial draft suite had 175 tests: 164 passed, 11 failed. Those 11 failures were reproduced in both push and pull-request CI jobs. The follow-up below resolves them; the table records their original disposition.

| Baseline group | Disposition | Follow-up |
| --- | --- | --- |
| Missing shared-case mount (`case-entry`) | Regression, repaired | Assert mount, dependency order and shared trace. |
| Former four-step Assurance, embedded matrix and scenario elements (`assurance-foundation`, `rcm-view`, selected `site-navigation`) | Assertions target removed UI; intentional-change candidates requiring design confirmation | Agree the current three-section Assurance intent before changing these assertions. |
| Exact Auditor link without its current fragment (`auditor-view`, `rcm-view`) | Obsolete exact-link candidates mixed with former UI checks | Check the linked destination and preserve meaningful behavior assertions. |
| Active navigation marker (`site-navigation`) | Pre-existing accessibility/navigation regression outside this slice | Restore appropriate aria-current without changing chapter selection. |
| Static old-fragment check (`site-navigation`) | Static checker ignores existing runtime redirect aliases | Verify aliases at runtime, then teach the checker about supported redirects or restore actual anchors. |
| Assurance footer shape and Monitoring return (`site-navigation`, `unified-monitor-investigations`) | Pre-existing navigation/markup mismatch | Confirm intended return route and add semantic footer navigation. |

## Remaining decisions

Confirm source-qualified naming and canonical relationship semantics; review proposed many-to-many mappings; decide whether to elevate dedicated workbook evidence/IPE/shutdown/exception activities into standalone web safeguards. No renumbering, consolidated control definition, management ownership, timeline, SOX conclusion or external-auditor concurrence is inferred.

## CI follow-up: both failed checks resolved

Both failed GitHub checks ran the same regression suite, once on push and once on pull_request. Their logs confirmed the same 11 failures.

- Restored Assurance’s active primary-navigation marker and semantic chapter footer with a Monitoring return link. Added a direct link to the existing detailed-procedure reference.
- Preserved the former four-step/matrix/scenario assertions and retargeted them to `assurance-procedures-reference.html`, where those features remain. The main Assurance page is tested for its current three-section order, six assurance objectives, three evidence conclusions, shared-case mount and correct destinations.
- Auditor entry assertions now require the actual billing-challenge fragment. This tests the intended destination instead of demanding an outdated bare URL.
- The local-link checker executes the existing bounded Assurance redirect handler for legacy aliases, then verifies the final file and anchor. A new negative test confirms nonexistent pages/fragments still fail and shared-case fragments are not redirected.

Local verification after follow-up: all 176 tests pass, no failures, skips or cancellations. All root JavaScript files pass `node --check`. No checks were disabled, skipped or made optional; the workflow still runs the full suite on both events. Remote CI status must be read for the new head commit before claiming the GitHub checks pass.
