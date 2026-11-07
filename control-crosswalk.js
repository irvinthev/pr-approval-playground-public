/* Source-qualified inventory crosswalk. Proposed related-intent mappings; no control acceptance. */
(function(root){
'use strict';
const data={
  "schemaVersion": 1,
  "sourceCommit": "775a3b40ce3e76bd0823b5609314b4400233cb3b",
  "preparedOn": "2026-11-06",
  "limit": "Mappings show related intent, not equivalence or evidence of control effectiveness. Source extraction is verified; mapping judgment is proposed. No canonical inventory or source ID is replaced.",
  "sources": {
    "workbook": {
      "path": "downloads/AI_Approval_Example_RCM.xlsx",
      "blobSha": "abbb12d0d34d7d9eb63059f00de846bc91473271",
      "sheets": {
        "RCM": {
          "controls": 16,
          "range": "A6:P21"
        },
        "Failure Scenarios": {
          "records": 16,
          "range": "A6:I21"
        },
        "Testing and Evidence": {
          "records": 16,
          "range": "A6:K21"
        },
        "Assumptions": {
          "records": 20,
          "range": "A6:B25"
        }
      }
    },
    "web": {
      "path": "rcm-view.html",
      "blobSha": "f71e15fd21283b55e6d1b1aaf1ae0100bfea9987"
    },
    "objectives": {
      "path": "control-matrix.html",
      "blobSha": "f8b0386b5c00adbf440c5732bdf46328dd673c0c"
    }
  },
  "objectives": [
    {
      "id": "OBJ:G01",
      "title": "Approval policy & scope",
      "objective": "Changes follow documented, risk-tiered authorization rules defining eligible repositories, excluded change classes, escalation and override.",
      "evidence": "Versioned policy; exceptions; approved eligibility inventory.",
      "legacyId": "G01"
    },
    {
      "id": "OBJ:G02",
      "title": "Independent administration",
      "objective": "Contributors and approval agents cannot unilaterally change protected approval policies, model/prompt versions, thresholds or enforcement settings.",
      "evidence": "Admin-role mapping; privilege grants; ruleset change logs; break-glass records.",
      "legacyId": "G02"
    },
    {
      "id": "OBJ:D01",
      "title": "Protected source changes",
      "objective": "Required checks and appropriately authorized approval are enforced for the exact change revision; stale approvals are invalidated.",
      "evidence": "Branch/ruleset configuration; PR and SHA trace; negative tests.",
      "legacyId": "D01"
    },
    {
      "id": "OBJ:D02",
      "title": "Risk-aware change classification",
      "objective": "Policy uses a maintained, validated inventory of critical files, service consumers and direct/indirect dependencies to enforce exclusions; uncertain or unmapped impact escalates before automated authorization.",
      "evidence": "Inventory ownership and sources; critical-file/path rules; dependency map and validation history; drift exceptions.",
      "legacyId": "D02"
    },
    {
      "id": "OBJ:D03",
      "title": "Testing and validation",
      "objective": "Relevant automated tests, security checks and risk-based functional validation complete before merge or deployment.",
      "evidence": "CI run attached to exact revision; failed-check enforcement; test coverage.",
      "legacyId": "D03"
    },
    {
      "id": "OBJ:A01",
      "title": "Reviewer effectiveness",
      "objective": "Before enabling automated authorization, representative adjudicated cases establish performance on unsafe changes, especially severity-weighted false approvals.",
      "evidence": "Labeled evaluation set; confusion matrix by class/severity; disagreement cases; release criteria.",
      "legacyId": "A01"
    },
    {
      "id": "OBJ:A02",
      "title": "Agent permissions & inputs",
      "objective": "AI reviewer actions and accessible tools are limited; untrusted PR content cannot issue higher-trust commands or change approvals.",
      "evidence": "Bot permission manifests; injection tests; token access restrictions.",
      "legacyId": "A02"
    },
    {
      "id": "OBJ:A03",
      "title": "Model and policy changes",
      "objective": "Reviewer model, prompt, tools, thresholds and detector rule changes are versioned, evaluated and authorized before use.",
      "evidence": "Config version; test results; change records; rollback history.",
      "legacyId": "A03"
    },
    {
      "id": "OBJ:A04",
      "title": "Fail-safe behavior & monitoring",
      "objective": "Timeouts, disagreement, unmapped impact, detector failure or anomalous approval patterns trigger an appropriate fallback and shutdown route.",
      "evidence": "Failure tests; alert thresholds; kill-switch operation; incident record.",
      "legacyId": "A04"
    },
    {
      "id": "OBJ:P01",
      "title": "Build provenance and artifact integrity",
      "objective": "Build and release records link the authorized source revision to the produced artifact and what reached production.",
      "evidence": "Artifact digest; provenance; approved SHA; deployment ledger.",
      "legacyId": "P01"
    },
    {
      "id": "OBJ:P02",
      "title": "Production route enforcement",
      "objective": "Deploy identities, emergency paths, release branches and direct/manual routes cannot silently circumvent required authorization.",
      "evidence": "Deployment ACLs; protected environments; bypass inventory; negative route tests.",
      "legacyId": "P02"
    },
    {
      "id": "OBJ:P03",
      "title": "Monitoring, rollback and reconciliation",
      "objective": "Deployment and incident records support timely detection, recovery and reconciliation of change and production populations.",
      "evidence": "Monitoring alerts; rollback events; deployment inventory reconciliation.",
      "legacyId": "P03"
    },
    {
      "id": "OBJ:X01",
      "title": "Traceable decision record",
      "objective": "Each decision preserves revision, scope, detector version, reviewer outputs, applicable policy, identity and release outcome.",
      "evidence": "PR-to-artifact sample; immutable or protected event record; population completeness.",
      "legacyId": "X01"
    },
    {
      "id": "OBJ:X02",
      "title": "Periodic control challenge",
      "objective": "Control owners review exceptions, overrides, privileged changes, detector misses and model performance; remediate or narrow rollout.",
      "evidence": "Metrics, exceptions, independent reviews and corrective actions.",
      "legacyId": "X02"
    }
  ],
  "webSafeguards": [
    {
      "id": "WEB15:AI-01",
      "domain": "Governance & Scope",
      "title": "Automated Approval Eligibility",
      "risk": "Protected or unknown-impact changes enter automation.",
      "activity": "A deterministic gate evaluates repository scope, protected paths, dependency maps and unknown impact; protected or unresolved changes route to human review.",
      "evidence": "Eligibility rules, mapping provenance, screened PR event, policy/SHA decision.",
      "test": "Reperform eligible, protected, shared-library and unmapped dependency cases.",
      "framework": "NIST SSDF PO.4 (supporting principle)",
      "scenario": "scope",
      "legacyId": "AI-01"
    },
    {
      "id": "WEB15:AI-02",
      "domain": "Governance & Scope",
      "title": "Policy Ownership & Approval",
      "risk": "Automation expands beyond approved risk tolerance.",
      "activity": "Accountable owners approve eligibility, protected scope, exception criteria and material scope expansion before activation.",
      "evidence": "Approved policy, owner assignments, policy change records and effective versions.",
      "test": "Trace authorization and independent ownership for new or widened eligibility.",
      "framework": "NIST AI RMF GOVERN (supporting principle)",
      "scenario": "scope",
      "legacyId": "AI-02"
    },
    {
      "id": "WEB15:AI-03",
      "domain": "Access & Independence",
      "title": "Approval Authority & SoD",
      "risk": "Contributors alter approval enforcement or authorize their own work.",
      "activity": "Restrict effective ruleset, policy, bypass and approval administration independently of contributors; periodically evaluate privileged grants.",
      "evidence": "Effective role assignments, bypass actors, administrative history and reviews.",
      "test": "Test or inspect evidence that a contributor cannot change required authorization.",
      "framework": "NIST SSDF PS.1; PCAOB AS 2201 (assurance consideration)",
      "scenario": "pass",
      "legacyId": "AI-03"
    },
    {
      "id": "WEB15:AI-04",
      "domain": "Access & Independence",
      "title": "Agent Identity & Permissions",
      "risk": "An agent or credential can merge, approve or deploy beyond its role.",
      "activity": "Separate review, policy authorization and deployment service identities; enforce least privilege and log changes.",
      "evidence": "GitHub App installations, effective permissions, token ownership and denied-action logs.",
      "test": "Try prohibited bot operations in nonproduction and inspect role escalation routes.",
      "framework": "OWASP LLM06:2025 (threat lens); NIST SSDF PS.1",
      "scenario": "pass",
      "legacyId": "AI-04"
    },
    {
      "id": "WEB15:AI-05",
      "domain": "AI Review & Reliability",
      "title": "AI Reviewer Validation",
      "risk": "Unsafe changes receive false low-risk assessments.",
      "activity": "Evaluate both reviewers against adjudicated safe, harmful, indirect-dependency and adversarial cases; assess shared misses and changes over model versions.",
      "evidence": "Versioned corpus, expected classifications, adjudication, acceptance criteria and results.",
      "test": "Reperform selected high-impact cases and evaluate false-low classifications.",
      "framework": "NIST AI RMF MEASURE (supporting principle)",
      "scenario": "split",
      "legacyId": "AI-05"
    },
    {
      "id": "WEB15:AI-06",
      "domain": "AI Review & Reliability",
      "title": "AI Review Integrity",
      "risk": "Conflicting, malformed or stale assessments support approval.",
      "activity": "Verify reviewer identities, output schemas, model/prompt versions and exact SHA; escalate disagreements, missing outputs and uncertainty.",
      "evidence": "Reviewer outputs, versions, SHA binding, disagreement and escalation events.",
      "test": "Test conflicting verdicts, invalid response, timeout and post-review commit.",
      "framework": "NIST AI RMF MANAGE; OWASP LLM01:2025 (threat lens)",
      "scenario": "split",
      "legacyId": "AI-06"
    },
    {
      "id": "WEB15:AI-07",
      "domain": "Change Authorization",
      "title": "Independent Automated Authorization",
      "risk": "AI classification is treated as approval authority.",
      "activity": "A separately governed policy decision verifies eligibility, current SHA, required checks, qualifying reviews and authorized identity before auto-approval.",
      "evidence": "Policy/version manifests, approval decision, actor identity, check status and commit identity.",
      "test": "Reperform passes and failures; challenge stale revisions, missing checks and privileged bypass.",
      "framework": "NIST SSDF PO.4; PCAOB AS 2201 (assurance consideration)",
      "scenario": "pass",
      "legacyId": "AI-07"
    },
    {
      "id": "WEB15:AI-08",
      "domain": "Change Authorization",
      "title": "Required Testing & Merge Enforcement",
      "risk": "An untested or unauthorized change merges.",
      "activity": "Effective GitHub rulesets and CI prevent merge unless applicable validations and approval are satisfied for the current revision.",
      "evidence": "Rulesets, protected branches, checks, merge and bypass activity.",
      "test": "Test failed/missing CI, altered workflow name, post-approval commits and emergency route.",
      "framework": "NIST SSDF PW.8 / PS.1 (supporting principles)",
      "scenario": "pass",
      "legacyId": "AI-08"
    },
    {
      "id": "WEB15:AI-09",
      "domain": "Change Authorization",
      "title": "Human Approval & Exceptions",
      "risk": "Protected or uncertain changes bypass qualified human review.",
      "activity": "Escalations require identifiable qualified human authorization for the current revision, without waiving mandatory technical checks.",
      "evidence": "Human approval rationale, permissions, escalation records, SHA and release-check results.",
      "test": "Test protected change, AI split decision and failed mandatory checks under human route.",
      "framework": "PCAOB AS 2201 (assurance consideration); NIST AI RMF GOVERN",
      "scenario": "split",
      "legacyId": "AI-09"
    },
    {
      "id": "WEB15:AI-10",
      "domain": "Deployment Integrity",
      "title": "Build Provenance & Artifact Integrity",
      "risk": "Production artifact differs from authorized source.",
      "activity": "Verify source revision, trusted build provenance and artifact digest before release.",
      "evidence": "Authorized source, build run, signed or protected provenance, artifact digest.",
      "test": "Trace source through build and attempt unauthorized artifact substitution.",
      "framework": "SLSA v1.2 provenance; NIST SSDF PS.2",
      "scenario": "canary",
      "legacyId": "AI-10"
    },
    {
      "id": "WEB15:AI-11",
      "domain": "Deployment Integrity",
      "title": "Production Release Authorization",
      "risk": "Unapproved or invalid artifacts reach production.",
      "activity": "Release mechanism enforces required preproduction checks, artifact identity and authorized deploy permissions across normal and exception routes.",
      "evidence": "Release policy, deployment actors, manifest, gate outcomes and runtime version.",
      "test": "Test failed gate, mismatched artifact and direct/emergency deployment routes.",
      "framework": "SLSA v1.2 (supporting principle); NIST SSDF PS.2",
      "scenario": "canary",
      "legacyId": "AI-11"
    },
    {
      "id": "WEB15:AI-12",
      "domain": "Monitoring & Response",
      "title": "Automated Approval Monitoring",
      "risk": "Bypass, reviewer drift or missing events escape detection.",
      "activity": "Owners review approval exceptions, split verdicts, false-low trends, policy changes, missing evidence and suspension triggers.",
      "evidence": "Monitoring rules, independent population, alert/exception records and actions.",
      "test": "Reconcile independent deployment events to monitored feed; inject test exceptions.",
      "framework": "NIST AI RMF MANAGE; PCAOB AS 1105 (evidence consideration)",
      "scenario": "scope",
      "legacyId": "AI-12"
    },
    {
      "id": "WEB15:AI-13",
      "domain": "Monitoring & Response",
      "title": "Production Monitoring & Recovery",
      "risk": "A defective release continues progressing without containment.",
      "activity": "Canary/progressive deployment detects defined failures, halts promotion and records rollback or recovery.",
      "evidence": "Health thresholds, rollout telemetry, incident and recovery records.",
      "test": "Reproduce threshold failure and verify containment, intervention and evidence.",
      "framework": "NIST SSDF RV; NIST AI RMF MANAGE",
      "scenario": "canary",
      "legacyId": "AI-13"
    },
    {
      "id": "WEB15:AI-14",
      "domain": "Configuration Governance",
      "title": "AI Model & Prompt Change Management",
      "risk": "Behavior changes without risk revalidation.",
      "activity": "Material model, prompt, tool and reviewer configuration changes require approval, targeted evaluation and traceable versioning.",
      "evidence": "Version changes, approval, validation and deployment history.",
      "test": "Trace vendor and internal model/prompt changes and verify performance evaluation.",
      "framework": "NIST AI RMF GOVERN / MEASURE",
      "scenario": "split",
      "legacyId": "AI-14"
    },
    {
      "id": "WEB15:AI-15",
      "domain": "Configuration Governance",
      "title": "Approval Policy & Enforcement Changes",
      "risk": "Someone weakens rules, scope or thresholds without authorization.",
      "activity": "Protected authorization, CI rules, exclusions, dependency mappings and deployment enforcement change through controlled approval and testing.",
      "evidence": "Ruleset history, policy diffs, effective access, approvals and negative tests.",
      "test": "Sample high-impact policy modifications and attempt unapproved bypass.",
      "framework": "NIST SSDF PO.4 / PS.1; PCAOB AS 2201 (assurance consideration)",
      "scenario": "scope",
      "legacyId": "AI-15"
    }
  ],
  "workbookControls": [
    {
      "id": "WB16:AI-01",
      "legacyId": "AI-01",
      "row": 6,
      "title": "Eligibility",
      "riskId": "R-01",
      "risk": "An excluded or financially relevant change receives automated approval.",
      "objective": "Limit automation to explicitly authorized change classes.",
      "activity": "The policy gate checks approved scope, sensitive paths and prohibited change types before issuing automated approval. Excluded changes require the designated human approval path.",
      "evidence": "Scope rules, policy version, changed-file manifest and routing record.",
      "failureId": "F-01",
      "testId": "T-01",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:G01",
        "OBJ:D02"
      ],
      "webIds": [
        "WEB15:AI-01",
        "WEB15:AI-02"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Related scope and approved classes. Web eligibility also absorbs dependency screening. Explicit policy ownership is clearer in WEB15:AI-02.",
      "failureRow": 6,
      "testRow": 6
    },
    {
      "id": "WB16:AI-02",
      "legacyId": "AI-02",
      "row": 7,
      "title": "Dependencies",
      "riskId": "R-02",
      "risk": "A shared-library or configuration change affects billing through an unrecognized dependency.",
      "objective": "Identify direct and downstream business impacts.",
      "activity": "The gate uses a versioned service/dependency mapping and defined financial-impact criteria. Unknown, stale or incomplete required mappings block automated approval pending assessment.",
      "evidence": "Mapping version, service owners, downstream impact assessment and routing record.",
      "failureId": "F-02",
      "testId": "T-02",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:D02"
      ],
      "webIds": [
        "WEB15:AI-01",
        "WEB15:AI-15"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Dependency completeness and versioning are explicit workbook activities. The web combines screening into eligibility and governs mapping changes separately.",
      "failureRow": 7,
      "testRow": 7
    },
    {
      "id": "WB16:AI-03",
      "legacyId": "AI-03",
      "row": 8,
      "title": "AI evaluation",
      "riskId": "R-03",
      "risk": "A model incorrectly classifies an unsafe change as eligible.",
      "objective": "Validate review quality for the permitted change classes.",
      "activity": "Before enabling a class and after material reviewer changes, an independent validator evaluates adjudicated safe, unsafe and adversarial cases against management-approved acceptance criteria. Failed criteria suspend that class.",
      "evidence": "Versioned dataset, adjudication rationale, severity-specific results, acceptance criteria and enablement approval.",
      "failureId": "F-03",
      "testId": "T-03",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:A01",
        "OBJ:X02"
      ],
      "webIds": [
        "WEB15:AI-05",
        "WEB15:AI-14"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Workbook validation, severity-specific criteria and suspension relate to reviewer validation and reassessment triggers. Approval-rate agreement is not validation.",
      "failureRow": 8,
      "testRow": 8
    },
    {
      "id": "WB16:AI-04",
      "legacyId": "AI-04",
      "row": 9,
      "title": "Failure handling",
      "riskId": "R-04",
      "risk": "An unavailable model, malformed response or manipulated PR content leads to approval.",
      "objective": "Block automation when evaluation cannot be trusted.",
      "activity": "The gate treats timeouts, unavailable services, missing or invalid fields and detected input manipulation as explicit evaluation failures. It issues no automated approval and routes to authorized human assessment. Untrusted content cannot alter policy or approval credentials.",
      "evidence": "Response schema, failure reason, untrusted-input handling and routing logs.",
      "failureId": "F-04",
      "testId": "T-04",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:A02",
        "OBJ:A04"
      ],
      "webIds": [
        "WEB15:AI-04",
        "WEB15:AI-06"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Workbook failure handling explicitly covers hostile input and credential isolation. Web identity and review-integrity safeguards contain related pieces, not equivalent input-boundary wording.",
      "failureRow": 9,
      "testRow": 9
    },
    {
      "id": "WB16:AI-05",
      "legacyId": "AI-05",
      "row": 10,
      "title": "Decision binding",
      "riskId": "R-05",
      "risk": "An approval is reused for changed code or changed policy context.",
      "objective": "Authorize only the evaluated revision and context.",
      "activity": "Approval records bind to the current source revision, relevant base/merge context, policy version and dependency-mapping version. Required identities must be present. Changes invalidate approval and require reevaluation under policy.",
      "evidence": "Revision and base identity, policy/mapping versions, approval identity and invalidation events.",
      "failureId": "F-05",
      "testId": "T-05",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:D01",
        "OBJ:X01"
      ],
      "webIds": [
        "WEB15:AI-06",
        "WEB15:AI-07",
        "WEB15:AI-08",
        "WEB15:AI-15"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Workbook binds revision, base/merge context and policy/mapping versions. Web review integrity, authorization, merge and policy changes distribute these requirements. Base/merge context is not modeled in the connected fixture.",
      "failureRow": 10,
      "testRow": 10
    },
    {
      "id": "WB16:AI-06",
      "legacyId": "AI-06",
      "row": 11,
      "title": "Human authorization",
      "riskId": "R-06",
      "risk": "Escalation is treated as approval or the author approves their own change.",
      "objective": "Require valid human authorization for escalated changes.",
      "activity": "Escalated changes require approval by an authorized reviewer independent of the contributor under the approved role model. The approval binds to current inputs. Human approval does not waive mandatory tests or release conditions.",
      "evidence": "Reviewer role, independence basis, review rationale, revision binding and approval record.",
      "failureId": "F-06",
      "testId": "T-06",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:G01",
        "OBJ:D01"
      ],
      "webIds": [
        "WEB15:AI-09"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Both require identifiable current human authorization without waiving mandatory checks. Human decision independence does not by itself establish administrative independence.",
      "failureRow": 11,
      "testRow": 11
    },
    {
      "id": "WB16:AI-07",
      "legacyId": "AI-07",
      "row": 12,
      "title": "Administrative independence",
      "riskId": "R-07",
      "risk": "A contributor changes policy or bot permissions to approve their own work.",
      "objective": "Protect approval authority from unilateral contributor control.",
      "activity": "Policy, reviewer configuration, approval credentials and enforcement settings are administered through approved roles and independently authorized changes. Privileged and indirect access is reviewed and incompatible access is resolved.",
      "evidence": "Effective access, group inheritance, app permissions, credential inventory and approved administrative changes.",
      "failureId": "F-07",
      "testId": "T-07",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:G02",
        "OBJ:A02"
      ],
      "webIds": [
        "WEB15:AI-03",
        "WEB15:AI-04",
        "WEB15:AI-15"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Workbook protects policy, configuration, credentials and effective access. Web separates administration, agent permissions and protected policy change.",
      "failureRow": 12,
      "testRow": 12
    },
    {
      "id": "WB16:AI-08",
      "legacyId": "AI-08",
      "row": 13,
      "title": "Merge enforcement",
      "riskId": "R-08",
      "risk": "A missing, spoofed or bypassed status permits unauthorized merge.",
      "objective": "Enforce current approval and mandatory checks at merge.",
      "activity": "Protected branches require the authorized approval/check issuer and required checks for the current revision. Bypass identities are restricted, inventoried and monitored through the exception process.",
      "evidence": "Effective rulesets, expected check issuer, current check results, bypass settings and merge audit events.",
      "failureId": "F-08",
      "testId": "T-08",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:D01",
        "OBJ:D03"
      ],
      "webIds": [
        "WEB15:AI-08",
        "WEB15:AI-03"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Workbook focuses on required-check and issuer enforcement, including bypass identities. Web also addresses relevant testing; neither this match nor green checks proves test adequacy.",
      "failureRow": 13,
      "testRow": 13
    },
    {
      "id": "WB16:AI-09",
      "legacyId": "AI-09",
      "row": 14,
      "title": "Build and release",
      "riskId": "R-09",
      "risk": "Production receives an artifact different from the authorized source.",
      "objective": "Preserve source-to-artifact-to-release integrity.",
      "activity": "Build and release gates verify authorized source identity, trusted build provenance and artifact digest. Promotion uses the verified artifact. Missing or mismatched evidence blocks release.",
      "evidence": "Approved source identity, build provenance, artifact digest and deployment manifest.",
      "failureId": "F-09",
      "testId": "T-09",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:P01",
        "OBJ:X01"
      ],
      "webIds": [
        "WEB15:AI-10",
        "WEB15:AI-11"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Workbook combines trusted build and release artifact integrity. Web separates provenance from production release authorization.",
      "failureRow": 14,
      "testRow": 14
    },
    {
      "id": "WB16:AI-10",
      "legacyId": "AI-10",
      "row": 15,
      "title": "Deployment routes",
      "riskId": "R-10",
      "risk": "A manual, emergency or alternate route bypasses the controlled pipeline.",
      "objective": "Cover all production change paths.",
      "activity": "Management inventories deployment routes and restricts production write access. Routine routes enforce authorization. Emergency routes require defined authority, attributable actions and timely independent review under approved policy.",
      "evidence": "Route inventory, production permissions, emergency records and independent deployment telemetry.",
      "failureId": "F-10",
      "testId": "T-10",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:P02"
      ],
      "webIds": [
        "WEB15:AI-11",
        "WEB15:AI-03"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Production routes and emergency authority relate to release enforcement and privileged access. Complete real route coverage is not established by these descriptions.",
      "failureRow": 15,
      "testRow": 15
    },
    {
      "id": "WB16:AI-11",
      "legacyId": "AI-11",
      "row": 16,
      "title": "Approver changes",
      "riskId": "R-11",
      "risk": "A prompt, model, threshold or workflow change weakens review without validation.",
      "objective": "Govern changes to the approval mechanism.",
      "activity": "Reviewer models, prompts, rules, thresholds and enforcement configurations are versioned and changed through independent approval, relevant validation and controlled rollout. Vendor changes and version availability trigger reassessment or suspension as defined.",
      "evidence": "Configuration/version inventory, change approval, validation results, rollout and rollback records.",
      "failureId": "F-11",
      "testId": "T-11",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:A03",
        "OBJ:G02",
        "OBJ:X02"
      ],
      "webIds": [
        "WEB15:AI-14",
        "WEB15:AI-15"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Workbook combines reviewer changes and enforcement changes. Web deliberately keeps model/prompt governance separate from protected policy/enforcement governance.",
      "failureRow": 16,
      "testRow": 16
    },
    {
      "id": "WB16:AI-12",
      "legacyId": "AI-12",
      "row": 17,
      "title": "Evidence integrity",
      "riskId": "R-12",
      "risk": "Decision evidence is missing, altered or insufficient to reconstruct authorization.",
      "objective": "Retain attributable and protected evidence.",
      "activity": "The service records source/context identities, checks, classification, policy outcome, approval actor, timestamps and release linkage. Evidence access and retention are controlled. Required logging failure prevents automated authorization.",
      "evidence": "Decision records, retention settings, access controls, integrity checks and delivery acknowledgments.",
      "failureId": "F-12",
      "testId": "T-12",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:X01",
        "OBJ:A04"
      ],
      "webIds": [
        "WEB15:AI-06",
        "WEB15:AI-07",
        "WEB15:AI-10",
        "WEB15:AI-12"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Dedicated workbook evidence lifecycle: retention, access, integrity and required-logging failure. Web evidence is distributed; no single listed safeguard is an equivalent dedicated lifecycle control.",
      "failureRow": 17,
      "testRow": 17
    },
    {
      "id": "WB16:AI-13",
      "legacyId": "AI-13",
      "row": 18,
      "title": "Population and IPE",
      "riskId": "R-13",
      "risk": "Audit extracts omit changes or misstate control outcomes.",
      "objective": "Validate completeness and accuracy of assessment data.",
      "activity": "For each reporting period, the evidence owner reconciles approval/merge records with independent build and production sources. Extraction parameters, pagination, duplicates, failed runs and unmatched items are reviewed and resolved.",
      "evidence": "Extraction queries, source counts, reconciliation, unmatched-item disposition and review evidence.",
      "failureId": "F-13",
      "testId": "T-13",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:X01",
        "OBJ:P03",
        "OBJ:X02"
      ],
      "webIds": [
        "WEB15:AI-12"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Dedicated workbook population/IPE reconciliation includes extraction parameters, pagination, duplicates, failed runs and unmatched records. Web monitoring is related but less explicit.",
      "failureRow": 18,
      "testRow": 18
    },
    {
      "id": "WB16:AI-14",
      "legacyId": "AI-14",
      "row": 19,
      "title": "Monitoring and response",
      "riskId": "R-14",
      "risk": "False approvals or financial errors persist without investigation.",
      "objective": "Detect adverse outcomes and act on them.",
      "activity": "Owners monitor classification errors, bypasses, incidents and relevant business reconciliations against defined triggers. They investigate exceptions, assess attribution limits and suspend affected automation when criteria are met.",
      "evidence": "Alert definitions, review records, false-approval cases, business reconciliation and remediation records.",
      "failureId": "F-14",
      "testId": "T-14",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:A04",
        "OBJ:P03",
        "OBJ:X02"
      ],
      "webIds": [
        "WEB15:AI-12",
        "WEB15:AI-13"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Workbook explicitly includes financial/business reconciliations and attribution limits. Web separates approval monitoring from production monitoring/recovery.",
      "failureRow": 19,
      "testRow": 19
    },
    {
      "id": "WB16:AI-15",
      "legacyId": "AI-15",
      "row": 20,
      "title": "Shutdown and recovery",
      "riskId": "R-15",
      "risk": "Automation continues after a severe failure or cannot be disabled.",
      "objective": "Stop automated authority and recover safely.",
      "activity": "Authorized responders can disable new automated approvals and related auto-merge paths. Runbooks address queued approvals, in-flight releases, credential containment, data correction and controlled restart after independent authorization.",
      "evidence": "Kill-switch configuration, exercise results, incident timeline and restart approval.",
      "failureId": "F-15",
      "testId": "T-15",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:A04",
        "OBJ:P02",
        "OBJ:P03"
      ],
      "webIds": [
        "WEB15:AI-12",
        "WEB15:AI-13"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Workbook explicitly covers kill switch, queued approvals, in-flight releases, containment and independent restart. Web suspension/recovery is related but does not state the whole lifecycle.",
      "failureRow": 20,
      "testRow": 20
    },
    {
      "id": "WB16:AI-16",
      "legacyId": "AI-16",
      "row": 21,
      "title": "Exceptions and risk acceptance",
      "riskId": "R-16",
      "risk": "An exception or risk acceptance silently waives mandatory requirements.",
      "objective": "Keep policy, evidence, authorization, release eligibility and risk acceptance distinct.",
      "activity": "A designated authority records exception scope, rationale, expiry, compensating measures and residual risk. Mandatory non-waivable requirements remain enforced. Expired exceptions are rejected and risk acceptance alone does not authorize release.",
      "evidence": "Exception register, delegated authority, expiry, compensating evidence and linked release decision.",
      "failureId": "F-16",
      "testId": "T-16",
      "implementationStatus": "Not assessed",
      "objectives": [
        "OBJ:G01",
        "OBJ:D01",
        "OBJ:X01"
      ],
      "webIds": [
        "WEB15:AI-02",
        "WEB15:AI-09",
        "WEB15:AI-15"
      ],
      "disposition": "Retain source identity; related-intent mapping proposed",
      "note": "Workbook explicitly separates five conclusions and records exception expiry, delegated authority and compensating measures. Web policy and human exceptions are related; detailed non-waiver/expiry coverage is not a standalone web safeguard.",
      "failureRow": 21,
      "testRow": 21
    }
  ]
};
if(typeof module!=='undefined'&&module.exports)module.exports=data;else root.ControlCrosswalk=data;
})(typeof globalThis!=='undefined'?globalThis:this);
