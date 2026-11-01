# Simplified guide state and evidence

The main Field Guide, Blueprint and Assurance pages use `guide-model.js` and `field-guide.js`. They share exactly three fictional scenarios and one URL-carried event history. This is a teaching model. It performs no actual review, approval, build or deployment, and none of its invented records establishes control effectiveness.

## State contract

The hash contains `#guide=` followed by a URL-encoded object with exactly three fields: `schemaVersion: 2`, `scenario` (`happy`, `protected`, or `review`), and `events`. The schema is strict and the encoded payload is bounded to 12,000 characters. Events must be a prefix of the sequence below. Unknown fields, scenarios, actions, skipped steps and malformed payloads are rejected. Conclusions and evidence are recomputed; imported approval or deployment assertions are not trusted.

The `step` query selects a stage to inspect. It is not an evaluator input and cannot advance authorization. `section` is a bounded UI-only RCM destination. When a URL includes both a scenario query and encoded case, they must agree. Starting or resetting a scenario clears its action history explicitly.

| Action | Records produced | Preconditions represented |
| --- | --- | --- |
| REVIEW | Current CI and two AI results; invented validation baseline | Identified source and fixed applicable policy/mapping |
| AUTHORIZE | Policy authorization or independent human approval | Current required CI; policy route and qualified identity |
| BUILD | Trusted builder, source, artifact and authorization linkage | Current authorization exists |
| RELEASE | Release checks and exact build/artifact linkage | Authorized build exists |
| DEPLOY | Invented standard-route deployment record | Mandatory release checks passed |
| MONITOR | Independent-source reconciliation sample | Deployment record exists |

Human escalation is not approval. A nonqualifying AI result does not need to be changed to LOW for the human path; required CI and release conditions continue to apply. Protected dependencies cannot receive policy authorization. Policy and human approvals use distinct identities and bind source, policy and mapping versions.

Authorization status, release eligibility, deployment, and monitoring are distinct outputs. `MATCHED` means only that the invented monitor inputs satisfy the example comparison. `PENDING` means the required example records have not been produced. `EXCEPTION` means the comparison found a mismatch. A monitor result is not proof that a gate prevented deployment.

## Reference separation

Older `#case=` URLs are not silently translated or defaulted into a happy path. A main page shows an explicit handoff to the advanced walkthrough with the original hash intact. The primary Assurance page no longer loads `case-ui.js`, preventing a second case renderer from appearing beside the new case. Legacy reference anchors and downloads are excluded from legacy case-link rewriting.

Detailed architecture and assurance references remain under labeled disclosures. Their generic examples do not change the selected case. Older monitoring and Auditor View examples are separate advanced material, not additional scenarios in the main guide.

## Control mapping

Each main stage links to the example RCM IDs AI-01 through AI-16 and the existing control-library aliases. The Assurance crosswalk identifies the RCM domains, stage references, library IDs and older ITGC-CM workpaper aliases. These are illustrative relationships, not a formal COSO mapping. The downloadable RCM remains a template and does not export simulation results.

## Validation

Run `node --test tests/*.test.js` for model and regression checks. Open `tests/browser-guide.html` through the supported preview browser to exercise all three end-to-end journeys, state preservation, import rejection, legacy-link handoff, control destinations, and 390/320 CSS-pixel iframe reflow. The harness uses the actual page event handlers and markup. Narrow-browser reflow does not verify native iOS Safari, assistive technology or all WCAG requirements.
