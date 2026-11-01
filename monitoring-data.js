(function(root){
 const data={
  "references": {
    "EVID": {
      "label": "PCAOB AS 1105 · .10",
      "url": "https://pcaobus.org/oversight/standards/auditing-standards/details/AS1105"
    },
    "SSDF": {
      "label": "NIST SSDF v1.1 · SP 800-218",
      "url": "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf"
    },
    "RMF": {
      "label": "NIST AI RMF 1.0 · Core",
      "url": "https://airc.nist.gov/airmf-resources/airmf/5-sec-core/"
    },
    "AGENCY": {
      "label": "OWASP LLM06:2025 · Excessive Agency",
      "url": "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/"
    },
    "SLSA": {
      "label": "SLSA v1.2 · Provenance",
      "url": "https://slsa.dev/spec/v1.2/provenance"
    }
  },
  "stages": [
    {
      "title": "Pull request",
      "subtitle": "Know whether every revision entered the workflow",
      "scenario": "A contributor pushes revision B, but collection still shows revision A. The dashboard continues to display the earlier passing checks.",
      "risk": "A change escapes screening or appears covered by stale approval evidence.",
      "concern": "Can monitoring distinguish event delay, missing collection and a decision actually applied to the wrong revision?",
      "guidance": [
        {
          "ref": "EVID",
          "text": "AS 1105 .10 addresses the accuracy, completeness and detail of company-produced audit information."
        },
        {
          "ref": "SSDF",
          "text": "PS.1 protects source; PO.4 supports defined checks and their evidence."
        }
      ],
      "principle": "Reconcile source revisions to workflow records, rather than trusting webhook delivery alone.",
      "signals": [
        {
          "title": "Missing or stale revision",
          "signal": "A source-system revision has no matching intake or refreshed checks after the defined processing window.",
          "evidence": "PR/head history, intake timestamps, check revision and collection-health logs.",
          "owner": "Workflow operations",
          "response": "Reconcile the source event, recover missing intake and retain any gap; withhold progression while required checks are unresolved.",
          "exercise": "Delay or omit a test event, then push another commit. Verify reconciliation catches the missing revision without treating ordinary event lag as a confirmed violation.",
          "expected": "The collection issue is assigned, the exact revision is reprocessed and stale decisions remain unusable.",
          "refs": [
            "EVID",
            "SSDF"
          ]
        }
      ],
      "controls": [
        "D01",
        "X01"
      ]
    },
    {
      "title": "Eligibility gate",
      "subtitle": "Watch the boundaries of the low-risk path",
      "scenario": "An unknown dependency is marked eligible, or an inventory change suddenly expands which PRs can reach the two AI reviewers.",
      "risk": "Protected or unresolved financial impact enters automation because scope rules or their inputs changed.",
      "concern": "Are eligibility outcomes monitored with inventory and rule versions? A rising auto-approval rate does not explain whether the eligible population changed.",
      "guidance": [
        {
          "ref": "RMF",
          "text": "GOVERN 1.5 addresses ongoing review, frequency and responsibilities."
        },
        {
          "ref": "SSDF",
          "text": "PO.4 defines checking criteria and supporting evidence; financial-dependency screening is our application."
        }
      ],
      "principle": "Monitor rule inputs and routing decisions before the AI step.",
      "signals": [
        {
          "title": "Unknown impact reached AI",
          "signal": "A protected or unresolved dependency is routed to AI, or automation proceeds despite failed required CI.",
          "evidence": "Changed paths, dependency-map version, eligibility reason, CI state and invocation logs.",
          "owner": "Eligibility control owner",
          "response": "Stop the automatic route for the affected scope; resolve impact through human assessment. Mandatory failed checks remain blocking.",
          "exercise": "Submit protected, unknown-impact and failed-CI test cases and reconcile gate outcomes to actual downstream invocations.",
          "expected": "Expected human routing is recorded; an erroneous AI/auto-approval path triggers investigation.",
          "refs": [
            "SSDF",
            "RMF"
          ]
        },
        {
          "title": "Scope or inventory changed",
          "signal": "An eligibility rule or dependency inventory changes without the required authorization, validation or refresh evidence.",
          "evidence": "Version history, independent owner approval, mapping validation and eligible-population trend.",
          "owner": "Policy and dependency owners",
          "response": "Investigate the change, restrict uncertain scope and validate mappings before restoring eligibility.",
          "exercise": "Change a test mapping or allowlist and verify a governed change is distinguished from an unauthorized expansion.",
          "expected": "Owner review explains the changed scope and confirms the approved version in use.",
          "refs": [
            "SSDF",
            "RMF"
          ]
        }
      ],
      "controls": [
        "G01",
        "G02",
        "D02",
        "D03"
      ]
    },
    {
      "title": "Two AI reviews",
      "subtitle": "Monitor reliability and the escalation route",
      "scenario": "A new model version increases LOW findings. Both reviewers miss the same unsafe pattern, while disagreements accumulate in the human queue.",
      "risk": "Reviewer drift or shared misses produce unsafe approvals; an overloaded fallback becomes a rubber stamp.",
      "concern": "Are unsafe approvals, unnecessary escalations and review delays tracked separately? Outcome and severity matter more than agreement or approval rate alone.",
      "guidance": [
        {
          "ref": "RMF",
          "text": "MEASURE 2.4 monitors production behavior; MEASURE 2.5 addresses reliability."
        },
        {
          "ref": "AGENCY",
          "text": "Limit agent permissions and enforce authorization outside the model."
        }
      ],
      "principle": "Connect versioned findings to adjudicated outcomes and accountable human follow-up.",
      "signals": [
        {
          "title": "False LOW or behavior shift",
          "signal": "Adjudicated review finds an unsafe LOW, shared misses increase, or results shift after a model/prompt update.",
          "evidence": "A/B findings, model/prompt versions, labeled-case outcomes, severity and defined evaluation population.",
          "owner": "AI evaluation owner",
          "response": "Investigate by change class, re-evaluate the pair and restrict or suspend the affected automation when policy thresholds are met.",
          "exercise": "Run known unsafe cases across versions and verify shared misses are surfaced. Include a benign distribution shift to challenge false alarms.",
          "expected": "The owner distinguishes a changed input mix from degraded performance and records the scope/restart decision.",
          "refs": [
            "RMF"
          ]
        },
        {
          "title": "Fallback failed or stalled",
          "signal": "Missing, invalid or conflicting findings lead to auto-approval, or escalations exceed the defined review window.",
          "evidence": "Verdict validity, routing records, queue age, reviewer identity and reasoned disposition.",
          "owner": "Review operations owner",
          "response": "Withhold auto-approval; assign a qualified reviewer with the change context. Investigate unsupported approvals and review bottlenecks.",
          "exercise": "Create disagreement, timeout and invalid-output cases; inspect both queue ownership and the reviewer’s actual decision evidence.",
          "expected": "Nonqualifying results cannot auto-approve; human review resolves or rejects the risk and approved changes join Merge + build.",
          "refs": [
            "RMF",
            "AGENCY"
          ]
        }
      ],
      "controls": [
        "A01",
        "A02",
        "A03",
        "A04"
      ]
    },
    {
      "title": "Auto-approval",
      "subtitle": "Monitor the policy decision and its authority",
      "scenario": "An approval is recorded on a stale revision or after a policy administrator weakens the prerequisites. Two LOW findings remain visible.",
      "risk": "The record looks approved even though policy conditions or administrative independence were not preserved.",
      "concern": "Can we reconstruct why the gate authorized the revision, which identity acted and who was accountable for the applicable policy?",
      "guidance": [
        {
          "ref": "AGENCY",
          "text": "Authorization belongs in downstream systems; agent permissions should be constrained."
        },
        {
          "ref": "RMF",
          "text": "GOVERN 2.1 and 3.2 address accountability and human–AI oversight roles."
        }
      ],
      "principle": "Monitor effective policy and permissions alongside each automated decision.",
      "signals": [
        {
          "title": "Approval without prerequisites",
          "signal": "Approval appears without eligible scope, two valid LOW results, passing required checks or the matching revision.",
          "evidence": "Decision inputs, effective policy version, current SHA, executing identity and status checks.",
          "owner": "Authorization control owner",
          "response": "Prevent merge/release through existing gates, investigate the decision and suspend the affected approval route if needed.",
          "exercise": "Inject a test decision with a missing prerequisite and verify both exception detection and enforced blocking.",
          "expected": "The exception retains its original evidence; detection alone is not treated as prevention.",
          "refs": [
            "AGENCY",
            "RMF"
          ]
        },
        {
          "title": "Authority changed",
          "signal": "Approval policy, bot grants or bypass rights change without the prescribed independent authorization.",
          "evidence": "Effective grants, admin audit events, protected configuration and change approval.",
          "owner": "Independent policy administrator",
          "response": "Contain unauthorized access or changes, assess affected approvals and revalidate before reinstating the route.",
          "exercise": "Exercise an authorized test of a contributor or bot custodian attempting to weaken its own rules.",
          "expected": "Denied attempts and effective changes are distinguishable; authorized policy administration remains traceable.",
          "refs": [
            "AGENCY",
            "RMF"
          ]
        }
      ],
      "controls": [
        "G01",
        "G02",
        "D01",
        "X01"
      ]
    },
    {
      "title": "Merge + build",
      "subtitle": "Observe both approval paths and artifact lineage",
      "scenario": "A privileged merge skips a mandatory check, or a trusted build produces an artifact that cannot be tied to the authorized source.",
      "risk": "Untested or differently sourced code progresses after either human or automated approval.",
      "concern": "Do monitors observe actual merges and builds, including privileged routes, rather than only the PR approval record?",
      "guidance": [
        {
          "ref": "SLSA",
          "text": "Build provenance links an artifact to its source and production process."
        },
        {
          "ref": "SSDF",
          "text": "PS.1 protects source and PW.8 addresses scoped executable-code tests."
        }
      ],
      "principle": "Correlate approval → merge source → build → artifact across both approval routes.",
      "signals": [
        {
          "title": "Merge bypass or broken lineage",
          "signal": "A merge bypasses required checks or the build/artifact lacks a verified authorized-source relationship.",
          "evidence": "Approval route, merge commit/source mapping, bypass events, build identity and artifact digest.",
          "owner": "Build/platform owner",
          "response": "Hold artifact promotion, investigate bypass or lineage gaps and rebuild from verified source when necessary.",
          "exercise": "Create an authorized negative test on each approval route with a failed check or mismatched artifact record.",
          "expected": "The monitor identifies the affected route and artifact; mandatory checks remain enforced independently of alerts.",
          "refs": [
            "SLSA",
            "SSDF"
          ]
        }
      ],
      "controls": [
        "D03",
        "P01",
        "P02",
        "X01"
      ]
    },
    {
      "title": "Pre-production gate",
      "subtitle": "Track blocked releases and any attempted bypass",
      "scenario": "Artifact verification fails, but a manual action still attempts promotion. A valid PR approval is offered as the reason to proceed.",
      "risk": "A failed release validation is bypassed or never reaches the team responsible for investigation.",
      "concern": "Is a blocked attempt distinguishable from an actual deployment? Are failed checks rerun after correction rather than cleared by a human approval?",
      "guidance": [
        {
          "ref": "SLSA",
          "text": "Provenance supports verification of artifact origins."
        },
        {
          "ref": "SSDF",
          "text": "PS.2 provides release-integrity verification and PO.4 defines checking criteria."
        }
      ],
      "principle": "Retain gate outcomes and correlate attempted and completed promotions.",
      "signals": [
        {
          "title": "Blocked gate or unexpected promotion",
          "signal": "Release validation fails, a digest differs, or a completed promotion has no corresponding passing gate decision.",
          "evidence": "Gate outcome, approval-source linkage, artifact digest, promotion actor and release event.",
          "owner": "Release owner",
          "response": "Keep release blocked and investigate. A completed bypass requires incident handling; source changes need fresh applicable review, approval and build.",
          "exercise": "Fail a mandatory validation on both approval routes, then inspect alerts, block evidence and the corrected rerun.",
          "expected": "The failed attempt stays visible; no human decision waives the mandatory check.",
          "refs": [
            "SLSA",
            "SSDF"
          ]
        }
      ],
      "controls": [
        "P01",
        "P02",
        "X01"
      ]
    },
    {
      "title": "Production rollout",
      "subtitle": "Establish coverage and close the response loop",
      "scenario": "The dashboard accounts for 24/24 collected records, but a separate release source reveals a manual deployment. Another release has an approval/revision mismatch.",
      "risk": "Missing deployments or unresolved authorization exceptions remain hidden behind a green dashboard.",
      "concern": "Is the production population independently corroborated? A mismatch may be a policy deviation, a collection gap or incorrect linkage; an error spike alone does not establish cause.",
      "guidance": [
        {
          "ref": "EVID",
          "text": "AS 1105 .10 addresses completeness and accuracy before audit reliance."
        },
        {
          "ref": "RMF",
          "text": "MANAGE 2.3–2.4 and 4.1 address recovery, deactivation authority and post-deployment monitoring."
        }
      ],
      "principle": "Reconcile independent production evidence and retain the full investigation trail.",
      "signals": [
        {
          "title": "Missing deployment or approval link",
          "signal": "Independent release/runtime records do not reconcile to the monitored feed, or an artifact links to a different approved revision.",
          "evidence": "Independent production population, extraction scope, deploy/artifact identity and complete approval history.",
          "owner": "Production monitoring owner",
          "response": "Investigate unmatched records, distinguish evidence gaps from deviations and remediate collection while preserving original exceptions.",
          "exercise": "Include a manual deployment absent from the standard feed and an approval mismatch; reconcile in both directions.",
          "expected": "The gap is surfaced. 24/25 known deployments is a discovered discrepancy, not proof that the expanded population is complete.",
          "refs": [
            "EVID",
            "SLSA"
          ]
        },
        {
          "title": "Unsafe outcome needs suspension",
          "signal": "A confirmed unsafe approval, serious incident or systemic model failure meets the defined response threshold.",
          "evidence": "Adjudicated outcome, incident evidence, affected releases, policy/model versions and owner decisions.",
          "owner": "Incident commander and automation owner",
          "response": "Suspend affected automation where required, assess rollback, investigate impact and require authorized restart after remediation.",
          "exercise": "Exercise the alert, shutdown and recovery route; verify ownership and restart authority in a controlled drill.",
          "expected": "The response is evidenced end to end. Temporal correlation is investigated before attributing an incident to a particular change.",
          "refs": [
            "RMF"
          ]
        }
      ],
      "controls": [
        "P02",
        "P03",
        "A04",
        "X01",
        "X02"
      ]
    }
  ]
};
 if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.MonitoringData=data;
})(typeof globalThis!=="undefined"?globalThis:this);
