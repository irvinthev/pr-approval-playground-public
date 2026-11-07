# Release integrity and canary response

Source baseline: main commit `1c875c0bde46b3566d0e9d7392c3f200d4006005` (PR #63 merged). All 82 tracked file blobs were checked against the repository; the local source tree matched `392a716ff5e8b80610bc776c8d32742824c0639b`. Baseline: 176 tests passed. This is an additive fictional simulation, not a production enforcement design.

## Three different outcomes

| Trigger | Modeled result | Authorization history | Next valid response |
| --- | --- | --- | --- |
| Substitute the candidate artifact after passing release checks | `artifactIntegrity=FAIL`, `releaseEligibility=BLOCKED` | Original approval stays valid and retained | Restore the verified candidate and run fresh release checks. |
| Deploy the verified artifact, then fail its canary | `rolloutStatus=HALTED_HUMAN_REQUIRED`, `promotionEligibility=BLOCKED` | Original approval remains retained; pre-deployment eligibility is evaluated separately | A designated fictional incident responder records containment. No resubmission for AI approval. |
| Hide the deployed change's approval linkage | `deploymentIntegrity=UNKNOWN`, `rolloutStatus=EVIDENCE_UNRESOLVED` | The approval still exists; the observation no longer links to it | Investigate missing evidence. A healthy canary does not establish authorization. |

A response record does not prove successful rollback, data repair or safe restart. Promotion and new rollouts stay blocked after a failed canary in this bounded model. Restart is deliberately outside this slice; it would require an explicit recovery/authorization design.

## Model changes

`case-model.js` retains the five original, separate conclusions: mandatory policy, evidence completeness, authorization, release eligibility and risk acceptance. It adds `artifactIntegrity`, `deploymentIntegrity`, `rolloutStatus`, `promotionEligibility` and `humanResponse` rather than using a canary to rewrite pre-deployment approval.

The fixture keeps a retained `builds[]` history, a current `releaseCandidateDigest`, and deployment-bound `rollouts[]` records. Deployment records identify their historical build and approval. Later PR revisions or rebuilds do not redefine what an earlier deployment was built from. A known source/digest mismatch is an EXCEPTION; missing record identity, approval linkage or build evidence remains unresolved.

Canary and response records bind to a deployment ID, revision and digest. The fictional containment actor is `demo-incident-responder` with the incident-responder role, separate from the fictional contributor. A mismatched, incomplete or incorrectly authorized response cannot clear the human-response requirement. These invented identities do not establish real administrative independence.

New enumerated actions:

- `SUBSTITUTE_ARTIFACT`: challenge an eligible, not-yet-deployed release candidate.
- `RESTORE_ARTIFACT`: restore the verified digest and require fresh release checks.
- `CANARY_PASS`, `CANARY_FAIL`: observe the identified deployment's canary.
- `HUMAN_CONTAIN`: record designated human containment after failure; promotion stays blocked.
- `LOSE_DEPLOYMENT_LINK`: hide an existing standard deployment's approval pointer while retaining the approval record.

## UI and scope

Pipeline, Monitoring and Assurance render the same evaluator record. Release challenges appear when their prerequisites exist. All five original conclusions remain separate. Production outcomes and expected/observed artifact identities appear in a dedicated section. The failed canary receives a human-response action, never a renewed AI approval action. Selecting a stage remains presentation only.

The four fixed legacy scenarios remain separate and unchanged. No role dashboards, production integrations, real metrics, thresholds, company configuration, automatic rollback, financial materiality conclusion or SOX reliance is introduced.

## Compatibility and boundaries

URL transport remains schema 1: only the fixed case ID and enumerated action history are accepted. Existing action links replay into the additive fixture with the same original decision meanings; a historical DEPLOY now also initializes a pending canary. New links require this evaluator version. Unknown actions/conclusions, invalid sequences, imported role/stage metadata and oversized payloads remain rejected. Limits remain 64 actions and 12,000 encoded characters. All imported values remain editable simulation data and are safely rendered; conclusions are recomputed. All shared consumers receive matching script version updates.

## Verification

The first seven new release-integrity tests were run red against the baseline, then passed after implementation. Four additional regressions cover blocked restart after containment, historical-deployment canaries after a new PR revision, missing linkage despite a healthy canary, and guidance/evaluator separation. The complete suite passes 187 tests with no failures, skips or cancellations.

Browser checks compared exact serialized case/evaluation records across Pipeline, Monitoring and Assurance for artifact substitution, canary failure and missing approval linkage. All matched. Approval history was preserved through artifact and canary challenges. Human containment left promotion blocked. A passing canary with missing approval linkage remained unresolved and blocked. Tests cover historical build records, incorrect responder authority, invalid action order, replay purity, fragment guardrails and unchanged original decision behavior.

At 375px iframe viewport widths, the artifact-mismatch and canary-failure views render without page-level horizontal overflow. This was not physical-device or screen-reader testing.

This verifies the fictional model and tested views. It does not establish completeness, immutability, control effectiveness, real rollback success or operating performance in a production environment.
