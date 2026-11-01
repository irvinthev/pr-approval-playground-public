/* Framework principles inform these fictional examples; the tests are this guide’s application. */
(function(root){
  const data = {
  "references": {
    "ICFR": {
      "label": "PCAOB AS 2201 · .42–.45",
      "url": "https://pcaobus.org/oversight/standards/auditing-standards/details/AS2201"
    },
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
    "INJECT": {
      "label": "OWASP LLM01:2025 · Prompt Injection",
      "url": "https://genai.owasp.org/llmrisk/llm01-prompt-injection/"
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
      "subtitle": "Start with the actual change",
      "scenario": "A PR is described as a documentation fix, but its diff also changes a shared billing function. A later push changes the revision again.",
      "risk": "Financially relevant logic is omitted from the review, or approval is applied to code the reviewer never assessed.",
      "concern": "Can we establish what was submitted, who submitted it and which exact revision each check and decision covers? Author labels alone do not establish scope.",
      "guidance": [
        {
          "ref": "SSDF",
          "text": "PS.1 protects source against unauthorized changes; PO.4 calls for defined checks and supporting information."
        },
        {
          "ref": "EVID",
          "text": "Company-produced audit information needs accuracy, completeness and sufficient detail."
        }
      ],
      "principle": "Derive review inputs from trusted source events and version them.",
      "tests": [
        {
          "title": "Reconstruct the submission",
          "action": "Compare the PR description and labels with the source-system diff, changed files, author and head SHA. Include a disguised financially relevant edit.",
          "expect": "The complete change enters screening; a low-risk label cannot exclude changed logic.",
          "evidence": "PR event, trusted diff, author identity and captured revision.",
          "refs": [
            "SSDF",
            "EVID"
          ]
        },
        {
          "title": "Push another commit",
          "action": "After a decision on revision A, push revision B and attempt to reuse A’s checks or approval.",
          "expect": "The new revision needs fresh applicable checks and authorization; A cannot authorize B.",
          "evidence": "Revision history, invalidated decision and renewed check records.",
          "refs": [
            "ICFR",
            "SSDF"
          ]
        }
      ],
      "areas": [
        "PR",
        "EVID"
      ],
      "controls": [
        "D01",
        "G01",
        "X01"
      ]
    },
    {
      "title": "Eligibility gate",
      "subtitle": "Deterministic checks before AI",
      "scenario": "A small shared-library change reaches a billing calculation. The dependency inventory is stale or does not identify its downstream consumer.",
      "risk": "An incomplete inventory allows a financially relevant change into the low-risk path even when the eligibility code works as configured.",
      "concern": "Who owns the mappings? How are completeness and freshness validated? Is unknown impact treated as uncertainty, or silently as no impact?",
      "guidance": [
        {
          "ref": "ICFR",
          "text": "Control design and operation are evaluated against the relevant financial-reporting risk."
        },
        {
          "ref": "SSDF",
          "text": "PO.4 defines security-check criteria and supporting information. Applying this to financial dependency screening is this guide’s adaptation."
        }
      ],
      "principle": "Screen scope and required checks before invoking the reviewers; fail safely when impact is unresolved.",
      "tests": [
        {
          "title": "Challenge the dependency boundary",
          "action": "Trace selected critical financial functions back to repositories and libraries, then trace changed libraries forward to consumers. Include an unmapped or stale relationship.",
          "expect": "Protected or uncertain impact cannot qualify for automation; an owner investigates missing mappings.",
          "evidence": "Inventory version, owner validation, independent build/service relationships and routing record.",
          "refs": [
            "ICFR",
            "SSDF"
          ]
        },
        {
          "title": "Reperform the routing",
          "action": "Submit allowed, protected and unknown-impact changes; include failed required CI. Observe the resulting AI invocation or human route.",
          "expect": "Only eligible changes with passing required checks reach AI. Protected or unknown impact goes to a human before AI; mandatory failures remain blocking.",
          "evidence": "Gate configuration, challenge results, invocation logs and human disposition.",
          "refs": [
            "ICFR",
            "SSDF"
          ]
        }
      ],
      "areas": [
        "PR",
        "HUMAN"
      ],
      "controls": [
        "G01",
        "D02",
        "D03"
      ]
    },
    {
      "title": "Two AI reviews",
      "subtitle": "Assess quality, shared misses and manipulation",
      "scenario": "Both agents return LOW for a harmful change, or instructions in a PR comment influence their findings. A model update changes the results.",
      "risk": "Correlated mistakes, prompt injection or drift produce two favorable findings without reliable risk coverage.",
      "concern": "Do two reviewers detect more than either alone? Were unsafe and uncertain cases tested? Agent names do not demonstrate independent judgment or segregation of duties.",
      "guidance": [
        {
          "ref": "RMF",
          "text": "MEASURE 2.5 addresses validity and reliability; MEASURE 2.4 addresses monitoring behavior in production."
        },
        {
          "ref": "INJECT",
          "text": "Untrusted content can influence model behavior; adversarial testing and trust boundaries help assess exposure."
        }
      ],
      "principle": "Evaluate the combined system and constrain tool permissions; treat PR content as untrusted input.",
      "tests": [
        {
          "title": "Compare A, B and the combined result",
          "action": "Run an independently adjudicated set of safe, unsafe and unknown-impact changes. Compare individual and combined misses, including severity, across model/prompt versions.",
          "expect": "Results show whether the pair adds coverage and where both miss. Defined acceptance criteria govern use; two LOW scores are not proof of safety.",
          "evidence": "Versioned cases, expected classifications, adjudication, model/prompt versions and shared-miss analysis.",
          "refs": [
            "RMF"
          ]
        },
        {
          "title": "Challenge hostile and missing inputs",
          "action": "Include instructions in PR text or comments, invalid output, timeouts and disagreement. Check both the review result and attempted tool actions.",
          "expect": "Untrusted text cannot change approval policy or grant tool rights. Missing, conflicting or non-LOW findings withhold auto-approval and route to human assessment.",
          "evidence": "Adversarial results, output validation, permission denials and escalation records.",
          "refs": [
            "INJECT",
            "AGENCY"
          ]
        }
      ],
      "areas": [
        "MODEL",
        "BOT",
        "CM",
        "HUMAN"
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
      "subtitle": "Test authorization separately from assessment",
      "scenario": "Two LOW findings exist, but the revision changed or required CI failed. The contributor can also edit the policy that authorizes their own change.",
      "risk": "Favorable scores or self-modified rules create an approval without the required authority and prerequisites.",
      "concern": "Who owns the automated authorization policy? What identity executes approval, and what is recorded? Can contributors, bot custodians or inherited administrators weaken enforcement?",
      "guidance": [
        {
          "ref": "AGENCY",
          "text": "Enforce authorization in downstream systems and limit agent permissions."
        },
        {
          "ref": "RMF",
          "text": "GOVERN 2.1 and 3.2 address accountability and human–AI oversight roles."
        }
      ],
      "principle": "A governed policy authorizes the exact revision; model findings are inputs to that decision.",
      "tests": [
        {
          "title": "Attempt approval with a missing prerequisite",
          "action": "Supply two LOW findings while varying protected scope, a missing check, failed CI or stale SHA. Inspect actual approval and merge eligibility.",
          "expect": "The gate withholds auto-approval unless every policy prerequisite holds for the current revision.",
          "evidence": "Versioned policy, input and decision records, authorizing identity and linked check statuses.",
          "refs": [
            "AGENCY",
            "ICFR"
          ]
        },
        {
          "title": "Challenge effective authority",
          "action": "Using authorized test identities, attempt to weaken approval rules or expand bot rights as a contributor or bot custodian. Inspect inherited and emergency access.",
          "expect": "Independent authorization governs effective policy and permission changes. Records identify the accountable policy owner and executing identity.",
          "evidence": "Effective grants, bypass lists, denied attempts, policy-change approvals and decision ownership.",
          "refs": [
            "AGENCY",
            "RMF"
          ]
        }
      ],
      "areas": [
        "RBAC",
        "BOT",
        "CM",
        "HUMAN"
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
      "subtitle": "Both approval paths join here",
      "scenario": "A human-approved or automatically approved PR merges through a bypass, or the build produces an artifact from a different revision.",
      "risk": "Required testing is skipped, or the released artifact does not originate from the authorized source.",
      "concern": "Are protections effective on both approval routes? Do green checks cover the relevant financial logic? Can CI or build administrators silently change what runs?",
      "guidance": [
        {
          "ref": "SSDF",
          "text": "PS.1 protects code; PW.8 calls for scoped executable-code testing and documented results."
        },
        {
          "ref": "SLSA",
          "text": "Build provenance connects artifacts to their source and build process."
        }
      ],
      "principle": "Protect the build configuration and bind the trusted artifact to authorized source.",
      "tests": [
        {
          "title": "Attempt a protected merge bypass",
          "action": "Exercise AI-approved and human-approved cases with failed mandatory checks. Inspect workflow-edit rights and authorized administrator/bypass paths.",
          "expect": "Required protections apply on both routes; failed mandatory checks block. Any permitted exception route is separately authorized and evidenced.",
          "evidence": "Effective rules, CI configuration, bypass activity and route-specific merge results.",
          "refs": [
            "ICFR",
            "SSDF"
          ]
        },
        {
          "title": "Trace source and test coverage",
          "action": "Trace approved revision → merge result → build → artifact digest. Inspect selected positive and negative tests for the changed financial calculation or interface.",
          "expect": "The artifact has an authorized source lineage and relevant tests. A merge commit is reconciled to reviewed content; provenance alone does not prove correctness.",
          "evidence": "Approval, merge/source mapping, build provenance, artifact digest and functional test results.",
          "refs": [
            "SLSA",
            "SSDF"
          ]
        }
      ],
      "areas": [
        "DEPLOY",
        "RBAC"
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
      "subtitle": "Approval does not waive release checks",
      "scenario": "An approved PR is paired with the wrong artifact, or a mandatory release validation fails and someone tries to override it.",
      "risk": "An unverified or substituted artifact reaches production despite a valid earlier approval.",
      "concern": "Does the release gate verify the artifact and approved-source linkage itself? Can either approval route bypass it? What happens after investigation changes the source?",
      "guidance": [
        {
          "ref": "SLSA",
          "text": "Provenance supports verifying how and from what an artifact was built."
        },
        {
          "ref": "SSDF",
          "text": "PS.2 provides release-integrity verification; PO.4 defines checks and their evidence."
        }
      ],
      "principle": "Verify the exact artifact at promotion; block and investigate failures.",
      "tests": [
        {
          "title": "Substitute the artifact",
          "action": "In nonproduction, present a different digest or an artifact without the required approved-source linkage.",
          "expect": "Promotion is blocked on either approval route; the deployed artifact cannot be chosen solely from a PR approval label.",
          "evidence": "Release policy, provenance verification and artifact mismatch/block records.",
          "refs": [
            "SLSA",
            "SSDF"
          ]
        },
        {
          "title": "Fail a release check",
          "action": "Force a required validation failure for an auto-approved and a human-approved change. Follow investigation, correction and rerun.",
          "expect": "Release stays blocked. Human investigation cannot waive mandatory failed checks; source corrections require fresh applicable review, approval and build.",
          "evidence": "Gate failure, investigation, corrected revision/build and passing rerun.",
          "refs": [
            "ICFR",
            "SSDF"
          ]
        }
      ],
      "areas": [
        "DEPLOY",
        "HUMAN"
      ],
      "controls": [
        "P01",
        "P02",
        "X01"
      ]
    },
    {
      "title": "Production rollout",
      "subtitle": "Corroborate coverage and exercise response",
      "scenario": "The dashboard accounts for 24 of 24 collected records, but an emergency deployment was never ingested. An unsafe approval requires suspension.",
      "risk": "Incomplete telemetry hides unauthorized releases, while automation continues after a systemic failure.",
      "concern": "What establishes the complete production population? Who investigates false approvals and unnecessary escalations, and who can suspend and restart automation?",
      "guidance": [
        {
          "ref": "EVID",
          "text": "Assess accuracy, completeness and detail before relying on company-produced evidence."
        },
        {
          "ref": "RMF",
          "text": "MANAGE 2.3–2.4 cover response, recovery and assigned authority to disengage AI systems."
        }
      ],
      "principle": "Reconcile independent sources and close the loop from detection to accountable action.",
      "tests": [
        {
          "title": "Reconcile outside the dashboard",
          "action": "Obtain deployment/runtime evidence independent of the monitored feed; reconcile approved revision, artifact and release. Include manual and emergency routes.",
          "expect": "Missing and unmatched deployments are surfaced and investigated. A 24/24 feed reconciliation does not establish complete production coverage.",
          "evidence": "Independent population, extraction/filter logic, source-to-release links and reconciliation exceptions.",
          "refs": [
            "EVID",
            "SLSA"
          ]
        },
        {
          "title": "Exercise an unsafe-approval incident",
          "action": "Inject an authorized test exception. Observe alert ownership, triage, suspension, recovery and restart; inspect period trends and model/policy changes.",
          "expect": "The assigned owner acts on the exception and documents restart authorization. Drift, shared misses and unnecessary escalation receive review.",
          "evidence": "Alert/incident timeline, shutdown test, owner decisions, recovery evidence and versioned evaluations.",
          "refs": [
            "RMF"
          ]
        }
      ],
      "areas": [
        "MON",
        "EVID",
        "CM"
      ],
      "controls": [
        "P02",
        "P03",
        "A04",
        "X01",
        "X02"
      ]
    }
  ],
  "areas": [
    {
      "title": "Bot identity & permissions",
      "id": "BOT",
      "links": [
        "A02",
        "G02"
      ],
      "objective": "Verify the AI approver uses an identifiable, least-privileged identity with permissions limited to its approved role.",
      "risk": "An overprivileged bot or credential custodian can approve ineligible PRs, alter governing rules, or reach production outside the intended authorization boundary.",
      "steps": [
        "Identify each GitHub App, service account or token used for review, approval, merge and deployment; map which action each identity actually performs.",
        "Obtain effective app installation scope, organization and repository permissions, token ownership, credential storage and any linked CI/CD permissions.",
        "Determine who can install, administer, reconfigure or rotate credentials; compare these privileges with contributors and approval-policy administrators.",
        "With authorized nonproduction negative tests, verify prohibited bot actions are denied. Separately challenge untrusted PR text, comments and repository files containing instructions to ignore policy, disclose secrets, or invoke tools; confirm these inputs cannot alter higher-trust approval criteria or trigger unauthorized actions.",
        "Inspect permission, installation and credential changes during the reliance period; investigate unexplained elevation or shared identities."
      ],
      "evidence": "App permission and installation exports; access-role mapping; token inventory without secrets; admin and permission-change logs; negative-test artifacts.",
      "expect": "No unapproved administrative, merge or deployment authority; complete ownership and change history; demonstrated denial of prohibited actions.",
      "blind": "Does the same credential also run CI/CD? Can an installation administrator silently expand repository scope? Are short-lived tokens and external deployment identities accounted for?",
      "stages": [
        2,
        3
      ],
      "summary": "Identity and permitted actions",
      "action": "Attempt a prohibited bot action and submit PR text or code comments instructing the reviewer to ignore policy, in an authorized test environment.",
      "response": "The action is denied and logged; PR instructions cannot change policy or invoke unauthorized tools."
    },
    {
      "title": "RBAC & administrative independence",
      "id": "RBAC",
      "links": [
        "G02",
        "G01"
      ],
      "objective": "Establish that contributors cannot unilaterally change the rules that authorize their changes.",
      "risk": "A developer can modify approval policy, bot configuration, reviewer groups or enforcement and then self-authorize a financially relevant change.",
      "steps": [
        "Identify control owners and administrators for GitHub rulesets, the AI bot, approval policies, CI/CD and production permissions.",
        "Obtain effective role grants, team membership, privileged groups and bypass actor lists; distinguish ability to submit code from authority to alter enforcement.",
        "Trace representative administrative grants and policy changes to independent authorization and audit logs.",
        "Test or inspect controlled evidence that a contributor cannot modify required reviewers, bypass lists or approval thresholds without independent authorization.",
        "Examine privileged changes and emergency access across the period, including service accounts and delegated administrators."
      ],
      "evidence": "IAM/RBAC reports; team and ruleset administrator listings; bypass actor configurations; role-change logs; emergency records.",
      "expect": "Policy modification and production bypass authority are separately governed, traceable and appropriately restricted.",
      "blind": "Does access inherited through organization ownership override repository controls? Who can change CODEOWNERS or required-check definitions?",
      "stages": [
        1,
        3,
        4
      ],
      "summary": "Who can change the rules",
      "action": "Have a contributor attempt to weaken a protected approval rule.",
      "response": "Independent authorization is required; inherited and emergency privileges are included."
    },
    {
      "title": "AI approver change management",
      "id": "CM",
      "links": [
        "A03",
        "G01",
        "X01"
      ],
      "objective": "Ensure changes to prompts, models, tools, thresholds and deterministic rules are authorized, evaluated and traceable.",
      "risk": "An unreviewed configuration or vendor-model update expands auto-approval eligibility without an approved change to the control.",
      "steps": [
        "Inventory the components that influence decisions: prompt/skill files, model identifier, thresholds, exclusion lists, policy code, integrations and deployment configuration.",
        "Identify ownership, change routes and access rights for each component, including vendor-managed model version changes.",
        "Select relevant configuration changes from independently established change histories; inspect request, impact analysis, tests, approval and deployment evidence.",
        "Test the enforcement that prevents unauthorized edits and verify whether policy or model changes trigger reevaluation or temporary suspension when required.",
        "Trace a sample of bot decisions to the exact policy and model/config versions used at decision time."
      ],
      "evidence": "Version manifests; protected configuration repositories; approval/CI history; model inventory; evaluation results; change and deployment logs.",
      "expect": "Material behavioral changes are governed, tested, approved and attributable to a version.",
      "blind": "Could vendor-side updates change behavior without a repository commit? Are emergency rollback and revalidation thresholds defined?",
      "stages": [
        1,
        2,
        3
      ],
      "summary": "Governed changes to AI and policy",
      "action": "Change a prompt, threshold or model version through the normal change route.",
      "response": "Evaluation and approval precede use; decisions retain the applicable version."
    },
    {
      "title": "PR eligibility & approval enforcement",
      "id": "PR",
      "links": [
        "D01",
        "D02",
        "G01",
        "A01"
      ],
      "objective": "Verify only eligible revisions receive the intended automated authorization and that ineligible changes require the prescribed review.",
      "risk": "A low-risk label or stale AI approval permits a financially relevant or modified change to merge without required authorization.",
      "steps": [
        "Obtain the eligibility policy and the critical-file/dependency inventory, including its source systems, owners, direct/indirect consumers, coverage boundaries, validation process, refresh triggers and approval authority design.",
        "Inspect required-check, branch/ruleset, bot review and bypass configuration; determine whether the bot merely recommends, approves or merges.",
        "Validate sampled critical-file and dependency mappings against independently obtained ownership, build/import or service relationship evidence; challenge shared libraries outside scoped repositories and stale or unmapped consumers. Reperform eligible, excluded and unknown-impact cases, along with failed checks, missing approval and post-approval commits.",
        "Trace the approved SHA and actual merge SHA for selected cases, including bot and human escalation decisions.",
        "Evaluate the production-change population and exception history for paths outside the PR workflow."
      ],
      "evidence": "Ruleset exports; critical-file/dependency inventory and provenance; owner validation and refresh history; repo eligibility; PR events and SHA history; independently corroborated dependency examples; negative-test logs.",
      "expect": "Ineligible or modified changes cannot satisfy automatic authorization; escalation and invalidation work as designed.",
      "blind": "Are protected financial dependencies reachable through shared libraries outside SOX-labeled repositories? Do bypass actors still merge without recorded exceptions?",
      "stages": [
        1,
        3,
        4
      ],
      "summary": "Eligibility and exact-revision approval",
      "action": "Submit an allowed change, a protected dependency, an unmapped dependency and a new commit after approval. Separately attempt authorization without the required checks or two valid LOW results.",
      "response": "Only eligible, fully checked revisions receive automatic authorization. Protected or unknown impact routes to a human before AI; stale decisions are invalidated. Mandatory failed checks remain blocking on both approval paths."
    },
    {
      "title": "Model performance & drift",
      "id": "MODEL",
      "links": [
        "A01",
        "A03",
        "A04"
      ],
      "objective": "Determine whether classification performance is evaluated and governed sufficiently for the risks it informs.",
      "risk": "False-low-risk classification, changing model behavior or missing context routes sensitive changes to an unsafe approval path.",
      "steps": [
        "Confirm exactly what model output controls: advisory finding, risk tier, approval eligibility or authorization; do not assume classification itself grants approval.",
        "Inspect documented evaluation criteria, labeled challenge cases, exclusions, escalation thresholds and the responsible decision owner.",
        "Review results for high-impact and false-low-risk cases, including indirect dependencies, adversarial inputs, disagreements and missing context; test a selected set independently.",
        "Compare pre- and post-change evaluation results across model/prompt versions, and inspect ongoing trend review and action thresholds.",
        "Reperform fail-safe scenarios for invalid output, model unavailability and uncertainty; ensure deterministic exclusions override favorable model verdicts."
      ],
      "evidence": "Versioned evaluation corpus and adjudication rationale; performance reports; drift/change alerts; exception decisions; fail-safe tests.",
      "expect": "Material model uncertainty escalates or fails closed, and classification performance is evaluated against defined risk tolerances.",
      "blind": "Is the evaluation set representative of financially relevant code? Could the same underlying model create correlated errors across independent-looking agents?",
      "stages": [
        2,
        3
      ],
      "summary": "Reviewer coverage and shared misses",
      "action": "Compare reviewer A, reviewer B and their combined decision against adjudicated good and bad cases.",
      "response": "Report shared misses and severity by change class; expand only against predefined acceptance criteria."
    },
    {
      "id": "HUMAN",
      "title": "Human fallback & accountability",
      "links": [
        "G01",
        "G02",
        "D01",
        "D03"
      ],
      "stages": [
        1,
        2,
        4,
        5
      ],
      "summary": "Reasoned decisions after escalation",
      "objective": "Verify that fallback produces a qualified, accountable assessment of the exact revision and that mandatory protections still apply.",
      "risk": "A reviewer rubber-stamps AI verdicts, approves unresolved dependency impact or treats approval as permission to bypass a failed check.",
      "action": "Escalate an unmapped dependency and conflicting AI findings. Give the reviewer the change, dependency context, test results and both findings. Include a case that should be rejected and a release with a failed mandatory check.",
      "response": "The reviewer resolves or rejects uncertain impact, records their own rationale and authorizes only the assessed revision. The approved human route joins Merge + build. Failed required checks block merge or release until corrected and rerun.",
      "evidence": "Reviewer identity and authority; information supplied; independent rationale; resolved dependency analysis; rejection and approval records tied to revision; required-check and release-block logs.",
      "steps": [
        "Establish reviewer qualifications, authorization and independence requirements, including who owns an automated authorization decision and who administers its policy.",
        "Observe or reperform both dependency and AI-disagreement escalations. Verify that reviewers can inspect source changes and supporting evidence rather than relying on the two verdict labels.",
        "Use adjudicated cases requiring rejection, more information and approval. Compare the recorded reasoning with the risks in each case; investigate unsupported approvals.",
        "Trace a human-approved revision into protected merge and trusted build. Push another commit and verify that the prior approval no longer satisfies policy.",
        "Attempt release after a mandatory check fails. Verify blocking, investigation and correction, with fresh review and build when source changes. Review period escalations for timeliness and evidence of actual assessment."
      ],
      "expect": "Escalation results in an accountable, supported decision. It does not itself establish meaningful review or waive required controls.",
      "blind": "Does the reviewer have enough context and time to challenge favorable AI findings? Does the record identify a responsible policy owner for automated authorization instead of naming the model as the accountable approver?"
    },
    {
      "title": "CI/CD & deployment integrity",
      "id": "DEPLOY",
      "links": [
        "P01",
        "P02",
        "D03"
      ],
      "objective": "Demonstrate that only the correctly authorized source and artifact can reach the relevant production environment.",
      "risk": "A different commit or artifact ships, or an alternative deploy route bypasses approved PR and CI/CD controls.",
      "steps": [
        "Map source→build→artifact→promotion→production boundaries and identify deploy principals and alternative routes.",
        "Inspect required test gates, artifact provenance and promotion settings; distinguish deployment permissions from PR approval rights. For financially relevant change types, assess how owners identify necessary functional and negative tests, and whether critical calculations, interfaces and exception paths are covered rather than relying solely on green CI status.",
        "Reperform a positive source-to-production trace using approved revision, build identity, artifact digest and deployed version.",
        "Test or review authorized negative cases involving unapproved artifact, failed build, modified revision and direct/emergency production route.",
        "Develop an independent production population from appropriate release and runtime/cloud evidence; reconcile to approved PRs and investigate gaps."
      ],
      "evidence": "CI/CD settings; build/provenance attestations; artifact digests; production deploy and runtime events; privilege and bypass logs.",
      "expect": "Production provenance reconciles to the authorized source revision and alternative paths are controlled and visible.",
      "blind": "Can infrastructure/configuration changes alter financial logic without a conventional code deploy? Are privileged manual deploys included?",
      "stages": [
        4,
        5,
        6
      ],
      "summary": "Approved source to deployed artifact",
      "action": "Attempt to release an unapproved artifact or use an alternative production route.",
      "response": "The route is blocked or governed as an explicit exception; deployed artifacts link to authorized source."
    },
    {
      "title": "Monitoring & exception response",
      "id": "MON",
      "links": [
        "A04",
        "P03",
        "X02"
      ],
      "objective": "Validate that failures, unauthorized routes and questionable automated approvals are detected, investigated and acted upon.",
      "risk": "Unsafe approvals or deployment-policy deviations remain unnoticed because monitoring is incomplete, disabled or treated as self-validating.",
      "steps": [
        "Obtain monitoring requirements and architecture covering decisions, policy overrides, deployments, model changes and critical events.",
        "Inspect alert logic, thresholds, source integrations, exception owners, escalation criteria and shutdown/rollback authority.",
        "Test approved synthetic exceptions or historical known cases: failed classification, stale approval, unapproved deploy and missing event.",
        "Inspect period alerts for timely investigation and retained evidence. Separately select periodic control-owner reviews and verify that management challenged bypasses, false-low-risk cases, approval-rate shifts, coverage gaps and model/policy changes against defined thresholds, with documented action or rationale.",
        "Corroborate monitoring completeness against independent production and policy-change sources; test changes to alert configuration."
      ],
      "evidence": "Alert definitions; integration and ingestion settings; exception register; incidents and remediation records; test/alert logs.",
      "expect": "Defined failures are detected, owned and escalated; monitoring coverage and changes are themselves governed.",
      "blind": "Does ‘zero exceptions’ reflect good controls or missing telemetry? Who can suppress alerts or disable the kill switch?",
      "stages": [
        6
      ],
      "summary": "Detection, response and recovery",
      "action": "Inject a known approval exception and exercise the shutdown route.",
      "response": "An owner investigates and escalates; suspension, recovery and restart authorization are demonstrated."
    },
    {
      "title": "Evidence reliability & audit reliance",
      "id": "EVID",
      "links": [
        "X01",
        "X02",
        "P02"
      ],
      "objective": "Establish that retained approval, classification and deployment evidence is complete, accurate and usable for the reliance period.",
      "risk": "Audit concludes changes were authorized from an incomplete dashboard or records that cannot be tied to what was deployed.",
      "steps": [
        "Define the population and assertion being tested, including production paths and financially relevant scope.",
        "Independently assess source-system record completeness, filters, joins, retention, timestamp conventions and event identity.",
        "Reconstruct a selected decision using the exact PR revision, scope and dependency result, applicable policy and model/prompt/tool versions, evaluating and authorizing identities, decision timestamp and outcome, required checks, artifact identity and production release. Identify any missing or mutable links.",
        "Evaluate evidence manipulation rights, logging failure behavior, backfills, duplicates and reconciliation exceptions.",
        "Determine separately whether point-in-time configuration, period operation and transaction evidence are sufficient for the proposed audit reliance."
      ],
      "evidence": "Data lineage; extraction and reconciliation logic; source logs; immutable/versioned records; exceptions; configuration change history.",
      "expect": "Evidence can be independently reperformed and supports the specific conclusion without unsupported completeness assumptions.",
      "blind": "Is the dashboard comparing the monitored feed with itself? Can approvals or deployments outside the collection system be missing?",
      "stages": [
        0,
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "summary": "Complete and reproducible records",
      "action": "Reconstruct one decision and reconcile deployments against an independent source.",
      "response": "Decision links are reproducible; unmatched records are investigated and coverage boundaries remain explicit."
    }
  ],
  "legacy": {
    "PR": 1,
    "BOT": 2,
    "RBAC": 3,
    "CM": 2,
    "MODEL": 2,
    "DEPLOY": 4,
    "MON": 6,
    "EVID": 6,
    "HUMAN": 1
  }
};
  if(typeof module!=="undefined" && module.exports) module.exports=data;
  else root.AssuranceData=data;
})(typeof globalThis!=="undefined"?globalThis:this);
